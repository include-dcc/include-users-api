import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT || 1212;

export const keycloakURL = process.env.KEYCLOAK_URL;
export const keycloakRealm = process.env.KEYCLOAK_REALM;
export const keycloakClient = process.env.KEYCLOAK_CLIENT;
export const keycloakPublicKey = process.env.KEYCLOAK_PUBLIC_KEY;

export const profileImageBucket = process.env.PROFILE_IMAGE_BUCKET;

export const dbHost = process.env.DATABASE_HOST;
export const dbPort: number = Number.parseInt(process.env.DATABASE_PORT);
export const dbName = process.env.DATABASE_NAME;
export const dbUser = process.env.DATABASE_USER;
export const dbPassword = process.env.DATABASE_PASSWORD;
