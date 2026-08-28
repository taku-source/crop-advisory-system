import React, { useState } from 'react';
import { Button, Modal, Field, Input, Textarea, Select, Pill, StatCard, BarChart, Confirm, toast } from '../components/UI.jsx';
import { MOCK_RULES, MOCK_NOTIFICATIONS, CROPS } from '../constants/data.js';

// ─── RulesPage ────────────────────────────────────────────────────────────────
const EMPTY_RULE = { crop:'Maize', region:'III', stage:'Planting', type:'Advisory', title:'', condition:'', recommendation:'', reason:'' };
const TYPE_COLOR = { Advisory:'blue', Alert:'red', Reminder:'yellow' };

export function RulesPage() {
  const [rules, setRules]   = useState(MOCK_RULES);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(EMPTY_RULE);
  const [confirm, setConfirm] = useState(null);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd  = () => { setEditing(null); setForm(EMPTY_RULE); setModal(true); };
  const openEdit = r => { setEditing(r); setForm(r); setModal(true); };
  const handleSave = () => {
    if (!form.title || !form.condition || !form.recommendation) return toast.error('Please fill all required fields');
    if (editing) {
      setRules(p => p.map(r => r.id===editing.id ? { ...r, ...form } : r));
      toast.success('Rule updated');
    } else {
      setRules(p => [...p, { id:`r${Date.now()}`, ...form }]);
      toast.success('Rule created');
    }
    setModal(false);
  };
  const handleDel = () => { setRules(p => p.filter(r => r.id!==confirm.id)); toast.success('Rule deleted'); setConfirm(null); };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Advisory Rules Engine</h1>
        <Button onClick={openAdd}>+ New Rule</Button>
      </div>

      <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'11px 16px', marginBottom:20, fontSize:13, color:'#166534', display:'flex', gap:10, alignItems:'center' }}>
        <span>⚙️</span>
        <span>These rules define what the advisory engine recommends to each farmer, based on their crop, soil, location, crop stage, and weather data. The engine evaluates all matching rules and surfaces the most relevant recommendation.</span>
      </div>

      {rules.map(r => (
        <div key={r.id} style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:16, marginBottom:10, transition:'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='#86efac'} onMouseLeave={e => e.currentTarget.style.borderColor='#e2ebe2'}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', gap:7 }}>
              <Pill color="green">{r.crop}</Pill>
              <Pill color="grey">Region {r.region}</Pill>
              <Pill color={TYPE_COLOR[r.type]||'grey'}>{r.stage}</Pill>
            </div>
            <div style={{ display:'flex', gap:7 }}>
              <Pill color={TYPE_COLOR[r.type]||'grey'}>{r.type}</Pill>
              <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => setConfirm(r)}>Delete</Button>
            </div>
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:'#1a2e1a', marginBottom:7 }}>{r.title}</div>
          <div style={{ fontSize:12, color:'#4a7a4a', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'6px 10px', marginBottom:8, display:'flex', gap:6 }}>
            <span style={{ fontWeight:700, flexShrink:0 }}>IF</span><span style={{ lineHeight:1.5 }}>{r.condition}</span>
          </div>
          <div style={{ fontSize:13, color:'#1a2e1a', lineHeight:1.55, marginBottom:6 }}>{r.recommendation}</div>
          <div style={{ fontSize:12, color:'#888', lineHeight:1.45 }}>{r.reason}</div>
        </div>
      ))}

      {modal && (
        <Modal title={editing ? 'Edit Rule' : '⚙️ New Advisory Rule'} onClose={() => setModal(false)} width={580}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 12px' }}>
            <Field label="Crop"><Select value={form.crop} onChange={upd('crop')}>{['Maize','Sorghum','Pearl Millet','Cowpeas','Groundnuts','Sunflower','Cotton','All'].map(c => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Stage"><Select value={form.stage} onChange={upd('stage')}>{['Pre-planting','Planting','Vegetative','Tasselling','Grain Fill','Maturity','All'].map(s => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Type"><Select value={form.type} onChange={upd('type')}>{['Advisory','Alert','Reminder'].map(t => <option key={t}>{t}</option>)}</Select></Field>
          </div>
          <Field label="Rule Title *"><Input value={form.title} onChange={upd('title')} placeholder="e.g. Prepare field — effective rainfall detected" /></Field>
          <Field label="Condition (IF…) *"><Textarea value={form.condition} onChange={upd('condition')} rows={3} placeholder="Crop = Maize · Region = III · Stage = Planting · Rainfall ≥ 25mm…" /></Field>
          <Field label="Recommendation *"><Textarea value={form.recommendation} onChange={upd('recommendation')} rows={3} placeholder="🌱 Action the farmer should take…" /></Field>
          <Field label="Reason (Why)"><Textarea value={form.reason} onChange={upd('reason')} rows={2} placeholder="Explain why this action is appropriate…" /></Field>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20, paddingTop:16, borderTop:'1px solid #e2ebe2' }}>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update Rule' : 'Create Rule'}</Button>
          </div>
        </Modal>
      )}
      {confirm && <Confirm message={`Delete rule "${confirm.title}"?`} onConfirm={handleDel} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── NotificationsPage ────────────────────────────────────────────────────────
const NOTIF_TYPE_COLOR = { Advisory:'blue', 'Disease Alert':'red', Reminder:'yellow', Announcement:'grey' };
const EMPTY_NOTIF = { title:'', message:'', type:'Advisory', target:'All farmers' };

export function NotificationsPage() {
  const [notifs, setNotifs]     = useState(MOCK_NOTIFICATIONS);
  const [form, setForm]         = useState(EMPTY_NOTIF);
  const [confirm, setConfirm]   = useState(null);
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSend = () => {
    if (!form.title || !form.message) return toast.error('Title and message are required');
    setNotifs(p => [{ id:`n${Date.now()}`, ...form, sent:'Just now', delivered:198 }, ...p]);
    toast.success('📲 Notification sent to all farmers!');
    setForm(EMPTY_NOTIF);
  };
  const handleDel = () => { setNotifs(p => p.filter(n => n.id!==confirm.id)); toast.success('Deleted'); setConfirm(null); };

  return (
    <div>
      <h1 style={{ margin:'0 0 20px', fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Notifications</h1>

      {/* Compose */}
      <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20, marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, marginBottom:16, paddingBottom:10, borderBottom:'1px solid #e2ebe2' }}>Compose Notification</div>
        <Field label="Title *"><Input value={form.title} onChange={upd('title')} placeholder="Notification heading…" /></Field>
        <Field label="Message *"><Textarea value={form.message} onChange={upd('message')} rows={3} placeholder="Your message to farmers…" /></Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
          <Field label="Type"><Select value={form.type} onChange={upd('type')}>{['Advisory','Disease Alert','Weather Alert','Reminder','Announcement'].map(t => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Target audience">
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', paddingTop:4 }}>
              {['All farmers','By crop','By district','By stage'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, target:t }))}
                  style={{ padding:'6px 12px', borderRadius:20, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif', borderColor: form.target===t?'#86efac':'#e2ebe2', background: form.target===t?'#f0fdf4':'#fff', color: form.target===t?'#166534':'#666' }}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Push preview */}
        {(form.title || form.message) && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:14, marginBottom:14 }}>
            <div style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#16a34a', letterSpacing:.7, textTransform:'uppercase', marginBottom:8 }}>Push Notification Preview</div>
            <div style={{ background:'#1a2e1a', borderRadius:10, padding:'12px 14px', display:'flex', gap:10 }}>
              <div style={{ width:34, height:34, background:'#4ade80', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>🌽</div>
              <div>
                <div style={{ fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#7a9a7a', marginBottom:3 }}>Crop Advisory</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#eef5ee', marginBottom:2 }}>{form.title || 'Notification title'}</div>
                <div style={{ fontSize:11, color:'#a8bfa8', lineHeight:1.4 }}>{form.message ? form.message.substring(0,80)+'…' : 'Message preview…'}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <Button variant="ghost" onClick={() => setForm(EMPTY_NOTIF)}>Clear</Button>
          <Button onClick={handleSend}>Send to {form.target}</Button>
        </div>
      </div>

      {/* Sent history */}
      <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, overflow:'hidden' }}>
        <div style={{ padding:'12px 18px', borderBottom:'1px solid #e2ebe2', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#1a2e1a' }}>Sent Notifications</span>
          <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#888' }}>{notifs.length} total</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>{['Title','Type','Target','Sent','Delivered',''].map(h => <th key={h} style={{ background:'#f8fbf8', padding:'9px 14px', textAlign:'left', fontSize:10, textTransform:'uppercase', letterSpacing:.6, color:'#666', borderBottom:'1px solid #e2ebe2', fontFamily:'JetBrains Mono,monospace' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {notifs.map(n => (
              <tr key={n.id} style={{ borderBottom:'1px solid #f0f5f0' }}>
                <td style={{ padding:'11px 14px', fontSize:12 }}><strong>{n.title}</strong><div style={{ fontSize:11, color:'#888', marginTop:2 }}>{n.message?.substring(0,50)}…</div></td>
                <td style={{ padding:'11px 14px' }}><Pill color={NOTIF_TYPE_COLOR[n.type]||'grey'}>{n.type}</Pill></td>
                <td style={{ padding:'11px 14px', fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#666' }}>{n.target}</td>
                <td style={{ padding:'11px 14px', fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#888' }}>{n.sent}</td>
                <td style={{ padding:'11px 14px' }}><Pill color="green">{n.delivered} ✓</Pill></td>
                <td style={{ padding:'11px 14px' }}><Button size="sm" variant="danger" onClick={() => setConfirm(n)}>Delete</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirm && <Confirm message={`Delete notification "${confirm.title}"?`} onConfirm={handleDel} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ─── ReportsPage ──────────────────────────────────────────────────────────────
export function ReportsPage() {
  const stats = [
    { icon:'👨‍🌾', value:247,   label:'Total Farmers',    sub:'↑ 12 this week',    color:'#166534' },
    { icon:'📱', value:198,   label:'Active This Season', sub:'80% engagement',    color:'#0284c7' },
    { icon:'📝', value:'1,240',label:'Records Logged',    sub:'Across all farmers',color:'#c2410c' },
    { icon:'🔍', value:86,    label:'Disease Queries',   sub:'This season',        color:'#7c3aed' },
  ];
  const donutSegments = [
    { label:'Maize Streak 40%', color:'#4ade80' },
    { label:'Grey Leaf 25%',    color:'#38bdf8' },
    { label:'N.Corn Blight 15%',color:'#fbbf24' },
    { label:'Late Blight 12%',  color:'#f87171' },
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>Reports</h1>
        <Button variant="ghost">Export CSV</Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {stats.map((s,i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14 }}>Farmers by crop</div>
          <BarChart data={[{label:'🌽 Maize',value:202},{label:'🌾 Sorghum',value:68},{label:'🥜 Groundnuts',value:48},{label:'🫘 Cowpeas',value:34},{label:'🌻 Sunflower',value:24}]} />
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14 }}>Disease queries this season</div>
          <div style={{ width:110, height:110, borderRadius:'50%', background:'conic-gradient(#4ade80 0% 40%, #38bdf8 40% 65%, #fbbf24 65% 80%, #f87171 80% 100%)', margin:'0 auto 14px', boxShadow:'0 0 0 22px #fff inset' }} />
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center' }}>
            {donutSegments.map(s => <Pill key={s.label} color="grey">{s.label}</Pill>)}
          </div>
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14 }}>Farmers by district</div>
          <BarChart data={[{label:'Kadoma',value:74},{label:'Gweru',value:59},{label:'Kwekwe',value:49},{label:'Shurugwi',value:37},{label:'Other',value:28}]} />
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:14 }}>Soil types registered</div>
          <BarChart data={[{label:'Sandy Loam',value:172},{label:'Clay Loam',value:49},{label:'Red Clay',value:26}]} />
          <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid #e2ebe2' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#1a2e1a', marginBottom:10 }}>Advisory engine usage</div>
            {[['Recommendations served','1,847'],['Avg. per farmer','7.5'],['Rules evaluated/day','247']].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'5px 0', borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ color:'#666' }}>{l}</span>
                <span style={{ fontWeight:700, color:'#166534', fontFamily:'JetBrains Mono,monospace' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
