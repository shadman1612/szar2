/*
  # Add participant registrations

  1. New Tables
    - `participant_registrations`
      - Track service participant signups
      - Store participant details and preferences
    
  2. Security
    - Enable RLS
    - Add policies for participant access
*/

CREATE TABLE IF NOT EXISTS participant_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id),
  participant_id uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',
  notes text,
  dietary_requirements text,
  accessibility_needs text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE participant_registrations ENABLE ROW LEVEL SECURITY;

-- Participant registrations policies
CREATE POLICY "Users can view their participant registrations"
  ON participant_registrations FOR SELECT
  USING (auth.uid() = participant_id);

CREATE POLICY "Users can create participant registrations"
  ON participant_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_id);