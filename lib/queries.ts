import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Report, ReportStatus } from '@/lib/types';

const supabase = createClient();

// ─── Fetch all reports ───────────────────────────────────────────────────────
export function useReports(statusFilter?: ReportStatus) {
  return useQuery<Report[]>({
    queryKey: ['reports', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000, // auto-refresh every 30s
  });
}

// ─── Fetch global stats ──────────────────────────────────────────────────────
export function useGlobalStats() {
  return useQuery({
    queryKey: ['global-stats'],
    queryFn: async () => {
      const { count: totalCount, error: totalError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true });
      if (totalError) throw totalError;

      const { count: resolvedCount, error: resolvedError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Resolved');
      if (resolvedError) throw resolvedError;

      return {
        reported: totalCount || 0,
        resolved: resolvedCount || 0,
      };
    },
    refetchInterval: 30_000,
  });
}

// ─── Fetch worker's assigned tasks ───────────────────────────────────────────
export function useWorkerTasks(workerId: string | undefined) {
  return useQuery<Report[]>({
    queryKey: ['worker-tasks', workerId],
    queryFn: async () => {
      // Changed to Shared Queue Model: fetch both unresolved pools for UI filtering
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .in('status', ['Pending', 'In-Progress'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    // We can keep enabled true so it aggressively fetches
    enabled: true,
    refetchInterval: 20_000,
  });
}

// ─── Fetch reports awaiting admin review ─────────────────────────────────────
export function usePendingReview() {
  return useQuery<Report[]>({
    queryKey: ['pending-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('status', 'In-Progress') // Admin only reviews strictly 'Problem Treated' tasks
        .not('fix_image_url', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 20_000,
  });
}

// ─── Submit a new report (anonymous) ─────────────────────────────────────────
export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      description: string;
      category: string;
      lat: number;
      long: number;
      imageFile: File | null;
    }) => {
      let image_url: string | null = null;

      if (payload.imageFile) {
        const ext = payload.imageFile.name?.split('.').pop() || 'jpeg';
        const path = `public/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(path, payload.imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('report-images')
          .getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const { data, error } = await supabase.from('reports').insert({
        description: payload.description,
        category: payload.category,
        lat: payload.lat,
        long: payload.long,
        image_url,
        status: 'Pending',
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// ─── Worker: upload fix photo + mark resolved ─────────────────────────────────
export function useMarkResolved() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { reportId: string; fixImageFile: File }) => {
      const ext = payload.fixImageFile.name.split('.').pop();
      const path = `public/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('fix-images')
        .upload(path, payload.fixImageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('fix-images')
        .getPublicUrl(path);

      const { error } = await supabase
        .from('reports')
        .update({ status: 'In-Progress', fix_image_url: urlData.publicUrl })
        .eq('id', payload.reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['worker-tasks'] });
    },
  });
}

// ─── Worker: Start progress on a task ──────────────────────────────────────────
export function useStartProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'In-Progress' })
        .eq('id', reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['worker-tasks'] });
    },
  });
}

// ─── Admin: approve a resolved report ────────────────────────────────────────
export function useApproveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      // Use service role via API route for admin actions
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      if (!res.ok) throw new Error('Approval failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['pending-review'] });
    },
  });
}

// ─── Admin: reassign a report ─────────────────────────────────────────────────
export function useReassignReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { reportId: string; adminNote: string }) => {
      const res = await fetch('/api/admin/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Reassign failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['pending-review'] });
    },
  });
}
