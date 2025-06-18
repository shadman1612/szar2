/*
  # Add detailed service information
  
  1. Changes
    - Add new columns to services table:
      - min_participants
      - max_participants
      - min_volunteers
      - max_volunteers
      - start_date
      - end_date
      - is_recurring
      - recurrence_pattern
      - location_type
      - location_address
      - location_details
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE services
ADD COLUMN IF NOT EXISTS min_participants integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_participants integer,
ADD COLUMN IF NOT EXISTS min_volunteers integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_volunteers integer,
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS end_date timestamptz,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern text,
ADD COLUMN IF NOT EXISTS location_type text,
ADD COLUMN IF NOT EXISTS location_address text,
ADD COLUMN IF NOT EXISTS location_details text;

-- Add check constraints
ALTER TABLE services
ADD CONSTRAINT min_participants_check CHECK (min_participants > 0),
ADD CONSTRAINT max_participants_check CHECK (max_participants >= min_participants),
ADD CONSTRAINT min_volunteers_check CHECK (min_volunteers > 0),
ADD CONSTRAINT max_volunteers_check CHECK (max_volunteers >= min_volunteers);