"use server";

import { db } from "@/db";
import { tags, taskTags } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createTag(name: string, color: string = "blue") {
    // Check if tag exists
    const existing = await db.select().from(tags).where(eq(tags.name, name));
    if (existing.length > 0) {
        return { error: "Tag already exists" };
    }

    const [newTag] = await db.insert(tags).values({
        name,
        color,
    }).returning();

    revalidatePath("/tasks"); // Revalidate tasks as tags might be used there
    return { tag: newTag };
}

export async function getTags() {
    return await db.select().from(tags);
}

export async function addTaskTag(taskId: string, tagId: string) {
    try {
        await db.insert(taskTags).values({
            taskId,
            tagId,
        });
        revalidatePath("/tasks");
    } catch (e) {
        // likely duplicate key, ignore
    }
}

export async function removeTaskTag(taskId: string, tagId: string) {
    await db.delete(taskTags).where(
        and(
            eq(taskTags.taskId, taskId),
            eq(taskTags.tagId, tagId)
        )
    );
    revalidatePath("/tasks");
}

export async function getTaskTags() {
    // Fetch all task tags junction with tag details
    const result = await db.select({
        taskId: taskTags.taskId,
        tagId: tags.id,
        tagName: tags.name,
        tagColor: tags.color,
    })
        .from(taskTags)
        .innerJoin(tags, eq(taskTags.tagId, tags.id));

    return result;
}
