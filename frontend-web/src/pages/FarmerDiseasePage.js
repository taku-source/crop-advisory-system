import React, { useState, useEffect } from 'react';
import { getDiseases, identifyDisease } from '../api';
import { PageHeader, Button, Input, Select, toast, Chip } from '../components/UI';

const CROPS = ['Maize', 'Tomato', 'Beans'];
const SYMPTOMS = {
  Maize: ['Yellow leaves', 'Yellow streaks', 'Brown spots', 'Wilting', 'Stunted growth', 'White powder'],
  Tomato: ['Water-soaked spots', 'Brown rings', 'White mould', 'Wilting', 'Leaf drop', 'Fruit rot'],
  Beans: ['Angular spots', 'Rust pustules', 'Yellow leaves', 'Brown lesions', 'Leaf drop'],
};

export default function FarmerDiseasePage() {
  const [crop, setCrop] = useState('Maize');
  const [symptoms, setSymptoms] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diseases, setDiseases] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDiseases({ crop });
        setDiseases(res.data.diseases);
      } catch {
        toast.error('Failed to load diseases');
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
        <section style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Select crop</label>
              <Select value={crop} onChange={(e) => { setCrop(e.target.value); setSymptoms([]); setResults([]); }}>
                {CROPS.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Symptoms</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {(SYMPTOMS[crop] || []).map((symptom) => {
                  const active = symptoms.includes(symptom);
                  return (
                    <button key={symptom} type="button" onClick={() => toggleSymptom(symptom)} style={{ padding: 14, borderRadius: 14, border: active ? '1px solid #2e7d32' : '1px solid #ddd', background: active ? '#e8f5e9' : '#fff', color: '#333', cursor: 'pointer', textAlign: 'left' }}>
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button onClick={handleIdentify} disabled={loading || !symptoms.length}>{loading ? 'Scanning...' : 'Identify'}</Button>
              <span style={{ color: '#888' }}>{symptoms.length} selected</span>
            </div>
          </div>
        </section>

        <aside style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
          <h3 style={{ marginTop: 0 }}>How it works</h3>
          <p style={{ color: '#555', lineHeight: 1.7 }}>Choose the crop and symptoms you see on your plants. The system matches your selection with the disease database and shows the best likely matches.</p>
          <div style={{ marginTop: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Common crops</h4>
            {CROPS.map((item) => <Chip key={item} color="green" style={{ marginBottom: 8 }}>{item}</Chip>)}
          </div>
        </aside>
      </div>

      <div>
        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Diagnosis results</h2>
        {results.length === 0 ? (
          <div style={{ padding: 24, borderRadius: 18, background: '#f8faf8', color: '#666' }}>No results yet. Select symptoms and click Identify.</div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {results.map((item, index) => (
              <div key={index} style={{ background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 10px 24px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{item.disease.diseaseName}</strong>
                    <div style={{ color: '#888', fontSize: 13 }}>Match score: {item.matchScore}%</div>
                  </div>
                  <Chip color={item.matchScore >= 70 ? 'green' : item.matchScore >= 40 ? 'orange' : 'grey'}>{item.matchScore}%</Chip>
                </div>
                <div style={{ color: '#555', lineHeight: 1.7 }}>
                  <p><strong>Symptoms matched:</strong> {item.matchedSymptoms}</p>
                  <p><strong>Description:</strong> {item.disease.description}</p>
                  <p><strong>Treatment:</strong> {item.disease.treatment}</p>
                  <p><strong>Prevention:</strong> {item.disease.prevention}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
