-- Up Migration
ALTER TABLE users 
    ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT false;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN deleted;