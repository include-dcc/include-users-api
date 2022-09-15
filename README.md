# Include Users API

## Pre-requisites

- Node 16+
- Docker

## Get Started

- Install: `npm install`

- Build: `npm run build`

### Run tests

- Run tests: `npm run test`

### Run API localy

- Run docker compose to start a PostgreSQL Database: `docker compose up`

- Fill .env file according to .env.example

- Run DB migration: `npm run migrate up`

- In order for AWS Profile Image upload to work you will need to export your Include profile before starting the server using the following:

```
export AWS_PROFILE=XXX
```

- Start server: `npm run dev`

- Any changes to the api will automatically refresh it.

## Need to update database schema

- Run `npm run migrate create <describe what you want to change>`, example: `npm run migrate create add users email column`

- It creates a file `XXX_add-users-email-column.sql` in migrations directory

- Open it and add your changes inside `-- Up Migration`, also add how to rollback these changes inside `-- Down Migration`

Example: 
```
-- Up Migration
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Down Migration
ALTER TABLE users DROP COLUMN email;
```

- Run `npm run migrate up`, it will apply your last changes.

- Need to rollback ? Run `npm run migrate down`, it will rollback your last changes based on what you defined inside `-- Down Migration`.

- To rollback more than 1 migration, run `npm run migrate down {N}` where N is the number of migrations to rollback.