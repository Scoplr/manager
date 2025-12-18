import { getUsers } from "@/app/actions/people";
import Link from "next/link";
import { Users, Briefcase, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { AddEmployeeForm } from "@/components/team/add-employee-form";
import { TeamExportButton } from "@/components/team/team-export-button";

export default async function TeamPage() {
    const people = await getUsers();

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <PageHeader
                    icon="Users"
                    iconColor="text-violet-600"
                    iconBg="bg-violet-100"
                    title="Team Directory"
                    description="View and manage your team members."
                    tip="Click on a team member to see their full profile, assigned tasks, and feedback."
                />
                <div className="flex items-center gap-2">
                    <TeamExportButton />
                    <AddEmployeeForm />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {people.map((person) => (
                    <Link
                        key={person.id}
                        href={`/team/${person.id}`}
                        className="group relative flex flex-col gap-3 rounded-lg border bg-card p-6 shadow-sm transition-all hover:bg-accent/50 hover:border-primary/50"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold group-hover:underline">{person.name}</h3>
                                    <p className="text-xs text-muted-foreground">{person.email}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${person.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                {person.role}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>{person.designation || "No Designation"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Joined {person.joinedAt ? format(person.joinedAt, "MMM yyyy") : "N/A"}</span>
                            </div>
                        </div>

                        <div className="mt-2 pt-3 border-t text-xs flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-muted-foreground">View Profile &rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
