import React from 'react';
import { ADMIN_NAV } from '../constants/data';

const C = { green:'#166534', greenLt:'#dcfce7', border:'#e2ebe2', grey:'#4a6a4a' };

export default function Sidebar({ active, onNavigate, user }) {
  const groups = [...new Set(ADMIN_NAV.map(n => n.group))];

  return (
    <aside style={{ width:215, flexShrink:0, background:'#fff', borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0 }}>
      {/* Logo */}
      <div style={{ padding:'18px 16px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
        <img src="/logo.png" alt="Crop Advisory" style={{ width:26, height:26, objectFit:'contain' }} />
        <span style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:800, color: C.green }}>Crop Advisory</span>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', overflowY:'auto' }}>
        {groups.map(group => (
          <div key={group}>
            <div style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', color:'#aaa', letterSpacing:.1, textTransform:'uppercase', padding:'8px 9px 3px' }}>{group}</div>
            {ADMIN_NAV.filter(n => n.group === group).map(nav => {
              const isActive = active === nav.id;
              return (
                <button key={nav.id} onClick={() => onNavigate(nav.id)}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight: isActive ? 600 : 500, color: isActive ? C.green : C.grey, background: isActive ? C.greenLt : 'transparent', border:'none', width:'100%', textAlign:'left', fontFamily:'Inter,sans-serif', marginBottom:1, transition:'all .15s' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='#f0f7f0'; e.currentTarget.style.color=C.green; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.grey; }}}
                >
                  <span style={{ fontSize:15, width:20, textAlign:'center' }}>{nav.icon}</span>
                  {nav.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.border}` }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#1a2e1a' }}>{user?.name || 'System Admin'}</div>
        <div style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#888' }}>administrator</div>
      </div>
    </aside>
  );
}
