import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 2000 },
    { name: "Apr", revenue: 2780 },
    { name: "May", revenue: 1890 },
    { name: "Jun", revenue: 2390 },
    { name: "Jul", revenue: 3490 },
];

export function SalesAreaChart() {
    return (
        <div className="h-[400px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Sales Performance</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Revenue trends over the last 7 months</p>
                </div>
                <select className="bg-zinc-100 dark:bg-zinc-800 border-none text-xs rounded-md px-2 py-1 text-zinc-600 dark:text-zinc-300 outline-none">
                    <option>Last 7 Months</option>
                    <option>Last 30 Days</option>
                    <option>Year to Date</option>
                </select>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-brand-fill)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--chart-brand-fill)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(24, 24, 27, 0.9)', // Zinc-900 (Dark) default for dashboards usually looks better, or keep white and use class logic if available. Keeping it simple but branded.
                                borderRadius: '8px',
                                border: '1px solid #27272a', // Zinc-800
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                color: '#F4F4F5' // Zinc-100
                            }}
                            itemStyle={{ color: 'bg-brand-400' }} // Volt Lime text
                            formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--chart-brand-fill)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-brand-300)' }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
