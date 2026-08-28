import React from 'react';
import { StatCard, Table, Pill, BarChart } from '../components/UI.jsx';
import { MOCK_FARMERS } from '../constants/data.js';

const STAGE_COLOR = { Planting:'blue', 'Land Prep':'yellow', Vegetative:'green', '—':'grey' };

export default function DashboardPage({ onNavigate }) {
  const stats = [
    { icon:'👨‍🌾', value:247,  label:'Farmers',        sub:'↑ 12 this week',    color:'#166534' },
    { icon:'📋', value:7,    label:'Crops covered',   sub:'Main Season 2024/25', color:'#0284c7' },
    { icon:'🦠', value:9,    label:'Disease records', sub:'3 crops covered',     color:'#7c3aed' },
    { icon:'⚙️', value:24,   label:'Advisory rules',  sub:'Rule-based engine',   color:'#c2410c' },
  ];

  const cols = [
    { label:'Farmer',   render: r => <div><strong>{r.fullName}</strong><div style={{ fontSize:11, color:'#888' }}>{r.email}</div></div> },
    { label:'District', key:'district' },
    { label:'Crop',     key:'crop' },
    { label:'Stage',    render: r => <Pill color={STAGE_COLOR[r.stage]||'grey'}>{r.stage}</Pill> },
    { label:'Last Active', render: () => <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#888' }}>Today</span> },
    { label:'Status',   render: r => <Pill color={r.status==='Active'?'green':'red'}>{r.status}</Pill> },
  ];

  const cropData = [
    { label:'🌽 Maize',      value:202 },
    { label:'🌾 Sorghum',    value:68  },
    { label:'🥜 Groundnuts', value:48  },
    { label:'🫘 Cowpeas',    value:34  },
    { label:'🌻 Sunflower',  value:24  },
  ];

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {stats.map((s,i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Recent activity */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'#1a2e1a' }}>Recent Farmer Activity</span>
            <button onClick={() => onNavigate('farmers')} style={{ fontSize:12, color:'#166534', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>View all →</button>
          </div>
          <Table columns={cols} rows={MOCK_FARMERS.slice(0,4)} />
        </div>

        {/* Crop distribution */}
        <div style={{ background:'#fff', border:'1px solid #e2ebe2', borderRadius:12, padding:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#1a2e1a', marginBottom:16 }}>Farmers by crop</div>
          <BarChart data={cropData} />

          <div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid #e2ebe2' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#1a2e1a', marginBottom:12 }}>Districts</div>
            {['Kadoma','Gweru','Kwekwe','Shurugwi'].map((d,i) => (
              <div key={d} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'5px 0', borderBottom:'1px solid #f5f5f5' }}>
                <span style={{ color:'#666' }}>{d}</span>
                <span style={{ fontWeight:700, color:'#166534', fontFamily:'JetBrains Mono,monospace' }}>{[74,59,49,37][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory engine status */}
      <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:16, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:22 }}>⚙️</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#166534' }}>Advisory Rule Engine — Active</div>
          <div style={{ fontSize:12, color:'#4a7a4a', marginTop:2 }}>Rule-based contextual engine. Inputs: Farmer profile · Crop · Soil · GPS · Crop stage · Open-Meteo (forecast) · NASA POWER (climate). Last evaluated: Today 07:15</div>
        </div>
        <button onClick={() => onNavigate('rules')} style={{ marginLeft:'auto', padding:'7px 14px', background:'#166534', color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>View Rules</button>
      </div>
    </div>
  );
}
