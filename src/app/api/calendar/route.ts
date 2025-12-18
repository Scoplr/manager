import { db } from "@/db";
import { tasks } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    const allTasks = await db.select().from(tasks);

    // Basic iCalendar format
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Manager Platform//MVP//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    allTasks.forEach(task => {
        // Create a VEVENT for each task
        // If no due date, maybe use created date or skip
        // For MVP, lets just put all tasks. If no due date, make it an all-day event today or just skip

        // Skip tasks without due date for calendar view? Or default to today?
        // Let's only include tasks with dueDate for valid calendar entries.
        // Actually earlier schemas didn't strongly enforce dueDate types or presence.
        // Let's assume most don't have it in MVP, so we might want to just dump them as TODOs?
        // VTODO is a valid component.

        icsContent += `BEGIN:VTODO
UID:${task.id}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${task.title}
DESCRIPTION:${task.description || ''}
STATUS:${task.status === 'done' ? 'COMPLETED' : 'NEEDS-ACTION'}
PRIORITY:${getIcalPriority(task.priority)}
${task.dueDate ? `DUE:${new Date(task.dueDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z` : ''}
END:VTODO
`;
    });

    icsContent += `END:VCALENDAR`;

    return new NextResponse(icsContent, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="manager-tasks.ics"',
        },
    });
}

function getIcalPriority(priority: string) {
    // iCal priority: 0 (undefined), 1 (highest) to 9 (lowest)
    switch (priority) {
        case 'urgent': return 1;
        case 'high': return 3;
        case 'medium': return 5;
        case 'low': return 9;
        default: return 0;
    }
}
