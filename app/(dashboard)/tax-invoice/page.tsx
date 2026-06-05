'use client';
import { useState, useEffect, useCallback } from 'react';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import ViewInvoiceModal from '@/components/ViewInvoiceModal';

export default function TaxInvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ date: '', invoiceNo: '' });
  const [exportDates, setExportDates] = useState({ from: '', to: '' });
  const limit = 20;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.date) params.set('date', filters.date);
    if (filters.invoiceNo) params.set('invoiceNo', filters.invoiceNo);
    const res = await fetch(`/api/invoices?${params}`);
    const data = await res.json();
    setInvoices(data.invoices || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this invoice?')) return;
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    fetchInvoices();
  }

  async function handleExportExcel() {
    const params = new URLSearchParams();
    if (exportDates.from) params.set('fromDate', exportDates.from);
    if (exportDates.to) params.set('toDate', exportDates.to);
    const res = await fetch(`/api/invoices/export?${params}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `tax-invoices.xlsx`; a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>All Tax Invoices</h1>
        <button onClick={() => setShowCreate(true)} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ✚ Create New Invoice
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Tax Invoice Records</h2>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ⚡ {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div style={{ padding: '16px 20px', background: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Invoice Date</label>
                <input type="date" value={filters.date} onChange={e => { setFilters(f => ({ ...f, date: e.target.value })); setPage(1); }}
                  style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Invoice No</label>
                <input type="text" value={filters.invoiceNo} placeholder="e.g. INV-1024" onChange={e => { setFilters(f => ({ ...f, invoiceNo: e.target.value })); setPage(1); }}
                  style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={() => { setFilters({ date: '', invoiceNo: '' }); setPage(1); }}
                  style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, background: 'white', cursor: 'pointer' }}>✕ Clear</button>
              </div>
            </div>

            {/* Excel Export */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#166534' }}>⬇ Download Excel Report</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>From Date</label>
                  <input type="date" value={exportDates.from} onChange={e => setExportDates(d => ({ ...d, from: e.target.value }))}
                    style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 3 }}>To Date</label>
                  <input type="date" value={exportDates.to} onChange={e => setExportDates(d => ({ ...d, to: e.target.value }))}
                    style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={handleExportExcel}
                    style={{ padding: '8px 18px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    ⬇ Download Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['IN. NO', 'DATE', 'CUSTOMER', 'TOTAL (AED)', 'ACTION'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No tax invoices found.</td></tr>
            ) : invoices.map((inv, i) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{inv.invoice_no}</td>
                <td style={{ padding: '13px 16px', fontSize: 13 }}>{inv.date}</td>
                <td style={{ padding: '13px 16px', fontSize: 13 }}>{inv.customer_name}</td>
                <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#0d9488' }}>{Number(inv.grand_total).toFixed(2)}</td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setViewInvoice(inv)} style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#3b82f6', fontSize: 14 }}>👁</button>
                    <button onClick={() => setEditInvoice(inv)} style={{ background: '#fefce8', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#d97706', fontSize: 14 }}>✏</button>
                    <button onClick={() => handleDelete(inv.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#ef4444', fontSize: 14 }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Total: {total} invoices</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: 'pointer', opacity: page === 1 ? 0.5 : 1 }}>‹</button>
            <span style={{ fontSize: 13 }}>Page {page} of {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>›</button>
          </div>
        </div>
      </div>

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchInvoices(); }} />}
      {editInvoice && <CreateInvoiceModal invoice={editInvoice} onClose={() => setEditInvoice(null)} onSuccess={() => { setEditInvoice(null); fetchInvoices(); }} />}
      {viewInvoice && <ViewInvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </div>
  );
}
