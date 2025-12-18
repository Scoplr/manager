import { getPayrollRuns } from "@/app/actions/payroll";
import { CreateRunButton } from "@/components/payroll/create-run-button";
import { PayrollGate } from "@/components/payroll/payroll-gate";
import { Banknote, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { requireAnyRole } from "@/lib/role-guards";
import { PageHeader } from "@/components/ui/page-header";

export default async function PayrollPage() {
    // Only HR and Admin can access payroll
    await requireAnyRole(["hr", "admin"], "/");

    const runs = await getPayrollRuns();

    return (
        <div className="space-y-8">
            <PageHeader
                icon="Receipt"
                iconColor="text-green-600"
                iconBg="bg-green-100"
                title="Payroll"
                description="Manage salary runs and generate payslips."
            />

            <PayrollGate>
                <div className="flex justify-end mb-4 pt-8">
                    <CreateRunButton />
                </div>

                <div className="grid gap-4">
                    {runs.length === 0 ? (
                        <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                            No payroll runs yet. Start one to generate payslips.
                        </div>
                    ) : (
                        runs.map((run) => (
                            <Link
                                key={run.id}
                                href={`/payroll/${run.id}`}
                                className="flex items-center justify-between p-6 bg-card border rounded-lg hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded bg-muted/50 flex items-center justify-center border text-muted-foreground">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{run.month} {run.year}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            Created {format(run.createdAt, "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${run.status === 'completed'
                                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                        : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                                        }`}>
                                        {run.status}
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </PayrollGate>
        </div>
    );
}

