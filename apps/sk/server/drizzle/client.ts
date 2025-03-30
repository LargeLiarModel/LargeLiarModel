import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

// Provide default values for TypeScript
const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_AUTH_TOKEN,
});

export const db = drizzle({ client });
