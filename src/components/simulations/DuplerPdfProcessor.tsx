// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 1: PDF to SIFF Intelligence
// Steps: d1.1 (OCR), d1.2 (SIFF Mapping), d1.3 (Price Validation), d1.4 (Approval & Export)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../../context/DemoContext';
import { AIAgentAvatar } from './DemoAvatars';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';
import {
    DocumentTextIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    ArrowDownTrayIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';

// ─── Types ───────────────────────────────────────────────────────────────────

type OcrPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results';
type MappingPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type ValidationPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type ExportPhase = 'idle' | 'notification' | 'approval-chain' | 'generating' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface SiffLineItem {
    line: number;
    sku: string;
    description: string;
    siffCode: string;
    qty: number;
    unitPrice: number;
    mappingStatus: 'matched' | 'obsolete' | 'mismatch';
    substituteSku?: string;
    substituteDesc?: string;
    confidenceScore: number;
}

const SIFF_ITEMS: SiffLineItem[] = [
    { line: 1,  sku: 'HM-AE-2024', description: 'Aeron Chair Remastered',     siffCode: 'SIFF-CH-001', qty: 12, unitPrice: 1395, mappingStatus: 'matched',  confidenceScore: 98 },
    { line: 2,  sku: 'HM-SE-1050', description: 'Sayl Task Chair',             siffCode: 'SIFF-CH-012', qty: 24, unitPrice: 695,  mappingStatus: 'matched',  confidenceScore: 96 },
    { line: 3,  sku: 'HM-FN-3020', description: 'Fern High Performance',       siffCode: 'SIFF-CH-018', qty: 8,  unitPrice: 1150, mappingStatus: 'matched',  confidenceScore: 97 },
    { line: 4,  sku: 'KN-MU-7700', description: 'Muuto Outline Sofa',          siffCode: 'SIFF-LN-005', qty: 4,  unitPrice: 3200, mappingStatus: 'matched',  confidenceScore: 95 },
    { line: 5,  sku: 'ST-TS-4410', description: 'Steelcase Think v2',          siffCode: 'SIFF-CH-025', qty: 18, unitPrice: 845,  mappingStatus: 'matched',  confidenceScore: 99 },
    { line: 6,  sku: 'HW-ZD-1200', description: 'Zody Digital Knit',           siffCode: 'SIFF-CH-032', qty: 6,  unitPrice: 920,  mappingStatus: 'matched',  confidenceScore: 94 },
    // Obsolete items
    { line: 7,  sku: 'HM-ML-2019', description: 'Mirra 2 Task Chair (2019)',   siffCode: '',            qty: 10, unitPrice: 780,  mappingStatus: 'obsolete', substituteSku: 'HM-ML-2024', substituteDesc: 'Mirra 2 Updated (2024)', confidenceScore: 87 },
    { line: 8,  sku: 'KN-RF-5500', description: 'ReGeneration Flex Back',      siffCode: '',            qty: 6,  unitPrice: 620,  mappingStatus: 'obsolete', substituteSku: 'KN-RF-5520', substituteDesc: 'ReGeneration Next Gen', confidenceScore: 82 },
    { line: 9,  sku: 'ST-LP-3300', description: 'Leap V1 Platinum',            siffCode: '',            qty: 5,  unitPrice: 1100, mappingStatus: 'obsolete', substituteSku: 'ST-LP-3400', substituteDesc: 'Leap V2 Platinum', confidenceScore: 91 },
    // Mismatched items
    { line: 10, sku: 'HW-VR-8800', description: 'Very Task Chair Hi-Back',     siffCode: 'SIFF-CH-041', qty: 8,  unitPrice: 560,  mappingStatus: 'mismatch', confidenceScore: 64 },
    { line: 11, sku: 'DT-WL-2200', description: 'DIRTT Wall Panel 48"',        siffCode: 'SIFF-AR-015', qty: 20, unitPrice: 425,  mappingStatus: 'mismatch', confidenceScore: 58 },
];

// Show a subset of 45 total — rest are implied matched
const MATCHED_COUNT = 40;
const OBSOLETE_COUNT = 3;
const MISMATCH_COUNT = 2;

interface PriceDiscrepancy {
    id: string;
    lineRef: number;
    sku: string;
    description: string;
    poPrice: number;
    contractPrice: number;
    delta: number;
    deltaPercent: string;
    type: 'outdated-price' | 'qty-mismatch' | 'uom-error';
    aiSuggestion: string;
}

const PRICE_DISCREPANCIES: PriceDiscrepancy[] = [
    { id: 'pd1', lineRef: 5,  sku: 'ST-TS-4410', description: 'Steelcase Think v2',     poPrice: 870, contractPrice: 845, delta: 25,   deltaPercent: '+3.0%', type: 'outdated-price', aiSuggestion: 'Contract price $845 is current. PDF uses Q4 2025 list price.' },
    { id: 'pd2', lineRef: 6,  sku: 'HW-ZD-1200', description: 'Zody Digital Knit',      poPrice: 948, contractPrice: 920, delta: 28,   deltaPercent: '+3.0%', type: 'outdated-price', aiSuggestion: 'Contract price $920 is current. Manufacturer increased list in Jan 2026.' },
    { id: 'pd3', lineRef: 2,  sku: 'HM-SE-1050', description: 'Sayl Task Chair',        poPrice: 695, contractPrice: 695, delta: 0,    deltaPercent: '0%',    type: 'qty-mismatch',  aiSuggestion: 'PDF shows qty 24 but original PO has qty 20. Verify with buyer.' },
    { id: 'pd4', lineRef: 10, sku: 'HW-VR-8800', description: 'Very Task Chair Hi-Back', poPrice: 560, contractPrice: 280, delta: 280,  deltaPercent: '+100%', type: 'uom-error',     aiSuggestion: 'PDF price $560 is per PAIR. Contract $280 is per UNIT. Adjust UOM.' },
];

const OCR_AGENTS: AgentVis[] = [
    { name: 'OCRAgent',       detail: '12 pages scanned',    visible: false, done: false },
    { name: 'TextExtract',    detail: 'tables parsed',       visible: false, done: false },
    { name: 'LineParser',     detail: '45 items identified', visible: false, done: false },
    { name: 'CatalogMapper',  detail: 'codes pre-mapped',   visible: false, done: false },
];

const MAPPING_AGENTS: AgentVis[] = [
    { name: 'SIFFMapper',       detail: '45 items mapped',          visible: false, done: false },
    { name: 'ObsoleteDetector', detail: '3 obsolete SKUs found',    visible: false, done: false },
    { name: 'CatalogMatcher',   detail: '2 mismatches flagged',     visible: false, done: false },
];

const PRICE_AGENTS: AgentVis[] = [
    { name: 'PriceChecker',       detail: '41 items verified',       visible: false, done: false },
    { name: 'ContractMatcher',    detail: 'active contracts loaded', visible: false, done: false },
    { name: 'DiscrepancyAnalyzer', detail: '4 flags raised',         visible: false, done: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DuplerPdfProcessorProps {
    onNavigate: (page: string) => void;
}

export default function DuplerPdfProcessor({ onNavigate }: DuplerPdfProcessorProps) {
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

    // ── d1.1 State: OCR ──
    const [ocrPhase, setOcrPhase] = useState<OcrPhase>('idle');
    const ocrRef = useRef(ocrPhase);
    useEffect(() => { ocrRef.current = ocrPhase; }, [ocrPhase]);
    const [ocrAgents, setOcrAgents] = useState(OCR_AGENTS.map(a => ({ ...a })));
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrItemsRevealed, setOcrItemsRevealed] = useState(0);

    // ── d1.2 State: Mapping ──
    const [mapPhase, setMapPhase] = useState<MappingPhase>('idle');
    const [mapAgents, setMapAgents] = useState(MAPPING_AGENTS.map(a => ({ ...a })));
    const [mappingReviewed, setMappingReviewed] = useState<Record<number, 'accepted' | null>>({});

    // ── d1.3 State: Validation ──
    const [valPhase, setValPhase] = useState<ValidationPhase>('idle');
    const [valAgents, setValAgents] = useState(PRICE_AGENTS.map(a => ({ ...a })));
    const [discResolved, setDiscResolved] = useState<Record<string, 'accepted' | 'disputed' | null>>({});

    // ── d1.4 State: Export ──
    const [expPhase, setExpPhase] = useState<ExportPhase>('idle');
    const [approvalStep, setApprovalStep] = useState(0); // 0=none, 1=AI done, 2=Expert done
    const [genProgress, setGenProgress] = useState(0);
    const [exported, setExported] = useState(false);

    // ── Timing helpers ──
    const tp = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || DUPLER_STEP_TIMING['d1.1'];

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.1: Document Intake & OCR (System, auto)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.1') { setOcrPhase('idle'); return; }
        setOcrPhase('idle');
        setOcrAgents(OCR_AGENTS.map(a => ({ ...a })));
        setOcrProgress(0);
        setOcrItemsRevealed(0);
        const t = tp('d1.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setOcrPhase('notification')), t.notifDelay));
        timers.push(setTimeout(pauseAware(() => { if (ocrRef.current === 'notification') setOcrPhase('processing'); }), t.notifDelay + t.notifDuration));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    // Processing: stagger agents
    useEffect(() => {
        if (ocrPhase !== 'processing') return;
        setOcrAgents(OCR_AGENTS.map(a => ({ ...a })));
        setOcrProgress(0);
        const t = tp('d1.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setOcrProgress(100), 50));
        OCR_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setOcrAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setOcrAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = OCR_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setOcrPhase('breathing')), total));
        return () => timers.forEach(clearTimeout);
    }, [ocrPhase]);

    // Breathing → revealed
    useEffect(() => {
        if (ocrPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setOcrPhase('revealed')), tp('d1.1').breathing);
        return () => clearTimeout(t);
    }, [ocrPhase]);

    // Revealed: stagger items then → results
    useEffect(() => {
        if (ocrPhase !== 'revealed') return;
        setOcrItemsRevealed(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        const totalItems = Math.min(SIFF_ITEMS.length, 8); // show first 8 visually
        for (let i = 0; i < totalItems; i++) {
            timers.push(setTimeout(pauseAware(() => setOcrItemsRevealed(i + 1)), i * 120));
        }
        timers.push(setTimeout(pauseAware(() => setOcrPhase('results')), totalItems * 120 + 500));
        return () => timers.forEach(clearTimeout);
    }, [ocrPhase]);

    // Results: auto-advance
    useEffect(() => {
        if (ocrPhase !== 'results') return;
        const t = setTimeout(pauseAware(() => nextStep()), tp('d1.1').resultsDur);
        return () => clearTimeout(t);
    }, [ocrPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.2: Smart Normalization & SIFF Mapping (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.2') { setMapPhase('idle'); return; }
        setMapPhase('idle');
        setMapAgents(MAPPING_AGENTS.map(a => ({ ...a })));
        setMappingReviewed({});
        const t = tp('d1.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setMapPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    // Notification click → processing
    const handleMapStart = () => setMapPhase('processing');

    // Processing: stagger agents → revealed
    useEffect(() => {
        if (mapPhase !== 'processing') return;
        setMapAgents(MAPPING_AGENTS.map(a => ({ ...a })));
        const t = tp('d1.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        MAPPING_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setMapAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setMapAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = MAPPING_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setMapPhase('revealed')), total + t.breathing));
        return () => timers.forEach(clearTimeout);
    }, [mapPhase]);

    const exceptions = SIFF_ITEMS.filter(i => i.mappingStatus !== 'matched');
    const reviewedCount = Object.values(mappingReviewed).filter(v => v !== null).length;
    const allReviewed = reviewedCount >= exceptions.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.3: Price & Contract Validation (Expert, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.3') { setValPhase('idle'); return; }
        setValPhase('idle');
        setValAgents(PRICE_AGENTS.map(a => ({ ...a })));
        setDiscResolved({});
        const t = tp('d1.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setValPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleValStart = () => setValPhase('processing');

    useEffect(() => {
        if (valPhase !== 'processing') return;
        setValAgents(PRICE_AGENTS.map(a => ({ ...a })));
        const t = tp('d1.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        PRICE_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setValAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setValAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = PRICE_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setValPhase('revealed')), total + t.breathing));
        return () => timers.forEach(clearTimeout);
    }, [valPhase]);

    const resolvedCount = Object.values(discResolved).filter(v => v !== null).length;
    const allDiscResolved = resolvedCount >= PRICE_DISCREPANCIES.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.4: Approval, SIFF Generation & Export (Dealer, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.4') { setExpPhase('idle'); return; }
        setExpPhase('idle');
        setApprovalStep(0);
        setGenProgress(0);
        setExported(false);
        const t = tp('d1.4');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setExpPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleExpStart = () => {
        setExpPhase('approval-chain');
        // Auto-animate approval chain
        setTimeout(pauseAware(() => setApprovalStep(1)), 1500); // AI Compliance
        setTimeout(pauseAware(() => {
            setApprovalStep(2);
            // After approval → generating
            setTimeout(pauseAware(() => {
                setExpPhase('generating');
                setTimeout(() => setGenProgress(100), 50);
                setTimeout(pauseAware(() => setExpPhase('revealed')), 3000);
            }), 1000);
        }), 3500); // Expert
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

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d1.')) return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">
            {/* ── d1.1: Document Intake & OCR ── */}
            {stepId === 'd1.1' && (
                <>
                    {ocrPhase === 'notification' && renderNotification(
                        <DocumentTextIcon className="h-4 w-4" />,
                        'New PDF Received — Herman Miller Quote',
                        'OCRAgent: Incoming supplier quote detected — 12-page PDF with 45 line items. Ready for automated extraction.',
                        () => setOcrPhase('processing')
                    )}
                    {ocrPhase === 'processing' && renderAgentPipeline(ocrAgents, ocrProgress, 'OCR Extraction Pipeline — Processing 12 pages...')}
                    {ocrPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Extraction complete — structuring data...</span>
                        </div>
                    )}
                    {(ocrPhase === 'revealed' || ocrPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2">
                                    <AIAgentAvatar />
                                    <p className="text-xs text-green-800 dark:text-green-200">
                                        <span className="font-bold">OCRAgent:</span> Extraction complete — <span className="font-semibold">45 line items</span> identified with 99.2% accuracy. Ready for SIFF mapping.
                                    </p>
                                </div>
                            </div>
                            {/* Extracted items preview */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Extracted Line Items</span>
                                    <span className="text-[10px] text-muted-foreground">Showing {Math.min(ocrItemsRevealed, 8)} of 45 items</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {SIFF_ITEMS.slice(0, Math.min(ocrItemsRevealed, 8)).map(item => (
                                        <div key={item.line} className="px-4 py-2 flex items-center gap-4 text-[11px] animate-in fade-in slide-in-from-left-2 duration-300">
                                            <span className="text-muted-foreground w-6 text-right">#{item.line}</span>
                                            <span className="font-mono text-foreground w-28">{item.sku}</span>
                                            <span className="text-foreground flex-1 truncate">{item.description}</span>
                                            <span className="text-muted-foreground w-12 text-right">×{item.qty}</span>
                                            <span className="font-semibold text-foreground w-20 text-right">${item.unitPrice.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                {ocrPhase === 'results' && (
                                    <div className="bg-muted/30 px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
                                        + 37 more items extracted • Total: $187,450 • Auto-advancing to SIFF mapping...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.2: Smart Normalization & SIFF Mapping ── */}
            {stepId === 'd1.2' && (
                <>
                    {mapPhase === 'notification' && renderNotification(
                        <DocumentTextIcon className="h-4 w-4" />,
                        'SIFF Mapping Analysis Ready',
                        'SIFFMappingAgent: 45 items cross-referenced against SIFF catalog. 40 auto-mapped, 5 exceptions require expert review.',
                        handleMapStart
                    )}
                    {mapPhase === 'processing' && renderAgentPipeline(mapAgents, 100, 'SIFF Catalog Mapping — Cross-referencing 45 items...')}
                    {mapPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Summary bar */}
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-foreground font-semibold">{MATCHED_COUNT} Matched</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-foreground font-semibold">{OBSOLETE_COUNT} Obsolete</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-foreground font-semibold">{MISMATCH_COUNT} Mismatch</span>
                                </div>
                                <div className="ml-auto text-[10px] font-bold text-foreground">
                                    {reviewedCount}/{exceptions.length} Reviewed
                                </div>
                            </div>

                            {/* Exception items */}
                            <div className="space-y-3">
                                {exceptions.map(item => (
                                    <div key={item.line} className={`p-4 rounded-xl border-2 ${
                                        mappingReviewed[item.line] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' :
                                        item.mappingStatus === 'obsolete' ? 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5' :
                                        'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                                    } transition-all duration-300`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                        item.mappingStatus === 'obsolete' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                        {item.mappingStatus === 'obsolete' ? 'Obsolete SKU' : 'Description Mismatch'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{item.line}</span>
                                                    <ConfidenceScoreBadge score={item.confidenceScore} size="sm" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-2 text-[11px]">
                                                    <div>
                                                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider mb-0.5">PDF Original</span>
                                                        <span className="font-mono text-foreground">{item.sku}</span>
                                                        <span className="text-muted-foreground block">{item.description}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block text-[9px] uppercase tracking-wider mb-0.5">AI Suggested</span>
                                                        <span className="font-mono text-foreground">{item.substituteSku || item.siffCode}</span>
                                                        <span className="text-muted-foreground block">{item.substituteDesc || 'Catalog match available'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {mappingReviewed[item.line] ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">Accepted</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setMappingReviewed(prev => ({ ...prev, [item.line]: 'accepted' }))}
                                                        className="px-3 py-1.5 bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold rounded-lg transition-colors"
                                                    >
                                                        Accept AI Suggestion
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Approve button */}
                            <button
                                onClick={() => nextStep()}
                                disabled={!allReviewed}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                    allReviewed
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                            >
                                {allReviewed ? '✓ Approve Mapping — All Exceptions Reviewed' : `Review All Exceptions (${reviewedCount}/${exceptions.length})`}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.3: Price & Contract Validation ── */}
            {stepId === 'd1.3' && (
                <>
                    {valPhase === 'notification' && renderNotification(
                        <ExclamationTriangleIcon className="h-4 w-4" />,
                        'Price Validation — 4 Discrepancies Detected',
                        'PriceValidationAgent: Cross-checked 45 items against active contracts and manufacturer price lists. 4 flags totaling $2,140 in variance.',
                        handleValStart
                    )}
                    {valPhase === 'processing' && renderAgentPipeline(valAgents, 100, 'Price Validation Engine — Cross-checking contracts...')}
                    {valPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Summary */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">4 Discrepancies — $2,140 Total Variance</span>
                                </div>
                                <span className="text-[10px] font-bold text-foreground">{resolvedCount}/{PRICE_DISCREPANCIES.length} Resolved</span>
                            </div>

                            {/* Discrepancy cards */}
                            <div className="space-y-3">
                                {PRICE_DISCREPANCIES.map((disc, i) => (
                                    <div key={disc.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                        discResolved[disc.id] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' :
                                        'border-amber-300 dark:border-amber-500/30 bg-white dark:bg-zinc-900'
                                    }`} style={{ animationDelay: `${i * 150}ms` }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                        disc.type === 'outdated-price' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                                        disc.type === 'qty-mismatch' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                                                        'bg-red-500/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                        {disc.type === 'outdated-price' ? 'Price Increase' : disc.type === 'qty-mismatch' ? 'Qty Mismatch' : 'UOM Error'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{disc.lineRef} · {disc.sku}</span>
                                                </div>
                                                <p className="text-[11px] text-foreground font-medium mb-1">{disc.description}</p>
                                                {disc.type === 'outdated-price' && (
                                                    <div className="flex items-center gap-4 text-[11px] mt-1">
                                                        <span className="text-red-600 dark:text-red-400 line-through">${disc.poPrice}</span>
                                                        <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-green-600 dark:text-green-400 font-bold">${disc.contractPrice}</span>
                                                        <span className="text-amber-600 dark:text-amber-400 text-[10px]">{disc.deltaPercent}</span>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-muted-foreground mt-1.5 italic">AI: {disc.aiSuggestion}</p>
                                            </div>
                                            <div className="shrink-0">
                                                {discResolved[disc.id] ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                                                            {discResolved[disc.id] === 'accepted' ? 'AI Fix Applied' : 'Disputed'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1.5">
                                                        <button
                                                            onClick={() => setDiscResolved(prev => ({ ...prev, [disc.id]: 'accepted' }))}
                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded-lg flex items-center gap-1"
                                                        >
                                                            <CheckIcon className="h-3 w-3" /> Accept AI Fix
                                                        </button>
                                                        <button
                                                            onClick={() => setDiscResolved(prev => ({ ...prev, [disc.id]: 'disputed' }))}
                                                            className="px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-medium rounded-lg flex items-center gap-1"
                                                        >
                                                            <XMarkIcon className="h-3 w-3" /> Dispute
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Validate button */}
                            <button
                                onClick={() => nextStep()}
                                disabled={!allDiscResolved}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                    allDiscResolved
                                        ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                            >
                                {allDiscResolved ? '✓ Validate & Continue — All Discrepancies Resolved' : `Resolve All Discrepancies (${resolvedCount}/${PRICE_DISCREPANCIES.length})`}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.4: Approval, SIFF Generation & Export ── */}
            {stepId === 'd1.4' && (
                <>
                    {expPhase === 'notification' && renderNotification(
                        <ShieldCheckIcon className="h-4 w-4" />,
                        'Approval Chain — SIFF Export Ready',
                        'All items mapped and validated. 2-level approval chain required before SIFF generation and export to Core.',
                        handleExpStart
                    )}

                    {expPhase === 'approval-chain' && (
                        <div className="p-5 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheckIcon className="h-5 w-5 text-brand-500" />
                                <span className="text-sm font-bold text-foreground">Approval Chain</span>
                            </div>
                            {/* Approval steps */}
                            {[
                                { label: 'AI Compliance Agent', detail: 'Validating data integrity, pricing compliance, contract terms...', step: 1 },
                                { label: 'Expert — David Park', detail: 'Reviewing SIFF mapping accuracy and pricing decisions...', step: 2 },
                            ].map(ap => (
                                <div key={ap.step} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                                    approvalStep >= ap.step ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' :
                                    approvalStep === ap.step - 1 ? 'border-brand-300 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5' :
                                    'border-border bg-muted/30'
                                }`}>
                                    {approvalStep >= ap.step ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                    ) : approvalStep === ap.step - 1 ? (
                                        <ArrowPathIcon className="h-5 w-5 text-brand-500 animate-spin shrink-0" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-foreground">{ap.label}</span>
                                        <p className="text-[10px] text-muted-foreground">{ap.detail}</p>
                                    </div>
                                    {approvalStep >= ap.step && (
                                        <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase">Approved</span>
                                    )}
                                </div>
                            ))}
                            <div className="text-center text-[10px] text-muted-foreground mt-2">
                                {approvalStep}/{2} Approved
                            </div>
                        </div>
                    )}

                    {expPhase === 'generating' && (
                        <div className="p-5 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300 space-y-3">
                            <div className="flex items-center gap-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">Generating SIFF File...</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-brand-400 transition-all duration-[2500ms] ease-linear" style={{ width: `${genProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground">SIFFGeneratorAgent: Building compliant file — 45 items, $187,450 total...</p>
                        </div>
                    )}

                    {expPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* SIFF Summary */}
                            <div className="p-5 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-bold text-green-800 dark:text-green-200">SIFF File DUP-0412 Generated</span>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Line Items', value: '45' },
                                        { label: 'Total Value', value: '$187,450' },
                                        { label: 'Exceptions Resolved', value: '5' },
                                        { label: 'Errors', value: '0' },
                                    ].map(m => (
                                        <div key={m.label} className="text-center">
                                            <div className="text-lg font-bold text-foreground">{m.value}</div>
                                            <div className="text-[10px] text-muted-foreground">{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-500/20 text-[10px] text-green-700 dark:text-green-300">
                                    Approval: AI Compliance ✓ · Expert David Park ✓ · Audit trail: 9 decisions documented
                                </div>
                            </div>

                            {/* Export button */}
                            {!exported ? (
                                <button
                                    onClick={() => {
                                        setExported(true);
                                        setTimeout(pauseAware(() => nextStep()), 2000);
                                    }}
                                    className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                    Export to Core
                                </button>
                            ) : (
                                <div className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    SIFF DUP-0412 exported successfully — Core system synced
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── Empty state ── */}
            {stepId === 'd1.1' && ocrPhase === 'idle' && (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    Initializing Document Intake...
                </div>
            )}
        </div>
    );
}
