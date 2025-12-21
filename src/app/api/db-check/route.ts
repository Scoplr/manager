import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Debug endpoint to check database status
 * GET /api/db-check
 */
export async function GET() {
    try {
        // Check if organizations table exists
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        return NextResponse.json({
            success: true,
            tables: result.rows,
            tableCount: result.rows.length,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
