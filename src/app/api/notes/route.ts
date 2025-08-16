import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer'; // note the relative path

type Note = { id: string; content: string; created_at: string };

export async function GET() {
  const { data, error } = await supabaseServer
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as Note[]);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const content = (body?.content ?? '').toString().trim();
  if (!content) {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('notes')
    .insert({ content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data as Note, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 400 });

  const { error } = await supabaseServer.from('notes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
