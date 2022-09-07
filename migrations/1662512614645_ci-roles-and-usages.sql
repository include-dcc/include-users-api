-- Up Migration
CREATE EXTENSION if not exists citext;
ALTER TABLE users ALTER COLUMN roles TYPE CITEXT[];
ALTER TABLE users ALTER COLUMN portal_usages TYPE CITEXT[];

-- Down Migration
ALTER TABLE users ALTER COLUMN roles TYPE TEXT[];
ALTER TABLE users ALTER COLUMN portal_usages TYPE TEXT[];
DROP EXTENSION citext;