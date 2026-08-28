import React, { useState } from 'react';
import { Table, Pill, Button, Modal, Field, Input, Textarea, Select, Confirm, SearchBar, toast } from '../components/UI.jsx';
import { CROPS, MOCK_DISEASES, SOIL_DATA } from '../constants/data.js';

// ─── KnowledgePage ────────────────────────────────────────────────────────────
const GROWTH_STAGES = [
  { stage:'Emergence',  code:'VE', duration:'5–7d', emoji:'🌱' },
  { stage:'Vegetative', code:'V1–V12', duration:'4–6wk', emoji:'🌿' },
  { stage:'Tasselling', code:'VT', duration:'8–10wk', emoji:'🌾' },
  { stage:'Grain Fill', code:'R2–R6', duration:'10–14wk', emoji:'🌽' },
  { stage:'Maturity',   code:'R6', duration:'14–16wk', emoji:'🌾' },
];
const EMPTY_KNOW = { crop:'Maize', region:'III', plantingPeriod:'', rainfall:'', suitableSoils:'', plantingGuidance:'', fertiliser:'', weeding:'', pests:'', source:'' };

export function KnowledgePage() {
  const [activeCrop, setActiveCrop] = useState('Maize');
  const [form, setForm]             = useState(EMPTY_KNOW);
  const [saved, setSaved]           = useState(false);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => { setSaved(true); toast.success('Knowledge saved'); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Agricultural Knowledge — {activeCrop}</h1>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="ghost">+ Add Crop</Button>
          <Button onClick={handleSave}>{saved ? '✓ Saved' : 'Save Changes'}</Button>
        </div>
      </div>

      {/* Crop tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {CROPS.map(c => (
          <button key={c.id} onClick={() => setActiveCrop(c.name)}
            style={{ padding:'5px 14px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', borderColor: activeCrop===c.name ? '#166534' : '#e2ebe2', background: activeCrop===c.name ? '#dcfce7' : '#fff', color: activeCrop===c.name ? '#166534' : '#666' }}>
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Form grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #e2ebe2' }}>Crop Basics</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
            <Field label="Crop"><Input value={activeCrop} readOnly /></Field>
            <Field label="Region"><Input value="III" readOnly /></Field>
          </div>
          <Field label="Planting period"><Input value={form.plantingPeriod} onChange={upd('plantingPeriod')} placeholder="Mid-November to Mid-December" /></Field>
          <Field label="Rainfall requirement"><Input value={form.rainfall} onChange={upd('rainfall')} placeholder="500–750 mm/season" /></Field>
          <Field label="Suitable soils"><Input value={form.suitableSoils} onChange={upd('suitableSoils')} placeholder="Sandy loam, Clay loam, Red clay" /></Field>
          <Field label="Planting guidance"><Textarea value={form.plantingGuidance} onChange={upd('plantingGuidance')} placeholder="Step-by-step planting instructions…" /></Field>
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #e2ebe2' }}>Management Guidance</div>
          <Field label="Fertiliser guidance"><Textarea value={form.fertiliser} onChange={upd('fertiliser')} placeholder="Basal and top dressing recommendations…" /></Field>
          <Field label="Weed management"><Textarea value={form.weeding} onChange={upd('weeding')} placeholder="Weeding schedule and methods…" /></Field>
          <Field label="Pest management"><Textarea value={form.pests} onChange={upd('pests')} placeholder="Key pests, monitoring, treatment thresholds…" /></Field>
          <Field label="Source / Reference"><Input value={form.source} onChange={upd('source')} placeholder="FAO / Agritex Zimbabwe Guide 2023" /></Field>
        </div>
      </div>

      {/* Growth stages */}
      <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14 }}>Growth Stages — {activeCrop}</div>
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
          {GROWTH_STAGES.map((gs, i) => (
            <div key={i} style={{ background: i===1?'#f0fdf4':'#f8fbf8', border:`1px solid ${i===1?'#bbf7d0':'#e2ebe2'}`, borderRadius:10, padding:'12px 16px', minWidth:110, textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{gs.emoji}</div>
              <div style={{ fontSize:12, fontWeight:700, color: i===1?'#166534':'#1a2e1a' }}>{gs.stage}</div>
              <div style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#888', marginTop:2 }}>{gs.code} · {gs.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DiseasePage ──────────────────────────────────────────────────────────────
const EMPTY_DIS = { crop:'Maize', name:'', severity:'High', symptoms:'', description:'', management:'', prevention:'', source:'' };

export function DiseasePage() {
  const [diseases, setDiseases] = useState(MOCK_DISEASES);
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_DIS);
  const [modal, setModal]       = useState(false);
  const [confirm, setConfirm]   = useState(null);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd  = () => { setEditing(null); setForm(EMPTY_DIS); setModal(true); };
  const openEdit = d => { setEditing(d); setForm({ crop:d.crop, name:d.name, severity:d.severity, symptoms:d.symptoms, description:d.description||'', management:d.management, prevention:d.prevention||'', source:d.source }); setModal(true); };
  const handleSave = () => {
    if (!form.name) return toast.error('Disease name is required');
    if (editing) {
      setDiseases(prev => prev.map(d => d.id===editing.id ? { ...d, ...form, name:form.name } : d));
      toast.success('Disease updated');
    } else {
      setDiseases(prev => [...prev, { id:`d${Date.now()}`, ...form, name:form.name }]);
      toast.success('Disease added');
    }
    setModal(false);
  };
  const handleDel = () => { setDiseases(prev => prev.filter(d => d.id !== confirm.id)); toast.success('Disease deleted'); setConfirm(null); };

  const filtered = diseases.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.crop.toLowerCase().includes(search.toLowerCase()));
  const cols = [
    { label:'Crop',      render: r => <Pill color={r.crop==='Maize'?'green':r.crop==='Tomato'?'yellow':'blue'}>{r.crop}</Pill> },
    { label:'Disease',   render: r => <strong>{r.name}</strong> },
    { label:'Symptoms',  render: r => <span style={{ fontSize:11, color:'#666' }}>{r.symptoms}</span> },
    { label:'Severity',  render: r => <Pill color={r.severity==='High'?'red':r.severity==='Medium'?'yellow':'green'}>{r.severity}</Pill> },
    { label:'Source',    render: r => <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#888' }}>{r.source}</span> },
    { label:'',          render: r => <div style={{ display:'flex', gap:6 }}><Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button><Button size="sm" variant="danger" onClick={() => setConfirm(r)}>Delete</Button></div> },
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Disease Knowledge ({diseases.length})</h1>
        <div style={{ display:'flex', gap:10 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search disease or crop…" />
          <Button onClick={openAdd}>+ Add Disease</Button>
        </div>
      </div>
      <Table columns={cols} rows={filtered} empty="No diseases found" />

      {modal && (
        <Modal title={editing ? 'Edit Disease' : '🦠 Add Disease'} onClose={() => setModal(false)} width={560}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 12px' }}>
            <Field label="Crop *"><Select value={form.crop} onChange={upd('crop')}>{['Maize','Tomato','Beans'].map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Severity"><Select value={form.severity} onChange={upd('severity')}>{['Low','Medium','High'].map(s => <option key={s}>{s}</option>)}</Select></Field>
            <div />
          </div>
          <Field label="Disease Name *"><Input value={form.name} onChange={upd('name')} placeholder="e.g. Grey Leaf Spot" /></Field>
          <Field label="Symptoms (one per line, add weight [1–3])"><Textarea value={form.symptoms} onChange={upd('symptoms')} rows={4} placeholder={'Yellow leaf streaks [weight: 3]\nStunted growth [weight: 2]'} /></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
            <Field label="Management"><Textarea value={form.management} onChange={upd('management')} rows={3} /></Field>
            <Field label="Prevention"><Textarea value={form.prevention} onChange={upd('prevention')} rows={3} /></Field>
          </div>
          <Field label="Source / Reference"><Input value={form.source} onChange={upd('source')} /></Field>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20, paddingTop:16, borderTop:'1px solid #e2ebe2' }}>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update Disease' : 'Add Disease'}</Button>
          </div>
        </Modal>
      )}
      {confirm && <Confirm message={`Delete "${confirm.name}"?`} onConfirm={handleDel} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── SoilPage ─────────────────────────────────────────────────────────────────
export function SoilPage() {
  const [soils, setSoils]   = useState(SOIL_DATA);
  const [active, setActive] = useState(SOIL_DATA[0]);
  const [form, setForm]     = useState(active);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = () => { setSoils(prev => prev.map(s => s.id===form.id ? form : s)); setActive(form); toast.success('Soil data saved'); };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Soil Knowledge</h1>
        <Button>+ Add Soil Type</Button>
      </div>

      {/* Soil cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {soils.map(s => (
          <div key={s.id} onClick={() => { setActive(s); setForm(s); }}
            style={{ background:'#fff', border:`1px solid ${active.id===s.id?'#86efac':'#e2ebe2'}`, borderRadius:12, padding:16, cursor:'pointer', transition:'all .15s' }}>
            <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:6, color:'#1a2e1a' }}>{s.name}</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
              {s.tags.map(t => <Pill key={t} color="green">{t}</Pill>)}
            </div>
            <div style={{ fontSize:12, color:'#666', lineHeight:1.5 }}>{s.body}</div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, marginBottom:14, paddingBottom:10, borderBottom:'1px solid #e2ebe2' }}>Edit — {form.name}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          <Field label="Soil name"><Input value={form.name} onChange={upd('name')} /></Field>
          <Field label="Drainage"><Input value={form.drainage} onChange={upd('drainage')} /></Field>
          <Field label="Fertility level"><Input value={form.fertility} onChange={upd('fertility')} /></Field>
          <Field label="Suitable crops"><Input value={form.crops} onChange={upd('crops')} /></Field>
        </div>
        <Field label="Management practices"><Textarea value={form.body} onChange={upd('body')} rows={3} /></Field>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:14 }}>
          <Button variant="ghost" onClick={() => setForm(active)}>Cancel</Button>
          <Button onClick={handleSave}>Save Soil Type</Button>
        </div>
      </div>
    </div>
  );
}
