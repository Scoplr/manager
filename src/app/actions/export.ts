"use server";

/**
 * Data Export Actions
 * 
 * Export organization data in various formats for portability.
 * Supports CSV, JSON, and iCal formats.
 */

import { db } from "@/db";
import { users, tasks, leaves, expenses, payrollRuns, payslips } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireOrgContext } from "@/lib/authorize";

// ============ HELPERS ============

function toCSV(data: Record<string, any>[], columns: { key: string; label: string }[]): string {
    if (data.length === 0) return columns.map(c => c.label).join(",");

    const header = columns.map(c => c.label).join(",");
    const rows = data.map(row =>
        columns.map(c => {
            const value = row[c.key];
            if (value === null || value === undefined) return "";
            if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            if (value instanceof Date) return value.toISOString().split("T")[0];
            return String(value);
        }).join(",")
    );

    return [header, ...rows].join("\n");
}

function toJSON(data: any): string {
    return JSON.stringify(data, null, 2);
}

function toICalEvent(event: { title: string; start: Date; end: Date; description?: string }): string {
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return [
        "BEGIN:VEVENT",
        `DTSTART:${formatDate(event.start)}`,
        `DTEND:${formatDate(event.end)}`,
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description}` : "",
        `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@wrkspace`,
        "END:VEVENT"
    ].filter(Boolean).join("\r\n");
}

// ============ EXPORT EMPLOYEES ============

export async function exportEmployees(format: "csv" | "json" = "csv") {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const employees = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        department: users.department,
        designation: users.designation,
        phone: users.phone,
        status: users.status,
        joinedAt: users.joinedAt,
    }).from(users).where(eq(users.organizationId, orgContext.orgId));

    const columns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "department", label: "Department" },
        { key: "designation", label: "Designation" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status" },
        { key: "joinedAt", label: "Joined Date" },
    ];

    if (format === "json") {
        return {
            data: toJSON(employees),
            filename: `employees-${new Date().toISOString().split("T")[0]}.json`,
            contentType: "application/json"
        };
    }

    return {
        data: toCSV(employees, columns),
        filename: `employees-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv"
    };
}

// ============ EXPORT LEAVES ============

export async function exportLeaves(format: "csv" | "json" | "ical" = "csv") {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const leaveData = await db.select({
        id: leaves.id,
        userName: users.name,
        userEmail: users.email,
        type: leaves.type,
        startDate: leaves.startDate,
        endDate: leaves.endDate,
        reason: leaves.reason,
        status: leaves.status,
        createdAt: leaves.createdAt,
    })
        .from(leaves)
        .leftJoin(users, eq(leaves.userId, users.id))
        .where(eq(leaves.organizationId, orgContext.orgId))
        .orderBy(desc(leaves.createdAt));

    if (format === "ical") {
        const events = leaveData
            .filter(l => l.status === "approved")
            .map(l => toICalEvent({
                title: `${l.userName} - ${l.type} Leave`,
                start: new Date(l.startDate),
                end: new Date(l.endDate),
                description: l.reason || undefined,
            }));

        const ical = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//wrkspace//Leaves//EN",
            ...events,
            "END:VCALENDAR"
        ].join("\r\n");

        return {
            data: ical,
            filename: `leaves-${new Date().toISOString().split("T")[0]}.ics`,
            contentType: "text/calendar"
        };
    }

    const columns = [
        { key: "userName", label: "Employee" },
        { key: "userEmail", label: "Email" },
        { key: "type", label: "Type" },
        { key: "startDate", label: "Start Date" },
        { key: "endDate", label: "End Date" },
        { key: "reason", label: "Reason" },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Requested On" },
    ];

    if (format === "json") {
        return {
            data: toJSON(leaveData),
            filename: `leaves-${new Date().toISOString().split("T")[0]}.json`,
            contentType: "application/json"
        };
    }

    return {
        data: toCSV(leaveData, columns),
        filename: `leaves-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv"
    };
}

// ============ EXPORT TASKS ============

export async function exportTasks(format: "csv" | "json" = "csv") {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const taskData = await db.select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        assigneeName: users.name,
        assigneeEmail: users.email,
        createdAt: tasks.createdAt,
    })
        .from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(eq(tasks.organizationId, orgContext.orgId))
        .orderBy(desc(tasks.createdAt));

    const columns = [
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "dueDate", label: "Due Date" },
        { key: "assigneeName", label: "Assignee" },
        { key: "assigneeEmail", label: "Assignee Email" },
        { key: "createdAt", label: "Created" },
    ];

    if (format === "json") {
        return {
            data: toJSON(taskData),
            filename: `tasks-${new Date().toISOString().split("T")[0]}.json`,
            contentType: "application/json"
        };
    }

    return {
        data: toCSV(taskData, columns),
        filename: `tasks-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv"
    };
}

// ============ EXPORT EXPENSES ============

export async function exportExpenses(format: "csv" | "json" = "csv") {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const expenseData = await db.select({
        id: expenses.id,
        userName: users.name,
        userEmail: users.email,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        status: expenses.status,
        receiptUrl: expenses.receiptUrl,
        submittedAt: expenses.submittedAt,
    })
        .from(expenses)
        .leftJoin(users, eq(expenses.userId, users.id))
        .where(eq(expenses.organizationId, orgContext.orgId))
        .orderBy(desc(expenses.submittedAt));

    const columns = [
        { key: "userName", label: "Employee" },
        { key: "userEmail", label: "Email" },
        { key: "amount", label: "Amount" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description" },
        { key: "status", label: "Status" },
        { key: "receiptUrl", label: "Receipt URL" },
        { key: "submittedAt", label: "Submitted On" },
    ];

    if (format === "json") {
        return {
            data: toJSON(expenseData),
            filename: `expenses-${new Date().toISOString().split("T")[0]}.json`,
            contentType: "application/json"
        };
    }

    return {
        data: toCSV(expenseData, columns),
        filename: `expenses-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv"
    };
}

// ============ EXPORT PAYROLL ============

export async function exportPayroll(format: "csv" | "json" = "csv") {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const payrollData = await db.select({
        runMonth: payrollRuns.month,
        runYear: payrollRuns.year,
        runStatus: payrollRuns.status,
        userName: users.name,
        userEmail: users.email,
        basic: payslips.basic,
        allowances: payslips.allowances,
        deductions: payslips.deductions,
        netSalary: payslips.netSalary,
    })
        .from(payslips)
        .leftJoin(payrollRuns, eq(payslips.runId, payrollRuns.id))
        .leftJoin(users, eq(payslips.userId, users.id))
        .where(eq(payrollRuns.organizationId, orgContext.orgId))
        .orderBy(desc(payrollRuns.year), desc(payrollRuns.month));

    const columns = [
        { key: "runMonth", label: "Month" },
        { key: "runYear", label: "Year" },
        { key: "userName", label: "Employee" },
        { key: "userEmail", label: "Email" },
        { key: "basic", label: "Basic Salary" },
        { key: "allowances", label: "Allowances" },
        { key: "deductions", label: "Deductions" },
        { key: "netSalary", label: "Net Salary" },
        { key: "runStatus", label: "Status" },
    ];

    if (format === "json") {
        return {
            data: toJSON(payrollData),
            filename: `payroll-${new Date().toISOString().split("T")[0]}.json`,
            contentType: "application/json"
        };
    }

    return {
        data: toCSV(payrollData, columns),
        filename: `payroll-${new Date().toISOString().split("T")[0]}.csv`,
        contentType: "text/csv"
    };
}

// ============ EXPORT ALL (Full Org Dump) ============

export async function exportAll() {
    const authResult = await requireAuth();
    if (!authResult.authorized) return { error: "Not authorized" };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const [employeesResult, leavesResult, tasksResult, expensesResult, payrollResult] = await Promise.all([
        exportEmployees("json"),
        exportLeaves("json"),
        exportTasks("json"),
        exportExpenses("json"),
        exportPayroll("json"),
    ]);

    const allData = {
        exportedAt: new Date().toISOString(),
        organizationId: orgContext.orgId,
        employees: employeesResult.data ? JSON.parse(employeesResult.data) : [],
        leaves: leavesResult.data ? JSON.parse(leavesResult.data) : [],
        tasks: tasksResult.data ? JSON.parse(tasksResult.data) : [],
        expenses: expensesResult.data ? JSON.parse(expensesResult.data) : [],
        payroll: payrollResult.data ? JSON.parse(payrollResult.data) : [],
    };

    return {
        data: toJSON(allData),
        filename: `wrkspace-export-${new Date().toISOString().split("T")[0]}.json`,
        contentType: "application/json"
    };
}

// ============ BACKWARD COMPATIBILITY WRAPPERS ============
// These maintain compatibility with existing module export buttons

export async function exportTeamToCSV() {
    const result = await exportEmployees("csv");
    return { csv: result.data || "", filename: result.filename || "employees.csv" };
}

export async function exportExpensesToCSV() {
    const result = await exportExpenses("csv");
    return { csv: result.data || "", filename: result.filename || "expenses.csv" };
}

export async function exportLeavesToCSV() {
    const result = await exportLeaves("csv");
    return { csv: result.data || "", filename: result.filename || "leaves.csv" };
}

export async function exportTasksToCSV() {
    const result = await exportTasks("csv");
    return { csv: result.data || "", filename: result.filename || "tasks.csv" };
}

export async function exportOrganizationData() {
    const result = await exportAll();
    return { success: true, data: result.data || "{}" };
}
