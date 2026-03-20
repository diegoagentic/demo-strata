// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 2: Warehouse & Transit Inventory
// Steps: d2.1 (Receiving), d2.2 (Assignment), d2.3 (Transit), d2.4 (Staging)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';
import {
    QrCodeIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    TruckIcon,
    CubeIcon,
    ClipboardDocumentCheckIcon,
    XCircleIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';

// ─── Types ───────────────────────────────────────────────────────────────────

type ReceivingPhase = 'idle' | 'notification' | 'scanning' | 'matching' | 'results';
type AssignmentPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type TransitPhase = 'idle' | 'notification' | 'revealed' | 'resolving';
type StagingPhase = 'idle' | 'notification' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface ReceivingItem {
    line: number;
    sku: string;
    description: string;
    poQty: number;
    receivedQty: number;
    status: 'matched' | 'missing' | 'wrong';
    poRef: string;
    note?: string;
}

const RECEIVING_ITEMS: ReceivingItem[] = [
    { line: 1,  sku: 'ST-TS-4410', description: 'Steelcase Think v2',           poQty: 18, receivedQty: 18, status: 'matched', poRef: 'PO-2026-0412' },
    { line: 2,  sku: 'ST-LP-3400', description: 'Leap V2 Platinum',             poQty: 5,  receivedQty: 5,  status: 'matched', poRef: 'PO-2026-0412' },
    { line: 3,  sku: 'ST-GP-2200', description: 'Gesture Shell Back',           poQty: 8,  receivedQty: 8,  status: 'matched', poRef: 'PO-2026-0412' },
    { line: 4,  sku: 'ST-ML-1100', description: 'Migration SE Height-Adj Desk', poQty: 4,  receivedQty: 4,  status: 'matched', poRef: 'PO-2026-0412' },
    // Missing items
    { line: 5,  sku: 'ST-CR-6600', description: 'Coalesse Free Stand Desk',     poQty: 2,  receivedQty: 0,  status: 'missing', poRef: 'PO-2026-0412', note: 'Backorder confirmed — ETA 2 weeks' },
    { line: 6,  sku: 'ST-BN-7800', description: 'Brody WorkLounge',             poQty: 3,  receivedQty: 0,  status: 'missing', poRef: 'PO-2026-0412', note: 'Backorder confirmed — shipping next week' },
    // Wrong item
    { line: 7,  sku: 'ST-TS-4410', description: 'Think v2 — Color: Fog (wrong)', poQty: 0, receivedQty: 2,  status: 'wrong',  poRef: 'PO-2026-0412', note: 'Ordered Graphite, received Fog. Claim CLM-2026-047 drafted.' },
];

const MATCHED_RECEIVING = RECEIVING_ITEMS.filter(i => i.status === 'matched');
const EXCEPTIONS_RECEIVING = RECEIVING_ITEMS.filter(i => i.status !== 'matched');

interface WarehouseZone {
    id: string;
    name: string;
    capacity: number;
    used: number;
    items: number;
    type: 'project' | 'general' | 'qc';
    color: string;
}

const WAREHOUSE_ZONES: WarehouseZone[] = [
    { id: 'A', name: 'Zone A — UAL Project', capacity: 100, used: 64, items: 20, type: 'project', color: 'bg-blue-500' },
    { id: 'B', name: 'Zone B — General Stock', capacity: 100, used: 78, items: 12, type: 'general', color: 'bg-emerald-500' },
    { id: 'C', name: 'Zone C — QC Pending',    capacity: 100, used: 15, items: 3,  type: 'qc',      color: 'bg-amber-500' },
];

interface Shipment {
    id: string;
    carrier: string;
    manufacturer: string;
    itemCount: number;
    eta: string;
    status: 'on-time' | 'delayed' | 'arriving-today';
    dock?: string;
    hasConflict?: boolean;
    delayReason?: string;
}

const SHIPMENTS: Shipment[] = [
    { id: 'SH-001', carrier: 'FedEx Freight',   manufacturer: 'Steelcase',     itemCount: 14, eta: 'Today, 10:00 AM', status: 'arriving-today', dock: 'Dock 1', hasConflict: true },
    { id: 'SH-002', carrier: 'XPO Logistics',   manufacturer: 'Herman Miller', itemCount: 22, eta: 'Today, 10:00 AM', status: 'arriving-today', dock: 'Dock 1', hasConflict: true },
    { id: 'SH-003', carrier: 'Old Dominion',    manufacturer: 'Knoll',         itemCount: 8,  eta: 'Tomorrow, 2 PM',  status: 'on-time' },
    { id: 'SH-004', carrier: 'SAIA',            manufacturer: 'Haworth',       itemCount: 11, eta: 'Thu, 11 AM',      status: 'delayed', delayReason: 'Weather hold — Memphis hub (+2 days)' },
    { id: 'SH-005', carrier: 'Estes Express',   manufacturer: 'DIRTT',         itemCount: 6,  eta: 'Fri, 9 AM',       status: 'on-time' },
];

interface StagingItem {
    id: string;
    name: string;
    qty: number;
    staged: boolean;
    pendingDelivery: boolean;
}

const STAGING_ITEMS: StagingItem[] = [
    { id: 'stg-01', name: 'Steelcase Think v2 Task Chair',       qty: 18, staged: true,  pendingDelivery: false },
    { id: 'stg-02', name: 'Leap V2 Platinum Task Chair',         qty: 5,  staged: true,  pendingDelivery: false },
    { id: 'stg-03', name: 'Gesture Shell Back Chair',            qty: 8,  staged: true,  pendingDelivery: false },
    { id: 'stg-04', name: 'Migration SE Height-Adj Desk',        qty: 4,  staged: true,  pendingDelivery: false },
    { id: 'stg-05', name: 'Aeron Remastered Chair',              qty: 12, staged: true,  pendingDelivery: false },
    { id: 'stg-06', name: 'Sayl Task Chair',                     qty: 20, staged: true,  pendingDelivery: false },
    { id: 'stg-07', name: 'Muuto Outline Sofa',                  qty: 4,  staged: true,  pendingDelivery: false },
    // Pending delivery
    { id: 'stg-08', name: 'Coalesse Free Stand Desk (backorder)', qty: 2, staged: false, pendingDelivery: true },
    { id: 'stg-09', name: 'Brody WorkLounge (backorder)',         qty: 3, staged: false, pendingDelivery: true },
];

const RECEIVING_AGENTS: AgentVis[] = [
    { name: 'QRScanner',      detail: '38 items scanned',      visible: false, done: false },
    { name: 'POMatchEngine',  detail: 'PO-2026-0412 loaded',   visible: false, done: false },
    { name: 'ExceptionHandler', detail: '3 exceptions flagged', visible: false, done: false },
];

const ZONE_AGENTS: AgentVis[] = [
    { name: 'ZoneAnalyzer',       detail: '3 zones evaluated',     visible: false, done: false },
    { name: 'PlacementOptimizer', detail: '35 items assigned',     visible: false, done: false },
    { name: 'CapacityMonitor',    detail: '74% capacity computed', visible: false, done: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DuplerWarehouseProps {
    onNavigate: (page: string) => void;
}

export default function DuplerWarehouse({ onNavigate }: DuplerWarehouseProps) {
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

    // ── d2.1 State: Receiving ──
    const [recPhase, setRecPhase] = useState<ReceivingPhase>('idle');
    const [recAgents, setRecAgents] = useState(RECEIVING_AGENTS.map(a => ({ ...a })));
    const [scanProgress, setScanProgress] = useState(0);
    const [itemsScanned, setItemsScanned] = useState(0);
    const [recConfirmed, setRecConfirmed] = useState(false);

    // ── d2.2 State: Assignment ──
    const [assignPhase, setAssignPhase] = useState<AssignmentPhase>('idle');
    const assignRef = useRef(assignPhase);
    useEffect(() => { assignRef.current = assignPhase; }, [assignPhase]);
    const [zoneAgents, setZoneAgents] = useState(ZONE_AGENTS.map(a => ({ ...a })));
    const [zoneProgress, setZoneProgress] = useState(0);
    const [zoneFills, setZoneFills] = useState<number[]>([0, 0, 0]);

    // ── d2.3 State: Transit ──
    const [transitPhase, setTransitPhase] = useState<TransitPhase>('idle');
    const [conflictResolved, setConflictResolved] = useState(false);

    // ── d2.4 State: Staging ──
    const [stagPhase, setStagPhase] = useState<StagingPhase>('idle');
    const [dispatched, setDispatched] = useState(false);

    // ── Timing helpers ──
    const tp = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || DUPLER_STEP_TIMING['d2.1'];

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.1: Receiving & PO Matching (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.1') { setRecPhase('idle'); return; }
        setRecPhase('idle');
        setRecAgents(RECEIVING_AGENTS.map(a => ({ ...a })));
        setScanProgress(0);
        setItemsScanned(0);
        setRecConfirmed(false);
        const t = tp('d2.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setRecPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleRecStart = () => setRecPhase('scanning');

    // Scanning → stagger agents, animate scan
    useEffect(() => {
        if (recPhase !== 'scanning') return;
        setRecAgents(RECEIVING_AGENTS.map(a => ({ ...a })));
        setScanProgress(0);
        setItemsScanned(0);
        const t = tp('d2.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setScanProgress(100), 50));
        RECEIVING_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setRecAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setRecAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        // Stagger item scan count
        const totalItems = 7;
        for (let i = 0; i < totalItems; i++) {
            timers.push(setTimeout(pauseAware(() => setItemsScanned(i + 1)), i * 200 + 400));
        }
        const total = RECEIVING_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setRecPhase('matching')), total));
        return () => timers.forEach(clearTimeout);
    }, [recPhase]);

    // Matching → results
    useEffect(() => {
        if (recPhase !== 'matching') return;
        const t = setTimeout(pauseAware(() => setRecPhase('results')), 1200);
        return () => clearTimeout(t);
    }, [recPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.2: Warehouse Assignment & Capacity (System, auto)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.2') { setAssignPhase('idle'); return; }
        setAssignPhase('idle');
        setZoneAgents(ZONE_AGENTS.map(a => ({ ...a })));
        setZoneProgress(0);
        setZoneFills([0, 0, 0]);
        const t = tp('d2.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setAssignPhase('notification')), t.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (assignRef.current === 'notification') setAssignPhase('processing'); }), t.notifDelay + t.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    // Processing: stagger agents
    useEffect(() => {
        if (assignPhase !== 'processing') return;
        setZoneAgents(ZONE_AGENTS.map(a => ({ ...a })));
        setZoneProgress(0);
        const t = tp('d2.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setZoneProgress(100), 50));
        ZONE_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setZoneAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setZoneAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = ZONE_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setAssignPhase('breathing')), total));
        return () => timers.forEach(clearTimeout);
    }, [assignPhase]);

    // Breathing → revealed
    useEffect(() => {
        if (assignPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setAssignPhase('revealed')), tp('d2.2').breathing);
        return () => clearTimeout(t);
    }, [assignPhase]);

    // Revealed: animate zone fills → results
    useEffect(() => {
        if (assignPhase !== 'revealed') return;
        setZoneFills([0, 0, 0]);
        const timers: ReturnType<typeof setTimeout>[] = [];
        // Animate fill bars
        timers.push(setTimeout(() => setZoneFills([64, 0, 0]), 300));
        timers.push(setTimeout(() => setZoneFills([64, 78, 0]), 700));
        timers.push(setTimeout(() => setZoneFills([64, 78, 15]), 1100));
        timers.push(setTimeout(pauseAware(() => setAssignPhase('results')), 2000));
        return () => timers.forEach(clearTimeout);
    }, [assignPhase]);

    // Results: auto-advance
    useEffect(() => {
        if (assignPhase !== 'results') return;
        const t = setTimeout(pauseAware(() => nextStep()), tp('d2.2').resultsDur);
        return () => clearTimeout(t);
    }, [assignPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.3: Transit Tracking & Delivery Schedule (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.3') { setTransitPhase('idle'); return; }
        setTransitPhase('idle');
        setConflictResolved(false);
        const t = tp('d2.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setTransitPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleTransitStart = () => setTransitPhase('revealed');

    // ═══════════════════════════════════════════════════════════════════════════
    // d2.4: Pre-Install Staging & Dispatch (Dealer, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd2.4') { setStagPhase('idle'); return; }
        setStagPhase('idle');
        setDispatched(false);
        const t = tp('d2.4');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setStagPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleStagStart = () => setStagPhase('revealed');

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

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d2.')) return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">
            {/* ── d2.1: Receiving & PO Matching ── */}
            {stepId === 'd2.1' && (
                <>
                    {recPhase === 'notification' && renderNotification(
                        <QrCodeIcon className="h-4 w-4" />,
                        'Steelcase Shipment Arrived — PO-2026-0412',
                        'ReceivingAgent: Incoming shipment detected at Dock 2. Ready for QR scan and PO matching.',
                        handleRecStart
                    )}
                    {recPhase === 'scanning' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {renderAgentPipeline(recAgents, scanProgress, 'Receiving Pipeline — Scanning & Matching...')}
                            {/* Scan animation */}
                            <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <QrCodeIcon className="h-4 w-4 text-indigo-500" />
                                    <span className="text-xs font-bold text-foreground">QR Scanning</span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">{itemsScanned}/38 items</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${(itemsScanned / 7) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    )}
                    {recPhase === 'matching' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Cross-referencing against PO-2026-0412...</span>
                        </div>
                    )}
                    {recPhase === 'results' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">ReceivingAgent:</span> Scan complete — <span className="font-semibold">35/38 items matched</span>.
                                        2 missing (backorder confirmed), 1 wrong item (claim auto-drafted). Ready for expert confirmation.
                                    </p>
                                </div>
                            </div>

                            {/* Status badges */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-foreground font-semibold">35 Matched</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-foreground font-semibold">2 Missing</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-foreground font-semibold">1 Wrong</span>
                                </div>
                            </div>

                            {/* Matched items (collapsed preview) */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Matched Items</span>
                                    <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">35 items verified</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {MATCHED_RECEIVING.map(item => (
                                        <div key={item.line} className="px-4 py-2 flex items-center gap-4 text-[11px]">
                                            <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            <span className="font-mono text-foreground w-24">{item.sku}</span>
                                            <span className="text-foreground flex-1 truncate">{item.description}</span>
                                            <span className="text-muted-foreground w-16 text-right">×{item.receivedQty}/{item.poQty}</span>
                                        </div>
                                    ))}
                                    <div className="px-4 py-2 text-[10px] text-muted-foreground bg-muted/30">
                                        + 31 more matched items...
                                    </div>
                                </div>
                            </div>

                            {/* Exceptions */}
                            <div className="space-y-3">
                                {EXCEPTIONS_RECEIVING.map(item => (
                                    <div key={item.line} className={`p-4 rounded-xl border-2 ${
                                        item.status === 'missing'
                                            ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                                            : 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                                    }`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                        item.status === 'missing'
                                                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                            : 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                        {item.status === 'missing' ? 'Missing' : 'Wrong Item'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{item.line}</span>
                                                </div>
                                                <div className="text-[11px] mt-1">
                                                    <span className="font-mono text-foreground">{item.sku}</span>
                                                    <span className="text-muted-foreground ml-2">{item.description}</span>
                                                </div>
                                                {item.note && (
                                                    <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                                        <AIAgentAvatar />
                                                        <span className="italic">{item.note}</span>
                                                    </p>
                                                )}
                                            </div>
                                            {item.status === 'missing' ? (
                                                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
                                                    <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                                                    <span className="font-semibold">Backorder tracked</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400 shrink-0">
                                                    <XCircleIcon className="h-3.5 w-3.5" />
                                                    <span className="font-semibold">Claim drafted</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Confirm button */}
                            <button
                                onClick={() => { setRecConfirmed(true); nextStep(); }}
                                disabled={recConfirmed}
                                className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    recConfirmed
                                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-500/30'
                                        : 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30'
                                }`}
                            >
                                {recConfirmed ? (
                                    <span className="flex items-center justify-center gap-2"><CheckCircleIcon className="h-4 w-4" /> Receiving Confirmed</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2"><ClipboardDocumentCheckIcon className="h-4 w-4" /> Confirm Receiving — 35 Matched, 3 Exceptions Handled</span>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d2.2: Warehouse Assignment & Capacity ── */}
            {stepId === 'd2.2' && (
                <>
                    {assignPhase === 'notification' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><CubeIcon className="h-4 w-4" /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-foreground">Warehouse Zone Assignment Starting</span>
                                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Auto</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1">PlacementOptimizer: Auto-assigning 35 received items to optimal warehouse zones based on project schedule and capacity.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {assignPhase === 'processing' && renderAgentPipeline(zoneAgents, zoneProgress, 'Zone Assignment Pipeline — Optimizing placement...')}
                    {assignPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Assignment complete — building zone map...</span>
                        </div>
                    )}
                    {(assignPhase === 'revealed' || assignPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* AI Summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">PlacementOptimizer:</span> All <span className="font-semibold">35 items assigned</span>.
                                        Zone A (UAL Project): 20 items. Zone B (General Stock): 12 items. Zone C (QC Pending): 3 items.
                                        Warehouse at <span className="font-semibold">74% capacity</span>.
                                    </p>
                                </div>
                            </div>

                            {/* Zone visualization */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Warehouse Zone Map</span>
                                    <span className="text-[10px] font-semibold text-muted-foreground">74% Total Capacity</span>
                                </div>
                                <div className="p-4 space-y-4">
                                    {WAREHOUSE_ZONES.map((zone, idx) => (
                                        <div key={zone.id}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${zone.color}`} />
                                                    <span className="text-[11px] font-bold text-foreground">{zone.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                                    <span>{zone.items} items</span>
                                                    <span className="font-semibold text-foreground">{zoneFills[idx]}%</span>
                                                </div>
                                            </div>
                                            <div className="h-3 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${zone.color} transition-all duration-700 ease-out`}
                                                    style={{ width: `${zoneFills[idx]}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-card border border-border text-center">
                                    <div className="text-lg font-bold text-foreground">35</div>
                                    <div className="text-[10px] text-muted-foreground">Items Assigned</div>
                                </div>
                                <div className="p-3 rounded-xl bg-card border border-border text-center">
                                    <div className="text-lg font-bold text-foreground">3</div>
                                    <div className="text-[10px] text-muted-foreground">Zones Used</div>
                                </div>
                                <div className="p-3 rounded-xl bg-card border border-border text-center">
                                    <div className="text-lg font-bold text-foreground">74%</div>
                                    <div className="text-[10px] text-muted-foreground">Capacity</div>
                                </div>
                            </div>

                            {assignPhase === 'results' && (
                                <div className="text-center text-[10px] text-muted-foreground animate-pulse">
                                    Auto-advancing to transit tracking...
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d2.3: Transit Tracking & Delivery Schedule ── */}
            {stepId === 'd2.3' && (
                <>
                    {transitPhase === 'notification' && renderNotification(
                        <TruckIcon className="h-4 w-4" />,
                        'Transit Dashboard — 5 Active Shipments',
                        'TransitTracker: 5 shipments from 3 manufacturers in transit. Dock conflict detected — 2 shipments arriving at Dock 1 simultaneously.',
                        handleTransitStart
                    )}
                    {(transitPhase === 'revealed' || transitPhase === 'resolving') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Dock conflict alert */}
                            {!conflictResolved && (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border-2 border-red-300 dark:border-red-500/30 animate-in fade-in duration-300">
                                    <div className="flex items-start gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-xs font-bold text-red-700 dark:text-red-400">Dock Conflict Detected</span>
                                            <p className="text-[11px] text-red-600 dark:text-red-300 mt-1">
                                                FedEx Freight (Steelcase) and XPO Logistics (Herman Miller) both scheduled for Dock 1 at 10:00 AM.
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <AIAgentAvatar />
                                                <span className="text-[10px] text-muted-foreground italic">AI Suggestion: Move Herman Miller to Dock 3 at 2:00 PM</span>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => setConflictResolved(true)}
                                                    className="px-3 py-1.5 bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold rounded-lg transition-colors"
                                                >
                                                    Accept AI Suggestion
                                                </button>
                                                <button
                                                    onClick={() => setConflictResolved(true)}
                                                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-[10px] font-semibold rounded-lg border border-border transition-colors"
                                                >
                                                    Manual Reschedule
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {conflictResolved && (
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-300 dark:border-green-500/30 flex items-center gap-2 animate-in fade-in duration-300">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-green-700 dark:text-green-400 font-semibold">Dock conflict resolved — Herman Miller moved to Dock 3 at 2:00 PM</span>
                                </div>
                            )}

                            {/* Shipment cards */}
                            <div className="grid grid-cols-1 gap-3">
                                {SHIPMENTS.map(ship => (
                                    <div key={ship.id} className={`p-4 rounded-xl border ${
                                        ship.hasConflict && !conflictResolved
                                            ? 'border-red-300 dark:border-red-500/30 bg-red-50/30 dark:bg-red-500/5'
                                            : 'border-border bg-card'
                                    } transition-all duration-300`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <TruckIcon className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <div className="text-[11px] font-bold text-foreground">{ship.carrier}</div>
                                                    <div className="text-[10px] text-muted-foreground">{ship.manufacturer} — {ship.itemCount} items</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-[11px] font-semibold text-foreground">
                                                        {conflictResolved && ship.id === 'SH-002' ? 'Today, 2:00 PM' : ship.eta}
                                                    </div>
                                                    {conflictResolved && ship.id === 'SH-002' && (
                                                        <div className="text-[9px] text-green-600 dark:text-green-400">Dock 3 (rescheduled)</div>
                                                    )}
                                                    {ship.dock && !(conflictResolved && ship.id === 'SH-002') && (
                                                        <div className="text-[9px] text-muted-foreground">{ship.dock}</div>
                                                    )}
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                    ship.status === 'on-time' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                                    ship.status === 'delayed' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                                    'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                    {ship.status === 'arriving-today' ? 'Today' : ship.status}
                                                </span>
                                            </div>
                                        </div>
                                        {ship.delayReason && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400">
                                                <ExclamationTriangleIcon className="h-3 w-3" />
                                                {ship.delayReason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Update button */}
                            <button
                                onClick={() => nextStep()}
                                disabled={!conflictResolved}
                                className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    conflictResolved
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
                                }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <TruckIcon className="h-4 w-4" />
                                    {conflictResolved ? 'Update Schedule — All Conflicts Resolved' : 'Resolve Dock Conflict to Continue'}
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d2.4: Pre-Install Staging & Dispatch ── */}
            {stepId === 'd2.4' && (
                <>
                    {stagPhase === 'notification' && renderNotification(
                        <ClipboardDocumentCheckIcon className="h-4 w-4" />,
                        'Staging Checklist Ready — UAL Project Install',
                        'StagingAgent: Pre-install checklist generated. 28/30 items staged and ready. 2 items arriving today at 2 PM.',
                        handleStagStart
                    )}
                    {stagPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Installer info */}
                            <div className="p-4 rounded-xl bg-card border border-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <TruckIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-foreground">ProInstall LLC — Thursday 8:00 AM</div>
                                        <div className="text-[10px] text-muted-foreground">4 crew members • Lead: Luis Mendez</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 p-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 text-center">
                                        <div className="text-sm font-bold text-green-700 dark:text-green-400">28</div>
                                        <div className="text-[9px] text-green-600 dark:text-green-400">Ready</div>
                                    </div>
                                    <div className="flex-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-center">
                                        <div className="text-sm font-bold text-amber-700 dark:text-amber-400">2</div>
                                        <div className="text-[9px] text-amber-600 dark:text-amber-400">Pending</div>
                                    </div>
                                    <div className="flex-1 p-2 rounded-lg bg-muted border border-border text-center">
                                        <div className="text-sm font-bold text-foreground">30</div>
                                        <div className="text-[9px] text-muted-foreground">Total</div>
                                    </div>
                                </div>
                            </div>

                            {/* Staging checklist */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Staging Checklist</span>
                                    <span className="text-[10px] text-muted-foreground">28/30 staged</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {STAGING_ITEMS.map(item => (
                                        <div key={item.id} className={`px-4 py-2.5 flex items-center gap-3 text-[11px] ${
                                            item.pendingDelivery ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                                        }`}>
                                            {item.staged ? (
                                                <CheckCircleIcon className="h-4 w-4 text-green-500 shrink-0" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-amber-400 shrink-0" />
                                            )}
                                            <span className={`flex-1 ${item.pendingDelivery ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                {item.name}
                                            </span>
                                            <span className="text-muted-foreground w-10 text-right">×{item.qty}</span>
                                            {item.pendingDelivery && (
                                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    Arriving 2 PM
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dispatch button */}
                            <button
                                onClick={() => { setDispatched(true); nextStep(); }}
                                disabled={dispatched}
                                className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    dispatched
                                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-500/30'
                                        : 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30'
                                }`}
                            >
                                {dispatched ? (
                                    <span className="flex items-center justify-center gap-2"><CheckCircleIcon className="h-4 w-4" /> Dispatch Confirmed</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2"><TruckIcon className="h-4 w-4" /> Confirm Dispatch — 28 Items Staged, 2 Arriving Today</span>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
