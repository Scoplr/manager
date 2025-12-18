import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/manager";

// Configure connection pooling for better scalability
// - max: maximum number of connections in the pool
// - idle_timeout: seconds before idle connection is closed
// - connect_timeout: seconds to wait for connection
const client = postgres(connectionString, {
    prepare: false,  // Required for "Transaction" pool mode
    max: 20,         // Maximum connections (adjust based on Postgres max_connections / app instances)
    idle_timeout: 30, // Close idle connections after 30s
    connect_timeout: 10, // Timeout after 10s if can't connect
});

export const db = drizzle(client, { schema });

