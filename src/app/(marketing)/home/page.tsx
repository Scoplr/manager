import Link from "next/link";
import { Check, Sparkles, Users, Palmtree, Receipt, Inbox, Calendar, Shield, ArrowRight, Zap, Quote, Star, Clock, TrendingDown } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 dark:text-white">wrkspace</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="#pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Pricing
                        </Link>
                        <Link
                            href="/login"
                            className="px-5 py-2.5 text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6">
                            <Shield className="h-4 w-4" />
                            $25/month flat — No per-seat pricing
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
                            Stop managing your team in
                            <span className="text-indigo-600 dark:text-indigo-400"> 6 different tools</span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                            Time off, approvals, onboarding, and people decisions — finally in one place.
                            Built for teams of 15–60 who hate per-seat pricing.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                            <Link
                                href="/register"
                                className="px-8 py-4 text-lg font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-600/30 flex items-center gap-3"
                            >
                                Start Free Trial
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <div className="text-sm text-slate-500 dark:text-slate-400 pt-3">
                                14-day trial • No credit card
                            </div>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex -space-x-2">
                                {["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500"].map((color, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs text-white font-bold`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-semibold text-slate-900 dark:text-white">50+ teams</span> already switched
                            </div>
                        </div>
                    </div>

                    {/* App Preview Mockup */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
                        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                            {/* Window chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 text-center text-xs text-slate-400">wrkspace</div>
                            </div>

                            {/* App content mockup */}
                            <div className="p-4 space-y-3">
                                {/* Today header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Good morning, Sarah</div>
                                        <div className="text-xs text-slate-500">3 items need your attention</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg">+ Leave</div>
                                        <div className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">+ Expense</div>
                                    </div>
                                </div>

                                {/* Inbox preview */}
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Inbox className="h-4 w-4 text-indigo-600" />
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Inbox</span>
                                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">3</span>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { name: "Alex Chen", type: "Leave request", icon: "🌴" },
                                            { name: "Jordan Lee", type: "Expense claim", icon: "💵" },
                                            { name: "Taylor Kim", type: "Leave request", icon: "🌴" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.icon}</span>
                                                    <div>
                                                        <div className="text-xs font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-[10px] text-slate-500">{item.type}</div>
                                                    </div>
                                                </div>
                                                <button className="px-2 py-1 text-[10px] font-semibold bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors">Approve</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Who's out */}
                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-rose-500" />
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Who's out today</span>
                                    </div>
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white font-bold">A</div>
                                        <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white font-bold">J</div>
                                        <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white font-bold">+2</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats bar */}
            <section className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: "5 min", label: "Average setup time", icon: Clock },
                            { value: "90%", label: "Reduction in Slack chaos", icon: TrendingDown },
                            { value: "$0", label: "Per-seat fees", icon: Receipt },
                            { value: "∞", label: "Team members included", icon: Users },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="flex justify-center mb-2">
                                    <stat.icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Problem */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-4">Sound familiar?</h2>
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                        Every growing team hits the same wall. Tools multiply, communication breaks down, and simple requests become a mess.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            "Slack DMs for leave requests that get lost",
                            "Spreadsheets tracking who's off this week",
                            "No idea what expenses are pending",
                            "Onboarding is a shared doc nobody reads",
                            "Per-seat pricing that punishes growth",
                            "Manager asks \"did you approve that?\" daily",
                        ].map((pain, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                                <span className="text-red-500 text-lg font-bold">✗</span>
                                <span className="text-slate-700 dark:text-slate-200">{pain}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution */}
            <section className="py-20 bg-indigo-600">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        wrkspace replaces all of that
                    </h2>
                    <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                        One place for time off requests, approvals, onboarding, expenses, and team visibility. No more context switching. No more lost messages.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: "Request in 10 seconds", desc: "Leave and expense requests with two taps" },
                            { title: "Approve from anywhere", desc: "Unified inbox, bulk actions, mobile ready" },
                            { title: "See who's out instantly", desc: "Team calendar, no more asking around" },
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-xl bg-white/10 border border-white/20 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <Check className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                </div>
                                <p className="text-indigo-100 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Everything you need, nothing you don't
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We're not Rippling. We're not Notion. We're the operating layer that actually gets used.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Palmtree,
                                title: "Time Off",
                                description: "Requests, approvals, balances, conflict detection. Syncs to your calendar automatically.",
                                iconBg: "bg-emerald-500",
                            },
                            {
                                icon: Inbox,
                                title: "Unified Inbox",
                                description: "Every approval in one place. Leaves, expenses, requests. Bulk approve and move on.",
                                iconBg: "bg-blue-500",
                            },
                            {
                                icon: Users,
                                title: "People Directory",
                                description: "Team profiles, org chart, departments. Know who's who without asking Slack.",
                                iconBg: "bg-violet-500",
                            },
                            {
                                icon: Receipt,
                                title: "Expenses",
                                description: "Submit claims with receipts. Category routing. Export for reimbursement.",
                                iconBg: "bg-amber-500",
                            },
                            {
                                icon: Calendar,
                                title: "Team Calendar",
                                description: "Who's out, holidays, birthdays, room bookings — one unified view.",
                                iconBg: "bg-rose-500",
                            },
                            {
                                icon: Zap,
                                title: "Onboarding",
                                description: "Template checklists for new hires. Progress tracking. Nothing falls through.",
                                iconBg: "bg-indigo-500",
                            },
                        ].map((feature, i) => (
                            <div key={i} className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all">
                                <div className={`h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 shadow-lg`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
                        Teams love wrkspace
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "Finally replaced our chaotic mix of Slack, Google Sheets, and email threads. Setup took 10 minutes.",
                                author: "Sarah M.",
                                role: "Head of Ops, 32-person startup",
                            },
                            {
                                quote: "The flat pricing is amazing. We grew from 20 to 45 people and still pay the same. That never happens.",
                                author: "James K.",
                                role: "COO, Agency",
                            },
                            {
                                quote: "My managers actually use this. That's the biggest win. Previous tools just collected dust.",
                                author: "Maria L.",
                                role: "HR Director, Tech Company",
                            },
                        ].map((testimonial, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <Quote className="h-8 w-8 text-indigo-200 dark:text-indigo-800 mb-2" />
                                <p className="text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.author}</p>
                                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We're Not */}
            <section className="bg-slate-900 py-20">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">What we intentionally don't do</h2>
                    <p className="text-slate-400 mb-10 max-w-xl mx-auto">We stay in our lane so you can trust us with what we do.</p>
                    <div className="grid md:grid-cols-3 gap-6 text-left">
                        {[
                            { title: "No payroll processing", why: "That's Gusto or Deel's job. We prep the data, you run it there." },
                            { title: "No tax calculations", why: "Regulated territory. We stay in our lane so you can trust us." },
                            { title: "No Slack replacement", why: "We integrate with your tools. We don't try to replace them." },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-slate-800 rounded-xl border border-slate-700">
                                <p className="font-semibold text-white mb-2">{item.title}</p>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.why}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 scroll-mt-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Simple, flat pricing
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                        No per-seat fees. No pricing calculators. No surprises when you grow.
                    </p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-12">
                        Pay the same at 15 people or 150.
                    </p>

                    <div className="max-w-md mx-auto">
                        <div className="rounded-3xl border-2 border-indigo-600 bg-white dark:bg-slate-800 p-10 shadow-2xl shadow-indigo-600/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl"></div>

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-sm font-bold mb-6">
                                Best Value
                            </div>

                            <div className="mb-2">
                                <span className="text-6xl font-bold text-slate-900 dark:text-white">$25</span>
                                <span className="text-xl text-slate-500 dark:text-slate-400">/month</span>
                            </div>

                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Per organization</p>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Unlimited users. All features. Forever.</p>

                            <ul className="text-left space-y-4 mb-10">
                                {[
                                    "Unlimited team members",
                                    "All features included",
                                    "Leave management",
                                    "Expense tracking",
                                    "Onboarding checklists",
                                    "Unified approvals inbox",
                                    "Team calendar & directory",
                                    "Export your data anytime",
                                    "Cancel anytime — no lock-in",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-slate-700 dark:text-slate-200">{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className="block w-full py-4 text-center text-lg font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30"
                            >
                                Start 14-Day Free Trial
                            </Link>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                                No credit card required
                            </p>
                        </div>

                        <p className="mt-10 text-slate-600 dark:text-slate-400">
                            Need enterprise features like SSO?{" "}
                            <a href="mailto:hello@wrkspace.app" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                                Let's talk
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to simplify your team ops?
                    </h2>
                    <p className="text-xl text-indigo-100 mb-10 max-w-xl mx-auto">
                        Join 50+ teams who've replaced spreadsheets, Slack chaos, and per-seat nightmares with wrkspace.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors shadow-xl"
                        >
                            Start Free Trial
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <span className="text-indigo-200">No credit card required</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-white">wrkspace</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            © 2024 wrkspace. All rights reserved.
                        </p>
                        <div className="flex items-center gap-8 text-sm text-slate-400">
                            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                            <a href="mailto:hello@wrkspace.app" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
