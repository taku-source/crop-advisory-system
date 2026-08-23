import React, { useState, useEffect, useCallback } from 'react';
import { getAdminReport, getAgriculturalKnowledge, getSoilKnowledge, getDiseaseKnowledge } from '../api';
import { StatCard, PageHeader, Table, Chip, Button, Select, toast } from '../components/UI';

// ─── ReportsPage ──────────────────────────────────────────────────────────────
export function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminReport()
      .then((r) => setReport(r.data.report))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9fbfa8', fontSize: 15 }}>Loading reports...</div>;
  if (!report) return null;

  const BAR_COLORS = { Planting: '#4caf50', Fertilizer: '#2196f3', Pesticide: '#ff9800', Harvest: '#8bc34a', Expense: '#f44336' };
  const totalRecords = Object.values(report.recordsByCategory || {}).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader title="Reports & Analytics" />

      {/* Key stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon="👨‍🌾" value={report.totalFarmers}     label="Total Farmers"     sub={`${report.activeFarmers} active`} />
        <StatCard icon="📋" value={report.totalAdvisories}  label="Active Advisories"  color="#1565c0" />
        <StatCard icon="🦠" value={report.totalDiseases}    label="Diseases in DB"     color="#6a1b9a" />
        <StatCard icon="🔔" value={report.totalNotifications} label="Notifications Sent" color="#e65100" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent farmers */}
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Recently Registered Farmers</h3>
          <div style={{ background: '#0f231a', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(report.recentFarmers || []).map((f, i) => (
              <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < (report.recentFarmers.length - 1) ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#e6f6ea' }}>{f.fullName}</div>
                  <div style={{ fontSize: 11, color: '#9fbfa8' }}>{f.district}</div>
                </div>
                <div style={{ fontSize: 11, color: '#9fbfa8' }}>{new Date(f.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
              </div>
            ))}
            {!report.recentFarmers?.length && <div style={{ textAlign: 'center', padding: 24, color: '#ccc' }}>No farmers yet</div>}
          </div>
        </div>

        {/* Records by category */}
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Farm Records by Category</h3>
          <div style={{ background: '#0f231a', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {totalRecords === 0
              ? <div style={{ textAlign: 'center', color: '#ccc', padding: 20 }}>No records submitted yet</div>
              : Object.entries(report.recordsByCategory || {}).map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: '#e6f6ea' }}>{cat}</span>
                    <span style={{ color: '#9fbfa8' }}>{count} records</span>
                  </div>
                  <div style={{ background: '#122916', borderRadius: 6, height: 8 }}>
                    <div style={{ background: BAR_COLORS[cat] || '#2e7d32', width: `${(count / totalRecords) * 100}%`, height: '100%', borderRadius: 6 }} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KnowledgePage ────────────────────────────────────────────────────────────
export function KnowledgePage() {
  const [records, setRecords] = useState({ agricultural: [], soil: [], diseases: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]     = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [kind, setKind] = useState('agricultural');

  const fetchKnowledge = useCallback(async () => {
    try {
      const [agricultural, soil, diseases] = await Promise.all([
        getAgriculturalKnowledge({ region: 'III' }),
        getSoilKnowledge({ region: 'III' }),
        getDiseaseKnowledge({ region: 'III' })
      ]);
      setRecords({
        agricultural: agricultural.data.data || [],
        soil: soil.data.data || [],
        diseases: diseases.data.data || []
      });
    }
    catch { toast.error('Failed to load knowledge base'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKnowledge(); }, [fetchKnowledge]);

  const crops = [...new Set(records.agricultural.map((item) => item.cropName).concat(records.diseases.map((item) => item.crop)).filter(Boolean))].sort();
  const currentRecords = records[kind].filter((item) => {
    const text = JSON.stringify(item).toLowerCase();
    return (!search || text.includes(search.toLowerCase())) &&
      (cropFilter === 'All' || item.cropName === cropFilter || item.crop === cropFilter || item.suitableCrops?.includes(cropFilter));
  });

  const columns = kind === 'agricultural'
    ? [
      { label: 'Crop', render: (item) => <Chip color="green">{item.cropName}</Chip> },
      { label: 'Planting period', render: (item) => <span>{item.plantingPeriod || 'Not specified'}</span> },
      { label: 'Stages', render: (item) => <span>{item.growthStages?.length || 0}</span> },
      { label: 'Source', render: (item) => <span style={{ color: '#9fbfa8', fontSize: 12 }}>{item.source || '—'}</span> },
    ]
    : kind === 'soil'
      ? [
        { label: 'Soil type', render: (item) => <Chip color="green">{item.soilType}</Chip> },
        { label: 'Suitable crops', render: (item) => <span>{(item.suitableCrops || []).join(', ') || '—'}</span> },
        { label: 'Fertility', render: (item) => <span>{item.fertility?.rating || '—'}</span> },
        { label: 'Source', render: (item) => <span style={{ color: '#9fbfa8', fontSize: 12 }}>{item.source || '—'}</span> },
      ]
      : [
        { label: 'Disease', render: (item) => <strong>{item.diseaseName}</strong> },
        { label: 'Crop', render: (item) => <Chip color="green">{item.crop}</Chip> },
        { label: 'Weighted symptoms', render: (item) => <span>{item.symptoms?.length || 0}</span> },
        { label: 'Source', render: (item) => <span style={{ color: '#9fbfa8', fontSize: 12 }}>{item.source || '—'}</span> },
      ];

  return (
    <div>
      <PageHeader
        title={`Verified Knowledge Base (${currentRecords.length})`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search verified records..." style={{ padding: '9px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 13, outline: 'none', width: 260, background: '#122916', color: '#e6f6ea' }} />
            <Select value={kind} onChange={(e) => setKind(e.target.value)}><option value="agricultural">Agricultural</option><option value="soil">Soil</option><option value="diseases">Diseases</option></Select>
            <Select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}><option value="All">All crops</option>{crops.map((crop) => <option key={crop} value={crop}>{crop}</option>)}</Select>
            <Button onClick={fetchKnowledge}>Refresh</Button>
          </div>
        }
      />

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9fbfa8' }}>Loading...</div>
        : <Table columns={columns} rows={currentRecords} empty="No verified records found" />}
    </div>
  );
}
