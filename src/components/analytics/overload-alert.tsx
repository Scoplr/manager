import { AlertTriangle } from "lucide-react";

export function OverloadAlert({ users }: { users: any[] }) {
    return (
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Workload Alert</h3>
            </div>
            <p className="text-sm text-yellow-700 mb-2">
                The following team members have 5+ active tasks:
            </p>
            <div className="flex flex-wrap gap-2">
                {users.map((user: any) => (
                    <span
                        key={user.userId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded text-sm"
                    >
                        <span className="font-medium">{user.userName}</span>
                        <span className="text-yellow-700">({user.activeCount} tasks)</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
