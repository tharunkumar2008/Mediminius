import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle,
  Package,
  Layers
} from 'lucide-react';

export default function QuickViewModal({ product, onClose, addToCart, cartQty, updateQuantity }) {
  const [localQty, setLocalQty] = useState(cartQty > 0 ? cartQty : 1);

  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className={`badge-prescription ${product.requiresRx ? 'rx' : 'otc'}`} style={{ position: 'static' }}>
              {product.requiresRx ? 'Rx Required' : 'Over-the-Counter'}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Batch: {product.batchNo}</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '2rem' }}>
          {/* Image & Key Info */}
          <div>
            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '0.85rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#065f46',
              lineHeight: 1.4
            }}>
              <div style={{ fontWeight: '800', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Quality & Safety Assurance
              </div>
              WHO-GMP certified batch. Verified authentic barcode scanned at central dispensing facility.
            </div>
          </div>

          {/* Details */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#0d9488' }}>
              {product.brand}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0.25rem 0 0.5rem' }}>
              {product.name}
            </h3>

            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem', background: '#f1f5f9', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
              <strong>Salt Composition:</strong> {product.composition}
            </div>

            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
              {product.description}
            </p>

            {/* Clinical Indications & Dosage */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Layers size={16} color="#0f766e" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Recommended Usage:</strong> {product.dosage}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Package size={16} color="#0f766e" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Packaging / Size:</strong> {product.packSize}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Calendar size={16} color="#0f766e" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Shelf Life / Expiry:</strong> {product.expiry} ({product.storage})</span>
              </div>
            </div>

            {/* Price & Action */}
            <div style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f766e' }}>
                  ₹{product.price}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  MRP <span style={{ textDecoration: 'line-through' }}>₹{product.mrp}</span> ({product.discount})
                </div>
              </div>

              {/* Add to Cart button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {cartQty > 0 ? (
                  <div className="qty-modifier">
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(product.id, cartQty - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-val">{cartQty}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => updateQuantity(product.id, cartQty + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="btn-add-cart" 
                    onClick={() => {
                      addToCart(product);
                    }}
                    style={{ padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}
                  >
                    <Plus size={16} /> Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
