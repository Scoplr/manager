"use client";

import { deleteDepartment } from "@/app/actions/config";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DepartmentsList({ departments }: { departments: any[] }) {
    const router = useRouter();

    async function handleDelete(id: string) {
        if (confirm("Delete this department?")) {
            await deleteDepartment(id);
            router.refresh();
        }
    }

    if (departments.length === 0) {
        return (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                No departments yet. Add your first one!
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left p-3 font-medium">Department</th>
                        <th className="text-left p-3 font-medium">Head</th>
                        <th className="text-left p-3 font-medium">Max Leave/Day</th>
                        <th className="w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept: any) => (
                        <tr key={dept.id} className="border-t hover:bg-muted/20">
                            <td className="p-3">
                                <p className="font-medium">{dept.name}</p>
                                {dept.description && (
                                    <p className="text-xs text-muted-foreground">{dept.description}</p>
                                )}
                            </td>
                            <td className="p-3 text-muted-foreground">
                                {dept.headName || "—"}
                            </td>
                            <td className="p-3 text-muted-foreground">
                                {dept.settings?.maxLeavePerDay || "—"}
                            </td>
                            <td className="p-3">
                                <button
                                    onClick={() => handleDelete(dept.id)}
                                    className="text-muted-foreground hover:text-red-600 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
