import React, { useState } from 'react';
import { Table, Pill, Button, SearchBar, Confirm, toast } from '../components/UI.jsx';
import { MOCK_FARMERS } from '../constants/data.js';

const STAGE_COLOR = { Planting:'blue','Land Prep':'yellow',Vegetative:'green','—':'grey' };

export default function FarmersPage() {
  const [farmers, setFarmers]   = useState(MOCK_FARMERS);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm]   = useState(null);

  const filtered = farmers.filter(f =>
    !search || f.fullName.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    f.district.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f));
    toast.success('Account status updated');
    setConfirm(null);
    setSelected(null);
  };

  const cols = [
    { label:'Farmer',   render: r => <div><strong style={{ cursor:'pointer', color:'#166534' }} onClick={() => setSelected(r)}>{r.fullName}</strong><div style={{ fontSize:11, color:'#888' }}>{r.email}</div></div> },
    { label:'Phone',    key:'phone' },
    { label:'District', render: r => <div>{r.district}<div style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#aaa' }}>{r.ward}</div></div> },
    { label:'Crop',     key:'crop' },
    { label:'Soil',     render: r => <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#666' }}>{r.soil}</span> },
    { label:'Stage',    render: r => <Pill color={STAGE_COLOR[r.stage]||'grey'}>{r.stage}</Pill> },
    { label:'Status',   render: r => <Pill color={r.status==='Active'?'green':'red'}>{r.status}</Pill> },
    { label:'',         render: r => (
      <div style={{ display:'flex', gap:6 }}>
        <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>View</Button>
        <Button size="sm" variant={r.status==='Active'?'danger':'primary'} onClick={() => setConfirm(r)}>
          {r.status==='Active'?'Suspend':'Activate'}
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Farmers ({farmers.length})</h1>
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, district…" />
      </div>

      {/* Farmer detail panel */}
      {selected && (
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #e2ebe2' }}>
            <div style={{ width:46, height:46, background:'#dcfce7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, fontFamily:'Syne,sans-serif', color:'#166534' }}>
              {selected.fullName.split(' ').map(w=>w[0]).join('').substring(0,2)}
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'#1a2e1a' }}>{selected.fullName}</div>
              <div style={{ fontSize:12, fontFamily:'JetBrains Mono,monospace', color:'#888' }}>{selected.email} · {selected.phone}</div>
            </div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
              <Pill color={selected.status==='Active'?'green':'red'}>{selected.status}</Pill>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#aaa' }}>✕</button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14 }}>
            {[['District',selected.district],['Ward',selected.ward],['Farm Size',selected.farmSize||'2 ha'],['Soil Type',selected.soil],['Primary Crop',selected.crop],['Current Stage',selected.stage]].map(([l,v]) => (
              <div key={l} style={{ background:'#f8fbf8', borderRadius:8, padding:'9px 12px' }}>
                <div style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', color:'#888', textTransform:'uppercase', letterSpacing:.5, marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1a2e1a' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Advisory engine output for this farmer */}
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:14 }}>
            <div style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#16a34a', letterSpacing:.7, textTransform:'uppercase', marginBottom:6 }}>Advisory Engine — Current Recommendation</div>
            <div style={{ fontSize:14, fontWeight:700, color:'#166534', marginBottom:4 }}>🌱 Prepare field for planting</div>
            <div style={{ fontSize:12, color:'#4a7a4a', lineHeight:1.5 }}>
              Maize · Sandy Loam · {selected.district} · Nov 2024 — seasonal conditions and Open-Meteo rainfall forecast indicate planting window is opening.
            </div>
          </div>
        </div>
      )}

      <Table columns={cols} rows={filtered} empty="No farmers found" />

      {confirm && (
        <Confirm
          message={`${confirm.status==='Active'?'Suspend':'Activate'} ${confirm.fullName}'s account?`}
          danger={confirm.status==='Active'}
          onConfirm={() => toggleStatus(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
