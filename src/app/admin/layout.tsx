
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, LogOut } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button"; // Assuming I have one or I'll make a simple one.

// Force dynamic rendering since this layout uses auth() which requires headers()
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // Strict Super Admin Check
    if (session?.user?.email !== "haris.edu14@gmail.com") {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-blue-500">◆</span> Super Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/tenants" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        <Building2 className="h-5 w-5" />
                        Tenants
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                            SA
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">Haris</p>
                            <p className="text-xs text-gray-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
