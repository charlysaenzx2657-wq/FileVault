-- ================================================
-- FileVault — SQL para Supabase
-- Ejecuta esto en: Supabase Dashboard → SQL Editor
-- ================================================

-- 1. Crear tabla de tokens
CREATE TABLE IF NOT EXISTS tokens (
  id          BIGSERIAL PRIMARY KEY,
  token       TEXT UNIQUE NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   BIGINT NOT NULL,
  file_type   TEXT,
  file_path   TEXT NOT NULL,
  downloads   INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_tokens_token ON tokens(token);

-- 3. Permitir lectura y escritura pública (para la demo)
--    En producción real deberías usar autenticación
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública" ON tokens
  FOR SELECT USING (true);

CREATE POLICY "Escritura pública" ON tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización pública" ON tokens
  FOR UPDATE USING (true);
