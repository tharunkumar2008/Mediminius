import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Plus, 
  Minus, 
  Check, 
  Star, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { PHARMACY_PRODUCTS } from '../data/products';

export default function ProductCatalogue({ 
  products = PHARMACY_PRODUCTS,
  searchQuery, 
  selectedCategory, 
  cartItems, 
  addToCart, 
  updateQuantity, 
  openQuickView 
}) {
  const [rxFilter, setRxFilter] = useState('all'); // 'all', 'otc', 'rx'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Must be active
      if (item.isActive === false) return false;

      // Category Match
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Rx Filter Match
      const matchesRx = 
        rxFilter === 'all' || 
        (rxFilter === 'rx' && item.requiresRx) || 
        (rxFilter === 'otc' && !item.requiresRx);

      // Search Query Match (searches name, composition, brand, category)
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q || 
        item.name.toLowerCase().includes(q) || 
        item.composition.toLowerCase().includes(q) || 
        item.brand.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesRx && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  }, [selectedCategory, rxFilter, searchQuery, sortBy]);

  // Helper for item cart quantity
  const getItemQty = (productId) => {
    const found = cartItems.find(item => item.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <section className="catalogue-section" id="products-section">
      <div className="med-container">
        {/* Section Header */}
        <div className="section-header">
          <div>
            <div className="section-label">
              <span>Verified Medicine Catalogue</span>
            </div>
            <h2 className="section-title">Pharmaceutical Formulations & Supplies</h2>
            <p className="section-subtitle">
              Showing {filteredProducts.length} verified medications & health products in stock
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            <span>All products are genuine sample demo inventory</span>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="catalogue-toolbar">
          {/* Rx / OTC Filter Chips */}
          <div className="catalogue-filter-chips">
            <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#0f172a', marginRight: '0.25rem' }}>
              Filter:
            </span>
            <button 
              className={`filter-chip ${rxFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRxFilter('all')}
            >
              All Formulations
            </button>
            <button 
              className={`filter-chip ${rxFilter === 'otc' ? 'active' : ''}`}
              onClick={() => setRxFilter('otc')}
            >
              Over-The-Counter (No Rx)
            </button>
            <button 
              className={`filter-chip ${rxFilter === 'rx' ? 'active' : ''}`}
              onClick={() => setRxFilter('rx')}
            >
              Prescription Required (Rx)
            </button>
          </div>

          {/* Sort Selector */}
          <div className="catalogue-sort-container">
            <SlidersHorizontal size={15} color="#64748b" />
            <span className="sort-label">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="featured">Featured / Therapeutic Importance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const qty = getItemQty(product.id);
              return (
                <div key={product.id} className="pharmacy-card">
                  {/* Card Media Wrap */}
                  <div className="card-media-wrap">
                    {/* Prescription Tag */}
                    <span className={`badge-prescription ${product.requiresRx ? 'rx' : 'otc'}`}>
                      {product.requiresRx ? (
                        <>
                          <FileText size={11} /> Rx Required
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={11} /> OTC Medicine
                        </>
                      )}
                    </span>

                    {/* Discount Badge */}
                    <span className="badge-discount">{product.discount}</span>

                    {/* Medicine Photo */}
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="product-img"
                      loading="lazy"
                    />

                    {/* Quick View Button */}
                    <button 
                      className="btn-quick-view"
                      onClick={() => openQuickView(product)}
                    >
                      <Eye size={13} /> Quick Clinical View
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    <span className="card-category-tag">{product.categoryLabel}</span>
                    <h3 className="card-title" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="card-salt-comp" title={product.composition}>
                      {product.composition}
                    </p>
                    <span className="card-pack-info">{product.packSize}</span>

                    {/* Rating */}
                    <div className="card-rating-row">
                      <div className="stars-group">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill="#f59e0b" stroke="#f59e0b" />
                        ))}
                      </div>
                      <span className="rating-score">{product.rating}</span>
                      <span className="rating-count">({product.reviews})</span>
                    </div>

                    {/* Pricing & Cart Action */}
                    <div className="card-footer">
                      <div className="price-box">
                        <span className="current-price">₹{product.price}</span>
                        <div className="mrp-row">
                          <span className="mrp-price">₹{product.mrp}</span>
                          <span className="stock-tag">
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                            In Stock
                          </span>
                        </div>
                      </div>

                      {/* Add or Qty Modifier or Out of Stock */}
                      {(product.stockCount <= 0 || product.inStock === false) ? (
                        <button 
                          className="btn-add-cart" 
                          disabled
                          style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #cbd5e1', cursor: 'not-allowed' }}
                        >
                          Out of Stock
                        </button>
                      ) : qty === 0 ? (
                        <button 
                          className="btn-add-cart" 
                          onClick={() => addToCart(product)}
                        >
                          <Plus size={14} /> Add
                        </button>
                      ) : (
                        <div className="qty-modifier">
                          <button 
                            className="qty-btn" 
                            onClick={() => updateQuantity(product.id, qty - 1)}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-val">{qty}</span>
                          <button 
                            className="qty-btn" 
                            onClick={() => updateQuantity(product.id, qty + 1)}
                            disabled={qty >= product.stockCount}
                            title={qty >= product.stockCount ? `Only ${product.stockCount} in stock` : 'Add one more'}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1'
          }}>
            <AlertCircle size={48} color="#0f766e" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              No medications found matching "{searchQuery}"
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try searching with generic salt names (e.g. Amlodipine, Guaifenesin) or reset your filter.
            </p>
            <button 
              onClick={() => {
                setRxFilter('all');
                // clear query
              }}
              style={{
                backgroundColor: '#0f766e',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
