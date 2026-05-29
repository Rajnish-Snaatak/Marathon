-- Marathon Management Platform — initial schema

CREATE TABLE IF NOT EXISTS participants (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  phone         TEXT,
  age           INTEGER,
  tshirt_size   TEXT        CHECK (tshirt_size IN ('S', 'M', 'L', 'XL')),
  status        TEXT        NOT NULL DEFAULT 'registered'
                            CHECK (status IN ('registered', 'confirmed', 'bib_collected', 'certified')),
  bib_number    INTEGER     UNIQUE,
  certified_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_participants_status     ON participants (status);
CREATE INDEX IF NOT EXISTS idx_participants_bib_number ON participants (bib_number);

-- Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin) have full access
CREATE POLICY "Admin full access"
  ON participants FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anonymous users may only self-register (INSERT, status must be 'registered', no BIB)
CREATE POLICY "Public can register"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (status = 'registered' AND bib_number IS NULL);
