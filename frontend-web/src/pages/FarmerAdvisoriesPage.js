import React, { useState, useEffect, useMemo } from 'react';
import { getAdvisories } from '../api';
import { PageHeader, SearchBar, Button, Chip, toast } from '../components/UI';

const CROPS = ['All', 'Maize', 'Tomato', 'Beans', 'Groundnuts', 'Sweet Potato', 'Sorghum'];

export default function FarmerAdvisoriesPage() {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [crop, setCrop] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAdvisories();
        setAdvisories(res.data.advisories);
      } catch {
        toast.error('Failed to load advisories');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => advisories.filter((adv) => {
    const matchesCrop = crop === 'All' || adv.crop === crop;
    const matchesSearch = !search || [adv.activity, adv.crop, adv.description].some((value) => value?.toLowerCase().includes(search.toLowerCase()));
    return matchesCrop && matchesSearch;
  }), [advisories, crop, search]);

  return (
    <div>
      <PageHeader title="Advisories" action={<Button onClick={() => setSearch('')}>Refresh</Button>} />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search advisory..." />
        <select value={crop} onChange={(e) => setCrop(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd', minWidth: 180 }}>
          {CROPS.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      {loading ? <div style={{ color: '#666' }}>Loading advisories...</div> : (
        filtered.length === 0 ? <div style={{ color: '#888' }}>No advisories match this filter.</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
            {filtered.map((advisory) => (
              <div key={advisory._id} style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 14px 30px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div><strong style={{ fontSize: 16 }}>{advisory.activity}</strong><div style={{ color: '#888', marginTop: 4 }}>{advisory.crop}</div></div>
                  <Chip color="blue">{new Date(advisory.recommendedDate).toLocaleDateString('en-GB')}</Chip>
                </div>
                <p style={{ color: '#555', lineHeight: 1.7 }}>{advisory.description}</p>
                {advisory.instructions && <div style={{ marginTop: 14 }}><strong>Instructions:</strong><p style={{ margin: '8px 0 0', color: '#555' }}>{advisory.instructions}</p></div>}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
