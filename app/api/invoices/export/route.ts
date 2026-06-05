import { NextRequest, NextResponse } from 'next/server';
import { getDb, dbAll, dbGet } from '@/lib/db';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (fromDate) { where += ' AND date >= ?'; params.push(fromDate); }
  if (toDate) { where += ' AND date <= ?'; params.push(toDate); }

  const invoices = dbAll(db, `SELECT * FROM tax_invoices ${where} ORDER BY id ASC`, params);

  const rows = invoices.map((inv: any) => ({
    'Invoice No': inv.invoice_no,
    'Date': inv.date,
    'Customer': inv.customer_name,
    'VAT Reg': inv.vat_reg || '',
    'Subtotal (AED)': inv.subtotal,
    'Discount': inv.discount,
    'VAT Total': inv.vat_total,
    'Grand Total (AED)': inv.grand_total,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tax Invoices');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="tax-invoices-${fromDate || 'all'}-to-${toDate || 'all'}.xlsx"`,
    },
  });
}
