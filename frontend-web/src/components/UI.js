import React, { useState, useEffect } from 'react';

// ─── Toast notification ───────────────────────────────────────────────────────
let _setToast = null;
export const toast = { success: (m) => _setToast({ msg: m, type: 'success' }), error: (m) => _setToast({ msg: m, type: 'error' }) };

export function ToastContainer() {
  const [toastData, setToast] = useState(null);
  _setToast = setToast;
  useEffect(() => { if (toastData) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } }, [toastData]);
  if (!toastData) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toastData.type === 'success' ? '#1b5e20' : '#b71c1c', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', gap: 8, alignItems: 'center' }}>
      {toastData.type === 'success' ? '✅' : '❌'} {toastData.msg}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#091009', borderRadius: 16, width, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#e6f6ea', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#a5d6a7', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#ffffff', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #2f4d3c', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#122916', color: '#e6f6ea' };

export const Input    = (p) => <input    style={inputStyle} {...p} />;
export const Textarea = (p) => <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} {...p} />;
export const Select   = ({ children, ...p }) => <select style={inputStyle} {...p}>{children}</select>;

// ─── Button ───────────────────────────────────────────────────────────────────
const BTN = {
  primary:   { background: '#2e7d32', color: '#fff', border: 'none' },
  secondary: { background: '#172d1f', color: '#e6f6ea', border: '1px solid rgba(255,255,255,0.12)' },
  danger:    { background: '#731f16', color: '#fff', border: '1px solid #b71c1c' },
  ghost:     { background: 'transparent', color: '#e6f6ea', border: '1px solid rgba(255,255,255,0.12)' },
};

export function Button({ variant = 'primary', size = 'md', children, style, ...p }) {
  const sz = size === 'sm' ? { padding: '5px 11px', fontSize: 11 } : { padding: '9px 18px', fontSize: 13 };
  return (
    <button style={{ ...BTN[variant], ...sz, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', transition: 'opacity 0.15s', ...style }} {...p}>{children}</button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, value, label, sub, color = '#2e7d32' }) {
  return (
    <div style={{ background: '#0f231a', borderRadius: 12, padding: 20, boxShadow: '0 6px 20px rgba(0,0,0,0.24)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9fbfa8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#a5d6a7', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ columns, rows, empty = 'No data' }) {
  return (
    <div style={{ background: '#0f231a', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.24)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key || c.label} style={{ background: '#091009', padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: '#9fbfa8', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: '#9fbfa8', fontSize: 14 }}>{empty}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {columns.map((c) => <td key={c.key || c.label} style={{ padding: '12px 16px', fontSize: 13, color: '#e6f6ea', verticalAlign: 'middle' }}>{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
const CHIP_STYLES = {
  green:  { background: '#122916', color: '#b8f2c0' },
  red:    { background: '#3f1211', color: '#ffb4b4' },
  orange: { background: '#3f2714', color: '#ffd89f' },
  blue:   { background: '#152330', color: '#b3d4ff' },
  grey:   { background: '#1b2a22', color: '#cfd9c8' },
};
export function Chip({ color = 'grey', children }) {
  return <span style={{ ...CHIP_STYLES[color], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>{children}</span>;
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export function PageHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#e6f6ea' }}>{title}</h1>
      {action}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: '9px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 13, outline: 'none', width: 280, background: '#122916', color: '#e6f6ea' }} />
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel, danger = true }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#091009', borderRadius: 14, padding: 28, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: '0 0 20px', fontSize: 15, color: '#e6f6ea', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
