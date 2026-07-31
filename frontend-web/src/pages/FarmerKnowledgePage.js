import React, { useState, useEffect } from 'react';
import { getKnowledge } from '../api';
import { PageHeader, SearchBar, Chip, toast } from '../components/UI';

const CROP_OPTIONS = ['All', 'General', 'Maize', 'Tomato', 'Beans'];
const CATEGORY_OPTIONS = ['All', 'Farming Guide', 'Best Practices', 'Disease Prevention', 'Fertilizer', 'Pest Management'];

export default function FarmerKnowledgePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [crop, setCrop] = useState('All');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getKnowledge();
        setArticles(res.data.articles);
      } catch {
        toast.error('Failed to load knowledge articles');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = articles.filter((article) => {
    const matchesSearch = !search || [article.title, article.content, article.category, article.crop].some((value) => value?.toLowerCase().includes(search.toLowerCase()));
    const matchesCrop = crop === 'All' || article.crop === crop;
    const matchesCategory = category === 'All' || article.category === category;
    return matchesSearch && matchesCrop && matchesCategory;
  });

  return (
    <div>
      <PageHeader title="Knowledge Base" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: 16, alignItems: 'center', marginBottom: 20 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search articles..." />
        <select value={crop} onChange={(e) => setCrop(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#122916', color: '#e6f6ea' }}>
          {CROP_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#122916', color: '#e6f6ea' }}>
          {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      {loading ? <div style={{ color: '#9fbfa8' }}>Loading articles...</div> : (
        <div style={{ display: 'grid', gap: 18 }}>
          {filtered.length === 0 ? <div style={{ color: '#9fbfa8' }}>No articles found.</div> : filtered.map((article) => (
            <div key={article._id} style={{ background: '#0f231a', borderRadius: 20, padding: 24, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: '#e6f6ea' }}>{article.title}</h2>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                    <Chip color="blue">{article.category}</Chip>
                    <Chip color="green">{article.crop || 'General'}</Chip>
                  </div>
                </div>
                <div style={{ textAlign: 'right', color: '#9fbfa8', fontSize: 12 }}>{new Date(article.createdAt).toLocaleDateString('en-GB')}</div>
              </div>
              <p style={{ color: '#cfd9c8', lineHeight: 1.8, marginBottom: 0 }}>{article.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
