import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | wrkspace",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/home" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        Last updated: December 2024
                    </p>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account,
                        use our services, or communicate with us.
                    </p>

                    <h2>2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services,
                        process transactions, and communicate with you.
                    </p>

                    <h2>3. Data Security</h2>
                    <p>
                        We implement appropriate security measures to protect your personal information
                        against unauthorized access, alteration, disclosure, or destruction.
                    </p>

                    <h2>4. Data Retention</h2>
                    <p>
                        We retain your data only for as long as necessary to provide our services and
                        fulfill the purposes described in this policy.
                    </p>

                    <h2>5. Your Rights</h2>
                    <p>
                        You have the right to access, correct, or delete your personal data at any time
                        through your account settings.
                    </p>

                    <h2>6. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at{" "}
                        <a href="mailto:hello@wrkspace.app">hello@wrkspace.app</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
