import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  Server,
  FileCode
} from 'lucide-react';
import { getSupabaseConfig, setRuntimeSupabaseConfig, clearRuntimeSupabaseConfig } from '../../lib/supabase';
import { fetchProducts } from '../../services/db';

export default function DatabaseSettings() {
  const config = getSupabaseConfig();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Runtime config form
  const [urlInput, setUrlInput] = useState(config.url || '');
  const [keyInput, setKeyInput] = useState(config.key || '');
  const [saveStatus, setSaveStatus] = useState('');

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const startTime = performance.now();
      const prods = await fetchProducts();
      const latency = Math.round(performance.now() - startTime);

      setTestResult({
        success: true,
        message: `Database ping successful! Retrieved ${prods.length} products with ${latency}ms latency.`,
        isRealSupabase: config.isConfigured
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Connection test failed: ' + (err.message || 'Unknown database error')
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveRuntimeConfig = (e) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setSaveStatus('Please enter both Supabase URL and Anon Key');
      return;
    }
    setRuntimeSupabaseConfig(urlInput, keyInput);
    setSaveStatus('Supabase credentials saved! Reloading application...');
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const handleResetDevStorage = () => {
    if (window.confirm('Reset local development orders and products cache?')) {
      clearRuntimeSupabaseConfig();
      localStorage.removeItem('mediminus_dev_orders');
      localStorage.removeItem('mediminus_dev_products');
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: '920px' }}>
      {/* Current Connection Status */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={20} color="#0f766e" />
              <h3>Database & Cloud Infrastructure Status</h3>
            </div>
            <p>PostgreSQL connection state and Row Level Security validation</p>
          </div>
          <button 
            onClick={testConnection}
            disabled={testing}
            className="btn-table-action primary"
            style={{ padding: '0.45rem 1rem' }}
          >
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {testing ? 'Pinging Database...' : 'Run Diagnostics'}
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                Postgres Database Status
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: config.isConfigured ? '#047857' : '#b45309', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {config.isConfigured ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {config.isConfigured ? 'Live Supabase Cloud' : 'Local Dev Persistent Mode'}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                Database URL Configured
              </span>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {config.url ? config.url : 'Not set in .env (VITE_SUPABASE_URL)'}
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                Public Anon API Key
              </span>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', marginTop: '0.25rem' }}>
                {config.key ? '••••••••••••••••••••••••••••••••' : 'Not set (VITE_SUPABASE_ANON_KEY)'}
              </div>
            </div>
          </div>

          {testResult && (
            <div style={{
              backgroundColor: testResult.success ? '#ecfdf5' : '#fee2e2',
              border: `1px solid ${testResult.success ? '#a7f3d0' : '#fca5a5'}`,
              color: testResult.success ? '#065f46' : '#991b1b',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              {testResult.success ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              <div>
                <strong>{testResult.success ? 'Diagnostic Passed: ' : 'Diagnostic Warning: '}</strong>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Owner Setup Instructions Guide */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={20} color="#0f766e" />
              <h3>Pharmacy Owner Deployment & Account Setup Guide</h3>
            </div>
            <p>Mandatory steps to connect your production Supabase database</p>
          </div>
        </div>

        <div style={{ padding: '1.5rem', fontSize: '0.86rem', color: '#334155' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                flexShrink: 0
              }}>1</div>
              <div>
                <strong style={{ color: '#0f172a' }}>Create your free Supabase project</strong>
                <p style={{ color: '#64748b', marginTop: '0.15rem' }}>
                  Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#0f766e', fontWeight: 'bold' }}>supabase.com</a>, create an organization, and launch a new database project named <code>mediminus-pharmacy</code>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                flexShrink: 0
              }}>2</div>
              <div>
                <strong style={{ color: '#0f172a' }}>Execute the Database Schema & Safe Stock Decrement Stored Procedure</strong>
                <p style={{ color: '#64748b', marginTop: '0.15rem' }}>
                  In your Supabase project, click on <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>. Copy the complete SQL script from <code style={{ color: '#0f766e' }}>supabase_schema.sql</code> (located in your workspace root) and click <strong>Run</strong>. This creates the <code>products</code>, <code>orders</code>, <code>order_items</code> tables, RLS security policies, and atomic stock reducer.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                flexShrink: 0
              }}>3</div>
              <div>
                <strong style={{ color: '#0f172a' }}>Configure Environment Variables (.env)</strong>
                <p style={{ color: '#64748b', marginTop: '0.15rem' }}>
                  In Supabase, navigate to <strong>Project Settings</strong> &rarr; <strong>API</strong>. Copy your <strong>Project URL</strong> and <strong>anon/public Key</strong> into your project's <code>.env</code> file:
                </p>
                <pre style={{
                  backgroundColor: '#0f172a',
                  color: '#34d399',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                  fontFamily: 'monospace'
                }}>
                  VITE_SUPABASE_URL=https://your-project-id.supabase.co{'\n'}
                  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                flexShrink: 0
              }}>4</div>
              <div>
                <strong style={{ color: '#0f172a' }}>Register Authorized Pharmacy Admins</strong>
                <p style={{ color: '#64748b', marginTop: '0.15rem' }}>
                  In Supabase, navigate to <strong>Authentication</strong> &rarr; <strong>Users</strong> &rarr; <strong>Add User</strong> &rarr; <strong>Create User</strong>. Enter the pharmacist's email (e.g. <code>admin@mediminus.com</code>) and secure password.
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#0f766e'
          }}>
            <ShieldCheck size={18} />
            <span>
              <strong>Security Guarantee:</strong> The frontend only requires the public Anon Key with strict Row Level Security (RLS) enforcement. Secret service-role keys are never exposed in frontend code.
            </span>
          </div>
        </div>
      </div>

      {/* Instant Runtime Key Tester / Switcher */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={18} color="#0f766e" />
              <h3>Instant Cloud Connection Switcher</h3>
            </div>
            <p>Test or update your Supabase keys directly from the dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSaveRuntimeConfig} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="login-label">Supabase URL</label>
            <input 
              type="url" 
              required
              placeholder="https://xyzcompany.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="login-label">Supabase Anon Public Key</label>
            <input 
              type="text" 
              required
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          {saveStatus && (
            <div style={{ color: '#0f766e', fontWeight: '700', fontSize: '0.85rem', marginBottom: '1rem' }}>
              ✓ {saveStatus}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              type="button" 
              onClick={handleResetDevStorage}
              className="btn-table-action danger"
            >
              Reset Local Storage
            </button>

            <button 
              type="submit" 
              className="btn-table-action primary"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
            >
              Apply Credentials & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
