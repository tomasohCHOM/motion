CREATE TABLE files (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(512) NOT NULL UNIQUE,
  content_type VARCHAR(127) NOT NULL,
  size_bytes BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
