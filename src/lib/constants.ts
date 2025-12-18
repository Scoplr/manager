
// Webhook Events
export const WEBHOOK_EVENTS = [
    "leave.created",
    "leave.approved",
    "leave.rejected",
    "task.created",
    "task.updated",
    "task.completed",
    "expense.submitted",
    "expense.approved",
    "user.created",
    "user.deactivated",
    "announcement.created",
] as const;

// API Scopes
export const API_SCOPES = [
    "read:users",
    "read:tasks",
    "write:tasks",
    "read:leaves",
    "read:announcements",
    "read:documents",
] as const;
