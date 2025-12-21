import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "@/db/schema";

/**
 * API endpoint to create/sync database schema
 * POST /api/db-migrate?secret=seed-railway-2024
 * 
 * This uses Drizzle's push-style migration approach programmatically
 */
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== "seed-railway-2024") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            return NextResponse.json({
                error: "DATABASE_URL not set"
            }, { status: 500 });
        }

        // Create tables using raw SQL
        const sqlClient = postgres(connectionString);

        // Create enums first
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE leave_type AS ENUM ('casual', 'sick', 'privilege');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE availability_status AS ENUM ('in-office', 'remote', 'away', 'vacation');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE asset_type AS ENUM ('hardware', 'license', 'subscription');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE asset_status AS ENUM ('active', 'retired', 'pending');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE onboarding_status AS ENUM ('pending', 'in-progress', 'completed');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE feedback_type AS ENUM ('praise', 'goal', 'check-in', 'review');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE feedback_visibility AS ENUM ('private', 'manager', 'public');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE expense_category AS ENUM ('travel', 'meals', 'supplies', 'software', 'equipment', 'other');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE risk_severity AS ENUM ('low', 'medium', 'high', 'critical');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE risk_status AS ENUM ('open', 'mitigating', 'mitigated', 'closed');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE approval_type AS ENUM ('leave', 'expense', 'asset', 'document', 'other');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE working_pattern AS ENUM ('full-time', 'part-time', 'contractor', 'intern', 'probation');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE request_status AS ENUM ('open', 'in-progress', 'resolved', 'closed');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE request_category AS ENUM ('equipment', 'access', 'document', 'reimbursement', 'other');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE goal_status AS ENUM ('not-started', 'in-progress', 'at-risk', 'completed', 'cancelled');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE blog_post_status AS ENUM ('draft', 'published');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;
        await sqlClient`
            DO $$ BEGIN
                CREATE TYPE demo_request_status AS ENUM ('pending', 'approved', 'rejected');
            EXCEPTION WHEN duplicate_object THEN null; END $$;
        `;

        // Create organizations table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS organizations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                logo TEXT,
                settings JSONB DEFAULT '{}',
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                subscription_status TEXT DEFAULT 'active',
                plan TEXT DEFAULT 'free',
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        // Create users table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id),
                name TEXT,
                email TEXT UNIQUE NOT NULL,
                password TEXT,
                status TEXT DEFAULT 'active' NOT NULL,
                invite_token TEXT,
                invite_expires TIMESTAMP,
                role user_role DEFAULT 'member' NOT NULL,
                department TEXT,
                designation TEXT,
                phone TEXT,
                birthday TIMESTAMP,
                joined_at TIMESTAMP,
                availability_status availability_status DEFAULT 'in-office',
                working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00", "timezone": "UTC"}',
                salary_details JSONB,
                leave_balance JSONB DEFAULT '{"casual": 12, "sick": 10, "privilege": 15}',
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        // Create departments table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS departments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id),
                name TEXT NOT NULL,
                description TEXT,
                head_id UUID REFERENCES users(id),
                parent_id UUID,
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        // Create leave_policies table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS leave_policies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id),
                name TEXT NOT NULL,
                annual_allowance INTEGER DEFAULT 20 NOT NULL,
                sick_allowance INTEGER DEFAULT 10 NOT NULL,
                carry_over_limit INTEGER DEFAULT 5,
                half_day_enabled BOOLEAN DEFAULT true,
                requires_medical_proof BOOLEAN DEFAULT false,
                min_days_notice INTEGER DEFAULT 3,
                blockout_dates JSONB DEFAULT '[]',
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        // Create holidays table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS holidays (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id),
                name TEXT NOT NULL,
                date TIMESTAMP NOT NULL,
                is_recurring BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        // Create leaves table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS leaves (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id),
                user_id UUID REFERENCES users(id) NOT NULL,
                type leave_type NOT NULL,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                reason TEXT,
                status leave_status DEFAULT 'pending' NOT NULL,
                approved_by UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        // Create blog_posts table
        await sqlClient`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                excerpt TEXT,
                content TEXT NOT NULL,
                featured_image TEXT,
                tags JSONB DEFAULT '[]',
                author_id UUID REFERENCES users(id),
                status blog_post_status DEFAULT 'draft' NOT NULL,
                published_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        await sqlClient.end();

        return NextResponse.json({
            success: true,
            message: "Database schema created successfully!",
            note: "Core tables created. Run seed endpoint to add demo data.",
        });

    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({
            error: "Migration failed",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
