"use client";

import { sendInvite } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import { UserPlus, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function InviteUserForm() {
    const [isPending, startTransition] = useTransition();
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await sendInvite(formData);
            if ("error" in result) {
                toast.error(result.error);
            } else if (result.success && result.inviteUrl) {
                toast.success(result.message);
                setInviteUrl(result.inviteUrl);
            }
        });
    }

    function copyToClipboard() {
        if (inviteUrl) {
            navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <div className="space-y-6">
            <form action={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="invite-email" className="block text-sm font-medium mb-1">Email *</label>
                    <input
                        id="invite-email"
                        type="email"
                        name="email"
                        required
                        className="w-full border rounded-lg p-2.5 bg-background"
                        placeholder="colleague@company.com"
                    />
                </div>
                <div>
                    <label htmlFor="invite-name" className="block text-sm font-medium mb-1">Name (optional)</label>
                    <input
                        id="invite-name"
                        type="text"
                        name="name"
                        className="w-full border rounded-lg p-2.5 bg-background"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="invite-role" className="block text-sm font-medium mb-1">Role</label>
                    <select
                        id="invite-role"
                        name="role"
                        className="w-full border rounded-lg p-2.5 bg-background"
                    >
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="h-4 w-4" />
                    )}
                    Send Invite
                </button>
            </form>

            {inviteUrl && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        ✅ Invite created! Share this link:
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inviteUrl}
                            readOnly
                            className="flex-1 text-xs p-2 bg-white dark:bg-gray-900 border rounded truncate"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="p-2 rounded bg-green-600 text-white hover:bg-green-700"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                        Link expires in 7 days
                    </p>
                </div>
            )}
        </div>
    );
}
