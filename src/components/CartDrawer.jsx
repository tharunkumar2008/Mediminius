
import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ShieldCheck,
  FileText,
  ArrowRight,
  Tag,
  Truck,
  Sparkles
} from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  onCheckout,
  prescriptionUploaded
}) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  // Pricing calculations
  const mrpTotal = cartItems.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
  const itemTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const rawSavings = mrpTotal - itemTotal;

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon === 'MEDI15') {
    couponDiscount = Math.round(itemTotal * 0.15);
  }

  const deliveryFee = itemTotal > 499 || cartItems.length === 0 ? 0 : 49;
  const grandTotal = Math.max(0, itemTotal - couponDiscount + deliveryFee);
  const totalSavings = rawSavings + couponDiscount;

  // Check if any cart item requires prescription
  const hasRxItem = cartItems.some(item => item.requiresRx);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'MEDI15') {
      setAppliedCoupon('MEDI15');
      setCouponError('');
    } else {
      setCouponError('Invalid code. Try "MEDI15" for 15% off.');
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '8px',
              backgroundColor: '#f0fdfa',
              color: '#0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                Your Medicine Cart
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>

          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {cartItems.length > 0 && (
          <div style={{
            background: itemTotal >= 499 ? '#ecfdf5' : '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.65rem 1.5rem',
            fontSize: '0.78rem',
            color: itemTotal >= 499 ? '#047857' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Truck size={15} color={itemTotal >= 499 ? '#059669' : '#0f766e'} />
            {itemTotal >= 499 ? (
              <span><strong>Congratulations!</strong> You qualified for Free Cold-Chain Delivery!</span>
            ) : (
              <span>Add medicines worth <strong>₹{499 - itemTotal}</strong> more for Free Delivery</span>
            )}
          </div>
        )}

        {/* Rx Requirement Notice */}
        {hasRxItem && (
          <div style={{
            margin: '0.85rem 1.5rem 0',
            background: prescriptionUploaded ? '#ecfdf5' : '#fffbeb',
            border: `1px solid ${prescriptionUploaded ? '#a7f3d0' : '#fde68a'}`,
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.78rem',
            color: prescriptionUploaded ? '#065f46' : '#92400e',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <FileText size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong>{prescriptionUploaded ? 'Prescription Attached' : 'Prescription Required'}</strong>
              <p style={{ marginTop: '0.2rem' }}>
                {prescriptionUploaded
                  ? 'Doctor Rx is verified and attached to this dispensing order.'
                  : 'Your cart contains Rx items. You can attach a prescription at checkout.'}
              </p>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="cart-items-scroll">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-thumb" />

                <div className="cart-item-meta">
                  <h5>{item.name}</h5>
                  <p>{item.packSize}</p>
                  <div className="cart-item-price">
                    ₹{item.price * item.quantity}{' '}
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      ₹{item.mrp * item.quantity}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div className="qty-modifier" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <ShoppingBag size={52} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.4rem' }}>
                Your medicine cart is empty
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                Add prescription medications, syrups, or healthcare essentials to get started.
              </p>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-footer-summary">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Enter promo code (e.g. MEDI15)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  textTransform: 'uppercase'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div style={{ fontSize: '0.78rem', color: '#047857', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> Code {appliedCoupon} applied! 15% discount saved.
              </div>
            )}
            {couponError && (
              <div style={{ fontSize: '0.78rem', color: '#dc2626', marginBottom: '0.75rem' }}>
                {couponError}
              </div>
            )}

            {/* Price Rows */}
            <div className="summary-row">
              <span>Items Total (MRP):</span>
              <span>₹{mrpTotal}</span>
            </div>
            <div className="summary-row" style={{ color: '#059669' }}>
              <span>Pharmacy Savings:</span>
              <span>-₹{rawSavings}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row" style={{ color: '#059669' }}>
                <span>Coupon Discount (MEDI15):</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Delivery Charges:</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `₹${deliveryFee}`}</span>
            </div>

            <div className="summary-row total">
              <span>Total Payable:</span>
              <span>₹{grandTotal}</span>
            </div>

            {totalSavings > 0 && (
              <div style={{
                background: '#ecfdf5',
                color: '#065f46',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '700',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                🎉 You are saving ₹{totalSavings} on this medical order!
              </div>
            )}

            <button
              className="btn-checkout-primary"
              onClick={onCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
