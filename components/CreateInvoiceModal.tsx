'use client';
import { useState, useEffect } from 'react';

interface Props { invoice?: any; onClose: () => void; onSuccess: () => void; }
interface Item { description: string; customDesc: boolean; unit: string; qty: string; rate: string; amount: number; taxPct: string; vatAmount: number; grossAmount: number; }

function numWords(n: number): string {
  if (n === 0) return 'Zero Dirhams Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function toWords(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + toWords(num % 100) : '');
    if (num < 100000) return toWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + toWords(num % 1000) : '');
    return toWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + toWords(num % 100000) : '');
  }
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  let result = toWords(intPart) + ' Dirhams';
  if (decPart > 0) result += ' and ' + toWords(decPart) + ' Fils';
  return result + ' Only';
}

export default function CreateInvoiceModal({ invoice, onClose, onSuccess }: Props) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [form, setForm] = useState({
    date: invoice?.date || today,
    time: invoice?.time || nowTime,
    customerName: invoice?.customer_name || '',
    vatReg: invoice?.vat_reg || '',
    poNo: invoice?.po_no || '',
    delNo: invoice?.del_no || '',
    receivedBy: invoice?.received_by || '',
    discount: String(invoice?.discount || '0'),
  });

  const defaultItem: Item = { description: '', customDesc: false, unit: 'M3', qty: '1', rate: '0', amount: 0, taxPct: '5', vatAmount: 0, grossAmount: 0 };

  const [items, setItems] = useState<Item[]>(
    invoice?.items?.length > 0
      ? invoice.items.map((it: any) => ({ description: it.description, customDesc: false, unit: it.unit, qty: String(it.qty), rate: String(it.rate), amount: it.amount, taxPct: String(it.tax_pct), vatAmount: it.vat_amount, grossAmount: it.gross_amount }))
      : [defaultItem]
  );

  useEffect(() => { fetch('/api/materials').then(r => r.json()).then(setMaterials); }, []);

  function calcItem(item: Item): Item {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const taxPct = parseFloat(item.taxPct) || 0;
    const amount = qty * rate;
    const vatAmount = amount * taxPct / 100;
    const grossAmount = amount + vatAmount;
    return { ...item, amount, vatAmount, grossAmount };
  }

  function updateItem(i: number, updates: Partial<Item>) {
    setItems(prev => {
      const copy = [...prev];
      copy[i] = calcItem({ ...copy[i], ...updates });
      return copy;
    });
  }

  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const vatTotal = items.reduce((s, it) => s + it.vatAmount, 0);
  const discount = parseFloat(form.discount) || 0;
  const grandTotal = subtotal + vatTotal - discount;
  const amountWords = numWords(Math.max(0, grandTotal));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      discount,
      subtotal,
      vatTotal,
      grandTotal,
      amountWords,
      items: items.map(it => ({
        description: it.description,
        unit: it.unit,
        qty: parseFloat(it.qty) || 1,
        rate: parseFloat(it.rate) || 0,
        amount: it.amount,
        taxPct: parseFloat(it.taxPct) || 5,
        vatAmount: it.vatAmount,
        grossAmount: it.grossAmount,
      })),
    };
    const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
    const method = invoice ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) onSuccess();
    else { alert('Error saving invoice'); setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 900, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', marginBottom: 20 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{invoice ? 'Edit' : 'Create'} Tax Invoice</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Customer Name</label>
              <input type="text" required value={form.customerName} placeholder="Customer's company name" onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Customer VAT Reg.</label>
              <input type="text" value={form.vatReg} placeholder="Customer's TRN" onChange={e => setForm(f => ({ ...f, vatReg: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Invoice Date</label>
              <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Invoice Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inp} />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={lbl}>P.O. No.</label>
              <input type="text" value={form.poNo} placeholder="e.g., PO-12345" onChange={e => setForm(f => ({ ...f, poNo: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Del. No.</label>
              <input type="text" value={form.delNo} placeholder="Delivery note number" onChange={e => setForm(f => ({ ...f, delNo: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Received By</label>
              <input type="text" value={form.receivedBy} placeholder="Receiver's full name" onChange={e => setForm(f => ({ ...f, receivedBy: e.target.value }))} style={inp} />
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>Line Items</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Description', 'Unit', 'Qty', 'Rate', 'Amount', 'TAX %', 'VAT Amount', 'Gross Amount', ''].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '6px 4px', minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                          <input type="checkbox" checked={item.customDesc} onChange={e => updateItem(i, { customDesc: e.target.checked, description: '' })} />
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>custom</span>
                        </div>
                        {item.customDesc ? (
                          <input type="text" value={item.description} required placeholder="Description" onChange={e => updateItem(i, { description: e.target.value })} style={{ ...inp, minWidth: 140 }} />
                        ) : (
                          <select value={item.description} required onChange={e => updateItem(i, { description: e.target.value })} style={{ ...inp, minWidth: 140 }}>
                            <option value="">Select material...</option>
                            {materials.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '6px 4px' }}><input type="text" value={item.unit} onChange={e => updateItem(i, { unit: e.target.value })} style={{ ...inp, width: 60 }} /></td>
                      <td style={{ padding: '6px 4px' }}><input type="number" value={item.qty} onChange={e => updateItem(i, { qty: e.target.value })} style={{ ...inp, width: 60 }} /></td>
                      <td style={{ padding: '6px 4px' }}><input type="number" value={item.rate} onChange={e => updateItem(i, { rate: e.target.value })} style={{ ...inp, width: 70 }} /></td>
                      <td style={{ padding: '6px 10px', color: '#374151', fontWeight: 500 }}>{item.amount.toFixed(2)}</td>
                      <td style={{ padding: '6px 4px' }}><input type="number" value={item.taxPct} onChange={e => updateItem(i, { taxPct: e.target.value })} style={{ ...inp, width: 50 }} /></td>
                      <td style={{ padding: '6px 10px', color: '#374151' }}>{item.vatAmount.toFixed(2)}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0d9488' }}>{item.grossAmount.toFixed(2)}</td>
                      <td style={{ padding: '6px 4px' }}>
                        {items.length > 1 && (
                          <button type="button" onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ background: '#fef2f2', border: 'none', borderRadius: 4, padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: 11 }}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setItems(prev => [...prev, calcItem(defaultItem)])}
              style={{ background: 'none', border: '1px dashed #f97316', borderRadius: 8, padding: '7px 14px', color: '#f97316', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
              + Add Item
            </button>
          </div>

          {/* Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={lbl}>Amount in Words</label>
              <textarea value={amountWords} readOnly rows={3}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, background: '#f9fafb', resize: 'vertical' }} />
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Discount:</span>
                <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} style={{ ...inp, width: 100, textAlign: 'right' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>VAT Total:</span>
                <span style={{ fontWeight: 600 }}>{vatTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '2px solid #e5e7eb', fontSize: 15, fontWeight: 700 }}>
                <span>Grand Total:</span>
                <span style={{ color: '#0d9488' }}>{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, marginTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Saving...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };
const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none', background: 'white' };
