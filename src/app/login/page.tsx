"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Building2, User, Briefcase } from "lucide-react";
import { checkUserExists, createDemoRequest } from "@/app/actions/demo-requests";
import Link from "next/link";

type Step = "login" | "no-account" | "trial-form" | "success";

export default function LoginPage() {
    const [step, setStep] = useState<Step>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Trial form state
    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [orgName, setOrgName] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                // Check if user exists
                const exists = await checkUserExists(email);
                if (!exists) {
                    setStep("no-account");
                } else {
                    setError("Invalid email or password. Please try again.");
                }
            } else {
                // Success - redirect
                window.location.href = "/";
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleTrialSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await createDemoRequest({
                email,
                name,
                designation,
                organizationName: orgName,
            });

            if (result.error) {
                setError(result.error);
            } else {
                setStep("success");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Login Step
    if (step === "login") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="w-full max-w-md p-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border dark:border-slate-800">
                        <div className="text-center mb-8">
                            <Link href="/home" className="inline-flex items-center gap-2 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                            <p className="text-muted-foreground mt-2">Sign in to your workspace</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => setStep("no-account")}
                                    className="text-indigo-600 hover:underline font-medium"
                                >
                                    Start free trial
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No Account Step
    if (step === "no-account") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="w-full max-w-md p-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border dark:border-slate-800 text-center">
                        <div className="mb-6">
                            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                                <User className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h1 className="text-2xl font-bold">No account found</h1>
                            <p className="text-muted-foreground mt-2">
                                We couldn't find an account for <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-6 mb-6">
                            <h2 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                                Start your 30-day free trial
                            </h2>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                                No credit card required. No strings attached.
                            </p>
                            <ul className="text-sm text-left text-indigo-700 dark:text-indigo-300 space-y-2">
                                <li>✓ Unlimited team members</li>
                                <li>✓ All features included</li>
                                <li>✓ Cancel anytime</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setStep("trial-form")}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                            >
                                Request Access <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => { setStep("login"); setError(""); }}
                                className="w-full text-muted-foreground py-3 rounded-lg font-medium hover:bg-muted transition-colors"
                            >
                                Back to login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Trial Form Step
    if (step === "trial-form") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="w-full max-w-md p-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border dark:border-slate-800">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold">Start your free trial</h1>
                            <p className="text-muted-foreground mt-2">
                                Tell us about yourself and your organization
                            </p>
                        </div>

                        <form onSubmit={handleTrialSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="trial-email" className="block text-sm font-medium mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="trial-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Your name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="designation" className="block text-sm font-medium mb-2">
                                    Your role <span className="text-muted-foreground">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="designation"
                                        type="text"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        placeholder="HR Manager, CEO, etc."
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="orgName" className="block text-sm font-medium mb-2">
                                    Organization name
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        id="orgName"
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="Acme Inc."
                                        required
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">{error}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isLoading ? "Submitting..." : "Request Access"}
                            </button>
                        </form>

                        <button
                            onClick={() => setStep("no-account")}
                            className="w-full text-muted-foreground py-3 rounded-lg font-medium hover:bg-muted transition-colors mt-3"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success Step
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="w-full max-w-md p-8">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border dark:border-slate-800 text-center">
                    <div className="mb-6">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold">Request submitted!</h1>
                        <p className="text-muted-foreground mt-2">
                            We've received your trial request for <strong>{orgName}</strong>
                        </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 text-left">
                        <h2 className="font-semibold mb-2">What happens next?</h2>
                        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                            <li>Our team will review your request</li>
                            <li>We'll set up your workspace</li>
                            <li>You'll receive an email with login details</li>
                        </ol>
                        <p className="text-sm text-muted-foreground mt-4">
                            This usually takes less than 24 hours.
                        </p>
                    </div>

                    <Link
                        href="/home"
                        className="block w-full text-center text-indigo-600 py-3 rounded-lg font-medium hover:bg-muted transition-colors mt-6"
                    >
                        Back to homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
