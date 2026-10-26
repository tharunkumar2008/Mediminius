import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';
import DashboardOverview from './DashboardOverview';
import OrderManagement from './OrderManagement';
import InventoryManagement from './InventoryManagement';
import PrescriptionQueue from './PrescriptionQueue';
import DatabaseSettings from './DatabaseSettings';

import { 
  fetchOrders, 
  fetchProducts, 
  fetchDashboardMetrics, 
  updateOrderStatus, 
  acceptOrderWithStockDecrement, 
  createProduct, 
  updateProduct, 
  toggleProductStatus,
  getAdminSession,
  adminSignOut
} from '../../services/db';

export default function AdminDashboard({ onBackToStore, onProductsUpdated }) {
  const [adminUser, setAdminUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected order for modal inspection (can be triggered from Overview or Orders)
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [ordersInitialFilter, setOrdersInitialFilter] = useState('all');

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getAdminSession();
        if (session && session.user) {
          setAdminUser(session.user);
        }
      } catch (err) {
        console.error('[Admin auth check error]:', err);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const onProductsUpdatedRef = React.useRef(onProductsUpdated);
  React.useEffect(() => {
    onProductsUpdatedRef.current = onProductsUpdated;
  }, [onProductsUpdated]);

  // Fetch all dashboard data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedProducts, fetchedMetrics] = await Promise.all([
        fetchOrders('all'),
        fetchProducts(),
        fetchDashboardMetrics()
      ]);

      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setMetrics(fetchedMetrics);

      if (onProductsUpdatedRef.current) {
        onProductsUpdatedRef.current(fetchedProducts);
      }
    } catch (err) {
      console.error('[loadData error]:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminUser) {
      loadData();
    }
  }, [adminUser, loadData]);

  // Order workflow actions
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === 'accepted') {
        await acceptOrderWithStockDecrement(orderId);
      } else {
        await updateOrderStatus(orderId, newStatus);
      }
      // Reload orders, metrics & updated stock
      await loadData();
    } catch (err) {
      console.error('[handleStatusChange error]:', err);
      throw err;
    }
  };

  // Inventory actions
  const handleUpdateProduct = async (id, updates) => {
    await updateProduct(id, updates);
    await loadData();
  };

  const handleCreateProduct = async (productData) => {
    await createProduct(productData);
    await loadData();
  };

  const handleToggleProductStatus = async (id, isActive) => {
    await toggleProductStatus(id, isActive);
    await loadData();
  };

  // Logout handler
  const handleLogout = async () => {
    await adminSignOut();
    setAdminUser(null);
  };

  // Navigation helpers from overview
  const navigateToOrdersWithFilter = (filter) => {
    setOrdersInitialFilter(filter);
    setCurrentTab('orders');
  };

  const handleViewOrder = (order) => {
    setSelectedOrderForModal(order);
    setCurrentTab('orders');
  };

  // 1. Loading auth state
  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        color: '#0f766e',
        fontSize: '1rem',
        fontWeight: '700'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            border: '4px solid #ccfbf1',
            borderTopColor: '#0f766e',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Verifying Pharmacy Staff Credentials...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Login Page
  if (!adminUser) {
    return (
      <AdminLogin 
        onLoginSuccess={(user) => {
          setAdminUser(user);
        }}
        onBackToStore={onBackToStore}
      />
    );
  }

  // 3. Authenticated: Render Main Dashboard Layout
  return (
    <AdminLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      adminUser={adminUser}
      onLogout={handleLogout}
      onBackToStore={onBackToStore}
      pendingOrdersCount={metrics?.pendingOrders || 0}
      lowStockCount={metrics?.lowStockCount || 0}
      rxOrdersCount={metrics?.rxOrdersCount || 0}
    >
      {currentTab === 'overview' && (
        <DashboardOverview 
          metrics={metrics}
          loading={loading}
          onNavigateToOrders={navigateToOrdersWithFilter}
          onNavigateToInventory={() => setCurrentTab('inventory')}
          onViewOrder={handleViewOrder}
        />
      )}

      {currentTab === 'orders' && (
        <OrderManagement 
          orders={orders}
          loading={loading}
          onRefresh={loadData}
          onStatusChange={handleStatusChange}
          activeFilter={ordersInitialFilter}
          selectedOrderForModal={selectedOrderForModal}
          setSelectedOrderForModal={setSelectedOrderForModal}
        />
      )}

      {currentTab === 'inventory' && (
        <InventoryManagement 
          products={products}
          loading={loading}
          onRefresh={loadData}
          onUpdateProduct={handleUpdateProduct}
          onCreateProduct={handleCreateProduct}
          onToggleStatus={handleToggleProductStatus}
        />
      )}

      {currentTab === 'prescriptions' && (
        <PrescriptionQueue 
          orders={orders}
          onStatusChange={handleStatusChange}
          onViewOrder={handleViewOrder}
        />
      )}

      {currentTab === 'settings' && (
        <DatabaseSettings />
      )}
    </AdminLayout>
  );
}
