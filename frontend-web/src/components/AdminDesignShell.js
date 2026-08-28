import React from 'react';

const NAV_GROUPS = [
  { label: 'System', items: [{ id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'farmers', icon: '👨‍🌾', label: 'Farmers' }] },
  { label: 'Knowledge', items: [{ id: 'knowledge', icon: '📖', label: 'Ag. Knowledge' }, { id: 'diseases', icon: '🦠', label: 'Disease DB' }, { id: 'soil', icon: '🌱', label: 'Soil Data' }] },
  { label: 'Management', items: [{ id: 'advisories', icon: '📋', label: 'Advisories' }, { id: 'notifications', icon: '🔔', label: 'Notifications' }, { id: 'reports', icon: '📈', label: 'Reports' }] },
];

export default function AdminDesignShell({ page, onNavigate, user, title, onLogout, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', sans-serif", background: '#091009', color: '#e6f6ea', overflow: 'hidden' }}>
      <aside style={{ width: 215, flexShrink: 0, background: '#091009', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="Crop Advisory" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: '#166534' }}>Crop Advisory</span>
        </div>
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV_GROUPS.map((group) => <div key={group.label}>
            <div style={{ fontSize: 9, color: '#888', letterSpacing: 1, textTransform: 'uppercase', padding: '8px 9px 3px' }}>{group.label}</div>
            {group.items.map((item) => <button key={item.id} onClick={() => onNavigate(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: page === item.id ? 700 : 500, color: page === item.id ? '#ffffff' : '#9fbfa8', background: page === item.id ? '#1b5e20' : 'transparent', border: 'none', width: '100%', textAlign: 'left', marginBottom: 1 }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>{item.label}
            </button>)}
          </div>)}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e6f6ea' }}>{user?.fullName || 'System Admin'}</div>
          <div style={{ fontSize: 11, color: '#9fbfa8', marginBottom: 10 }}>{user?.email || 'administrator'}</div>
          <button onClick={onLogout} style={{ width: '100%', padding: '7px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: '#122916', color: '#e6f6ea', cursor: 'pointer' }}>Sign out</button>
        </div>
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ background: '#0f231a', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#e6f6ea', fontFamily: "'Syne', sans-serif" }}>{title}</h1>
          <div style={{ display: 'flex', gap: 10 }}><span style={{ fontSize: 11, color: '#9fbfa8', background: '#122916', padding: '4px 11px', borderRadius: 20 }}>Region III</span><span style={{ fontSize: 11, color: '#9fbfa8', background: '#122916', padding: '4px 11px', borderRadius: 20 }}>Crop Advisory</span></div>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>{children}</div>
      </main>
    </div>
  );
}
