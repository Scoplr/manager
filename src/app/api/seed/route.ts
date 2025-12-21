import { NextResponse } from "next/server";
import { db } from "@/db";
import { organizations, users, departments, leavePolicies, holidays } from "@/db/schema";
import bcrypt from "bcryptjs";

/**
 * API endpoint to seed the database with demo data
 * POST /api/seed
 * 
 * SECURITY: This should be removed or protected in production!
 */
export async function POST(request: Request) {
    // Simple secret check - not for real production use
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (secret !== "seed-railway-2024") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash("password123", 10);

        // 1. Create Acme Inc organization
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

        // 2. Create departments
        await db.insert(departments).values([
            { organizationId: org.id, name: "Engineering", description: "Software development team" },
            { organizationId: org.id, name: "Human Resources", description: "HR and people ops" },
            { organizationId: org.id, name: "Marketing", description: "Marketing and communications" },
        ]);

        // 3. Create leave policy
        await db.insert(leavePolicies).values({
            organizationId: org.id,
            name: "Standard Policy",
            annualAllowance: 20,
            sickAllowance: 10,
            carryOverLimit: 5,
            halfDayEnabled: true,
            isDefault: true,
        });

        // 4. Create holidays
        await db.insert(holidays).values([
            { organizationId: org.id, name: "New Year's Day", date: new Date("2025-01-01"), isRecurring: true },
            { organizationId: org.id, name: "Christmas Day", date: new Date("2025-12-25"), isRecurring: true },
        ]);

        // 5. Create users
        const usersData = [
            { email: "admin@acme.com", name: "Admin User", role: "admin" as const, department: "Engineering", designation: "CEO" },
            { email: "hr@acme.com", name: "HR Manager", role: "manager" as const, department: "Human Resources", designation: "HR Director" },
            { email: "manager@acme.com", name: "Team Manager", role: "manager" as const, department: "Engineering", designation: "Engineering Manager" },
            { email: "employee@acme.com", name: "Regular Employee", role: "member" as const, department: "Engineering", designation: "Software Engineer" },
            { email: "john@acme.com", name: "John Doe", role: "member" as const, department: "Marketing", designation: "Marketing Specialist" },
            { email: "jane@acme.com", name: "Jane Smith", role: "member" as const, department: "Engineering", designation: "Senior Developer" },
        ];

        for (const userData of usersData) {
            await db.insert(users).values({
                organizationId: org.id,
                password: hashedPassword,
                status: "active",
                joinedAt: new Date(),
                ...userData,
            });
        }

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully!",
            organization: org.name,
            users: usersData.map(u => u.email),
        });

    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({
            error: "Seed failed",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
