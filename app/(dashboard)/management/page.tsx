'use client';
import { useState, useEffect, useCallback } from 'react';

export default function ManagementPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalSlips: 0, totalInvoices: 0 });
  const [companies, setCompanies] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [newCompany, setNewCompany] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [editingCompany, setEditingCompany] = useState<{ id: number; name: string } | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<{ id: number; name: string } | null>(null);

  const refresh = useCallback(async () => {
    const [s, c, m] = await Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/companies').then(r => r.json()),
      fetch('/api/materials').then(r => r.json()),
    ]);
    setStats(s);
    setCompanies(c);
    setMaterials(m);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function addCompany() {
    if (!newCompany.trim()) return;
    await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newCompany }) });
    setNewCompany('');
    refresh();
  }

  async function deleteCompany(id: number) {
    if (!confirm('Delete this company?')) return;
    await fetch('/api/companies', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    refresh();
  }

  async function saveCompany() {
    if (!editingCompany) return;
    await fetch('/api/companies', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCompany) });
    setEditingCompany(null);
    refresh();
  }

  async function addMaterial() {
    if (!newMaterial.trim()) return;
    await fetch('/api/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newMaterial }) });
    setNewMaterial('');
    refresh();
  }

  async function deleteMaterial(id: number) {
    if (!confirm('Delete this material?')) return;
    await fetch('/api/materials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    refresh();
  }

  async function saveMaterial() {
    if (!editingMaterial) return;
    await fetch('/api/materials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingMaterial) });
    setEditingMaterial(null);
    refresh();
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, bg: '#dbeafe', icon: '👥', iconBg: '#3b82f6' },
    { label: 'Total Delivery Slips', value: stats.totalSlips, bg: '#dcfce7', icon: '📄', iconBg: '#22c55e' },
    { label: 'Total Tax Invoice Slips', value: stats.totalInvoices, bg: '#fff7ed', icon: '💵', iconBg: '#f97316' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: '#6b7280', fontSize: 13 }}>Manage</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>Slip Control</h1>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Admin Dashboard</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{card.value.toLocaleString()}</div>
            </div>
            <div style={{ width: 48, height: 48, background: card.iconBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Manage Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Companies */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Manage Companies</h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="text" value={newCompany} placeholder="New company name..." onChange={e => setNewCompany(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCompany()}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              <button onClick={addCompany} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {companies.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6', gap: 8 }}>
                  {editingCompany?.id === c.id ? (
                    <>
                      <input type="text" value={editingCompany?.name ?? ''} onChange={e => setEditingCompany(prev => prev ? ({ ...prev, name: e.target.value }) : prev)}
                        style={{ flex: 1, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                      <button onClick={saveCompany} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditingCompany(null)} style={{ background: '#e5e7eb', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{c.name}</span>
                      <button onClick={() => setEditingCompany({ id: c.id, name: c.name })} style={{ background: '#fefce8', border: 'none', borderRadius: 5, padding: '4px 8px', color: '#d97706', cursor: 'pointer' }}>✏</button>
                      <button onClick={() => deleteCompany(c.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 5, padding: '4px 8px', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Materials */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Manage Materials / Descriptions</h2>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="text" value={newMaterial} placeholder="New description name..." onChange={e => setNewMaterial(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMaterial()}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
              <button onClick={addMaterial} style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {materials.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6', gap: 8 }}>
                  {editingMaterial?.id === m.id ? (
                    <>
                      <input type="text" value={editingMaterial?.name ?? ''} onChange={e => setEditingMaterial(prev => prev ? ({ ...prev, name: e.target.value }) : prev)}
                        style={{ flex: 1, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12 }} />
                      <button onClick={saveMaterial} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>✓</button>
                      <button onClick={() => setEditingMaterial(null)} style={{ background: '#e5e7eb', border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{m.name}</span>
                      <button onClick={() => setEditingMaterial({ id: m.id, name: m.name })} style={{ background: '#fefce8', border: 'none', borderRadius: 5, padding: '4px 8px', color: '#d97706', cursor: 'pointer' }}>✏</button>
                      <button onClick={() => deleteMaterial(m.id)} style={{ background: '#fef2f2', border: 'none', borderRadius: 5, padding: '4px 8px', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
