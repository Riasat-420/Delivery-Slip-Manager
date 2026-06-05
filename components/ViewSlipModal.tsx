'use client';
import { useEffect, useRef, useState } from 'react';

interface Props { slip: any; onClose: () => void; }

export default function ViewSlipModal({ slip: initialSlip, onClose }: Props) {
  const [slip, setSlip] = useState(initialSlip);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/slips/${initialSlip.id}`).then(r => r.json()).then(setSlip);
  }, [initialSlip.id]);

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    const win = window.open('', '_blank');
    if (!win || !content) return;
    win.document.write(`
      <html><head><title>Delivery Note - ${slip.serial_no}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: white; }
        .slip-container { width: 210mm; padding: 10mm; }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  }

  async function handleDownloadPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`delivery-note-${slip.serial_no}.pdf`);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 820, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <button onClick={handlePrint} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>🖨 Print</button>
          <button onClick={handleDownloadPDF} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>⬇ Download PDF</button>
          <button onClick={onClose} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}>✕ Close</button>
        </div>

        {/* Slip Preview */}
        <div style={{ padding: 20, background: '#f8f9fa' }}>
          <div ref={printRef} style={{ background: 'white', padding: '16px 20px', border: '2px solid #374151', maxWidth: 750, margin: '0 auto', fontFamily: 'Arial, sans-serif', fontSize: 12 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: '#666', direction: 'rtl' }}>اولد سيتي لغسل الرمال وتهيئتها ش.ذ.م.م</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f97316', letterSpacing: 1 }}>OLD CITY SAND WASHING L.L.C</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 10, color: '#374151', lineHeight: 1.6 }}>
                <div>P.O Box : 73100</div>
                <div>Dubai – U.A.E</div>
                <div>Tel.: 04 283 2732</div>
                <div>sales@oldcity.ae</div>
                <div>www.oldcity.ae</div>
              </div>
            </div>

            {/* Title */}
            <div style={{ background: '#1a1a2e', color: 'white', textAlign: 'center', padding: '5px', marginBottom: 10, fontSize: 13, fontWeight: 700 }}>
              DELIVERY NOTE &nbsp;&nbsp;&nbsp; سند تسليم
            </div>

            {/* Meta info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8, fontSize: 11 }}>
              <div><strong>Serial No</strong> : {slip.serial_no}</div>
              <div><strong>Date</strong> : {slip.date}</div>
              <div><strong>Site No</strong> : {slip.site_no || ''}</div>
              <div><strong>Time</strong> : {slip.time}</div>
              <div><strong>LPO No</strong> : {slip.lpo_no || ''}</div>
              <div><strong>Vehicle No</strong> : {slip.vehicle_no}</div>
            </div>

            <div style={{ marginBottom: 8, fontSize: 11 }}>
              <strong>Company Name: </strong>
              <span style={{ borderBottom: '1px dotted #999', paddingBottom: 2, fontWeight: 700, fontSize: 12 }}>&nbsp;{slip.company_name}&nbsp;</span>
              {''.padEnd(60, '.')}
            </div>

            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ border: '1px solid #ccc', padding: '5px 8px', width: 30 }}>No</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px 8px' }}>Description</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px 8px', width: 50 }}>M3</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px 8px', width: 60 }}>TON</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px 8px', width: 90 }}>TRIPS</th>
                </tr>
              </thead>
              <tbody>
                {(slip.items || []).map((item: any, i: number) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px 8px', fontWeight: 600 }}>{item.description}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{item.m3 || ''}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{item.ton || ''}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{item.trips || ''}</td>
                  </tr>
                ))}
                {/* Empty rows */}
                {Array.from({ length: Math.max(0, 4 - (slip.items?.length || 0)) }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td style={{ border: '1px solid #ccc', padding: '12px 8px' }}>&nbsp;</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px 8px' }}>&nbsp;</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px 8px' }}>&nbsp;</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px 8px' }}>&nbsp;</td>
                    <td style={{ border: '1px solid #ccc', padding: '12px 8px' }}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16, fontSize: 11 }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Rec. Name</strong> {slip.receiver_name || ''}
                  <span style={{ borderBottom: '1px solid #999', display: 'inline-block', width: 140, marginLeft: 4 }}>&nbsp;</span>
                </div>
                <div>
                  <strong>Rec. Signature</strong>
                  <span style={{ borderBottom: '1px solid #999', display: 'inline-block', width: 120, marginLeft: 4 }}>&nbsp;</span>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Driver's Name</strong>
                  <span style={{ borderBottom: '1px solid #999', display: 'inline-block', width: 80, marginLeft: 4 }}>&nbsp;</span>
                  {slip.driver_name || ''}
                </div>
                <div>
                  <strong>Driver's Signature</strong>
                  <span style={{ borderBottom: '1px solid #999', display: 'inline-block', width: 120, marginLeft: 4 }}>&nbsp;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
