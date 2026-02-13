import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { name: "Mon", processing: 10, transit: 15, delivered: 5 },
    { name: "Tue", processing: 12, transit: 18, delivered: 8 },
    { name: "Wed", processing: 8, transit: 20, delivered: 12 },
    { name: "Thu", processing: 15, transit: 25, delivered: 10 },
    { name: "Fri", processing: 20, transit: 22, delivered: 18 },
];

export function LogisticsStatusChart() {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Logistics Pulse</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Weekly Shipping Flows</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#1F2937' }}
                        />
                        <Legend />
                        <Bar dataKey="processing" stackId="a" fill="#f59e0b" name="Processing" radius={[0, 0, 0, 4]} />
                        <Bar dataKey="transit" stackId="a" fill="#3b82f6" name="In Transit" />
                        <Bar dataKey="delivered" stackId="a" fill="#10b981" name="Delivered" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
