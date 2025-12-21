import postgres from "postgres";

/**
 * Startup migration script - runs before the app starts
 * 
 * This is idempotent - safe to run multiple times.
 * Tables are created using "IF NOT EXISTS" so it won't fail on existing tables.
 * 
 * IMPORTANT: This script will NOT block the app from starting if migration fails.
 * This allows the app to start even if the database isn't available yet.
 */

async function migrate() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.warn("⚠️  DATABASE_URL not set - skipping migrations");
        console.warn("   Set DATABASE_URL to enable automatic migrations");
        process.exit(0); // Don't block app startup
    }

    // Log sanitized connection info for debugging
    try {
        const url = new URL(connectionString);
        console.log(`📍 Database host: ${url.hostname}`);
        console.log(`📍 Database name: ${url.pathname.slice(1)}`);
    } catch {
        console.warn("⚠️  DATABASE_URL is not a valid URL");
    }

    console.log("🔄 Running database migrations...");

    const sql = postgres(connectionString, {
        connect_timeout: 10, // 10 second timeout
    });

    try {
        // Test connection first
        await sql`SELECT 1`;
        console.log("✅ Database connection successful");

        // Create enums (idempotent)
        const enums = [
            { name: "user_role", values: ["admin", "manager", "member"] },
            { name: "task_priority", values: ["low", "medium", "high", "urgent"] },
            { name: "leave_type", values: ["casual", "sick", "privilege"] },
            { name: "leave_status", values: ["pending", "approved", "rejected"] },
            { name: "availability_status", values: ["in-office", "remote", "away", "vacation"] },
            { name: "asset_type", values: ["hardware", "license", "subscription"] },
            { name: "asset_status", values: ["active", "retired", "pending"] },
            { name: "onboarding_status", values: ["pending", "in-progress", "completed"] },
            { name: "feedback_type", values: ["praise", "goal", "check-in", "review"] },
            { name: "feedback_visibility", values: ["private", "manager", "public"] },
            { name: "expense_status", values: ["pending", "approved", "rejected", "reimbursed"] },
            { name: "expense_category", values: ["travel", "meals", "supplies", "software", "equipment", "other"] },
            { name: "risk_severity", values: ["low", "medium", "high", "critical"] },
            { name: "risk_status", values: ["open", "mitigating", "mitigated", "closed"] },
            { name: "approval_type", values: ["leave", "expense", "asset", "document", "other"] },
            { name: "working_pattern", values: ["full-time", "part-time", "contractor", "intern", "probation"] },
            { name: "request_status", values: ["open", "in-progress", "resolved", "closed"] },
            { name: "request_category", values: ["equipment", "access", "document", "reimbursement", "other"] },
            { name: "goal_status", values: ["not-started", "in-progress", "at-risk", "completed", "cancelled"] },
            { name: "blog_post_status", values: ["draft", "published"] },
            { name: "demo_request_status", values: ["pending", "approved", "rejected"] },
        ];

        for (const { name, values } of enums) {
            await sql.unsafe(`
                DO $$ BEGIN
                    CREATE TYPE ${name} AS ENUM (${values.map(v => `'${v}'`).join(", ")});
                EXCEPTION WHEN duplicate_object THEN null; END $$;
            `);
        }
        console.log("✅ Enums created");

        // Create core tables (idempotent with IF NOT EXISTS)
        await sql`
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

        await sql`
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

        await sql`
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

        await sql`
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

        await sql`
            CREATE TABLE IF NOT EXISTS holidays (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                organization_id UUID REFERENCES organizations(id),
                name TEXT NOT NULL,
                date TIMESTAMP NOT NULL,
                is_recurring BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        await sql`
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

        await sql`
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

        await sql`
            CREATE TABLE IF NOT EXISTS demo_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email TEXT NOT NULL,
                name TEXT NOT NULL,
                designation TEXT,
                organization_name TEXT NOT NULL,
                status demo_request_status DEFAULT 'pending' NOT NULL,
                notes TEXT,
                approved_by UUID REFERENCES users(id),
                approved_at TIMESTAMP,
                created_organization_id UUID REFERENCES organizations(id),
                created_user_id UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;

        console.log("✅ Tables created");

        await sql.end();
        console.log("✅ Migration completed successfully!");

    } catch (error) {
        console.error("⚠️  Migration failed (app will continue starting):", error);
        try {
            await sql.end();
        } catch {
            // Ignore close errors
        }
        // DON'T exit with error - let the app start anyway
        // The app can work without migrations if tables already exist
        process.exit(0);
    }
}

migrate();
