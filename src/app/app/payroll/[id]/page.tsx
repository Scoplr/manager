import { getPayrollRun } from "@/app/actions/payroll";
import { notFound } from "next/navigation";
import { PayrollControls } from "@/components/payroll/payroll-controls";
import { ChevronLeft, Printer, User } from "lucide-react";
import Link from "next/link";

export default async function PayrollRunPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const run = await getPayrollRun(params.id);

    if (!run) notFound();

    return (
        <div className="space-y-6">
            <Link href="/operations/payroll" className="text-sm text-muted-foreground flex items-center gap-1 hover:underline">
                <ChevronLeft className="h-4 w-4" /> Back to Records
            </Link>

            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{run.month} {run.year}</h1>
                    <p className="text-muted-foreground mt-1">Status: <span className="uppercase font-bold text-xs">{run.status}</span></p>
                </div>
                <PayrollControls runId={run.id} status={run.status!} hasItems={run.items.length > 0} />
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {run.items.length === 0 ? (
                    <div className="p-12 text-center bg-muted/20 rounded border border-dashed text-muted-foreground">
                        No payslips generated yet. Click "Generate" to calculate based on employee profiles.
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left border-b font-medium">
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4 text-right">Basic</th>
                                    <th className="p-4 text-right">Allowances</th>
                                    <th className="p-4 text-right">Deductions</th>
                                    <th className="p-4 text-right">Net Salary</th>
                                    <th className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {run.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-muted/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{item.userName}</div>
                                                    <div className="text-xs text-muted-foreground">{item.userRole}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-muted-foreground">${parseInt(item.basic).toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono text-muted-foreground">${parseInt(item.allowances).toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono text-red-500">-${parseInt(item.deductions).toLocaleString()}</td>
                                        <td className="p-4 text-right font-mono font-bold text-green-700 text-lg">${parseInt(item.netSalary).toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground" title="Print Payslip">
                                                <Printer className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
