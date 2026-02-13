import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { name: "Week 1", revenue: 590, margin: 80, cnt: 490 },
    { name: "Week 2", revenue: 868, margin: 96, cnt: 590 },
    { name: "Week 3", revenue: 1397, margin: 109, cnt: 350 },
    { name: "Week 4", revenue: 1480, margin: 120, cnt: 480 },
    { name: "Week 5", revenue: 1520, margin: 110, cnt: 460 },
    { name: "Week 6", revenue: 1400, margin: 68, cnt: 380 },
];

export function MarginTrendChart() {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Margin Trends</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Revenue vs Profit Margin (%)</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" scale="band" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
