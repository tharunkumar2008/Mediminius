import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Power, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Package, 
  X, 
  Save, 
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { PHARMACY_CATEGORIES } from '../../data/products';

export default function InventoryManagement({ 
  products, 
  loading, 
  onRefresh, 
  onUpdateProduct, 
  onCreateProduct, 
  onToggleStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Add Product Form State
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'tablets',
    categoryLabel: 'Tablets & Capsules',
    composition: '',
    brand: '',
    mrp: '',
    price: '',
    stockCount: 50,
    packSize: 'Pack of 10 Tablets',
    requiresRx: false,
    badge: 'General Healthcare',
    description: '',
    dosage: '',
    storage: 'Store below 25°C in dry place',
    expiry: '12/2027',
    batchNo: `MM-${Math.floor(1000 + Math.random() * 9000)}`
  });

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      p.name.toLowerCase().includes(q) ||
      (p.composition && p.composition.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onUpdateProduct(editingProduct.id, {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        mrp: Number(editingProduct.mrp),
        stockCount: Number(editingProduct.stockCount),
        category: editingProduct.category,
        composition: editingProduct.composition,
        brand: editingProduct.brand,
        requiresRx: editingProduct.requiresRx,
        dosage: editingProduct.dosage,
        expiry: editingProduct.expiry,
        batchNo: editingProduct.batchNo
      });
      setFeedbackMsg(`Successfully updated ${editingProduct.name}`);
      setEditingProduct(null);
    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreateProduct({
        ...newProductForm,
        price: Number(newProductForm.price),
        mrp: Number(newProductForm.mrp || newProductForm.price),
        stockCount: Number(newProductForm.stockCount),
        discount: newProductForm.mrp && Number(newProductForm.mrp) > Number(newProductForm.price)
          ? `${Math.round(((Number(newProductForm.mrp) - Number(newProductForm.price)) / Number(newProductForm.mrp)) * 100)}% OFF`
          : 'Standard',
        isActive: true
      });
      setFeedbackMsg(`Added ${newProductForm.name} to pharmacy catalogue`);
      setIsAddModalOpen(false);
      setNewProductForm({
        name: '',
        category: 'tablets',
        categoryLabel: 'Tablets & Capsules',
        composition: '',
        brand: '',
        mrp: '',
        price: '',
        stockCount: 50,
        packSize: 'Pack of 10 Tablets',
        requiresRx: false,
        badge: 'General Healthcare',
        description: '',
        dosage: '',
        storage: 'Store below 25°C in dry place',
        expiry: '12/2027',
        batchNo: `MM-${Math.floor(1000 + Math.random() * 9000)}`
      });
    } catch (err) {
      alert('Error adding product: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Inline Stock Adjustment
  const handleQuickStock = async (product, delta) => {
    const newStock = Math.max(0, product.stockCount + delta);
    try {
      await onUpdateProduct(product.id, { stockCount: newStock });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-card-section">
        {/* Card Header */}
        <div className="admin-card-header">
          <div className="admin-card-title">
            <h3>Medicine Stock & Catalog ({products.length})</h3>
            <p>Control pricing, live stock, active availability and prescription requirements</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onRefresh}
              className="btn-table-action ghost"
            >
              Refresh
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="btn-table-action primary"
              style={{ padding: '0.55rem 1rem' }}
            >
              <Plus size={16} /> Add New Medicine
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search-wrap">
            <Search size={16} color="#64748b" />
            <input 
              type="text" 
              placeholder="Search medicine, salt, composition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={15} color="#64748b" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                backgroundColor: '#ffffff',
                color: '#0f172a'
              }}
            >
              <option value="all">All Medical Categories</option>
              {PHARMACY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {feedbackMsg && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.65rem 1.5rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>✓ {feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#047857' }}>✕</button>
          </div>
        )}

        {/* Product Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Medicine Formulation</th>
                <th>Category</th>
                <th>Price & MRP</th>
                <th>Stock Level</th>
                <th>Quick Adjust</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stockCount === 0;
                const isLowStock = p.stockCount > 0 && p.stockCount <= 10;

                return (
                  <tr key={p.id} style={{ opacity: p.isActive ? 1 : 0.6 }}>
                    {/* Medicine Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          backgroundColor: '#f0fdfa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{p.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.composition || p.brand}</div>
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.2rem' }}>
                            {p.requiresRx && (
                              <span className="rx-badge" style={{ fontSize: '0.65rem' }}>
                                <FileText size={9} /> Rx Required
                              </span>
                            )}
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                              Batch: {p.batchNo || 'LOT-2026'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '600' }}>
                        {p.categoryLabel || p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td>
                      <div style={{ fontWeight: '800', color: '#0f766e', fontSize: '0.92rem' }}>₹{p.price}</div>
                      {p.mrp > p.price && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          ₹{p.mrp}
                        </div>
                      )}
                    </td>

                    {/* Stock Status */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <strong style={{
                          fontSize: '0.95rem',
                          color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#059669'
                        }}>
                          {p.stockCount} units
                        </strong>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#059669'
                      }}>
                        {isOutOfStock ? '● Out of Stock' : isLowStock ? '● Low Stock' : '● Available'}
                      </span>
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button 
                          onClick={() => handleQuickStock(p, -1)}
                          disabled={p.stockCount <= 0}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            cursor: p.stockCount <= 0 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          -
                        </button>
                        <button 
                          onClick={() => handleQuickStock(p, 5)}
                          style={{
                            padding: '2px 8px',
                            height: 26,
                            borderRadius: '4px',
                            border: '1px solid #99f6e4',
                            background: '#f0fdfa',
                            color: '#0f766e',
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: '700'
                          }}
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td>
                      <button 
                        onClick={() => onToggleStatus(p.id, !p.isActive)}
                        className={`btn-table-action ${p.isActive ? 'success' : 'danger'}`}
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        title={p.isActive ? 'Deactivate medicine from storefront' : 'Activate medicine on storefront'}
                      >
                        <Power size={11} /> {p.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td>
                      <button 
                        onClick={() => setEditingProduct(p)}
                        className="btn-table-action ghost"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==============================================================================
          EDIT MEDICINE MODAL
          ============================================================================== */}
      {editingProduct && (
        <div className="admin-modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="#0f766e" />
                <h3>Edit Medicine: {editingProduct.name}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="login-label">Medicine Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">Category</label>
                    <select 
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ 
                        ...editingProduct, 
                        category: e.target.value,
                        categoryLabel: PHARMACY_CATEGORIES.find(c => c.id === e.target.value)?.name || e.target.value
                      })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {PHARMACY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="login-label">Selling Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">MRP (₹)</label>
                    <input 
                      type="number" 
                      min="1"
                      value={editingProduct.mrp}
                      onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">Available Stock</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={editingProduct.stockCount}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stockCount: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="login-label">Active Chemical Composition / Salt</label>
                  <input 
                    type="text" 
                    value={editingProduct.composition}
                    onChange={(e) => setEditingProduct({ ...editingProduct, composition: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="login-label">Expiry Date (MM/YYYY)</label>
                    <input 
                      type="text" 
                      value={editingProduct.expiry}
                      onChange={(e) => setEditingProduct({ ...editingProduct, expiry: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label className="login-label">Batch No.</label>
                    <input 
                      type="text" 
                      value={editingProduct.batchNo}
                      onChange={(e) => setEditingProduct({ ...editingProduct, batchNo: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="edit-rx"
                    checked={editingProduct.requiresRx}
                    onChange={(e) => setEditingProduct({ ...editingProduct, requiresRx: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="edit-rx" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                    Doctor's Prescription Required (Rx Item)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-table-action ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-table-action primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <Save size={15} /> {submitting ? 'Saving to Database...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================================================================
          ADD NEW MEDICINE MODAL
          ============================================================================== */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="#0f766e" />
                <h3>Add New Medicine to Catalog</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="login-label">Medicine Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Paracetamol 650mg Film Tablets"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">Category *</label>
                    <select 
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({ 
                        ...newProductForm, 
                        category: e.target.value,
                        categoryLabel: PHARMACY_CATEGORIES.find(c => c.id === e.target.value)?.name || e.target.value
                      })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {PHARMACY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="login-label">Selling Price (₹) *</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="e.g. 150"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">MRP (₹)</label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="e.g. 190"
                      value={newProductForm.mrp}
                      onChange={(e) => setNewProductForm({ ...newProductForm, mrp: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">Initial Stock *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={newProductForm.stockCount}
                      onChange={(e) => setNewProductForm({ ...newProductForm, stockCount: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="login-label">Chemical Composition</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Paracetamol IP 650mg"
                      value={newProductForm.composition}
                      onChange={(e) => setNewProductForm({ ...newProductForm, composition: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label className="login-label">Manufacturer / Brand</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MediMinus Laboratories"
                      value={newProductForm.brand}
                      onChange={(e) => setNewProductForm({ ...newProductForm, brand: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="login-label">Pack Size / Presentation</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Strip of 15 Film Coated Tablets"
                    value={newProductForm.packSize}
                    onChange={(e) => setNewProductForm({ ...newProductForm, packSize: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="add-rx"
                    checked={newProductForm.requiresRx}
                    onChange={(e) => setNewProductForm({ ...newProductForm, requiresRx: e.target.checked })}
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="add-rx" style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                    Doctor's Prescription Required (Schedule H / Rx)
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-table-action ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-table-action primary"
                  style={{ padding: '0.65rem 1.25rem' }}
                >
                  <Plus size={15} /> {submitting ? 'Adding...' : 'Add Medicine to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
