"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function VelocityChart({ data }: { data: any[] }) {
    if (data.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
                No data yet
            </div>
        );
    }

    // Format week labels
    const chartData = data.map(d => ({
        week: `W${d.week.split("-")[1]}`,
        tasks: Number(d.count),
    }));

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ fontSize: 12 }}
                        formatter={(value) => [`${value ?? 0} tasks`, "Completed"]}
                    />
                    <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
