/**
 * Calendar Export (iCal)
 * 
 * API endpoint to export calendar events in iCal format
 * This allows users to subscribe to their calendar in external apps
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leaves, meetings, users } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Helper to format date for iCal (YYYYMMDDTHHMMSSZ)
function formatICalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Helper to escape special characters in iCal
function escapeICalText(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}

// Generate iCal content
function generateICalendar(events: Array<{
    uid: string;
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}>): string {
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Manager//Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Manager Calendar
`;

    for (const event of events) {
        const uid = `${event.uid}@manager.app`;
        const summary = escapeICalText(event.summary);
        const description = event.description ? escapeICalText(event.description) : "";

        if (event.allDay) {
            // All-day event format
            const startDate = event.start.toISOString().split("T")[0].replace(/-/g, "");
            const endDate = new Date(event.end.getTime() + 86400000)
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "");

            ical += `BEGIN:VEVENT
UID:${uid}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
SUMMARY:${summary}
${description ? `DESCRIPTION:${description}\n` : ""}END:VEVENT
`;
        } else {
            // Timed event
            ical += `BEGIN:VEVENT
UID:${uid}
DTSTART:${formatICalDate(event.start)}
DTEND:${formatICalDate(event.end)}
SUMMARY:${summary}
${description ? `DESCRIPTION:${description}\n` : ""}END:VEVENT
`;
        }
    }

    ical += "END:VCALENDAR";
    return ical;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId");
        const token = searchParams.get("token");

        // For now, we require userId. In production, use a personal access token
        if (!userId) {
            return NextResponse.json(
                { error: "User ID required" },
                { status: 400 }
            );
        }

        // Get date range (default: 90 days back and forward)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90);

        const events: Array<{
            uid: string;
            summary: string;
            description?: string;
            start: Date;
            end: Date;
            allDay?: boolean;
        }> = [];

        // Get user info
        const user = await db
            .select({ name: users.name, organizationId: users.organizationId })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user[0]) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get approved leaves
        const userLeaves = await db
            .select()
            .from(leaves)
            .where(
                and(
                    eq(leaves.userId, userId),
                    eq(leaves.status, "approved"),
                    gte(leaves.endDate, startDate),
                    lte(leaves.startDate, endDate)
                )
            );

        for (const leave of userLeaves) {
            events.push({
                uid: `leave-${leave.id}`,
                summary: `${leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave`,
                description: leave.reason || undefined,
                start: new Date(leave.startDate),
                end: new Date(leave.endDate),
                allDay: true,
            });
        }

        // Get meetings (if table exists)
        try {
            const userMeetings = await db
                .select()
                .from(meetings)
                .where(
                    and(
                        eq(meetings.createdBy, userId),
                        gte(meetings.date, startDate),
                        lte(meetings.date, endDate)
                    )
                );

            for (const meeting of userMeetings) {
                // Meetings use 'date' field, create 1-hour event by default
                const meetingDate = new Date(meeting.date);
                const meetingEnd = new Date(meetingDate.getTime() + 60 * 60 * 1000);

                events.push({
                    uid: `meeting-${meeting.id}`,
                    summary: meeting.title,
                    description: meeting.notes || undefined,
                    start: meetingDate,
                    end: meetingEnd,
                    allDay: false,
                });
            }
        } catch {
            // Meetings table might not exist
        }

        // Generate iCal
        const ical = generateICalendar(events);

        return new NextResponse(ical, {
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="manager-calendar.ics"`,
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Calendar export error:", error);
        return NextResponse.json(
            { error: "Failed to generate calendar" },
            { status: 500 }
        );
    }
}
