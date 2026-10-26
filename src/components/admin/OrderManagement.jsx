import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  Truck, 
  PackageCheck, 
  AlertTriangle,
  FileText,
  MapPin,
  Phone,
  User,
  CreditCard,
  ThermometerSnowflake,
  ArrowRight,
  ShieldAlert,
  X,
  RefreshCw
} from 'lucide-react';

export default function OrderManagement({ 
  orders, 
  loading, 
  onRefresh, 
  onStatusChange, 
  activeFilter = 'all',
  selectedOrderForModal = null,
  setSelectedOrderForModal
}) {
  const [statusFilter, setStatusFilter] = useState(activeFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalOrder, setActiveModalOrder] = useState(selectedOrderForModal);
  const [confirmAcceptOrder, setConfirmAcceptOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState('');

  // Synchronize modal state if opened from parent
  React.useEffect(() => {
    if (selectedOrderForModal) {
      setActiveModalOrder(selectedOrderForModal);
    }
  }, [selectedOrderForModal]);

  const handleCloseModal = () => {
    setActiveModalOrder(null);
    if (setSelectedOrderForModal) setSelectedOrderForModal(null);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === 'all' || o.status === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
      (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // Handle status update
  const handleUpdateStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    setActionError('');
    try {
      await onStatusChange(orderId, newStatus);
      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder(prev => ({ ...prev, status: newStatus }));
      }
      setConfirmAcceptOrder(null);
    } catch (err) {
      setActionError(err.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return { next: 'accepted', label: 'Accept & Decrement Stock' };
      case 'accepted': return { next: 'processing', label: 'Move to Processing' };
      case 'processing': return { next: 'out_for_delivery', label: 'Handover to Delivery' };
      case 'out_for_delivery': return { next: 'delivered', label: 'Mark as Delivered' };
      default: return null;
    }
  };

  return (
    <div>
      {/* Top Card & Toolbar */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <h3>Customer Orders ({orders.length})</h3>
            <p>Real-time order stream, stock reduction, and prescription fulfillment</p>
          </div>
          <button 
            onClick={onRefresh}
            className="btn-table-action ghost"
            style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            disabled={loading}
          >
            {loading && <RefreshCw size={13} className="animate-spin" />}
            <span>{loading ? 'Refreshing...' : 'Refresh Database Orders'}</span>
          </button>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search-wrap">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="status-filter-pills">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'processing', label: 'Processing' },
              { id: 'out_for_delivery', label: 'Out for Delivery' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'rejected', label: 'Rejected' },
            ].map((f) => {
              const count = f.id === 'all' 
                ? orders.length 
                : orders.filter(o => o.status === f.id).length;

              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`status-pill-btn ${statusFilter === f.id ? 'active' : ''}`}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {actionError && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            padding: '0.75rem 1.5rem',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={18} />
            <span>{actionError}</span>
          </div>
        )}

        {/* Orders Table */}
        <div className="admin-table-container">
          {loading && orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Clock size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <p>Fetching orders from database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <PackageCheck size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>No orders matching filter</h4>
              <p style={{ fontSize: '0.82rem' }}>
                {searchTerm ? 'Try adjusting your search criteria.' : 'No orders found in this category.'}
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer & Mobile</th>
                  <th>Order Date</th>
                  <th>Medicines & Qty</th>
                  <th>Delivery Address</th>
                  <th>Order Total</th>
                  <th>Status</th>
                  <th>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const nextAction = getNextStatus(order.status);

                  return (
                    <tr key={order.id}>
                      {/* Order ID */}
                      <td>
                        <strong style={{ color: '#0f766e', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                          {order.orderNumber}
                        </strong>
                        {order.requiresRx && (
                          <div style={{ marginTop: '0.25rem' }}>
                            <span className="rx-badge">
                              <FileText size={10} /> Rx Required
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#0f766e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Phone size={11} /> {order.customerPhone}
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#1e293b' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                          {order.items?.length || 0} item(s)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '200px', lineHeight: '1.3' }}>
                          <MapPin size={12} color="#0f766e" style={{ display: 'inline', marginRight: '3px' }} />
                          {order.deliveryAddress}
                        </div>
                      </td>

                      {/* Total */}
                      <td>
                        <strong style={{ fontSize: '0.98rem', color: '#0f766e' }}>
                          ₹{order.totalAmount}
                        </strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>
                          {order.paymentMethod}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="table-btn-group">
                          {/* Details Button */}
                          <button 
                            onClick={() => setActiveModalOrder(order)}
                            className="btn-table-action ghost"
                            title="View Full Order Details"
                          >
                            <Eye size={13} /> View
                          </button>

                          {/* Pending Actions: Accept or Reject */}
                          {order.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => setConfirmAcceptOrder(order)}
                                className="btn-table-action success"
                                title="Accept order and safely deduct medicine stock"
                              >
                                <CheckCircle2 size={13} /> Accept
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(order.id, 'rejected')}
                                className="btn-table-action danger"
                                title="Reject order"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}

                          {/* Progression Actions for non-pending */}
                          {order.status !== 'pending' && order.status !== 'delivered' && order.status !== 'rejected' && nextAction && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, nextAction.next)}
                              className="btn-table-action primary"
                              title={`Advance status to ${nextAction.next}`}
                              disabled={isUpdating}
                            >
                              <ArrowRight size={13} /> {nextAction.label}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ==============================================================================
          CONFIRM ACCEPT ORDER MODAL (Crucial Requirement: stock reduction explanation)
          ============================================================================== */}
      {confirmAcceptOrder && (
        <div className="admin-modal-backdrop" onClick={() => setConfirmAcceptOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header" style={{ backgroundColor: '#ecfdf5', borderBottomColor: '#a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={22} color="#047857" />
                <h3 style={{ color: '#064e3b' }}>Confirm Order Acceptance</h3>
              </div>
              <button onClick={() => setConfirmAcceptOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <p style={{ fontSize: '0.88rem', color: '#1e293b', marginBottom: '1rem' }}>
                You are about to accept order <strong>{confirmAcceptOrder.orderNumber}</strong> for customer <strong>{confirmAcceptOrder.customerName}</strong>.
              </p>

              <div style={{
                backgroundColor: '#f0fdfa',
                border: '1px solid #99f6e4',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                color: '#0f766e'
              }}>
                <strong>Safe Stock Reduction Action:</strong>
                <p style={{ marginTop: '0.25rem', color: '#065f46' }}>
                  The inventory stock for the following medicines will be atomically reduced in the database immediately upon confirmation:
                </p>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                  {confirmAcceptOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.productName}</strong>: Deducting <strong>{item.quantity}</strong> unit(s)
                    </li>
                  ))}
                </ul>
              </div>

              {confirmAcceptOrder.requiresRx && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  color: '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <ShieldAlert size={18} />
                  <span>Pharmacist verification: This order contains prescription-regulated drugs. Please ensure patient prescription matches dosage.</span>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button 
                onClick={() => setConfirmAcceptOrder(null)}
                className="btn-table-action ghost"
                style={{ padding: '0.65rem 1.25rem' }}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdateStatus(confirmAcceptOrder.id, 'accepted')}
                className="btn-table-action success"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
                disabled={isUpdating}
              >
                {isUpdating ? 'Decreasing Stock in Database...' : 'Confirm & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          DETAILED ORDER MODAL
          ============================================================================== */}
      {activeModalOrder && (
        <div className="admin-modal-backdrop" onClick={handleCloseModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                  Order Details: <span style={{ color: '#0f766e', fontFamily: 'monospace' }}>{activeModalOrder.orderNumber}</span>
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Placed on {new Date(activeModalOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Status Header Strip */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Status:</span>
                  <div style={{ marginTop: '0.2rem' }}>
                    <span className={`status-badge ${activeModalOrder.status}`}>
                      {activeModalOrder.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Status Transition Control inside Modal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {activeModalOrder.status === 'pending' && (
                    <button 
                      onClick={() => setConfirmAcceptOrder(activeModalOrder)}
                      className="btn-table-action success"
                    >
                      <CheckCircle2 size={14} /> Accept Order
                    </button>
                  )}
                  {activeModalOrder.status === 'accepted' && (
                    <button 
                      onClick={() => handleUpdateStatus(activeModalOrder.id, 'processing')}
                      className="btn-table-action primary"
                    >
                      Move to Processing &rarr;
                    </button>
                  )}
                  {activeModalOrder.status === 'processing' && (
                    <button 
                      onClick={() => handleUpdateStatus(activeModalOrder.id, 'out_for_delivery')}
                      className="btn-table-action primary"
                    >
                      Out for Delivery &rarr;
                    </button>
                  )}
                  {activeModalOrder.status === 'out_for_delivery' && (
                    <button 
                      onClick={() => handleUpdateStatus(activeModalOrder.id, 'delivered')}
                      className="btn-table-action success"
                    >
                      Mark as Delivered ✓
                    </button>
                  )}
                </div>
              </div>

              {/* Customer and Delivery Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Customer */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={14} /> Customer Details
                  </h4>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{activeModalOrder.customerName}</div>
                  <div style={{ fontSize: '0.82rem', color: '#0f766e', marginTop: '0.2rem' }}>{activeModalOrder.customerPhone}</div>
                </div>

                {/* Delivery */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} /> Delivery Destination
                  </h4>
                  <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>{activeModalOrder.deliveryAddress}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ThermometerSnowflake size={12} /> {activeModalOrder.deliveryType === 'express' ? '2-Hour Cold Chain Express' : 'Standard Delivery'}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <h4 style={{ fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                Prescribed / Ordered Medicines ({activeModalOrder.items?.length || 0})
              </h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Medicine Name</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Price</th>
                      <th style={{ padding: '0.65rem 0.85rem' }}>Qty</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeModalOrder.items?.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 0.85rem' }}>
                          <strong style={{ color: '#0f172a' }}>{item.productName}</strong>
                          {item.requiresRx && (
                            <span className="rx-badge" style={{ marginLeft: '0.5rem' }}>Rx</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 0.85rem', color: '#64748b' }}>₹{item.price}</td>
                        <td style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>x{item.quantity}</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: '700', color: '#0f766e' }}>
                          ₹{item.subtotal || item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1rem', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Medicines Subtotal:</span>
                  <span>₹{activeModalOrder.subtotal || (activeModalOrder.totalAmount - (activeModalOrder.deliveryCost || 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Insulated Cold-Chain Delivery:</span>
                  <span>{activeModalOrder.deliveryCost ? `₹${activeModalOrder.deliveryCost}` : 'FREE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <strong style={{ fontSize: '0.95rem' }}>Order Total:</strong>
                  <strong style={{ fontSize: '1.1rem', color: '#0f766e' }}>₹{activeModalOrder.totalAmount}</strong>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                onClick={handleCloseModal}
                className="btn-table-action ghost"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
