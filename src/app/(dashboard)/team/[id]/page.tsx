import { getUser } from "@/app/actions/people";
import { getTasks } from "@/app/actions/tasks";
import { getLeaves } from "@/app/actions/leave";
import { notFound } from "next/navigation";
import { User, Calendar, CreditCard, Palmtree, CheckSquare, MessageSquare, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { EditProfileForm } from "@/components/team/edit-profile-form";

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const [user, allTasks, allLeaves] = await Promise.all([
        getUser(params.id),
        getTasks(),
        getLeaves(),
    ]);

    if (!user) {
        notFound();
    }

    // Filter tasks and leaves for this user
    const userTasks = allTasks.filter(t => t.assigneeId === params.id).slice(0, 5);
    const userLeaves = allLeaves.filter(l => l.userId === params.id).slice(0, 5);

    const salary = user.salaryDetails as { basic: number; allowances: number; bankAccount?: string } | null;
    const leaves = user.leaveBalance as { casual: number; sick: number; privilege: number } | null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-8">
                <div className="flex items-start gap-6">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-12 w-12" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">{user.designation || "No Designation"} • {user.department || "No Department"}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border">
                                {user.role}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Joined {user.joinedAt ? format(user.joinedAt, "MMMM d, yyyy") : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
                <EditProfileForm user={user} />
            </div>

            {/* 360 View Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Column 1: Tasks */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold">Assigned Tasks</h2>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {userTasks.length}
                        </span>
                    </div>

                    {userTasks.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">No tasks assigned</p>
                    ) : (
                        <div className="space-y-2">
                            {userTasks.map(task => (
                                <Link
                                    key={task.id}
                                    href={`/tasks/${task.id}`}
                                    className="block p-2 -mx-2 rounded hover:bg-muted transition-colors"
                                >
                                    <p className="text-sm font-medium truncate">{task.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={`px-1.5 py-0.5 rounded ${task.status === 'done' ? 'bg-green-100 text-green-700' :
                                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100'
                                            }`}>
                                            {task.status}
                                        </span>
                                        {task.dueDate && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(task.dueDate), "MMM d")}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 2: Leaves */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Palmtree className="h-5 w-5 text-green-600" />
                            <h2 className="font-semibold">Leave History</h2>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {userLeaves.length}
                        </span>
                    </div>

                    {/* Balance summary */}
                    {leaves && (
                        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                            <div className="bg-orange-50 p-2 rounded">
                                <p className="font-bold text-orange-700">{leaves.casual}</p>
                                <p className="text-orange-600">Casual</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                                <p className="font-bold text-blue-700">{leaves.sick}</p>
                                <p className="text-blue-600">Sick</p>
                            </div>
                            <div className="bg-purple-50 p-2 rounded">
                                <p className="font-bold text-purple-700">{leaves.privilege}</p>
                                <p className="text-purple-600">Privilege</p>
                            </div>
                        </div>
                    )}

                    {userLeaves.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">No leave history</p>
                    ) : (
                        <div className="space-y-2">
                            {userLeaves.map(leave => (
                                <div key={leave.id} className="p-2 -mx-2 rounded border-l-2 border-l-green-500 bg-muted/30">
                                    <p className="text-sm font-medium capitalize">{leave.type} Leave</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className={`px-1.5 py-0.5 rounded ${leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {leave.status}
                                        </span>
                                        <span>
                                            {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Column 3: Compensation */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 border-b pb-4 mb-4">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        <h2 className="font-semibold">Compensation</h2>
                    </div>

                    {salary ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase">Basic</span>
                                    <p className="font-mono text-lg">${salary.basic.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase">Allowances</span>
                                    <p className="font-mono text-lg">${salary.allowances.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded text-sm flex justify-between items-center">
                                <span className="font-medium">Total Monthly:</span>
                                <span className="font-bold text-green-600 font-mono">
                                    ${(salary.basic + salary.allowances).toLocaleString()}
                                </span>
                            </div>
                            <div className="pt-2">
                                <span className="text-xs text-muted-foreground uppercase">Bank Account</span>
                                <p className="font-mono text-sm">{salary.bankAccount || "Not on file"}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">No salary details configured.</p>
                    )}

                    {/* Contact Info */}
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="text-xs text-muted-foreground uppercase mb-2">Contact</h3>
                        <p className="text-sm">{user.email}</p>
                        {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
