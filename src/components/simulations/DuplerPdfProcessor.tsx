// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 1: Vendor Data Extraction & Specification Building
// Steps: d1.1 (Upload & Extract), d1.2 (Mapping & Review), d1.3 (Validation),
//        d1.4 (Audit & PMX Gen), d1.5 (SC Review — DuplerScReview export)
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
    ArrowUpTrayIcon,
    CheckIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    PaperAirplaneIcon,
    LinkIcon,
    MagnifyingGlassIcon,
    MapIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';

// ─── Types ───────────────────────────────────────────────────────────────────

type UploadPhase = 'idle' | 'upload-zone' | 'extracting' | 'processing' | 'breathing' | 'revealed' | 'results';
type MappingPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type ValidationPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type AuditPhase = 'idle' | 'notification' | 'processing' | 'revealed' | 'converting' | 'preview';
type ScReviewPhase = 'idle' | 'notification' | 'sc-review' | 'generating' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TOTAL_ITEMS = 32;
const HNI_ITEMS = 24;
const NON_CET_ITEMS = 8;
const PROJECT_TOTAL = 95580;
const UPCHARGE_TOTAL = 1380;

interface PdfExtractedItem {
    line: number; sku: string; product: string; finish: string;
    options: string | null; qty: number; listPrice: number;
    overallConfidence: number;
}

const PDF_EXTRACTED_ITEMS: PdfExtractedItem[] = [
    { line: 1, sku: 'NAT-WW-3060', product: 'Waveworks Desk 60"', finish: 'White + Orange', options: 'Standing base, storage pedestal', qty: 8, listPrice: 2180, overallConfidence: 72 },
    { line: 2, sku: 'NAT-EC-4200', product: 'Exhibit Collab Table 48"', finish: 'White', options: 'Power hub', qty: 4, listPrice: 1240, overallConfidence: 98 },
    { line: 3, sku: 'NAT-SW-3100', product: 'Solve Wall Shelf 36"', finish: 'White', options: null, qty: 6, listPrice: 385, overallConfidence: 99 },
    { line: 4, sku: 'NAT-LT-6600', product: 'Lobby Lounge Table', finish: 'Walnut', options: null, qty: 3, listPrice: 890, overallConfidence: 97 },
    { line: 5, sku: 'NAT-TC-2025', product: 'Triumph II Conf Table', finish: 'White', options: 'Data ports', qty: 2, listPrice: 2100, overallConfidence: 98 },
    { line: 6, sku: 'NAT-DK-4200', product: 'Realize Desk 60"', finish: 'White + Gray', options: 'Standing base, stor...', qty: 4, listPrice: 1580, overallConfidence: 81 },
    { line: 7, sku: 'NAT-FL-2200', product: 'Filing Cabinet 4-Drawer', finish: 'White', options: null, qty: 6, listPrice: 425, overallConfidence: 97 },
    { line: 8, sku: 'NAT-BK-1200', product: 'Bookcase III 3-Shelf', finish: 'White', options: null, qty: 3, listPrice: 340, overallConfidence: 98 },
];

interface ExtractionFlag {
    id: string; itemLine: number; product: string; sku: string;
    field: string; extractedValue: string; issue: string; confidence: number;
    pdfContext: string;
}

const EXTRACTION_FLAGS: ExtractionFlag[] = [
    { id: 'ef1', itemLine: 1, product: 'Waveworks Desk 60"', sku: 'NAT-WW-3060', field: 'Quantity', extractedValue: '8', issue: 'PDF shows "8-10 units" — AI defaulted to 8', confidence: 72,
      pdfContext: 'NAT-WW-3060  Waveworks Desk 60"\nFinish: White + Orange Accent\nQty: 8-10 units*     $2,180.00/ea\n*Confirm final qty w/ designer' },
    { id: 'ef2', itemLine: 6, product: 'Realize Desk 60"', sku: 'NAT-DK-4200', field: 'Options', extractedValue: 'Standing base, stor...', issue: 'Option string truncated in PDF margin note', confidence: 81,
      pdfContext: 'NAT-DK-4200  Realize Desk 60"\nFinish: White + Gray\nOpts: Standing base, storage ped*\nQty: 4     $1,580.00/ea\n* see margin note pg 3' },
];

const FLAGGED_LINES = new Set(EXTRACTION_FLAGS.map(f => f.itemLine));

interface UpchargeItem {
    id: string; itemLine: number; product: string;
    finishOrOption: string; perUnit: number; qty: number; total: number;
}

const UPCHARGE_ITEMS: UpchargeItem[] = [
    { id: 'uc1', itemLine: 1, product: 'Involve Workstation 66"', finishOrOption: 'Graphite finish', perUnit: 85, qty: 12, total: 1020 },
    { id: 'uc2', itemLine: 2, product: 'Acuity Task Chair', finishOrOption: 'Grade 3 fabric upgrade', perUnit: 45, qty: 8, total: 360 },
];

interface CompassResult {
    id: string; itemLine: number; product: string; sku: string;
    specPrice: number; compassPrice: number; delta: number; deltaPercent: string;
    reason: string;
}

const COMPASS_RESULTS: CompassResult[] = [
    { id: 'cr1', itemLine: 1, product: 'Involve Workstation 66"', sku: 'AS-INV-6636', specPrice: 2450, compassPrice: 2525, delta: 75, deltaPercent: '+3.0%', reason: 'Q1 2026 price increase — effective Feb 1' },
    { id: 'cr2', itemLine: 2, product: 'Acuity Task Chair', sku: 'AS-ACU-MH4D', specPrice: 875, compassPrice: 895, delta: 20, deltaPercent: '+2.3%', reason: 'Material cost adjustment — effective Jan 15' },
];

interface DrawingAuditItem {
    id: string; product: string; sku: string;
    specQty: number; drawingQty: number; status: 'match' | 'discrepancy';
}

const DRAWING_AUDIT: DrawingAuditItem[] = [
    { id: 'da1', product: 'Waveworks Desk 60"', sku: 'NAT-WW-3060', specQty: 8, drawingQty: 10, status: 'discrepancy' },
];

// PMX preview items (representative sample — CET + non-CET)
const PMX_PREVIEW_ITEMS = [
    { line: 1, mfg: 'Allsteel', product: 'Involve Workstation 66"', qty: 12, listPrice: 2525, source: 'CET' as const },
    { line: 2, mfg: 'Allsteel', product: 'Acuity Task Chair', qty: 24, listPrice: 895, source: 'CET' as const },
    { line: 3, mfg: 'Allsteel', product: 'Stride Bench 60"', qty: 6, listPrice: 1890, source: 'CET' as const },
    { line: 4, mfg: 'Gunlock', product: 'Executive Credenza 72"', qty: 4, listPrice: 3200, source: 'CET' as const },
    { line: 5, mfg: 'Gunlock', product: 'Conference Table 96"', qty: 2, listPrice: 4500, source: 'CET' as const },
    { line: 10, mfg: 'National', product: 'Waveworks Desk 60"', qty: 10, listPrice: 2180, source: 'Vendor PDF' as const },
    { line: 11, mfg: 'National', product: 'Exhibit Collab Table 48"', qty: 4, listPrice: 1240, source: 'Vendor PDF' as const },
    { line: 12, mfg: 'National', product: 'Realize Desk 60"', qty: 4, listPrice: 1580, source: 'Vendor PDF' as const },
];

// ─── Agent Arrays ────────────────────────────────────────────────────────────

const EXTRACTION_AGENTS: AgentVis[] = [
    { name: 'PdfOcrAgent', detail: 'OCR scanning vendor PDF — NF-2026-0412', visible: false, done: false },
    { name: 'SemanticParser', detail: 'Parsing tables, footnotes, and margin notes', visible: false, done: false },
    { name: 'LineItemDetector', detail: 'Identifying 8 line items with pricing data', visible: false, done: false },
    { name: 'FieldClassifier', detail: 'Classifying SKU, finish, options, quantities', visible: false, done: false },
];

const MAPPING_AGENTS: AgentVis[] = [
    { name: 'ExtractionMapper', detail: 'Mapping extracted fields to SPEC/PMX model', visible: false, done: false },
    { name: 'FormatAdapter', detail: 'Adapting column structure for 8 National items', visible: false, done: false },
    { name: 'ConfidenceScorer', detail: 'Scoring field confidence — 6 high, 2 flagged', visible: false, done: false },
];

const VALIDATION_AGENTS: AgentVis[] = [
    { name: 'OptionValidator', detail: 'Checking option/finish combos against rules', visible: false, done: false },
    { name: 'UpchargeDetector', detail: '2 upcharges — $1,380 total impact', visible: false, done: false },
    { name: 'PriceVerifier', detail: 'Compass: 24 HNI | Source PDF: 8 non-CET', visible: false, done: false },
];

const AUDIT_AGENTS: AgentVis[] = [
    { name: 'DrawingAuditor', detail: 'Cross-referencing spec vs floor plan drawings', visible: false, done: false },
    { name: 'QuantityReconciler', detail: '31/32 match — 1 discrepancy flagged', visible: false, done: false },
    { name: 'SourceArchiver', detail: 'Auto-saving vendor PDF to project record', visible: false, done: false },
    { name: 'PmxGenerator', detail: 'Building PMX specification package', visible: false, done: false },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DuplerPdfProcessorProps {
    onNavigate: (page: string) => void;
}

export default function DuplerPdfProcessor({ onNavigate }: DuplerPdfProcessorProps) {
    const { currentStep, nextStep, prevStep, isPaused } = useDemo();
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

    // ── d1.1 State: Upload & Extract ──
    const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
    const [extractAgents, setExtractAgents] = useState(EXTRACTION_AGENTS.map(a => ({ ...a })));
    const [extractProgress, setExtractProgress] = useState(0);
    const [itemsRevealed, setItemsRevealed] = useState(0);
    const [scanProgress, setScanProgress] = useState(0);
    const [uploadTab, setUploadTab] = useState<'pdf' | 'url'>('url');

    // ── d1.2 State: Mapping & Confidence Review ──
    const [mapPhase, setMapPhase] = useState<MappingPhase>('idle');
    const [mapAgents, setMapAgents] = useState(MAPPING_AGENTS.map(a => ({ ...a })));
    const [flagsReviewed, setFlagsReviewed] = useState<Record<string, 'accepted' | 'edited' | null>>({});
    const [editingFlag, setEditingFlag] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // ── d1.3 State: Validation ──
    const [valPhase, setValPhase] = useState<ValidationPhase>('idle');
    const [valAgents, setValAgents] = useState(VALIDATION_AGENTS.map(a => ({ ...a })));
    const [upchargesAcked, setUpchargesAcked] = useState<Record<string, boolean>>({});
    const [compassResolved, setCompassResolved] = useState<Record<string, 'accepted' | 'kept' | null>>({});

    // ── d1.4 State: Audit & PMX Gen ──
    const [auditPhase, setAuditPhase] = useState<AuditPhase>('idle');
    const [auditAgents, setAuditAgents] = useState(AUDIT_AGENTS.map(a => ({ ...a })));
    const [discrepancyAcked, setDiscrepancyAcked] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);
    const [pmxSent, setPmxSent] = useState(false);
    const [pmxPreviewPage, setPmxPreviewPage] = useState(1);
    const [showSendPopover, setShowSendPopover] = useState(false);

    // ── Timing helpers ──
    const tp = (id: string): DuplerStepTiming => DUPLER_STEP_TIMING[id] || DUPLER_STEP_TIMING['d1.1'];

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.1: Vendor Data Upload & AI Extraction
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.1') { setUploadPhase('idle'); return; }
        setUploadPhase('idle');
        setUploadTab('url');
        setExtractAgents(EXTRACTION_AGENTS.map(a => ({ ...a })));
        setExtractProgress(0);
        setItemsRevealed(0);
        setScanProgress(0);
        const handler = () => setUploadPhase('upload-zone');
        window.addEventListener('dupler-vendor-upload', handler);
        return () => window.removeEventListener('dupler-vendor-upload', handler);
    }, [stepId]);

    // Upload zone: show URL tab first → switch to PDF → then advance to extracting
    useEffect(() => {
        if (uploadPhase !== 'upload-zone') return;
        const timers: ReturnType<typeof setTimeout>[] = [];
        // Start on URL tab (already default), show it for 2s
        timers.push(setTimeout(pauseAware(() => setUploadTab('pdf')), 2000));
        // After switching to PDF, wait 2s more then advance
        timers.push(setTimeout(pauseAware(() => setUploadPhase('extracting')), 4000));
        return () => timers.forEach(clearTimeout);
    }, [uploadPhase]);

    // Extracting: scan progress ~2s → processing
    useEffect(() => {
        if (uploadPhase !== 'extracting') return;
        setScanProgress(0);
        const duration = 2000;
        const steps = 20;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setScanProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setUploadPhase('processing')), duration + 600));
        return () => timers.forEach(clearTimeout);
    }, [uploadPhase]);

    // Processing: stagger extraction agents
    useEffect(() => {
        if (uploadPhase !== 'processing') return;
        setExtractAgents(EXTRACTION_AGENTS.map(a => ({ ...a })));
        setExtractProgress(0);
        const t = tp('d1.1');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(() => setExtractProgress(100), 50));
        EXTRACTION_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setExtractAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setExtractAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = EXTRACTION_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setUploadPhase('breathing')), total));
        return () => timers.forEach(clearTimeout);
    }, [uploadPhase]);

    // Breathing → revealed
    useEffect(() => {
        if (uploadPhase !== 'breathing') return;
        const t = setTimeout(pauseAware(() => setUploadPhase('revealed')), tp('d1.1').breathing);
        return () => clearTimeout(t);
    }, [uploadPhase]);

    // Revealed: stagger items → results
    useEffect(() => {
        if (uploadPhase !== 'revealed') return;
        setItemsRevealed(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 0; i < PDF_EXTRACTED_ITEMS.length; i++) {
            timers.push(setTimeout(pauseAware(() => setItemsRevealed(i + 1)), i * 120));
        }
        timers.push(setTimeout(pauseAware(() => setUploadPhase('results')), PDF_EXTRACTED_ITEMS.length * 120 + 500));
        return () => timers.forEach(clearTimeout);
    }, [uploadPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.2: AI Mapping & Confidence Review
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.2') { setMapPhase('idle'); return; }
        setMapPhase('idle');
        setMapAgents(MAPPING_AGENTS.map(a => ({ ...a })));
        setFlagsReviewed({});
        setEditingFlag(null);
        const t = tp('d1.2');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setMapPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleMapStart = () => setMapPhase('processing');

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

    const flagsReviewedCount = Object.values(flagsReviewed).filter(v => v !== null).length;
    const allFlagsReviewed = flagsReviewedCount >= EXTRACTION_FLAGS.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.3: Validation — Options, Upcharges & Pricing
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.3') { setValPhase('idle'); return; }
        setValPhase('idle');
        setValAgents(VALIDATION_AGENTS.map(a => ({ ...a })));
        setUpchargesAcked({});
        setCompassResolved({});
        const t = tp('d1.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setValPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleValStart = () => setValPhase('processing');

    useEffect(() => {
        if (valPhase !== 'processing') return;
        setValAgents(VALIDATION_AGENTS.map(a => ({ ...a })));
        const t = tp('d1.3');
        const timers: ReturnType<typeof setTimeout>[] = [];
        VALIDATION_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setValAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setValAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = VALIDATION_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setValPhase('revealed')), total + t.breathing));
        return () => timers.forEach(clearTimeout);
    }, [valPhase]);

    const upchargesAckedCount = Object.values(upchargesAcked).filter(Boolean).length;
    const compassResolvedCount = Object.values(compassResolved).filter(v => v !== null).length;
    const allValResolved = upchargesAckedCount >= UPCHARGE_ITEMS.length && compassResolvedCount >= COMPASS_RESULTS.length;

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.4: Audit vs Drawings & PMX Generation
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.4') { setAuditPhase('idle'); return; }
        setAuditPhase('idle');
        setAuditAgents(AUDIT_AGENTS.map(a => ({ ...a })));
        setDiscrepancyAcked(false);
        setConvertProgress(0);
        setPmxSent(false);
        setShowSendPopover(false);
        setPmxPreviewPage(1);
        const t = tp('d1.4');
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setAuditPhase('notification')), t.notifDelay));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleAuditStart = () => setAuditPhase('processing');

    useEffect(() => {
        if (auditPhase !== 'processing') return;
        setAuditAgents(AUDIT_AGENTS.map(a => ({ ...a })));
        const t = tp('d1.4');
        const timers: ReturnType<typeof setTimeout>[] = [];
        AUDIT_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(pauseAware(() => setAuditAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a))), i * t.agentStagger));
            timers.push(setTimeout(pauseAware(() => setAuditAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a))), i * t.agentStagger + t.agentDone));
        });
        const total = AUDIT_AGENTS.length * t.agentStagger + t.agentDone;
        timers.push(setTimeout(pauseAware(() => setAuditPhase('revealed')), total + t.breathing));
        return () => timers.forEach(clearTimeout);
    }, [auditPhase]);

    // Converting phase
    useEffect(() => {
        if (auditPhase !== 'converting') return;
        setConvertProgress(0);
        const duration = 2500;
        const steps = 25;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setConvertProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setAuditPhase('preview')), duration + 800));
        return () => timers.forEach(clearTimeout);
    }, [auditPhase]);

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

    const SourceBadge = ({ label, color = 'teal' }: { label: string; color?: 'teal' | 'amber' | 'green' | 'purple' | 'blue' }) => {
        const colors = {
            teal:   'bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
            amber:  'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            green:  'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
            purple: 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
            blue:   'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
        };
        return <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${colors[color]}`}>{label}</span>;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (!stepId.startsWith('d1.') || stepId === 'd1.5') return null;

    return (
        <div className="p-6 space-y-4 max-w-5xl mx-auto">

            {/* ── d1.1: Vendor Data Upload & AI Extraction ── */}
            {stepId === 'd1.1' && (
                <>
                    {/* Upload zone — tabs: PDF upload / URL paste */}
                    {uploadPhase === 'upload-zone' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                            <div className="rounded-xl bg-card border-2 border-dashed border-amber-300 dark:border-amber-500/40 overflow-hidden">
                                {/* Tab bar */}
                                <div className="flex border-b border-border">
                                    <button onClick={() => setUploadTab('pdf')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold transition-colors ${
                                            uploadTab === 'pdf'
                                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-b-2 border-amber-500'
                                                : 'text-muted-foreground hover:bg-muted/30'
                                        }`}>
                                        <DocumentTextIcon className="h-3.5 w-3.5" />
                                        Upload PDF
                                        <SourceBadge label="VENDOR PDF" color="amber" />
                                    </button>
                                    <button onClick={() => setUploadTab('url')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold transition-colors ${
                                            uploadTab === 'url'
                                                ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-b-2 border-purple-500'
                                                : 'text-muted-foreground hover:bg-muted/30'
                                        }`}>
                                        <LinkIcon className="h-3.5 w-3.5" />
                                        Paste URL
                                        <SourceBadge label="MFR WEBSITE" color="purple" />
                                    </button>
                                </div>

                                <div className="p-6">
                                    {uploadTab === 'pdf' ? (
                                        <>
                                            <div className="flex flex-col items-center justify-center py-4 gap-3">
                                                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-500/10">
                                                    <ArrowUpTrayIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-foreground">Upload Vendor PDF</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Drag & drop a vendor quote, price list, or catalog PDF</p>
                                                </div>
                                            </div>
                                            {/* Mock file card */}
                                            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10">
                                                    <DocumentTextIcon className="h-6 w-6 text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground">NF-2026-0412.pdf</p>
                                                    <p className="text-[10px] text-muted-foreground">National Furniture — Vendor Quote</p>
                                                </div>
                                                <SourceBadge label="VENDOR PDF" color="amber" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-col items-center justify-center py-4 gap-3">
                                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-500/10">
                                                    <LinkIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-foreground">Paste Manufacturer URL</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Amazon, vendor portals, or manufacturer catalog pages</p>
                                                </div>
                                            </div>
                                            {/* Mock URL input */}
                                            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-500/5 rounded-lg border border-purple-200 dark:border-purple-500/20 mt-2">
                                                <LinkIcon className="h-4 w-4 text-purple-400 shrink-0" />
                                                <span className="text-xs text-muted-foreground font-mono flex-1">https://nationalfurniture.com/catalog/waveworks...</span>
                                                <SourceBadge label="MFR WEBSITE" color="purple" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Extracting — AI reading document */}
                    {uploadPhase === 'extracting' && (
                        <div className="animate-in fade-in duration-300 space-y-4">
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10">
                                        <DocumentTextIcon className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground">NF-2026-0412.pdf</p>
                                        <p className="text-[10px] text-muted-foreground">National Furniture — 8 items detected</p>
                                    </div>
                                    <SourceBadge label="SCANNING" color="amber" />
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-amber-400 transition-all duration-200 ease-linear" style={{ width: `${scanProgress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    {scanProgress < 100 ? 'AI reading vendor document — OCR + semantic parsing...' : 'Extraction complete — starting field analysis...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Processing — agent pipeline */}
                    {uploadPhase === 'processing' && renderAgentPipeline(extractAgents, extractProgress, 'Vendor Data Extraction — Analyzing NF-2026-0412.pdf...')}

                    {/* Breathing */}
                    {uploadPhase === 'breathing' && (
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground">Structuring extracted data...</span>
                        </div>
                    )}

                    {/* Revealed + Results — extraction results table */}
                    {(uploadPhase === 'revealed' || uploadPhase === 'results') && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Success summary */}
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-start gap-2 mb-3">
                                    <AIAgentAvatar />
                                    <div className="flex-1">
                                        <p className="text-xs text-green-800 dark:text-green-200">
                                            <span className="font-bold">PdfOcrAgent:</span> 54 items extracted from vendor quote NF-2026-0412. Part numbers, quantities, finishes, options, and list prices identified.
                                        </p>
                                    </div>
                                    <SourceBadge label="VENDOR PDF" color="amber" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="flex items-center gap-1 text-[9px] text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCircleIcon className="h-3 w-3" />54 Items Extracted
                                    </span>
                                    <span className="flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                                        <ExclamationTriangleIcon className="h-3 w-3" />2 Low-Confidence Fields
                                    </span>
                                </div>
                            </div>

                            {/* Extracted items table */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DocumentTextIcon className="h-4 w-4 text-amber-500" />
                                        <span className="text-xs font-bold text-foreground">Extracted Items — National Furniture Quote #NF-2026-0412</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground">54 items</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-[10px]">
                                        <thead>
                                            <tr className="text-muted-foreground border-b border-border bg-muted/30">
                                                <th className="text-left py-1.5 px-3 font-medium">#</th>
                                                <th className="text-left py-1.5 px-2 font-medium">SKU</th>
                                                <th className="text-left py-1.5 px-2 font-medium">Product</th>
                                                <th className="text-left py-1.5 px-2 font-medium">Finish</th>
                                                <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                                                <th className="text-right py-1.5 px-2 font-medium">List $</th>
                                                <th className="text-center py-1.5 px-2 font-medium">Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {PDF_EXTRACTED_ITEMS.map((item, idx) => (
                                                <tr key={item.line} className={`border-b border-border/50 ${uploadPhase === 'revealed' && idx >= itemsRevealed ? 'opacity-0' : 'animate-in fade-in slide-in-from-left-2 duration-300'} ${FLAGGED_LINES.has(item.line) ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}`}>
                                                    <td className="py-1.5 px-3 text-muted-foreground">{item.line}</td>
                                                    <td className="py-1.5 px-2 font-mono text-foreground">{item.sku}</td>
                                                    <td className="py-1.5 px-2 text-foreground">{item.product}</td>
                                                    <td className="py-1.5 px-2">
                                                        <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                                            item.finish.includes('Orange') ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400' :
                                                            item.finish.includes('Walnut') ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400' :
                                                            item.finish.includes('Gray') ? 'bg-zinc-200 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400' :
                                                            'bg-zinc-100 dark:bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                                                        }`}>{item.finish}</span>
                                                    </td>
                                                    <td className="py-1.5 px-2 text-right text-foreground">{item.qty}</td>
                                                    <td className="py-1.5 px-2 text-right font-medium text-foreground">${item.listPrice.toLocaleString()}</td>
                                                    <td className="py-1.5 px-2 text-center"><ConfidenceScoreBadge score={item.overallConfidence} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination — simulating 50+ items */}
                                <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">Showing <span className="font-semibold text-foreground">1–8</span> of <span className="font-semibold text-foreground">54</span> extracted items</span>
                                    <div className="flex items-center gap-1">
                                        <button disabled className="w-7 h-7 rounded-lg bg-brand-400 text-zinc-900 text-[10px] font-bold">1</button>
                                        <button className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-semibold border border-border">2</button>
                                        <button className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-semibold border border-border">3</button>
                                        <span className="text-[10px] text-muted-foreground px-1">...</span>
                                        <button className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-semibold border border-border">7</button>
                                        <button className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-semibold border border-border flex items-center justify-center">
                                            <ChevronRightIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {uploadPhase === 'results' && (
                                <button onClick={() => nextStep()} className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                                    Continue to Mapping & Review
                                    <ArrowRightIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── d1.2: AI Mapping & Confidence Review ── */}
            {stepId === 'd1.2' && (
                <>
                    {mapPhase === 'notification' && renderNotification(
                        <MapIcon className="h-4 w-4" />,
                        'Mapping Complete — 2 Items Need Review',
                        `ExtractionMapper: 8 items mapped to SPEC/PMX format. ConfidenceScorer: 6 auto-mapped at 97%+ confidence. 2 items flagged for designer review — quantity ambiguity and truncated option string.`,
                        handleMapStart
                    )}
                    {mapPhase === 'processing' && renderAgentPipeline(mapAgents, 100, 'AI Mapping Engine — Structuring extracted data...')}
                    {mapPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Summary bar */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-[10px] font-bold text-foreground">6 Auto-Mapped (97%+)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-foreground">2 Flagged for Review</span>
                                </div>
                                <div className="ml-auto text-[10px] text-muted-foreground">
                                    {flagsReviewedCount}/{EXTRACTION_FLAGS.length} Reviewed
                                </div>
                            </div>

                            {/* Auto-mapped items (collapsed) */}
                            <div className="p-3 rounded-xl bg-green-50/50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                    <span className="text-xs font-bold text-green-700 dark:text-green-300">6 items auto-mapped at 97%+ confidence</span>
                                    <SourceBadge label="AI MAPPED" color="green" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                                    {PDF_EXTRACTED_ITEMS.filter(i => !FLAGGED_LINES.has(i.line)).map(item => (
                                        <div key={item.line} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                                            <CheckIcon className="h-2.5 w-2.5 text-green-400 shrink-0" />
                                            <span className="truncate">{item.product}</span>
                                            <ConfidenceScoreBadge score={item.overallConfidence} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Flagged items — split-view: PDF source vs AI extraction */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Flagged Items — Designer Review Required</span>
                                    <SourceBadge label="LOW CONFIDENCE" color="amber" />
                                </div>
                                <div className="space-y-3">
                                    {EXTRACTION_FLAGS.map(flag => (
                                        <div key={flag.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                            flagsReviewed[flag.id] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">REVIEW</span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{flag.itemLine}</span>
                                                    <ConfidenceScoreBadge score={flag.confidence} />
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-foreground mb-1">{flag.product} <span className="font-mono text-muted-foreground text-[10px]">{flag.sku}</span></p>
                                            <p className="text-[10px] text-amber-700 dark:text-amber-400 mb-3">{flag.issue}</p>

                                            {/* Split-view: PDF excerpt vs AI extraction */}
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-border">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <DocumentTextIcon className="h-3.5 w-3.5 text-amber-500" />
                                                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">SOURCE PDF</span>
                                                    </div>
                                                    <div className="font-mono text-[9px] text-muted-foreground leading-relaxed whitespace-pre-wrap bg-white dark:bg-zinc-900 p-2 rounded border border-border">
                                                        {flag.pdfContext}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-card border border-border">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <MapIcon className="h-3.5 w-3.5 text-indigo-500" />
                                                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">AI EXTRACTED</span>
                                                    </div>
                                                    <div className="space-y-1 text-[10px]">
                                                        <div><span className="text-muted-foreground">Field:</span> <span className="font-bold text-foreground">{flag.field}</span></div>
                                                        <div><span className="text-muted-foreground">Value:</span> <span className="font-bold text-amber-600 dark:text-amber-400">{flag.extractedValue}</span></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {!flagsReviewed[flag.id] ? (
                                                editingFlag === flag.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder={flag.extractedValue}
                                                            className="flex-1 px-2 py-1.5 text-[10px] rounded border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-brand-400" />
                                                        <button onClick={() => { setFlagsReviewed(p => ({ ...p, [flag.id]: 'edited' })); setEditingFlag(null); }}
                                                            className="px-2 py-1.5 rounded bg-brand-400 text-zinc-900 text-[10px] font-bold"><CheckIcon className="h-3 w-3" /></button>
                                                        <button onClick={() => setEditingFlag(null)}
                                                            className="px-2 py-1.5 rounded border border-border text-[10px]"><XMarkIcon className="h-3 w-3" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setFlagsReviewed(p => ({ ...p, [flag.id]: 'accepted' }))}
                                                            className="px-3 py-1.5 rounded-lg bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold transition-colors">Accept AI Value</button>
                                                        <button onClick={() => { setEditingFlag(flag.id); setEditValue(''); }}
                                                            className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[10px] font-medium transition-colors flex items-center gap-1">
                                                            <PencilSquareIcon className="h-3 w-3" /> Edit
                                                        </button>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span className="font-bold">{flagsReviewed[flag.id] === 'accepted' ? 'AI Value Confirmed' : 'Manually Corrected'}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <button onClick={() => nextStep()} disabled={!allFlagsReviewed}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                    allFlagsReviewed ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}>
                                <ShieldCheckIcon className="h-4 w-4" />
                                {allFlagsReviewed ? 'Approve Mapping — Continue to Validation' : `Review flagged items (${flagsReviewedCount}/${EXTRACTION_FLAGS.length})`}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.3: Validation — Options, Upcharges & Pricing ── */}
            {stepId === 'd1.3' && (
                <>
                    {valPhase === 'notification' && renderNotification(
                        <ExclamationTriangleIcon className="h-4 w-4" />,
                        'Validation Complete — Upcharges & Price Discrepancies',
                        `UpchargeDetector: ${UPCHARGE_ITEMS.length} finish/option selections trigger upcharges ($${UPCHARGE_TOTAL.toLocaleString()}). PriceVerifier: Compass verified ${HNI_ITEMS} HNI items (2 updates). Source PDF verified ${NON_CET_ITEMS} non-CET items.`,
                        handleValStart
                    )}
                    {valPhase === 'processing' && renderAgentPipeline(valAgents, 100, 'Validation Engine — Options, upcharges & pricing...')}
                    {valPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Section A: Upcharge Review */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Upcharge Review — Finish & Option Impact</span>
                                    <SourceBadge label="CATALOG RULES" color="purple" />
                                </div>
                                <div className="space-y-3">
                                    {UPCHARGE_ITEMS.map(uc => (
                                        <div key={uc.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                            upchargesAcked[uc.id] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-purple-300 dark:border-purple-500/30 bg-purple-50/50 dark:bg-purple-500/5'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-400">UPCHARGE</span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{uc.itemLine}</span>
                                                </div>
                                                <span className="text-sm font-bold text-foreground">+${uc.total.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs font-bold text-foreground mb-1">{uc.product}</p>
                                            <p className="text-[10px] text-muted-foreground mb-3">
                                                {uc.finishOrOption} = <span className="font-bold text-purple-600 dark:text-purple-400">${uc.perUnit}/unit</span> × {uc.qty} units = <span className="font-bold">${uc.total.toLocaleString()}</span>
                                            </p>
                                            {!upchargesAcked[uc.id] ? (
                                                <button onClick={() => setUpchargesAcked(p => ({ ...p, [uc.id]: true }))}
                                                    className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-bold transition-colors flex items-center gap-1">
                                                    <CheckIcon className="h-3 w-3" /> Acknowledge Upcharge
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400">
                                                    <CheckCircleIcon className="h-4 w-4" /><span className="font-bold">Upcharge Captured</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 text-center mt-2">
                                    <p className="text-[10px] font-bold text-purple-800 dark:text-purple-200">Total upcharges: ${UPCHARGE_TOTAL.toLocaleString()} — captured for pricing handoff</p>
                                </div>
                            </div>

                            {/* Section B: Price Verification — HNI (Compass) */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">Compass Price Verification — HNI Brands (Allsteel, Gunlock)</span>
                                    <SourceBadge label="COMPASS VERIFIED" color="teal" />
                                </div>

                                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-500/5 border border-teal-200 dark:border-teal-500/20 mb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4 text-teal-500" />
                                            <span className="text-xs font-bold text-teal-800 dark:text-teal-200">22 of {HNI_ITEMS} HNI items verified via Compass</span>
                                        </div>
                                        <span className="text-[10px] text-teal-600 dark:text-teal-400">{compassResolvedCount}/{COMPASS_RESULTS.length} updates resolved</span>
                                    </div>
                                    <p className="text-[10px] text-teal-700 dark:text-teal-300 mt-1">Compass is HNI's pricing portal — used exclusively for Allsteel & Gunlock</p>
                                </div>

                                <div className="space-y-3">
                                    {COMPASS_RESULTS.map(cr => (
                                        <div key={cr.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                            compassResolved[cr.id] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-teal-300 dark:border-teal-500/30 bg-card'
                                        }`}>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-700 dark:text-teal-400">PRICE UPDATE</span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{cr.itemLine}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{cr.deltaPercent}</span>
                                            </div>
                                            <p className="text-xs font-bold text-foreground mb-1">{cr.product} <span className="font-mono text-muted-foreground text-[10px]">{cr.sku}</span></p>
                                            <div className="flex items-center gap-3 text-[10px] mb-2">
                                                <span className="text-muted-foreground">SPEC: <span className="line-through">${cr.specPrice.toLocaleString()}</span></span>
                                                <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-bold text-teal-600 dark:text-teal-400">Compass: ${cr.compassPrice.toLocaleString()}</span>
                                                <span className="text-muted-foreground">(+${cr.delta})</span>
                                            </div>
                                            <p className="text-[10px] italic text-muted-foreground mb-3">{cr.reason}</p>
                                            {!compassResolved[cr.id] ? (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setCompassResolved(p => ({ ...p, [cr.id]: 'accepted' }))}
                                                        className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold transition-colors">Accept Compass Price</button>
                                                    <button onClick={() => setCompassResolved(p => ({ ...p, [cr.id]: 'kept' }))}
                                                        className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[10px] font-medium transition-colors">Keep SPEC Price</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400">
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span className="font-bold">{compassResolved[cr.id] === 'accepted' ? 'Compass Price Applied' : 'SPEC Price Kept'}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section C: Non-CET Verification (auto-verified, no interaction needed) */}
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircleIcon className="h-4 w-4 text-amber-500" />
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">{NON_CET_ITEMS}/{NON_CET_ITEMS} National items verified against source PDF</span>
                                    <SourceBadge label="SOURCE PDF VERIFIED" color="amber" />
                                </div>
                                <p className="text-[10px] text-amber-700 dark:text-amber-300">
                                    Prices cross-referenced with vendor quote NF-2026-0412. All {NON_CET_ITEMS} items match — no discrepancies.
                                </p>
                            </div>

                            {/* Routed to SC note */}
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/10 shrink-0 mt-0.5">
                                    <ArrowRightIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] font-bold text-blue-800 dark:text-blue-200">Next: Routed to Sales Coordinator</span>
                                        <SourceBadge label="DESIGNER → SC" color="blue" />
                                    </div>
                                    <p className="text-[10px] text-blue-700 dark:text-blue-300">
                                        Validated items will be packaged into PMX and sent to the Sales Coordinator for discount application and SIF generation.
                                    </p>
                                </div>
                            </div>

                            {/* CTA */}
                            <button onClick={() => nextStep()} disabled={!allValResolved}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                    allValResolved ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}>
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                {allValResolved ? 'Continue to Drawing Audit' : `Resolve all items (${upchargesAckedCount + compassResolvedCount}/${UPCHARGE_ITEMS.length + COMPASS_RESULTS.length})`}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.4: Audit vs Drawings & PMX Generation ── */}
            {stepId === 'd1.4' && (
                <>
                    {auditPhase === 'notification' && renderNotification(
                        <MagnifyingGlassIcon className="h-4 w-4" />,
                        'Audit Complete — 1 Quantity Discrepancy',
                        `DrawingAuditor: Cross-referenced ${TOTAL_ITEMS} spec items against floor plan drawings. 31/32 match. 1 discrepancy: Waveworks Desk (spec: 8, drawing: 10). SourceArchiver: Vendor PDF auto-saved to project record.`,
                        handleAuditStart
                    )}
                    {auditPhase === 'processing' && renderAgentPipeline(auditAgents, 100, 'Drawing Audit & Source Archiving — Verifying quantities...')}
                    {auditPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Section A: Audit vs Drawings */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-foreground uppercase">Audit vs Drawings — Quantity Verification</span>
                                    <SourceBadge label="DRAWING VERIFIED" color="green" />
                                </div>

                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 mb-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                        <span className="text-xs font-bold text-green-800 dark:text-green-200">31 of {TOTAL_ITEMS} items match drawing quantities</span>
                                    </div>
                                </div>

                                {/* Discrepancy card */}
                                {DRAWING_AUDIT.filter(d => d.status === 'discrepancy').map(d => (
                                    <div key={d.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                        discrepancyAcked ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-red-300 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5'
                                    }`}>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-700 dark:text-red-400">DISCREPANCY</span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-foreground mb-1">{d.product} <span className="font-mono text-muted-foreground text-[10px]">{d.sku}</span></p>
                                        <div className="grid grid-cols-2 gap-3 text-[10px] mb-3 p-2 rounded-lg bg-card border border-border">
                                            <div><span className="text-muted-foreground">Spec Quantity:</span> <span className="font-bold text-red-600 dark:text-red-400">{d.specQty}</span></div>
                                            <div><span className="text-muted-foreground">Drawing Shows:</span> <span className="font-bold text-green-600 dark:text-green-400">{d.drawingQty}</span></div>
                                        </div>
                                        {!discrepancyAcked ? (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setDiscrepancyAcked(true)}
                                                    className="px-3 py-1.5 rounded-lg bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold transition-colors">Update to Drawing Qty ({d.drawingQty})</button>
                                                <button onClick={() => setDiscrepancyAcked(true)}
                                                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 text-foreground text-[10px] font-medium transition-colors">Keep Spec Qty ({d.specQty})</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400">
                                                <CheckCircleIcon className="h-4 w-4" /><span className="font-bold">Discrepancy Resolved</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Section B: Source Traceability */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-foreground uppercase">Source Traceability — Auto-Archived</span>
                                    <SourceBadge label="SOURCE ARCHIVED" color="teal" />
                                </div>
                                <div className="rounded-xl border border-border overflow-hidden">
                                    <div className="divide-y divide-border">
                                        <div className="flex items-center gap-3 p-3">
                                            <DocumentTextIcon className="h-5 w-5 text-amber-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-foreground">NF-2026-0412.pdf</p>
                                                <p className="text-[10px] text-muted-foreground">National Furniture vendor quote — linked to lines 10-17</p>
                                            </div>
                                            <SourceBadge label="VENDOR PDF" color="amber" />
                                            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center gap-3 p-3">
                                            <DocumentTextIcon className="h-5 w-5 text-teal-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-bold text-foreground">MercyHealth_Phase2.sif</p>
                                                <p className="text-[10px] text-muted-foreground">CET export by Alex Rivera — linked to lines 1-9</p>
                                            </div>
                                            <SourceBadge label="CET EXPORT" color="teal" />
                                            <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CTA: Generate PMX */}
                            <button onClick={() => { if (discrepancyAcked) setAuditPhase('converting'); }} disabled={!discrepancyAcked}
                                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                    discrepancyAcked ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}>
                                <DocumentTextIcon className="h-4 w-4" />
                                {discrepancyAcked ? 'Generate PMX — Validated Specification' : 'Resolve discrepancy to continue'}
                            </button>
                        </div>
                    )}

                    {/* Converting phase */}
                    {auditPhase === 'converting' && (
                        <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300 space-y-3">
                            <div className="flex items-center gap-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">Generating Validated PMX...</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-brand-400 transition-all duration-200 ease-linear" style={{ width: `${convertProgress}%` }} />
                            </div>
                            <div className="space-y-1 text-[10px]">
                                {convertProgress > 15 && <p className="text-muted-foreground animate-in fade-in duration-200">PmxGenerator: building specification package...</p>}
                                {convertProgress > 40 && <p className="text-muted-foreground animate-in fade-in duration-200">SourceArchiver: linking vendor sources to line items...</p>}
                                {convertProgress > 65 && <p className="text-muted-foreground animate-in fade-in duration-200">QuantityReconciler: applying drawing audit corrections...</p>}
                                {convertProgress > 85 && <p className="text-muted-foreground animate-in fade-in duration-200">PmxGenerator: PMX-MH-0412 — file ready</p>}
                            </div>
                        </div>
                    )}

                    {/* Preview phase — PMX document + Send to SC */}
                    {auditPhase === 'preview' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            <div className="rounded-xl border-2 border-border shadow-lg overflow-hidden bg-card">
                                <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <DocumentTextIcon className="h-5 w-5 text-teal-500" />
                                        <div>
                                            <span className="text-sm font-bold text-foreground">PMX Specification Package — PMX-MH-0412</span>
                                            <p className="text-[10px] text-muted-foreground">Mercy Health Phase 2 — March 24, 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SourceBadge label="DRAWING VERIFIED" color="green" />
                                        <SourceBadge label="SOURCE ARCHIVED" color="teal" />
                                        <span className="text-[9px] px-2.5 py-1 rounded-full bg-green-500 text-white font-bold">VALIDATED</span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-3 gap-x-8 gap-y-1 text-[10px]">
                                        <div className="flex justify-between"><span className="text-muted-foreground">PMX ID:</span><span className="font-mono font-bold text-foreground">PMX-MH-0412</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Manufacturers:</span><span className="text-foreground">Allsteel, Gunlock, National</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Line Items:</span><span className="font-bold text-foreground">{TOTAL_ITEMS}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Designer:</span><span className="text-foreground">Alex Rivera</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Project:</span><span className="text-foreground">Mercy Health Phase 2</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-bold text-foreground">${PROJECT_TOTAL.toLocaleString()}</span></div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { n: HNI_ITEMS, label: 'Compass Verified', color: 'text-teal-600 dark:text-teal-400' },
                                            { n: NON_CET_ITEMS, label: 'PDF Extracted', color: 'text-amber-600 dark:text-amber-400' },
                                            { n: `$${UPCHARGE_TOTAL.toLocaleString()}`, label: 'Upcharges', color: 'text-purple-600 dark:text-purple-400' },
                                            { n: '31/32', label: 'Drawing Match', color: 'text-green-600 dark:text-green-400' },
                                        ].map(s => (
                                            <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border">
                                                <div className={`text-base font-bold ${s.color}`}>{s.n}</div>
                                                <div className="text-[9px] text-muted-foreground">{s.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Items table with source badges */}
                                    <div className="border-t border-border pt-3">
                                        <table className="w-full text-[10px]">
                                            <thead>
                                                <tr className="text-muted-foreground border-b border-border">
                                                    <th className="text-left py-1 font-medium">#</th>
                                                    <th className="text-left py-1 font-medium">Mfg</th>
                                                    <th className="text-left py-1 font-medium">Product</th>
                                                    <th className="text-right py-1 font-medium">Qty</th>
                                                    <th className="text-right py-1 font-medium">List $</th>
                                                    <th className="text-center py-1 font-medium">Source</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {PMX_PREVIEW_ITEMS.slice((pmxPreviewPage - 1) * 5, pmxPreviewPage * 5).map(item => (
                                                    <tr key={item.line} className="border-b border-border/50">
                                                        <td className="py-1 text-muted-foreground">{item.line}</td>
                                                        <td className="py-1 font-medium text-foreground">{item.mfg}</td>
                                                        <td className="py-1 text-foreground">{item.product}</td>
                                                        <td className="py-1 text-right text-foreground">{item.qty}</td>
                                                        <td className="py-1 text-right font-medium text-foreground">${item.listPrice.toLocaleString()}</td>
                                                        <td className="py-1 text-center">
                                                            {item.source === 'CET'
                                                                ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">CET</span>
                                                                : <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">VENDOR PDF</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-muted-foreground">Page {pmxPreviewPage}/2 — showing representative items ({TOTAL_ITEMS} total)</span>
                                            <div className="flex gap-1">
                                                <button onClick={() => setPmxPreviewPage(1)} disabled={pmxPreviewPage === 1} className="p-1 rounded hover:bg-muted disabled:opacity-30"><ChevronLeftIcon className="h-3 w-3" /></button>
                                                <button onClick={() => setPmxPreviewPage(2)} disabled={pmxPreviewPage === 2} className="p-1 rounded hover:bg-muted disabled:opacity-30"><ChevronRightIcon className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Send to SC */}
                            {!pmxSent ? (
                                <div className="relative">
                                    <button onClick={() => setShowSendPopover(!showSendPopover)}
                                        className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                                        <PaperAirplaneIcon className="h-4 w-4" />
                                        Send to Sales Coordinator
                                    </button>
                                    {showSendPopover && (
                                        <div className="absolute bottom-full mb-2 right-0 w-72 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-border bg-muted/50">
                                                <p className="text-xs font-bold text-foreground">Send PMX to...</p>
                                                <p className="text-[9px] text-muted-foreground">Select team member for pricing handoff</p>
                                            </div>
                                            <div className="p-2 space-y-0.5">
                                                {[
                                                    { name: 'Randy Martinez', role: 'Sales Coordinator', initials: 'RM', isSC: true },
                                                    { name: 'James Mitchell', role: 'Account Executive', initials: 'JM', isSC: false },
                                                    { name: 'Mike Torres', role: 'Operations Lead', initials: 'MT', isSC: false },
                                                ].map(user => (
                                                    <button key={user.name}
                                                        onClick={() => { if (user.isSC) { setShowSendPopover(false); setPmxSent(true); setTimeout(pauseAware(() => nextStep()), 2000); } }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                            user.isSC ? 'hover:bg-brand-100 dark:hover:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5' : 'hover:bg-muted/50'
                                                        }`}>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                            user.isSC ? 'bg-brand-300 text-zinc-900' : 'bg-muted text-muted-foreground'
                                                        }`}>{user.initials}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-foreground">{user.name}</p>
                                                            <p className="text-[9px] text-muted-foreground">{user.role}</p>
                                                        </div>
                                                        {user.isSC && <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-300 text-zinc-900 font-bold shrink-0">SC</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    PMX-MH-0412 sent to Randy Martinez (SC) — pricing handoff complete
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DuplerScReview — d1.5: SC Review & Pricing Application (Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

const DISCOUNT_TIERS = [
    { id: 'dt1', manufacturer: 'Allsteel', discountType: 'GPO Volume', rate: 42, source: 'GPO Agreement #2024-HNI-0087', items: 15, listTotal: 37560 },
    { id: 'dt2', manufacturer: 'Gunlock', discountType: 'Standard Dealer', rate: 38, source: 'Dealer Agreement — Annual', items: 9, listTotal: 24480 },
    { id: 'dt3', manufacturer: 'National', discountType: 'Volume Discount', rate: 35, source: 'Quote #NF-2026-0412 — Volume Tier B', items: 8, listTotal: 33540 },
];

const SC_PMX_ITEMS = [
    { line: 1, mfg: 'Allsteel', product: 'Involve Workstation 66"', qty: 12, listPrice: 2525, source: 'CET' as const, flagged: false },
    { line: 2, mfg: 'Allsteel', product: 'Acuity Task Chair', qty: 24, listPrice: 895, source: 'CET' as const, flagged: false },
    { line: 3, mfg: 'Allsteel', product: 'Stride Bench 60"', qty: 6, listPrice: 1890, source: 'CET' as const, flagged: false },
    { line: 4, mfg: 'Gunlock', product: 'Executive Credenza 72"', qty: 4, listPrice: 3200, source: 'CET' as const, flagged: false },
    { line: 5, mfg: 'Gunlock', product: 'Conference Table 96"', qty: 2, listPrice: 4500, source: 'CET' as const, flagged: false },
    { line: 10, mfg: 'National', product: 'Waveworks Desk 60"', qty: 10, listPrice: 2180, source: 'Vendor PDF' as const, flagged: true, flagNote: 'Qty ambiguity resolved — designer confirmed 10' },
    { line: 11, mfg: 'National', product: 'Exhibit Collab Table 48"', qty: 4, listPrice: 1240, source: 'Vendor PDF' as const, flagged: false },
    { line: 12, mfg: 'National', product: 'Realize Desk 60"', qty: 4, listPrice: 1580, source: 'Vendor PDF' as const, flagged: true, flagNote: 'Truncated option corrected — designer confirmed' },
] as const;

// PDF context excerpts for "View Source" modal in d1.5
const SOURCE_EXCERPTS: Record<number, string> = {
    10: 'NAT-WW-3060  Waveworks Desk 60"\nFinish: White + Orange Accent\nQty: 8-10 units*     $2,180.00/ea\n*Confirm final qty w/ designer\n\nNote: Standing base, storage pedestal included',
    11: 'NAT-EC-4200  Exhibit Collab Table 48"\nFinish: White\nQty: 4     $1,240.00/ea\nOpts: Power hub integrated',
    12: 'NAT-DK-4200  Realize Desk 60"\nFinish: White + Gray\nOpts: Standing base, storage ped*\nQty: 4     $1,580.00/ea\n* see margin note pg 3',
};

export function DuplerScReview({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { currentStep, nextStep, isPaused } = useDemo();
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => { if (!isPausedRef.current) { clearInterval(poll); fn(); } }, 200);
        };
    }, []);

    const [phase, setPhase] = useState<ScReviewPhase>('idle');
    const [discountsApplied, setDiscountsApplied] = useState<Record<string, boolean>>({});
    const [genProgress, setGenProgress] = useState(0);
    const [exported, setExported] = useState(false);
    const [viewSourceLine, setViewSourceLine] = useState<number | null>(null);

    const allDiscountsApplied = Object.values(discountsApplied).filter(Boolean).length >= DISCOUNT_TIERS.length;

    useEffect(() => {
        if (currentStep.id !== 'd1.5') return;
        setPhase('idle');
        setDiscountsApplied({});
        setGenProgress(0);
        setExported(false);
        const t = setTimeout(pauseAware(() => setPhase('notification')), 1500);
        return () => clearTimeout(t);
    }, [currentStep.id]);

    // Generating phase
    useEffect(() => {
        if (phase !== 'generating') return;
        setGenProgress(0);
        const duration = 3000;
        const steps = 30;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setGenProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setPhase('revealed')), duration + 800));
        return () => timers.forEach(clearTimeout);
    }, [phase]);

    if (currentStep.id !== 'd1.5') return null;

    const discountedTotal = DISCOUNT_TIERS.reduce((sum, dt) => sum + dt.listTotal * (1 - dt.rate / 100), 0);

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Notification */}
            {phase === 'notification' && (
                <button onClick={() => setPhase('sc-review')} className="w-full text-left">
                    <div className="p-5 bg-brand-50 dark:bg-brand-500/10 border-b-2 border-brand-400">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><PaperAirplaneIcon className="h-4 w-4" /></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">PMX Ready for Pricing</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Designer Alex Rivera sent PMX-MH-0412 ({TOTAL_ITEMS} items, ${PROJECT_TOTAL.toLocaleString()}). Drawing-verified, source-archived. Ready for discount application.</p>
                                <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to review <ArrowRightIcon className="h-3 w-3" /></p>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* SC Review */}
            {phase === 'sc-review' && (
                <div className="animate-in fade-in duration-500">
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border-b border-blue-200 dark:border-blue-500/20 flex items-center gap-2">
                        <PaperAirplaneIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">PMX-MH-0412 from Designer Alex Rivera — awaiting pricing</span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* PMX metadata */}
                        <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-[10px]">
                            <div className="flex justify-between"><span className="text-muted-foreground">PMX ID:</span><span className="font-mono font-bold text-foreground">PMX-MH-0412</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Project:</span><span className="text-foreground">Mercy Health Phase 2</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">List Total:</span><span className="font-bold text-foreground">${PROJECT_TOTAL.toLocaleString()}</span></div>
                        </div>

                        {/* Items table with source badges */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                <span className="text-[10px] font-bold text-foreground">Line Items — {TOTAL_ITEMS} total (representative sample)</span>
                                <div className="flex gap-1.5">
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">FROM CET</span>
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">FROM VENDOR PDF</span>
                                </div>
                            </div>
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="text-muted-foreground border-b border-border bg-muted/30">
                                        <th className="text-left py-1.5 px-3 font-medium">#</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Mfg</th>
                                        <th className="text-left py-1.5 px-2 font-medium">Product</th>
                                        <th className="text-right py-1.5 px-2 font-medium">Qty</th>
                                        <th className="text-right py-1.5 px-2 font-medium">List $</th>
                                        <th className="text-center py-1.5 px-2 font-medium">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SC_PMX_ITEMS.map(item => (
                                        <tr key={item.line} className={`border-b border-border/50 ${item.flagged ? 'bg-amber-50/30 dark:bg-amber-500/[0.03]' : ''}`}>
                                            <td className="py-1.5 px-3 text-muted-foreground">{item.line}</td>
                                            <td className="py-1.5 px-2 font-medium text-foreground">{item.mfg}</td>
                                            <td className="py-1.5 px-2 text-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    {item.product}
                                                    {item.flagged && (
                                                        <span className="group relative">
                                                            <ExclamationTriangleIcon className="h-3 w-3 text-amber-500 shrink-0" />
                                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap px-2 py-1 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-medium z-20 shadow-lg">
                                                                {'flagNote' in item ? item.flagNote : 'Flagged during extraction'}
                                                            </span>
                                                        </span>
                                                    )}
                                                    {item.flagged && (
                                                        <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 shrink-0">CONFIRMED</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-1.5 px-2 text-right text-foreground">{item.qty}</td>
                                            <td className="py-1.5 px-2 text-right font-medium text-foreground">${item.listPrice.toLocaleString()}</td>
                                            <td className="py-1.5 px-2 text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    {item.source === 'CET'
                                                        ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20">CET</span>
                                                        : <>
                                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">VENDOR PDF</span>
                                                            <button onClick={() => setViewSourceLine(item.line)} className="text-[8px] font-bold px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground border border-border transition-colors" title="View source document">
                                                                <MagnifyingGlassIcon className="h-2.5 w-2.5 inline" />
                                                            </button>
                                                        </>
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* AI Discount Advisor Panel */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <AIAgentAvatar />
                                <span className="text-xs font-bold text-foreground">DiscountAdvisor — Suggested Pricing</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">AI ASSISTED</span>
                            </div>
                            <div className="space-y-2">
                                {DISCOUNT_TIERS.map(dt => (
                                    <div key={dt.id} className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                        discountsApplied[dt.id] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5'
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-foreground">{dt.manufacturer}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold">{dt.discountType}</span>
                                            </div>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{dt.rate}%</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mb-2">{dt.source} — {dt.items} items, list ${dt.listTotal.toLocaleString()} → <span className="font-bold text-foreground">${Math.round(dt.listTotal * (1 - dt.rate / 100)).toLocaleString()}</span></p>
                                        {!discountsApplied[dt.id] ? (
                                            <button onClick={() => setDiscountsApplied(p => ({ ...p, [dt.id]: true }))}
                                                className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold transition-colors">Apply {dt.rate}% Discount</button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[10px] text-green-600 dark:text-green-400">
                                                <CheckCircleIcon className="h-4 w-4" /><span className="font-bold">Discount Applied</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Running total */}
                        {allDiscountsApplied && (
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-green-800 dark:text-green-200">Discounted Total</span>
                                    <span className="text-lg font-bold text-green-700 dark:text-green-300">${Math.round(discountedTotal).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">
                                    Savings: ${(PROJECT_TOTAL - Math.round(discountedTotal)).toLocaleString()} ({Math.round((1 - discountedTotal / PROJECT_TOTAL) * 100)}% average discount)
                                </p>
                            </div>
                        )}

                        {/* CTA */}
                        <button onClick={() => { if (allDiscountsApplied) setPhase('generating'); }} disabled={!allDiscountsApplied}
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                                allDiscountsApplied ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse' : 'bg-muted text-muted-foreground cursor-not-allowed'
                            }`}>
                            <DocumentTextIcon className="h-4 w-4" />
                            {allDiscountsApplied ? 'Generate SIF & Export to CORE' : `Apply all discounts (${Object.values(discountsApplied).filter(Boolean).length}/${DISCOUNT_TIERS.length})`}
                        </button>
                    </div>
                </div>
            )}

            {/* Generating SIF */}
            {phase === 'generating' && (
                <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <AIAgentAvatar />
                        <span className="text-xs font-bold text-foreground">Generating SIF & Exporting to CORE...</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-brand-400 transition-all duration-200 ease-linear" style={{ width: `${genProgress}%` }} />
                    </div>
                    <div className="space-y-1 text-[10px]">
                        {genProgress > 10 && <p className="text-muted-foreground animate-in fade-in duration-200">MarginCalculator: computing margins per manufacturer...</p>}
                        {genProgress > 35 && <p className="text-muted-foreground animate-in fade-in duration-200">SifGenerator: converting PMX → SIF format...</p>}
                        {genProgress > 60 && <p className="text-muted-foreground animate-in fade-in duration-200">SifGenerator: applying freight and surcharges...</p>}
                        {genProgress > 85 && <p className="text-muted-foreground animate-in fade-in duration-200">CORE Exporter: SIF-MH-0412 uploaded to CORE ERP</p>}
                    </div>
                </div>
            )}

            {/* Revealed — SIF generated */}
            {phase === 'revealed' && (
                <div className="p-5 space-y-4 animate-in fade-in duration-500">
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                        <div className="flex items-start gap-2">
                            <AIAgentAvatar />
                            <div className="flex-1">
                                <p className="text-xs text-green-800 dark:text-green-200">
                                    <span className="font-bold">SifGenerator:</span> SIF generated from validated PMX — exported to CORE. {TOTAL_ITEMS} items, 3 manufacturers, discounts applied.
                                </p>
                            </div>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">SC PRICED</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-lg font-bold text-foreground">{TOTAL_ITEMS}</div>
                            <div className="text-[9px] text-muted-foreground">Items Exported</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">${Math.round(discountedTotal).toLocaleString()}</div>
                            <div className="text-[9px] text-muted-foreground">Net Total</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="text-lg font-bold text-teal-600 dark:text-teal-400">SIF-MH-0412</div>
                            <div className="text-[9px] text-muted-foreground">CORE Export ID</div>
                        </div>
                    </div>

                    {!exported ? (
                        <button onClick={() => { setExported(true); setTimeout(pauseAware(() => nextStep()), 2000); }}
                            className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                            <CheckCircleIcon className="h-4 w-4" />
                            Complete Flow 1 — Continue to Warehouse
                        </button>
                    ) : (
                        <div className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                            <CheckCircleIcon className="h-4 w-4" />
                            Flow 1 Complete — SIF exported to CORE
                        </div>
                    )}
                </div>
            )}

            {/* View Source Modal */}
            {viewSourceLine !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={() => setViewSourceLine(null)}>
                    <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-bold text-foreground">Source Document — NF-2026-0412.pdf</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">VENDOR PDF</span>
                            </div>
                            <button onClick={() => setViewSourceLine(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                                <XMarkIcon className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="font-mono text-[10px] text-muted-foreground leading-relaxed whitespace-pre-wrap bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg border border-border">
                                {SOURCE_EXCERPTS[viewSourceLine] || 'Source excerpt not available'}
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                <span>AI extracted on Mar 24, 2026</span>
                                <span className="flex items-center gap-1">
                                    Confidence: <span className="font-bold text-green-600 dark:text-green-400">97%+</span>
                                </span>
                            </div>
                            {SC_PMX_ITEMS.find(i => i.line === viewSourceLine)?.flagged && (
                                <div className="flex items-center gap-2 text-[9px] p-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    <span className="text-green-700 dark:text-green-300">This item was flagged during extraction and reviewed by designer</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
