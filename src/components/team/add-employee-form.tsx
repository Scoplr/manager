"use client";

import { useState } from "react";
import { createUser } from "@/app/actions/people";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AddEmployeeForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createUser(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Employee added successfully!");
            setIsOpen(false);
            e.currentTarget.reset();
            router.refresh();
        }

        setIsLoading(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
                <UserPlus className="h-4 w-4" />
                Add Employee
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">Add New Employee</h2>
                    <p className="text-sm text-muted-foreground">Enter details to onboard a new team member.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="emp-name" className="block text-sm font-medium mb-1">Full Name *</label>
                            <input
                                id="emp-name"
                                name="name"
                                required
                                className="w-full border rounded-lg p-2.5 bg-background"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="emp-email" className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                id="emp-email"
                                name="email"
                                type="email"
                                required
                                className="w-full border rounded-lg p-2.5 bg-background"
                                placeholder="john@company.com"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="emp-role" className="block text-sm font-medium mb-1">Role</label>
                            <select id="emp-role" name="role" className="w-full border rounded-lg p-2.5 bg-background">
                                <option value="member">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="emp-department" className="block text-sm font-medium mb-1">Department</label>
                            <input
                                id="emp-department"
                                name="department"
                                className="w-full border rounded-lg p-2.5 bg-background"
                                placeholder="Engineering"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="emp-designation" className="block text-sm font-medium mb-1">Designation</label>
                            <input
                                id="emp-designation"
                                name="designation"
                                className="w-full border rounded-lg p-2.5 bg-background"
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div>
                            <label htmlFor="emp-phone" className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                id="emp-phone"
                                name="phone"
                                type="tel"
                                className="w-full border rounded-lg p-2.5 bg-background"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="emp-birthday" className="block text-sm font-medium mb-1">Birthday</label>
                            <input
                                id="emp-birthday"
                                name="birthday"
                                type="date"
                                className="w-full border rounded-lg p-2.5 bg-background"
                            />
                        </div>
                        <div>
                            <label htmlFor="emp-joined" className="block text-sm font-medium mb-1">Join Date</label>
                            <input
                                id="emp-joined"
                                name="joinedAt"
                                type="date"
                                className="w-full border rounded-lg p-2.5 bg-background"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Salary (Optional) */}
                    <div className="pt-4 border-t">
                        <h3 className="text-sm font-medium mb-3">Salary Details (Optional)</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="emp-salary-basic" className="block text-sm text-muted-foreground mb-1">Basic Salary</label>
                                <input
                                    id="emp-salary-basic"
                                    name="salaryBasic"
                                    type="number"
                                    className="w-full border rounded-lg p-2.5 bg-background"
                                    placeholder="5000"
                                />
                            </div>
                            <div>
                                <label htmlFor="emp-salary-allowances" className="block text-sm text-muted-foreground mb-1">Allowances</label>
                                <input
                                    id="emp-salary-allowances"
                                    name="salaryAllowances"
                                    type="number"
                                    className="w-full border rounded-lg p-2.5 bg-background"
                                    placeholder="1000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
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
                            Add Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
