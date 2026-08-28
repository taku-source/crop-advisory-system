import React, { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields.');
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (email === 'admin@cropadvisory.zw' && password === 'Admin@1234') {
      onLogin({ name: 'System Admin', email });
    } else {
      setError('Invalid credentials. Try admin@cropadvisory.zw / Admin@1234');
    }
    setLoading(false);
  };

  const s = {
    page: { minHeight:'100vh', background:'#f6f8f6', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' },
    card: { background:'#fff', border:'1px solid #e2ebe2', borderRadius:20, padding:40, width:380, boxShadow:'0 8px 28px rgba(22,101,52,.08)' },
    logo: { display:'flex', alignItems:'center', gap:10, fontFamily:'Syne,sans-serif', fontSize:19, fontWeight:800, color:'#166534', marginBottom:24 },
    mark: { width:28, height:28, background:'#166534', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 },
    title: { fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:'#1a2e1a', marginBottom:4 },
    sub: { fontSize:13, color:'#888', marginBottom:24 },
    label: { display:'block', fontSize:10, fontFamily:'JetBrains Mono,monospace', color:'#666', textTransform:'uppercase', letterSpacing:.6, marginBottom:5 },
    input: { width:'100%', padding:'11px 13px', border:'1px solid #e2ebe2', borderRadius:9, fontSize:14, outline:'none', fontFamily:'Inter,sans-serif', background:'#f8fbf8', boxSizing:'border-box', marginBottom:14 },
    btn: { width:'100%', padding:12, background:'#166534', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Syne,sans-serif', opacity: loading ? .7 : 1 },
    error: { background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14 },
    hint: { marginTop:18, background:'#f8fbf8', border:'1px solid #e2ebe2', borderRadius:10, padding:14, fontSize:12, color:'#666' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}><img src="/logo.png" alt="Crop Advisory" style={{ width:28, height:28, objectFit:'contain' }} />Crop Advisory Admin</div>
        <div style={s.title}>Administrator Login</div>
        <div style={s.sub}>Sign in to manage the Crop Advisory system</div>
        <form onSubmit={handle}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@cropadvisory.zw" autoComplete="email" />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          {error && <div style={s.error}>⚠️ {error}</div>}
          <button type="submit" style={s.btn} disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>
        <div style={s.hint}>
          <strong>Demo credentials:</strong><br/>
          Email: <code style={{ background:'#dcfce7', padding:'1px 5px', borderRadius:4 }}>admin@cropadvisory.zw</code><br/>
          Password: <code style={{ background:'#dcfce7', padding:'1px 5px', borderRadius:4 }}>Admin@1234</code>
        </div>
      </div>
    </div>
  );
}
