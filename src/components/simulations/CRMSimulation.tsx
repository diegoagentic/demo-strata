import { useState, useMemo } from 'react'
import {
    CheckCircleIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon,
    ClockIcon, SparklesIcon, ArrowPathIcon,
    BuildingOfficeIcon, DocumentTextIcon, ChartBarSquareIcon
} from '@heroicons/react/24/outline'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts'
import { useDemo } from '../../context/DemoContext'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Bot, Package, FileText, Truck, Wrench, Mail } from 'lucide-react'
import { AIAgentAvatar } from './DemoAvatars'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════
// MOCK DATA — Connected to Flows 1-3
// ═══════════════════════════════════════════════════

interface Project {
    id: string; name: string; customer: string; contact: string;
    quote: string; po: string; value: number;
    stage: 'Planning' | 'Procurement' | 'Delivery' | 'Installation' | 'Complete';
    items: number; zones: number;
    status: 'Active' | 'On Track' | 'At Risk' | 'Complete';
    created: string; deliveryRate: number; openClaims: number;
}

const MOCK_PROJECTS: Project[] = [
    {
        id: 'PRJ-001', name: 'Apex HQ Office Renovation', customer: 'Apex Furniture',
        contact: 'Jennifer Martinez (VP Operations)',
        quote: 'QT-1025', po: 'ORD-2055', value: 43750,
        stage: 'Procurement', items: 200, zones: 4,
        status: 'Active', created: 'Just now', deliveryRate: 0, openClaims: 0
    },
    {
        id: 'PRJ-002', name: 'Urban Living Lobby Refresh', customer: 'Urban Living Inc.',
        contact: 'Marcus Chen (Facilities Director)',
        quote: 'QT-1019', po: 'ORD-2053', value: 112000,
        stage: 'Installation', items: 45, zones: 1,
        status: 'On Track', created: '2 months ago', deliveryRate: 96, openClaims: 0
    },
    {
        id: 'PRJ-003', name: 'Summit Health Clinic Fit-Out', customer: 'Summit Health Group',
        contact: 'Karen Park (Procurement Lead)',
        quote: 'QT-1012', po: 'ORD-2048', value: 87500,
        stage: 'Complete', items: 120, zones: 2,
        status: 'Complete', created: '4 months ago', deliveryRate: 100, openClaims: 0
    },
    {
        id: 'PRJ-004', name: 'Meridian Tower Floor 12', customer: 'Meridian Financial',
        contact: 'David Torres (COO)',
        quote: 'QT-1008', po: 'ORD-2044', value: 198000,
        stage: 'Delivery', items: 310, zones: 3,
        status: 'At Risk', created: '3 months ago', deliveryRate: 72, openClaims: 2
    },
    {
        id: 'PRJ-005', name: 'Greenfield Campus Expansion', customer: 'Greenfield Properties',
        contact: 'Amanda Foster (Design Director)',
        quote: 'QT-0998', po: 'ORD-2039', value: 245000,
        stage: 'Complete', items: 480, zones: 6,
        status: 'Complete', created: '6 months ago', deliveryRate: 100, openClaims: 0
    },
]

const CUSTOMER_PROFILE = {
    name: 'Apex Furniture',
    contact: 'Jennifer Martinez',
    title: 'VP Operations',
    email: 'j.martinez@apexfurniture.com',
    phone: '(512) 555-0147',
    lifetimeValue: 1200000,
    totalProjects: 5,
    activeProjects: 2,
    avgProjectSize: 137250,
    recentOrders: [
        { po: 'ORD-2055', value: 43750, date: 'Today', status: 'Active' },
        { po: 'ORD-1987', value: 62500, date: '3 months ago', status: 'Complete' },
        { po: 'ORD-1834', value: 112000, date: '8 months ago', status: 'Complete' },
        { po: 'ORD-1722', value: 198000, date: '14 months ago', status: 'Complete' },
    ],
    tags: ['Preferred', 'Volume Buyer', '10+ Years'],
    systems: [
        { name: 'Dealer Experience', synced: true, records: 12 },
        { name: 'Expert Hub', synced: true, records: 8 },
        { name: 'Email / RFQ', synced: true, records: 15 },
        { name: 'Service Center', synced: true, records: 3 },
    ],
}

interface TimelineEvent {
    event: string; step: string; system: string;
    status: 'complete' | 'active' | 'pending';
    detail?: string;
    icon: 'email' | 'ai' | 'quote' | 'po' | 'ack' | 'service';
}

const PROJECT_TIMELINE: TimelineEvent[] = [
    { event: 'RFQ Email Received', step: '1.1', system: 'Email', status: 'complete', detail: 'PDF spec + CSV from vendor', icon: 'email' },
    { event: 'AI Extraction — 200 items', step: '1.2', system: 'Expert Hub', status: 'complete', detail: '5 AI agents, 4 delivery zones', icon: 'ai' },
    { event: 'Data Normalized — 94% confidence', step: '1.3', system: 'Expert Hub', status: 'complete', detail: '4 AI agents, low-confidence flagged', icon: 'ai' },
    { event: 'Quote #QT-1025 Drafted', step: '1.4', system: 'Expert Hub', status: 'complete', detail: 'Volume discounts applied', icon: 'quote' },
    { event: 'Expert Review — 8 items validated', step: '1.5', system: 'Expert Hub', status: 'complete', detail: 'Freight $2,450 Austin TX corrected', icon: 'ai' },
    { event: 'Quote Approved — $43,750', step: '1.7', system: 'Dealer Exp.', status: 'complete', detail: '35.4% margin, 3-level chain', icon: 'quote' },
    { event: 'PO #ORD-2055 Generated', step: '1.9', system: 'Dealer Exp.', status: 'complete', detail: '5 SKUs mapped, transmitted to supplier', icon: 'po' },
    { event: 'AIS Ack — 3 exceptions resolved', step: '2.4', system: 'Expert Hub', status: 'complete', detail: '50 lines, $65K, +14d delivery adj.', icon: 'ack' },
    { event: 'HAT Ack — Confirmed', step: '2.6', system: 'Expert Hub', status: 'complete', detail: '5 lines, $8K, on schedule', icon: 'ack' },
    { event: 'Warranty Claim — SKU mismatch', step: '3.4', system: 'Service Ctr.', status: 'active', detail: 'CC-AZ-2024 vs 2025, carrier review', icon: 'service' },
]

const projectValueByStage = [
    { stage: 'Planning', value: 0, count: 0 },
    { stage: 'Procurement', value: 43750, count: 1 },
    { stage: 'Delivery', value: 198000, count: 1 },
    { stage: 'Installation', value: 112000, count: 1 },
    { stage: 'Complete', value: 332500, count: 2 },
]

const systemSyncData = [
    { name: 'Dealer Exp.', value: 35, color: '#E6F993' },
    { name: 'Expert Hub', value: 30, color: '#a3e635' },
    { name: 'Email/RFQ', value: 20, color: '#65a30d' },
    { name: 'Service Ctr.', value: 15, color: '#3f6212' },
]

// ═══════════════════════════════════════════════════
// PROJECTS VIEW (Step 1.12)
// ═══════════════════════════════════════════════════

function ProjectsView({ stepId }: { stepId: string }) {
    const isNewProject = stepId === '1.12'

    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {isNewProject && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">ProjectCreationAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Just created</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Auto-created project from approved quote — Customer: <strong className="text-foreground">Apex Furniture</strong>, Quote #QT-1025, PO #ORD-2055, $43,750. Zero manual CRM entry.
                        </p>
                    </div>
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-xs font-medium text-foreground">Active & Recent Projects</h3>
                    <span className="text-[10px] text-muted-foreground">{MOCK_PROJECTS.length} projects</span>
                </div>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="text-left px-4 py-2 text-[10px] font-medium text-muted-foreground">Project</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Customer</th>
                            <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Quote / PO</th>
                            <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground">Value</th>
                            <th className="text-center px-3 py-2 text-[10px] font-medium text-muted-foreground">Stage</th>
                            <th className="text-center px-3 py-2 text-[10px] font-medium text-muted-foreground">Status</th>
                            <th className="text-right px-4 py-2 text-[10px] font-medium text-muted-foreground">Delivery</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PROJECTS.map(project => (
                            <tr key={project.id} className={cn(
                                'border-b border-border last:border-0 hover:bg-muted/20 transition-colors',
                                project.id === 'PRJ-001' && isNewProject && 'bg-primary/5 ring-1 ring-inset ring-primary/20'
                            )}>
                                <td className="px-4 py-2.5">
                                    <div>
                                        <p className="font-medium text-foreground text-[11px]">{project.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{project.id} · {project.items} items · {project.zones} zones</p>
                                    </div>
                                </td>
                                <td className="px-3 py-2.5 text-[11px] text-foreground">{project.customer}</td>
                                <td className="px-3 py-2.5">
                                    <p className="text-[11px] text-foreground">{project.quote}</p>
                                    <p className="text-[10px] text-muted-foreground">{project.po}</p>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                    <span className="text-[11px] font-medium text-foreground tabular-nums">${project.value.toLocaleString()}</span>
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                    <StageBadge stage={project.stage} />
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                    <ProjectStatusBadge status={project.status} />
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    {project.stage === 'Complete' ? (
                                        <span className="text-[10px] text-green-600 font-medium">100%</span>
                                    ) : project.deliveryRate > 0 ? (
                                        <span className="text-[10px] text-foreground tabular-nums">{project.deliveryRate}%</span>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Apex Project Detail Card (when newly created) */}
            {isNewProject && (
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <BuildingOfficeIcon className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                                <h4 className="text-xs font-medium text-foreground">Apex HQ Office Renovation</h4>
                                <p className="text-[10px] text-muted-foreground">Auto-created from Quote #QT-1025</p>
                            </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-foreground font-medium">New</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Customer', value: 'Apex Furniture' },
                            { label: 'PO Number', value: 'ORD-2055' },
                            { label: 'Total Value', value: '$43,750' },
                            { label: 'Line Items', value: '200 across 4 zones' },
                        ].map(f => (
                            <div key={f.label} className="p-2 rounded-lg bg-muted/30 border border-border">
                                <p className="text-[10px] text-muted-foreground">{f.label}</p>
                                <p className="text-[11px] font-medium text-foreground mt-0.5">{f.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
                        <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                        <span>Data sourced from: Email Ingestion → AI Extraction → Expert Review → Dealer Approval — <strong className="text-foreground">zero manual entry</strong></span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════
// CUSTOMER 360 VIEW (Step 1.13)
// ═══════════════════════════════════════════════════

function Customer360View({ stepId }: { stepId: string }) {
    const c = CUSTOMER_PROFILE

    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {stepId === '1.13' && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">CustomerIntelligenceAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Updated</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Cross-system data aggregated: Dealer Experience + Expert Hub + Email/RFQ + Service Center. Profile completeness: <strong className="text-foreground">96%</strong>.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className="col-span-2 bg-card border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">AF</div>
                        <div>
                            <h3 className="text-sm font-medium text-foreground">{c.name}</h3>
                            <p className="text-xs text-muted-foreground">{c.contact} · {c.title}</p>
                            <p className="text-[10px] text-muted-foreground">{c.email} · {c.phone}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            {c.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-foreground font-medium">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Lifetime Value', value: `$${(c.lifetimeValue / 1000000).toFixed(1)}M`, icon: <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> },
                            { label: 'Total Projects', value: c.totalProjects.toString(), icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
                            { label: 'Active Projects', value: c.activeProjects.toString(), icon: <BuildingOfficeIcon className="h-3.5 w-3.5" /> },
                            { label: 'Avg Project Size', value: `$${(c.avgProjectSize / 1000).toFixed(0)}K`, icon: <ChartBarSquareIcon className="h-3.5 w-3.5" /> },
                        ].map(m => (
                            <div key={m.label} className="p-2.5 rounded-lg bg-muted/30 border border-border">
                                <div className="flex items-center gap-1 text-muted-foreground mb-1">{m.icon}<span className="text-[10px]">{m.label}</span></div>
                                <p className="text-sm font-bold text-foreground">{m.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Orders */}
                    <div>
                        <h4 className="text-[11px] font-medium text-foreground mb-2">Recent Orders</h4>
                        <div className="space-y-1.5">
                            {c.recentOrders.map(order => (
                                <div key={order.po} className={cn(
                                    'flex items-center justify-between px-3 py-2 rounded-lg border border-border',
                                    order.po === 'ORD-2055' && 'bg-primary/5 border-primary/20'
                                )}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-foreground">{order.po}</span>
                                        {order.po === 'ORD-2055' && <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-foreground">New</span>}
                                    </div>
                                    <span className="text-[11px] text-foreground tabular-nums">${order.value.toLocaleString()}</span>
                                    <span className="text-[10px] text-muted-foreground">{order.date}</span>
                                    <ProjectStatusBadge status={order.status as Project['status']} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cross-System Data Sources */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h4 className="text-[11px] font-medium text-foreground mb-3">Cross-System Data Sources</h4>
                        <div className="space-y-2">
                            {c.systems.map(sys => (
                                <div key={sys.name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-foreground">{sys.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{sys.records} records synced</p>
                                    </div>
                                    <ArrowPathIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                            All data aggregated automatically — zero duplicate entry across platforms
                        </p>
                    </div>

                    {/* Data Sources Pie */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h4 className="text-[11px] font-medium text-foreground mb-2">Records by Source</h4>
                        <div className="h-[140px] flex items-center">
                            <div className="w-1/2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={systemSyncData} dataKey="value" cx="50%" cy="50%" outerRadius={50} innerRadius={28}>
                                            {systemSyncData.map((entry, idx) => (
                                                <Cell key={idx} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-1/2 space-y-1.5">
                                {systemSyncData.map(s => (
                                    <div key={s.name} className="flex items-center gap-2 text-[10px]">
                                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                        <span className="text-muted-foreground">{s.name}</span>
                                        <span className="ml-auto font-medium text-foreground">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// ORDER TIMELINE VIEW (Step 2.8)
// ═══════════════════════════════════════════════════

function OrderTimelineView({ stepId }: { stepId: string }) {
    const timelineIcons: Record<string, React.ReactNode> = {
        email: <Mail size={14} className="text-blue-500" />,
        ai: <Bot size={14} className="text-purple-500" />,
        quote: <FileText size={14} className="text-amber-500" />,
        po: <Package size={14} className="text-green-500" />,
        ack: <Truck size={14} className="text-sky-500" />,
        service: <Wrench size={14} className="text-red-500" />,
    }

    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {stepId === '2.8' && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">OrderSyncAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Synced</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            AIS acknowledgment (50 lines, $65K) — 3 exceptions resolved, dates +14d. HAT (5 lines, $8K) — confirmed. Project timeline auto-updated.
                        </p>
                    </div>
                </div>
            )}

            {/* Project Header */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-foreground">Apex HQ Office Renovation</h3>
                            <p className="text-[10px] text-muted-foreground">PRJ-001 · Apex Furniture · $43,750</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StageBadge stage="Procurement" />
                        <ProjectStatusBadge status="Active" />
                    </div>
                </div>

                {/* Delivery Milestones */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { supplier: 'AIS (American Industrial)', lines: 50, value: '$65,000', status: 'Partial', detail: '3 exceptions resolved, +14d adj.', color: 'amber' as const },
                        { supplier: 'HAT (Haworth)', lines: 5, value: '$8,000', status: 'Confirmed', detail: 'On schedule, no discrepancies', color: 'green' as const },
                        { supplier: 'Other Suppliers', lines: 145, value: '$TBD', status: 'Pending', detail: 'Awaiting acknowledgements', color: 'zinc' as const },
                    ].map(s => (
                        <div key={s.supplier} className={cn(
                            'p-3 rounded-lg border',
                            s.color === 'green' && 'border-green-200 bg-green-50/30 dark:border-green-800/30 dark:bg-green-900/10',
                            s.color === 'amber' && 'border-amber-200 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-900/10',
                            s.color === 'zinc' && 'border-border bg-muted/20',
                        )}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-medium text-foreground">{s.supplier}</span>
                                <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded font-medium',
                                    s.color === 'green' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
                                    s.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                                    s.color === 'zinc' && 'bg-muted text-muted-foreground',
                                )}>{s.status}</span>
                            </div>
                            <p className="text-[11px] text-foreground">{s.lines} lines · {s.value}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{s.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Timeline */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-xs font-medium text-foreground">Complete Order Lifecycle</h3>
                    <p className="text-[10px] text-muted-foreground">Every event auto-recorded from source system — zero manual entry</p>
                </div>
                <div className="divide-y divide-border">
                    {PROJECT_TIMELINE.map((event, idx) => (
                        <div key={idx} className={cn(
                            'flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors',
                            event.status === 'active' && 'bg-amber-50/30 dark:bg-amber-900/5'
                        )}>
                            <div className="relative">
                                <div className={cn(
                                    'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                                    event.status === 'complete' && 'bg-green-100 dark:bg-green-900/30',
                                    event.status === 'active' && 'bg-amber-100 dark:bg-amber-900/30',
                                    event.status === 'pending' && 'bg-muted',
                                )}>
                                    {timelineIcons[event.icon]}
                                </div>
                                {idx < PROJECT_TIMELINE.length - 1 && (
                                    <div className="absolute top-7 left-1/2 -translate-x-1/2 w-px h-[calc(100%+4px)] bg-border" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-medium text-foreground">{event.event}</span>
                                    {event.status === 'active' && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-medium">Active</span>
                                    )}
                                </div>
                                {event.detail && <p className="text-[10px] text-muted-foreground mt-0.5">{event.detail}</p>}
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-[10px] text-muted-foreground">Step {event.step}</span>
                                <p className="text-[10px] text-muted-foreground">{event.system}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// REPORTS VIEW (Step 3.6)
// ═══════════════════════════════════════════════════

function ReportsView({ stepId }: { stepId: string }) {
    return (
        <div className="space-y-4">
            {/* AI Agent Banner */}
            {stepId === '3.6' && (
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">ServiceRecordAgent</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Logged</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Warranty claim linked to project. Full lifecycle: email (1.1) → AI extraction (1.2) → quote (1.7) → PO (1.9) → ack (2.4) → service (3.4). <strong className="text-foreground">Zero data re-entered.</strong>
                        </p>
                    </div>
                </div>
            )}

            {/* Project Health Card */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <ChartBarSquareIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-foreground">Project Health Report</h3>
                            <p className="text-[10px] text-muted-foreground">Apex HQ Office Renovation · PRJ-001</p>
                        </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-foreground font-medium">AI Generated</span>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                        { label: 'Project Value', value: '$43,750', sub: 'Quote #QT-1025', color: '' },
                        { label: 'Delivery Rate', value: '98%', sub: 'On track', color: 'text-green-600' },
                        { label: 'Open Claims', value: '1', sub: 'SKU mismatch (3.4)', color: 'text-amber-600' },
                        { label: 'Systems Synced', value: '5', sub: 'Zero re-entry', color: 'text-green-600' },
                    ].map(m => (
                        <div key={m.label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                            <p className="text-[10px] text-muted-foreground">{m.label}</p>
                            <p className={cn('text-lg font-bold text-foreground mt-0.5', m.color)}>{m.value}</p>
                            <p className="text-[10px] text-muted-foreground">{m.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Full Traceability */}
                <div className="border border-border rounded-lg p-3">
                    <h4 className="text-[11px] font-medium text-foreground mb-2">End-to-End Traceability</h4>
                    <div className="flex items-center gap-1 flex-wrap">
                        {[
                            { label: 'Email RFQ', step: '1.1', icon: '📧' },
                            { label: 'AI Extract', step: '1.2', icon: '🤖' },
                            { label: 'Normalize', step: '1.3', icon: '📊' },
                            { label: 'Quote', step: '1.7', icon: '📋' },
                            { label: 'PO', step: '1.9', icon: '📦' },
                            { label: 'Ack (AIS)', step: '2.4', icon: '✅' },
                            { label: 'Ack (HAT)', step: '2.6', icon: '✅' },
                            { label: 'Service', step: '3.4', icon: '🔧' },
                            { label: 'CRM', step: '3.6', icon: '💼' },
                        ].map((item, i) => (
                            <div key={item.step} className="flex items-center gap-1">
                                <div className={cn(
                                    'px-2 py-1 rounded text-[10px] border',
                                    item.step === '3.6' ? 'border-primary/30 bg-primary/10 font-medium text-foreground' : 'border-border bg-card text-muted-foreground'
                                )}>
                                    <span className="mr-1">{item.icon}</span>{item.label}
                                    <span className="ml-1 text-[9px] opacity-60">{item.step}</span>
                                </div>
                                {i < 8 && <span className="text-muted-foreground text-[10px]">→</span>}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Every data point traced from source to CRM — complete audit trail across 5 systems.</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
                {/* Portfolio by Stage */}
                <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-medium text-foreground mb-3">Portfolio Value by Stage</h3>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectValueByStage}>
                                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                                <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, 'Value']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                                <Bar dataKey="value" fill="#E6F993" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cross-Platform Sync Status */}
                <div className="bg-card border border-border rounded-xl p-4">
                    <h3 className="text-xs font-medium text-foreground mb-3">Cross-Platform Sync Status</h3>
                    <div className="space-y-2.5">
                        {[
                            { app: 'Dealer Experience', records: 12, status: 'Synced', icon: '🏪' },
                            { app: 'Expert Hub', records: 8, status: 'Synced', icon: '🧠' },
                            { app: 'Email / RFQ Pipeline', records: 15, status: 'Synced', icon: '📧' },
                            { app: 'Service Center (MAC)', records: 3, status: 'Synced', icon: '🔧' },
                            { app: 'Strata CRM', records: 38, status: 'Source', icon: '💼' },
                        ].map(app => (
                            <div key={app.app} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border">
                                <span className="text-sm">{app.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium text-foreground">{app.app}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground tabular-nums">{app.records} records</span>
                                <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded font-medium',
                                    app.status === 'Source'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                )}>{app.status}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                        Zero duplicate data entry — all platforms share unified data source.
                    </p>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════

function StageBadge({ stage }: { stage: Project['stage'] }) {
    const styles: Record<string, string> = {
        Planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        Procurement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        Delivery: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        Installation: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        Complete: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    }
    return <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', styles[stage])}>{stage}</span>
}

function ProjectStatusBadge({ status }: { status: Project['status'] }) {
    const styles: Record<string, string> = {
        Active: 'bg-primary/10 text-foreground',
        'On Track': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'At Risk': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        Complete: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    }
    return <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', styles[status])}>{status}</span>
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

type CRMTab = 'projects' | 'customer360' | 'timeline' | 'reports'

const STEP_TO_TAB: Record<string, CRMTab> = {
    '1.12': 'projects',
    '1.13': 'customer360',
    '2.8': 'timeline',
    '3.6': 'reports',
}

const TAB_LABELS: { id: CRMTab; label: string }[] = [
    { id: 'projects', label: 'Projects' },
    { id: 'customer360', label: 'Customer 360' },
    { id: 'timeline', label: 'Order Timeline' },
    { id: 'reports', label: 'Reports' },
]

interface CRMSimulationProps {
    onNavigate?: (page: string) => void
}

export default function CRMSimulation({ onNavigate }: CRMSimulationProps) {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id || '1.12'

    // Determine active tab from step
    const defaultTab = STEP_TO_TAB[stepId] || 'projects'
    const [activeTab, setActiveTab] = useState<CRMTab>(defaultTab)

    // Sync tab when step changes
    useMemo(() => {
        const mapped = STEP_TO_TAB[stepId]
        if (mapped) setActiveTab(mapped)
    }, [stepId])

    // Metrics row
    const metrics = [
        { label: 'Active Projects', value: '5', change: '+1 today' },
        { label: 'Lifetime Value', value: '$1.2M', change: 'Apex Furniture' },
        { label: 'Delivery Rate', value: '98%', change: 'On track' },
        { label: 'Open Claims', value: '1', change: 'SKU mismatch' },
    ]

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card px-6 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">CRM — Project Intelligence</h2>
                        <p className="text-[10px] text-muted-foreground">Data flows automatically from every workflow — zero manual entry</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">AI-powered · Cross-platform sync active</span>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                    {metrics.map(m => (
                        <div key={m.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
                            <div>
                                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                                <p className="text-sm font-bold text-foreground">{m.value}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground ml-auto">{m.change}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mt-3 -mb-3">
                    {TAB_LABELS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                                activeTab === tab.id
                                    ? 'border-foreground text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'projects' && <ProjectsView stepId={stepId} />}
                {activeTab === 'customer360' && <Customer360View stepId={stepId} />}
                {activeTab === 'timeline' && <OrderTimelineView stepId={stepId} />}
                {activeTab === 'reports' && <ReportsView stepId={stepId} />}
            </div>
        </div>
    )
}
