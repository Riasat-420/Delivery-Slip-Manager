'use client';
import { useState, useEffect } from 'react';

interface Props {
  slip?: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface Item { description: string; customDesc: boolean; m3: string; ton: string; trips: string; }

export default function CreateSlipModal({ slip, onClose, onSuccess }: Props) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const [form, setForm] = useState({
    date: slip?.date || today,
    time: slip?.time || nowTime,
    siteNo: slip?.site_no || '',
    lpoNo: slip?.lpo_no || '',
    vehicleNo: slip?.vehicle_no || '',
    location: slip?.location || 'OLD CITY 1',
    tip: slip?.tip || '',
    cashTrip: slip?.cash_trip || '',
    refund: slip?.refund || '',
    companyName: slip?.company_name || '',
    useCustomCompany: false,
    receiverName: slip?.receiver_name || '',
    driverName: slip?.driver_name || '',
  });

  const [items, setItems] = useState<Item[]>(
    slip?.items?.length > 0
      ? slip.items.map((it: any) => ({ description: it.description, customDesc: false, m3: String(it.m3 || ''), ton: String(it.ton || ''), trips: it.trips || '' }))
      : [{ description: '', customDesc: false, m3: '', ton: '', trips: '' }]
  );

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(setCompanies);
    fetch('/api/materials').then(r => r.json()).then(setMaterials);
  }, []);

  function addItem() {
    setItems(prev => [...prev, { description: '', customDesc: false, m3: '', ton: '', trips: '' }]);
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      items: items.map(it => ({ description: it.description, m3: parseFloat(it.m3) || 0, ton: parseFloat(it.ton) || null, trips: it.trips })),
    };
    const url = slip ? `/api/slips/${slip.id}` : '/api/slips';
    const method = slip ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) onSuccess();
    else { alert('Error saving slip'); setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{slip ? 'Edit' : 'Create'} Delivery Note</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Site No</label>
              <input type="text" value={form.siteNo} placeholder="e.g., JLT-B01" onChange={e => setForm(f => ({ ...f, siteNo: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>LPO No</label>
              <input type="text" value={form.lpoNo} placeholder="e.g., LPO-12345" onChange={e => setForm(f => ({ ...f, lpoNo: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Vehicle No</label>
              <input type="text" value={form.vehicleNo} placeholder="e.g., D 54321" required onChange={e => setForm(f => ({ ...f, vehicleNo: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tip</label>
              <input type="text" value={form.tip} placeholder="Enter tip" onChange={e => setForm(f => ({ ...f, tip: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cash Trip</label>
              <input type="text" value={form.cashTrip} placeholder="Enter cash trip" onChange={e => setForm(f => ({ ...f, cashTrip: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Refund</label>
              <input type="text" value={form.refund} placeholder="Enter Credits" onChange={e => setForm(f => ({ ...f, refund: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Location</label>
            <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} style={inputStyle}>
              <option value="OLD CITY 1">OLD CITY 1</option>
              <option value="OLD CITY 2">OLD CITY 2</option>
            </select>
          </div>

          {/* Company */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Company Name</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <input type="checkbox" id="customCompany" checked={form.useCustomCompany} onChange={e => setForm(f => ({ ...f, useCustomCompany: e.target.checked }))} />
              <label htmlFor="customCompany" style={{ fontSize: 12, color: '#6b7280' }}>Use custom company name</label>
            </div>
            {form.useCustomCompany ? (
              <input type="text" value={form.companyName} placeholder="Enter company name" required onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} style={inputStyle} />
            ) : (
              <select value={form.companyName} required onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} style={inputStyle}>
                <option value="">Select a company...</option>
                {companies.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Items */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #e5e7eb' }}>Items</h3>
            {items.map((item, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input type="checkbox" checked={item.customDesc} onChange={e => {
                    const copy = [...items]; copy[i] = { ...item, customDesc: e.target.checked, description: '' }; setItems(copy);
                  }} />
                  <label style={{ fontSize: 12, color: '#6b7280' }}>Use custom description</label>
                  {items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ marginLeft: 'auto', background: '#fef2f2', border: 'none', borderRadius: 4, padding: '2px 8px', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>Remove</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    {item.customDesc ? (
                      <input type="text" value={item.description} placeholder="Enter description" required onChange={e => { const copy = [...items]; copy[i] = { ...item, description: e.target.value }; setItems(copy); }} style={inputStyle} />
                    ) : (
                      <select value={item.description} required onChange={e => { const copy = [...items]; copy[i] = { ...item, description: e.target.value }; setItems(copy); }} style={inputStyle}>
                        <option value="">Select a material...</option>
                        {materials.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 3 }}>M3</label>
                    <input type="number" value={item.m3} placeholder="0" onChange={e => { const copy = [...items]; copy[i] = { ...item, m3: e.target.value }; setItems(copy); }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 3 }}>TON</label>
                    <input type="number" value={item.ton} placeholder="0" onChange={e => { const copy = [...items]; copy[i] = { ...item, ton: e.target.value }; setItems(copy); }} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 3 }}>TRIPS</label>
                    <input type="text" value={item.trips} placeholder="e.g., 6WHEEL 1" onChange={e => { const copy = [...items]; copy[i] = { ...item, trips: e.target.value }; setItems(copy); }} style={inputStyle} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem}
              style={{ background: 'none', border: '1px dashed #f97316', borderRadius: 8, padding: '8px 16px', color: '#f97316', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              + Add Item
            </button>
          </div>

          {/* Receiver / Driver */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Receiver's Name</label>
              <input type="text" value={form.receiverName} placeholder="Receiver's full name" onChange={e => setForm(f => ({ ...f, receiverName: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Driver's Name</label>
              <input type="text" value={form.driverName} placeholder="Driver's full name" onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Saving...' : 'Generate Slip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' };
