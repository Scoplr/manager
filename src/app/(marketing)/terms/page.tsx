import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Terms of Service | wrkspace",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/home" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Terms of Service</h1>

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        Last updated: December 2024
                    </p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using wrkspace, you agree to be bound by these Terms of Service
                        and all applicable laws and regulations.
                    </p>

                    <h2>2. Use License</h2>
                    <p>
                        We grant you a limited, non-exclusive, non-transferable license to access and
                        use our services for your internal business purposes.
                    </p>

                    <h2>3. Account Responsibilities</h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account credentials
                        and for all activities that occur under your account.
                    </p>

                    <h2>4. Subscription and Billing</h2>
                    <p>
                        Subscriptions are billed monthly or annually as selected. All fees are non-refundable
                        except as required by law.
                    </p>

                    <h2>5. Limitation of Liability</h2>
                    <p>
                        wrkspace shall not be liable for any indirect, incidental, special, consequential,
                        or punitive damages arising from your use of our services.
                    </p>

                    <h2>6. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. We will notify you of
                        significant changes via email or through the service.
                    </p>

                    <h2>7. Contact</h2>
                    <p>
                        For questions about these Terms, contact us at{" "}
                        <a href="mailto:hello@wrkspace.app">hello@wrkspace.app</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
