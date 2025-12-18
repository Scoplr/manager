"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({ className }: { className?: string }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={className || "flex items-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-md w-full"}
        >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
        </button>
    );
}
