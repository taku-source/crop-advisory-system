import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, Field, Input, Button } from '../components/UI';
import { getAvailableSoils } from '../api';
import Logo from '../components/Logo';

const DISTRICTS = [
  'Kadoma', 'Chegutu', 'Kwekwe', 'Muronzi', 'Chinhoyi', 'Zvimba', 'Sanyati',
];


export default function RegisterPage({ onSwitchMode, onHome }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', district: '', ward: '', farmName: '', farmSize: '', soilType: '', location: { latitude: null, longitude: null },
  });
  const [loading, setLoading] = useState(false);
  const [soilTypes, setSoilTypes] = useState([]);

  useEffect(() => { getAvailableSoils().then((response) => setSoilTypes((response.data?.soils || []).map((soil) => soil.soilType))).catch(() => toast.error('Could not load verified soil types')); }, []);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const captureLocation = () => {
    if (!navigator.geolocation) return toast.error('Location services are not supported by this browser');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setForm((prev) => ({ ...prev, location: { latitude: coords.latitude, longitude: coords.longitude } })),
      () => toast.error('Location was not captured. You can register and add GPS later from your profile.')
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'email', 'phone', 'password', 'district', 'ward', 'farmSize', 'soilType'];
    const missing = required.filter((key) => !form[key]?.trim());
    if (missing.length > 0) {
      return toast.error(`Please fill: ${missing.join(', ')}`);
    }

    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() });
      toast.success('Registration successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#091009', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px' }}>
      <div style={{ maxWidth: 560, width: '100%', background: '#0f231a', borderRadius: 28, padding: '36px 38px', boxShadow: '0 30px 100px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <Logo size={160} onClick={onHome} />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#e6f6ea' }}>Farmer Registration</h1>
          </div>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Full Name *"><Input value={form.fullName} onChange={update('fullName')} placeholder="Jane Doe" /></Field>
            <Field label="Email Address *"><Input type="email" value={form.email} onChange={update('email')} placeholder="jane@example.com" /></Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Phone Number *"><Input value={form.phone} onChange={update('phone')} placeholder="+263 77 123 4567" /></Field>
            <Field label="Password *"><Input type="password" value={form.password} onChange={update('password')} placeholder="At least 6 characters" /></Field>
          </div>

          <Field label="District *">
            <select value={form.district} onChange={update('district')} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #2f4d3c', fontSize: 14, background: '#122916', color: '#e6f6ea' }}>
              <option value="">Select district</option>
              {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </Field>

          <Field label="Ward *"><Input value={form.ward} onChange={update('ward')} placeholder="Ward name or number" /></Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <Field label="Farm Name"><Input value={form.farmName} onChange={update('farmName')} placeholder="My Farm" /></Field>
            <Field label="Farm Size"><Input value={form.farmSize} onChange={update('farmSize')} placeholder="e.g. 2 ha" /></Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Soil Type *">
              <select value={form.soilType} onChange={update('soilType')} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #2f4d3c', background: '#122916', color: '#e6f6ea' }}>
                <option value="">Select soil type</option>
                {soilTypes.map((soil) => <option key={soil} value={soil}>{soil}</option>)}
              </select>
            </Field>
          </div>

          <button type="button" onClick={captureLocation} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #2f4d3c', background: '#122916', color: '#ffffff', cursor: 'pointer', fontWeight: 700, marginBottom: 14 }}>
            {form.location.latitude ? `Location captured (${form.location.latitude.toFixed(3)}, ${form.location.longitude.toFixed(3)})` : 'Capture GPS location'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onSwitchMode('login')} style={{ background: 'transparent', border: 'none', color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Back to login</button>
            <Button type="submit" disabled={loading} style={{ width: '100%', maxWidth: 220, textAlign: 'center' }}>{loading ? 'Creating...' : 'Create Account'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
