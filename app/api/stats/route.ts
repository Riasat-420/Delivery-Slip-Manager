import { NextResponse } from 'next/server';
import { getDb, dbGet } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const users = dbGet(db, 'SELECT COUNT(*) as cnt FROM users');
  const slips = dbGet(db, 'SELECT COUNT(*) as cnt FROM delivery_slips');
  const invoices = dbGet(db, 'SELECT COUNT(*) as cnt FROM tax_invoices');
  return NextResponse.json({
    totalUsers: users?.cnt || 0,
    totalSlips: slips?.cnt || 0,
    totalInvoices: invoices?.cnt || 0,
  });
}
