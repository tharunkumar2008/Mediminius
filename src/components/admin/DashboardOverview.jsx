import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  AlertTriangle,
  ArrowRight,
  Package,
  FileText
} from 'lucide-react';

export default function DashboardOverview({ 
  metrics, 
  loading, 
  onNavigateToOrders, 
  onNavigateToInventory,
  onViewOrder
}) {
  if (loading && !metrics) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
        <p>Loading pharmacy dashboard metrics...</p>
      </div>
    );
  }

  const {
    totalOrders = 0,
    pendingOrders = 0,
    processingOrders = 0,
    completedOrders = 0,
    rejectedOrders = 0,
    totalRevenue = 0,
    lowStockCount = 0,
    rxOrdersCount = 0,
    lowStockProducts = [],
    recentOrders = []
  } = metrics || {};

  return (
    <div>
      {/* 5 Mandatory Metric Cards + Revenue & Low Stock */}
      <div className="metrics-grid">
        {/* Total Orders */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-title">Total Orders</span>
            <span className="metric-val">{totalOrders}</span>
            <span className="metric-sub">All-time customer orders</span>
          </div>
          <div className="metric-icon-box">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* New / Pending Orders */}
        <div className="metric-card warning">
          <div className="metric-info">
            <span className="metric-title">New / Pending</span>
            <span className="metric-val">{pendingOrders}</span>
            <span className="metric-sub" style={{ color: '#d97706' }}>Requires pharmacist action</span>
          </div>
          <div className="metric-icon-box">
            <Clock size={22} />
          </div>
        </div>

        {/* Processing Orders */}
        <div className="metric-card info">
          <div className="metric-info">
            <span className="metric-title">Processing</span>
            <span className="metric-val">{processingOrders}</span>
            <span className="metric-sub" style={{ color: '#0284c7' }}>Dispensing & In-transit</span>
          </div>
          <div className="metric-icon-box">
            <RefreshCw size={22} />
          </div>
        </div>

        {/* Completed / Delivered Orders */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-title">Completed</span>
            <span className="metric-val">{completedOrders}</span>
            <span className="metric-sub">Successfully delivered</span>
          </div>
          <div className="metric-icon-box">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Cancelled / Rejected Orders */}
        <div className="metric-card danger">
          <div className="metric-info">
            <span className="metric-title">Cancelled / Rejected</span>
            <span className="metric-val">{rejectedOrders}</span>
            <span className="metric-sub" style={{ color: '#ef4444' }}>Voided orders</span>
          </div>
          <div className="metric-icon-box">
            <XCircle size={22} />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="metric-card">
          <div className="metric-info">
            <span className="metric-title">Total Revenue</span>
            <span className="metric-val">₹{totalRevenue.toLocaleString()}</span>
            <span className="metric-sub">From fulfilled orders</span>
          </div>
          <div className="metric-icon-box">
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* Action Banners Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pending Orders Callout */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
        }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
              Pending Customer Orders ({pendingOrders})
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {pendingOrders > 0 
                ? 'Orders are waiting for pharmacist review and stock deduction.' 
                : 'All orders have been reviewed. No pending tasks.'}
            </p>
          </div>
          <button 
            onClick={() => onNavigateToOrders('pending')}
            className="btn-table-action primary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
          >
            Review Orders <ArrowRight size={14} />
          </button>
        </div>

        {/* Low Stock Warning Callout */}
        <div style={{
          backgroundColor: lowStockCount > 0 ? '#fffbeb' : '#ffffff',
          borderRadius: '12px',
          border: `1px solid ${lowStockCount > 0 ? '#fde68a' : '#e2e8f0'}`,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
        }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: lowStockCount > 0 ? '#b45309' : '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {lowStockCount > 0 && <AlertTriangle size={16} />}
              Low Stock Medicines ({lowStockCount})
            </h4>
            <p style={{ fontSize: '0.8rem', color: lowStockCount > 0 ? '#92400e' : '#64748b' }}>
              {lowStockCount > 0 
                ? `${lowStockCount} medicines have 10 or fewer units available.`
                : 'Inventory levels are healthy across all formulations.'}
            </p>
          </div>
          <button 
            onClick={onNavigateToInventory}
            className={`btn-table-action ${lowStockCount > 0 ? 'warning' : 'ghost'}`}
            style={{ 
              padding: '0.55rem 1rem', 
              fontSize: '0.82rem',
              backgroundColor: lowStockCount > 0 ? '#d97706' : '#f1f5f9',
              color: lowStockCount > 0 ? '#ffffff' : '#334155'
            }}
          >
            Manage Stock <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card-section">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <h3>Recent Customer Orders</h3>
            <p>Live stream of incoming orders from customer checkout</p>
          </div>
          <button 
            onClick={() => onNavigateToOrders('all')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f766e',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            View All Orders ({totalOrders}) <ArrowRight size={14} />
          </button>
        </div>

        <div className="admin-table-container">
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <ShoppingBag size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>No Customer Orders Yet</h4>
              <p style={{ fontSize: '0.82rem' }}>
                When customers place orders on the MEDIMINUS store, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: '#0f766e', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {order.orderNumber}
                      </strong>
                      {order.requiresRx && (
                        <div style={{ marginTop: '0.2rem' }}>
                          <span className="rx-badge">
                            <FileText size={10} /> Rx Required
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customerPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                        {order.items?.length || 0} medicine(s)
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.92rem', color: '#0f766e' }}>
                        ₹{order.totalAmount}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => onViewOrder(order)}
                        className="btn-table-action ghost"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
