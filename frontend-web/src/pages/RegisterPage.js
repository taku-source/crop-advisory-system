import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast, Field, Input, Button } from '../components/UI';
import Logo from '../components/Logo';

const DISTRICTS = [
  'Midlands', 'Mashonaland West', 'Mashonaland East', 'Mashonaland Central',
  'Manicaland', 'Matabeleland North', 'Matabeleland South', 'Masvingo', 'Bulawayo', 'Harare',
];

export default function RegisterPage({ onSwitchMode, onHome }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', district: '', ward: '', farmName: '', farmSize: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'email', 'phone', 'password', 'district', 'ward'];
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="District *">
              <select value={form.district} onChange={update('district')} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '1px solid #2f4d3c', fontSize: 14, background: '#122916', color: '#e6f6ea' }}>
                <option value="">Select district</option>
                {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </Field>
            <Field label="Ward *"><Input value={form.ward} onChange={update('ward')} placeholder="Local ward" /></Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <Field label="Farm Name"><Input value={form.farmName} onChange={update('farmName')} placeholder="My Farm" /></Field>
            <Field label="Farm Size"><Input value={form.farmSize} onChange={update('farmSize')} placeholder="e.g. 2 ha" /></Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onSwitchMode('login')} style={{ background: 'transparent', border: 'none', color: '#2e7d32', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Back to login</button>
            <Button type="submit" disabled={loading} style={{ width: '100%', maxWidth: 220, textAlign: 'center' }}>{loading ? 'Creating...' : 'Create Account'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
