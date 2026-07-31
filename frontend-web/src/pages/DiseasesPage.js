import React, { useState, useEffect, useCallback } from 'react';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../api';
import { PageHeader, SearchBar, Table, Chip, Button, Modal, Field, Input, Textarea, Select, ConfirmDialog, toast } from '../components/UI';

const CROPS = ['Maize', 'Tomato', 'Beans'];
const EMPTY_FORM = { crop: 'Maize', diseaseName: '', severity: 'Medium', symptoms: '', description: '', causes: '', treatment: '', prevention: '' };

const SEV_COLOR = { High: 'red', Medium: 'orange', Low: 'green' };

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [confirm, setConfirm]   = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await getDiseases();
      setDiseases(res.data.diseases);
    } catch { toast.error('Failed to load diseases'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({ crop: d.crop, diseaseName: d.diseaseName, severity: d.severity, symptoms: (d.symptoms || []).join('\n'), description: d.description || '', causes: d.causes || '', treatment: d.treatment || '', prevention: d.prevention || '' });
    setModalOpen(true);
  };

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.crop || !form.diseaseName) return toast.error('Crop and disease name are required');
    const payload = { ...form, symptoms: form.symptoms.split('\n').map((s) => s.trim()).filter(Boolean) };
    setSaving(true);
    try {
      if (editing) {
        await updateDisease(editing._id, payload);
        toast.success('Disease updated');
      } else {
        await createDisease(payload);
        toast.success('Disease added');
      }
      setModalOpen(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteDisease(confirm._id); toast.success('Disease deleted'); fetch(); }
    catch { toast.error('Delete failed'); }
    finally { setConfirm(null); }
  };

  const filtered = diseases.filter((d) => {
    const matchCrop   = cropFilter === 'All' || d.crop === cropFilter;
    const matchSearch = !search || d.diseaseName.toLowerCase().includes(search.toLowerCase()) || d.crop.toLowerCase().includes(search.toLowerCase());
    return matchCrop && matchSearch;
  });

  const columns = [
    { label: 'Crop', render: (d) => <Chip color="green">{d.crop}</Chip> },
    { label: 'Disease', render: (d) => <strong>{d.diseaseName}</strong> },
    { label: 'Severity', render: (d) => <Chip color={SEV_COLOR[d.severity] || 'grey'}>{d.severity}</Chip> },
    {
      label: 'Symptoms',
      render: (d) => (
        <div>
          {(d.symptoms || []).slice(0, 3).map((s, i) => <div key={i} style={{ fontSize: 11, color: '#cfd9c8' }}>• {s}</div>)}
          {d.symptoms?.length > 3 && <div style={{ fontSize: 11, color: '#9fbfa8' }}>+{d.symptoms.length - 3} more</div>}
        </div>
      ),
    },
    { label: 'Treatment', render: (d) => <span style={{ fontSize: 12, color: '#555', display: 'block', maxWidth: 200 }}>{d.treatment}</span> },
    {
      label: 'Actions',
      render: (d) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(d)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setConfirm(d)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Disease Database (${diseases.length})`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search disease or crop..." />
            <Button onClick={openAdd}>+ Add Disease</Button>
          </div>
        }
      />

      {/* Crop tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['All', ...CROPS].map((c) => (
          <button key={c} onClick={() => setCropFilter(c)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderColor: cropFilter === c ? '#2e7d32' : 'rgba(255,255,255,0.12)', background: cropFilter === c ? '#2e7d32' : '#0f231a', color: cropFilter === c ? '#fff' : '#e6f6ea' }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#9fbfa8' }}>Loading...</div>
        : <Table columns={columns} rows={filtered} empty="No diseases found" />}

      {modalOpen && (
        <Modal title={editing ? 'Edit Disease' : '🦠 Add Disease'} onClose={() => setModalOpen(false)} width={580}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 14px' }}>
            <Field label="Crop *">
              <Select value={form.crop} onChange={upd('crop')}>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Severity">
              <Select value={form.severity} onChange={upd('severity')}>
                {['Low', 'Medium', 'High'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <div style={{ gridColumn: 'span 1' }}></div>
          </div>
          <Field label="Disease Name *">
            <Input value={form.diseaseName} onChange={upd('diseaseName')} placeholder="e.g. Grey Leaf Spot" />
          </Field>
          <Field label="Symptoms (one per line)">
            <Textarea value={form.symptoms} onChange={upd('symptoms')} rows={4} placeholder={"Yellow leaves\nBrown spots\nStunted growth"} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={upd('description')} rows={2} placeholder="Brief overview of the disease..." />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
            <Field label="Causes">
              <Textarea value={form.causes} onChange={upd('causes')} rows={3} />
            </Field>
            <Field label="Treatment">
              <Textarea value={form.treatment} onChange={upd('treatment')} rows={3} />
            </Field>
          </div>
          <Field label="Prevention">
            <Textarea value={form.prevention} onChange={upd('prevention')} rows={2} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Disease' : 'Add Disease'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.diseaseName}" from the database? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
