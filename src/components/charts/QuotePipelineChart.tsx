import { Legend, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: "Draft", uv: 31.47, pv: 2400, fill: "#94a3b8" },
    { name: "Sent", uv: 26.69, pv: 4567, fill: "#3b82f6" },
    { name: "Negotiating", uv: 15.69, pv: 1398, fill: "#eab308" },
    { name: "Approved", uv: 8.22, pv: 9800, fill: "#22c55e" },
    { name: "Rejected", uv: 4.63, pv: 3908, fill: "#ef4444" },
];

export function QuotePipelineChart() {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Quote Pipeline</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Status distribution</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="10%"
                        outerRadius="90%"
                        barSize={15}
                        data={data}
                        startAngle={180}
                        endAngle={0}
                    >
                        <RadialBar
                            label={{ position: 'insideStart', fill: '#fff', fontSize: '10px' }}
                            background
                            dataKey="uv"
                        />
                        <Legend
                            iconSize={10}
                            layout="vertical"
                            verticalAlign="middle"
                            wrapperStyle={{ right: 0 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
