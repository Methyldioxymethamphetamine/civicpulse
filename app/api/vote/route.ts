import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { reportId, direction } = await req.json();

    if (!reportId || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Missing reportId or invalid direction (up | down)' },
        { status: 400 }
      );
    }

    const column = direction === 'up' ? 'upvotes' : 'downvotes';

    // Fetch current value
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from('reports')
      .select(column)
      .eq('id', reportId)
      .single();

    if (fetchErr || !current) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const newVal = ((current as Record<string, number>)[column] ?? 0) + 1;

    const { error: updateErr } = await supabaseAdmin
      .from('reports')
      .update({ [column]: newVal })
      .eq('id', reportId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, [column]: newVal });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
