'use client';
import { useEffect, useRef, useState } from 'react';

interface Props { invoice: any; onClose: () => void; }

export default function ViewInvoiceModal({ invoice: initialInv, onClose }: Props) {
  const [inv, setInv] = useState(initialInv);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/invoices/${initialInv.id}`).then(r => r.json()).then(setInv);
  }, [initialInv.id]);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    if (!win || !content) return;
    win.document.write(`<html><head><title>Tax Invoice ${inv.invoice_no}</title>
      <style>* {box-sizing:border-box;margin:0;padding:0;} body{font-family:Arial,sans-serif;} table{border-collapse:collapse;}</style>
      </head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  }

  async function handleDownloadPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${inv.invoice_no}.pdf`);
  }

  const items = inv.items || [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: 20, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 860, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', marginBottom: 20 }}>
        <div style={{ padding: '12px 20px', display: 'flex', gap: 10, borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={handlePrint} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🖨 Print</button>
          <button onClick={handleDownloadPDF} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ Download PDF</button>
          <button onClick={onClose} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>✕ Close</button>
        </div>

        <div style={{ padding: 20, background: '#f8f9fa' }}>
          <div ref={printRef} style={{ background: 'white', padding: '20px 24px', border: '1px solid #ccc', maxWidth: 780, margin: '0 auto', fontFamily: 'Arial, sans-serif', fontSize: 11 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: '#666', direction: 'rtl', marginBottom: 2 }}>اولد سيتي لغسل الرمال وتهيئتها ش.ذ.م.م</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>OLD CITY SAND WASHING L.L.C</div>
                <div style={{ fontSize: 9, color: '#374151', marginTop: 2 }}>P.O Box 73100, Dubai - U.A.E | Tel: 04 283 2732 | sales@oldcity.ae</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', border: '2px solid #1a1a2e', padding: '4px 12px' }}>TAX INVOICE</div>
                <div style={{ fontSize: 11, marginTop: 4 }}><strong>Invoice No:</strong> {inv.invoice_no}</div>
                <div style={{ fontSize: 11 }}><strong>Date:</strong> {inv.date}</div>
                <div style={{ fontSize: 11 }}><strong>Time:</strong> {inv.time}</div>
              </div>
            </div>

            <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 6, padding: '10px 12px', marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 11 }}>
                <div><strong>Customer:</strong><br/>{inv.customer_name}</div>
                <div><strong>VAT Reg (TRN):</strong><br/>{inv.vat_reg || '-'}</div>
                <div><strong>Received By:</strong><br/>{inv.received_by || '-'}</div>
                <div><strong>P.O. No:</strong><br/>{inv.po_no || '-'}</div>
                <div><strong>Del. No:</strong><br/>{inv.del_no || '-'}</div>
              </div>
            </div>

            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#1a1a2e', color: 'white' }}>
                  {['#', 'Description', 'Unit', 'Qty', 'Rate', 'Amount', 'Tax %', 'VAT Amount', 'Gross Amount'].map(h => (
                    <th key={h} style={{ padding: '7px 8px', textAlign: h === '#' ? 'center' : 'left', fontWeight: 600, border: '1px solid #374151' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', fontWeight: 600 }}>{item.description}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px' }}>{item.unit}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'right' }}>{Number(item.qty).toFixed(2)}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'right' }}>{Number(item.amount).toFixed(2)}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'center' }}>{Number(item.tax_pct).toFixed(0)}%</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'right' }}>{Number(item.vat_amount).toFixed(2)}</td>
                    <td style={{ border: '1px solid #e5e7eb', padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{Number(item.gross_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: 10 }}>
                  <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>Amount in Words:</div>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{inv.amount_words}</div>
                </div>
              </div>
              <div>
                <table style={{ width: '100%', fontSize: 11 }}>
                  <tbody>
                    <tr><td style={{ padding: '4px 8px', color: '#6b7280' }}>Subtotal:</td><td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600 }}>AED {Number(inv.subtotal).toFixed(2)}</td></tr>
                    <tr><td style={{ padding: '4px 8px', color: '#6b7280' }}>Discount:</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>AED {Number(inv.discount).toFixed(2)}</td></tr>
                    <tr><td style={{ padding: '4px 8px', color: '#6b7280' }}>VAT Total:</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>AED {Number(inv.vat_total).toFixed(2)}</td></tr>
                    <tr style={{ borderTop: '2px solid #1a1a2e' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontSize: 12 }}>Grand Total:</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 13, color: '#0d9488' }}>AED {Number(inv.grand_total).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 11 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 20 }}>Authorized Signature:</div>
                <div style={{ borderTop: '1px solid #999', paddingTop: 4, color: '#6b7280' }}>Old City Sand Washing L.L.C</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 20 }}>Customer Signature:</div>
                <div style={{ borderTop: '1px solid #999', paddingTop: 4, color: '#6b7280' }}>{inv.customer_name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
