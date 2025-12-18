export function WorkloadTable({ data }: { data: any[] }) {
    if (data.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                No assigned tasks yet
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2 font-medium">Team Member</th>
                        <th className="text-center py-2 font-medium">To Do</th>
                        <th className="text-center py-2 font-medium">In Progress</th>
                        <th className="text-center py-2 font-medium">Done</th>
                        <th className="text-center py-2 font-medium">Active</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row: any) => (
                        <tr key={row.userId} className="border-b last:border-0">
                            <td className="py-2">{row.userName}</td>
                            <td className="text-center py-2">
                                <span className="inline-block min-w-6 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                    {row.todoCount || 0}
                                </span>
                            </td>
                            <td className="text-center py-2">
                                <span className="inline-block min-w-6 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {row.inProgressCount || 0}
                                </span>
                            </td>
                            <td className="text-center py-2">
                                <span className="inline-block min-w-6 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                    {row.doneCount || 0}
                                </span>
                            </td>
                            <td className="text-center py-2">
                                <span className={`inline-block min-w-6 px-2 py-0.5 rounded text-xs font-medium ${(row.totalActive || 0) >= 5
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100"
                                    }`}>
                                    {row.totalActive || 0}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
