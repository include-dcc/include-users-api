-- Up Migration
ALTER TABLE users 
    ADD COLUMN linkedin TEXT;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN linkedin;