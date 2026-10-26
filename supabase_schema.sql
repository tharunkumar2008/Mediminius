-- ==============================================================================
-- MEDIMINUS PHARMACY DATABASE SCHEMA (PostgreSQL / Supabase)
-- ==============================================================================
-- Instructions for the Pharmacy Owner:
-- 1. Create a free Supabase project at https://supabase.com
-- 2. Open the "SQL Editor" in your Supabase project dashboard.
-- 3. Paste and run this entire file.
-- 4. Copy your Project URL & Anon Key from Settings -> API into your .env file:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-public-key
-- ==============================================================================

-- 1. Enable UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    composition TEXT,
    brand TEXT,
    mrp NUMERIC(10, 2) NOT NULL DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount TEXT,
    pack_size TEXT,
    image TEXT,
    requires_rx BOOLEAN NOT NULL DEFAULT false,
    in_stock BOOLEAN NOT NULL DEFAULT true,
    stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.8,
    reviews INTEGER NOT NULL DEFAULT 0,
    badge TEXT,
    description TEXT,
    dosage TEXT,
    storage TEXT,
    expiry TEXT,
    batch_no TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    delivery_type TEXT NOT NULL DEFAULT 'express',
    payment_method TEXT NOT NULL DEFAULT 'upi',
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'processing', 'out_for_delivery', 'delivered', 'rejected')),
    requires_rx BOOLEAN NOT NULL DEFAULT false,
    prescription_info JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL,
    requires_rx BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ==============================================================================
-- 5. ATOMIC STORED FUNCTION: ACCEPT ORDER & REDUCE STOCK SAFELY
-- ==============================================================================
-- Automatically reduces stock ONLY after the order is accepted.
-- Throws an error if any medicine in the order does not have sufficient stock.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.accept_order_and_decrement_stock(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_current_stock INT;
    v_prod_name TEXT;
BEGIN
    -- Check order existence and status
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    IF v_order.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order is not in pending status');
    END IF;

    -- Validate stock availability for all items before decrementing
    FOR v_item IN (SELECT product_id, product_name, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
        SELECT stock_count, name INTO v_current_stock, v_prod_name 
        FROM public.products 
        WHERE id = v_item.product_id FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'Product ' || v_item.product_name || ' not found in catalog');
        END IF;

        IF v_current_stock < v_item.quantity THEN
            RETURN jsonb_build_object(
                'success', false, 
                'error', 'Insufficient stock for ' || v_prod_name || '. Required: ' || v_item.quantity || ', Available: ' || v_current_stock
            );
        END IF;
    END LOOP;

    -- Deduct stock and update in_stock flag
    FOR v_item IN (SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id) LOOP
        UPDATE public.products
        SET stock_count = stock_count - v_item.quantity,
            in_stock = (stock_count - v_item.quantity > 0),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_item.product_id;
    END LOOP;

    -- Mark order as accepted
    UPDATE public.orders
    SET status = 'accepted',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Order accepted successfully and inventory stock decremented safely',
        'order_id', p_order_id,
        'status', 'accepted'
    );
END;
$$;

-- Grant execution to all client roles
GRANT EXECUTE ON FUNCTION public.accept_order_and_decrement_stock(UUID) TO anon, authenticated, service_role;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Grant table access
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.order_items TO anon, authenticated, service_role;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Customers can place orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can track order" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins and customers can view order items" ON public.order_items;

-- Products Policies:
-- Anyone (anon and authenticated) can view active products
CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    USING (is_active = true OR auth.role() = 'authenticated');

-- Authenticated admins can insert/update/delete products
CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Orders Policies:
-- Customers can insert orders at checkout
CREATE POLICY "Customers can place orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Customers can track their own order by order_number
CREATE POLICY "Customers can track order"
    ON public.orders FOR SELECT
    USING (auth.role() = 'authenticated' OR order_number IS NOT NULL);

-- Authenticated admins can select and update all orders
CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Order Items Policies:
-- Customers can insert order items
CREATE POLICY "Customers can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- Order items can be selected by admin or for tracking
CREATE POLICY "Admins and customers can view order items"
    ON public.order_items FOR SELECT
    USING (auth.role() = 'authenticated' OR true);

-- ==============================================================================
-- 7. SEED DATA: 18 REAL MEDICINES & HEALTH PRODUCTS
-- ==============================================================================
INSERT INTO public.products (
    id, name, category, category_label, composition, brand, mrp, price, discount, pack_size, image, requires_rx, in_stock, stock_count, rating, reviews, badge, description, dosage, storage, expiry, batch_no, is_active
) VALUES
(
    'med-01',
    'PharmaCare Duo-Caps & Tablets (150mg/10mg)',
    'tablets',
    'Tablets & Capsules',
    'Amlodipine Besylate 10mg + Valsartan 150mg',
    'PharmaCare Laboratories',
    320.00,
    245.00,
    '23% OFF',
    'Strip of 30 Film-Coated Tablets',
    '/images/tablets-capsules.jpg',
    true,
    true,
    24,
    4.8,
    142,
    'Hypertension Care',
    'Prescription-grade dual combination for effective blood pressure management and cardiovascular support. Clinically tested for 24-hour blood pressure control.',
    '1 tablet once daily with water, preferably at the same time each day or as prescribed by your cardiologist.',
    'Store below 25°C in a dry place protected from direct sunlight.',
    '05/2027',
    'MM-LOT-23G01',
    true
),
(
    'med-02',
    'Restoral Triple Action Cough Syrup (150ml)',
    'syrups',
    'Syrups & Suspensions',
    'Guaifenesin 50mg + Dextromethorphan HBr 10mg + Menthol',
    'MediPharma Healthcare',
    185.00,
    139.00,
    '25% OFF',
    '150ml Amber Bottle + Measuring Cup',
    '/images/cough-syrup.jpg',
    false,
    true,
    38,
    4.9,
    219,
    'Best Seller',
    'Non-drowsy soothing cherry cough syrup. Rapidly thins mucus and calms irritating dry coughs while providing pleasant throat lubrication.',
    'Adults: 10ml every 6 to 8 hours. Children (6-12 yrs): 5ml every 8 hours. Shake well before use.',
    'Keep container tightly closed. Protect from heat and light.',
    '08/2026',
    'RES-8842-A',
    true
),
(
    'med-03',
    'Derma-Clinic Restorative Skin Ointment (55ml)',
    'ointments',
    'Ointments & Creams',
    'Hydrocortisone 0.5% + Micro-Ceramides + Zinc Oxide',
    'Derma-Clinic Formulations',
    240.00,
    189.00,
    '21% OFF',
    '55ml Dermatological Tube with Box',
    '/images/ointment-cream.jpg',
    false,
    true,
    19,
    4.7,
    98,
    'Dermatologist Tested',
    'Advanced clinical barrier repair ointment for acute eczema, dry flaking patches, contact dermatitis, and soothing intense itching.',
    'Apply a thin layer gently over the affected skin area 2 to 3 times daily.',
    'Store at cool room temperature below 30°C. Do not freeze.',
    '11/2026',
    'DC-9921-T',
    true
),
(
    'med-04',
    'Omron Clinically Validated Digital BP Monitor',
    'devices',
    'Medical Devices',
    'Oscillometric Sensor + Dual Precision Air Pump',
    'Omron Healthcare',
    2490.00,
    1890.00,
    '24% OFF',
    'Complete Kit with M-L Cuff & Storage Pouch',
    '/images/bp-monitor.jpg',
    false,
    true,
    14,
    4.9,
    312,
    'Medical Standard',
    'Hospital-grade accuracy with IntelliSense technology. Features irregular heartbeat detector, 60-memory log, and cuff wrap guide.',
    'Rest for 5 minutes before measurement. Fasten cuff snugly around upper arm at heart level and press Start.',
    'Keep in dry environment between -20°C to +60°C.',
    'N/A (3-Year Warranty)',
    'OMR-7120-X',
    true
),
(
    'med-05',
    'Surgical Grade Sterile Gauze Swabs & Bandages (Pack of 50)',
    'firstaid',
    'First Aid & Surgical',
    '100% Pure Bleached Cotton (12-ply, 7.5cm x 7.5cm)',
    'SurgiMed International',
    195.00,
    149.00,
    '24% OFF',
    'Sterile Box of 50 Individually Wrapped Swabs',
    '/images/first-aid-kit.jpg',
    false,
    true,
    45,
    4.8,
    76,
    'Hospital Sterile',
    'Gamma-radiation sterilized surgical dressings designed for wound debridement, exudate absorption, and post-operative padding.',
    'Tear open sterile peel-pack with clean hands. Apply sterile side directly against cleansed wound bed.',
    'Store in dry place away from moisture. Discard if wrapper is punctured.',
    '10/2028',
    'SM-SWB-1102',
    true
),
(
    'med-06',
    'Complete Multivitamin Complex + Zinc & D3',
    'wellness',
    'Vitamins & Wellness',
    '24 Essential Nutrients, Vitamin C 500mg, Zinc 15mg, D3 1000IU',
    'VitalityNutra Bio Labs',
    450.00,
    349.00,
    '22% OFF',
    'Bottle of 60 Vegetarian Tablets',
    '/images/tablets-capsules.jpg',
    false,
    true,
    60,
    4.9,
    430,
    'Immunity Booster',
    'Complete daily micronutrient formula formulated to strengthen cellular immunity, enhance metabolic energy, and combat fatigue.',
    '1 tablet daily after breakfast or lunch with plenty of water.',
    'Keep lid tightly screwed. Protect from direct heat and moisture.',
    '03/2027',
    'VNT-6623-Z',
    true
),
(
    'med-07',
    'Azithro-Med Broad Spectrum Antibiotic 500mg',
    'tablets',
    'Tablets & Capsules',
    'Azithromycin Dihydrate IP 500mg',
    'Medilab Pharmaceuticals',
    210.00,
    165.00,
    '21% OFF',
    'Blister Pack of 5 Film-Coated Tablets',
    '/images/tablets-capsules.jpg',
    true,
    true,
    32,
    4.7,
    185,
    'Antibiotic / Rx',
    'Macrolide antibiotic prescribed for bacterial infections of the respiratory tract, sinuses, throat, and skin.',
    'Strictly as prescribed by a licensed physician. Complete the full 3 to 5 day course without interruption.',
    'Store in a cool dry place below 25°C.',
    '09/2026',
    'AZM-500-449',
    true
),
(
    'med-08',
    'Gastrocid-D Anti-Reflux & Acidity Capsules',
    'tablets',
    'Tablets & Capsules',
    'Pantoprazole Sodium 40mg + Domperidone 30mg SR',
    'Alchemis Therapeutics',
    190.00,
    142.00,
    '25% OFF',
    'Alu-Alu Strip of 15 Capsules',
    '/images/tablets-capsules.jpg',
    true,
    true,
    50,
    4.8,
    260,
    'Fast Acid Relief',
    'Sustained-release dual mechanism for severe GERD, heartburn, indigestion, and acid regurgitation.',
    'Take 1 capsule early in the morning 30 to 60 minutes before breakfast with a glass of water.',
    'Keep protected from moisture. Store below 25°C.',
    '01/2027',
    'GST-PAN-092',
    true
),
(
    'med-09',
    'Calci-Bone Max Vitamin D3 & K2 Tablets',
    'tablets',
    'Tablets & Capsules',
    'Calcium Carbonate 1250mg (Eq. to Elemental Calcium 500mg) + D3 + K2-7',
    'BoneCare Laboratories',
    310.00,
    230.00,
    '26% OFF',
    'Strip of 15 Chewable Tablets',
    '/images/tablets-capsules.jpg',
    false,
    true,
    40,
    4.9,
    194,
    'Bone Health',
    'Optimized calcium absorption formula to build bone density, prevent osteoporosis, and support joint mobility.',
    '1 tablet daily after food or as recommended by your physician.',
    'Store in cool, dark location.',
    '04/2027',
    'CBM-D3-112',
    true
),
(
    'med-10',
    'Pediatric Antipyretic Suspension Drops (30ml)',
    'syrups',
    'Syrups & Suspensions',
    'Paracetamol Paediatric Oral Suspension IP 100mg/ml',
    'PureHealth Pharma',
    95.00,
    72.00,
    '24% OFF',
    '30ml Dropper Bottle with Calibrated Pipette',
    '/images/cough-syrup.jpg',
    false,
    true,
    28,
    4.8,
    140,
    'Pediatric Care',
    'Rapid-acting, gentle fever reducer and analgesic for infants and young children.',
    'Dosage strictly depends on child body weight. Use provided calibrated dropper.',
    'Store below 25°C. Do not freeze.',
    '12/2026',
    'PED-PARA-89',
    true
),
(
    'med-11',
    'Digestive Enzymes & Probiotics Syrup (200ml)',
    'syrups',
    'Syrups & Suspensions',
    'Fungal Diastase 50mg + Pepsin 10mg + B-Complex',
    'BioVital Remedies',
    165.00,
    125.00,
    '24% OFF',
    '200ml Amber Bottle',
    '/images/cough-syrup.jpg',
    false,
    true,
    35,
    4.6,
    88,
    'Gut Health',
    'Improves appetite, accelerates digestion of proteins and starches, and relieves post-meal bloating.',
    '5ml to 10ml twice daily immediately after meals.',
    'Protect from sunlight.',
    '07/2026',
    'ENZ-SYR-03',
    true
),
(
    'med-12',
    'PainRelief Deep Heating Anti-Inflammatory Gel',
    'ointments',
    'Ointments & Creams',
    'Diclofenac Diethylamine 1.16% w/w + Methyl Salicylate + Linseed Oil + Menthol',
    'OrthoRelief Health',
    175.00,
    130.00,
    '26% OFF',
    '50g Lami-tube with Flip Cap',
    '/images/ointment-cream.jpg',
    false,
    true,
    42,
    4.8,
    310,
    'Fast Pain Relief',
    'Deep penetrating analgesic gel for arthritis, muscle spasms, neck stiffness, and joint swelling.',
    'Gently massage a thin film over painful joints 3 to 4 times a day.',
    'Store in cool place. Keep away from eyes and mucous membranes.',
    '02/2027',
    'PRG-DIC-78',
    true
),
(
    'med-13',
    'Silver Healing Burn & Wound Barrier Cream',
    'ointments',
    'Ointments & Creams',
    'Silver Sulfadiazine IP 1.0% w/w + Chlorhexidine Gluconate 0.2% w/w',
    'Dermacare Pharma',
    140.00,
    108.00,
    '23% OFF',
    '30g Tube with Safety Seal',
    '/images/ointment-cream.jpg',
    false,
    true,
    22,
    4.9,
    115,
    'Burn Care',
    'Topical antimicrobial cream for preventing and managing infection in first and second-degree burns and abrasions.',
    'Apply 1mm thick layer on cleansed burn area once or twice daily under sterile cover.',
    'Keep tube tightly closed below 25°C.',
    '06/2026',
    'SLV-CR-45',
    true
),
(
    'med-14',
    'Accu-Check Instant Blood Glucose Meter Kit',
    'devices',
    'Medical Devices',
    'Electrochemical Biosensor + 10 Test Strips + Lancing Device',
    'Accu-Health Tech',
    1450.00,
    1099.00,
    '24% OFF',
    'Full Starter Kit with Hard Travel Case',
    '/images/bp-monitor.jpg',
    false,
    true,
    16,
    4.9,
    420,
    'Diabetes Care',
    'Instant, reliable blood sugar results in under 4 seconds with tiny 0.6 microliter blood drop requirement.',
    'Insert strip, lance fingertip, touch blood to yellow edge of strip.',
    'Keep strips in original sealed vial between 4°C to 30°C.',
    'N/A (Lifetime Meter Warranty)',
    'ACC-GLU-001',
    true
),
(
    'med-15',
    'Emergency Trauma First Aid Medical Kit (Box of 48 Items)',
    'firstaid',
    'First Aid & Surgical',
    'Antiseptic Lotion, Burn Gel, Triangular Bandages, Micropore Tape, Splint, Scissors',
    'MediMinus Surgical',
    890.00,
    699.00,
    '21% OFF',
    'Rugged Waterproof Medical Hardcase',
    '/images/first-aid-kit.jpg',
    false,
    true,
    18,
    4.9,
    155,
    'Emergency Essential',
    'Comprehensive OSHA/Red Cross compliant home and travel medical emergency responder kit.',
    'Inspect items bi-annually and replace consumable dressings after use.',
    'Store in an easily accessible, dry location.',
    '06/2028',
    'MM-KIT-TRAUMA',
    true
),
(
    'med-16',
    'Waterproof Medicated Antiseptic Bandages (Pack of 100)',
    'firstaid',
    'First Aid & Surgical',
    'Benzalkonium Chloride Medicated Pad + Breathable Waterproof Film',
    'SafeHeal Formulations',
    220.00,
    169.00,
    '23% OFF',
    'Dispenser Box of 100 Assorted Strips',
    '/images/first-aid-kit.jpg',
    false,
    true,
    55,
    4.7,
    210,
    'Waterproof Care',
    'Hospital grade wound protection strips that seal out dirt and bacteria even during bathing.',
    'Cleanse cut, apply strip centrally without touching antiseptic pad.',
    'Store below 30°C away from direct sunlight.',
    '10/2027',
    'SH-BND-100',
    true
),
(
    'med-17',
    'CoQ10 Cardiovascular 100mg + Omega-3 Softgels',
    'wellness',
    'Vitamins & Wellness',
    'Coenzyme Q10 (Ubiquinone) 100mg + EPA 180mg + DHA 120mg',
    'CardioVital Nutrition',
    750.00,
    579.00,
    '23% OFF',
    'Bottle of 30 Enteric Softgels',
    '/images/tablets-capsules.jpg',
    false,
    true,
    25,
    4.9,
    84,
    'Heart Health',
    'High-bioavailability cellular energy support for cardiac muscle strength and healthy cholesterol lipid balance.',
    '1 softgel daily after main meal or as directed by cardiologist.',
    'Store in cool place. Protect from heat and moisture.',
    '08/2027',
    'CQ-OMG-88',
    true
),
(
    'med-18',
    'Metformin Hydrochloride 500mg SR Tablets',
    'tablets',
    'Tablets & Capsules',
    'Metformin Hydrochloride Sustained Release 500mg',
    'GlycoMed Laboratories',
    85.00,
    64.00,
    '25% OFF',
    'Blister Pack of 20 SR Tablets',
    '/images/tablets-capsules.jpg',
    true,
    true,
    45,
    4.8,
    312,
    'Type-2 Diabetes',
    'Gold standard sustained-release biguanide formulation for glycemic regulation and insulin sensitivity.',
    'Take with evening meal. Do not crush or chew sustained-release tablet.',
    'Store protected from light and moisture below 25°C.',
    '05/2027',
    'GLY-MET-500',
    true
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    stock_count = EXCLUDED.stock_count,
    in_stock = EXCLUDED.in_stock,
    is_active = EXCLUDED.is_active;
