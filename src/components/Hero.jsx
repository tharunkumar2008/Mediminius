import React from 'react';
import { 
  Search, 
  UploadCloud, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Clock, 
  Award, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Hero({ setSearchQuery, openRxModal, setSelectedCategory }) {
  const quickSearches = [
    'Amlodipine', 
    'Cough Syrup', 
    'Derma Ointment', 
    'BP Monitor', 
    'First Aid', 
    'Azithromycin', 
    'Vitamin C'
  ];

  return (
    <section className="pharmacy-hero">
      <div className="med-container">
        <div className="hero-grid">
          {/* Left Column: Messaging & Search */}
          <div className="hero-content">
            <div className="hero-pill-badge">
              <CheckCircle2 size={16} />
              <span>Licensed Clinical Dispensing & Online Pharmacy</span>
            </div>

            <h1 className="hero-title">
              Your Trusted Pharmacy for <span className="gradient-text">Genuine Medicines</span> & Healthcare.
            </h1>

            <p className="hero-subtitle">
              Sourced directly from certified pharmaceutical manufacturers, verified by registered 
              pharmacists, and delivered in temperature-controlled packaging right to your door.
            </p>

            {/* Quick Medicine Search Card */}
            <div className="hero-search-card">
              <form 
                className="hero-search-form" 
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('products-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Search size={20} color="#0f766e" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Enter medicine name, active salt or health product..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn-search-main">
                  <span>Search Catalog</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick Pills */}
              <div className="hero-search-pills">
                <span>Frequently Ordered:</span>
                {quickSearches.map((term, i) => (
                  <button 
                    key={i} 
                    className="search-pill-btn"
                    onClick={() => {
                      setSearchQuery(term);
                      const el = document.getElementById('products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Indicators Strip */}
            <div className="hero-trust-row">
              <div className="trust-item">
                <div className="trust-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="trust-text-heading">100% Genuine</div>
                  <div className="trust-text-sub">Batch Verified Stock</div>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <ThermometerSnowflake size={20} />
                </div>
                <div>
                  <div className="trust-text-heading">Cold-Chain Assured</div>
                  <div className="trust-text-sub">Insulated 2°C - 8°C</div>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="trust-text-heading">Express Delivery</div>
                  <div className="trust-text-sub">Same Day Dispatch</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Real Pharmacy Dispensary */}
          <div className="hero-visual-card">
            <div className="hero-image-frame">
              <img 
                src="/images/hero-pharmacy.jpg" 
                alt="Mediminus Modern Pharmacy Dispensary" 
                className="hero-main-img"
              />

              {/* Temperature Badge */}
              <div className="floating-coldchain-badge">
                <ThermometerSnowflake size={16} color="#34d399" />
                <span>Cold-Chain Monitored: 4.2°C Active</span>
              </div>

              {/* Floating Prescription Card */}
              <div className="floating-rx-card">
                <div className="floating-rx-icon">
                  <UploadCloud size={24} />
                </div>
                <div className="floating-rx-info">
                  <h5>Have a Prescription?</h5>
                  <p>Upload doctor's slip. Our certified pharmacists will verify & prepare your order.</p>
                  <button 
                    onClick={openRxModal}
                    style={{
                      marginTop: '0.4rem',
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    Upload Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
