import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  ThermometerSnowflake,
  FileText
} from 'lucide-react';

export default function OrderTrackingModal({ orderData, onClose }) {
  if (!orderData) return null;

  const [activeStep, setActiveStep] = useState(2); // Simulated at Pharmacist Dispensing stage

  const steps = [
    { title: 'Order Confirmed', time: '10:42 AM', desc: 'Prescription matched & digital bill generated' },
    { title: 'Pharmacist Verification & Dispensing', time: '10:48 AM', desc: 'Dr. Sarah Jenkins verified batch expiry & dosage' },
    { title: 'Cold-Chain Insulated Packing', time: 'In Progress', desc: 'Sealed inside temperature controlled 4°C pouch' },
    { title: 'Out for Express Delivery', time: 'Est. 12:15 PM', desc: 'Assigned to MediMinus Express Delivery Rider' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0' }}>
          <div className="modal-title-wrap">
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 style={{ color: '#064e3b' }}>Order Placed Successfully!</h3>
              <p style={{ fontSize: '0.78rem', color: '#047857' }}>
                Tracking ID: <strong>{orderData.orderId}</strong>
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Cold-chain highlight */}
          <div style={{
            backgroundColor: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
            color: '#0f766e'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ThermometerSnowflake size={18} />
              <span><strong>Cold-Chain Monitored:</strong> Packaging strictly maintained at 4.5°C</span>
            </div>
            <span style={{ fontWeight: '700', color: '#047857' }}>Active Sensor: OK</span>
          </div>

          {/* Stepper */}
          <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '1rem' }}>
            Live Dispensing Status
          </h4>

          <div style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
            {/* Vertical connector line */}
            <div style={{
              position: 'absolute',
              top: '10px',
              bottom: '15px',
              left: '7px',
              width: '2px',
              backgroundColor: '#e2e8f0'
            }}></div>

            {steps.map((st, idx) => {
              const isPast = idx < activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div key={idx} style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  {/* Step Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.5rem',
                    top: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: isPast ? '#059669' : isCurrent ? '#0d9488' : '#cbd5e1',
                    border: '3px solid #ffffff',
                    boxShadow: isCurrent ? '0 0 0 3px rgba(13, 148, 136, 0.3)' : 'none'
                  }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: '0.875rem', color: isPast || isCurrent ? '#0f172a' : '#94a3b8' }}>
                      {st.title}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: isCurrent ? '#0d9488' : '#64748b', fontWeight: isCurrent ? '700' : 'normal' }}>
                      {st.time}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.15rem' }}>
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Destination & Summary Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b' }}>Delivery Address:</span>
              <strong style={{ color: '#0f172a', textAlign: 'right', maxWidth: '300px' }}>{orderData.address}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b' }}>Medicines in Package:</span>
              <strong>{orderData.items.length} item(s)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: '700' }}>Total Paid:</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f766e' }}>₹{orderData.total}</strong>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '100%',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginTop: '1.25rem'
            }}
          >
            Done & Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
