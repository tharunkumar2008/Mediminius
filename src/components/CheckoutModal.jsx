import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  ShieldCheck, 
  ThermometerSnowflake,
  Truck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { createOrder } from '../services/db';

export default function CheckoutModal({ 
  onClose, 
  cartItems, 
  onOrderSuccess,
  prescriptionUploaded
}) {
  const [formData, setFormData] = useState({
    name: 'Aarav Mehta',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Meadows, MG Road',
    city: 'Mumbai',
    pincode: '400001',
    deliveryType: 'express', // 'standard' or 'express'
    paymentMethod: 'upi' // 'upi', 'card', 'cod'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCost = formData.deliveryType === 'express' ? 40 : 0;
  const finalAmount = subtotal + deliveryCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const result = await createOrder({
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        items: cartItems,
        deliveryType: formData.deliveryType,
        paymentMethod: formData.paymentMethod,
        prescriptionInfo: prescriptionUploaded ? { verified: true, date: new Date().toISOString() } : null
      });

      if (result && result.success) {
        onOrderSuccess({
          orderId: result.orderNumber || result.orderId,
          items: cartItems,
          total: finalAmount,
          address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
          deliveryType: formData.deliveryType,
          status: 'pending'
        });
      }
    } catch (err) {
      console.error('[Checkout order creation failed]:', err);
      setErrorMessage(err.message || 'Could not complete order. Please check item stock and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={20} />
            </div>
            <div>
              <h3>Pharmacy Secure Checkout</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Temperature-Controlled Doorstep Delivery</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Delivery Details */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#0f766e" /> Delivery Destination
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input 
                  type="text" 
                  required
                  placeholder="Receiver's Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <input 
                  type="tel" 
                  required
                  placeholder="Mobile Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <input 
                type="text" 
                required
                placeholder="Complete Street Address, Flat / House No."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '0.75rem' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input 
                  type="text" 
                  required
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <input 
                  type="text" 
                  required
                  placeholder="PIN Code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Delivery Option */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                Delivery Speed & Packaging
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div 
                  onClick={() => setFormData({ ...formData, deliveryType: 'express' })}
                  style={{
                    border: `1.5px solid ${formData.deliveryType === 'express' ? '#0f766e' : '#e2e8f0'}`,
                    backgroundColor: formData.deliveryType === 'express' ? '#f0fdfa' : '#ffffff',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>⚡ Express Cold-Chain</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f766e' }}>+₹40</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Guaranteed within 2 Hours in Insulated Box</p>
                </div>

                <div 
                  onClick={() => setFormData({ ...formData, deliveryType: 'standard' })}
                  style={{
                    border: `1.5px solid ${formData.deliveryType === 'standard' ? '#0f766e' : '#e2e8f0'}`,
                    backgroundColor: formData.deliveryType === 'standard' ? '#f0fdfa' : '#ffffff',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>Standard Delivery</strong>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>FREE</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748b' }}>Delivered by Tomorrow, 11:00 AM</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                Select Payment Mode
              </h4>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { id: 'upi', label: 'UPI / QR / GPay', icon: <Smartphone size={16} /> },
                  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={16} /> },
                  { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={16} /> },
                ].map((pm) => (
                  <div 
                    key={pm.id}
                    onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                    style={{
                      flex: 1,
                      border: `1.5px solid ${formData.paymentMethod === pm.id ? '#0f766e' : '#e2e8f0'}`,
                      backgroundColor: formData.paymentMethod === pm.id ? '#f0fdfa' : '#ffffff',
                      padding: '0.75rem 0.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: formData.paymentMethod === pm.id ? '#0f766e' : '#475569',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {pm.icon}
                    <span>{pm.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Total and Place Order */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Payable:</span>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f766e' }}>₹{finalAmount}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> 256-Bit SSL Encrypted
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0f766e, #047857)',
                color: '#ffffff',
                border: 'none',
                padding: '0.9rem',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '1rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isProcessing ? 'Confirming with Pharmacy Server...' : `Confirm & Pay ₹${finalAmount}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
