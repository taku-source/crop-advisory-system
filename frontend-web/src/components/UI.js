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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#1b5e20', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>✕</button>
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
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafafa' };

export const Input    = (p) => <input    style={inputStyle} {...p} />;
export const Textarea = (p) => <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} {...p} />;
export const Select   = ({ children, ...p }) => <select style={inputStyle} {...p}>{children}</select>;

// ─── Button ───────────────────────────────────────────────────────────────────
const BTN = {
  primary:   { background: '#2e7d32', color: '#fff', border: 'none' },
  secondary: { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' },
  danger:    { background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' },
  ghost:     { background: 'transparent', color: '#666', border: '1px solid #ddd' },
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
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ columns, rows, empty = 'No data' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key || c.label} style={{ background: '#f8faf8', padding: '10px 16px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: '#666', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 40, color: '#ccc', fontSize: 14 }}>{empty}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                {columns.map((c) => <td key={c.key || c.label} style={{ padding: '12px 16px', fontSize: 13, color: '#333', verticalAlign: 'middle' }}>{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
const CHIP_STYLES = {
  green:  { background: '#e8f5e9', color: '#2e7d32' },
  red:    { background: '#ffebee', color: '#c62828' },
  orange: { background: '#fff3e0', color: '#e65100' },
  blue:   { background: '#e3f2fd', color: '#1565c0' },
  grey:   { background: '#f5f5f5', color: '#666' },
};
export function Chip({ color = 'grey', children }) {
  return <span style={{ ...CHIP_STYLES[color], padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' }}>{children}</span>;
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export function PageHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{title}</h1>
      {action}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ padding: '9px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', width: 280, background: '#fafafa' }} />
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel, danger = true }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <p style={{ margin: '0 0 20px', fontSize: 15, color: '#333', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
