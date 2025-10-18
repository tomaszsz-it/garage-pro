-- migration: update reservation_status enum values
-- purpose: change 'Done' to 'Completed' in reservation_status enum
-- affected tables: reservations

-- update existing 'Done' values to 'Completed' (if any exist)
UPDATE reservations SET status = 'Cancelled' WHERE status = 'Done';

-- drop the default constraint first
ALTER TABLE reservations ALTER COLUMN status DROP DEFAULT;

-- drop and recreate the enum with new values
ALTER TYPE reservation_status RENAME TO reservation_status_old;

CREATE TYPE reservation_status AS ENUM ('New', 'Completed', 'Cancelled');

-- update the column to use the new enum
ALTER TABLE reservations 
  ALTER COLUMN status TYPE reservation_status 
  USING CASE 
    WHEN status::text = 'Done' THEN 'Completed'::reservation_status
    ELSE status::text::reservation_status
  END;

-- set default to 'New' with the new enum type
ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'New'::reservation_status;

-- drop the old enum
DROP TYPE reservation_status_old;
