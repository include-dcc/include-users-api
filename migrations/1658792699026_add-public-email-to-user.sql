-- Up Migration
ALTER TABLE users 
    ADD COLUMN public_email TEXT;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN public_email;