import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ONBOARDING = 'Workspace <onboarding@no-reply.wrkspace.cc>';
const FROM_NOTIFICATIONS = 'Workspace <notifications@no-reply.wrkspace.cc>';
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Generic send email function
export async function sendEmail(options: { to: string; subject: string; html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.log("No RESEND_API_KEY, email would be sent:", options);
        return { success: true };
    }

    try {
        await resend.emails.send({
            from: FROM_ONBOARDING,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { error: "Failed to send email" };
    }
}

export async function sendInviteEmail(email: string, token: string) {
    const inviteUrl = `${APP_URL}/invite?token=${token}`;

    try {
        await resend.emails.send({
            from: FROM_ONBOARDING,
            to: email,
            subject: 'Invitation to Join Organization',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>You've been invited!</h2>
                    <p>An administrator has invited you to join their organization.</p>
                    <p>Click the button below to set your password and activate your account:</p>
                    <a href="${inviteUrl}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Accept Invitation</a>
                    <p style="color: #666; font-size: 14px;">Or copy this link: ${inviteUrl}</p>
                    <p style="color: #666; font-size: 14px;">This link expires in 48 hours.</p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { error: "Failed to send email" };
    }
}

export async function sendNotificationEmail(email: string, subject: string, htmlContent: string) {
    if (!process.env.RESEND_API_KEY) return { error: "No API Key" };

    try {
        await resend.emails.send({
            from: FROM_NOTIFICATIONS,
            to: email,
            subject: subject,
            html: htmlContent,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send notification:", error);
        return { error: "Failed to send" };
    }
}

// ============ SPECIFIC NOTIFICATION FUNCTIONS ============

/**
 * Notify manager of leave request
 */
export async function notifyLeaveRequest(data: {
    managerEmail: string;
    managerName: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
}) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Leave Request</h2>
            <p>Hi ${data.managerName},</p>
            <p><strong>${data.employeeName}</strong> has submitted a leave request:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Type</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.leaveType}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>From</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.startDate}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>To</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.endDate}</td></tr>
                ${data.reason ? `<tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Reason</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.reason}</td></tr>` : ''}
            </table>
            <a href="${APP_URL}/approvals" style="display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Review Request</a>
        </div>
    `;
    return sendNotificationEmail(data.managerEmail, `Leave Request: ${data.employeeName}`, html);
}

/**
 * Notify employee of leave decision
 */
export async function notifyLeaveDecision(data: {
    employeeEmail: string;
    employeeName: string;
    approved: boolean;
    leaveType: string;
    startDate: string;
    endDate: string;
    approverName: string;
}) {
    const status = data.approved ? 'Approved ✅' : 'Rejected ❌';
    const color = data.approved ? '#22c55e' : '#ef4444';

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Leave Request ${status}</h2>
            <p>Hi ${data.employeeName},</p>
            <p>Your ${data.leaveType} leave request (${data.startDate} - ${data.endDate}) has been <span style="color: ${color}; font-weight: bold;">${data.approved ? 'approved' : 'rejected'}</span> by ${data.approverName}.</p>
            <a href="${APP_URL}/leaves" style="display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Leaves</a>
        </div>
    `;
    return sendNotificationEmail(data.employeeEmail, `Leave ${data.approved ? 'Approved' : 'Rejected'}`, html);
}

/**
 * Notify manager of expense submission
 */
export async function notifyExpenseSubmitted(data: {
    managerEmail: string;
    managerName: string;
    employeeName: string;
    amount: string;
    category: string;
    description?: string;
}) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Expense Submitted</h2>
            <p>Hi ${data.managerName},</p>
            <p><strong>${data.employeeName}</strong> submitted an expense:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.amount}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Category</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.category}</td></tr>
                ${data.description ? `<tr><td style="padding: 8px; border: 1px solid #eee;"><strong>Description</strong></td><td style="padding: 8px; border: 1px solid #eee;">${data.description}</td></tr>` : ''}
            </table>
            <a href="${APP_URL}/approvals" style="display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Review Expense</a>
        </div>
    `;
    return sendNotificationEmail(data.managerEmail, `Expense: ${data.amount} - ${data.employeeName}`, html);
}

/**
 * Notify of task assignment
 */
export async function notifyTaskAssigned(data: {
    assigneeEmail: string;
    assigneeName: string;
    taskTitle: string;
    assignerName: string;
    dueDate?: string;
    priority?: string;
    taskId: string;
}) {
    const priorityColors: Record<string, string> = { urgent: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Task Assigned</h2>
            <p>Hi ${data.assigneeName},</p>
            <p><strong>${data.assignerName}</strong> assigned you a task:</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin: 0 0 8px;">${data.taskTitle}</h3>
                ${data.priority ? `<span style="background: ${priorityColors[data.priority] || '#666'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${data.priority.toUpperCase()}</span>` : ''}
                ${data.dueDate ? `<p style="margin: 8px 0 0; color: #666;">Due: ${data.dueDate}</p>` : ''}
            </div>
            <a href="${APP_URL}/tasks/${data.taskId}" style="display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Task</a>
        </div>
    `;
    return sendNotificationEmail(data.assigneeEmail, `Task Assigned: ${data.taskTitle}`, html);
}

/**
 * Notify of overdue task
 */
export async function notifyTaskOverdue(data: {
    assigneeEmail: string;
    assigneeName: string;
    taskTitle: string;
    dueDate: string;
    taskId: string;
}) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>⚠️ Task Overdue</h2>
            <p>Hi ${data.assigneeName},</p>
            <p>This task is overdue:</p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0;">
                <h3 style="margin: 0 0 8px;">${data.taskTitle}</h3>
                <p style="margin: 0; color: #666;">Was due: ${data.dueDate}</p>
            </div>
            <a href="${APP_URL}/tasks/${data.taskId}" style="display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Update Task</a>
        </div>
    `;
    return sendNotificationEmail(data.assigneeEmail, `⚠️ Overdue: ${data.taskTitle}`, html);
}

/**
 * Notify of new announcement
 */
export async function notifyAnnouncement(data: {
    recipientEmail: string;
    recipientName: string;
    title: string;
    content: string;
    authorName: string;
}) {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>📢 New Announcement</h2>
            <p>Hi ${data.recipientName},</p>
            <p><strong>${data.authorName}</strong> posted:</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="margin: 0 0 8px;">${data.title}</h3>
                <p style="margin: 0; color: #666;">${data.content.substring(0, 200)}${data.content.length > 200 ? '...' : ''}</p>
            </div>
            <a href="${APP_URL}/announcements" style="display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Announcement</a>
        </div>
    `;
    return sendNotificationEmail(data.recipientEmail, `📢 ${data.title}`, html);
}

