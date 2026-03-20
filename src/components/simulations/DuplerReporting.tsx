// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 3: Unified Reporting & Analytics
// Steps: d3.1 (Sync), d3.2 (Reconciliation), d3.3 (Report Assembly), d3.4 (Distribution)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    DocumentArrowDownIcon,
    ArrowsRightLeftIcon,
    DocumentChartBarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PaperAirplaneIcon,
    LightBulbIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type ReconPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type AssemblyPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type ReportPhase = 'idle' | 'notification' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

const FUNNEL_DATA = [
    { stage: 'Prospect', count: 18, value: 890000, color: '#818cf8' },
    { stage: 'Proposal', count: 14, value: 720000, color: '#6366f1' },
    { stage: 'Negotiation', count: 10, value: 680000, color: '#4f46e5' },
    { stage: 'Closed Won', count: 5, value: 510000, color: '#22c55e' },
];

interface KPIMetric {
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
}

const KPI_METRICS: KPIMetric[] = [
    { label: 'Pipeline Value', value: '$2.8M', trend: '+12% vs Q1', trendUp: true },
    { label: 'Active Deals', value: '47', trend: '+5 this month', trendUp: true },
    { label: 'Close Rate', value: '34%', trend: '+2% vs avg', trendUp: true },
    { label: 'Avg Deal Size', value: '$59.6K', trend: '-3% vs Q1', trendUp: false },
];

const OPS_KPIS: KPIMetric[] = [
    { label: 'DSO', value: '42 days', trend: '-3 days vs Q1', trendUp: true },
    { label: 'Aging 30+', value: '$280K', trend: '-$45K vs Q1', trendUp: true },
    { label: 'On-Time Delivery', value: '91%', trend: '+2% vs Q1', trendUp: true },
    { label: 'Avg Margin', value: '31.4%', trend: '-0.6% vs Q1', trendUp: false },
];

interface CrossSystemAlert {
    id: string;
    type: 'duplicate' | 'amount-mismatch' | 'missing-link';
    hubspotRef: string;
    coreRef: string;
    detail: string;
    aiSuggestion: string;
}

const CROSS_SYSTEM_ALERTS: CrossSystemAlert[] = [
    {
        id: 'csa-1',
        type: 'duplicate',
        hubspotRef: 'HS-DUP-0041',
        coreRef: 'HS-DUP-0041-B',
        detail: 'Deal "UAL Phase 3" appears twice in HubSpot — created by different reps on same day.',
        aiSuggestion: 'Merge into HS-DUP-0041 (higher activity). Archive duplicate.',
    },
    {
        id: 'csa-2',
        type: 'amount-mismatch',
        hubspotRef: 'HS-DUP-0039',
        coreRef: 'CORE-PRJ-0039',
        detail: 'HubSpot: $23,400 vs Core: $19,200. Discount applied in Core after deal closed.',
        aiSuggestion: 'Update HubSpot to $19,200 to match Core (discount $4,200 applied post-close).',
    },
    {
        id: 'csa-3',
        type: 'missing-link',
        hubspotRef: '—',
        coreRef: 'CORE-INV-2026-118',
        detail: 'Invoice $8,750 in Core has no linked deal in HubSpot. Customer: Apex Furniture.',
        aiSuggestion: 'Link to HS-DUP-0045 (Apex Furniture, matching amount, open stage).',
    },
];

interface ReportSection {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

const REPORT_SECTIONS: ReportSection[] = [
    { id: 'pipeline', title: 'Pipeline Health', subtitle: 'Funnel analysis, projections & deal velocity', icon: <ChartBarIcon className="h-4 w-4" /> },
    { id: 'ops', title: 'Operations Summary', subtitle: 'Active projects, delivery status & inventory', icon: <DocumentChartBarIcon className="h-4 w-4" /> },
    { id: 'finance', title: 'Financial Reconciliation', subtitle: '47/47 matched, 3 exceptions resolved', icon: <ArrowsRightLeftIcon className="h-4 w-4" /> },
    { id: 'insights', title: 'AI Recommendations', subtitle: '3 actionable insights from cross-system analysis', icon: <LightBulbIcon className="h-4 w-4" /> },
];

interface AIInsight {
    id: string;
    title: string;
    detail: string;
    impact: string;
    confidence: number;
}

const AI_INSIGHTS: AIInsight[] = [
    {
        id: 'ins-1',
        title: 'Consolidate Zone A + B Shipments',
        detail: 'Next week\'s deliveries to Zone A and Zone B can share a single truck. Estimated savings: $1,200.',
        impact: 'Save $1,200',
        confidence: 92,
    },
    {
        id: 'ins-2',
        title: 'Follow Up on Deal DUP-HP-0039',
        detail: 'Deal inactive for 14 days. Last activity: proposal sent. Historical pattern: 80% of deals that go silent >10 days are lost.',
        impact: 'At risk: $23,400',
        confidence: 78,
    },
    {
        id: 'ins-3',
        title: 'Margin Alert — 3 Items Below Threshold',
        detail: 'Average margin 31.4%. Three line items in recent orders are below 25% threshold: Think v2 (22%), Sayl (23%), Very (19%).',
        impact: 'Review pricing',
        confidence: 95,
    },
];

const SYNC_AGENTS: AgentVis[] = [
    { name: 'HubSpotSync', detail: '47 deals loaded',         visible: false, done: false },
    { name: 'CoreSync',    detail: '12 projects, $1.4M recv.', visible: false, done: false },
    { name: 'FunnelBuilder', detail: 'pipeline visualized',    visible: false, done: false },
    { name: 'AIProjector', detail: '34% close rate projected', visible: false, done: false },
];

const RECON_AGENTS: AgentVis[] = [
    { name: 'DealMatcher',        detail: '44/47 auto-matched',  visible: false, done: false },
    { name: 'DiscrepancyFinder',  detail: '3 exceptions found',  visible: false, done: false },
    { name: 'OpsKPICalculator',   detail: 'DSO, aging computed', visible: false, done: false },
];

const REPORT_AGENTS: AgentVis[] = [
    { name: 'ReportAssembler', detail: '4 sections built',     visible: false, done: false },
    { name: 'ChartGenerator',  detail: 'visualizations ready', visible: false, done: false },
    { name: 'InsightEngine',   detail: '3 recommendations',    visible: false, done: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DuplerReportingProps {
    onNavigate: (page: string) => void;
}

export default function DuplerReporting({ onNavigate }: DuplerReportingProps) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const stepId = currentStep.id;

    // ── pauseAware ──
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 200);
        };
    }, []);

    // ── d3.1 State: Sync ──
    const [syncPhase, setSyncPhase] = useState<SyncPhase>('idle');
    const syncRef = useRef(syncPhase);
    useEffect(() => { syncRef.current = syncPhase; }, [syncPhase]);
    const [syncAgents, setSyncAgents] = useState(SYNC_AGENTS.map(a => ({ ...a })));
    const [syncProgress, setSyncProgress] = useState(0);

    // ── d3.2 State: Reconciliation ──
    const [reconPhase, setReconPhase] = useState<ReconPhase>('idle');
    const [reconAgents, setReconAgents] = useState(RECON_AGENTS.map(a => ({ ...a })));
    const [alertsResolved, setAlertsResolved] = useState<Record<string, 'accepted' | 'manual' | null>>({});

    // ── d3.3 State: Report Assembly ──
    const [assemblyPhase, setAssemblyPhase] = useState<AssemblyPhase>('idle');
    const assemblyRef = useRef(assemblyPhase);
    useEffect(() => { assemblyRef.current = assemblyPhase; }, [assemblyPhase]);
    const [reportAgents, setReportAgents] = useState(REPORT_AGENTS.map(a => ({ ...a })));
    const [reportProgress, setReportProgress] = useState(0);
    const [sectionsRevealed, setSectionsRevealed] = useState(0);

    // ── d3.4 State: Distribution ──
    const [reportPhase, setReportPhase] = useState<ReportPhase>('idle');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [exported, setExported] = useState(false);

    // ── Timing helpers ──
    const tp = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || DUPLER_STEP_TIMING['d3.1'];

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.1: Dual-System Data Sync (System, auto)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd3.1') { setSyncPhase('idle'); return; }
        setSyncPhase('idle');
        setSyncAgents(SYNC_AGENTS.map(a => ({ ...a })));
        setSyncProgress(0);
        const t = tp('d3.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setSyncPhase('notification')), t.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (syncRef.current === 'notification') setSyncPhase('processing'); }), t.notifDelay + t.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    // Processing: stagger agents
    useEffect(() => {
        if (syncPhase !== 'processing') return;
        setSyncAgents(SYNC_AGENTS.map(a => ({ ...a })));
        setSyncProgress(0);
        const t = tp('d3.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setSyncProgress(100), 50));
        SYNC_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setSyncAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setSyncAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = SYNC_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setSyncPhase('breathing')), total));
        return () => timers.forEach(clearTimeout);
    }, [syncPhase]);

    // Breathing → revealed
    useEffect(() => {
        if (syncPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setSyncPhase('revealed')), tp('d3.1').breathing);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // Revealed → results
    useEffect(() => {
        if (syncPhase !== 'revealed') return;
        const t = setTimeout(pauseAware(() => setSyncPhase('results')), 2000);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // Results: auto-advance
    useEffect(() => {
        if (syncPhase !== 'results') return;
        const t = setTimeout(pauseAware(() => nextStep()), tp('d3.1').resultsDur);
        return () => clearTimeout(t);
    }, [syncPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.2: Reconciliation & Expert Review (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd3.2') { setReconPhase('idle'); return; }
        setReconPhase('idle');
        setReconAgents(RECON_AGENTS.map(a => ({ ...a })));
        setAlertsResolved({});
        const t = tp('d3.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setReconPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleReconStart = () => setReconPhase('processing');

    // Processing: stagger agents → revealed
    useEffect(() => {
        if (reconPhase !== 'processing') return;
        setReconAgents(RECON_AGENTS.map(a => ({ ...a })));
        const t = tp('d3.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        RECON_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setReconAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setReconAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = RECON_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setReconPhase('revealed')), total + t.breathing));
        return () => timers.forEach(clearTimeout);
    }, [reconPhase]);

    const resolvedAlertCount = Object.values(alertsResolved).filter(v => v !== null).length;
    const allAlertsResolved = resolvedAlertCount >= CROSS_SYSTEM_ALERTS.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.3: AI Report Assembly (System, auto)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd3.3') { setAssemblyPhase('idle'); return; }
        setAssemblyPhase('idle');
        setReportAgents(REPORT_AGENTS.map(a => ({ ...a })));
        setReportProgress(0);
        setSectionsRevealed(0);
        const t = tp('d3.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setAssemblyPhase('notification')), t.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (assemblyRef.current === 'notification') setAssemblyPhase('processing'); }), t.notifDelay + t.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    // Processing: stagger agents
    useEffect(() => {
        if (assemblyPhase !== 'processing') return;
        setReportAgents(REPORT_AGENTS.map(a => ({ ...a })));
        setReportProgress(0);
        const t = tp('d3.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setReportProgress(100), 50));
        REPORT_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setReportAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setReportAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = REPORT_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setAssemblyPhase('breathing')), total));
        return () => timers.forEach(clearTimeout);
    }, [assemblyPhase]);

    // Breathing → revealed
    useEffect(() => {
        if (assemblyPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setAssemblyPhase('revealed')), tp('d3.3').breathing);
        return () => clearTimeout(t);
    }, [assemblyPhase]);

    // Revealed: stagger section reveals → results
    useEffect(() => {
        if (assemblyPhase !== 'revealed') return;
        setSectionsRevealed(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 0; i < REPORT_SECTIONS.length; i++) {
            timers.push(setTimeout(pauseAware(() => setSectionsRevealed(i + 1)), i * 400));
        }
        timers.push(setTimeout(pauseAware(() => setAssemblyPhase('results')), REPORT_SECTIONS.length * 400 + 800));
        return () => timers.forEach(clearTimeout);
    }, [assemblyPhase]);

    // Results: auto-advance
    useEffect(() => {
        if (assemblyPhase !== 'results') return;
        const t = setTimeout(pauseAware(() => nextStep()), tp('d3.3').resultsDur);
        return () => clearTimeout(t);
    }, [assemblyPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d3.4: Executive Report & Distribution (Dealer, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd3.4') { setReportPhase('idle'); return; }
        setReportPhase('idle');
        setExpandedSections({});
        setExported(false);
        const t = tp('d3.4');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setReportPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleReportStart = () => setReportPhase('revealed');

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Render Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    const renderAgentPipeline = (agents: AgentVis[], progress: number, label: string) => (
        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-3">
                <AIAgentAvatar />
                <span className="text-xs font-bold text-foreground">{label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                <div className="h-full rounded-full bg-brand-400 transition-all duration-[3500ms] ease-linear" style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-1.5">
                {agents.map(agent => (
                    <div key={agent.name} className={`flex items-center gap-2 text-[10px] transition-all duration-300 ${agent.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                        {agent.done ?
                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> :
                            <ArrowPathIcon className="h-3.5 w-3.5 text-indigo-500 animate-spin shrink-0" />
                        }
                        <span className={agent.done ? 'text-foreground' : 'text-indigo-600 dark:text-indigo-400'}>{agent.name}</span>
                        <span className="text-muted-foreground">{agent.detail}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderNotification = (icon: React.ReactNode, title: string, detail: string, onClick: () => void) => (
        <button onClick={onClick} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900">{icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{title}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{detail}</p>
                        <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start <ArrowRightIcon className="h-3 w-3" /></p>
                    </div>
                </div>
            </div>
        </button>
    );

    const renderKPIGrid = (kpis: KPIMetric[]) => (
        <div className="grid grid-cols-2 gap-3">
            {kpis.map(kpi => (
                <div key={kpi.label} className="p-3 rounded-xl bg-card border border-border">
                    <div className="text-[10px] text-muted-foreground mb-1">{kpi.label}</div>
                    <div className="text-lg font-bold text-foreground">{kpi.value}</div>
                    <div className={`text-[10px] mt-1 ${kpi.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {kpi.trend}
                    </div>
                </div>
            ))}
        </div>
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d3.')) return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">
            {/* ── d3.1: Dual-System Data Sync ── */}
            {stepId === 'd3.1' && (
                <>
                    {syncPhase === 'notification' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><ArrowsRightLeftIcon className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Dual-System Sync Starting</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Auto</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">HubSpotSync + CoreSync: Connecting APIs to unify pipeline + operations data.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {syncPhase === 'processing' && renderAgentPipeline(syncAgents, syncProgress, 'Data Sync Pipeline — HubSpot + Core APIs...')}
                    {syncPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Sync complete — building unified view...</span>
                        </div>
                    )}
                    {(syncPhase === 'revealed' || syncPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">HubSpotSync + CoreSync:</span> Connected — <span className="font-semibold">47 deals ($2.8M pipeline)</span> from HubSpot,
                                        <span className="font-semibold"> 12 projects ($1.4M receivables)</span> from Core. Q2 projected close rate: <span className="font-semibold">34%</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Funnel chart */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border">
                                    <span className="text-xs font-bold text-foreground">Pipeline Funnel</span>
                                </div>
                                <div className="p-4">
                                    <ResponsiveContainer width="100%" height={140}>
                                        <BarChart data={FUNNEL_DATA} layout="vertical" barSize={20}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={90} />
                                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                                {FUNNEL_DATA.map((entry) => (
                                                    <Cell key={entry.stage} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* KPI cards */}
                            {renderKPIGrid(KPI_METRICS)}

                            {syncPhase === 'results' && (
                                <div className="text-center text-[10px] text-muted-foreground animate-pulse">
                                    Auto-advancing to reconciliation...
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d3.2: Reconciliation & Expert Review ── */}
            {stepId === 'd3.2' && (
                <>
                    {reconPhase === 'notification' && renderNotification(
                        <ArrowsRightLeftIcon className="h-4 w-4" />,
                        'Cross-System Reconciliation Ready',
                        'DealMatcher: 44/47 deals auto-matched (93.6%). 3 discrepancies require expert review.',
                        handleReconStart
                    )}
                    {reconPhase === 'processing' && renderAgentPipeline(reconAgents, 100, 'Reconciliation Pipeline — Matching HubSpot ↔ Core...')}
                    {reconPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Progress bar */}
                            <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-foreground">Cross-System Match</span>
                                        <span className="text-[10px] font-semibold text-foreground">
                                            {44 + resolvedAlertCount}/47 reconciled
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${((44 + resolvedAlertCount) / 47) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <ConfidenceScoreBadge score={93.6} size="sm" label="Match Rate" />
                            </div>

                            {/* Two-column layout: KPIs + Alerts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Left: Ops KPIs */}
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-foreground">Operational KPIs</span>
                                    {renderKPIGrid(OPS_KPIS)}
                                </div>

                                {/* Right: Discrepancy cards */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">Exceptions</span>
                                        <span className="text-[10px] font-bold text-foreground">{resolvedAlertCount}/{CROSS_SYSTEM_ALERTS.length} Resolved</span>
                                    </div>
                                    {CROSS_SYSTEM_ALERTS.map(alert => (
                                        <div key={alert.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                            alertsResolved[alert.id]
                                                ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5'
                                                : alert.type === 'amount-mismatch'
                                                    ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                                                    : alert.type === 'duplicate'
                                                        ? 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                                                        : 'border-blue-300 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                    alert.type === 'duplicate' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                                                    alert.type === 'amount-mismatch' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                                    'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                    {alert.type === 'duplicate' ? 'Duplicate' : alert.type === 'amount-mismatch' ? 'Amount Mismatch' : 'Missing Link'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">{alert.hubspotRef} ↔ {alert.coreRef}</span>
                                            </div>
                                            <p className="text-[11px] text-foreground mt-1">{alert.detail}</p>
                                            <div className="flex items-start gap-1 mt-1.5">
                                                <AIAgentAvatar />
                                                <span className="text-[10px] text-muted-foreground italic">{alert.aiSuggestion}</span>
                                            </div>
                                            {alertsResolved[alert.id] ? (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                                                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                                                        {alertsResolved[alert.id] === 'accepted' ? 'AI fix applied' : 'Manually reviewed'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => setAlertsResolved(prev => ({ ...prev, [alert.id]: 'accepted' }))}
                                                        className="px-3 py-1.5 bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold rounded-lg transition-colors"
                                                    >
                                                        Accept AI Fix
                                                    </button>
                                                    <button
                                                        onClick={() => setAlertsResolved(prev => ({ ...prev, [alert.id]: 'manual' }))}
                                                        className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10px] font-semibold rounded-lg border border-border transition-colors"
                                                    >
                                                        Manual Review
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Acknowledge button */}
                            <button
                                onClick={() => nextStep()}
                                disabled={!allAlertsResolved}
                                className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    allAlertsResolved
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    {allAlertsResolved ? 'Acknowledge & Continue — 47/47 Reconciled' : `Resolve All Exceptions (${resolvedAlertCount}/${CROSS_SYSTEM_ALERTS.length})`}
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d3.3: AI Report Assembly ── */}
            {stepId === 'd3.3' && (
                <>
                    {assemblyPhase === 'notification' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><DocumentChartBarIcon className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Report Assembly Starting</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Auto</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">ReportAssembler: Building executive report from reconciled data — 4 sections with AI insights.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {assemblyPhase === 'processing' && renderAgentPipeline(reportAgents, reportProgress, 'Report Assembly — Building 4 sections...')}
                    {assemblyPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Assembly complete — formatting report...</span>
                        </div>
                    )}
                    {(assemblyPhase === 'revealed' || assemblyPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">ReportAssembler:</span> Executive report ready —
                                        <span className="font-semibold"> 4 sections</span> with charts, KPIs, and <span className="font-semibold">3 AI recommendations</span>.
                                        PDF-ready layout generated.
                                    </p>
                                </div>
                            </div>

                            {/* Report sections preview */}
                            <div className="space-y-2">
                                {REPORT_SECTIONS.slice(0, sectionsRevealed).map((section, idx) => (
                                    <div key={section.id} className="p-4 rounded-xl bg-card border border-border animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-muted text-foreground">{section.icon}</div>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-foreground">{section.title}</span>
                                                <p className="text-[10px] text-muted-foreground">{section.subtitle}</p>
                                            </div>
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {assemblyPhase === 'results' && (
                                <div className="flex items-center justify-center gap-2 animate-in fade-in duration-300">
                                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 px-3 py-1 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
                                        Report Ready
                                    </span>
                                    <span className="text-[10px] text-muted-foreground animate-pulse">Auto-advancing to distribution...</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d3.4: Executive Report & Distribution ── */}
            {stepId === 'd3.4' && (
                <>
                    {reportPhase === 'notification' && renderNotification(
                        <DocumentArrowDownIcon className="h-4 w-4" />,
                        'Executive Report Ready for Review',
                        'ReportAgent: Complete executive report with 4 sections and 3 AI recommendations. Ready for export and distribution.',
                        handleReportStart
                    )}
                    {reportPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Collapsible report sections */}
                            <div className="space-y-2">
                                {REPORT_SECTIONS.map(section => (
                                    <div key={section.id} className="rounded-xl border border-border overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full px-4 py-3 flex items-center gap-3 bg-card hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="p-1.5 rounded-lg bg-muted text-foreground">{section.icon}</div>
                                            <div className="flex-1 text-left">
                                                <span className="text-xs font-bold text-foreground">{section.title}</span>
                                                <p className="text-[10px] text-muted-foreground">{section.subtitle}</p>
                                            </div>
                                            {expandedSections[section.id]
                                                ? <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                                                : <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                                            }
                                        </button>
                                        {expandedSections[section.id] && (
                                            <div className="px-4 py-3 border-t border-border bg-muted/20 animate-in fade-in duration-200">
                                                {section.id === 'pipeline' && (
                                                    <div className="space-y-3">
                                                        <ResponsiveContainer width="100%" height={120}>
                                                            <BarChart data={FUNNEL_DATA} layout="vertical" barSize={16}>
                                                                <XAxis type="number" hide />
                                                                <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} width={80} />
                                                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                                                    {FUNNEL_DATA.map((entry) => (
                                                                        <Cell key={entry.stage} fill={entry.color} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                        {renderKPIGrid(KPI_METRICS)}
                                                    </div>
                                                )}
                                                {section.id === 'ops' && renderKPIGrid(OPS_KPIS)}
                                                {section.id === 'finance' && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="text-foreground font-semibold">47/47 deals reconciled</span>
                                                            <ConfidenceScoreBadge score={100} size="sm" />
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground">
                                                            44 auto-matched + 3 exceptions resolved (1 duplicate merged, 1 amount corrected, 1 invoice linked)
                                                        </div>
                                                    </div>
                                                )}
                                                {section.id === 'insights' && (
                                                    <div className="space-y-3">
                                                        {AI_INSIGHTS.map(insight => (
                                                            <div key={insight.id} className="p-3 rounded-lg bg-card border border-border">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-[11px] font-bold text-foreground">{insight.title}</span>
                                                                    <ConfidenceScoreBadge score={insight.confidence} size="sm" />
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground">{insight.detail}</p>
                                                                <div className="mt-1.5">
                                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-400">
                                                                        {insight.impact}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Export button */}
                            <button
                                onClick={() => setExported(true)}
                                disabled={exported}
                                className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    exported
                                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-500/30'
                                        : 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30'
                                }`}
                            >
                                {exported ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircleIcon className="h-4 w-4" /> Report Sent to 3 Stakeholders
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <PaperAirplaneIcon className="h-4 w-4" /> Export PDF & Send to Team
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
