import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategorySection from './components/CategorySection';
import PrescriptionBanner from './components/PrescriptionBanner';
import ProductCatalogue from './components/ProductCatalogue';
import ConsultationBanner from './components/ConsultationBanner';
import SafetySection from './components/SafetySection';
import HealthArticlesSection from './components/HealthArticlesSection';
import Footer from './components/Footer';

// Modals & Drawers
import QuickViewModal from './components/QuickViewModal';
import PrescriptionModal from './components/PrescriptionModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import PharmacistChatModal from './components/PharmacistChatModal';

// Admin Suite
import AdminDashboard from './components/admin/AdminDashboard';

// Data & Database Services
import { PHARMACY_PRODUCTS } from './data/products';
import { fetchProducts } from './services/db';

export default function App() {
  // Routing Detection: Admin Portal vs. Customer Storefront
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.hash === '#admin' ||
      window.location.pathname.startsWith('/admin') ||
      window.location.search.includes('view=admin')
    );
  };

  const [isAdminView, setIsAdminView] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleRouteChange = () => {
      setIsAdminView(checkIsAdminRoute());
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const openAdminPortal = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeAdminPortal = () => {
    window.location.hash = '';
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronized Dynamic Products from Database
  const [products, setProducts] = useState(PHARMACY_PRODUCTS);

  const loadLiveProducts = useCallback(async () => {
    try {
      const data = await fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.warn('[App loadLiveProducts warning]:', err);
    }
  }, []);

  useEffect(() => {
    loadLiveProducts();
  }, [loadLiveProducts]);

  // Customer Navigation & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Customer Cart State
  const [cartItems, setCartItems] = useState([
    {
      ...PHARMACY_PRODUCTS[1], // Restoral Triple Action Cough Syrup
      quantity: 1
    }
  ]);

  // Modals Visibility
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderTrackingData, setOrderTrackingData] = useState(null);

  // Prescription uploaded state
  const [uploadedRx, setUploadedRx] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Cart Handlers with Safe Stock Enforcement
  const addToCart = (product) => {
    // Check if active and in stock
    const availableStock = product.stockCount !== undefined ? Number(product.stockCount) : 25;
    if (product.isActive === false || availableStock <= 0 || product.inStock === false) {
      showToast(`Sorry, "${product.name}" is currently out of stock`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > availableStock) {
        showToast(`Cannot add more. Only ${availableStock} units available in pharmacy.`);
        return prev;
      }

      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const currentProd = products.find(p => p.id === productId) || cartItems.find(p => p.id === productId);
    const maxStock = currentProd?.stockCount ?? 99;

    if (newQty > maxStock) {
      showToast(`Only ${maxStock} units available for this medicine`);
      return;
    }

    setCartItems(prev => 
      prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    showToast('Item removed from cart');
  };

  // Checkout Handler
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderInfo) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setOrderTrackingData(orderInfo);
    showToast(`Order ${orderInfo.orderId} placed successfully!`);
    // Reload products to reflect any stock changes
    loadLiveProducts();
  };

  const handlePrescriptionUploaded = (rxData) => {
    setUploadedRx(rxData);
    showToast(`Prescription verified for ${rxData.patientName}`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Stabilized callback for updating customer products from admin
  const handleProductsUpdated = useCallback((newProducts) => {
    setProducts(newProducts);
  }, []);

  // ============================================================================
  // CONDITIONAL VIEW: ADMIN DASHBOARD
  // ============================================================================
  if (isAdminView) {
    return (
      <AdminDashboard 
        onBackToStore={closeAdminPortal}
        onProductsUpdated={handleProductsUpdated}
      />
    );
  }

  // ============================================================================
  // CUSTOMER-FACING PHARMACY STOREFRONT (100% Preserved)
  // ============================================================================
  return (
    <div className="mediminus-app">
      {/* Navbar with Staff Portal link */}
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        openRxModal={() => setIsRxModalOpen(true)}
        openChatModal={() => setIsChatModalOpen(true)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenAdmin={openAdminPortal}
      />

      {/* Main Hero Section */}
      <Hero 
        setSearchQuery={setSearchQuery}
        openRxModal={() => setIsRxModalOpen(true)}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Medical Department Categories */}
      <CategorySection 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Prescription Upload Callout Strip */}
      <PrescriptionBanner 
        openRxModal={() => setIsRxModalOpen(true)} 
      />

      {/* Pharmaceutical Products Catalogue (Synchronized with Database) */}
      <ProductCatalogue 
        products={products}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        cartItems={cartItems}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        openQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* Doctor / Pharmacist Consultation Banner */}
      <ConsultationBanner 
        openChatModal={() => setIsChatModalOpen(true)} 
      />

      {/* Safety & Compliance Pillars */}
      <SafetySection />

      {/* Health Articles & Medication Guidance */}
      <HealthArticlesSection 
        onReadArticle={(art) => {
          showToast(`Opening medical guide: "${art.title}"`);
        }} 
      />

      {/* Comprehensive Medical Footer */}
      <Footer 
        openRxModal={() => setIsRxModalOpen(true)}
        openChatModal={() => setIsChatModalOpen(true)}
        setSelectedCategory={setSelectedCategory}
        openAdmin={openAdminPortal}
      />

      {/* ================= MODALS & DRAWERS ================= */}

      {/* Quick View Medicine Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          addToCart={addToCart}
          cartQty={cartItems.find(i => i.id === quickViewProduct.id)?.quantity || 0}
          updateQuantity={updateQuantity}
        />
      )}

      {/* Prescription Upload Modal */}
      {isRxModalOpen && (
        <PrescriptionModal 
          onClose={() => setIsRxModalOpen(false)}
          onPrescriptionUploaded={handlePrescriptionUploaded}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={handleProceedToCheckout}
        prescriptionUploaded={!!uploadedRx}
      />

      {/* Checkout Modal with Real Database Order Insertion */}
      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          onOrderSuccess={handleOrderSuccess}
          prescriptionUploaded={!!uploadedRx}
        />
      )}

      {/* Order Tracking & Confirmation Modal */}
      {orderTrackingData && (
        <OrderTrackingModal 
          orderData={orderTrackingData}
          onClose={() => setOrderTrackingData(null)}
        />
      )}

      {/* Pharmacist Live Consultation Chat */}
      {isChatModalOpen && (
        <PharmacistChatModal 
          onClose={() => setIsChatModalOpen(false)} 
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
