import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbGet, dbAll, dbRun, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const inv = dbGet(db, 'SELECT * FROM tax_invoices WHERE id = ?', [id]);
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  inv.items = dbAll(db, 'SELECT * FROM tax_invoice_items WHERE invoice_id = ?', [id]);
  return NextResponse.json(inv);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const body = await req.json();
  const { date, time, customerName, vatReg, poNo, delNo, receivedBy, discount, subtotal, vatTotal, grandTotal, amountWords, items } = body;

  dbRun(db, `UPDATE tax_invoices SET date=?, time=?, customer_name=?, vat_reg=?, po_no=?, del_no=?, received_by=?, discount=?, subtotal=?, vat_total=?, grand_total=?, amount_words=? WHERE id=?`,
    [date, time, customerName, vatReg || '', poNo || '', delNo || '', receivedBy || '', discount || 0, subtotal || 0, vatTotal || 0, grandTotal || 0, amountWords || '', id]);

  dbRun(db, 'DELETE FROM tax_invoice_items WHERE invoice_id = ?', [id]);
  if (items && Array.isArray(items)) {
    for (const item of items) {
      dbRun(db, 'INSERT INTO tax_invoice_items (invoice_id, description, unit, qty, rate, amount, tax_pct, vat_amount, gross_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, item.description, item.unit || 'M3', item.qty || 1, item.rate || 0, item.amount || 0, item.taxPct || 5, item.vatAmount || 0, item.grossAmount || 0]);
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
  dbRun(db, 'DELETE FROM tax_invoice_items WHERE invoice_id = ?', [id]);
  dbRun(db, 'DELETE FROM tax_invoices WHERE id = ?', [id]);
  saveDb(db);
  return NextResponse.json({ success: true });
}
