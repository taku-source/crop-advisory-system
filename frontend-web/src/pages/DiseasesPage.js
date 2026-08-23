import React, { useState, useEffect, useCallback } from 'react';
import {
  getDiseases,
  createDisease,
  updateDisease,
  deleteDisease,
  getAvailableCrops
} from '../api';

import {
  PageHeader,
  SearchBar,
  Table,
  Chip,
  Button,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  ConfirmDialog,
  toast
} from '../components/UI';

const SEVERITIES = ['Low', 'Medium', 'High'];

const EMPTY_FORM = {
  crop: 'Maize',
  diseaseName: '',
  severity: 'Medium',
  description: '',
  causes: '',
  favourableConditions: '',
  symptoms: '',
  management: '',
  prevention: '',
  source: '',
  reference: ''
};

const SEV_COLOR = {
  High: 'red',
  Medium: 'orange',
  Low: 'green'
};

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [crops, setCrops] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchDiseases = useCallback(async () => {
    try {
      const res = await getDiseases();
      setDiseases(res.data.diseases || []);
      const cropResponse = await getAvailableCrops();
      setCrops((cropResponse.data?.crops || []).map((crop) => crop.name));
    } catch {
      toast.error('Failed to load diseases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (disease) => {
    setEditing(disease);

    setForm({
      crop: disease.crop || 'Maize',
      diseaseName: disease.diseaseName || '',
      severity: disease.severity || 'Medium',
      description: disease.description || '',
      causes: disease.causes || '',
      favourableConditions: disease.favourableConditions || '',
      symptoms: Array.isArray(disease.symptoms)
              ? disease.symptoms
            .map((s) =>
              typeof s === 'string'
                ? s
                : `${s.symptom || s.name || ''} | ${s.weight || 1}`
            )
            .join('\n')
        : '',
      management: disease.management || disease.treatment || '',
      prevention: disease.prevention || '',
      source: disease.source || '',
      reference: disease.reference || ''
    });

    setModalOpen(true);
  };

  const upd = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value
    }));
  };

  /*
   * Expected symptom format:
   *
   * symptom name | weight
   *
   * Example:
   * Yellowing of leaves | 1
   * Small brown lesions | 2
   * Reddish-brown spots | 3
   *
   * The weight represents how useful the symptom is
   * when distinguishing this disease from other diseases.
   */
  const parseSymptoms = () => {
    return form.symptoms
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split('|');

        const name = parts[0]?.trim();
        const weight = Number(parts[1]?.trim());

        return {
          symptom: name,
          weight: Number.isFinite(weight) && weight > 0 ? weight : 1
        };
      })
      .filter((symptom) => symptom.name);
  };

  const handleSave = async () => {
    if (!form.crop || !form.diseaseName) {
      return toast.error('Crop and disease name are required');
    }

    if (!form.source || !form.reference) {
      return toast.error(
        'A verified source and reference are required'
      );
    }

    const symptoms = parseSymptoms();

    if (symptoms.length === 0) {
      return toast.error(
        'At least one weighted symptom is required'
      );
    }

    const payload = {
      crop: form.crop,
      diseaseName: form.diseaseName,
      severity: form.severity,
      description: form.description,
      causes: form.causes,
      favourableConditions: form.favourableConditions,
      symptoms,
      management: form.management,
      prevention: form.prevention,

      /*
       * The disease database is specifically for
       * Agro-Ecological Region III.
       */
      agroEcologicalRegion: 'III',

      source: form.source,
      reference: form.reference
    };

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
      fetchDiseases();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Save failed'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDisease(confirm._id);
      toast.success('Disease deleted');
      fetchDiseases();
    } catch {
      toast.error('Delete failed');
    } finally {
      setConfirm(null);
    }
  };

  const filtered = diseases.filter((disease) => {
    const matchesCrop =
      cropFilter === 'All' ||
      disease.crop === cropFilter;

    const searchText =
      `${disease.diseaseName || ''} ${disease.crop || ''}`
        .toLowerCase();

    const matchesSearch =
      !search ||
      searchText.includes(search.toLowerCase());

    return matchesCrop && matchesSearch;
  });

  const columns = [
    {
      label: 'Crop',
      render: (d) => (
        <Chip color="green">
          {d.crop}
        </Chip>
      )
    },

    {
      label: 'Disease',
      render: (d) => (
        <strong>
          {d.diseaseName}
        </strong>
      )
    },

    {
      label: 'Severity',
      render: (d) => (
        <Chip
          color={
            SEV_COLOR[d.severity] || 'grey'
          }
        >
          {d.severity}
        </Chip>
      )
    },

    {
      label: 'Symptoms',
      render: (d) => (
        <div>
          {(d.symptoms || [])
            .slice(0, 3)
            .map((symptom, index) => {
              const name =
                typeof symptom === 'string'
                  ? symptom
                  : symptom.name;

              const weight =
                typeof symptom === 'object'
                  ? symptom.weight
                  : null;

              return (
                <div
                  key={index}
                  style={{
                    fontSize: 11,
                    color: '#cfd9c8'
                  }}
                >
                  • {name}
                  {weight ? ` (${weight})` : ''}
                </div>
              );
            })}

          {d.symptoms?.length > 3 && (
            <div
              style={{
                fontSize: 11,
                color: '#9fbfa8'
              }}
            >
              +{d.symptoms.length - 3} more
            </div>
          )}
        </div>
      )
    },

    {
      label: 'Management',
      render: (d) => (
        <span
          style={{
            fontSize: 12,
            color: '#ffffff',
            display: 'block',
            maxWidth: 220
          }}
        >
          {Array.isArray(d.management)
            ? d.management.map((item) => item.measure || item).join('; ')
            : d.management || d.treatment || '—'}
        </span>
      )
    },

    {
      label: 'Source',
      render: (d) => (
        <span
          style={{
            fontSize: 11,
            color: '#9fbfa8',
            display: 'block',
            maxWidth: 160
          }}
        >
          {d.source || '—'}
        </span>
      )
    },

    {
      label: 'Actions',
      render: (d) => (
        <div
          style={{
            display: 'flex',
            gap: 6
          }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEdit(d)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirm(d)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>

      <PageHeader
        title={`Disease Knowledge Base (${diseases.length})`}
        action={
          <div
            style={{
              display: 'flex',
              gap: 10
            }}
          >
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search disease or crop..."
            />

            <Button onClick={openAdd}>
              + Add Disease
            </Button>
          </div>
        }
      />

      {/* Crop filters */}

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap'
        }}
      >
        {['All', ...crops].map((crop) => (
          <button
            key={crop}
            onClick={() => setCropFilter(crop)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: '1px solid',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',

              borderColor:
                cropFilter === crop
                  ? '#2e7d32'
                  : 'rgba(255,255,255,0.12)',

              background:
                cropFilter === crop
                  ? '#2e7d32'
                  : '#0f231a',

              color:
                cropFilter === crop
                  ? '#fff'
                  : '#e6f6ea'
            }}
          >
            {crop}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: '#9fbfa8'
          }}
        >
          Loading...
        </div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          empty="No diseases found"
        />
      )}

      {/* Add / Edit Disease */}

      {modalOpen && (
        <Modal
          title={
            editing
              ? 'Edit Disease'
              : '🦠 Add Disease'
          }
          onClose={() => setModalOpen(false)}
          width={650}
        >

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0 14px'
            }}
          >

            <Field label="Crop *">
              <Select
                value={form.crop}
                onChange={upd('crop')}
              >
                {crops.map((crop) => (
                  <option
                    key={crop}
                    value={crop}
                  >
                    {crop}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Severity">
              <Select
                value={form.severity}
                onChange={upd('severity')}
              >
                {SEVERITIES.map((severity) => (
                  <option
                    key={severity}
                    value={severity}
                  >
                    {severity}
                  </option>
                ))}
              </Select>
            </Field>

          </div>

          <Field label="Disease Name *">
            <Input
              value={form.diseaseName}
              onChange={upd('diseaseName')}
              placeholder="e.g. Grey Leaf Spot"
            />
          </Field>

          <Field label="Symptoms and Weights *">
            <Textarea
              value={form.symptoms}
              onChange={upd('symptoms')}
              rows={6}
              placeholder={
`Yellowing of leaves | 1
Small brown lesions | 2
Distinctive grey leaf spots | 3`
              }
            />

            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: '#9fbfa8'
              }}
            >
              Enter one symptom per line using:
              <strong> symptom | weight</strong>.
              Higher weights indicate more distinctive symptoms.
            </div>
          </Field>

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={upd('description')}
              rows={3}
              placeholder="Brief description of the disease..."
            />
          </Field>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0 14px'
            }}
          >

            <Field label="Causes">
              <Textarea
                value={form.causes}
                onChange={upd('causes')}
                rows={4}
                placeholder="Known causes..."
              />
            </Field>

            <Field label="Favourable Conditions">
              <Textarea
                value={form.favourableConditions}
                onChange={upd('favourableConditions')}
                rows={4}
                placeholder="Conditions that favour disease development..."
              />
            </Field>

          </div>

          <Field label="Management Measures">
            <Textarea
              value={form.management}
              onChange={upd('management')}
              rows={4}
              placeholder="Recommended management measures..."
            />
          </Field>

          <Field label="Prevention Measures">
            <Textarea
              value={form.prevention}
              onChange={upd('prevention')}
              rows={3}
              placeholder="Recommended prevention measures..."
            />
          </Field>

          <div
            style={{
              padding: 12,
              marginTop: 8,
              marginBottom: 8,
              borderRadius: 8,
              background: 'rgba(46,125,50,0.08)',
              border: '1px solid rgba(46,125,50,0.25)'
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 4
              }}
            >
              Agro-Ecological Region
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#9fbfa8'
              }}
            >
              This knowledge base is specifically
              configured for Agro-Ecological Region III.
            </div>
          </div>

          <Field label="Verified Source *">
            <Input
              value={form.source}
              onChange={upd('source')}
              placeholder="e.g. FAO, AGRITEX, DRSS"
            />
          </Field>

          <Field label="Reference *">
            <Textarea
              value={form.reference}
              onChange={upd('reference')}
              rows={2}
              placeholder="Report title, URL, publication year or page number..."
            />
          </Field>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 20,
              paddingTop: 16,
              borderTop:
                '1px solid rgba(255,255,255,0.08)'
            }}
          >

            <Button
              variant="ghost"
              onClick={() =>
                setModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editing
                  ? 'Update Disease'
                  : 'Add Disease'}
            </Button>

          </div>

        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.diseaseName}" from the disease knowledge base? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

    </div>
  );
}