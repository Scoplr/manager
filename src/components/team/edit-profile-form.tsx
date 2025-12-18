"use client";

import { useState } from "react";
import { updateUser } from "@/app/actions/people";
import { Loader2, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: "admin" | "manager" | "member";
    department: string | null;
    designation: string | null;
    phone: string | null;
    birthday: Date | null;
    availabilityStatus: string | null;
}

export function EditProfileForm({ user, canEditRole = false }: { user: User; canEditRole?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set("id", user.id);

        const result = await updateUser(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Profile updated successfully!");
            setIsOpen(false);
            router.refresh();
        }

        setIsLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
                <Pencil className="h-3 w-3" />
                Edit Profile
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="font-bold">Edit Profile</h2>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium mb-1">Name</label>
                        <input
                            id="profile-name"
                            name="name"
                            defaultValue={user.name || ""}
                            className="w-full border rounded-lg p-2.5 bg-background"
                        />
                    </div>

                    <div>
                        <label htmlFor="profile-email" className="block text-sm font-medium mb-1">Email</label>
                        <input
                            id="profile-email"
                            value={user.email}
                            disabled
                            className="w-full border rounded-lg p-2.5 bg-muted text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>

                    {canEditRole && (
                        <div>
                            <label htmlFor="profile-role" className="block text-sm font-medium mb-1">Role</label>
                            <select
                                id="profile-role"
                                name="role"
                                defaultValue={user.role}
                                className="w-full border rounded-lg p-2.5 bg-background"
                            >
                                <option value="member">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="profile-dept" className="block text-sm font-medium mb-1">Department</label>
                            <input
                                id="profile-dept"
                                name="department"
                                defaultValue={user.department || ""}
                                className="w-full border rounded-lg p-2.5 bg-background"
                            />
                        </div>
                        <div>
                            <label htmlFor="profile-designation" className="block text-sm font-medium mb-1">Designation</label>
                            <input
                                id="profile-designation"
                                name="designation"
                                defaultValue={user.designation || ""}
                                className="w-full border rounded-lg p-2.5 bg-background"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="profile-phone" className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                id="profile-phone"
                                name="phone"
                                defaultValue={user.phone || ""}
                                className="w-full border rounded-lg p-2.5 bg-background"
                            />
                        </div>
                        <div>
                            <label htmlFor="profile-birthday" className="block text-sm font-medium mb-1">Birthday</label>
                            <input
                                id="profile-birthday"
                                name="birthday"
                                type="date"
                                defaultValue={user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : ""}
                                className="w-full border rounded-lg p-2.5 bg-background"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="profile-availability" className="block text-sm font-medium mb-1">Availability</label>
                        <select
                            id="profile-availability"
                            name="availabilityStatus"
                            defaultValue={user.availabilityStatus || "in-office"}
                            className="w-full border rounded-lg p-2.5 bg-background"
                        >
                            <option value="in-office">In Office</option>
                            <option value="remote">Remote</option>
                            <option value="away">Away</option>
                            <option value="vacation">Vacation</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
