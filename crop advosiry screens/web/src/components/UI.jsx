import React, { useState, useEffect } from 'react';

const C = {
  bg:'#f6f8f6', surface:'#fff', border:'#e2ebe2',
  green:'#166534', greenLt:'#dcfce7', greenMid:'#16a34a',
  text:'#1a2e1a', grey:'#4a6a4a', greyLt:'#888',
  danger:'#991b1b', dangerLt:'#fee2e2',
  warn:'#854d0e', warnLt:'#fef9c3',
  blue:'#1e40af', blueLt:'#dbeafe',
  neutral:'#6b7280', neutralLt:'#f3f4f6',
};

/* ── Pill ── */
const PILL_STYLES = {
  green:   { background: C.greenLt,   color: C.green   },
  red:     { background: C.dangerLt,  color: C.danger  },
  yellow:  { background: C.warnLt,    color: C.warn    },
  blue:    { background: C.blueLt,    color: C.blue    },
  grey:    { background: C.neutralLt, color: C.neutral },
};
export function Pill({ color = 'grey', children }) {
  const s = PILL_STYLES[color] || PILL_STYLES.grey;
  return (
    <span style={{ ...s, padding:'2px 9px', borderRadius:20, fontSize:10, fontWeight:700, fontFamily:'JetBrains Mono,monospace', display:'inline-block' }}>
      {children}
    </span>
  );
}

/* ── Button ── */
export function Button({ variant='primary', size='md', onClick, children, disabled, style }) {
  const base = { padding: size==='sm' ? '5px 11px' : '8px 16px', fontSize: size==='sm' ? 11 : 13, fontWeight:700, borderRadius:8, cursor:disabled?'not-allowed':'pointer', border:'none', fontFamily:'Inter,sans-serif', transition:'all .15s', opacity: disabled ? 0.6 : 1, ...style };
  const variants = {
    primary: { background: C.green,   color:'#fff' },
    ghost:   { background:'transparent', color: C.grey, border:`1px solid ${C.border}` },
    danger:  { background: C.dangerLt, color: C.danger, border:`1px solid #fca5a5` },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={disabled ? undefined : onClick}>{children}</button>;
}

/* ── Modal ── */
export function Modal({ title, onClose, children, width=520 }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, padding:28, width, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h2 style={{ margin:0, fontSize:17, color: C.green, fontFamily:'Syne,sans-serif', fontWeight:800 }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#aaa', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Form Field ── */
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.greyLt, marginBottom:5, textTransform:'uppercase', letterSpacing:.4, fontFamily:'JetBrains Mono,monospace' }}>{label}</label>
      {children}
    </div>
  );
}
export const Input = (p) => <input style={{ width:'100%', padding:'9px 11px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', background:'#f8fbf8', boxSizing:'border-box' }} {...p} />;
export const Textarea = (p) => <textarea style={{ width:'100%', padding:'9px 11px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical', minHeight:70, background:'#f8fbf8', boxSizing:'border-box' }} {...p} />;
export const Select = ({ children, ...p }) => <select style={{ width:'100%', padding:'9px 11px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', background:'#f8fbf8' }} {...p}>{children}</select>;

/* ── Table ── */
export function Table({ columns, rows, empty='No data' }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, overflow:'hidden', border:`1px solid ${C.border}` }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>{columns.map(c => <th key={c.key||c.label} style={{ background:'#f8fbf8', padding:'9px 14px', textAlign:'left', fontSize:10, textTransform:'uppercase', letterSpacing:.6, color:'#666', borderBottom:`1px solid ${C.border}`, fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ textAlign:'center', padding:36, color:'#ccc', fontSize:13 }}>{empty}</td></tr>
            : rows.map((row,i) => (
              <tr key={i} style={{ borderBottom:`1px solid #f0f5f0` }} onMouseEnter={e => e.currentTarget.style.background='#f8fbf8'} onMouseLeave={e => e.currentTarget.style.background=''}>
                {columns.map(c => <td key={c.key||c.label} style={{ padding:'11px 14px', fontSize:12, color: C.text, verticalAlign:'middle' }}>{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Stat card ── */
export function StatCard({ icon, value, label, sub, color='#166534' }) {
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:18, borderTop:`3px solid ${color}`, border:`1px solid ${C.border}` }}>
      <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:'#888', fontFamily:'JetBrains Mono,monospace', textTransform:'uppercase', letterSpacing:.5, marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

/* ── Page header ── */
export function PageHeader({ title, action }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
      <h1 style={{ margin:0, fontSize:20, fontWeight:800, color: C.text, fontFamily:'Syne,sans-serif' }}>{title}</h1>
      {action}
    </div>
  );
}

/* ── Search bar ── */
export function SearchBar({ value, onChange, placeholder='Search…' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, background:'#f8fbf8', border:`1px solid ${C.border}`, borderRadius:8, paddingInline:11 }}>
      <span style={{ color:'#888' }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding:'8px 0', border:'none', background:'transparent', fontSize:13, outline:'none', fontFamily:'Inter,sans-serif', width:220 }} />
    </div>
  );
}

/* ── Confirm dialog ── */
export function Confirm({ message, onConfirm, onCancel, danger=true }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ background:'#fff', borderRadius:14, padding:28, width:380, boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <p style={{ margin:'0 0 20px', fontSize:14, color: C.text, lineHeight:1.55 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Toast ── */
let _setToast = null;
export const toast = {
  success: (m) => _setToast({ msg:m, type:'success' }),
  error:   (m) => _setToast({ msg:m, type:'error'   }),
};
export function Toast() {
  const [t, setT] = useState(null);
  _setToast = setT;
  useEffect(() => { if (t) { const x = setTimeout(() => setT(null), 3000); return () => clearTimeout(x); }}, [t]);
  if (!t) return null;
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background: t.type==='success' ? '#1b5e20' : '#b71c1c', color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,.2)', display:'flex', gap:8, alignItems:'center' }}>
      {t.type === 'success' ? '✅' : '❌'} {t.msg}
    </div>
  );
}

/* ── Bar chart (simple CSS) ── */
export function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontSize:12, color:'#666', width:90, flexShrink:0, fontFamily:'JetBrains Mono,monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.label}</div>
          <div style={{ flex:1, height:7, background:'#f0f5f0', borderRadius:4 }}>
            <div style={{ width:`${(d.value/max)*100}%`, height:'100%', borderRadius:4, background:'linear-gradient(90deg,#16a34a,#4ade80)', transition:'width .4s ease' }} />
          </div>
          <div style={{ fontSize:11, color:'#888', width:28, textAlign:'right', fontFamily:'JetBrains Mono,monospace' }}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}
