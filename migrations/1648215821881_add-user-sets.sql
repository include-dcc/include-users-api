-- Up Migration
CREATE TABLE user_sets (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    keycloak_id VARCHAR(255) NOT NULL,
    tag TEXT,
    set_type TEXT,
    path TEXT,
    sort TEXT[],
    sqon JSONB NOT NULL DEFAULT '{}'::JSONB,
    creation_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_date TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE user_sets ADD PRIMARY KEY (id);
-- Down Migration
DROP TABLE user_sets;