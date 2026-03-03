-- ============================================================
-- ExcelPro Washers — pgvector Semantic Search
-- Enables AI-powered meaning-based search across CRM data
-- Run this in Supabase SQL Editor AFTER the main migration
-- ============================================================

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create embeddings table for semantic search
-- Stores vector embeddings for any CRM record (client, job, lead, etc.)
CREATE TABLE IF NOT EXISTS crm_embeddings (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,          -- 'client', 'job', 'quote', 'invoice', 'lead', 'request'
  entity_id TEXT NOT NULL,            -- ID of the record in its source table
  content TEXT NOT NULL,              -- The text that was embedded
  embedding vector(1536),             -- OpenAI ada-002 / Voyage embeddings (1536 dims)
  metadata JSONB DEFAULT '{}'::jsonb, -- Extra context (name, status, etc.)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(entity_type, entity_id)      -- One embedding per record
);

-- 3. Create an index for fast similarity search (IVFFlat)
-- Will be used once there are enough rows; falls back to exact scan for small datasets
CREATE INDEX IF NOT EXISTS idx_crm_embeddings_vector
  ON crm_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- 4. Index for filtering by entity type
CREATE INDEX IF NOT EXISTS idx_crm_embeddings_type ON crm_embeddings(entity_type);
CREATE INDEX IF NOT EXISTS idx_crm_embeddings_entity ON crm_embeddings(entity_type, entity_id);

-- 5. RLS (same open policy as other CRM tables)
ALTER TABLE crm_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON crm_embeddings FOR ALL USING (true) WITH CHECK (true);

-- 6. Similarity search function
-- Usage: SELECT * FROM search_crm('window cleaning Bank Street', 5);
CREATE OR REPLACE FUNCTION search_crm(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.entity_type,
    ce.entity_id,
    ce.content,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding) AS similarity
  FROM crm_embeddings ce
  WHERE (filter_type IS NULL OR ce.entity_type = filter_type)
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
