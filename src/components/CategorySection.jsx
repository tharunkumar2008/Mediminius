import React from 'react';
import { 
  Pill, 
  FlaskConical, 
  Pipette, 
  BriefcaseMedical, 
  Activity, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PHARMACY_CATEGORIES } from '../data/products';

export default function CategorySection({ selectedCategory, setSelectedCategory }) {
  const getIcon = (id) => {
    switch (id) {
      case 'tablets': return <Pill size={28} />;
      case 'syrups': return <FlaskConical size={28} />;
      case 'ointments': return <Pipette size={28} />;
      case 'firstaid': return <BriefcaseMedical size={28} />;
      case 'devices': return <Activity size={28} />;
      case 'wellness': return <ShieldCheck size={28} />;
      default: return <Sparkles size={28} />;
    }
  };

  // Only display specific medical categories (excluding 'all' for cards)
  const displayCategories = PHARMACY_CATEGORIES.filter(c => c.id !== 'all');

  return (
    <section className="categories-section">
      <div className="med-container">
        <div className="section-header">
          <div>
            <div className="section-label">
              <Sparkles size={14} />
              <span>Certified Healthcare Categories</span>
            </div>
            <h2 className="section-title">Shop by Medical Department</h2>
            <p className="section-subtitle">
              Browse pharmaceutical formulations, first aid requisites and clinical diagnostic devices
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')}
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: '#0f766e',
                cursor: 'pointer'
              }}
            >
              Reset to All ({PHARMACY_CATEGORIES[0].count} items)
            </button>
          )}
        </div>

        <div className="category-grid">
          {displayCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div 
                key={cat.id} 
                className={`category-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="category-icon-box">
                  {getIcon(cat.id)}
                </div>
                <h4 className="category-name">{cat.name}</h4>
                <span className="category-count">{cat.count} verified medicines</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
