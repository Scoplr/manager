import { z } from "zod";

// ============ USER SCHEMAS ============

export const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "manager", "member"]).default("member"),
    department: z.string().optional(),
    designation: z.string().optional(),
    phone: z.string().optional(),
    birthday: z.string().optional().transform(val => val ? new Date(val) : undefined),
    joinedAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    salaryBasic: z.number().optional(),
    salaryAllowances: z.number().optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
    id: z.string().uuid(),
});

// ============ LEAVE SCHEMAS ============

export const requestLeaveSchema = z.object({
    userId: z.string().uuid(),
    type: z.enum(["casual", "sick", "privilege"]),
    startDate: z.string().transform(val => new Date(val)),
    endDate: z.string().transform(val => new Date(val)),
    reason: z.string().optional(),
}).refine(data => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
});

// ============ EXPENSE SCHEMAS ============

export const createExpenseSchema = z.object({
    userId: z.string().uuid(),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
    currency: z.string().default("USD"),
    category: z.enum(["travel", "meals", "supplies", "software", "equipment", "other"]),
    description: z.string().min(3, "Description required"),
    receiptUrl: z.string().url().optional().or(z.literal("")),
});

// ============ TASK SCHEMAS ============

export const createTaskSchema = z.object({
    title: z.string().min(1, "Title required"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    assigneeId: z.string().uuid().optional(),
    dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    tagIds: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    id: z.string().uuid(),
    status: z.enum(["todo", "in_progress", "done"]).optional(),
});

// ============ REQUEST SCHEMAS ============

export const createRequestSchema = z.object({
    requesterId: z.string().uuid(),
    category: z.enum(["equipment", "access", "document", "reimbursement", "other"]),
    title: z.string().min(1, "Title required"),
    description: z.string().optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

// ============ FEEDBACK SCHEMAS ============

export const createFeedbackSchema = z.object({
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
    type: z.enum(["praise", "goal", "check-in", "review"]),
    title: z.string().min(1, "Title required"),
    content: z.string().min(1, "Content required"),
    visibility: z.enum(["private", "manager", "public"]).default("manager"),
});

// ============ DOCUMENT SCHEMAS ============

export const createDocumentSchema = z.object({
    title: z.string().min(1, "Title required"),
    content: z.string().min(1, "Content required"),
    authorId: z.string().uuid(),
    tagIds: z.array(z.string()).optional(),
});

// ============ HELPER FUNCTIONS ============

export function validateFormData<T>(schema: z.ZodSchema<T>, formData: FormData): { data?: T; error?: string } {
    const rawData: Record<string, unknown> = {};
    formData.forEach((value, key) => {
        rawData[key] = value;
    });

    const result = schema.safeParse(rawData);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }
    return { data: result.data };
}

// ============ ANNOUNCEMENT SCHEMAS ============

export const createAnnouncementSchema = z.object({
    title: z.string().min(1, "Title required").max(200),
    content: z.string().min(1, "Content required"),
    priority: z.enum(["normal", "important", "urgent"]).default("normal"),
    publishAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
    expiresAt: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

// ============ ASSET SCHEMAS ============

export const createAssetSchema = z.object({
    name: z.string().min(1, "Name required").max(200),
    type: z.enum(["laptop", "monitor", "phone", "keyboard", "mouse", "headset", "other"]),
    serialNumber: z.string().optional(),
    purchaseDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    purchasePrice: z.string().optional(),
    condition: z.enum(["new", "good", "fair", "poor"]).default("good"),
});

export const assignAssetSchema = z.object({
    assetId: z.string().uuid(),
    userId: z.string().uuid(),
    notes: z.string().optional(),
});

// ============ RISK SCHEMAS ============

export const createRiskSchema = z.object({
    title: z.string().min(1, "Title required").max(200),
    description: z.string().optional(),
    category: z.enum(["operational", "financial", "compliance", "security", "other"]),
    probability: z.enum(["low", "medium", "high"]),
    impact: z.enum(["low", "medium", "high"]),
    mitigation: z.string().optional(),
    ownerId: z.string().uuid().optional(),
});

// ============ MEETING SCHEMAS ============

export const createMeetingSchema = z.object({
    title: z.string().min(1, "Title required").max(200),
    description: z.string().optional(),
    startTime: z.string().transform(val => new Date(val)),
    endTime: z.string().transform(val => new Date(val)),
    location: z.string().optional(),
    attendeeIds: z.array(z.string().uuid()).optional(),
}).refine(data => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

// ============ ONBOARDING SCHEMAS ============

export const createOnboardingTemplateSchema = z.object({
    name: z.string().min(1, "Name required").max(100),
    description: z.string().optional(),
    department: z.string().optional(),
    steps: z.array(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueInDays: z.number().min(0).max(90).optional(),
        assignedRole: z.enum(["hr", "manager", "it", "employee"]).optional(),
    })).min(1, "At least one step required"),
});

// ============ PAYROLL SCHEMAS ============

export const processPayrollSchema = z.object({
    period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be YYYY-MM format"),
    userIds: z.array(z.string().uuid()).optional(),
});

// ============ CONFIG/SETTINGS SCHEMAS ============

export const updateOrganizationSchema = z.object({
    name: z.string().min(1, "Name required").max(100).optional(),
    industry: z.string().optional(),
    size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
    timezone: z.string().optional(),
    currency: z.string().length(3).optional(),
});

export const createDepartmentSchema = z.object({
    name: z.string().min(1, "Name required").max(100),
    description: z.string().optional(),
    managerId: z.string().uuid().optional(),
});

export const createHolidaySchema = z.object({
    name: z.string().min(1, "Name required").max(100),
    date: z.string().transform(val => new Date(val)),
    isOptional: z.boolean().default(false),
});

export const createLeavePolicySchema = z.object({
    name: z.string().min(1, "Name required").max(100),
    casualDays: z.number().min(0).max(365),
    sickDays: z.number().min(0).max(365),
    privilegeDays: z.number().min(0).max(365),
    carryOverLimit: z.number().min(0).max(30).optional(),
    minNoticeDays: z.number().min(0).max(30).optional(),
});

export const createExpenseCategorySchema = z.object({
    name: z.string().min(1, "Name required").max(50),
    limit: z.number().min(0).optional(),
    requiresApproval: z.boolean().default(true),
});

// ============ APPROVAL SCHEMAS ============

export const bulkApprovalSchema = z.object({
    ids: z.array(z.string().uuid()).min(1, "Select at least one item"),
    action: z.enum(["approve", "reject"]),
    reason: z.string().optional(),
});

// ============ SEARCH/FILTER SCHEMAS ============

export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
    startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
}).refine(data => {
    if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
    }
    return true;
}, {
    message: "End date must be after start date",
});

// ============ ID VALIDATION ============

export const uuidSchema = z.string().uuid("Invalid ID format");

export function validateId(id: unknown): { id?: string; error?: string } {
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
        return { error: "Invalid ID format" };
    }
    return { id: result.data };
}

