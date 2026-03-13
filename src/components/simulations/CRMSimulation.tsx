import { useState, useEffect, useMemo, useCallback } from 'react'
import {
    CheckCircleIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon,
    ClockIcon, SparklesIcon, ArrowPathIcon,
    BuildingOfficeIcon, DocumentTextIcon, ChartBarSquareIcon,
    BellAlertIcon, ArrowRightIcon, UserGroupIcon, CalendarDaysIcon,
    MapPinIcon, CubeIcon, LightBulbIcon, BoltIcon,
    ClipboardDocumentListIcon, CurrencyDollarIcon, ReceiptPercentIcon
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
// PROJECT DETAIL CARD — Expanded with AI suggestions
// ═══════════════════════════════════════════════════

const PROJECT_DETAIL_SECTIONS = {
    overview: [
        { label: 'Customer', value: 'Apex Furniture', icon: <BuildingOfficeIcon className="h-3 w-3" /> },
        { label: 'Contact', value: 'Jennifer Martinez, VP Operations', icon: <UserGroupIcon className="h-3 w-3" /> },
        { label: 'PO Number', value: 'ORD-2055', icon: <DocumentTextIcon className="h-3 w-3" /> },
        { label: 'Quote Ref', value: 'QT-1025', icon: <FileText className="h-3 w-3" /> },
        { label: 'Total Value', value: '$43,750', icon: <ArrowTrendingUpIcon className="h-3 w-3" /> },
        { label: 'Line Items', value: '200 items across 4 zones', icon: <CubeIcon className="h-3 w-3" /> },
    ],
    deliveryZones: [
        { zone: 'Zone A — Main Office (Floor 2)', items: 82, value: '$18,200', eta: 'Mar 28' },
        { zone: 'Zone B — Executive Suite (Floor 5)', items: 35, value: '$12,400', eta: 'Apr 4' },
        { zone: 'Zone C — Lounge & Common Areas', items: 48, value: '$8,150', eta: 'Apr 11' },
        { zone: 'Zone D — Austin TX Satellite', items: 35, value: '$5,000', eta: 'Apr 18' },
    ],
    aiSuggestions: [
        {
            type: 'optimization' as const,
            title: 'Consolidate Zone A & B Shipments',
            detail: 'Both zones ship from same warehouse. Combining saves ~$1,200 in freight costs and reduces delivery windows by 3 days.',
            confidence: 94,
            impact: 'Save $1,200',
        },
        {
            type: 'risk' as const,
            title: 'Zone D — LTL Freight Rate Review',
            detail: 'Austin TX freight at $2,450 was manually adjusted in Expert Review (Step 1.5). Market rates dropped 8% since quote — recommend re-negotiation.',
            confidence: 87,
            impact: 'Save ~$196',
        },
        {
            type: 'upsell' as const,
            title: 'Cross-sell: Installation Services',
            detail: 'Apex Furniture ordered installation for 3 of 4 previous projects. Estimated add-on: $6,500–$8,200 based on 200 items.',
            confidence: 91,
            impact: '+$6.5K–$8.2K',
        },
    ],
    quickActions: [
        { label: 'Schedule Delivery', icon: <CalendarDaysIcon className="h-3.5 w-3.5" /> },
        { label: 'Email Customer', icon: <Mail className="h-3.5 w-3.5" /> },
        { label: 'View Full Quote', icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
        { label: 'Assign Team', icon: <UserGroupIcon className="h-3.5 w-3.5" /> },
    ],
}

type DetailTab = 'overview' | 'zones' | 'insights'

const DETAIL_TABS: { key: DetailTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <DocumentTextIcon className="h-3.5 w-3.5" /> },
    { key: 'zones', label: 'Delivery Zones', icon: <MapPinIcon className="h-3.5 w-3.5" /> },
    { key: 'insights', label: 'AI Insights', icon: <SparklesIcon className="h-3.5 w-3.5" /> },
]

function ProjectDetailCard({ isNewProject }: { isNewProject: boolean }) {
    const { nextStep } = useDemo()
    const [activeTab, setActiveTab] = useState<DetailTab>('overview')
    const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null)

    const suggestionStyles = {
        optimization: { bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: <BoltIcon className="h-3.5 w-3.5" /> },
        risk: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: <ExclamationTriangleIcon className="h-3.5 w-3.5" /> },
        upsell: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: <LightBulbIcon className="h-3.5 w-3.5" /> },
    }

    return (
        <div className={cn(
            "bg-card border border-border rounded-xl overflow-hidden",
            isNewProject && "animate-in fade-in slide-in-from-bottom-4 duration-500 border-brand-400/30"
        )}>
            {/* Header with project info + quick actions */}
            <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-foreground">Apex HQ Office Renovation</h4>
                                {isNewProject && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">New Project</span>}
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">Procurement</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">PRJ-001 · Quote #QT-1025 · PO #ORD-2055 · $43,750</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {PROJECT_DETAIL_SECTIONS.quickActions.map(action => (
                            <button key={action.label} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border transition-all" title={action.label}>
                                {action.icon}
                                <span className="hidden xl:inline">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Tabs */}
                <div className="flex items-center gap-0.5 mt-3 -mb-[1px]">
                    {DETAIL_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[10px] font-medium transition-all border border-transparent",
                                activeTab === tab.key
                                    ? "bg-card border-border border-b-card text-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.key === 'insights' && (
                                <span className="px-1 py-0.5 rounded-full bg-brand-500 text-zinc-900 text-[8px] font-bold leading-none">{PROJECT_DETAIL_SECTIONS.aiSuggestions.length}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Key metrics grid */}
                        <div className="grid grid-cols-6 gap-2.5">
                            {PROJECT_DETAIL_SECTIONS.overview.map(f => (
                                <div key={f.label} className="p-2 rounded-lg bg-muted/30 border border-border">
                                    <div className="flex items-center gap-1 text-muted-foreground mb-0.5">{f.icon}<span className="text-[9px]">{f.label}</span></div>
                                    <p className="text-[11px] font-medium text-foreground leading-tight">{f.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Project scope summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h5 className="text-[11px] font-semibold text-foreground">Project Scope</h5>
                                <div className="space-y-1.5">
                                    {[
                                        { label: 'Workstations & Desks', qty: 82, pct: 41 },
                                        { label: 'Executive Seating', qty: 35, pct: 17.5 },
                                        { label: 'Lounge & Soft Seating', qty: 48, pct: 24 },
                                        { label: 'Conference Tables & AV', qty: 20, pct: 10 },
                                        { label: 'Filing & Storage', qty: 15, pct: 7.5 },
                                    ].map(cat => (
                                        <div key={cat.label} className="flex items-center gap-2">
                                            <span className="text-[10px] text-foreground w-[140px] truncate">{cat.label}</span>
                                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                                <div className="h-full rounded-full bg-primary/60" style={{ width: `${cat.pct}%` }} />
                                            </div>
                                            <span className="text-[9px] text-muted-foreground tabular-nums w-7 text-right">{cat.qty}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h5 className="text-[11px] font-semibold text-foreground">Key Milestones</h5>
                                <div className="space-y-1.5">
                                    {[
                                        { milestone: 'RFQ Received & Processed', status: 'done' as const, date: 'Today' },
                                        { milestone: 'Quote Approved ($43,750)', status: 'done' as const, date: 'Today' },
                                        { milestone: 'PO Generated & Transmitted', status: 'done' as const, date: 'Today' },
                                        { milestone: 'Supplier Acknowledgements', status: 'pending' as const, date: 'Est. 3–5 days' },
                                        { milestone: 'Delivery Starts (Zone A)', status: 'pending' as const, date: 'Est. Mar 28' },
                                        { milestone: 'Installation Complete', status: 'pending' as const, date: 'Est. Apr 25' },
                                    ].map(m => (
                                        <div key={m.milestone} className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border">
                                            {m.status === 'done' ? (
                                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            ) : (
                                                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            )}
                                            <span className={cn("text-[10px] flex-1", m.status === 'done' ? 'text-foreground' : 'text-muted-foreground')}>{m.milestone}</span>
                                            <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">{m.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA to next step + Data source footer */}
                        <div className="flex items-center gap-3 pt-2 border-t border-border">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-1">
                                <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                <span>Data sourced from: Email Ingestion → AI Extraction → Expert Review → Dealer Approval — <strong className="text-foreground">zero manual entry</strong></span>
                            </div>
                            {isNewProject && (
                                <button
                                    onClick={nextStep}
                                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-zinc-900 text-[11px] font-bold hover:bg-brand-400 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02]"
                                >
                                    <UserGroupIcon className="h-3.5 w-3.5" />
                                    Review Customer Profile
                                    <ArrowRightIcon className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'zones' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">4 delivery zones · 200 total items · Estimated completion: Apr 25</p>
                            <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-primary-foreground bg-primary hover:bg-brand-400 transition-colors">
                                <CalendarDaysIcon className="h-3 w-3" />
                                Schedule All
                            </button>
                        </div>
                        <div className="space-y-2">
                            {PROJECT_DETAIL_SECTIONS.deliveryZones.map((z, i) => (
                                <div key={i} className="px-3 py-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">{String.fromCharCode(65 + i)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-foreground">{z.zone}</p>
                                            <p className="text-[9px] text-muted-foreground">{z.items} items · {z.value}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-medium text-foreground tabular-nums">ETA {z.eta}</p>
                                            <p className="text-[9px] text-muted-foreground">
                                                {i === 0 ? 'LTL — Standard' : i === 3 ? 'LTL — $2,450 (reviewed)' : 'LTL — Standard'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <span className={cn(
                                                "text-[8px] px-1.5 py-0.5 rounded-full font-medium",
                                                i === 3 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                            )}>
                                                {i === 3 ? 'Rate Flagged' : 'On Track'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Zone line items preview */}
                                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-3 text-[9px] text-muted-foreground">
                                        <span>Top items: {['Workstations', 'Exec Chairs', 'Lounge Sofas', 'Conf. Tables'][i]}</span>
                                        <span>·</span>
                                        <span>Supplier: {['Herman Miller', 'Steelcase', 'Haworth', 'Knoll'][i]}</span>
                                        <span className="ml-auto text-[9px] text-primary font-medium cursor-pointer hover:underline">View items →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Zone summary bar */}
                        <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-muted">
                            {PROJECT_DETAIL_SECTIONS.deliveryZones.map((z, i) => (
                                <div key={i} className={cn("h-full rounded-full", ['bg-brand-500', 'bg-brand-400', 'bg-brand-300', 'bg-brand-200'][i])} style={{ width: `${(z.items / 200) * 100}%` }} title={`Zone ${String.fromCharCode(65 + i)}: ${z.items} items`} />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-3 animate-in fade-in duration-200">
                        {/* AI agent header */}
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-brand-50 dark:bg-brand-500/5 border border-brand-200/50 dark:border-brand-500/20">
                            <AIAgentAvatar size="sm" />
                            <div className="flex-1">
                                <p className="text-[10px] font-medium text-foreground">ProjectIntelligenceAgent analyzed this project</p>
                                <p className="text-[9px] text-muted-foreground">3 suggestions based on quote data, customer history, and market rates</p>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Potential: +$7.9K savings</span>
                        </div>

                        {/* Suggestion cards */}
                        <div className="space-y-2">
                            {PROJECT_DETAIL_SECTIONS.aiSuggestions.map((s, i) => {
                                const style = suggestionStyles[s.type]
                                const isExpanded = expandedSuggestion === i
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setExpandedSuggestion(isExpanded ? null : i)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg border transition-all",
                                            style.bg, style.border,
                                            isExpanded && "ring-1 ring-offset-1 ring-offset-card",
                                            isExpanded ? `ring-current ${style.text}` : ""
                                        )}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <span className={cn("mt-0.5 shrink-0", style.text)}>{style.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-semibold text-foreground">{s.title}</span>
                                                    <span className={cn("text-[9px] font-bold ml-auto shrink-0", style.text)}>{s.impact}</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                                                {isExpanded && (
                                                    <div className="mt-2 pt-2 border-t border-current/10 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[9px] text-muted-foreground">Confidence:</span>
                                                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                                    <div className={cn("h-full rounded-full", s.confidence >= 90 ? 'bg-green-500' : 'bg-amber-500')} style={{ width: `${s.confidence}%` }} />
                                                                </div>
                                                                <span className="text-[9px] font-medium text-foreground tabular-nums">{s.confidence}%</span>
                                                            </div>
                                                            <div className="flex gap-1.5 ml-auto">
                                                                <span className="text-[10px] px-3 py-1 rounded-lg bg-primary text-primary-foreground font-bold cursor-pointer hover:bg-brand-400 transition-colors">Apply</span>
                                                                <span className="text-[10px] px-3 py-1 rounded-lg bg-muted text-muted-foreground font-medium cursor-pointer hover:bg-muted/80 transition-colors">Dismiss</span>
                                                                <span className="text-[10px] px-3 py-1 rounded-lg border border-border text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors">Review Details</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Quick actions row */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                            <span className="text-[9px] text-muted-foreground">Quick Actions:</span>
                            {[
                                { label: 'Apply All Optimizations', primary: true },
                                { label: 'Generate Report', primary: false },
                                { label: 'Share with Team', primary: false },
                            ].map(a => (
                                <button key={a.label} className={cn(
                                    "text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors",
                                    a.primary ? 'bg-primary text-primary-foreground hover:bg-brand-400' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                )}>
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// PROJECTS VIEW (Step 1.12)
// Phased animation: notification → project reveal → detail card
// ═══════════════════════════════════════════════════

type ProjectPhase = 'idle' | 'notification' | 'revealed' | 'detail'

function ProjectsView({ stepId }: { stepId: string }) {
    const isNewProject = stepId === '1.12'
    const [phase, setPhase] = useState<ProjectPhase>(isNewProject ? 'idle' : 'revealed')

    // Phased animation for step 1.12
    useEffect(() => {
        if (!isNewProject) { setPhase('revealed'); return }
        setPhase('idle')
        const timers: ReturnType<typeof setTimeout>[] = []

        // Phase 1: notification toast appears after 2s
        timers.push(setTimeout(() => setPhase('notification'), 2000))
        // Phase 2: project row appears after 5s
        timers.push(setTimeout(() => setPhase('revealed'), 5000))
        // Phase 3: detail card appears after 7s
        timers.push(setTimeout(() => setPhase('detail'), 7000))

        return () => timers.forEach(clearTimeout)
    }, [isNewProject])

    // Allow clicking notification to skip to reveal
    const handleNotificationClick = useCallback(() => {
        if (phase === 'notification') setPhase('detail')
    }, [phase])

    const showApexRow = !isNewProject || phase === 'revealed' || phase === 'detail'
    const showDetailCard = !isNewProject || phase === 'detail'
    const projectCount = showApexRow ? MOCK_PROJECTS.length : MOCK_PROJECTS.length - 1

    return (
        <div className="space-y-4">
            {/* Notification Toast — slides in, clickable */}
            {isNewProject && (phase === 'notification') && (
                <button
                    onClick={handleNotificationClick}
                    className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500"
                >
                    <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                                <BellAlertIcon className="h-5 w-5 text-zinc-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">New Project Auto-Created</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    <strong className="text-foreground">ProjectCreationAgent</strong> created project from Quote #QT-1025 — <strong className="text-foreground">Apex Furniture</strong>, $43,750, 200 line items.
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                    <span>Click to view project</span>
                                    <ArrowRightIcon className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* AI Agent Confirmation — after reveal */}
            {isNewProject && (phase === 'revealed' || phase === 'detail') && (
                <div className="bg-card border border-green-200 dark:border-green-800/30 rounded-xl p-3 flex items-center gap-3 animate-in fade-in duration-300">
                    <AIAgentAvatar size="sm" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-foreground">ProjectCreationAgent</span>
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Project created successfully</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            Apex Furniture · Quote #QT-1025 · PO #ORD-2055 · $43,750 — zero manual CRM entry
                        </p>
                    </div>
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-xs font-medium text-foreground">Active & Recent Projects</h3>
                    <span className="text-[10px] text-muted-foreground">{projectCount} projects</span>
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
                        {MOCK_PROJECTS.map(project => {
                            const isApex = project.id === 'PRJ-001'
                            // Hide Apex row until revealed in animation
                            if (isApex && isNewProject && !showApexRow) return null
                            return (
                                <tr key={project.id} className={cn(
                                    'border-b border-border last:border-0 hover:bg-muted/20 transition-all',
                                    isApex && isNewProject && 'bg-brand-50/50 dark:bg-brand-500/5 ring-2 ring-inset ring-brand-400/30 animate-in fade-in slide-in-from-top-2 duration-500'
                                )}>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            {isApex && isNewProject && (
                                                <span className="px-1.5 py-0.5 rounded bg-brand-500 text-zinc-900 text-[8px] font-bold uppercase shrink-0">New</span>
                                            )}
                                            <div>
                                                <p className="font-medium text-foreground text-[11px]">{project.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{project.id} · {project.items} items · {project.zones} zones</p>
                                            </div>
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
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Apex Project Detail Card — expanded with AI suggestions */}
            {showDetailCard && (
                <ProjectDetailCard isNewProject={isNewProject} />
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
// DAILY LOG VIEW
// ═══════════════════════════════════════════════════

const DAILY_LOG_ENTRIES = [
    {
        id: 'DL-006',
        type: 'change_order' as const,
        title: 'Change Order CO-001: Labor Adjustment',
        detail: 'Labor rate adjusted $510→$495 (6hrs→5hrs). Approved by Expert Hub — auto-applied to invoice.',
        source: 'Step 3.3 — Expert Hub',
        timestamp: 'Today, 2:15 PM',
        highlight: true,
        expandedDetail: {
            original: { rate: '$85/hr', hours: 6, total: '$510' },
            adjusted: { rate: '$99/hr', hours: 5, total: '$495' },
            reason: 'Technician completed installation ahead of schedule',
            approvedBy: 'David Park (Expert)',
        },
    },
    {
        id: 'DL-005',
        type: 'claim' as const,
        title: 'Warranty Claim #WC-001 Submitted',
        detail: 'SKU mismatch CC-AZ-2024 vs 2025 — carrier review initiated. Expected resolution: 5 business days.',
        source: 'Step 3.4 — Service Center',
        timestamp: 'Today, 11:30 AM',
        highlight: false,
    },
    {
        id: 'DL-004',
        type: 'delivery' as const,
        title: 'Zone A Shipment Confirmed',
        detail: 'Carrier: FastFreight Logistics — 82 items, ETA Mar 28. Tracking #FF-2055-A available.',
        source: 'Supplier Portal',
        timestamp: 'Yesterday, 4:45 PM',
        highlight: false,
    },
    {
        id: 'DL-003',
        type: 'ack' as const,
        title: 'AIS Acknowledgment Processed — 50 Lines',
        detail: '3 exceptions resolved: lead time +14 days on 12 items, price variance on 2 SKUs, substitution on 1 SKU.',
        source: 'Step 2.4 — Expert Hub',
        timestamp: 'Mar 10, 9:20 AM',
        highlight: false,
    },
    {
        id: 'DL-002',
        type: 'po' as const,
        title: 'PO #ORD-2055 Generated & Transmitted',
        detail: '200 line items, 5 suppliers, 4 delivery zones. Auto-transmitted via EDI.',
        source: 'Step 1.9 — Dealer Experience',
        timestamp: 'Mar 8, 3:10 PM',
        highlight: false,
    },
    {
        id: 'DL-001',
        type: 'quote' as const,
        title: 'Quote #QT-1025 Approved — $43,750',
        detail: '35.4% margin, volume discounts applied. 3-level approval chain completed.',
        source: 'Step 1.7 — Dealer Experience',
        timestamp: 'Mar 7, 10:00 AM',
        highlight: false,
    },
]

function DailyLogSidebar({ showNotification, onDismissNotification, stepId }: {
    showNotification: boolean
    onDismissNotification: () => void
    stepId: string
}) {
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

    const typeIcons: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        change_order: { icon: <ReceiptPercentIcon className="h-3 w-3" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10', label: 'CO' },
        claim: { icon: <ExclamationTriangleIcon className="h-3 w-3" />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', label: 'CLM' },
        delivery: { icon: <Truck className="h-3 w-3" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10', label: 'DLV' },
        ack: { icon: <CheckCircleIcon className="h-3 w-3" />, color: 'text-green-500 bg-green-50 dark:bg-green-500/10', label: 'ACK' },
        po: { icon: <DocumentTextIcon className="h-3 w-3" />, color: 'text-foreground bg-muted/50', label: 'PO' },
        quote: { icon: <FileText className="h-3 w-3" />, color: 'text-foreground bg-muted/50', label: 'QT' },
        project_created: { icon: <BuildingOfficeIcon className="h-3 w-3" />, color: 'text-primary bg-primary/10', label: 'NEW' },
    }

    // For step 1.12, prepend a "Project Created" entry
    const entries = stepId === '1.12'
        ? [{
            id: 'DL-NEW',
            type: 'project_created' as const,
            title: 'New Project Created',
            detail: 'Apex HQ Office Renovation — $43,750 · 200 items · 4 zones',
            source: 'Auto-created from PO',
            timestamp: 'Just now',
            highlight: true,
        }, ...DAILY_LOG_ENTRIES]
        : DAILY_LOG_ENTRIES

    return (
        <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <ClipboardDocumentListIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-foreground">Daily Log</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {entries.length}
                </span>
            </div>

            {/* Toast notification for step 1.12 */}
            {showNotification && (
                <div className="mx-2 mt-2 p-2.5 rounded-lg bg-primary/10 border border-primary/30 animate-in slide-in-from-top-2 fade-in duration-500">
                    <div className="flex items-start gap-2">
                        <div className="p-1 rounded-md bg-primary/20 shrink-0">
                            <BellAlertIcon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-foreground">New Project Auto-Created</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">Apex HQ Office Renovation added from PO #ORD-2055. All data synced.</p>
                        </div>
                        <button onClick={onDismissNotification} className="text-muted-foreground hover:text-foreground shrink-0">
                            <span className="text-xs">×</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {entries.map((entry) => {
                    const config = typeIcons[entry.type]
                    const isExpanded = expandedEntry === entry.id
                    const isNew = entry.id === 'DL-NEW'

                    return (
                        <div
                            key={entry.id}
                            className={cn(
                                'rounded-md border p-2 transition-all cursor-pointer hover:shadow-sm',
                                isNew
                                    ? 'border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-1 duration-700'
                                    : entry.highlight
                                        ? 'border-purple-200 dark:border-purple-500/30 bg-purple-50/30 dark:bg-purple-500/5'
                                        : 'border-border/50 bg-transparent hover:bg-muted/30'
                            )}
                            onClick={() => entry.highlight || isNew ? setExpandedEntry(isExpanded ? null : entry.id) : undefined}
                        >
                            <div className="flex items-start gap-2">
                                <div className={cn('p-1 rounded shrink-0 mt-0.5', config.color)}>
                                    {config.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn('text-[10px] font-medium text-foreground leading-snug', isNew && 'font-bold')}>{entry.title}</p>
                                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{entry.detail}</p>
                                    <p className="text-[8px] text-muted-foreground/60 mt-1">{entry.timestamp}</p>
                                </div>
                            </div>

                            {/* Expanded change order detail */}
                            {entry.highlight && isExpanded && entry.expandedDetail && (
                                <div className="mt-2 pt-2 border-t border-purple-200/50 dark:border-purple-500/20">
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="rounded bg-white dark:bg-zinc-900 border border-border p-1.5">
                                            <p className="text-[8px] text-muted-foreground font-medium">ORIGINAL</p>
                                            <p className="text-[10px] font-semibold text-foreground">{entry.expandedDetail.original.total}</p>
                                        </div>
                                        <div className="rounded bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-500/20 p-1.5">
                                            <p className="text-[8px] text-purple-600 dark:text-purple-400 font-medium">ADJUSTED</p>
                                            <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">{entry.expandedDetail.adjusted.total}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Sidebar Footer */}
            <div className="px-3 py-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                    <AIAgentAvatar agentName="LogAgent" size="xs" />
                    <p className="text-[8px] text-muted-foreground leading-snug">
                        Auto-recorded from all systems — feeds into invoicing
                    </p>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// INVOICING VIEW
// ═══════════════════════════════════════════════════

function InvoicingView() {
    const [synced, setSynced] = useState(false)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Invoice #INV-2055 — Auto-Generated</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Built from PO, change orders, and service labor — zero manual line items</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">
                    Ready for Review
                </span>
            </div>

            <div className="grid grid-cols-5 gap-4">
                {/* Invoice Detail — 3 cols */}
                <div className="col-span-3 rounded-lg border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Apex Furniture</p>
                            <p className="text-[10px] text-muted-foreground">Jennifer Martinez, VP Operations</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Invoice Date</p>
                            <p className="text-xs font-medium text-foreground">Mar 13, 2026</p>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Original PO #ORD-2055</p>
                                    <p className="text-[9px] text-muted-foreground">200 line items · 4 delivery zones · 5 suppliers</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-foreground">$43,750.00</p>
                        </div>

                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-purple-50/50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10">
                            <div className="flex items-center gap-2">
                                <ReceiptPercentIcon className="h-3.5 w-3.5 text-purple-500" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Change Order CO-001</p>
                                    <p className="text-[9px] text-muted-foreground">Labor adjustment: 6hrs→5hrs ($510→$495)</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">-$15.00</p>
                        </div>

                        <div className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                    <p className="text-[11px] font-medium text-foreground">Service Labor</p>
                                    <p className="text-[9px] text-muted-foreground">5 hours × $95/hr · Installation & adjustment</p>
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-foreground">$475.00</p>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Invoice Total</p>
                            <p className="text-[9px] text-muted-foreground">Terms: Net 30</p>
                        </div>
                        <p className="text-lg font-bold text-foreground">$44,210.00</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            onClick={() => setSynced(true)}
                            disabled={synced}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                                synced
                                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            )}
                        >
                            {synced ? (
                                <><CheckCircleIcon className="h-3.5 w-3.5" /> Synced to QuickBooks</>
                            ) : (
                                <><CurrencyDollarIcon className="h-3.5 w-3.5" /> Approve & Sync to QuickBooks</>
                            )}
                        </button>
                        <button className="px-3 py-2 rounded-md text-xs font-medium border border-border text-foreground hover:bg-muted/50 transition-colors">
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* QuickBooks Sync Panel — 2 cols */}
                <div className="col-span-2 space-y-3">
                    {/* QB Connection Card */}
                    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-md bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                                <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground">QuickBooks Online</p>
                                <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">Connected ✓</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {[
                                { label: 'Invoice', status: synced ? 'Synced' : 'Ready', synced },
                                { label: 'Customer', status: 'Matched', synced: true },
                                { label: 'GL Codes', status: 'Auto-mapped (5)', synced: true },
                                { label: 'Tax Rates', status: 'Applied', synced: true },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between px-2 py-1 rounded bg-muted/30">
                                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                                    <span className={cn(
                                        'text-[10px] font-medium',
                                        item.synced ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                                    )}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Agent Note */}
                    <div className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <AIAgentAvatar agentName="InvoicingAgent" size="xs" />
                            <p className="text-[10px] font-medium text-foreground">InvoicingAgent</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            Auto-mapped 5 GL codes by product category. Invoice generated from: PO (Step 1.9) + Change Orders (Step 3.3) + Service Labor (Step 3.3). All line items reconciled — zero manual entries required.
                        </p>
                    </div>

                    {/* Source traceability */}
                    <div className="rounded-lg border border-dashed border-border p-3">
                        <p className="text-[9px] font-medium text-muted-foreground mb-2">DATA SOURCES</p>
                        <div className="space-y-1">
                            {[
                                { step: '1.7', label: 'Quote Approved', value: '$43,750' },
                                { step: '1.9', label: 'PO Generated', value: '200 items' },
                                { step: '3.3', label: 'Change Order CO-001', value: '-$15' },
                                { step: '3.3', label: 'Service Labor', value: '$475' },
                            ].map((src, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px]">
                                    <span className="text-muted-foreground/50 font-mono">Step {src.step}</span>
                                    <span className="text-muted-foreground">{src.label}</span>
                                    <span className="ml-auto font-medium text-foreground">{src.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

type CRMTab = 'projects' | 'customer360' | 'timeline' | 'invoicing' | 'reports'

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
    { id: 'invoicing', label: 'Invoicing' },
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
    const [showDailyLogNotification, setShowDailyLogNotification] = useState(false)
    const [dailyLogNotificationDismissed, setDailyLogNotificationDismissed] = useState(false)

    // Sync tab when step changes
    useMemo(() => {
        const mapped = STEP_TO_TAB[stepId]
        if (mapped) setActiveTab(mapped)
    }, [stepId])

    // Step 1.12 auto-notification: show new project entry in Daily Log
    useEffect(() => {
        if (stepId === '1.12') {
            setDailyLogNotificationDismissed(false)
            const timer = setTimeout(() => {
                setShowDailyLogNotification(true)
            }, 800)
            return () => clearTimeout(timer)
        } else {
            setShowDailyLogNotification(false)
        }
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

            {/* Content — main area + Daily Log sidebar */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main tab content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'projects' && <ProjectsView stepId={stepId} />}
                    {activeTab === 'customer360' && <Customer360View stepId={stepId} />}
                    {activeTab === 'timeline' && <OrderTimelineView stepId={stepId} />}
                    {activeTab === 'invoicing' && <InvoicingView />}
                    {activeTab === 'reports' && <ReportsView stepId={stepId} />}
                </div>

                {/* Daily Log Sidebar */}
                <div className="w-[280px] shrink-0 border-l border-border bg-card overflow-y-auto">
                    <DailyLogSidebar
                        showNotification={showDailyLogNotification && !dailyLogNotificationDismissed}
                        onDismissNotification={() => setDailyLogNotificationDismissed(true)}
                        stepId={stepId}
                    />
                </div>
            </div>
        </div>
    )
}
