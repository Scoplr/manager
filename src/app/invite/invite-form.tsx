"use client";

import { useState } from "react";
import { acceptInviteAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function InviteForm({ token, email, name }: { token: string; email: string; name?: string | null }) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await acceptInviteAction(token, password);
            if (result.success) {
                router.push("/login?invited=true");
            } else {
                alert(result.error || "Failed to accept invite");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border w-full max-w-md">
            <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                    <CheckCircle className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {name || email.split('@')[0]}!</h1>
                <p className="text-gray-500 mt-2">Set your password to accept the invitation for <span className="font-medium text-gray-900">{email}</span>.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Set Password & Login
                </button>
            </form>
        </div>
    );
}
