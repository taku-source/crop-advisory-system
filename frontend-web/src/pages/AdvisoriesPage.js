import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdvisories,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  getAvailableCrops,
  getAvailableSoils,
  getAgriculturalKnowledge,
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
  toast,
} from '../components/UI';

/*
 * The advisory system is designed specifically for
 * Agro-Ecological Region III and the seven supported crops.
 *
 * The administrator manages verified agricultural rules,
 * while the backend uses farmer profile + soil + location +
 * weather + crop information to generate contextual advice.
 */

const EMPTY_FORM = {
  crop: '',
  activity: '',
  description: '',
  instructions: '',
  recommendedDate: '',
  season: 'Main Rain-Fed Season',
  cropStage: 'Any Stage',
  soilType: 'Any Soil',
  weatherCondition: 'Any Condition',
  rainfallRequirement: '',
  soilMoistureRequirement: '',
  triggerCondition: '',
  recommendationReason: '',
  source: '',
  reference: '',
  region: 'III',
};

export default function AdvisoriesPage() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [crops, setCrops] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [cropStages, setCropStages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [weatherConditions, setWeatherConditions] = useState([]);
  const [stageFilter, setStageFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchAdvisories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAdvisories();

      setAdvisories(res.data?.advisories || []);
      const [cropResponse, soilResponse, knowledgeResponse] = await Promise.all([getAvailableCrops(), getAvailableSoils(), getAgriculturalKnowledge({ region: 'III' })]);
      setCrops((cropResponse.data?.crops || []).map((crop) => crop.name));
      setSoilTypes((soilResponse.data?.soils || []).map((soil) => soil.soilType));
      const knowledge = knowledgeResponse.data?.data || [];
      setCropStages([...new Set(knowledge.flatMap((crop) => (crop.growthStages || []).map((stage) => stage.stageName)).filter(Boolean))]);
      setActivities([...new Set(knowledge.flatMap((crop) => (crop.growthStages || []).flatMap((stage) => (stage.activities || []).map((activity) => activity.activityName))).filter(Boolean))]);
      setWeatherConditions([...new Set((res.data?.advisories || []).map((advisory) => advisory.weatherCondition).filter(Boolean))]);
      setForm((current) => ({ ...current, crop: current.crop || cropResponse.data?.crops?.[0]?.name || '' }));
    } catch (err) {
      toast.error('Failed to load advisories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvisories();
  }, [fetchAdvisories]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (advisory) => {
    setEditing(advisory);

    setForm({
      crop: advisory.crop || 'Maize',
      activity: advisory.activity || '',
      description: advisory.description || '',
      instructions: advisory.instructions || '',
      recommendedDate:
        advisory.recommendedDate?.split('T')[0] || '',
      season: advisory.season || 'Main Rain-Fed Season',
      cropStage: advisory.cropStage || 'Any Stage',
      soilType: advisory.soilType || 'Any Soil',
      weatherCondition:
        advisory.weatherCondition || 'Any Condition',
      rainfallRequirement:
        advisory.rainfallRequirement || '',
      soilMoistureRequirement:
        advisory.soilMoistureRequirement || '',
      triggerCondition:
        advisory.triggerCondition || '',
      recommendationReason:
        advisory.recommendationReason || '',
      source: advisory.source || '',
      reference: advisory.reference || '',
      region: advisory.region || 'III',
    });

    setModalOpen(true);
  };

  const updateForm = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const handleSave = async () => {
    if (
      !form.crop ||
      !form.activity ||
      !form.description ||
      !form.instructions
    ) {
      return toast.error(
        'Please complete the required advisory fields'
      );
    }

    if (!form.source || !form.reference) {
      return toast.error(
        'Please provide the agricultural source and reference'
      );
    }

    setSaving(true);

    try {
      /*
       * This structure allows the backend to use the advisory
       * as a rule rather than simply as a static message.
       */

      const payload = {
        ...form,

        region: 'III',

        rainFed: true,

        /*
         * Context used by the rule-based advisory engine.
         */
        context: {
          crop: form.crop,
          cropStage: form.cropStage,
          soilType: form.soilType,
          weatherCondition: form.weatherCondition,
          rainfallRequirement: form.rainfallRequirement,
          soilMoistureRequirement:
            form.soilMoistureRequirement,
        },

        /*
         * Explain why this recommendation is generated.
         */
        contextualReason: form.recommendationReason,

        /*
         * Academic/source traceability.
         */
        sourceInformation: {
          source: form.source,
          reference: form.reference,
        },
      };

      if (editing) {
        await updateAdvisory(editing._id, payload);
        toast.success('Advisory rule updated');
      } else {
        await createAdvisory(payload);
        toast.success('Advisory rule created');
      }

      setModalOpen(false);
      await fetchAdvisories();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to save advisory'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;

    try {
      await deleteAdvisory(confirm._id);

      toast.success('Advisory rule deleted');

      await fetchAdvisories();
    } catch {
      toast.error('Failed to delete advisory');
    } finally {
      setConfirm(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const now = new Date();

  /*
   * Search + contextual filters.
   */
  const filtered = advisories.filter((advisory) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      advisory.crop?.toLowerCase().includes(searchText) ||
      advisory.activity?.toLowerCase().includes(searchText) ||
      advisory.description?.toLowerCase().includes(searchText) ||
      advisory.source?.toLowerCase().includes(searchText);

    const matchesCrop =
      cropFilter === 'All' ||
      advisory.crop === cropFilter;

    const matchesStage =
      stageFilter === 'All' ||
      advisory.cropStage === stageFilter;

    return (
      matchesSearch &&
      matchesCrop &&
      matchesStage
    );
  });

  const columns = [
    {
      label: 'Crop',
      render: (a) => (
        <Chip color="green">
          {a.crop}
        </Chip>
      ),
    },

    {
      label: 'Activity',
      render: (a) => (
        <strong>
          {a.activity}
        </strong>
      ),
    },

    {
      label: 'Crop Stage',
      render: (a) => (
        <span
          style={{
            fontSize: 12,
            color: '#cfd9c8',
          }}
        >
          {a.cropStage || 'Any Stage'}
        </span>
      ),
    },

    {
      label: 'Soil',
      render: (a) => (
        <span
          style={{
            fontSize: 12,
            color: '#cfd9c8',
          }}
        >
          {a.soilType || 'Any Soil'}
        </span>
      ),
    },

    {
      label: 'Weather Trigger',
      render: (a) => (
        <span
          style={{
            fontSize: 11,
            color: '#9fbfa8',
          }}
        >
          {a.weatherCondition || 'Any Condition'}
        </span>
      ),
    },

    {
      label: 'Date',
      render: (a) => {
        if (!a.recommendedDate) {
          return (
            <span
              style={{
                fontSize: 12,
                color: '#9fbfa8',
              }}
            >
              Rule based
            </span>
          );
        }

        const diff = Math.ceil(
          (new Date(a.recommendedDate) - now) /
            (1000 * 60 * 60 * 24)
        );

        const color =
          diff < 0
            ? '#aaa'
            : diff <= 3
            ? '#e53935'
            : diff <= 7
            ? '#fb8c00'
            : '#2e7d32';

        return (
          <div>
            <div style={{ fontSize: 12 }}>
              {formatDate(a.recommendedDate)}
            </div>

            <div
              style={{
                fontSize: 11,
                color,
              }}
            >
              {diff < 0
                ? `${Math.abs(diff)}d ago`
                : diff === 0
                ? 'Today'
                : `In ${diff}d`}
            </div>
          </div>
        );
      },
    },

    {
      label: 'Source',
      render: (a) => (
        <span
          style={{
            fontSize: 11,
            color: '#9fbfa8',
            display: 'block',
            maxWidth: 180,
          }}
        >
          {a.source || 'Not specified'}
        </span>
      ),
    },

    {
      label: 'Actions',
      render: (a) => (
        <div
          style={{
            display: 'flex',
            gap: 6,
          }}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEdit(a)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirm(a)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Configured Region III Rules and Overrides (${advisories.length})`}
        action={
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search crop, activity or source..."
            />

            <Select
              value={cropFilter}
              onChange={(e) =>
                setCropFilter(e.target.value)
              }
            >
              <option value="All">
                All Crops
              </option>

              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </Select>

            <Select
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(e.target.value)
              }
            >
              <option value="All">
                All Stages
              </option>

              {cropStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </Select>

            <Button onClick={openAdd}>
              + Add Configured Rule
            </Button>
          </div>
        }
      />

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: '#9fbfa8',
          }}
        >
          Loading...
        </div>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          empty="No Region III advisory rules found"
        />
      )}

      {/* =====================================================
              ADD / EDIT CONFIGURED RULE
          ===================================================== */}

      {modalOpen && (
        <Modal
          title={
            editing
              ? 'Edit Configured Rule'
              : '📋 New Region III Configured Rule'
          }
          onClose={() => setModalOpen(false)}
        >
          <div
            style={{
              marginBottom: 18,
              padding: 12,
              borderRadius: 8,
              background:
                'rgba(46, 125, 50, 0.08)',
              border:
                '1px solid rgba(46, 125, 50, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: '#9fbfa8',
              }}
            >
              This rule is an administrator-configured input used by the rule-based
              decision engine to generate contextual
              recommendations for rain-fed farmers in
              Agro-Ecological Region III.
            </div>
          </div>

          {/* Crop and Activity */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0 16px',
            }}
          >
            <Field label="Crop *">
              <Select
                value={form.crop}
                onChange={updateForm('crop')}
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

            <Field label="Activity *">
              <Select
                value={form.activity}
                onChange={updateForm('activity')}
              >
                <option value="">
                  Select activity...
                </option>

                {activities.map((activity) => (
                  <option
                    key={activity}
                    value={activity}
                  >
                    {activity}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Crop Stage / Soil */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0 16px',
            }}
          >
            <Field label="Crop Stage">
              <Select
                value={form.cropStage}
                onChange={updateForm(
                  'cropStage'
                )}
              >
                {['Any Stage', ...cropStages].map((stage) => (
                  <option
                    key={stage}
                    value={stage}
                  >
                    {stage}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Soil Type">
              <Select
                value={form.soilType}
                onChange={updateForm(
                  'soilType'
                )}
              >
                <option value="Any Soil">
                  Any Soil
                </option>

                {soilTypes.map((soil) => (
                  <option
                    key={soil}
                    value={soil}
                  >
                    {soil}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Weather trigger */}

          <Field label="Weather Trigger">
            <Select
              value={form.weatherCondition}
              onChange={updateForm(
                'weatherCondition'
              )}
            >
              {['Any Condition', ...weatherConditions].map(
                (condition) => (
                  <option
                    key={condition}
                    value={condition}
                  >
                    {condition}
                  </option>
                )
              )}
            </Select>
          </Field>

          {/* Description */}

          <Field label="Advisory Description *">
            <Input
              value={form.description}
              onChange={updateForm(
                'description'
              )}
              placeholder="What should the farmer know?"
            />
          </Field>

          {/* Instructions */}

          <Field label="Detailed Instructions *">
            <Textarea
              value={form.instructions}
              onChange={updateForm(
                'instructions'
              )}
              placeholder="Explain exactly what the farmer should do..."
              rows={5}
            />
          </Field>

          {/* Contextual conditions */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0 16px',
            }}
          >
            <Field label="Rainfall Requirement">
              <Input
                value={
                  form.rainfallRequirement
                }
                onChange={updateForm(
                  'rainfallRequirement'
                )}
                placeholder="e.g. Adequate rainfall after planting"
              />
            </Field>

            <Field label="Soil Moisture Requirement">
              <Input
                value={
                  form.soilMoistureRequirement
                }
                onChange={updateForm(
                  'soilMoistureRequirement'
                )}
                placeholder="e.g. Adequate moisture"
              />
            </Field>
          </div>

          {/* Trigger */}

          <Field label="Decision Trigger">
            <Textarea
              value={form.triggerCondition}
              onChange={updateForm(
                'triggerCondition'
              )}
              placeholder="Example: Recommend planting when adequate soil moisture is established and no prolonged dry spell is forecast."
              rows={3}
            />
          </Field>

          {/* Reason */}

          <Field label="Why This Recommendation?">
            <Textarea
              value={
                form.recommendationReason
              }
              onChange={updateForm(
                'recommendationReason'
              )}
              placeholder="Explain why this recommendation is relevant to Region III farmers."
              rows={3}
            />
          </Field>

          {/* Date and season */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '0 16px',
            }}
          >
            <Field label="Recommended Date">
              <Input
                type="date"
                value={
                  form.recommendedDate
                }
                onChange={updateForm(
                  'recommendedDate'
                )}
              />
            </Field>

            <Field label="Season">
              <Input
                value={form.season}
                onChange={updateForm(
                  'season'
                )}
                placeholder="Main Rain-Fed Season"
              />
            </Field>
          </div>

          {/* Source information */}

          <div
            style={{
              marginTop: 10,
              paddingTop: 15,
              borderTop:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Agricultural Source
            </div>

            <Field label="Source *">
              <Input
                value={form.source}
                onChange={updateForm(
                  'source'
                )}
                placeholder="e.g. FAO, AGRITEX, DRSS"
              />
            </Field>

            <Field label="Reference *">
              <Textarea
                value={form.reference}
                onChange={updateForm(
                  'reference'
                )}
                placeholder="Report title, publication, URL, year or page number"
                rows={3}
              />
            </Field>
          </div>

          {/* Save */}

          <div
            style={{
              display: 'flex',
              justifyContent:
                'flex-end',
              gap: 10,
              marginTop: 20,
              paddingTop: 16,
              borderTop:
                '1px solid rgba(255,255,255,0.08)',
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
                ? 'Update Advisory Rule'
                : 'Create Advisory Rule'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}

      {confirm && (
        <ConfirmDialog
          message={`Delete the advisory rule "${confirm.activity}" for ${confirm.crop}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() =>
            setConfirm(null)
          }
        />
      )}
    </div>
  );
}