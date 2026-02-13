import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
    { name: "Seating", available: 400, reserved: 240, backordered: 100 },
    { name: "Desks", available: 300, reserved: 139, backordered: 50 },
    { name: "Storage", available: 200, reserved: 980, backordered: 200 }, // Scaled down for visual balance in mock
    { name: "Tables", available: 278, reserved: 390, backordered: 80 },
    { name: "Access.", available: 189, reserved: 480, backordered: 20 },
];

export function InventoryHealthChart() {
    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Inventory Health</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Stock availability by Category</p>
                </div>
            </div>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-zinc-800" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#1F2937' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" />
                        <Bar dataKey="backordered" stackId="a" fill="#ef4444" name="Backordered" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
