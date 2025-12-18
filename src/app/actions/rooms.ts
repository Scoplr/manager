"use server";

/**
 * Room Booking Actions
 * 
 * Meeting room management and booking
 */

import { db } from "@/db";
import { rooms, roomBookings, users } from "@/db/schema";
import { eq, and, gte, lte, or, desc, ne } from "drizzle-orm";
import { requireAuth, requireAdmin, requireOrgContext } from "@/lib/authorize";
import { revalidatePath } from "next/cache";

// Types
export interface Room {
    id: string;
    name: string;
    capacity?: number | null;
    amenities: string[];
    location?: string | null;
    isActive: boolean;
    createdAt: Date;
}

export interface RoomBooking {
    id: string;
    roomId: string;
    roomName?: string;
    userId: string;
    userName?: string | null;
    title: string;
    description?: string | null;
    startTime: Date;
    endTime: Date;
    attendees: string[];
    createdAt: Date;
}

// ============ CREATE ROOM ============

export async function createRoom(formData: FormData) {
    const { authorized, error } = await requireAdmin();
    if (!authorized) return { error };

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return { error: orgContext.error };

    const name = formData.get("name")?.toString()?.trim();
    const capacity = formData.get("capacity")?.toString();
    const location = formData.get("location")?.toString()?.trim();
    const amenitiesStr = formData.get("amenities")?.toString();
    const amenities = amenitiesStr ? amenitiesStr.split(",").map((a) => a.trim()) : [];

    if (!name) {
        return { error: "Room name is required" };
    }

    try {
        const [room] = await db.insert(rooms).values({
            organizationId: orgContext.orgId,
            name,
            capacity: capacity ? parseInt(capacity) : null,
            location: location || null,
            amenities,
        }).returning();

        revalidatePath("/rooms");
        return { success: true, room };
    } catch (error) {
        console.error("Failed to create room:", error);
        return { error: "Failed to create room" };
    }
}

// ============ GET ROOMS ============

export async function getRooms(): Promise<Room[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const orgContext = await requireOrgContext();
    if ("error" in orgContext) return [];

    try {
        const roomList = await db
            .select()
            .from(rooms)
            .where(
                and(
                    eq(rooms.organizationId, orgContext.orgId),
                    eq(rooms.isActive, true)
                )
            )
            .orderBy(rooms.name);

        return roomList.map((r) => ({
            ...r,
            amenities: r.amenities || [],
            isActive: r.isActive ?? true,
        }));
    } catch (error) {
        console.error("Failed to get rooms:", error);
        return [];
    }
}

// ============ BOOK ROOM ============

export async function bookRoom(formData: FormData) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Not authenticated" };

    const roomId = formData.get("roomId")?.toString();
    const title = formData.get("title")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const startTimeStr = formData.get("startTime")?.toString();
    const endTimeStr = formData.get("endTime")?.toString();
    const attendeesStr = formData.get("attendees")?.toString();
    const attendees = attendeesStr ? JSON.parse(attendeesStr) : [];

    if (!roomId || !title || !startTimeStr || !endTimeStr) {
        return { error: "Room, title, start time, and end time are required" };
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (endTime <= startTime) {
        return { error: "End time must be after start time" };
    }

    // Check for conflicts
    const conflicts = await db
        .select({ id: roomBookings.id })
        .from(roomBookings)
        .where(
            and(
                eq(roomBookings.roomId, roomId),
                or(
                    // New booking starts during existing
                    and(lte(roomBookings.startTime, startTime), gte(roomBookings.endTime, startTime)),
                    // New booking ends during existing
                    and(lte(roomBookings.startTime, endTime), gte(roomBookings.endTime, endTime)),
                    // New booking contains existing
                    and(gte(roomBookings.startTime, startTime), lte(roomBookings.endTime, endTime))
                )
            )
        )
        .limit(1);

    if (conflicts[0]) {
        return { error: "This time slot is already booked" };
    }

    try {
        const [booking] = await db.insert(roomBookings).values({
            roomId,
            userId: user.id,
            title,
            description: description || null,
            startTime,
            endTime,
            attendees,
        }).returning();

        revalidatePath("/rooms");
        return { success: true, booking };
    } catch (error) {
        console.error("Failed to book room:", error);
        return { error: "Failed to book room" };
    }
}

// ============ GET ROOM BOOKINGS ============

export async function getRoomBookings(
    roomId?: string,
    date?: Date
): Promise<RoomBooking[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const conditions = [];

    if (roomId) {
        conditions.push(eq(roomBookings.roomId, roomId));
    }

    if (date) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        conditions.push(gte(roomBookings.startTime, dayStart));
        conditions.push(lte(roomBookings.startTime, dayEnd));
    }

    try {
        const bookings = await db
            .select({
                id: roomBookings.id,
                roomId: roomBookings.roomId,
                roomName: rooms.name,
                userId: roomBookings.userId,
                userName: users.name,
                title: roomBookings.title,
                description: roomBookings.description,
                startTime: roomBookings.startTime,
                endTime: roomBookings.endTime,
                attendees: roomBookings.attendees,
                createdAt: roomBookings.createdAt,
            })
            .from(roomBookings)
            .leftJoin(rooms, eq(roomBookings.roomId, rooms.id))
            .leftJoin(users, eq(roomBookings.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(roomBookings.startTime);

        return bookings.map((b) => ({
            ...b,
            roomName: b.roomName || "Unknown Room",
            attendees: b.attendees || [],
        }));
    } catch (error) {
        console.error("Failed to get bookings:", error);
        return [];
    }
}

// ============ CANCEL BOOKING ============

export async function cancelBooking(bookingId: string) {
    const { authorized, user } = await requireAuth();
    if (!authorized || !user) return { error: "Not authenticated" };

    // Verify ownership
    const booking = await db
        .select({ userId: roomBookings.userId })
        .from(roomBookings)
        .where(eq(roomBookings.id, bookingId))
        .limit(1);

    if (!booking[0]) {
        return { error: "Booking not found" };
    }

    if (booking[0].userId !== user.id && user.role === "member") {
        return { error: "You can only cancel your own bookings" };
    }

    try {
        await db.delete(roomBookings).where(eq(roomBookings.id, bookingId));

        revalidatePath("/rooms");
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel booking:", error);
        return { error: "Failed to cancel booking" };
    }
}

// ============ GET AVAILABLE SLOTS ============

export async function getAvailableSlots(
    roomId: string,
    date: Date
): Promise<{ start: string; end: string }[]> {
    const { authorized } = await requireAuth();
    if (!authorized) return [];

    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0); // 8 AM
    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0); // 6 PM

    try {
        const bookings = await db
            .select({
                startTime: roomBookings.startTime,
                endTime: roomBookings.endTime,
            })
            .from(roomBookings)
            .where(
                and(
                    eq(roomBookings.roomId, roomId),
                    gte(roomBookings.startTime, dayStart),
                    lte(roomBookings.endTime, dayEnd)
                )
            )
            .orderBy(roomBookings.startTime);

        // Calculate free slots (simplified - just returns gaps between bookings)
        const slots: { start: string; end: string }[] = [];
        let currentTime = dayStart;

        for (const booking of bookings) {
            if (new Date(booking.startTime) > currentTime) {
                slots.push({
                    start: currentTime.toISOString(),
                    end: booking.startTime.toISOString(),
                });
            }
            currentTime = new Date(booking.endTime);
        }

        if (currentTime < dayEnd) {
            slots.push({
                start: currentTime.toISOString(),
                end: dayEnd.toISOString(),
            });
        }

        return slots;
    } catch (error) {
        console.error("Failed to get available slots:", error);
        return [];
    }
}
