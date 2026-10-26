import React from 'react';
import { 
  Plus, 
  Search, 
  ShoppingBag, 
  FileText, 
  PhoneCall, 
  ShieldCheck, 
  User, 
  Heart, 
  Clock, 
  Truck
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  openCart, 
  openRxModal, 
  openChatModal,
  selectedCategory,
  setSelectedCategory,
  onOpenAdmin
}) {
  return (
    <header className="navbar-wrapper">
      {/* Top Clinical Announcement Bar */}
      <div className="top-bar">
        <div className="med-container top-bar-inner">
          <div className="top-bar-badge">
            <span className="pulse-dot"></span>
            <span>Licensed Pharmacy Reg: MH-TZ4-88921 | CDSCO & WHO-GMP Compliant</span>
          </div>

          <div className="top-bar-links">
            <span className="top-bar-link">
              <Truck size={14} /> Free Cold-Chain Delivery above ₹499
            </span>
            <span className="top-bar-link">
              <Clock size={14} /> 24x7 Pharmacist Helpline: <strong>1800-419-MEDI</strong>
            </span>
            <span className="top-bar-link" style={{ color: '#34d399', fontWeight: '700' }}>
              ✓ 100% Genuine Medicine Guarantee
            </span>
            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: '0.5rem'
                }}
                title="Restricted Staff & Admin Management Portal"
              >
                <ShieldCheck size={12} /> Staff Portal
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav className="navbar">
        <div className="med-container navbar-main">
          {/* Logo with Medical Cross / Capsule */}
          <div className="brand-logo" onClick={() => setSelectedCategory('all')}>
            <div className="brand-icon-wrapper">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                {/* Clinical Cross inside Capsule */}
                <path d="M12 2v20M2 12h20" stroke="#ffffff" />
                <circle cx="18" cy="6" r="3" fill="#34d399" stroke="none" />
              </svg>
            </div>
            <div>
              <div className="brand-name">
                MEDI<span>MINUS</span>
              </div>
              <div className="brand-tagline">
                <span>PHARMACY & HEALTHCARE</span>
              </div>
            </div>
          </div>

          {/* Central Medicine Search */}
          <div className="nav-search-container">
            <div className="nav-search-box">
              <Search size={18} className="nav-search-icon" />
              <input 
                type="text" 
                className="nav-search-input"
                placeholder="Search medicines, salts, syrups, devices (e.g. Paracetamol, Omron)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 6px' }}
                >
                  ✕
                </button>
              )}
              <button className="nav-search-btn">
                <span>Find Medicine</span>
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="nav-actions">
            {/* Upload Prescription Button */}
            <button className="btn-upload-rx" onClick={openRxModal} title="Upload Doctor's Prescription">
              <FileText size={16} />
              <span>Upload Rx</span>
            </button>

            {/* Consult Pharmacist */}
            <button className="btn-pharmacist-chat" onClick={openChatModal}>
              <PhoneCall size={15} />
              <span>Ask Pharmacist</span>
            </button>

            {/* Cart Trigger */}
            <button className="nav-cart-btn" onClick={openCart} id="cart-button">
              <ShoppingBag size={18} />
              <span>Cart</span>
              <span className="cart-counter">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Quick Category Strip */}
        <div className="nav-subbar">
          <div className="med-container">
            <ul className="nav-categories-list">
              {[
                { id: 'all', label: 'All Catalog' },
                { id: 'tablets', label: 'Tablets & Capsules' },
                { id: 'syrups', label: 'Syrups & Liquids' },
                { id: 'ointments', label: 'Ointments & Creams' },
                { id: 'firstaid', label: 'First Aid & Surgical' },
                { id: 'devices', label: 'Medical Devices' },
                { id: 'wellness', label: 'Vitamins & Wellness' },
              ].map((item) => (
                <li key={item.id}>
                  <button 
                    className={`nav-cat-item ${selectedCategory === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(item.id);
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ background: 'none', border: 'none' }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li style={{ marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Doctor Verified Inventory
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
