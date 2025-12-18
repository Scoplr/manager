import { pgTable, text, timestamp, uuid, boolean, pgEnum, json, integer, index } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "member"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);
export const leaveTypeEnum = pgEnum("leave_type", ["casual", "sick", "privilege"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);

// Multi-Tenancy: Organizations Table
export const organizations = pgTable("organizations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    logo: text("logo"), // URL to logo image
    settings: json("settings").$type<{
        theme?: "light" | "dark";
        primaryColor?: string;
        address?: string;
        phone?: string;
        timezone?: string;
        // Module configuration from setup wizard
        moduleConfig?: {
            profile: "lean" | "growing" | "established" | "custom";
            teamSize: "tiny" | "small" | "medium";
            workStyle: "remote" | "hybrid" | "office";
            priorities: string[];
            enabledModules: string[];
            hiddenModules: string[];
        };
        setupCompleted?: boolean;
    }>().default({}),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status").default("active"), // active, past_due, canceled, trialing
    plan: text("plan").default("free"), // free, pro, enterprise
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaves = pgTable("leaves", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: leaveTypeEnum("type").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    reason: text("reason"),
    status: leaveStatusEnum("status").default("pending").notNull(),
    approvedBy: uuid("approved_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    statusIdx: index("leaves_status_idx").on(table.status),
    userIdx: index("leaves_user_idx").on(table.userId),
    orgStatusIdx: index("leaves_org_status_idx").on(table.organizationId, table.status),
}));

export const availabilityStatusEnum = pgEnum("availability_status", ["in-office", "remote", "away", "vacation"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name"),
    email: text("email").unique().notNull(),
    password: text("password"), // Hashed password
    status: text("status").default("active").notNull(), // active, disabled, invited
    inviteToken: text("invite_token"),
    inviteExpires: timestamp("invite_expires"),
    role: userRoleEnum("role").default("member").notNull(),
    department: text("department"),
    designation: text("designation"),
    phone: text("phone"),
    birthday: timestamp("birthday"), // For birthday calendar
    joinedAt: timestamp("joined_at"),
    availabilityStatus: availabilityStatusEnum("availability_status").default("in-office"),
    workingHours: json("working_hours").$type<{
        start: string;
        end: string;
        timezone: string;
    }>().default({ start: "09:00", end: "17:00", timezone: "UTC" }),
    salaryDetails: json("salary_details").$type<{
        basic: number;
        allowances: number;
        bankAccount?: string;
    }>(),
    leaveBalance: json("leave_balance").$type<{
        casual: number;
        sick: number;
        privilege: number;
    }>().default({ casual: 12, sick: 10, privilege: 15 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payrollRuns = pgTable("payroll_runs", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    month: text("month").notNull(), // e.g. "January" or "01"
    year: text("year").notNull(), // e.g. "2024"
    status: text("status").default("draft").notNull(), // draft, completed
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payslips = pgTable("payslips", {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id").references(() => payrollRuns.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    basic: text("basic").notNull(), // Storing as text to avoid precision issues, or use numeric in real app. integer for cents is best but for MVP number/text ok. Let's use integer.
    allowances: text("allowances").notNull(),
    deductions: text("deductions").default("0").notNull(),
    netSalary: text("net_salary").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    authorId: uuid("author_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    projectId: uuid("project_id"), // Link to projects table
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").default("todo").notNull(), // todo, in-progress, done
    priority: taskPriorityEnum("priority").default("medium").notNull(),
    assigneeId: uuid("assignee_id").references(() => users.id),
    dueDate: timestamp("due_date"),
    // Recurring task fields
    isRecurring: boolean("is_recurring").default(false),
    recurrencePattern: text("recurrence_pattern"), // "daily", "weekly", "monthly", "yearly"
    recurrenceInterval: integer("recurrence_interval").default(1), // every X days/weeks/etc
    recurrenceEndDate: timestamp("recurrence_end_date"),
    parentTaskId: uuid("parent_task_id"), // For recurring instances, link to template
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    statusIdx: index("tasks_status_idx").on(table.status),
    assigneeIdx: index("tasks_assignee_idx").on(table.assigneeId),
    dueDateIdx: index("tasks_due_date_idx").on(table.dueDate),
    orgStatusIdx: index("tasks_org_status_idx").on(table.organizationId, table.status),
}));

export const taskDependencies = pgTable("task_dependencies", {
    id: uuid("id").defaultRandom().primaryKey(),
    blockerId: uuid("blocker_id").references(() => tasks.id).notNull(),
    blockedId: uuid("blocked_id").references(() => tasks.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(), // Removed unique() as tags are now org-scoped
    color: text("color").default("blue"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskTags = pgTable("task_tags", {
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    tagId: uuid("tag_id").references(() => tags.id).notNull(),
}, (t) => ({
    pk: { columns: [t.taskId, t.tagId] },
}));

export const documentTags = pgTable("document_tags", {
    documentId: uuid("document_id").references(() => documents.id).notNull(),
    tagId: uuid("tag_id").references(() => tags.id).notNull(),
}, (t) => ({
    pk: { columns: [t.documentId, t.tagId] },
}));

export const documents = pgTable("documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    title: text("title").notNull(),
    content: text("content").notNull(), // Markdown content
    authorId: uuid("author_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentVersions = pgTable("document_versions", {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id").references(() => documents.id).notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const docTemplates = pgTable("doc_templates", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    category: text("category").default("General"), // HR, Legal, etc.
    content: text("content").notNull(), // Markdown with {{variables}}
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(), // 'info', 'success', 'warning', 'error'
    title: text("title").notNull(),
    message: text("message"),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcements = pgTable("announcements", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    title: text("title").notNull(),
    content: text("content").notNull(), // Markdown
    priority: text("priority").default("normal").notNull(), // normal, important, urgent
    pinned: boolean("pinned").default(false).notNull(),
    authorId: uuid("author_id").references(() => users.id).notNull(),
    expiresAt: timestamp("expires_at"), // Auto-hide after
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Announcement Read Receipts
export const announcementReads = pgTable("announcement_reads", {
    id: uuid("id").defaultRandom().primaryKey(),
    announcementId: uuid("announcement_id").references(() => announcements.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    readAt: timestamp("read_at").defaultNow().notNull(),
});

export const assetTypeEnum = pgEnum("asset_type", ["hardware", "license", "subscription"]);
export const assetStatusEnum = pgEnum("asset_status", ["active", "retired", "pending"]);

export const assets = pgTable("assets", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(), // "MacBook Pro 16"
    type: assetTypeEnum("type").notNull(),
    serialNumber: text("serial_number"),
    assignedTo: uuid("assigned_to").references(() => users.id),
    purchaseDate: timestamp("purchase_date"),
    renewalDate: timestamp("renewal_date"), // For subscriptions/licenses
    cost: text("cost"), // Store as text for flexibility
    notes: text("notes"),
    status: assetStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Onboarding Flow
export const onboardingTemplates = pgTable("onboarding_templates", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(), // "Engineering Starter", "Sales Onboarding"
    description: text("description"),
    steps: json("steps").$type<Array<{
        title: string;
        description?: string;
        type: "task" | "document" | "checklist";
        required: boolean;
    }>>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const onboardingStatusEnum = pgEnum("onboarding_status", ["pending", "in-progress", "completed"]);

export const onboardingProgress = pgTable("onboarding_progress", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(), // New hire
    templateId: uuid("template_id").references(() => onboardingTemplates.id).notNull(),
    status: onboardingStatusEnum("status").default("pending").notNull(),
    completedSteps: json("completed_steps").$type<number[]>().default([]), // Array of step indices
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

// Performance Reviews / Feedback
export const feedbackTypeEnum = pgEnum("feedback_type", ["praise", "goal", "check-in", "review"]);
export const feedbackVisibilityEnum = pgEnum("feedback_visibility", ["private", "manager", "public"]);

export const feedback = pgTable("feedback", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
    toUserId: uuid("to_user_id").references(() => users.id).notNull(),
    type: feedbackTypeEnum("type").notNull(),
    title: text("title").notNull(), // "Q1 Goals", "Great job on launch!", "Weekly Check-in"
    content: text("content").notNull(), // Markdown
    linkedTaskId: uuid("linked_task_id").references(() => tasks.id),
    period: text("period"), // "Q1 2024", "January 2024"
    visibility: feedbackVisibilityEnum("visibility").default("manager").notNull(),
    status: text("status").default("active").notNull(), // active, completed (for goals)
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expense Management
export const expenseStatusEnum = pgEnum("expense_status", ["pending", "approved", "rejected", "reimbursed"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["travel", "meals", "supplies", "software", "equipment", "other"]);

export const expenses = pgTable("expenses", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    userId: uuid("user_id").references(() => users.id).notNull(),
    amount: text("amount").notNull(), // Store as text for flexibility
    currency: text("currency").default("USD").notNull(),
    category: expenseCategoryEnum("category").notNull(),
    description: text("description").notNull(),
    receiptUrl: text("receipt_url"), // File path/URL
    status: expenseStatusEnum("status").default("pending").notNull(),
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    reimbursedAt: timestamp("reimbursed_at"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => ({
    statusIdx: index("expenses_status_idx").on(table.status),
    userIdx: index("expenses_user_idx").on(table.userId),
    orgStatusIdx: index("expenses_org_status_idx").on(table.organizationId, table.status),
}));

// Meeting Notes
export const meetings = pgTable("meetings", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    title: text("title").notNull(),
    date: timestamp("date").notNull(),
    attendees: json("attendees").$type<string[]>().default([]), // User IDs
    notes: text("notes").notNull(), // Markdown
    actionItems: json("action_items").$type<Array<{ text: string; taskId?: string; completed: boolean }>>().default([]),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pulse Checks / Team Health
export const pulseResponses = pgTable("pulse_responses", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    userId: uuid("user_id").references(() => users.id), // Optional for anonymous
    weekOf: timestamp("week_of").notNull(),
    workloadRating: integer("workload_rating").notNull(), // 1-5
    clarityRating: integer("clarity_rating").notNull(), // 1-5
    blockers: text("blockers"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Risk Register
export const riskSeverityEnum = pgEnum("risk_severity", ["low", "medium", "high", "critical"]);
export const riskStatusEnum = pgEnum("risk_status", ["open", "mitigating", "mitigated", "closed"]);

export const risks = pgTable("risks", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    title: text("title").notNull(),
    description: text("description"),
    severity: riskSeverityEnum("severity").default("medium").notNull(),
    status: riskStatusEnum("status").default("open").notNull(),
    ownerId: uuid("owner_id").references(() => users.id),
    mitigation: text("mitigation"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ CONFIGURATION LAYER ============

// Departments / Teams
export const departments = pgTable("departments", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    headId: uuid("head_id").references(() => users.id), // Department head
    parentId: uuid("parent_id"), // For sub-departments
    settings: json("settings").$type<{
        maxLeavePerDay?: number; // Capacity rule
        noMeetingDays?: string[]; // e.g., ["Tuesday"]
        customRules?: string;
    }>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leave Policies
export const leavePolicies = pgTable("leave_policies", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(), // "Default Policy", "Contractors Policy"
    annualAllowance: integer("annual_allowance").default(20).notNull(),
    sickAllowance: integer("sick_allowance").default(10).notNull(),
    carryOverLimit: integer("carry_over_limit").default(5), // Max days to carry over
    halfDayEnabled: boolean("half_day_enabled").default(true),
    requiresMedicalProof: boolean("requires_medical_proof").default(false),
    minDaysNotice: integer("min_days_notice").default(3), // Must apply X days ahead
    blockoutDates: json("blockout_dates").$type<string[]>().default([]), // Dates when leave is blocked
    isDefault: boolean("is_default").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Public Holidays
export const holidays = pgTable("holidays", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    date: timestamp("date").notNull(),
    isRecurring: boolean("is_recurring").default(false), // Repeats yearly
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Approval Rules
export const approvalTypeEnum = pgEnum("approval_type", ["leave", "expense", "asset", "document", "other"]);

export const approvalRules = pgTable("approval_rules", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    type: approvalTypeEnum("type").notNull(),
    name: text("name").notNull(), // "Leave Approval", "Expense Under $100"
    conditions: json("conditions").$type<{
        autoApproveThreshold?: number; // Auto-approve under X days/amount
        requiresManagerApproval?: boolean;
        requiresHRApproval?: boolean;
        requiresFinanceApproval?: boolean;
        appliesToRoles?: string[];
        appliesToDepartments?: string[];
    }>().default({}),
    isActive: boolean("is_active").default(true),
    priority: integer("priority").default(0), // Higher = checked first
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Working Patterns (employment types)
export const workingPatternEnum = pgEnum("working_pattern", ["full-time", "part-time", "contractor", "intern", "probation"]);

export const workingPatterns = pgTable("working_patterns", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    type: workingPatternEnum("type").notNull(),
    weeklyHours: integer("weekly_hours").default(40),
    workDays: json("work_days").$type<string[]>().default(["Mon", "Tue", "Wed", "Thu", "Fri"]),
    leavePolicyId: uuid("leave_policy_id").references(() => leavePolicies.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expense Categories & Limits
export const expenseCategories = pgTable("expense_categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    limit: integer("limit"), // Monthly limit
    requiresReceipt: boolean("requires_receipt").default(true),
    requiresApproval: boolean("requires_approval").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ GLUE LAYER ============

// Activity Feed (org-wide timeline)
export const activityFeed = pgTable("activity_feed", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    actorId: uuid("actor_id").references(() => users.id), // Who did it
    action: text("action").notNull(), // "created", "updated", "approved", "joined", etc.
    entityType: text("entity_type").notNull(), // "task", "leave", "document", "user", etc.
    entityId: uuid("entity_id"), // ID of the affected entity
    description: text("description").notNull(), // Human-readable description
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ PEOPLE MANAGEMENT LAYER ============

// 1:1 Notes (manager-employee check-ins)
export const oneOnOneNotes = pgTable("one_on_one_notes", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    managerId: uuid("manager_id").references(() => users.id).notNull(),
    employeeId: uuid("employee_id").references(() => users.id).notNull(),
    meetingDate: timestamp("meeting_date").notNull(),
    discussionTopics: text("discussion_topics"), // What was discussed
    actionItems: json("action_items").$type<{ text: string; done: boolean }[]>().default([]),
    privateNotes: text("private_notes"), // Manager-only notes
    mood: text("mood"), // "positive", "neutral", "concerned"
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contract/Probation Tracking
export const employmentRecords = pgTable("employment_records", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    userId: uuid("user_id").references(() => users.id).notNull(),
    employmentType: text("employment_type").notNull(), // "full-time", "contract", "intern"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"), // For contracts
    probationEndDate: timestamp("probation_end_date"),
    probationStatus: text("probation_status").default("ongoing"), // "ongoing", "passed", "extended", "failed"
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ OPS LAYER ============

// Internal Requests / Tickets
export const requestStatusEnum = pgEnum("request_status", ["open", "in-progress", "resolved", "closed"]);
export const requestCategoryEnum = pgEnum("request_category", ["equipment", "access", "document", "reimbursement", "other"]);

export const internalRequests = pgTable("internal_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    requesterId: uuid("requester_id").references(() => users.id).notNull(),
    assigneeId: uuid("assignee_id").references(() => users.id), // Who's handling it
    category: requestCategoryEnum("category").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: requestStatusEnum("status").default("open").notNull(),
    priority: text("priority").default("normal"), // "low", "normal", "high", "urgent"
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company Events (for unified calendar)
export const companyEvents = pgTable("company_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    title: text("title").notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    endDate: timestamp("end_date"), // For multi-day events
    eventType: text("event_type").notNull(), // "birthday", "anniversary", "deadline", "meeting", "other"
    relatedUserId: uuid("related_user_id").references(() => users.id), // For birthdays/anniversaries
    isAllDay: boolean("is_all_day").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ ADDITIONAL FEATURE TABLES ============

// Task Comments (Collaboration)
export const taskComments = pgTable("task_comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    authorId: uuid("author_id").references(() => users.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Approval Delegations
export const approvalDelegations = pgTable("approval_delegations", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    delegatorId: uuid("delegator_id").references(() => users.id).notNull(),
    delegateeId: uuid("delegatee_id").references(() => users.id).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Time Entries (Time Tracking)
export const timeEntries = pgTable("time_entries", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    duration: integer("duration"), // minutes
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Projects (Task Grouping)
export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#3b82f6"),
    status: text("status").default("active").notNull(), // active, archived, completed
    ownerId: uuid("owner_id").references(() => users.id),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals (OKR Tracking)
export const goalStatusEnum = pgEnum("goal_status", ["not-started", "in-progress", "at-risk", "completed", "cancelled"]);

export const goals = pgTable("goals", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    targetValue: integer("target_value"),
    currentValue: integer("current_value").default(0),
    unit: text("unit"), // "tasks", "percentage", "number", "currency"
    dueDate: timestamp("due_date"),
    status: goalStatusEnum("status").default("not-started").notNull(),
    parentId: uuid("parent_id"), // For sub-goals / key results
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Rooms (Meeting Room Booking)
export const rooms = pgTable("rooms", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    capacity: integer("capacity"),
    amenities: json("amenities").$type<string[]>().default([]), // ["projector", "whiteboard", "video_conf"]
    location: text("location"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roomBookings = pgTable("room_bookings", {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id").references(() => rooms.id).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    attendees: json("attendees").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Webhooks
export const webhooks = pgTable("webhooks", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    url: text("url").notNull(),
    events: json("events").$type<string[]>().default([]), // ["leave.approved", "task.created"]
    secret: text("secret").notNull(),
    isActive: boolean("is_active").default(true),
    lastTriggeredAt: timestamp("last_triggered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API Keys
export const apiKeys = pgTable("api_keys", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(), // Store hashed, not plain
    keyPrefix: text("key_prefix").notNull(), // First 8 chars for display
    scopes: json("scopes").$type<string[]>().default(["read"]), // ["read", "write", "admin"]
    expiresAt: timestamp("expires_at"),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Offboarding Templates
export const offboardingTemplates = pgTable("offboarding_templates", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    steps: json("steps").$type<Array<{
        title: string;
        description?: string;
        type: "task" | "checklist" | "document";
        assignedTo: "hr" | "manager" | "it" | "employee";
        required: boolean;
    }>>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const offboardingProgress = pgTable("offboarding_progress", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    templateId: uuid("template_id").references(() => offboardingTemplates.id).notNull(),
    status: text("status").default("pending").notNull(), // pending, in-progress, completed
    completedSteps: json("completed_steps").$type<number[]>().default([]),
    lastWorkingDay: timestamp("last_working_day"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

// Task Attachments
export const taskAttachments = pgTable("task_attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    uploaderId: uuid("uploader_id").references(() => users.id).notNull(),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"), // bytes
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mentor Assignments
export const mentorAssignments = pgTable("mentor_assignments", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    mentorId: uuid("mentor_id").references(() => users.id).notNull(),
    menteeId: uuid("mentee_id").references(() => users.id).notNull(),
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    notes: text("notes"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Multi-Level Approval Chains
export const approvalChains = pgTable("approval_chains", {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(), // "Expense Over $1000", "Leave Over 5 Days"
    type: text("type").notNull(), // "leave", "expense", etc
    steps: json("steps").$type<Array<{
        order: number;
        approverRole?: string; // "manager", "hr", "finance"
        approverUserId?: string; // Specific user
        requiredApprovals: number; // For parallel approvals
    }>>().default([]),
    conditions: json("conditions").$type<{
        minAmount?: number;
        maxAmount?: number;
        minDays?: number;
        categories?: string[];
    }>().default({}),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Approval Chain Progress (tracking individual approval requests)
export const approvalProgress = pgTable("approval_progress", {
    id: uuid("id").defaultRandom().primaryKey(),
    chainId: uuid("chain_id").references(() => approvalChains.id).notNull(),
    entityType: text("entity_type").notNull(), // "leave", "expense"
    entityId: uuid("entity_id").notNull(),
    currentStep: integer("current_step").default(0),
    status: text("status").default("pending").notNull(), // pending, approved, rejected
    stepApprovals: json("step_approvals").$type<Array<{
        step: number;
        approvedBy: string;
        approvedAt: string;
        comment?: string;
    }>>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

// Admin Audit Logs for Super Admin Actions
export const adminAuditLogs = pgTable("admin_audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: text("admin_id").notNull(), // Can be non-UUID for super-admin
    action: text("action").notNull(), // created_tenant, suspended_user, provisioned_user, etc.
    targetType: text("target_type"), // organization, user, etc.
    targetId: text("target_id"),
    metadata: json("metadata").$type<Record<string, unknown>>().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Blog Posts for Marketing
export const blogPostStatusEnum = pgEnum("blog_post_status", ["draft", "published"]);

export const blogPosts = pgTable("blog_posts", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"), // Short description for cards/SEO
    content: text("content").notNull(), // Markdown content
    featuredImage: text("featured_image"), // URL to image
    tags: json("tags").$type<string[]>().default([]),
    authorId: uuid("author_id").references(() => users.id),
    status: blogPostStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    slugIdx: index("blog_slug_idx").on(table.slug),
    statusIdx: index("blog_status_idx").on(table.status),
}));

// Demo Requests for Trial Signups
export const demoRequestStatusEnum = pgEnum("demo_request_status", ["pending", "approved", "rejected"]);

export const demoRequests = pgTable("demo_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    designation: text("designation"),
    organizationName: text("organization_name").notNull(),
    status: demoRequestStatusEnum("status").default("pending").notNull(),
    notes: text("notes"), // Admin notes
    approvedBy: uuid("approved_by").references(() => users.id),
    approvedAt: timestamp("approved_at"),
    createdOrganizationId: uuid("created_organization_id").references(() => organizations.id),
    createdUserId: uuid("created_user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    statusIdx: index("demo_request_status_idx").on(table.status),
    emailIdx: index("demo_request_email_idx").on(table.email),
}));
