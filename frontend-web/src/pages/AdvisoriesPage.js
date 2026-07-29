import React, { useState, useEffect, useCallback } from 'react';
import { getAdvisories, createAdvisory, updateAdvisory, deleteAdvisory } from '../api';
import { PageHeader, SearchBar, Table, Chip, Button, Modal, Field, Input, Textarea, Select, ConfirmDialog, toast } from '../components/UI';

const CROPS      = ['Maize', 'Tomato', 'Beans', 'Groundnuts', 'Sweet Potato', 'Sorghum'];
const ACTIVITIES = ['Land Preparation', 'Planting', 'Basal Fertilizer Application', 'First Weeding', 'Second Weeding', 'Top Dressing', 'Pest Control', 'Disease Control', 'Fall Armyworm Inspection', 'Harvesting', 'Post-Harvest Handling'];

const EMPTY_FORM = { crop: 'Maize', activity: '', description: '', recommendedDate: '', season: 'Main Season 2024/25', instructions: '' };

export default function AdvisoriesPage() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [confirm, setConfirm]       = useState(null);

  const fetch = useCallback(async () => {
    try {
      const res = await getAdvisories();
      setAdvisories(res.data.advisories);
    } catch { toast.error('Failed to load advisories'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (a) => { setEditing(a); setForm({ crop: a.crop, activity: a.activity, description: a.description, recommendedDate: a.recommendedDate?.split('T')[0] || '', season: a.season, instructions: a.instructions || '' }); setModalOpen(true); };

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.crop || !form.activity || !form.description || !form.recommendedDate) {
      return toast.error('Please fill all required fields');
    }
    setSaving(true);
    try {
      if (editing) {
        await updateAdvisory(editing._id, form);
        toast.success('Advisory updated');
      } else {
        await createAdvisory(form);
        toast.success('Advisory created');
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteAdvisory(confirm._id);
      toast.success('Advisory deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
    finally { setConfirm(null); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const now = new Date();

  const filtered = advisories.filter((a) =>
    !search || a.activity.toLowerCase().includes(search.toLowerCase()) || a.crop.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { label: 'Crop', render: (a) => <Chip color="green">{a.crop}</Chip> },
    { label: 'Activity', render: (a) => <strong>{a.activity}</strong> },
    { label: 'Description', render: (a) => <span style={{ fontSize: 12, color: '#555', display: 'block', maxWidth: 220 }}>{a.description}</span> },
    { label: 'Date', render: (a) => {
        const diff = Math.ceil((new Date(a.recommendedDate) - now) / (1000*60*60*24));
        const color = diff < 0 ? '#aaa' : diff <= 3 ? '#e53935' : diff <= 7 ? '#fb8c00' : '#2e7d32';
        return <div><div style={{ fontSize: 12 }}>{fmt(a.recommendedDate)}</div><div style={{ fontSize: 11, color }}>{diff < 0 ? `${Math.abs(diff)}d ago` : diff === 0 ? 'Today' : `In ${diff}d`}</div></div>;
    }},
    { label: 'Season', render: (a) => <span style={{ fontSize: 11, color: '#aaa' }}>{a.season}</span> },
    {
      label: 'Actions',
      render: (a) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setConfirm(a)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Seasonal Advisories (${advisories.length})`}
        action={
          <div style={{ display: 'flex', gap: 10 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search crop or activity..." />
            <Button onClick={openAdd}>+ Add Advisory</Button>
          </div>
        }
      />

      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Loading...</div>
        : <Table columns={columns} rows={filtered} empty="No advisories found" />}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal title={editing ? 'Edit Advisory' : '📋 New Advisory'} onClose={() => setModalOpen(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Crop *">
              <Select value={form.crop} onChange={upd('crop')}>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Activity *">
              <Select value={form.activity} onChange={upd('activity')}>
                <option value="">Select activity...</option>
                {ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Description *">
            <Input value={form.description} onChange={upd('description')} placeholder="Brief description for farmers" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Field label="Recommended Date *">
              <Input type="date" value={form.recommendedDate} onChange={upd('recommendedDate')} />
            </Field>
            <Field label="Season">
              <Input value={form.season} onChange={upd('season')} />
            </Field>
          </div>
          <Field label="Detailed Instructions">
            <Textarea value={form.instructions} onChange={upd('instructions')} placeholder="Step-by-step instructions for this activity..." rows={4} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Advisory' : 'Create Advisory'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete advisory "${confirm.activity}" for ${confirm.crop}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
