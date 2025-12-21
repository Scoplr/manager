import { NextResponse } from "next/server";

/**
 * Debug endpoint to check database connection and tables
 * GET /api/db-check
 */
export async function GET() {
    try {
        // Use raw postgres connection to avoid drizzle issues
        const postgres = await import("postgres");
        const sql = postgres.default(process.env.DATABASE_URL!);

        // Simple connection test
        const testResult = await sql`SELECT 1 as connected`;

        // List tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `;

        await sql.end();

        return NextResponse.json({
            success: true,
            connected: true,
            tableCount: tables.length,
            tables: tables.map(t => t.table_name),
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
        }, { status: 500 });
    }
}
