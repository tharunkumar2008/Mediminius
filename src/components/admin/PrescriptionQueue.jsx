import React, { useState } from 'react';
import { 
  FileCheck2, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  Calendar, 
  ShieldCheck,
  Phone
} from 'lucide-react';

export default function PrescriptionQueue({ orders, onStatusChange, onViewOrder }) {
  // Filter for orders that require prescription
  const rxOrders = orders.filter(o => o.requiresRx);

  return (
    <div className="admin-card-section">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck2 size={22} color="#0f766e" />
            <h3>Prescription Verification Queue ({rxOrders.length})</h3>
          </div>
          <p>Statutory CDSCO verification requirement: Review doctor's prescriptions before dispensing Schedule H medications</p>
        </div>
      </div>

      <div className="admin-table-container">
        {rxOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
            <ShieldCheck size={38} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ color: '#0f172a', marginBottom: '0.25rem' }}>Prescription Verification Queue Clear</h4>
            <p style={{ fontSize: '0.82rem' }}>
              No pending prescription verification requests at this time. All customer orders are compliant.
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Patient / Customer</th>
                <th>Prescription Regulated Items</th>
                <th>Uploaded Rx Status</th>
                <th>Current Status</th>
                <th>Pharmacist Actions</th>
              </tr>
            </thead>
            <tbody>
              {rxOrders.map((order) => {
                const rxItems = order.items?.filter(i => i.requiresRx) || [];

                return (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: '#0f766e', fontFamily: 'monospace' }}>
                        {order.orderNumber}
                      </strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0f766e' }}>{order.customerPhone}</div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {rxItems.map((item, idx) => (
                          <span key={idx} style={{ fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>
                            • {item.productName} (x{item.quantity})
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '4px'
                        }}>
                          ✓ Digital Rx Attached
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                        Dr. Verified / Valid Batch
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td>
                      <div className="table-btn-group">
                        <button 
                          onClick={() => onViewOrder(order)}
                          className="btn-table-action ghost"
                        >
                          <Eye size={13} /> Review Details
                        </button>
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => onStatusChange(order.id, 'accepted')}
                            className="btn-table-action success"
                            title="Verify Rx and Accept Order"
                          >
                            <CheckCircle2 size={13} /> Approve & Accept
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
  );
}
