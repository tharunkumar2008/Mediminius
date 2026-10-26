import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { PHARMACY_PRODUCTS } from '../data/products';

// Storage keys for development fallback mode
const DEV_PRODUCTS_KEY = 'mediminus_dev_products';
const DEV_ORDERS_KEY = 'mediminus_dev_orders';
const DEV_ADMIN_SESSION_KEY = 'mediminus_dev_admin_session';

// Initialize dev mock database if not already done
const initDevDatabase = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(DEV_PRODUCTS_KEY)) {
    localStorage.setItem(DEV_PRODUCTS_KEY, JSON.stringify(PHARMACY_PRODUCTS.map(p => ({
      ...p,
      is_active: true,
      stock_count: p.stockCount || 25,
      in_stock: (p.stockCount || 25) > 0,
      requires_rx: Boolean(p.requiresRx)
    }))));
  }
  if (!localStorage.getItem(DEV_ORDERS_KEY)) {
    // Start with empty real orders list or initial verified orders for demonstration
    localStorage.setItem(DEV_ORDERS_KEY, JSON.stringify([]));
  }
};

initDevDatabase();

// ==============================================================================
// PRODUCT & INVENTORY API
// ==============================================================================

export const fetchProducts = async () => {
  const supabase = getSupabaseClient();
  
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('[Supabase fetchProducts warning, falling back to local store]:', error.message);
        return getDevProducts();
      }

      // Map snake_case database columns to frontend camelCase expectations
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        categoryLabel: p.category_label || p.category,
        composition: p.composition || '',
        brand: p.brand || '',
        mrp: Number(p.mrp) || Number(p.price) || 0,
        price: Number(p.price) || 0,
        discount: p.discount || '',
        packSize: p.pack_size || '',
        image: p.image || '/images/tablets-capsules.jpg',
        requiresRx: Boolean(p.requires_rx),
        inStock: Boolean(p.in_stock),
        stockCount: Number(p.stock_count) || 0,
        rating: Number(p.rating) || 4.8,
        reviews: Number(p.reviews) || 0,
        badge: p.badge || '',
        description: p.description || '',
        dosage: p.dosage || '',
        storage: p.storage || '',
        expiry: p.expiry || '',
        batchNo: p.batch_no || '',
        isActive: p.is_active !== false,
      }));
    } catch (err) {
      console.error('[fetchProducts exception]:', err);
      return getDevProducts();
    }
  }

  return getDevProducts();
};

const getDevProducts = () => {
  try {
    const raw = localStorage.getItem(DEV_PRODUCTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map(p => ({
        ...p,
        stockCount: p.stockCount ?? p.stock_count ?? 25,
        inStock: (p.stockCount ?? p.stock_count ?? 25) > 0,
        isActive: p.isActive ?? p.is_active ?? true,
        requiresRx: p.requiresRx ?? p.requires_rx ?? false,
      }));
    }
  } catch (e) {
    console.error(e);
  }
  return PHARMACY_PRODUCTS;
};

export const createProduct = async (productData) => {
  const supabase = getSupabaseClient();
  const newId = productData.id || `med-${Date.now()}`;

  const dbPayload = {
    id: newId,
    name: productData.name,
    category: productData.category,
    category_label: productData.categoryLabel || productData.category,
    composition: productData.composition || '',
    brand: productData.brand || '',
    mrp: Number(productData.mrp) || Number(productData.price),
    price: Number(productData.price),
    discount: productData.discount || '',
    pack_size: productData.packSize || '',
    image: productData.image || '/images/tablets-capsules.jpg',
    requires_rx: Boolean(productData.requiresRx),
    in_stock: Number(productData.stockCount) > 0,
    stock_count: Number(productData.stockCount) || 0,
    rating: Number(productData.rating) || 4.8,
    reviews: Number(productData.reviews) || 0,
    badge: productData.badge || '',
    description: productData.description || '',
    dosage: productData.dosage || '',
    storage: productData.storage || '',
    expiry: productData.expiry || '',
    batch_no: productData.batchNo || '',
    is_active: productData.isActive !== false,
    updated_at: new Date().toISOString()
  };

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('products')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Dev storage fallback
  const current = getDevProducts();
  const updated = [
    {
      ...productData,
      id: newId,
      stockCount: Number(productData.stockCount) || 0,
      inStock: Number(productData.stockCount) > 0,
      isActive: productData.isActive !== false,
    },
    ...current
  ];
  localStorage.setItem(DEV_PRODUCTS_KEY, JSON.stringify(updated));
  return updated[0];
};

export const updateProduct = async (id, updates) => {
  const supabase = getSupabaseClient();

  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
  if (updates.mrp !== undefined) dbUpdates.mrp = Number(updates.mrp);
  if (updates.stockCount !== undefined) {
    dbUpdates.stock_count = Number(updates.stockCount);
    dbUpdates.in_stock = Number(updates.stockCount) > 0;
  }
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.categoryLabel !== undefined) dbUpdates.category_label = updates.categoryLabel;
  if (updates.composition !== undefined) dbUpdates.composition = updates.composition;
  if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
  if (updates.requiresRx !== undefined) dbUpdates.requires_rx = Boolean(updates.requiresRx);
  if (updates.isActive !== undefined) dbUpdates.is_active = Boolean(updates.isActive);
  if (updates.dosage !== undefined) dbUpdates.dosage = updates.dosage;
  if (updates.storage !== undefined) dbUpdates.storage = updates.storage;
  if (updates.expiry !== undefined) dbUpdates.expiry = updates.expiry;
  if (updates.batchNo !== undefined) dbUpdates.batch_no = updates.batchNo;
  dbUpdates.updated_at = new Date().toISOString();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Dev storage fallback
  const current = getDevProducts();
  const updated = current.map(p => {
    if (p.id === id) {
      const stock = updates.stockCount !== undefined ? Number(updates.stockCount) : p.stockCount;
      return {
        ...p,
        ...updates,
        stockCount: stock,
        inStock: stock > 0,
        isActive: updates.isActive !== undefined ? updates.isActive : p.isActive,
      };
    }
    return p;
  });
  localStorage.setItem(DEV_PRODUCTS_KEY, JSON.stringify(updated));
  return updated.find(p => p.id === id);
};

export const toggleProductStatus = async (id, isActive) => {
  return updateProduct(id, { isActive });
};

// ==============================================================================
// ORDERS API
// ==============================================================================

export const fetchOrders = async (filterStatus = 'all', searchQuery = '') => {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus && filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[Supabase fetchOrders error, falling back to local store]:', error.message);
        return getDevOrders(filterStatus, searchQuery);
      }

      let orders = (data || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        deliveryAddress: o.delivery_address,
        city: o.city,
        pincode: o.pincode,
        deliveryType: o.delivery_type,
        paymentMethod: o.payment_method,
        subtotal: Number(o.subtotal),
        deliveryCost: Number(o.delivery_cost),
        totalAmount: Number(o.total_amount),
        status: o.status,
        requiresRx: Boolean(o.requires_rx),
        prescriptionInfo: o.prescription_info,
        notes: o.notes,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: (o.order_items || []).map(i => ({
          id: i.id,
          productId: i.product_id,
          productName: i.product_name,
          price: Number(i.price),
          quantity: Number(i.quantity),
          subtotal: Number(i.subtotal),
          requiresRx: Boolean(i.requires_rx),
        }))
      }));

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        orders = orders.filter(o => 
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q)
        );
      }

      return orders;
    } catch (err) {
      console.error('[fetchOrders error]:', err);
      return getDevOrders(filterStatus, searchQuery);
    }
  }

  return getDevOrders(filterStatus, searchQuery);
};

const getDevOrders = (filterStatus = 'all', searchQuery = '') => {
  try {
    const raw = localStorage.getItem(DEV_ORDERS_KEY);
    let orders = raw ? JSON.parse(raw) : [];

    if (filterStatus && filterStatus !== 'all') {
      orders = orders.filter(o => o.status === filterStatus);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      orders = orders.filter(o => 
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q)
      );
    }

    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.error(e);
    return [];
  }
};

/**
 * Creates a real customer order in the database.
 * Enforces stock check before placing order.
 */
export const createOrder = async ({
  customer,
  items,
  deliveryType = 'express',
  paymentMethod = 'upi',
  prescriptionInfo = null
}) => {
  const supabase = getSupabaseClient();
  const orderNumber = `MM-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Calculate totals
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);
  const deliveryCost = deliveryType === 'express' ? 40 : 0;
  const totalAmount = subtotal + deliveryCost;
  const requiresRx = items.some(item => item.requiresRx);

  if (supabase && isSupabaseConfigured()) {
    // 1. Verify that all products exist and have sufficient stock
    const productIds = items.map(i => i.id);
    const { data: dbProducts, error: prodErr } = await supabase
      .from('products')
      .select('id, name, stock_count, in_stock, is_active')
      .in('id', productIds);

    if (prodErr) throw new Error(`Stock verification error: ${prodErr.message}`);

    // Check stock availability
    for (const item of items) {
      const match = dbProducts?.find(p => p.id === item.id);
      if (!match) {
        throw new Error(`Product "${item.name}" is no longer available in the catalog.`);
      }
      if (!match.is_active) {
        throw new Error(`Product "${item.name}" is currently deactivated.`);
      }
      if (match.stock_count < item.quantity) {
        throw new Error(`Insufficient stock for "${item.name}". Only ${match.stock_count} units available.`);
      }
    }

    // 2. Insert order
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        delivery_address: customer.address,
        city: customer.city,
        pincode: customer.pincode,
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        subtotal: subtotal,
        delivery_cost: deliveryCost,
        total_amount: totalAmount,
        status: 'pending',
        requires_rx: requiresRx,
        prescription_info: prescriptionInfo,
        notes: customer.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderErr) throw new Error(`Order placement failed: ${orderErr.message}`);

    // 3. Insert order items
    const orderItemsPayload = items.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.price) * Number(item.quantity),
      requires_rx: Boolean(item.requiresRx)
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsErr) {
      console.error('[Error inserting order items]:', itemsErr);
    }

    return {
      success: true,
      orderId: orderData.id,
      orderNumber: orderNumber,
      total: totalAmount,
      items: items,
      address: `${customer.address}, ${customer.city} - ${customer.pincode}`,
      deliveryType: deliveryType,
      status: 'pending'
    };
  }

  // Dev storage fallback: Validate and store order
  const localProducts = getDevProducts();
  for (const item of items) {
    const match = localProducts.find(p => p.id === item.id);
    if (!match || match.isActive === false) {
      throw new Error(`Medicine "${item.name}" is currently unavailable.`);
    }
    if ((match.stockCount || 0) < item.quantity) {
      throw new Error(`Insufficient stock for "${item.name}". Only ${match.stockCount} left.`);
    }
  }

  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNumber: orderNumber,
    customerName: customer.name,
    customerPhone: customer.phone,
    deliveryAddress: customer.address,
    city: customer.city,
    pincode: customer.pincode,
    deliveryType: deliveryType,
    paymentMethod: paymentMethod,
    subtotal: subtotal,
    deliveryCost: deliveryCost,
    totalAmount: totalAmount,
    status: 'pending',
    requiresRx: requiresRx,
    prescriptionInfo: prescriptionInfo,
    notes: customer.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: items.map(i => ({
      id: `item-${Date.now()}-${Math.random()}`,
      productId: i.id,
      productName: i.name,
      price: Number(i.price),
      quantity: Number(i.quantity),
      subtotal: Number(i.price) * Number(i.quantity),
      requiresRx: Boolean(i.requiresRx)
    }))
  };

  const currentOrders = getDevOrders();
  localStorage.setItem(DEV_ORDERS_KEY, JSON.stringify([newOrder, ...currentOrders]));

  return {
    success: true,
    orderId: newOrder.id,
    orderNumber: orderNumber,
    total: totalAmount,
    items: items,
    address: `${customer.address}, ${customer.city} - ${customer.pincode}`,
    deliveryType: deliveryType,
    status: 'pending'
  };
};

/**
 * Accepts order and atomically reduces inventory stock.
 * Only pending orders can be accepted.
 */
export const acceptOrderWithStockDecrement = async (orderId) => {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    // Attempt to invoke the atomic PostgreSQL stored procedure first
    try {
      const { data: rpcRes, error: rpcErr } = await supabase
        .rpc('accept_order_and_decrement_stock', { p_order_id: orderId });

      if (!rpcErr && rpcRes) {
        if (!rpcRes.success) throw new Error(rpcRes.error || 'Failed to accept order');
        return { success: true, message: rpcRes.message };
      }
    } catch (err) {
      console.warn('[RPC accept_order_and_decrement_stock not available, executing direct safe transaction fallback]:', err);
    }

    // Direct fallback for Supabase if stored procedure is not yet created in the DB:
    // 1. Fetch order & items
    const { data: order, error: ordErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (ordErr || !order) throw new Error('Order not found');
    if (order.status !== 'pending') throw new Error(`Cannot accept order: status is currently "${order.status}"`);

    // 2. Fetch products and verify stock
    const itemIds = order.order_items.map(i => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .in('id', itemIds);

    if (prodErr) throw new Error(prodErr.message);

    for (const item of order.order_items) {
      const p = products.find(prod => prod.id === item.product_id);
      if (!p) throw new Error(`Product "${item.product_name}" not found`);
      if (p.stock_count < item.quantity) {
        throw new Error(`Insufficient stock for "${p.name}". Required: ${item.quantity}, Available: ${p.stock_count}`);
      }
    }

    // 3. Decrement stock for each product
    for (const item of order.order_items) {
      const p = products.find(prod => prod.id === item.product_id);
      const newStock = Math.max(0, p.stock_count - item.quantity);
      await supabase
        .from('products')
        .update({
          stock_count: newStock,
          in_stock: newStock > 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', p.id);
    }

    // 4. Update order status
    const { error: updErr } = await supabase
      .from('orders')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updErr) throw new Error(updErr.message);
    return { success: true, message: 'Order accepted and stock decremented successfully' };
  }

  // Dev storage fallback:
  const orders = getDevOrders();
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) throw new Error('Order not found');

  const order = orders[orderIndex];
  if (order.status !== 'pending') {
    throw new Error(`Cannot accept order with status "${order.status}"`);
  }

  const products = getDevProducts();
  // Validate stock
  for (const item of order.items) {
    const p = products.find(prod => prod.id === item.productId);
    if (!p) throw new Error(`Product ${item.productName} not found`);
    if ((p.stockCount || 0) < item.quantity) {
      throw new Error(`Insufficient stock for ${p.name}. Available: ${p.stockCount}, Requested: ${item.quantity}`);
    }
  }

  // Decrement stock
  const updatedProducts = products.map(p => {
    const item = order.items.find(i => i.productId === p.id);
    if (item) {
      const newStock = Math.max(0, (p.stockCount || 0) - item.quantity);
      return {
        ...p,
        stockCount: newStock,
        inStock: newStock > 0,
      };
    }
    return p;
  });
  localStorage.setItem(DEV_PRODUCTS_KEY, JSON.stringify(updatedProducts));

  // Update order
  orders[orderIndex] = {
    ...order,
    status: 'accepted',
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(DEV_ORDERS_KEY, JSON.stringify(orders));

  return { success: true, message: 'Order accepted and stock reduced' };
};

/**
 * Updates order status (e.g. processing, out_for_delivery, delivered, rejected).
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  const supabase = getSupabaseClient();

  if (newStatus === 'accepted') {
    return acceptOrderWithStockDecrement(orderId);
  }

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Dev storage fallback
  const orders = getDevOrders();
  const updated = orders.map(o => {
    if (o.id === orderId) {
      return {
        ...o,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    }
    return o;
  });
  localStorage.setItem(DEV_ORDERS_KEY, JSON.stringify(updated));
  return updated.find(o => o.id === orderId);
};

// ==============================================================================
// DASHBOARD METRICS API
// ==============================================================================

export const fetchDashboardMetrics = async () => {
  const orders = await fetchOrders('all');
  const products = await fetchProducts();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const acceptedOrders = orders.filter(o => o.status === 'accepted').length;
  const processingOrders = orders.filter(o => o.status === 'processing' || o.status === 'out_for_delivery').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const rejectedOrders = orders.filter(o => o.status === 'rejected').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'rejected')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const lowStockProducts = products.filter(p => p.stockCount <= 10 && p.isActive);
  const outOfStockProducts = products.filter(p => p.stockCount === 0 && p.isActive);
  const rxOrdersCount = orders.filter(o => o.requiresRx && o.status === 'pending').length;

  return {
    totalOrders,
    pendingOrders,
    acceptedOrders,
    processingOrders: processingOrders + acceptedOrders, // Combined in-progress
    completedOrders,
    rejectedOrders,
    totalRevenue,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    rxOrdersCount,
    lowStockProducts,
    recentOrders: orders.slice(0, 6)
  };
};

// ==============================================================================
// ADMIN AUTHENTICATION
// ==============================================================================

export const adminSignIn = async (email, password) => {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session,
      isRealSupabase: true
    };
  }

  // Fallback dev mode authentication check (if user is testing before configuring Supabase)
  // Provides clear guidance while permitting local testing
  if (email && password && password.length >= 6) {
    const devUser = {
      id: 'dev-admin-user',
      email: email.trim(),
      role: 'authenticated',
      app_metadata: { role: 'admin' },
      user_metadata: { name: 'Pharmacy Chief Pharmacist' }
    };
    localStorage.setItem(DEV_ADMIN_SESSION_KEY, JSON.stringify(devUser));
    return {
      user: devUser,
      session: { access_token: 'dev-token-local', user: devUser },
      isRealSupabase: false
    };
  } else {
    throw new Error('Please enter a valid pharmacy email and password (minimum 6 characters).');
  }
};

export const adminSignOut = async () => {
  const supabase = getSupabaseClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.removeItem(DEV_ADMIN_SESSION_KEY);
  return true;
};

export const getAdminSession = async () => {
  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session?.user) {
        return { user: data.session.user, session: data.session, isRealSupabase: true };
      }
    } catch (e) {
      console.error('[getAdminSession error]:', e);
    }
  }

  // Dev storage check
  try {
    const raw = localStorage.getItem(DEV_ADMIN_SESSION_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      return { user, session: { access_token: 'dev-token', user }, isRealSupabase: false };
    }
  } catch (e) {
    console.error(e);
  }

  return null;
};
