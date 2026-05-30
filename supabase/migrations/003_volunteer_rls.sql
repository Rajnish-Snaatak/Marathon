-- Migration 003: RLS policies for volunteer QR scanner page

-- Volunteer entry scan: confirmed → bib_collected
CREATE POLICY "Volunteer entry scan"
  ON participants FOR UPDATE
  TO anon
  USING (status = 'confirmed')
  WITH CHECK (status = 'bib_collected');

-- Volunteer finish scan: bib_collected → certified (also sets certified_at)
CREATE POLICY "Volunteer finish scan"
  ON participants FOR UPDATE
  TO anon
  USING (status = 'bib_collected')
  WITH CHECK (status = 'certified');
