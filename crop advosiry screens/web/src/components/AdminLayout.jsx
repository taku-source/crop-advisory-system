import React from 'react';
import Sidebar from './Sidebar';

const C = { border:'#e2ebe2', green:'#166534' };

export default function AdminLayout({ page, onNavigate, user, title, actions, children }) {
  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'Inter,sans-serif', background:'#f6f8f6', overflow:'hidden' }}>
      <Sidebar active={page} onNavigate={onNavigate} user={user} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <div style={{ background:'#fff', borderBottom:`1px solid ${C.border}`, padding:'13px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:'#1a2e1a', fontFamily:'Syne,sans-serif' }}>{title}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {actions}
            <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#888', background:'#f0f7f0', padding:'4px 11px', borderRadius:20, border:`1px solid ${C.border}` }}>Main Season 2024/25</span>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
