'use client';
import { useState, useEffect, useCallback } from 'react';
import CreateSlipModal from '@/components/CreateSlipModal';
import ViewSlipModal from '@/components/ViewSlipModal';

export default function DeliverySlipsPage() {
  const [slips, setSlips] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editSlip, setEditSlip] = useState<any>(null);
  const [viewSlip, setViewSlip] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ date: '', company: '', vehicle: '' });
  const limit = 20;

  const fetchSlips = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters.date) params.set('date', filters.date);
    if (filters.company) params.set('company', filters.company);
    if (filters.vehicle) params.set('vehicle', filters.vehicle);
    const res = await fetch(`/api/slips?${params}`);
    const data = await res.json();
    setSlips(data.slips || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchSlips(); }, [fetchSlips]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this slip?')) return;
    await fetch(`/api/slips/${id}`, { method: 'DELETE' });
    fetchSlips();
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>All Delivery Slips</h1>
        <button
          onClick={() => setShowCreate(true)}
          style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>✚</span> Create New Slip
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151' }}>Stock Records</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>⚡</span> {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div style={{ padding: '16px 20px', background: '#fafafa', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Date</label>
              <input type="date" value={filters.date} onChange={e => { setFilters(f => ({ ...f, date: e.target.value })); setPage(1); }}
                style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Company</label>
              <input type="text" value={filters.company} placeholder="Search company..." onChange={e => { setFilters(f => ({ ...f, company: e.target.value })); setPage(1); }}
                style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>Vehicle No</label>
              <input type="text" value={filters.vehicle} placeholder="Search vehicle..." onChange={e => { setFilters(f => ({ ...f, vehicle: e.target.value })); setPage(1); }}
                style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setFilters({ date: '', company: '', vehicle: '' }); setPage(1); }}
                style={{ padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, background: 'white', cursor: 'pointer' }}>
                ✕ Clear
              </button>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['SR. NO', 'DATE', 'COMPANY', 'SITE NO', 'VEHICLE NO', 'ACTION'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading...</td></tr>
              ) : slips.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No delivery slips found.</td></tr>
              ) : slips.map((slip, i) => (
                <tr key={slip.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{slip.serial_no}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151' }}>{slip.date}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151' }}>{slip.company_name}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151' }}>{slip.site_no || '-'}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#374151' }}>{slip.vehicle_no}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setViewSlip(slip)} title="View"
                        style={{ background: '#eff6ff', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#3b82f6', fontSize: 14 }}>👁</button>
                      <button onClick={() => setEditSlip(slip)} title="Edit"
                        style={{ background: '#fefce8', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#d97706', fontSize: 14 }}>✏</button>
                      <button onClick={() => handleDelete(slip.id)} title="Delete"
                        style={{ background: '#fef2f2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#ef4444', fontSize: 14 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Total: {total} records</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>‹</button>
            <span style={{ fontSize: 13, color: '#374151' }}>Page {page} of {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}>›</button>
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateSlipModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchSlips(); }} />
      )}
      {editSlip && (
        <CreateSlipModal slip={editSlip} onClose={() => setEditSlip(null)} onSuccess={() => { setEditSlip(null); fetchSlips(); }} />
      )}
      {viewSlip && (
        <ViewSlipModal slip={viewSlip} onClose={() => setViewSlip(null)} />
      )}
    </div>
  );
}
