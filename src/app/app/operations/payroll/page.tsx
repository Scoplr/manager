import { getPayrollRuns } from "@/app/actions/payroll";
import { CreateRunButton } from "@/components/payroll/create-run-button";
import { PayrollGate } from "@/components/payroll/payroll-gate";
import { Calendar, ChevronRight, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { requireAnyRole } from "@/lib/role-guards";

export default async function OperationsPayrollPage() {
    await requireAnyRole(["hr", "admin"], "/operations");

    const runs = await getPayrollRuns();

    return (
        <PayrollGate>
            <div className="space-y-6">
                {/* Disclaimer Banner */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100">
                                This is payroll preparation, not payment processing
                            </p>
                            <p className="text-blue-700 dark:text-blue-300 mt-1">
                                Use this to prepare and review payslips before exporting to your payroll provider.
                                For actual payments and tax calculations, export data to{" "}
                                <a href="https://gusto.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                                    Gusto <ExternalLink className="h-3 w-3" />
                                </a>,{" "}
                                <a href="https://www.letsdeel.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">
                                    Deel <ExternalLink className="h-3 w-3" />
                                </a>, or your local provider.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{runs.length} payroll run{runs.length !== 1 ? 's' : ''}</p>
                    <CreateRunButton />
                </div>

                <div className="grid gap-4">
                    {runs.length === 0 ? (
                        <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground">
                            No payroll runs yet. Start one to prepare payslips for review.
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
                                        <p className="text-xs text-muted-foreground">
                                            Created {format(run.createdAt, "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${run.status === 'completed'
                                        ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                        : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                                        }`}>
                                        {run.status}
                                    </span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </PayrollGate>
    );
}
