import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbGet, dbRun, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const invoiceNo = searchParams.get('invoiceNo');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (date) { where += ' AND date = ?'; params.push(date); }
  if (invoiceNo) { where += ' AND invoice_no LIKE ?'; params.push(`%${invoiceNo}%`); }
  if (fromDate) { where += ' AND date >= ?'; params.push(fromDate); }
  if (toDate) { where += ' AND date <= ?'; params.push(toDate); }

  const total = dbGet(db, `SELECT COUNT(*) as cnt FROM tax_invoices ${where}`, params);
  const invoices = dbAll(db, `SELECT * FROM tax_invoices ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);

  for (const inv of invoices) {
    inv.items = dbAll(db, 'SELECT * FROM tax_invoice_items WHERE invoice_id = ?', [inv.id]);
  }

  return NextResponse.json({ invoices, total: total?.cnt || 0, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const body = await req.json();
  const { date, time, customerName, vatReg, poNo, delNo, receivedBy, discount, subtotal, vatTotal, grandTotal, amountWords, items } = body;

  // Auto-generate invoice number
  const count = dbGet(db, 'SELECT COUNT(*) as cnt FROM tax_invoices');
  const invoiceNo = `INV-${String((count?.cnt || 0) + 1).padStart(4, '0')}`;

  dbRun(db, `INSERT INTO tax_invoices (invoice_no, date, time, customer_name, vat_reg, po_no, del_no, received_by, discount, subtotal, vat_total, grand_total, amount_words)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [invoiceNo, date, time, customerName, vatReg || '', poNo || '', delNo || '', receivedBy || '', discount || 0, subtotal || 0, vatTotal || 0, grandTotal || 0, amountWords || '']);

  const inv = dbGet(db, 'SELECT * FROM tax_invoices WHERE invoice_no = ?', [invoiceNo]);
  const invId = inv?.id;

  if (items && Array.isArray(items)) {
    for (const item of items) {
      dbRun(db, 'INSERT INTO tax_invoice_items (invoice_id, description, unit, qty, rate, amount, tax_pct, vat_amount, gross_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [invId, item.description, item.unit || 'M3', item.qty || 1, item.rate || 0, item.amount || 0, item.taxPct || 5, item.vatAmount || 0, item.grossAmount || 0]);
    }
  }

  saveDb(db);
  return NextResponse.json({ success: true, invoiceNo, id: invId });
}
