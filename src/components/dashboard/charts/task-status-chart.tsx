"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DataPoint {
    name: string;
    value: number;
    [key: string]: any;
}

const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042'];
// Tailored colors for status: Done (Green), Todo (Gray/Blue), In Progress (Orange) - matching the theme roughly
const STATUS_COLORS: Record<string, string> = {
    "Done": "#22c55e", // green-500
    "Todo": "#94a3b8", // slate-400
    "In-progress": "#f97316", // orange-500
};

export function TaskStatusChart({ data }: { data: DataPoint[] }) {
    if (data.length === 0) return <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>;

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
