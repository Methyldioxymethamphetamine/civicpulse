import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We bypass RLS using the service_role key to perform admin approvals
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const { reportId } = await req.json();
    
    if (!reportId) {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('reports')
      .update({ status: 'Resolved' })
      .eq('id', reportId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
