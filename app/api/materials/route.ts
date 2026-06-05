import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbRun, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const materials = dbAll(db, 'SELECT * FROM materials ORDER BY name ASC');
  return NextResponse.json(materials);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const { name } = await req.json();
  try {
    dbRun(db, 'INSERT INTO materials (name) VALUES (?)', [name.trim()]);
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Material already exists' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const { id, name } = await req.json();
  dbRun(db, 'UPDATE materials SET name = ? WHERE id = ?', [name.trim(), id]);
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const { id } = await req.json();
  dbRun(db, 'DELETE FROM materials WHERE id = ?', [id]);
  saveDb(db);
  return NextResponse.json({ success: true });
}
