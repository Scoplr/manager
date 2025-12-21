"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export function AuthButton() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="px-5 py-2.5 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-transparent rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
        );
    }

    if (session) {
        return (
            <Link
                href="/app/inbox"
                className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                Go to App
            </Link>
        );
    }

    return (
        <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
            Sign In
        </Link>
    );
}
