-- =========================================================================
-- EL CLÁSICO (Real Madrid vs Liverpool FC) - SUPABASE DATABASE SCHEMA
-- Nusxa oling va Supabase Dashboard > SQL Editor oynasiga qo'yib, "Run" bosing!
-- =========================================================================

-- 1. Barcha ma'lumotlar (o'yinchilar, o'yinlar, davomat, taktik maydon) uchun jadval
CREATE TABLE IF NOT EXISTS elclasico_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  players JSONB DEFAULT '[]'::jsonb,
  matches JSONB DEFAULT '[]'::jsonb,
  attendance JSONB DEFAULT '{}'::jsonb,
  slots JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Boshlang'ich qatorni kiritish (agar mavjud bo'lmasa)
INSERT INTO elclasico_data (id, players, matches, attendance, slots)
VALUES ('main', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security (RLS) ni yoqish va jamoat uchun o'qish/yozish ruxsatini ochish
ALTER TABLE elclasico_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read elclasico_data" ON elclasico_data;
CREATE POLICY "Allow public read elclasico_data"
  ON elclasico_data FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert elclasico_data" ON elclasico_data;
CREATE POLICY "Allow public insert elclasico_data"
  ON elclasico_data FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update elclasico_data" ON elclasico_data;
CREATE POLICY "Allow public update elclasico_data"
  ON elclasico_data FOR UPDATE
  USING (true);

-- =========================================================================
-- TAYYOR! Endi loyihaning .env.local fayliga quyidagilarni kiriting:
-- NEXT_PUBLIC_SUPABASE_URL=https://sizning-loyihangiz.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=sizning-anon-kalitingiz
-- =========================================================================
