import { db } from "./index";
import { organizations, users, departments, leavePolicies, holidays } from "./schema";
import bcrypt from "bcryptjs";

/**
 * Seed script for Railway database
 * Run: npx tsx src/db/seed.ts
 * 
 * Creates demo organization with test users:
 * - admin@acme.com (admin)
 * - hr@acme.com (manager)
 * - manager@acme.com (manager)
 * - employee@acme.com (member)
 * - john@acme.com (member)
 * - jane@acme.com (member)
 * 
 * All passwords: "password123"
 */

async function seed() {
    console.log("🌱 Starting seed...");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Create Acme Inc organization
    console.log("Creating organization...");
    const [org] = await db.insert(organizations).values({
        name: "Acme Inc",
        settings: {
            theme: "light",
            setupCompleted: true,
            moduleConfig: {
                profile: "growing",
                teamSize: "small",
                workStyle: "hybrid",
                priorities: ["leave", "expenses", "onboarding"],
                enabledModules: ["leave", "expenses", "announcements", "calendar", "team"],
                hiddenModules: [],
            },
        },
        plan: "pro",
        subscriptionStatus: "active",
    }).returning();

    console.log(`✅ Created organization: ${org.name} (${org.id})`);

    // 2. Create departments
    console.log("Creating departments...");
    const [engineeringDept] = await db.insert(departments).values({
        organizationId: org.id,
        name: "Engineering",
        description: "Software development team",
    }).returning();

    const [hrDept] = await db.insert(departments).values({
        organizationId: org.id,
        name: "Human Resources",
        description: "HR and people ops",
    }).returning();

    const [marketingDept] = await db.insert(departments).values({
        organizationId: org.id,
        name: "Marketing",
        description: "Marketing and communications",
    }).returning();

    console.log("✅ Created departments");

    // 3. Create leave policy
    console.log("Creating leave policy...");
    await db.insert(leavePolicies).values({
        organizationId: org.id,
        name: "Standard Policy",
        annualAllowance: 20,
        sickAllowance: 10,
        carryOverLimit: 5,
        halfDayEnabled: true,
        isDefault: true,
    });

    console.log("✅ Created leave policy");

    // 4. Create holidays
    console.log("Creating holidays...");
    await db.insert(holidays).values([
        { organizationId: org.id, name: "New Year's Day", date: new Date("2025-01-01"), isRecurring: true },
        { organizationId: org.id, name: "Christmas Day", date: new Date("2025-12-25"), isRecurring: true },
    ]);

    console.log("✅ Created holidays");

    // 5. Create users
    console.log("Creating users...");

    const usersData = [
        {
            organizationId: org.id,
            email: "admin@acme.com",
            name: "Admin User",
            password: hashedPassword,
            role: "admin" as const,
            department: "Engineering",
            designation: "CEO",
            status: "active",
            joinedAt: new Date("2024-01-01"),
        },
        {
            organizationId: org.id,
            email: "hr@acme.com",
            name: "HR Manager",
            password: hashedPassword,
            role: "manager" as const,
            department: "Human Resources",
            designation: "HR Director",
            status: "active",
            joinedAt: new Date("2024-01-15"),
        },
        {
            organizationId: org.id,
            email: "manager@acme.com",
            name: "Team Manager",
            password: hashedPassword,
            role: "manager" as const,
            department: "Engineering",
            designation: "Engineering Manager",
            status: "active",
            joinedAt: new Date("2024-02-01"),
        },
        {
            organizationId: org.id,
            email: "employee@acme.com",
            name: "Regular Employee",
            password: hashedPassword,
            role: "member" as const,
            department: "Engineering",
            designation: "Software Engineer",
            status: "active",
            joinedAt: new Date("2024-03-01"),
        },
        {
            organizationId: org.id,
            email: "john@acme.com",
            name: "John Doe",
            password: hashedPassword,
            role: "member" as const,
            department: "Marketing",
            designation: "Marketing Specialist",
            status: "active",
            joinedAt: new Date("2024-04-01"),
        },
        {
            organizationId: org.id,
            email: "jane@acme.com",
            name: "Jane Smith",
            password: hashedPassword,
            role: "member" as const,
            department: "Engineering",
            designation: "Senior Developer",
            status: "active",
            joinedAt: new Date("2024-02-15"),
        },
    ];

    for (const userData of usersData) {
        await db.insert(users).values(userData);
        console.log(`  ✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Demo Users:");
    console.log("  Email: admin@acme.com | Password: password123 | Role: Admin");
    console.log("  Email: hr@acme.com | Password: password123 | Role: Manager (HR)");
    console.log("  Email: manager@acme.com | Password: password123 | Role: Manager");
    console.log("  Email: employee@acme.com | Password: password123 | Role: Member");
    console.log("  Email: john@acme.com | Password: password123 | Role: Member");
    console.log("  Email: jane@acme.com | Password: password123 | Role: Member");

    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
