import React, { useState, useEffect } from 'react';
import { getDiseases, getCropSymptoms, getAvailableCrops, identifyDisease } from '../api';
import { PageHeader, Button, Input, Select, toast, Chip } from '../components/UI';

export default function FarmerDiseasePage() {
  const [crop, setCrop] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const cropResponse = await getAvailableCrops();
        const cropNames = (cropResponse.data?.crops || []).map((item) => item.name);
        setCrops(cropNames);
        const selectedCrop = crop || cropNames[0] || '';
        if (!crop && selectedCrop) setCrop(selectedCrop);
        const res = await getDiseases({ crop: selectedCrop });
        setDiseases(res.data.diseases || []);
        const symptomResponse = await getCropSymptoms(selectedCrop);
        setAvailableSymptoms(symptomResponse.data?.data || []);
      } catch {
        toast.error('Failed to load diseases');
        setAvailableSymptoms([]);
      }
    };
    fetch();
  }, [crop]);

  const toggleSymptom = (symptom) => {
    setSymptoms((prev) => prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]);
  };

  const handleIdentify = async () => {
    if (!symptoms.length) return toast.error('Choose at least one symptom');
    setLoading(true);
    try {
      const res = await identifyDisease({ crop, symptoms });
      setResults(res.data.results || []);
    } catch {
      toast.error('Identification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Disease Identifier" action={<Button onClick={() => setResults([])}>Clear</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>
        <section style={{ background: '#0f231a', borderRadius: 20, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Select crop</label>
              <Select value={crop} onChange={(e) => { setCrop(e.target.value); setSymptoms([]); setResults([]); }}>
                {crops.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Symptoms</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {availableSymptoms.map((symptom) => {
                  const active = symptoms.includes(symptom);
                  return (
                    <button key={symptom} type="button" onClick={() => toggleSymptom(symptom)} style={{ padding: 14, borderRadius: 14, border: active ? '1px solid #2e7d32' : '1px solid rgba(255,255,255,0.08)', background: active ? '#122916' : 'rgba(255,255,255,0.04)', color: '#e6f6ea', cursor: 'pointer', textAlign: 'left' }}>
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button onClick={handleIdentify} disabled={loading || !symptoms.length}>{loading ? 'Scanning...' : 'Identify'}</Button>
              <span style={{ color: '#9fbfa8' }}>{symptoms.length} selected</span>
            </div>
          </div>
        </section>

        <aside style={{ background: '#0f231a', borderRadius: 20, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 style={{ marginTop: 0, color: '#e6f6ea' }}>How it works</h3>
          <p style={{ color: '#cfd9c8', lineHeight: 1.7 }}>Choose the crop and symptoms you see on your plants. The system matches your selection with the disease database and shows the best likely matches.</p>
          <div style={{ marginTop: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 14, color: '#e6f6ea' }}>Common crops</h4>
            {crops.map((item) => <Chip key={item} color="green" style={{ marginBottom: 8 }}>{item}</Chip>)}
          </div>
        </aside>
      </div>

      <div>
        <h2 style={{ fontSize: 18, marginBottom: 14, color: '#e6f6ea' }}>Diagnosis results</h2>
        {results.length === 0 ? (
          <div style={{ padding: 24, borderRadius: 18, background: '#091009', color: '#9fbfa8' }}>No results yet. Select symptoms and click Identify.</div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {results.map((item, index) => (
              <div key={index} style={{ background: '#0f231a', borderRadius: 18, padding: 20, boxShadow: '0 10px 24px rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <strong style={{ fontSize: 16, color: '#e6f6ea' }}>{item.diseaseName}</strong>
                    <div style={{ color: '#9fbfa8', fontSize: 13 }}>Match score: {item.matchScore}%</div>
                  </div>
                  <Chip color={item.matchScore >= 70 ? 'green' : item.matchScore >= 40 ? 'orange' : 'grey'}>{item.matchScore}%</Chip>
                </div>
                <div style={{ color: '#ffffff', lineHeight: 1.7 }}>
                  <p><strong>Confidence:</strong> {item.confidence}</p>
                  <p><strong>Symptoms matched:</strong> {item.matchedSymptomCount}/{item.totalSymptomCount}</p>
                  <p><strong>Matched symptoms:</strong> {(item.matchedSymptoms || []).map((symptom) => symptom.symptom).join(', ') || 'None'}</p>
                  <p><strong>Management:</strong> {(item.management?.treatmentMeasures || []).map((measure) => measure.measure).join('; ') || 'No management guidance recorded.'}</p>
                  <p><strong>Prevention:</strong> {(item.management?.preventiveMeasures || []).map((measure) => measure.measure).join('; ') || 'No prevention guidance recorded.'}</p>
                  <p><strong>Source:</strong> {item.source}{item.reference ? ` - ${item.reference}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
