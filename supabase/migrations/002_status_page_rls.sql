-- Migration 002: RLS policies for the public participant status page

-- Allow any visitor to look up participant status by email or BIB number
CREATE POLICY "Public can view participant status"
  ON participants FOR SELECT
  TO anon
  USING (true);

-- Allow an approved participant to confirm themselves (approved → confirmed only)
-- USING: row must currently be 'approved'
-- WITH CHECK: new row must be 'confirmed'
CREATE POLICY "Approved participants can self-confirm"
  ON participants FOR UPDATE
  TO anon
  USING (status = 'approved')
  WITH CHECK (status = 'confirmed');
