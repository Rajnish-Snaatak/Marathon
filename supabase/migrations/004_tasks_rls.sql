-- Migration 004: RLS policy for the tasks table (admin task board)

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admins/organizers) have full access to all tasks
CREATE POLICY "Admin full access to tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
