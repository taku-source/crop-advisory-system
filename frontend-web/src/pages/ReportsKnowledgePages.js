import React, { useState, useEffect, useCallback } from 'react';
import { getAdminReport } from '../api';
import { getKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from '../api';
import { StatCard, PageHeader, Table, Chip, Button, Modal, Field, Input, Textarea, Select, ConfirmDialog, toast } from '../components/UI';

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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa', fontSize: 15 }}>Loading reports...</div>;
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
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            {(report.recentFarmers || []).map((f, i) => (
              <div key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < (report.recentFarmers.length - 1) ? '1px solid #f5f5f5' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{f.fullName}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{f.district}</div>
                </div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{new Date(f.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
              </div>
            ))}
            {!report.recentFarmers?.length && <div style={{ textAlign: 'center', padding: 24, color: '#ccc' }}>No farmers yet</div>}
          </div>
        </div>

        {/* Records by category */}
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Farm Records by Category</h3>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            {totalRecords === 0
              ? <div style={{ textAlign: 'center', color: '#ccc', padding: 20 }}>No records submitted yet</div>
              : Object.entries(report.recordsByCategory || {}).map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: '#666' }}>{count} records</span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: 6, height: 8 }}>
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
const CATS = ['Farming Guide', 'Best Practices', 'Disease Prevention', 'Fertilizer', 'Pest Management'];
const CROPS = ['General', 'Maize', 'Tomato', 'Beans'];
const EMPTY_FORM = { title: '', category: 'Farming Guide', crop: 'General', content: '', tags: '' };

export function KnowledgePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState(null);

  const fetch = useCallback(async () => {
    try { const r = await getKnowledge({ search }); setArticles(r.data.articles); }
    catch { toast.error('Failed to load knowledge base'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(fetch, 300); return () => clearTimeout(t); }, [fetch]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ title: a.title, category: a.category, crop: a.crop, content: a.content, tags: (a.tags || []).join(', ') }); setModalOpen(true); };
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.error('Title and content are required');
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    setSaving(true);
    try {
      if (editing) { await updateKnowledge(editing._id, payload); toast.success('Article updated'); }
      else { await createKnowledge(payload); toast.success('Article created'); }
      setModalOpen(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteKnowledge(confirm._id); toast.success('Article deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
    finally { setConfirm(null); }
  };

  const columns = [
    { label: 'Title', render: (a) => <strong style={{ fontSize: 13 }}>{a.title}</strong> },
    { label: 'Category', render: (a) => <Chip color="blue">{a.category}</Chip> },
    { label: 'Crop', render: (a) => a.crop !== 'General' ? <Chip color="green">{a.crop}</Chip> : <span style={{ color: '#aaa', fontSize: 12 }}>General</span> },
    { label: 'Tags', render: (a) => <span style={{ fontSize: 11, color: '#888' }}>{(a.tags || []).join(', ') || '—'}</span> },
    { label: 'Created', render: (a) => <span style={{ fontSize: 12, color: '#aaa' }}>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span> },
    { label: 'Actions', render: (a) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirm(a)}>Delete</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title={`Knowledge Base (${articles.length})`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." style={{ padding: '9px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', width: 260 }} />
            <Button onClick={openAdd}>+ Add Article</Button>
          </div>
        }
      />

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading...</div>
        : <Table columns={columns} rows={articles} empty="No articles yet" />}

      {modalOpen && (
        <Modal title={editing ? 'Edit Article' : '📚 New Article'} onClose={() => setModalOpen(false)} width={620}>
          <Field label="Title *">
            <Input value={form.title} onChange={upd('title')} placeholder="Article title..." />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Field label="Category">
              <Select value={form.category} onChange={upd('category')}>
                {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Crop">
              <Select value={form.crop} onChange={upd('crop')}>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Content *">
            <Textarea value={form.content} onChange={upd('content')} rows={8} placeholder="Full article content... Markdown supported." />
          </Field>
          <Field label="Tags (comma-separated)">
            <Input value={form.tags} onChange={upd('tags')} placeholder="maize, fertiliser, planting" />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Article' : 'Publish Article'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
