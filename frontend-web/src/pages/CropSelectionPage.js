import React, { useEffect, useState } from 'react';
import { getAvailableCrops, getCropInfo, selectCrop } from '../api';
import { toast, Button } from '../components/UI';
import Logo from '../components/Logo';

export default function CropSelectionPage({ onSelected }) {
  const [crops, setCrops] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [cropInfo, setCropInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getAvailableCrops()
      .then((response) => {
        if (active) setCrops(response.data.crops || []);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Unable to load available crops');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const chooseCrop = async (crop) => {
    setSelectedCrops((current) => current.includes(crop) ? current.filter((item) => item !== crop) : current.length < 3 ? [...current, crop] : current);
    setCropInfo(null);
    try {
      const response = await getCropInfo(crop);
      setCropInfo(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load crop information');
    }
  };

  const confirmSelection = async () => {
    if (!selectedCrops.length) return;
    setSaving(true);
    try {
      const response = await selectCrop(selectedCrops);
      onSelected(response.data.farmer);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save crop selection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#091009', color: '#e6f6ea', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <main style={{ width: '100%', maxWidth: 720, background: '#0f231a', border: '1px solid #24462f', borderRadius: 24, padding: 32, boxShadow: '0 24px 70px rgba(0,0,0,0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Logo size={92} />
          <div>
            <div style={{ color: '#8ee4a4', fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>Profile setup</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 28 }}>Choose your primary crop</h1>
          </div>
        </div>
        <p style={{ color: '#b8d9ba', lineHeight: 1.6, marginTop: 0 }}>
          Select up to three crops. Your seasonal dashboard will show only the crops you plan to grow, with a separate stage checklist for each one.
        </p>

        <div style={{ color: '#8ee4a4', fontSize: 13, fontWeight: 700 }}>{selectedCrops.length}/3 crops selected</div>

        {loading ? (
          <p style={{ color: '#a8d5ba' }}>Loading crops...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, margin: '24px 0' }}>
            {crops.map((crop) => {
              const active = selectedCrops.includes(crop.name);
              return (
                <button
                  key={crop.name}
                  type="button"
                  onClick={() => chooseCrop(crop.name)}
                  style={{ background: active ? '#1f5b35' : '#122916', color: '#ffffff', border: `1px solid ${active ? '#69f0ae' : '#2f4d3c'}`, borderRadius: 14, padding: '18px 12px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ fontSize: 28 }}>{crop.icon || '🌱'}</div>
                  <div style={{ fontWeight: 800, marginTop: 8 }}>{crop.name}</div>
                  <div style={{ color: '#a8d5ba', fontSize: 11, marginTop: 4 }}>{crop.description}</div>
                </button>
              );
            })}
          </div>
        )}

        {cropInfo && (
          <section style={{ background: '#122916', borderLeft: '3px solid #69f0ae', borderRadius: 12, padding: 16, marginBottom: 22 }}>
            <h2 style={{ fontSize: 17, margin: '0 0 8px' }}>{cropInfo.crop}</h2>
            <p style={{ color: '#b8d9ba', fontSize: 13, lineHeight: 1.6, margin: '0 0 10px' }}>{cropInfo.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, color: '#d8f2db', fontSize: 12 }}>
              <span>Planting: {cropInfo.plantingPeriod || 'Region III main season'}</span>
              <span>Source: {cropInfo.source}</span>
            </div>
          </section>
        )}

        <Button type="button" disabled={!selectedCrops.length || saving} onClick={confirmSelection} style={{ width: '100%', opacity: !selectedCrops.length || saving ? 0.6 : 1 }}>
          {saving ? 'Saving crops...' : `Continue with ${selectedCrops.length || 0} crop${selectedCrops.length === 1 ? '' : 's'}`}
        </Button>
      </main>
    </div>
  );
}
