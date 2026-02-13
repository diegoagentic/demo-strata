import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { name: "Impressions", value: 4000, fill: "#6366f1" }, // Indigo 500
    { name: "Clicks", value: 3000, fill: "#818cf8" },      // Indigo 400
    { name: "Leads", value: 2000, fill: "#a5b4fc" },       // Indigo 300
    { name: "Quotes", value: 1200, fill: "#c7d2fe" },      // Indigo 200
    { name: "Closed", value: 800, fill: "#e0e7ff" },       // Indigo 100
];

export function FunnelBarChart() {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Conversion Funnel</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Marketing to Sales Performance</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            width={80}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#1F2937' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[0, 4, 4, 0]}
                            barSize={32}
                            activeBar={<Rectangle fill="#4f46e5" stroke="#4338ca" />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
