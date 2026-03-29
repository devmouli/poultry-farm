-- Users table handled by Supabase Auth (auth.users), we create a profile table
CREATE TYPE user_role AS ENUM ('FARMER', 'TRADER', 'ADMIN');
CREATE TYPE registration_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status registration_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farms
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.profiles(id) NOT NULL,
  farm_name TEXT NOT NULL,
  location_district TEXT NOT NULL,
  location_state TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches
CREATE TYPE batch_status AS ENUM ('OPEN', 'CLOSED');
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID REFERENCES public.farms(id) NOT NULL,
  number_of_birds INT NOT NULL,
  available_birds INT NOT NULL,
  average_weight_kg NUMERIC NOT NULL,
  price_per_kg NUMERIC NOT NULL,
  expected_ready_date DATE NOT NULL,
  status batch_status DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TYPE order_status AS ENUM ('PLACED', 'ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'LOADING', 'IN_TRANSIT', 'DELIVERED');
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID REFERENCES public.profiles(id) NOT NULL,
  batch_id UUID REFERENCES public.batches(id) NOT NULL,
  quantity_birds INT NOT NULL,
  agreed_price_per_kg NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  status order_status DEFAULT 'PLACED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) basics (Add more strict policies later)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farms are viewable by everyone." ON public.farms FOR SELECT USING (true);
CREATE POLICY "Farmers can insert their own farms." ON public.farms FOR INSERT WITH CHECK (auth.uid() = farmer_id);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Batches are viewable by everyone." ON public.batches FOR SELECT USING (true);
CREATE POLICY "Farmers can insert their own batches." ON public.batches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.farms WHERE farms.id = batches.farm_id AND farms.farmer_id = auth.uid())
);
CREATE POLICY "Farmers can update their own batches." ON public.batches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.farms WHERE farms.id = batches.farm_id AND farms.farmer_id = auth.uid())
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Traders can view their orders." ON public.orders FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Farmers can view orders for their batches." ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.batches JOIN public.farms ON batches.farm_id = farms.id WHERE orders.batch_id = batches.id AND farms.farmer_id = auth.uid())
);
CREATE POLICY "Traders can place orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Farmers can update orders." ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.batches JOIN public.farms ON batches.farm_id = farms.id WHERE orders.batch_id = batches.id AND farms.farmer_id = auth.uid())
);
