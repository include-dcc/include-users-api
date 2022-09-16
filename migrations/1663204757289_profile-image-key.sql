-- Up Migration
ALTER TABLE users 
    ADD COLUMN profile_image_key TEXT;

-- Down Migration
ALTER TABLE users 
    DROP COLUMN profile_image_key;