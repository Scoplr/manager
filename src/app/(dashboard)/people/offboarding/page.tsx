import { getOffboardingProgress } from "@/app/actions/offboarding";
import Link from "next/link";
import { UserMinus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAnyRole } from "@/lib/role-guards";

export default async function PeopleOffboardingPage() {
    await requireAnyRole(["hr", "admin"], "/people");

    const progressList = await getOffboardingProgress();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {progressList.length} active offboardings
                </p>
                <Link
                    href="/offboarding/start"
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Start Offboarding
                </Link>
            </div>

            {progressList.length === 0 ? (
                <div className="space-y-4">
                    <div className="border rounded-lg p-6 bg-card">
                        <p className="text-muted-foreground mb-4">No active offboardings. Here are best practice checklist items for departing employees:</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <h4 className="font-medium mb-2">🔐 IT & Access</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ Revoke system access</li>
                                    <li>✓ Return laptop/devices</li>
                                    <li>✓ Transfer email/calendar ownership</li>
                                    <li>✓ Remove from all team channels</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <h4 className="font-medium mb-2">📋 HR & Admin</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ Final payroll calculation</li>
                                    <li>✓ Exit interview scheduled</li>
                                    <li>✓ Benefits termination processed</li>
                                    <li>✓ Reference letter prepared</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <h4 className="font-medium mb-2">🤝 Knowledge Transfer</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ Document ongoing projects</li>
                                    <li>✓ Handover meetings with successor</li>
                                    <li>✓ Update shared documentation</li>
                                </ul>
                            </div>
                            <div className="border rounded-lg p-4 bg-muted/30">
                                <h4 className="font-medium mb-2">🏢 Company Property</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ Return access badges</li>
                                    <li>✓ Collect company credit card</li>
                                    <li>✓ Return any uniforms/equipment</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <EmptyState
                        icon="UserMinus"
                        title="Ready to start an offboarding?"
                        description="Use the button above to begin the process for a departing employee."
                        action={{ label: "Start Offboarding", href: "/offboarding/start" }}
                    />
                </div>
            ) : (
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Employee</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Progress</th>
                                    <th className="px-4 py-3 font-medium">Last Day</th>
                                </tr>
                            </thead>
                            <tbody>
                                {progressList.map((p: any) => (
                                    <tr key={p.id} className="border-t hover:bg-muted/25">
                                        <td className="px-4 py-3">
                                            <Link href={`/offboarding/${p.id}`} className="font-medium hover:underline">
                                                {p.userName || "Unknown"}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${p.status === "completed" ? "bg-green-100 text-green-700" :
                                                p.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                                                    "bg-gray-100 text-gray-700"
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full"
                                                    style={{ width: `${(p.completedSteps / p.totalSteps) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {p.lastDay ? new Date(p.lastDay).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
