import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  FileCheck2, 
  Database, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLayout({ 
  currentTab, 
  setCurrentTab, 
  adminUser, 
  onLogout, 
  onBackToStore,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  rxOrdersCount = 0,
  children 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDbConnected = isSupabaseConfigured();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { 
      id: 'orders', 
      label: 'Order Management', 
      icon: <ShoppingBag size={18} />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null 
    },
    { 
      id: 'inventory', 
      label: 'Medicine Inventory', 
      icon: <Package size={18} />,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: '#f59e0b'
    },
    { 
      id: 'prescriptions', 
      label: 'Rx Verification Queue', 
      icon: <FileCheck2 size={18} />,
      badge: rxOrdersCount > 0 ? rxOrdersCount : null,
      badgeColor: '#ef4444'
    },
    { id: 'settings', label: 'Database & Settings', icon: <Database size={18} /> },
  ];

  return (
    <div className="admin-root">
      {/* Sidebar Overlay on Mobile */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90
          }}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <div className="admin-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" stroke="#ffffff" />
                <circle cx="18" cy="6" r="3" fill="#34d399" stroke="none" />
              </svg>
            </div>
            <div className="admin-brand-text">
              <h2>MEDI<span>MINUS</span></h2>
              <span className="admin-badge-portal">Admin Pharmacy Suite</span>
            </div>
          </div>
          {mobileOpen && (
            <button 
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileOpen(false);
              }}
              className={`admin-nav-item ${currentTab === item.id ? 'active' : ''}`}
            >
              <div className="admin-nav-left">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span 
                  className="admin-nav-badge"
                  style={{ backgroundColor: item.badgeColor || '#ef4444' }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {(adminUser?.email?.[0] || 'A').toUpperCase()}
            </div>
            <div className="admin-user-details">
              <span className="admin-user-email" title={adminUser?.email || 'admin@mediminus.com'}>
                {adminUser?.email || 'admin@mediminus.com'}
              </span>
              <span className="admin-user-role">Licensed Pharmacist</span>
            </div>
          </div>

          <button onClick={onLogout} className="btn-admin-logout">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrap">
        {/* Top bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <div className="admin-topbar-title">
              <h1>
                {currentTab === 'overview' && 'Dashboard Overview'}
                {currentTab === 'orders' && 'Customer Order Management'}
                {currentTab === 'inventory' && 'Medicine Stock & Inventory'}
                {currentTab === 'prescriptions' && 'Pharmacist Rx Verification Queue'}
                {currentTab === 'settings' && 'Database & System Settings'}
              </h1>
              <p>MEDIMINUS Central Pharmacy Operations System</p>
            </div>
          </div>

          <div className="admin-topbar-actions">
            {/* Database indicator */}
            <div className={`db-status-pill ${isDbConnected ? 'connected' : 'dev'}`} title={isDbConnected ? 'Connected to live Supabase Postgres' : 'Running in local dev database mode'}>
              <span className="db-pulse"></span>
              <span>{isDbConnected ? 'PostgreSQL Live' : 'Dev Storage Active'}</span>
            </div>

            {/* Back to Customer Store */}
            <button onClick={onBackToStore} className="btn-view-store">
              <span>Customer Store</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
