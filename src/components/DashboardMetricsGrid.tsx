import { SalesAreaChart } from './charts/SalesAreaChart';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { FunnelBarChart } from './charts/FunnelBarChart';
import { InventoryHealthChart } from './charts/InventoryHealthChart';
import { QuotePipelineChart } from './charts/QuotePipelineChart';
import { LogisticsStatusChart } from './charts/LogisticsStatusChart';
import { MarginTrendChart } from './charts/MarginTrendChart';
import { TeamWorkloadChart } from './charts/TeamWorkloadChart';
import { ClientTreemapChart } from './charts/ClientTreemapChart';

interface DashboardMetricsGridProps {
    selectedClient: string;
}

export default function DashboardMetricsGrid({ selectedClient }: DashboardMetricsGridProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Performance Command Center</h3>
                    <p className="text-sm text-muted-foreground">
                        {selectedClient === 'All Clients' ? 'Overview across all clients' : `Showing analytics for ${selectedClient}`}
                    </p>
                </div>
            </div>

            {/* Primary Metrics - Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="xl:col-span-3">
                    <SalesAreaChart />
                </div>
                <div className="xl:col-span-1">
                    <CategoryDonutChart />
                </div>
            </div>

            {/* Complementary Metrics - Grid */}
            {/* Complementary Metrics - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300 delay-100">
                <div className="xl:col-span-1">
                    <FunnelBarChart />
                </div>
                <div className="xl:col-span-1">
                    <LogisticsStatusChart />
                </div>
                <div className="xl:col-span-1">
                    <TeamWorkloadChart />
                </div>
                <div className="xl:col-span-2">
                    <MarginTrendChart />
                </div>
                <div className="xl:col-span-1">
                    <QuotePipelineChart />
                </div>
                <div className="xl:col-span-2">
                    <ClientTreemapChart />
                </div>
                <div className="xl:col-span-1">
                    <InventoryHealthChart />
                </div>
            </div>
        </div>
    );
}
