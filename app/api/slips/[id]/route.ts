import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbGet, dbAll, dbRun, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const slip = dbGet(db, 'SELECT * FROM delivery_slips WHERE id = ?', [id]);
  if (!slip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  slip.items = dbAll(db, 'SELECT * FROM delivery_items WHERE slip_id = ?', [id]);
  return NextResponse.json(slip);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const body = await req.json();
  const { date, time, siteNo, lpoNo, vehicleNo, companyName, tip, cashTrip, refund, receiverName, driverName, items } = body;

  dbRun(db, `UPDATE delivery_slips SET date=?, time=?, site_no=?, lpo_no=?, vehicle_no=?, company_name=?, tip=?, cash_trip=?, refund=?, receiver_name=?, driver_name=? WHERE id=?`,
    [date, time, siteNo || '', lpoNo || '', vehicleNo, companyName, tip || '', cashTrip || '', refund || '', receiverName || '', driverName || '', id]);

  dbRun(db, 'DELETE FROM delivery_items WHERE slip_id = ?', [id]);
  if (items && Array.isArray(items)) {
    for (const item of items) {
      dbRun(db, 'INSERT INTO delivery_items (slip_id, description, m3, ton, trips) VALUES (?, ?, ?, ?, ?)',
        [id, item.description, item.m3 || null, item.ton || null, item.trips || '']);
    }
  }
  saveDb(db);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  dbRun(db, 'DELETE FROM delivery_items WHERE slip_id = ?', [id]);
  dbRun(db, 'DELETE FROM delivery_slips WHERE id = ?', [id]);
  saveDb(db);
  return NextResponse.json({ success: true });
}
