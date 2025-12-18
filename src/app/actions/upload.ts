"use server";

import cloudinary from "@/lib/cloudinary";
import { db } from "@/db";
import { documents, users } from "@/db/schema";
import { revalidatePath } from "next/cache";

export interface UploadResult {
    success: boolean;
    url?: string;
    publicId?: string;
    error?: string;
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
    try {
        const file = formData.get("file") as File;
        const userId = formData.get("userId") as string;
        const title = formData.get("title") as string || file.name;

        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "manager/documents",
            resource_type: "auto",
            public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
        });

        // Get author (current user or default first user)
        let authorId = userId;
        if (!authorId) {
            const firstUser = await db.select().from(users).limit(1);
            authorId = firstUser[0]?.id;
        }

        // Save to database
        await db.insert(documents).values({
            title,
            content: `![${title}](${result.secure_url})`,
            authorId,
        });

        revalidatePath("/team");
        revalidatePath("/knowledge");

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error("Upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
}

export async function deleteDocument(publicId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await cloudinary.uploader.destroy(publicId);
        revalidatePath("/knowledge");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Delete failed",
        };
    }
}

