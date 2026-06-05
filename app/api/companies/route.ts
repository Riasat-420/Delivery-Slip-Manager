import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbGet, dbRun, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const companies = dbAll(db, 'SELECT * FROM companies ORDER BY name ASC');
  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const { name } = await req.json();
  try {
    dbRun(db, 'INSERT INTO companies (name) VALUES (?)', [name.trim().toUpperCase()]);
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Company already exists' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const { id, name } = await req.json();
  dbRun(db, 'UPDATE companies SET name = ? WHERE id = ?', [name.trim().toUpperCase(), id]);
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const { id } = await req.json();
  dbRun(db, 'DELETE FROM companies WHERE id = ?', [id]);
  saveDb(db);
  return NextResponse.json({ success: true });
}
