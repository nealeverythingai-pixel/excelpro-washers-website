-- ============================================================
-- ExcelPro Washers — Supabase Migration
-- Migrates CRM data from JSON file to Supabase PostgreSQL
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  proof_of_work TEXT,
  contractor_notes TEXT,
  contractor_id TEXT,
  assigned_contractor_id TEXT,
  assigned_contractor_name TEXT,
  assigned_at TIMESTAMPTZ,
  contractor_earnings NUMERIC(10,2),
  available_to_contractors BOOLEAN DEFAULT false,
  before_photos JSONB DEFAULT '[]'::jsonb,
  before_photos_uploaded_at TIMESTAMPTZ,
  after_photos JSONB DEFAULT '[]'::jsonb,
  after_photos_uploaded_at TIMESTAMPTZ,
  client_signoff BOOLEAN DEFAULT false,
  client_signoff_name TEXT,
  client_signoff_at TIMESTAMPTZ,
  client_signoff_notes TEXT
);

-- 3. QUOTES
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  sales_rep_id TEXT
);

-- 4. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  job_id TEXT,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Draft',
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. USERS (contractors, sales reps, admins)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CONTRACTOR',
  active BOOLEAN DEFAULT true,
  phone TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  completed_jobs INTEGER DEFAULT 0,
  total_earnings NUMERIC(10,2) DEFAULT 0
);

-- 6. REQUESTS (contact form submissions)
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  service TEXT,
  message TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT now(),
  ai_score INTEGER,
  ai_category TEXT,
  ai_reasoning TEXT,
  estimated_value NUMERIC(10,2),
  next_follow_up TIMESTAMPTZ
);

-- 7. CONTRACTOR APPLICATIONS
CREATE TABLE IF NOT EXISTS contractor_applications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  skills JSONB DEFAULT '[]'::jsonb,
  experience TEXT NOT NULL,
  has_own_equipment BOOLEAN DEFAULT false,
  vehicle_type TEXT NOT NULL,
  insurance_provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  insurance_expiry TEXT NOT NULL,
  insurance_file_name TEXT NOT NULL,
  insurance_file_data TEXT NOT NULL,
  agreed_to_terms_at TIMESTAMPTZ NOT NULL,
  signature TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Enable Row Level Security (allow service_role full access)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_applications ENABLE ROW LEVEL SECURITY;

-- Allow anon key full access (auth is handled at the app level)
CREATE POLICY "Allow all for anon" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON contractor_applications FOR ALL USING (true) WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_assigned_contractor ON jobs(assigned_contractor_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
