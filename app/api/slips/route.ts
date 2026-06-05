import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbGet, dbRun, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const company = searchParams.get('company');
  const vehicle = searchParams.get('vehicle');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (date) { where += ' AND date = ?'; params.push(date); }
  if (company) { where += ' AND LOWER(company_name) LIKE ?'; params.push(`%${company.toLowerCase()}%`); }
  if (vehicle) { where += ' AND vehicle_no LIKE ?'; params.push(`%${vehicle}%`); }

  const total = dbGet(db, `SELECT COUNT(*) as cnt FROM delivery_slips ${where}`, params);
  const slips = dbAll(db, `SELECT * FROM delivery_slips ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);

  for (const slip of slips) {
    slip.items = dbAll(db, 'SELECT * FROM delivery_items WHERE slip_id = ?', [slip.id]);
  }

  return NextResponse.json({ slips, total: total?.cnt || 0, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const body = await req.json();
  const { date, time, siteNo, lpoNo, vehicleNo, companyName, location, tip, cashTrip, refund, receiverName, driverName, items } = body;

  // Get next serial number
  const counter = dbGet(db, 'SELECT * FROM counters WHERE location = ?', [location]);
  const nextCount = (counter?.count || 0) + 1;
  const serialNo = `${nextCount}-(${location})`;

  dbRun(db, `INSERT INTO delivery_slips (serial_no, location, date, time, site_no, lpo_no, vehicle_no, company_name, tip, cash_trip, refund, receiver_name, driver_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [serialNo, location, date, time, siteNo || '', lpoNo || '', vehicleNo, companyName, tip || '', cashTrip || '', refund || '', receiverName || '', driverName || '']);

  const slipRow = dbGet(db, 'SELECT * FROM delivery_slips WHERE serial_no = ?', [serialNo]);
  const slipId = slipRow?.id;

  if (items && Array.isArray(items)) {
    for (const item of items) {
      dbRun(db, 'INSERT INTO delivery_items (slip_id, description, m3, ton, trips) VALUES (?, ?, ?, ?, ?)',
        [slipId, item.description, item.m3 || null, item.ton || null, item.trips || '']);
    }
  }

  dbRun(db, 'UPDATE counters SET count = ? WHERE location = ?', [nextCount, location]);

  saveDb(db);
  return NextResponse.json({ success: true, serialNo, id: slipId });
}
