// ═══════════════════════════════════════════════════════════════════════════════
// Dupler — Flow 1: PDF to SIF Spec Check
// Steps: d1.1 (OCR), d1.2 (SIF Mapping), d1.3 (Price Validation), d1.4 (Approval & Export)
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
    CloudArrowUpIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    PaperAirplaneIcon,
    ChatBubbleLeftEllipsisIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { DUPLER_STEP_TIMING, type DuplerStepTiming } from '../../config/profiles/dupler';

// ─── Types ───────────────────────────────────────────────────────────────────

type OcrPhase = 'idle' | 'upload-zone' | 'uploading' | 'processing' | 'breathing' | 'revealed' | 'results';
type MappingPhase = 'idle' | 'notification' | 'processing' | 'revealed';
type ValidationPhase = 'idle' | 'notification' | 'processing' | 'revealed' | 'converting' | 'preview';
type ExportPhase = 'idle' | 'notification' | 'dealer-review' | 'approval-chain' | 'generating' | 'revealed';

interface AgentVis { name: string; detail: string; visible: boolean; done: boolean; }

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface SifLineItem {
    line: number;
    sku: string;
    description: string;
    sifCode: string;
    qty: number;
    unitPrice: number;
    mappingStatus: 'matched' | 'obsolete' | 'mismatch';
    substituteSku?: string;
    substituteDesc?: string;
    confidenceScore: number;
}

const SIF_ITEMS: SifLineItem[] = [
    { line: 1,  sku: 'NAT-EC-4200', description: 'Exhibit Collaborative Table 48"',   sifCode: 'SIF-TB-001', qty: 6,  unitPrice: 1240, mappingStatus: 'matched',  confidenceScore: 98 },
    { line: 2,  sku: 'NAT-SW-3100', description: 'Solve Wall Mounted Shelf 36"',      sifCode: 'SIF-ST-012', qty: 12, unitPrice: 385,  mappingStatus: 'matched',  confidenceScore: 96 },
    { line: 3,  sku: 'KIM-PF-2800', description: 'Priority Freestanding Panel 60"',   sifCode: 'SIF-PN-018', qty: 8,  unitPrice: 720,  mappingStatus: 'matched',  confidenceScore: 97 },
    { line: 4,  sku: 'IND-CH-1500', description: 'Indiana Mesh Task Chair',           sifCode: 'SIF-CH-005', qty: 10, unitPrice: 495,  mappingStatus: 'matched',  confidenceScore: 95 },
    { line: 5,  sku: 'NAT-WV-5500', description: 'Waveworks Credenza 72"',            sifCode: 'SIF-CS-025', qty: 4,  unitPrice: 1680, mappingStatus: 'matched',  confidenceScore: 99 },
    { line: 6,  sku: 'KIM-NR-4100', description: 'Narrate Sit-Stand Desk',            sifCode: 'SIF-DK-032', qty: 8,  unitPrice: 1150, mappingStatus: 'matched',  confidenceScore: 94 },
    // Obsolete items — discontinued models
    { line: 7,  sku: 'NAT-TC-2019', description: 'Triumph Conf Table (2019)',          sifCode: '',            qty: 3,  unitPrice: 2100, mappingStatus: 'obsolete', substituteSku: 'NAT-TC-2025', substituteDesc: 'Triumph II Conf Table (2025)', confidenceScore: 87 },
    { line: 8,  sku: 'KIM-XR-3300', description: 'Xsede Panel System 42" (disc.)',    sifCode: '',            qty: 6,  unitPrice: 580,  mappingStatus: 'obsolete', substituteSku: 'KIM-XR-3500', substituteDesc: 'Xsede Next Panel System', confidenceScore: 82 },
    { line: 9,  sku: 'IND-BK-1100', description: 'Indiana Bookcase 3-Shelf (disc.)',  sifCode: '',            qty: 4,  unitPrice: 340,  mappingStatus: 'obsolete', substituteSku: 'IND-BK-1200', substituteDesc: 'Indiana Bookcase III', confidenceScore: 91 },
    // Mismatched items
    { line: 10, sku: 'NAT-LT-6600', description: 'Lobby Lounge Table Round',          sifCode: 'SIF-TB-041', qty: 5,  unitPrice: 890,  mappingStatus: 'mismatch', confidenceScore: 64 },
    { line: 11, sku: 'KIM-FL-2200', description: 'Kimball Filing Cabinet 4-Drawer',   sifCode: 'SIF-FL-015', qty: 14, unitPrice: 425,  mappingStatus: 'mismatch', confidenceScore: 58 },
];

// Show a subset of 32 total — rest are implied matched
const MATCHED_COUNT = 27;
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
    type: 'outdated-price' | 'qty-mismatch' | 'uom-error' | 'regional-tax';
    aiSuggestion: string;
    region?: string;
    taxRate?: string;
}

const PRICE_DISCREPANCIES: PriceDiscrepancy[] = [
    { id: 'pd1', lineRef: 5,  sku: 'NAT-WV-5500', description: 'Waveworks Credenza 72"',       poPrice: 1730, contractPrice: 1680, delta: 50,   deltaPercent: '+3.0%', type: 'outdated-price', aiSuggestion: 'Compass contract price $1,680 is current. PDF uses Q4 2025 list price.' },
    { id: 'pd2', lineRef: 6,  sku: 'KIM-NR-4100', description: 'Narrate Sit-Stand Desk (×8)',  poPrice: 1150, contractPrice: 1227, delta: 616,  deltaPercent: '+6.7%', type: 'regional-tax',  region: 'Cook County, IL', taxRate: '6.7%', aiSuggestion: 'Ship-to is Cook County, IL — county furniture excise tax 6.7% applies to commercial orders. PDF quotes pre-tax list. 8 units × $77 surcharge = $616 total adjustment.' },
    { id: 'pd3', lineRef: 2,  sku: 'NAT-SW-3100', description: 'Solve Wall Mounted Shelf 36"', poPrice: 385,  contractPrice: 385,  delta: 0,    deltaPercent: '0%',    type: 'qty-mismatch',  aiSuggestion: 'PDF shows qty 12 but original PO has qty 10. Verify with buyer.' },
    { id: 'pd4', lineRef: 3,  sku: 'NAT-DK-4200', description: 'Realize Rectilinear Desk 60" (×6)', poPrice: 2340, contractPrice: 2527, delta: 1122, deltaPercent: '+8.0%', type: 'regional-tax',  region: 'New York City, NY', taxRate: '8.0%', aiSuggestion: 'Delivery to NYC — combined NY state + city commercial furniture surcharge 8.0%. PDF quotes base manufacturer price only. 6 units × $187 surcharge = $1,122 total adjustment.' },
];

const OCR_AGENTS: AgentVis[] = [
    { name: 'OCRAgent',       detail: '8 pages scanned',     visible: false, done: false },
    { name: 'TextExtract',    detail: 'tables parsed',       visible: false, done: false },
    { name: 'LineParser',     detail: '32 items identified', visible: false, done: false },
    { name: 'CatalogMapper',  detail: 'codes pre-mapped',   visible: false, done: false },
];

const MAPPING_AGENTS: AgentVis[] = [
    { name: 'SIFMapper',        detail: '32 items mapped',          visible: false, done: false },
    { name: 'ObsoleteDetector', detail: '3 obsolete SKUs found',    visible: false, done: false },
    { name: 'CatalogMatcher',   detail: '2 mismatches flagged',     visible: false, done: false },
];

const PRICE_AGENTS: AgentVis[] = [
    { name: 'PriceChecker',       detail: '28 items verified',          visible: false, done: false },
    { name: 'CompassChecker',     detail: 'Compass discounts loaded',   visible: false, done: false },
    { name: 'DiscrepancyAnalyzer', detail: '4 flags raised',            visible: false, done: false },
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

    // ── d1.1 State: OCR ──
    const [ocrPhase, setOcrPhase] = useState<OcrPhase>('idle');
    const ocrRef = useRef(ocrPhase);
    useEffect(() => { ocrRef.current = ocrPhase; }, [ocrPhase]);
    const [ocrAgents, setOcrAgents] = useState(OCR_AGENTS.map(a => ({ ...a })));
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrItemsRevealed, setOcrItemsRevealed] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileAppeared, setFileAppeared] = useState(false);
    const [ocrPage, setOcrPage] = useState(1);
    const [showPdfPreview, setShowPdfPreview] = useState(false);

    // ── d1.2 State: Mapping ──
    const [mapPhase, setMapPhase] = useState<MappingPhase>('idle');
    const [mapAgents, setMapAgents] = useState(MAPPING_AGENTS.map(a => ({ ...a })));
    const [mappingReviewed, setMappingReviewed] = useState<Record<number, 'accepted' | 'kept-original' | 'edited' | null>>({});
    const [editingLine, setEditingLine] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{ sku: string; desc: string }>({ sku: '', desc: '' });

    // ── d1.3 State: Validation ──
    const [valPhase, setValPhase] = useState<ValidationPhase>('idle');
    const [valAgents, setValAgents] = useState(PRICE_AGENTS.map(a => ({ ...a })));
    const [discResolved, setDiscResolved] = useState<Record<string, 'accepted' | 'disputed' | null>>({});
    const [showSifPreview, setShowSifPreview] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);
    const [sifSent, setSifSent] = useState(false);
    const [sifPreviewPage, setSifPreviewPage] = useState(1);
    const [showSendPopover, setShowSendPopover] = useState(false);

    // ── d1.4 State: Export ──
    const [expPhase, setExpPhase] = useState<ExportPhase>('idle');
    const [approvalStep, setApprovalStep] = useState(0); // 0=none, 1=AI done, 2=Expert done
    const [genProgress, setGenProgress] = useState(0);
    const [exported, setExported] = useState(false);
    const [dealerComments, setDealerComments] = useState<{ id: number; text: string; timestamp: string }[]>([]);
    const [dealerCommentText, setDealerCommentText] = useState('');
    const [dealerApproved, setDealerApproved] = useState(false);

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
        setUploadProgress(0);
        setFileAppeared(false);
        // Listen for "Convert to SIF" quick action from ExpertHubTransactions
        const handler = () => setOcrPhase('upload-zone');
        window.addEventListener('dupler-sif-convert', handler);
        return () => window.removeEventListener('dupler-sif-convert', handler);
    }, [stepId]);

    // Upload zone: file "appears" after 1.5s, then transition to uploading
    useEffect(() => {
        if (ocrPhase !== 'upload-zone') return;
        setFileAppeared(false);
        setUploadProgress(0);
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setFileAppeared(true)), 1500));
        timers.push(setTimeout(pauseAware(() => setOcrPhase('uploading')), 2000));
        return () => timers.forEach(clearTimeout);
    }, [ocrPhase]);

    // Uploading: progress bar simulation ~2s, then → processing
    useEffect(() => {
        if (ocrPhase !== 'uploading') return;
        setUploadProgress(0);
        const duration = 2000;
        const steps = 20;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setUploadProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setOcrPhase('processing')), duration + 600));
        return () => timers.forEach(clearTimeout);
    }, [ocrPhase]);

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
        const totalItems = Math.min(SIF_ITEMS.length, 8); // show first 8 visually
        for (let i = 0; i < totalItems; i++) {
            timers.push(setTimeout(pauseAware(() => setOcrItemsRevealed(i + 1)), i * 120));
        }
        timers.push(setTimeout(pauseAware(() => setOcrPhase('results')), totalItems * 120 + 500));
        return () => timers.forEach(clearTimeout);
    }, [ocrPhase]);

    // Results: wait for manual "Continue" button (no auto-advance)

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.2: Smart Normalization & SIF Mapping (Expert, interactive)
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

    const exceptions = SIF_ITEMS.filter(i => i.mappingStatus !== 'matched');
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

    // d1.3 → converting phase: SIF conversion progress bar
    useEffect(() => {
        if (valPhase !== 'converting') return;
        setConvertProgress(0);
        setSifSent(false);
        const duration = 2500;
        const steps = 25;
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= steps; i++) {
            timers.push(setTimeout(pauseAware(() => setConvertProgress(Math.min(100, Math.round((i / steps) * 100)))), (duration / steps) * i));
        }
        timers.push(setTimeout(pauseAware(() => setValPhase('preview')), duration + 800));
        return () => timers.forEach(clearTimeout);
    }, [valPhase]);

    // ═══════════════════════════════════════════════════════════════════════════
    // d1.4: Approval, SIF Generation & Export (Dealer, interactive)
    // ═══════════════════════════════════════════════════════════════════════════

    useEffect(() => {
        if (stepId !== 'd1.4') { setExpPhase('idle'); return; }
        setExpPhase('idle');
        setApprovalStep(0);
        setGenProgress(0);
        setExported(false);
        setDealerComments([]);
        setDealerCommentText('');
        setDealerApproved(false);
        // Dealer receives the SIF — show notification then go to review
        const timers: ReturnType<typeof setTimeout>[] = [];
        timers.push(setTimeout(pauseAware(() => setExpPhase('notification')), 1500));
        return () => timers.forEach(clearTimeout);
    }, [stepId]);

    const handleExpStart = () => {
        setExpPhase('dealer-review');
    };

    const handleDealerApprove = () => {
        setDealerApproved(true);
        // After dealer approves → approval chain
        setTimeout(pauseAware(() => {
            setExpPhase('approval-chain');
            setTimeout(pauseAware(() => setApprovalStep(1)), 1500); // AI Compliance
            setTimeout(pauseAware(() => {
                setApprovalStep(2);
                setTimeout(pauseAware(() => {
                    setExpPhase('generating');
                    setTimeout(() => setGenProgress(100), 50);
                    setTimeout(pauseAware(() => setExpPhase('revealed')), 3000);
                }), 1000);
            }), 3500); // Expert
        }), 500);
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
                    {ocrPhase === 'upload-zone' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                            <div className="p-6 rounded-xl bg-card border-2 border-dashed border-brand-400 dark:border-brand-500/40">
                                <div className="flex flex-col items-center justify-center py-6 gap-3">
                                    <div className="p-3 rounded-full bg-brand-100 dark:bg-brand-500/10">
                                        <CloudArrowUpIcon className="h-10 w-10 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-foreground">Upload Manufacturer Quote PDF</p>
                                        <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</p>
                                    </div>
                                </div>
                                {fileAppeared && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                                            <DocumentTextIcon className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-foreground">National_Furniture_Quote_2026.pdf</p>
                                            <p className="text-[10px] text-muted-foreground">8 pages &bull; 2.4 MB</p>
                                        </div>
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {ocrPhase === 'uploading' && (
                        <div className="animate-in fade-in duration-300 space-y-4">
                            <div className="p-6 rounded-xl bg-card border-2 border-brand-400 dark:border-brand-500/40">
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10">
                                        <DocumentTextIcon className="h-6 w-6 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-foreground">National_Furniture_Quote_2026.pdf</p>
                                        <p className="text-[10px] text-muted-foreground">8 pages &bull; 2.4 MB</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-medium text-muted-foreground">
                                            {uploadProgress < 100 ? 'Uploading and scanning...' : 'Upload complete — starting OCR extraction...'}
                                        </span>
                                        <span className="font-bold text-foreground">{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full bg-brand-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {ocrPhase === 'processing' && renderAgentPipeline(ocrAgents, ocrProgress, 'OCR Extraction Pipeline — Processing 8 pages...')}
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
                                        <span className="font-bold">OCRAgent:</span> Extraction complete — <span className="font-semibold">32 line items</span> identified with 99.2% accuracy. Ready for SIF mapping.
                                    </p>
                                </div>
                            </div>
                            {/* Extracted items preview */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground">Extracted Line Items</span>
                                    <span className="text-[10px] text-muted-foreground">Showing {Math.min(ocrItemsRevealed, 8)} of 32 items</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {SIF_ITEMS.slice(0, Math.min(ocrItemsRevealed, 8)).map(item => (
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
                                    <div className="bg-muted/30 px-4 py-2.5 border-t border-border flex items-center justify-between">
                                        <span className="text-[10px] text-muted-foreground">
                                            Showing {(ocrPage - 1) * 8 + 1}–{Math.min(ocrPage * 8, 32)} of 32 items • Total: $94,200
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setOcrPage(p => Math.max(1, p - 1))}
                                                disabled={ocrPage === 1}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <ChevronLeftIcon className="h-3.5 w-3.5" />
                                            </button>
                                            {[1, 2, 3, 4].map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => setOcrPage(p)}
                                                    className={`w-6 h-6 rounded text-[10px] font-bold transition-colors ${ocrPage === p ? 'bg-brand-300 text-zinc-900' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setOcrPage(p => Math.min(4, p + 1))}
                                                disabled={ocrPage === 4}
                                                className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <ChevronRightIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {ocrPhase === 'results' && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowPdfPreview(true)}
                                        className="flex-1 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <EyeIcon className="h-4 w-4" />
                                        Preview Source PDF
                                    </button>
                                    <button
                                        onClick={() => nextStep()}
                                        className="flex-[2] py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <ArrowRightIcon className="h-4 w-4" />
                                        Continue to SIF Mapping
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {/* ── PDF Preview Modal ── */}
                    {showPdfPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200" onClick={() => setShowPdfPreview(false)}>
                            <div className="bg-card border border-border rounded-2xl shadow-2xl w-[680px] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10">
                                            <DocumentTextIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">National_Furniture_Quote_2026.pdf</p>
                                            <p className="text-[10px] text-muted-foreground">8 pages &bull; 2.4 MB &bull; Uploaded just now</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPdfPreview(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {/* PDF Content — simulated pages */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-zinc-100 dark:bg-zinc-900/50">
                                    {/* Page 1 — Cover / Header */}
                                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">NATIONAL FURNITURE CO.</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">1200 Manufacturing Blvd, Grand Rapids, MI 49503</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">QUOTE #NF-2026-0412</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Date: March 15, 2026</p>
                                            </div>
                                        </div>
                                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                                            <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">PREPARED FOR:</p>
                                            <p className="text-xs text-zinc-900 dark:text-zinc-100">Strata Commercial Interiors</p>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Attn: Procurement Department</p>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Project: Corporate Office Renovation — Phase 2</p>
                                        </div>
                                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                                            <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-2">LINE ITEMS SUMMARY</p>
                                            <table className="w-full text-[10px]">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
                                                        <th className="text-left py-1.5 font-medium">Line</th>
                                                        <th className="text-left py-1.5 font-medium">Mfg Part #</th>
                                                        <th className="text-left py-1.5 font-medium">Description</th>
                                                        <th className="text-right py-1.5 font-medium">Qty</th>
                                                        <th className="text-right py-1.5 font-medium">Unit Price</th>
                                                        <th className="text-right py-1.5 font-medium">Ext. Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-zinc-700 dark:text-zinc-300">
                                                    {SIF_ITEMS.slice(0, 8).map(item => (
                                                        <tr key={item.line} className="border-b border-zinc-100 dark:border-zinc-700/50">
                                                            <td className="py-1.5">{item.line}</td>
                                                            <td className="py-1.5 font-mono">{item.sku}</td>
                                                            <td className="py-1.5">{item.description}</td>
                                                            <td className="py-1.5 text-right">{item.qty}</td>
                                                            <td className="py-1.5 text-right">${item.unitPrice.toLocaleString()}</td>
                                                            <td className="py-1.5 text-right font-medium">${(item.qty * item.unitPrice).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-[8px] text-zinc-400 dark:text-zinc-500 text-center mt-2">Page 1 of 8</p>
                                    </div>
                                    {/* Page 2 — Continued items */}
                                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8 space-y-4">
                                        <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">LINE ITEMS (continued)</p>
                                        <div className="space-y-2">
                                            {[
                                                { line: 9, sku: 'NF-WS-3042', desc: 'Adjustable Workstation Panel 30×42"', qty: 20, price: 485 },
                                                { line: 10, sku: 'NF-KS-1018', desc: 'Keyboard Tray Slide-Out Mechanism', qty: 40, price: 95 },
                                                { line: 11, sku: 'NF-MT-2460', desc: 'Monitor Arm Dual-Screen Mount', qty: 40, price: 220 },
                                                { line: 12, sku: 'NF-CP-0824', desc: 'Cable Management Tray 24"', qty: 40, price: 45 },
                                                { line: 13, sku: 'NF-FL-4848', desc: 'Acoustic Floor Panel 48×48"', qty: 16, price: 680 },
                                                { line: 14, sku: 'NF-LK-0306', desc: 'Pedestal Lock Set w/ Master Key', qty: 40, price: 35 },
                                                { line: 15, sku: 'NF-GD-2412', desc: 'Glass Desktop Divider 24×12"', qty: 20, price: 195 },
                                                { line: 16, sku: 'NF-WH-0016', desc: 'Whiteboard Panel Insert 16"', qty: 10, price: 155 },
                                            ].map(item => (
                                                <div key={item.line} className="flex items-center gap-3 text-[10px] text-zinc-700 dark:text-zinc-300 py-1 border-b border-zinc-100 dark:border-zinc-700/50">
                                                    <span className="w-5 text-zinc-400">{item.line}</span>
                                                    <span className="font-mono w-24">{item.sku}</span>
                                                    <span className="flex-1">{item.desc}</span>
                                                    <span className="w-8 text-right">×{item.qty}</span>
                                                    <span className="w-16 text-right">${item.price}</span>
                                                    <span className="w-20 text-right font-medium">${(item.qty * item.price).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[8px] text-zinc-400 dark:text-zinc-500 text-center mt-2">Page 2 of 8</p>
                                    </div>
                                    {/* Pages 3-8 — Placeholder representation */}
                                    {[3, 4, 5, 6, 7, 8].map(pg => (
                                        <div key={pg} className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-8">
                                            <div className="space-y-3">
                                                {[...Array(pg <= 5 ? 8 : pg === 6 ? 6 : 4)].map((_, i) => (
                                                    <div key={i} className="flex gap-3">
                                                        <div className="h-2.5 w-6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                                        <div className="h-2.5 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                                        <div className="h-2.5 flex-1 bg-zinc-100 dark:bg-zinc-700/50 rounded" />
                                                        <div className="h-2.5 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                                        <div className="h-2.5 w-14 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                                    </div>
                                                ))}
                                                {pg === 7 && (
                                                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                                                        <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                                                            <span>Terms & Conditions</span>
                                                        </div>
                                                        <div className="mt-2 space-y-1.5">
                                                            {[...Array(4)].map((_, i) => (
                                                                <div key={i} className="h-2 bg-zinc-100 dark:bg-zinc-700/50 rounded w-full" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {pg === 8 && (
                                                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-zinc-500 dark:text-zinc-400">Subtotal:</span>
                                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">$87,400.00</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-zinc-500 dark:text-zinc-400">Freight & Delivery:</span>
                                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">$4,200.00</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-zinc-500 dark:text-zinc-400">Installation:</span>
                                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">$2,600.00</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs font-bold border-t border-zinc-300 dark:border-zinc-600 pt-2">
                                                            <span className="text-zinc-900 dark:text-zinc-100">TOTAL:</span>
                                                            <span className="text-zinc-900 dark:text-zinc-100">$94,200.00</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[8px] text-zinc-400 dark:text-zinc-500 text-center mt-4">Page {pg} of 8</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Footer */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                                    <span className="text-[10px] text-muted-foreground">
                                        Source document for OCR extraction &bull; 32 line items detected
                                    </span>
                                    <button
                                        onClick={() => setShowPdfPreview(false)}
                                        className="px-4 py-1.5 rounded-lg bg-brand-300 hover:bg-brand-400 text-zinc-900 text-xs font-bold transition-colors"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.2: Smart Normalization & SIF Mapping ── */}
            {stepId === 'd1.2' && (
                <>
                    {mapPhase === 'notification' && renderNotification(
                        <DocumentTextIcon className="h-4 w-4" />,
                        'SIF Mapping Analysis Ready',
                        'SIFMappingAgent: 32 items cross-referenced against SIF catalog. 27 auto-mapped, 5 exceptions require expert review.',
                        handleMapStart
                    )}
                    {mapPhase === 'processing' && renderAgentPipeline(mapAgents, 100, 'SIF Catalog Mapping — Cross-referencing 32 items...')}
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
                                                        <span className="font-mono text-foreground">{item.substituteSku || item.sifCode}</span>
                                                        <span className="text-muted-foreground block">{item.substituteDesc || 'Catalog match available'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {mappingReviewed[item.line] ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                                                            {mappingReviewed[item.line] === 'accepted' ? 'AI Accepted' :
                                                             mappingReviewed[item.line] === 'kept-original' ? 'Original Kept' :
                                                             'Manually Edited'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1.5">
                                                        <button
                                                            onClick={() => setMappingReviewed(prev => ({ ...prev, [item.line]: 'accepted' }))}
                                                            className="px-3 py-1.5 bg-brand-400 hover:bg-brand-500 text-zinc-900 text-[10px] font-bold rounded-lg transition-colors"
                                                        >
                                                            Accept AI Suggestion
                                                        </button>
                                                        <div className="flex gap-1.5">
                                                            <button
                                                                onClick={() => setMappingReviewed(prev => ({ ...prev, [item.line]: 'kept-original' }))}
                                                                className="flex-1 px-2 py-1.5 border border-border bg-card hover:bg-muted/50 text-foreground text-[9px] font-medium rounded-lg transition-colors"
                                                            >
                                                                Keep Original
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingLine(item.line);
                                                                    setEditValues({
                                                                        sku: item.substituteSku || item.sifCode || item.sku,
                                                                        desc: item.substituteDesc || item.description,
                                                                    });
                                                                }}
                                                                className="flex-1 px-2 py-1.5 border border-border bg-card hover:bg-muted/50 text-foreground text-[9px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <PencilSquareIcon className="h-3 w-3" />
                                                                Edit
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Inline editor */}
                                        {editingLine === item.line && !mappingReviewed[item.line] && (
                                            <div className="mt-3 p-3 rounded-lg border border-brand-300 dark:border-brand-500/40 bg-brand-50/30 dark:bg-brand-500/5 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2.5">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Manual Edit — Line #{item.line}</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-muted-foreground block mb-1">SKU / Part Number</label>
                                                        <input
                                                            type="text"
                                                            value={editValues.sku}
                                                            onChange={e => setEditValues(v => ({ ...v, sku: e.target.value }))}
                                                            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-colors"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-muted-foreground block mb-1">Description</label>
                                                        <input
                                                            type="text"
                                                            value={editValues.desc}
                                                            onChange={e => setEditValues(v => ({ ...v, desc: e.target.value }))}
                                                            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-muted-foreground italic">Pre-filled with AI suggestion — edit as needed</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingLine(null)}
                                                            className="px-3 py-1 text-[9px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setMappingReviewed(prev => ({ ...prev, [item.line]: 'edited' }));
                                                                setEditingLine(null);
                                                            }}
                                                            className="px-3 py-1 text-[9px] font-bold bg-brand-400 hover:bg-brand-500 text-zinc-900 rounded-md transition-colors flex items-center gap-1"
                                                        >
                                                            <CheckIcon className="h-3 w-3" />
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
                        'PriceValidationAgent: Cross-checked 32 items against Compass discounts and vendor contracts in Core (SCS). 4 flags totaling $1,788 in variance — includes 2 regional tax adjustments (IL, NY).',
                        handleValStart
                    )}
                    {valPhase === 'processing' && renderAgentPipeline(valAgents, 100, 'Price Validation Engine — Cross-checking contracts...')}
                    {valPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Summary */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                <div className="flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs font-bold text-amber-800 dark:text-amber-200">4 Discrepancies — $1,788 Total Variance (incl. 2 regional tax adjustments)</span>
                                </div>
                                <span className="text-[10px] font-bold text-foreground">{resolvedCount}/{PRICE_DISCREPANCIES.length} Resolved</span>
                            </div>

                            {/* Discrepancy cards */}
                            <div className="space-y-3">
                                {PRICE_DISCREPANCIES.map((disc, i) => (
                                    <div key={disc.id} className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                        discResolved[disc.id] ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' :
                                        disc.type === 'regional-tax' ? 'border-purple-300 dark:border-purple-500/30 bg-purple-50/30 dark:bg-purple-500/5' :
                                        'border-amber-300 dark:border-amber-500/30 bg-white dark:bg-zinc-900'
                                    }`} style={{ animationDelay: `${i * 150}ms` }}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                        disc.type === 'outdated-price' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                                                        disc.type === 'qty-mismatch' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                                                        disc.type === 'regional-tax' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                                                        'bg-red-500/20 text-red-700 dark:text-red-400'
                                                    }`}>
                                                        {disc.type === 'outdated-price' ? 'Price Increase' : disc.type === 'qty-mismatch' ? 'Qty Mismatch' : disc.type === 'regional-tax' ? 'Regional Tax' : 'UOM Error'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">Line #{disc.lineRef} · {disc.sku}</span>
                                                </div>
                                                <p className="text-[11px] text-foreground font-medium mb-1">{disc.description}</p>
                                                {(disc.type === 'outdated-price' || disc.type === 'regional-tax') && (
                                                    <div className="flex items-center gap-4 text-[11px] mt-1">
                                                        <span className="text-red-600 dark:text-red-400 line-through">${disc.poPrice.toLocaleString()}</span>
                                                        <ArrowRightIcon className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-green-600 dark:text-green-400 font-bold">${disc.contractPrice.toLocaleString()}</span>
                                                        <span className="text-amber-600 dark:text-amber-400 text-[10px]">{disc.deltaPercent}</span>
                                                    </div>
                                                )}
                                                {disc.type === 'regional-tax' && disc.region && (
                                                    <div className="flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-md bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20">
                                                        <svg className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                                        <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300">{disc.region}</span>
                                                        <span className="text-[9px] text-purple-600 dark:text-purple-400">— Furniture tax rate: {disc.taxRate}</span>
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

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => prevStep()}
                                    className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium text-sm flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    Back to Mapping
                                </button>
                                <button
                                    onClick={() => setShowSifPreview(true)}
                                    className="flex-1 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <EyeIcon className="h-4 w-4" />
                                    Preview SIF Draft
                                </button>
                                <button
                                    onClick={() => setValPhase('converting')}
                                    disabled={!allDiscResolved}
                                    className={`flex-[2] py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                        allDiscResolved
                                            ? 'bg-brand-400 hover:bg-brand-500 text-zinc-900 shadow-lg shadow-brand-400/20 animate-pulse'
                                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                                    }`}
                                >
                                    {allDiscResolved ? (
                                        <><CheckIcon className="h-4 w-4" /> Validate & Generate SIF</>
                                    ) : (
                                        `Resolve All (${resolvedCount}/${PRICE_DISCREPANCIES.length})`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Converting phase — SIF generation progress */}
                    {valPhase === 'converting' && (
                        <div className="animate-in fade-in duration-300 space-y-4">
                            <div className="p-5 rounded-xl bg-card border border-border shadow-sm space-y-3">
                                <div className="flex items-center gap-2">
                                    <AIAgentAvatar />
                                    <span className="text-xs font-bold text-foreground">
                                        {convertProgress < 100 ? 'Converting to Standard Industry Format...' : 'SIF generation complete'}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full bg-brand-400 transition-all duration-150" style={{ width: `${convertProgress}%` }} />
                                </div>
                                <div className="space-y-1 text-[10px] text-muted-foreground">
                                    {convertProgress >= 15 && <p className="animate-in fade-in duration-200">SIFGeneratorAgent: Compiling 32 validated line items...</p>}
                                    {convertProgress >= 40 && <p className="animate-in fade-in duration-200">RegionalTaxEngine: Applying Cook County IL (6.7%) and NYC (8.0%) adjustments...</p>}
                                    {convertProgress >= 65 && <p className="animate-in fade-in duration-200">ComplianceAgent: Validating data integrity and contract terms...</p>}
                                    {convertProgress >= 85 && <p className="animate-in fade-in duration-200">FormatAgent: Building SIF DUP-0412 — $94,200 total...</p>}
                                    {convertProgress >= 100 && <p className="animate-in fade-in duration-200 font-semibold text-green-600 dark:text-green-400">✓ SIF file ready for dealer review</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview phase — Document-style SIF preview with pagination + Send popover */}
                    {valPhase === 'preview' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Success banner */}
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 flex items-center gap-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                <span className="text-xs font-medium text-green-800 dark:text-green-200">SIF DUP-0412 generated — 32 items, $94,200 &bull; Ready to send for review</span>
                            </div>

                            {/* Document preview — styled like a real document */}
                            <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-5">
                                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    {/* Document header */}
                                    <div className="px-8 pt-8 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">STANDARD INDUSTRY FORMAT (SIF)</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Generated by Strata AI Pipeline</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">SIF #DUP-0412</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">March 23, 2026</p>
                                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">VALIDATED</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
                                            <div><span className="text-zinc-500 dark:text-zinc-400">Vendor:</span> <span className="font-medium text-zinc-900 dark:text-zinc-100">National Furniture Co.</span></div>
                                            <div><span className="text-zinc-500 dark:text-zinc-400">Source:</span> <span className="text-zinc-700 dark:text-zinc-300">National_Furniture_Quote_2026.pdf</span></div>
                                            <div><span className="text-zinc-500 dark:text-zinc-400">Items:</span> <span className="font-bold text-zinc-900 dark:text-zinc-100">32 line items</span></div>
                                            <div><span className="text-zinc-500 dark:text-zinc-400">Total:</span> <span className="font-bold text-zinc-900 dark:text-zinc-100">$94,200.00</span></div>
                                            <div><span className="text-zinc-500 dark:text-zinc-400">Exceptions:</span> <span className="text-zinc-700 dark:text-zinc-300">5 resolved (3 obsolete, 2 mismatch)</span></div>
                                            <div><span className="text-zinc-500 dark:text-zinc-400">Tax Regions:</span> <span className="font-semibold text-purple-600 dark:text-purple-400">IL (6.7%), NYC (8.0%)</span></div>
                                        </div>
                                    </div>
                                    {/* Line items table */}
                                    <div className="px-8 py-4">
                                        <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">Line Items — Page {sifPreviewPage} of 4</p>
                                        <table className="w-full text-[10px]">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
                                                    <th className="text-left py-1.5 font-medium w-8">Line</th>
                                                    <th className="text-left py-1.5 font-medium">SIF Code</th>
                                                    <th className="text-left py-1.5 font-medium">Description</th>
                                                    <th className="text-right py-1.5 font-medium">Qty</th>
                                                    <th className="text-right py-1.5 font-medium">Unit Price</th>
                                                    <th className="text-right py-1.5 font-medium">Ext. Price</th>
                                                    <th className="text-center py-1.5 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-zinc-700 dark:text-zinc-300">
                                                {SIF_ITEMS.slice(0, 8).map((item, idx) => {
                                                    const lineNum = (sifPreviewPage - 1) * 8 + idx + 1;
                                                    return (
                                                        <tr key={lineNum} className="border-b border-zinc-100 dark:border-zinc-700/50">
                                                            <td className="py-1.5 text-zinc-400">{lineNum}</td>
                                                            <td className="py-1.5 font-mono">{item.sifCode || item.substituteSku || item.sku}</td>
                                                            <td className="py-1.5">{item.substituteDesc || item.description}</td>
                                                            <td className="py-1.5 text-right">{item.qty}</td>
                                                            <td className="py-1.5 text-right">${item.unitPrice.toLocaleString()}</td>
                                                            <td className="py-1.5 text-right font-medium">${(item.qty * item.unitPrice).toLocaleString()}</td>
                                                            <td className="py-1.5 text-center"><span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">✓</span></td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Pagination */}
                                    <div className="px-8 pb-4 flex items-center justify-between">
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                            Showing {(sifPreviewPage - 1) * 8 + 1}–{Math.min(sifPreviewPage * 8, 32)} of 32 items
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setSifPreviewPage(p => Math.max(1, p - 1))} disabled={sifPreviewPage === 1} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                                                <ChevronLeftIcon className="h-3.5 w-3.5" />
                                            </button>
                                            {[1, 2, 3, 4].map(p => (
                                                <button key={p} onClick={() => setSifPreviewPage(p)}
                                                    className={`w-6 h-6 rounded text-[10px] font-bold transition-colors ${sifPreviewPage === p ? 'bg-brand-300 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                                >{p}</button>
                                            ))}
                                            <button onClick={() => setSifPreviewPage(p => Math.min(4, p + 1))} disabled={sifPreviewPage === 4} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                                                <ChevronRightIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Page 4 footer — totals + tax */}
                                    {sifPreviewPage === 4 && (
                                        <div className="px-8 pb-6 space-y-3">
                                            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 space-y-1.5 text-[10px]">
                                                <div className="flex justify-between"><span className="text-zinc-500 dark:text-zinc-400">Subtotal (32 items):</span><span className="font-medium text-zinc-700 dark:text-zinc-300">$92,462.00</span></div>
                                                <div className="flex justify-between text-purple-600 dark:text-purple-400"><span>Regional Tax — Cook County, IL (6.7%):</span><span className="font-medium">+$616.00</span></div>
                                                <div className="flex justify-between text-purple-600 dark:text-purple-400"><span>Regional Tax — New York City, NY (8.0%):</span><span className="font-medium">+$1,122.00</span></div>
                                                <div className="flex justify-between text-xs font-bold border-t border-zinc-300 dark:border-zinc-600 pt-1.5"><span className="text-zinc-900 dark:text-zinc-100">TOTAL:</span><span className="text-zinc-900 dark:text-zinc-100">$94,200.00</span></div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Page number */}
                                    <div className="pb-4">
                                        <p className="text-[8px] text-zinc-400 dark:text-zinc-500 text-center">Page {sifPreviewPage} of 4</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setValPhase('revealed')}
                                    className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium text-sm flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    Back
                                </button>
                                <div className="relative flex-[2]">
                                    {sifSent ? (
                                        <div className="w-full py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Sent to Sarah Chen (Dealer) — redirecting...
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowSendPopover(prev => !prev)}
                                            className="w-full py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <PaperAirplaneIcon className="h-4 w-4" />
                                            Send
                                        </button>
                                    )}
                                    {/* Send-to popover */}
                                    {showSendPopover && !sifSent && (
                                        <div className="absolute bottom-full mb-2 right-0 w-72 bg-card border border-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 overflow-hidden">
                                            <div className="px-4 py-2.5 border-b border-border bg-muted/50">
                                                <p className="text-xs font-bold text-foreground">Send SIF to...</p>
                                                <p className="text-[9px] text-muted-foreground">Select a team member for review</p>
                                            </div>
                                            <div className="p-2 space-y-0.5">
                                                {[
                                                    { name: 'Sarah Chen', role: 'Dealer — Procurement Lead', initials: 'SC', isDealer: true },
                                                    { name: 'James Mitchell', role: 'Account Executive', initials: 'JM', isDealer: false },
                                                    { name: 'Mike Torres', role: 'Operations Lead', initials: 'MT', isDealer: false },
                                                    { name: 'Lisa Wong', role: 'Finance Analyst', initials: 'LW', isDealer: false },
                                                ].map(user => (
                                                    <button
                                                        key={user.name}
                                                        onClick={() => {
                                                            if (user.isDealer) {
                                                                setShowSendPopover(false);
                                                                setSifSent(true);
                                                                setTimeout(pauseAware(() => nextStep()), 2000);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                                                            user.isDealer
                                                                ? 'hover:bg-brand-100 dark:hover:bg-brand-500/10 ring-1 ring-brand-300 dark:ring-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5'
                                                                : 'hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                            user.isDealer ? 'bg-brand-300 text-zinc-900' : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                            {user.initials}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-foreground">{user.name}</p>
                                                            <p className="text-[9px] text-muted-foreground">{user.role}</p>
                                                        </div>
                                                        {user.isDealer && (
                                                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-300 text-zinc-900 font-bold shrink-0">DEALER</span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* ── SIF Draft Preview Modal ── */}
                    {showSifPreview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200" onClick={() => setShowSifPreview(false)}>
                            <div className="bg-card border border-border rounded-2xl shadow-2xl w-[720px] max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-500/10">
                                            <DocumentTextIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">SIF Draft — DUP-0412</p>
                                            <p className="text-[10px] text-muted-foreground">32 line items &bull; $94,200 &bull; Pending validation</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowSifPreview(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {/* SIF Content */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* SIF Header */}
                                    <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Document Type:</span><span className="font-bold text-foreground">Standard Industry Format (SIF)</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">SIF ID:</span><span className="font-mono font-bold text-foreground">DUP-0412</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Source:</span><span className="text-foreground">National_Furniture_Quote_2026.pdf</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Date Created:</span><span className="text-foreground">March 23, 2026</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Vendor:</span><span className="text-foreground">National Furniture Co.</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Ship-to Regions:</span><span className="font-semibold text-purple-600 dark:text-purple-400">IL, NY (tax-adjusted)</span></div>
                                        </div>
                                    </div>
                                    {/* Status summary */}
                                    <div className="flex gap-3">
                                        <div className="flex-1 p-3 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 text-center">
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">27</p>
                                            <p className="text-[9px] text-green-700 dark:text-green-300 font-medium">Auto-Mapped</p>
                                        </div>
                                        <div className="flex-1 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-center">
                                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">5</p>
                                            <p className="text-[9px] text-amber-700 dark:text-amber-300 font-medium">Exceptions Resolved</p>
                                        </div>
                                        <div className="flex-1 p-3 rounded-lg bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 text-center">
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">2</p>
                                            <p className="text-[9px] text-purple-700 dark:text-purple-300 font-medium">Tax Adjustments</p>
                                        </div>
                                        <div className="flex-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 text-center">
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{resolvedCount}/{PRICE_DISCREPANCIES.length}</p>
                                            <p className="text-[9px] text-blue-700 dark:text-blue-300 font-medium">Price Validated</p>
                                        </div>
                                    </div>
                                    {/* Line items table */}
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <table className="w-full text-[10px]">
                                            <thead>
                                                <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                                                    <th className="text-left py-2 px-3 font-medium">Line</th>
                                                    <th className="text-left py-2 px-3 font-medium">SIF Code</th>
                                                    <th className="text-left py-2 px-3 font-medium">Description</th>
                                                    <th className="text-right py-2 px-3 font-medium">Qty</th>
                                                    <th className="text-right py-2 px-3 font-medium">Unit $</th>
                                                    <th className="text-center py-2 px-3 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {SIF_ITEMS.slice(0, 8).map(item => (
                                                    <tr key={item.line} className="border-b border-border/50">
                                                        <td className="py-1.5 px-3 text-muted-foreground">{item.line}</td>
                                                        <td className="py-1.5 px-3 font-mono text-foreground">{item.sifCode || item.substituteSku || item.sku}</td>
                                                        <td className="py-1.5 px-3 text-foreground">{item.substituteDesc || item.description}</td>
                                                        <td className="py-1.5 px-3 text-right text-foreground">{item.qty}</td>
                                                        <td className="py-1.5 px-3 text-right font-medium text-foreground">${item.unitPrice.toLocaleString()}</td>
                                                        <td className="py-1.5 px-3 text-center">
                                                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                                item.mappingStatus === 'matched' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' :
                                                                item.mappingStatus === 'obsolete' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                                                                'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                                                            }`}>
                                                                {item.mappingStatus === 'matched' ? 'Mapped' : item.mappingStatus === 'obsolete' ? 'Substituted' : 'Reviewed'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="bg-muted/30 px-3 py-2 border-t border-border text-[10px] text-muted-foreground">
                                            Showing 8 of 32 items &bull; Total: $94,200
                                        </div>
                                    </div>
                                    {/* Tax adjustment callout */}
                                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20">
                                        <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300 mb-1.5">Regional Tax Adjustments Applied</p>
                                        <div className="space-y-1 text-[10px]">
                                            <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                                                <span>Cook County, IL — Furniture excise tax 6.7%</span>
                                                <span className="font-bold">+$616</span>
                                            </div>
                                            <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                                                <span>New York City, NY — Commercial furniture surcharge 8.0%</span>
                                                <span className="font-bold">+$1,122</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-1.5 border-t border-purple-200 dark:border-purple-500/20 font-bold text-purple-800 dark:text-purple-200">
                                                <span>Total regional tax impact</span>
                                                <span>+$1,738</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Footer */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                                    <span className="text-[10px] text-muted-foreground">
                                        Draft preview — prices pending final validation
                                    </span>
                                    <button
                                        onClick={() => setShowSifPreview(false)}
                                        className="px-4 py-1.5 rounded-lg bg-brand-300 hover:bg-brand-400 text-zinc-900 text-xs font-bold transition-colors"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── d1.4: Dealer Review, Approval & Export ── */}
            {stepId === 'd1.4' && (
                <>
                    {expPhase === 'notification' && renderNotification(
                        <PaperAirplaneIcon className="h-4 w-4" />,
                        'SIF Document Received for Review',
                        'Expert David Park sent SIF DUP-0412 (32 items, $94,200). Review the document, add comments if needed, and approve to proceed with export.',
                        handleExpStart
                    )}

                    {expPhase === 'dealer-review' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* Received banner */}
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 flex items-center gap-2">
                                <PaperAirplaneIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                    SIF DUP-0412 received from Expert David Park — awaiting your review
                                </span>
                            </div>

                            {/* SIF Document card */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DocumentTextIcon className="h-4 w-4 text-brand-500" />
                                        <span className="text-xs font-bold text-foreground">SIF Document — DUP-0412</span>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">PENDING REVIEW</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
                                        <div className="flex justify-between"><span className="text-muted-foreground">SIF ID:</span><span className="font-mono font-bold text-foreground">DUP-0412</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Vendor:</span><span className="text-foreground">National Furniture Co.</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Line Items:</span><span className="font-bold text-foreground">32</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Total Value:</span><span className="font-bold text-foreground">$94,200</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Exceptions Resolved:</span><span className="text-foreground">5 of 5</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Tax Adjustments:</span><span className="font-semibold text-purple-600 dark:text-purple-400">IL (6.7%), NYC (8.0%)</span></div>
                                    </div>
                                    <div className="border-t border-border pt-3">
                                        <table className="w-full text-[10px]">
                                            <thead>
                                                <tr className="text-muted-foreground border-b border-border">
                                                    <th className="text-left py-1 font-medium">Line</th>
                                                    <th className="text-left py-1 font-medium">SIF Code</th>
                                                    <th className="text-left py-1 font-medium">Description</th>
                                                    <th className="text-right py-1 font-medium">Qty</th>
                                                    <th className="text-right py-1 font-medium">Unit $</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {SIF_ITEMS.slice(0, 6).map(item => (
                                                    <tr key={item.line} className="border-b border-border/50">
                                                        <td className="py-1 text-muted-foreground">{item.line}</td>
                                                        <td className="py-1 font-mono text-foreground">{item.sifCode || item.substituteSku || item.sku}</td>
                                                        <td className="py-1 text-foreground truncate max-w-[200px]">{item.substituteDesc || item.description}</td>
                                                        <td className="py-1 text-right text-foreground">{item.qty}</td>
                                                        <td className="py-1 text-right font-medium text-foreground">${item.unitPrice.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="text-[10px] text-muted-foreground mt-1.5 px-1">+ 26 more items &bull; Total: $94,200</div>
                                    </div>
                                    {/* Tax callout */}
                                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 text-[10px]">
                                        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        <span className="text-purple-700 dark:text-purple-300">Regional tax applied: Cook County IL (+$616) &bull; NYC (+$1,122) = <span className="font-bold">+$1,738 total</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Comments section */}
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
                                    <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-bold text-foreground">Dealer Comments</span>
                                    {dealerComments.length > 0 && <span className="text-[9px] text-muted-foreground">({dealerComments.length})</span>}
                                </div>
                                <div className="p-4 space-y-3">
                                    {/* Existing comments */}
                                    {dealerComments.map(c => (
                                        <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="w-7 h-7 rounded-full bg-brand-300 flex items-center justify-center text-[10px] font-bold text-zinc-900 shrink-0">SC</div>
                                            <div className="flex-1 p-2.5 rounded-lg bg-muted/30 border border-border">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-bold text-foreground">Sarah Chen</span>
                                                    <span className="text-[9px] text-muted-foreground">{c.timestamp}</span>
                                                </div>
                                                <p className="text-[11px] text-foreground">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={dealerCommentText}
                                            onChange={e => setDealerCommentText(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && dealerCommentText.trim()) {
                                                    setDealerComments(prev => [...prev, { id: Date.now(), text: dealerCommentText.trim(), timestamp: 'Just now' }]);
                                                    setDealerCommentText('');
                                                }
                                            }}
                                            placeholder="Add a comment about this SIF..."
                                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-colors placeholder:text-muted-foreground"
                                        />
                                        <button
                                            onClick={() => {
                                                if (dealerCommentText.trim()) {
                                                    setDealerComments(prev => [...prev, { id: Date.now(), text: dealerCommentText.trim(), timestamp: 'Just now' }]);
                                                    setDealerCommentText('');
                                                }
                                            }}
                                            className="px-3 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 text-zinc-900 text-[10px] font-bold transition-colors"
                                        >
                                            Comment
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => prevStep()}
                                    className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium text-sm flex items-center gap-2 transition-colors"
                                >
                                    <ChevronLeftIcon className="h-4 w-4" />
                                    Request Changes
                                </button>
                                <button
                                    onClick={handleDealerApprove}
                                    className="flex-[2] py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Approve SIF — Proceed to Export
                                </button>
                            </div>
                        </div>
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
                                { label: 'Expert — David Park', detail: 'Reviewing SIF mapping accuracy and pricing decisions...', step: 2 },
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
                                <span className="text-xs font-bold text-foreground">Generating SIF File...</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-brand-400 transition-all duration-[2500ms] ease-linear" style={{ width: `${genProgress}%` }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground">SIFGeneratorAgent: Building compliant file — 32 items, $94,200 total...</p>
                        </div>
                    )}

                    {expPhase === 'revealed' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            {/* SIF Summary */}
                            <div className="p-5 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    <span className="text-sm font-bold text-green-800 dark:text-green-200">SIF File DUP-0412 Generated</span>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Line Items', value: '32' },
                                        { label: 'Total Value', value: '$94,200' },
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
                                    Export to Core (SCS)
                                </button>
                            ) : (
                                <div className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="h-4 w-4" />
                                    SIF DUP-0412 exported successfully — PMX/SPEC import confirmed
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── Empty state: idle waits for Quick Action click, render nothing ── */}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DuplerDealerSifReview — Standalone d1.4 for Dashboard Follow Up tab
// ═══════════════════════════════════════════════════════════════════════════════

export function DuplerDealerSifReview({ onNavigate }: { onNavigate: (page: string) => void }) {
    const { currentStep, nextStep, prevStep, isPaused } = useDemo();
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => { if (!isPausedRef.current) { clearInterval(poll); fn(); } }, 200);
        };
    }, []);

    const [phase, setPhase] = useState<ExportPhase>('idle');
    const [approvalStep, setApprovalStep] = useState(0);
    const [genProgress, setGenProgress] = useState(0);
    const [exported, setExported] = useState(false);
    const [comments, setComments] = useState<{ id: number; text: string; timestamp: string }[]>([]);
    const [commentText, setCommentText] = useState('');

    // Init: show notification after delay
    useEffect(() => {
        if (currentStep.id !== 'd1.4') return;
        setPhase('idle');
        setApprovalStep(0);
        setGenProgress(0);
        setExported(false);
        setComments([]);
        setCommentText('');
        const t = setTimeout(pauseAware(() => setPhase('notification')), 1500);
        return () => clearTimeout(t);
    }, [currentStep.id]);

    const handleApprove = () => {
        setTimeout(pauseAware(() => {
            setPhase('approval-chain');
            setTimeout(pauseAware(() => setApprovalStep(1)), 1500);
            setTimeout(pauseAware(() => {
                setApprovalStep(2);
                setTimeout(pauseAware(() => {
                    setPhase('generating');
                    setTimeout(() => setGenProgress(100), 50);
                    setTimeout(pauseAware(() => setPhase('revealed')), 3000);
                }), 1000);
            }), 3500);
        }), 500);
    };

    const addComment = () => {
        if (!commentText.trim()) return;
        setComments(prev => [...prev, { id: Date.now(), text: commentText.trim(), timestamp: 'Just now' }]);
        setCommentText('');
    };

    if (currentStep.id !== 'd1.4') return null;

    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Notification phase */}
            {phase === 'notification' && (
                <button onClick={() => setPhase('dealer-review')} className="w-full text-left">
                    <div className="p-5 bg-brand-50 dark:bg-brand-500/10 border-b-2 border-brand-400">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-brand-500 text-zinc-900"><PaperAirplaneIcon className="h-4 w-4" /></div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">SIF Document Received for Review</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">Just now</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Expert David Park sent SIF DUP-0412 (32 items, $94,200). Review the document, add comments if needed, and approve to proceed with export.</p>
                                <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to start <ArrowRightIcon className="h-3 w-3" /></p>
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Dealer Review phase */}
            {phase === 'dealer-review' && (
                <div className="animate-in fade-in duration-500">
                    {/* Header */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/5 border-b border-blue-200 dark:border-blue-500/20 flex items-center gap-2">
                        <PaperAirplaneIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">SIF DUP-0412 received from Expert David Park — awaiting your review</span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* SIF Document metadata + table */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <DocumentTextIcon className="h-4 w-4 text-brand-500" />
                                    <span className="text-xs font-bold text-foreground">SIF Document — DUP-0412</span>
                                </div>
                                <span className="text-[9px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">PENDING REVIEW</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1 text-[10px]">
                                    <div className="flex justify-between"><span className="text-muted-foreground">SIF ID:</span><span className="font-mono font-bold text-foreground">DUP-0412</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Vendor:</span><span className="text-foreground">National Furniture Co.</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Line Items:</span><span className="font-bold text-foreground">32</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Total Value:</span><span className="font-bold text-foreground">$94,200</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Exceptions:</span><span className="text-foreground">5 of 5 Resolved</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Tax Adjustments:</span><span className="font-semibold text-purple-600 dark:text-purple-400">IL (6.7%), NYC (8.0%)</span></div>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <table className="w-full text-[10px]">
                                        <thead>
                                            <tr className="text-muted-foreground border-b border-border">
                                                <th className="text-left py-1 font-medium">Line</th>
                                                <th className="text-left py-1 font-medium">SIF Code</th>
                                                <th className="text-left py-1 font-medium">Description</th>
                                                <th className="text-right py-1 font-medium">Qty</th>
                                                <th className="text-right py-1 font-medium">Unit $</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SIF_ITEMS.slice(0, 6).map(item => (
                                                <tr key={item.line} className="border-b border-border/50">
                                                    <td className="py-1 text-muted-foreground">{item.line}</td>
                                                    <td className="py-1 font-mono text-foreground">{item.sifCode || item.substituteSku || item.sku}</td>
                                                    <td className="py-1 text-foreground truncate max-w-[200px]">{item.substituteDesc || item.description}</td>
                                                    <td className="py-1 text-right text-foreground">{item.qty}</td>
                                                    <td className="py-1 text-right font-medium text-foreground">${item.unitPrice.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="text-[10px] text-muted-foreground mt-1.5 px-1">+ 26 more items &bull; Total: $94,200</div>
                                </div>
                                {/* Tax callout */}
                                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 text-[10px]">
                                    <svg className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                    <span className="text-purple-700 dark:text-purple-300">Regional tax applied: Cook County IL (+$616) &bull; NYC (+$1,122) = <span className="font-bold">+$1,738 total</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="bg-muted/50 px-4 py-2.5 border-b border-border flex items-center gap-2">
                                <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-bold text-foreground">Dealer Comments</span>
                                {comments.length > 0 && <span className="text-[9px] text-muted-foreground">({comments.length})</span>}
                            </div>
                            <div className="p-4 space-y-3">
                                {comments.map(c => (
                                    <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="w-7 h-7 rounded-full bg-brand-300 flex items-center justify-center text-[10px] font-bold text-zinc-900 shrink-0">SC</div>
                                        <div className="flex-1 p-2.5 rounded-lg bg-muted/30 border border-border">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-foreground">Sarah Chen</span>
                                                <span className="text-[9px] text-muted-foreground">{c.timestamp}</span>
                                            </div>
                                            <p className="text-[11px] text-foreground">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
                                        placeholder="Add a comment about this SIF..."
                                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 transition-colors placeholder:text-muted-foreground"
                                    />
                                    <button onClick={addComment} className="px-3 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 text-zinc-900 text-[10px] font-bold transition-colors">Comment</button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button onClick={() => prevStep()} className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium text-sm flex items-center gap-2 transition-colors">
                                <ChevronLeftIcon className="h-4 w-4" />
                                Request Changes
                            </button>
                            <button onClick={handleApprove} className="flex-[2] py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors">
                                <ShieldCheckIcon className="h-4 w-4" />
                                Approve SIF — Proceed to Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Chain */}
            {phase === 'approval-chain' && (
                <div className="p-5 animate-in fade-in duration-300 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheckIcon className="h-5 w-5 text-brand-500" />
                        <span className="text-sm font-bold text-foreground">Approval Chain</span>
                    </div>
                    {[
                        { label: 'AI Compliance Agent', detail: 'Validating data integrity, pricing compliance, contract terms...', step: 1 },
                        { label: 'Expert — David Park', detail: 'Reviewing SIF mapping accuracy and pricing decisions...', step: 2 },
                    ].map(ap => (
                        <div key={ap.step} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-500 ${
                            approvalStep >= ap.step ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' :
                            approvalStep === ap.step - 1 ? 'border-brand-300 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/5' :
                            'border-border bg-muted/30'
                        }`}>
                            {approvalStep >= ap.step ? <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" /> :
                             approvalStep === ap.step - 1 ? <ArrowPathIcon className="h-5 w-5 text-brand-500 animate-spin shrink-0" /> :
                             <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                            <div className="flex-1">
                                <span className="text-xs font-bold text-foreground">{ap.label}</span>
                                <p className="text-[10px] text-muted-foreground">{ap.detail}</p>
                            </div>
                            {approvalStep >= ap.step && <span className="text-[9px] font-bold text-green-600 dark:text-green-400 uppercase">Approved</span>}
                        </div>
                    ))}
                    <div className="text-center text-[10px] text-muted-foreground mt-2">{approvalStep}/2 Approved</div>
                </div>
            )}

            {/* Generating */}
            {phase === 'generating' && (
                <div className="p-5 animate-in fade-in duration-300 space-y-3">
                    <div className="flex items-center gap-2">
                        <AIAgentAvatar />
                        <span className="text-xs font-bold text-foreground">Generating SIF File...</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-brand-400 transition-all duration-[2500ms] ease-linear" style={{ width: `${genProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">SIFGeneratorAgent: Building compliant file — 32 items, $94,200 total...</p>
                </div>
            )}

            {/* Revealed / Export */}
            {phase === 'revealed' && (
                <div className="p-5 animate-in fade-in duration-500 space-y-4">
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-bold text-green-800 dark:text-green-200">SIF File DUP-0412 Generated</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Line Items', value: '32' },
                                { label: 'Total Value', value: '$94,200' },
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
                    {!exported ? (
                        <button
                            onClick={() => { setExported(true); setTimeout(pauseAware(() => nextStep()), 2000); }}
                            className="w-full py-3 rounded-xl bg-brand-400 hover:bg-brand-500 text-zinc-900 font-bold text-sm shadow-lg shadow-brand-400/20 animate-pulse flex items-center justify-center gap-2 transition-colors"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Export to Core (SCS)
                        </button>
                    ) : (
                        <div className="w-full py-3 rounded-xl bg-green-500 text-white font-bold text-sm text-center flex items-center justify-center gap-2">
                            <CheckCircleIcon className="h-4 w-4" />
                            SIF DUP-0412 exported successfully — PMX/SPEC import confirmed
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
