import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Database, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { adminSignIn } from '../../services/db';
import { isSupabaseConfigured, setRuntimeSupabaseConfig } from '../../lib/supabase';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Quick Supabase credentials setup modal state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [setupFeedback, setSetupFeedback] = useState('');

  const isConfigured = isSupabaseConfigured();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await adminSignIn(email, password);
      onLoginSuccess(res.user);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setSetupFeedback('Both Supabase URL and Anon Key are required.');
      return;
    }

    try {
      setRuntimeSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
      setSetupFeedback('Supabase credentials saved successfully! Connecting...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setSetupFeedback('Error setting credentials: ' + err.message);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        {/* Back Link */}
        <button 
          onClick={onBackToStore}
          style={{
            background: 'none',
            border: 'none',
            color: '#0f766e',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '1rem',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to MEDIMINUS Store
        </button>

        {/* Brand Header */}
        <div className="admin-login-header">
          <div className="login-brand-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M2 12h20" stroke="#ffffff" />
              <circle cx="18" cy="6" r="3" fill="#34d399" stroke="none" />
            </svg>
          </div>
          <h2>MEDIMINUS Pharmacy</h2>
          <p>Restricted Staff & Admin Management Portal</p>
        </div>

        {/* Cloud Database Status Banner */}
        <div style={{
          backgroundColor: isConfigured ? '#ecfdf5' : '#fffbeb',
          border: `1px solid ${isConfigured ? '#a7f3d0' : '#fde68a'}`,
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1.25rem',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: isConfigured ? '#047857' : '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={16} />
            <span>
              {isConfigured ? (
                <strong>Live Supabase Cloud Connected</strong>
              ) : (
                <strong>Supabase Configuration Needed</strong>
              )}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setShowSetupModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: isConfigured ? '#0f766e' : '#b45309',
              fontWeight: '800',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isConfigured ? 'Settings' : 'Quick Setup'}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label className="login-label">Pharmacist / Admin Email</label>
            <div className="login-input-wrap">
              <Mail size={18} color="#64748b" />
              <input 
                type="email" 
                required
                className="login-input"
                placeholder="admin@mediminus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-label">Secure Access Key / Password</label>
            <div className="login-input-wrap">
              <Lock size={18} color="#64748b" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                className="login-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login-submit"
            disabled={loading}
          >
            <ShieldCheck size={18} />
            {loading ? 'Authenticating with Pharmacy Server...' : 'Authorize & Open Dashboard'}
          </button>
        </form>

        <div className="login-security-notice">
          <ShieldCheck size={15} />
          <span>256-Bit SSL Encrypted Pharmacy Management System</span>
        </div>
      </div>

      {/* Database Quick Setup Modal */}
      {showSetupModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowSetupModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#0f766e" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>Supabase Cloud Connection</h3>
              </div>
              <button 
                onClick={() => setShowSetupModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupabaseConfig}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  MEDIMINUS uses Supabase PostgreSQL for real-time order storage, pharmacist verification, and safe atomic stock updates. You can set credentials in <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>.env</code> or configure them here:
                </p>

                <div className="login-form-group">
                  <label className="login-label">Supabase Project URL</label>
                  <input 
                    type="url" 
                    required
                    placeholder="https://your-project-id.supabase.co"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div className="login-form-group">
                  <label className="login-label">Supabase Anon Public API Key</label>
                  <input 
                    type="text" 
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#475569'
                }}>
                  <strong>Tip for Pharmacy Owner:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '0.3rem' }}>
                    <li>Run the prepared <code style={{ color: '#0f766e', fontWeight: 'bold' }}>supabase_schema.sql</code> script in your Supabase SQL editor.</li>
                    <li>Create an admin user in Supabase Authentication &rarr; Users tab.</li>
                  </ol>
                </div>

                {setupFeedback && (
                  <div style={{ marginTop: '1rem', color: '#0f766e', fontWeight: '700', fontSize: '0.82rem' }}>
                    {setupFeedback}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '6px', border: 'none', background: '#0f766e', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
