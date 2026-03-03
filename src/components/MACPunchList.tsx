import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    CameraIcon,
    Bars4Icon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    PencilIcon,
    XMarkIcon,
    CubeIcon,
    PhotoIcon,
    MapPinIcon,
    SparklesIcon,
    EyeIcon,
    EnvelopeIcon,
    QrCodeIcon,
    ArrowUpTrayIcon,
    PaperClipIcon,
} from '@heroicons/react/24/outline';
import { useDemo } from '../context/DemoContext';
import LiabilityAnalysisPanel from './widgets/LiabilityAnalysisPanel';
import ConfidenceScoreBadge from './widgets/ConfidenceScoreBadge';
import DemoAvatar, { AIAgentAvatar } from './simulations/DemoAvatars';

// ─── Types ────────────────────────────────────────────────────────────────────
type ValidationStatus = 'present' | 'needs_clarification' | 'missing';

interface ValidationItem {
    id: string;
    label: string;
    status: ValidationStatus;
    confidence: number;
    detail?: string;
    aiSuggestion?: string;
}

interface BusinessRule {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'fail';
    detail: string;
    editable?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VALIDATION_ITEMS: ValidationItem[] = [
    { id: 'order-number', label: 'Original Order Number', status: 'present', confidence: 98, detail: 'ORD-2055 — verified against order database' },
    { id: 'line-number', label: 'Line Number from Acknowledgement', status: 'present', confidence: 96, detail: 'Line 3 — matched to ACK-7842' },
    { id: 'issue-photo', label: 'Picture of Issue', status: 'present', confidence: 94, detail: '2 photos attached — upholstery damage clearly visible' },
    { id: 'label-photo', label: 'Picture of Label', status: 'needs_clarification', confidence: 62, detail: 'Label partially obscured — AI detects potential SKU mismatch', aiSuggestion: 'Label shows CC-AZ-2024 but order references CC-AZ-2025. This may be a model year variant. Recommend confirming with requester or checking product catalog for cross-reference.' },
    { id: 'box-photo', label: 'Picture of Box', status: 'missing', confidence: 0, detail: 'No box photo provided — required for freight damage claims', aiSuggestion: 'Box condition is critical for carrier liability assessment. Contact requester to provide a photo of the original shipping box and packaging materials.' },
];

const BUSINESS_RULES: BusinessRule[] = [
    { id: 'repair-threshold', label: 'Repair quote within $500 threshold', status: 'warning', detail: '$510 exceeds threshold by $10 (2% over)', editable: true },
    { id: 'trip-zone', label: 'Trip charge matches zone rate', status: 'pass', detail: '$175 matches Zone 3 standard rate' },
    { id: 'certified-vendor', label: 'Installer is certified vendor', status: 'pass', detail: 'ProInstall LLC — Certified since 2019' },
    { id: 'labor-hours', label: 'Labor hours within standard range', status: 'warning', detail: '6 hrs quoted vs. 4 hrs typical for this repair type', editable: true },
    { id: 'warranty-coverage', label: 'Warranty coverage confirmed', status: 'pass', detail: 'Active warranty until 2027-03 (SN-2025-88712)' },
    { id: 'duplicate-check', label: 'No duplicate claims', status: 'pass', detail: 'No prior claims for this order line' },
];

const AI_RULE_SUGGESTIONS: Record<string, { label: string; value: string }[]> = {
    'repair-threshold': [
        { label: 'Adjust to $495', value: '495' },
        { label: 'Exception for $510', value: '510' },
        { label: 'Split: 2× $255', value: '255' },
    ],
    'labor-hours': [
        { label: '4 hrs (standard)', value: '4' },
        { label: '5 hrs (partial)', value: '5' },
        { label: '6 hrs (justified)', value: '6' },
    ],
};

const EXTRACTION_FIELDS: { label: string; value: string; status: 'ok' | 'warning' | 'missing' }[] = [
    { label: 'Order Number', value: 'ORD-2055', status: 'ok' },
    { label: 'Product Description', value: '2x Conference Room Chairs (Azure)', status: 'ok' },
    { label: 'Issue Type', value: 'Freight Damage — Upholstery Tear', status: 'ok' },
    { label: 'Label / SKU', value: 'CC-AZ-2024 (mismatch with CC-AZ-2025)', status: 'warning' },
    { label: 'Box / Packaging Photo', value: 'Not provided', status: 'missing' },
];

const CLAIM_LOG_ENTRIES = [
    'ClaimSubmissionAgent: Initializing claim package CLM-2026-114...',
    'ClaimSubmissionAgent: Forwarding 2 evidence photos to manufacturer portal...',
    'ClaimSubmissionAgent: Photos uploaded — SHA256 hashes recorded for audit trail.',
    'ClaimSubmissionAgent: Compiling issue description with AI damage taxonomy...',
    'ClaimSubmissionAgent: Ship-to address verified: 742 Evergreen Terrace, Suite 200, Springfield, IL 62704',
    'ClaimSubmissionAgent: Claim package submitted to manufacturer (AIS Furniture Corp).',
    'ClaimSubmissionAgent: Acknowledgement received — replacement unit in production queue.',
    'ClaimSubmissionAgent: Dashboard updated. Stakeholders notified via digest.',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MACPunchList() {
    const { currentStep, nextStep, isPaused } = useDemo();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // ── Pause-aware timer support ──
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

    // Step 3.1 state
    const [extractionPhase, setExtractionPhase] = useState<'email' | 'extracting' | 'review'>('email');
    const [extractedCount, setExtractedCount] = useState(0);
    const [expandedValidation, setExpandedValidation] = useState<string | null>(null);
    const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());
    const [qrScanning, setQrScanning] = useState(false);
    const [qrDone, setQrDone] = useState(false);
    const [uploadingLabel, setUploadingLabel] = useState(false);
    const [labelUploaded, setLabelUploaded] = useState(false);
    const [uploadingEvidence, setUploadingEvidence] = useState(false);
    const [uploadedPhotos, setUploadedPhotos] = useState(0);
    const [uploadDone, setUploadDone] = useState(false);

    // Step 3.2 state
    const [approvedLabor, setApprovedLabor] = useState(false);
    const [editingRule, setEditingRule] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({
        'repair-threshold': '510',
        'labor-hours': '6',
    });
    const [validatedRules, setValidatedRules] = useState<Set<string>>(new Set());

    // Step 3.3 state
    const [claimLogs, setClaimLogs] = useState<string[]>([]);
    const [claimProgress, setClaimProgress] = useState(0);
    const [claimPhase, setClaimPhase] = useState<'processing' | 'acknowledged' | 'complete'>('processing');
    const [showLiability, setShowLiability] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDealerRequest, setShowDealerRequest] = useState(false);
    const [dealerMessage, setDealerMessage] = useState('');
    const [dealerPhotos, setDealerPhotos] = useState<string[]>([]);
    const [dealerRequestSent, setDealerRequestSent] = useState(false);

    // Auto-select first item when entering Flow 3
    useEffect(() => {
        if (['3.1', '3.2', '3.3'].includes(currentStep?.id)) {
            setSelectedItem('item-1');
        }
    }, [currentStep?.id]);

    // Step 3.1: Email extraction animation → then validation checklist
    useEffect(() => {
        if (currentStep?.id !== '3.1') return;
        setExtractionPhase('email');
        setExtractedCount(0);
        setExpandedValidation(null);
        setResolvedItems(new Set());
        setQrScanning(false);
        setQrDone(false);
        setUploadingLabel(false);
        setLabelUploaded(false);
        setUploadingEvidence(false);
        setUploadedPhotos(0);
        setUploadDone(false);

        const timeouts: ReturnType<typeof setTimeout>[] = [];
        // 2s: Start extracting
        timeouts.push(setTimeout(pauseAware(() => setExtractionPhase('extracting')), 2000));
        // 2.5s–6.5s: Fields appear one-by-one
        EXTRACTION_FIELDS.forEach((_, i) => {
            timeouts.push(setTimeout(pauseAware(() => setExtractedCount(i + 1)), 2500 + i * 1000));
        });
        // 8s: Transition to review (validation checklist)
        timeouts.push(setTimeout(pauseAware(() => setExtractionPhase('review')), 8000));
        // 10s: Auto-expand label-photo
        timeouts.push(setTimeout(pauseAware(() => setExpandedValidation('label-photo')), 10000));

        return () => timeouts.forEach(clearTimeout);
    }, [currentStep?.id]);

    // Step 3.2: Reset on enter
    useEffect(() => {
        if (currentStep?.id !== '3.2') return;
        setApprovedLabor(false);
        setEditingRule(null);
        setValidatedRules(new Set());
    }, [currentStep?.id]);

    // Step 3.3: Auto-animated claim submission
    useEffect(() => {
        if (currentStep?.id !== '3.3') {
            setClaimLogs([]);
            setClaimProgress(0);
            setClaimPhase('processing');
            setShowLiability(false);
            setShowReviewModal(false);
            setShowDealerRequest(false);
            setDealerMessage('');
            setDealerPhotos([]);
            setDealerRequestSent(false);
            return;
        }
        setClaimLogs([]);
        setClaimProgress(0);
        setClaimPhase('processing');
        setShowLiability(false);
        setShowReviewModal(false);
        setShowDealerRequest(false);
        setDealerMessage('');
        setDealerPhotos([]);
        setDealerRequestSent(false);

        const timeouts: ReturnType<typeof setTimeout>[] = [];
        CLAIM_LOG_ENTRIES.forEach((entry, i) => {
            timeouts.push(setTimeout(pauseAware(() => {
                setClaimLogs(prev => [...prev, entry]);
                setClaimProgress(Math.round(((i + 1) / CLAIM_LOG_ENTRIES.length) * 100));
            }), (i + 1) * 2000));
        });
        // Acknowledged
        timeouts.push(setTimeout(pauseAware(() => setClaimPhase('acknowledged')), CLAIM_LOG_ENTRIES.length * 2000 + 1000));
        // Show liability
        timeouts.push(setTimeout(pauseAware(() => setShowLiability(true)), CLAIM_LOG_ENTRIES.length * 2000 + 2500));

        return () => timeouts.forEach(clearTimeout);
    }, [currentStep?.id]);

    const handleResolveItem = (itemId: string) => {
        setResolvedItems(prev => new Set(prev).add(itemId));
        setExpandedValidation(null);
    };

    const statusIcon = (status: ValidationStatus, resolved: boolean) => {
        if (resolved) return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'present') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'needs_clarification') return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
    };

    const statusBg = (status: ValidationStatus, resolved: boolean) => {
        if (resolved) return 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20';
        if (status === 'present') return 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20';
        if (status === 'needs_clarification') return 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20';
        return 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20';
    };

    const effectiveRuleStatus = (rule: BusinessRule): 'pass' | 'warning' | 'fail' => {
        if (validatedRules.has(rule.id)) return 'pass';
        return rule.status;
    };

    const ruleStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
        if (status === 'pass') return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        if (status === 'warning') return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
        return <XMarkIcon className="w-5 h-5 text-red-500" />;
    };

    const ruleStatusBg = (status: 'pass' | 'warning' | 'fail') => {
        if (status === 'pass') return 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20';
        if (status === 'warning') return 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20';
        return 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20';
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Punch List Items */}
            <div className="w-full lg:w-1/3 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4">Active Punch List</h3>

                    {[
                        { id: 'item-1', priority: 'High', priorityColor: 'red', title: 'Damaged Upholstery on Delivery', product: '2x Conference Room Chairs (Azure)', time: '2 hours ago', evidence: [{ icon: CameraIcon, text: '2 Photos' }, { icon: Bars4Icon, text: 'Barcode Scanned' }] },
                        { id: 'item-2', priority: 'Medium', priorityColor: 'amber', title: 'Scratched glass partition', product: '1x Acoustic Panel (Frosted)', time: '4 hours ago', evidence: [{ icon: CameraIcon, text: '1 Photo' }] },
                        { id: 'item-3', priority: 'Low', priorityColor: 'green', title: 'Missing hardware packet', product: '1x Workstation Desk', time: '1 day ago', evidence: [{ icon: DocumentTextIcon, text: 'Installer Note' }] },
                    ].map((item, idx) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item.id)}
                            className={`${idx > 0 ? 'mt-3' : ''} p-3 rounded-lg border cursor-pointer transition-all ${selectedItem === item.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-brand-300'}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-${item.priorityColor}-100 text-${item.priorityColor}-700 dark:bg-${item.priorityColor}-900/30 dark:text-${item.priorityColor}-400`}>
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5" /> {item.priority} Priority
                                </span>
                                <span className="text-xs text-zinc-500">{item.time}</span>
                            </div>
                            <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{item.title}</h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{item.product}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs font-medium text-zinc-500">
                                {item.evidence.map((ev, i) => (
                                    <span key={i} className="flex items-center gap-1"><ev.icon className="w-4 h-4" /> {ev.text}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Step-conditional content */}
            <div className="w-full lg:w-2/3">
                {/* ═══ STEP 3.1: Request Intake & AI Validation ═══ */}
                {currentStep?.id === '3.1' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                            <AIAgentAvatar />
                            <div>
                                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">IntakeValidationAgent</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">
                                    {extractionPhase === 'email' ? 'Incoming service request detected' : extractionPhase === 'extracting' ? 'Extracting and evaluating fields...' : 'Reviewing request REQ-PL-2026-047'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">

                            {/* ── Email Extraction Phase ── */}
                            {extractionPhase !== 'review' && (
                                <div className="animate-in fade-in duration-500">
                                    {/* Email Card */}
                                    <div className="p-4 bg-card border border-border rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-2 mb-3">
                                            <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Incoming Email</span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex gap-2"><span className="font-bold text-muted-foreground w-14 shrink-0">From:</span><span className="text-foreground">carlos.rivera@acmecorp.com</span></div>
                                            <div className="flex gap-2"><span className="font-bold text-muted-foreground w-14 shrink-0">Subject:</span><span className="font-bold text-foreground">Service Request — Damaged Conference Chairs (ORD-2055)</span></div>
                                            <div className="flex gap-2 mt-2"><span className="font-bold text-muted-foreground w-14 shrink-0">Body:</span><span className="text-muted-foreground leading-relaxed">We received 2 Azure conference chairs from order ORD-2055 with visible upholstery damage on both units. The damage appears to have occurred during shipping — the packaging was partially crushed. Attached are photos of the damage, the product label, and relevant documentation. Please process a warranty claim.</span></div>
                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                                                <PaperClipIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <span className="text-muted-foreground font-medium">3 attachments:</span>
                                                {['damage-photo-1.jpg', 'damage-photo-2.jpg', 'product-label.jpg'].map((f, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-medium text-foreground">{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Extraction Progress */}
                                    {extractionPhase === 'extracting' && (
                                        <div className="mt-4 space-y-2 animate-in fade-in duration-300">
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                                <SparklesIcon className="w-3.5 h-3.5" />
                                                AI Extraction in Progress
                                            </p>
                                            {EXTRACTION_FIELDS.map((field, i) => (
                                                i < extractedCount && (
                                                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-border animate-in fade-in slide-in-from-left-4 duration-300">
                                                        {field.status === 'ok' ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" /> : field.status === 'warning' ? <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" /> : <XMarkIcon className="w-4 h-4 text-red-500 shrink-0" />}
                                                        <span className="text-xs font-medium text-muted-foreground w-36 shrink-0">{field.label}</span>
                                                        <span className={`text-xs font-semibold ${field.status === 'ok' ? 'text-foreground' : field.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{field.value}</span>
                                                    </div>
                                                )
                                            ))}
                                            {extractedCount < EXTRACTION_FIELDS.length && (
                                                <div className="flex items-center gap-2 px-3 py-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">Scanning...</span>
                                                </div>
                                            )}
                                            {extractedCount >= EXTRACTION_FIELDS.length && (
                                                <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in fade-in duration-300">
                                                    <div className="flex items-start gap-2">
                                                        <AIAgentAvatar />
                                                        <p className="text-xs text-indigo-900 dark:text-indigo-300">
                                                            Extraction complete — <span className="font-bold">2 items need expert attention</span>. Label shows potential SKU mismatch and no box photo was provided. Transitioning to validation checklist...
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Validation Checklist Phase ── */}
                            {extractionPhase === 'review' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Request Context Card */}
                                    <div className="p-4 bg-card border border-border rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Request Context</p>
                                            <ConfidenceScoreBadge score={72} label="Completeness" size="sm" />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Request ID', value: 'REQ-PL-2026-047' },
                                                { label: 'Product', value: '2x Conf. Room Chairs Azure' },
                                                { label: 'Requester', value: 'Site Supervisor — Floor 2' },
                                                { label: 'Order Ref', value: 'ORD-2055, Line 3' },
                                            ].map((item, i) => (
                                                <div key={i} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2.5">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                                                    <p className="text-xs font-bold text-foreground">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Validation Checklist */}
                                    <div className="mt-4">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Validation Checklist — Required Documentation</p>
                                        <div className="space-y-2">
                                            {VALIDATION_ITEMS.map((item) => {
                                                const resolved = resolvedItems.has(item.id);
                                                const isExpanded = expandedValidation === item.id;
                                                return (
                                                    <div key={item.id}>
                                                        <button
                                                            onClick={() => setExpandedValidation(isExpanded ? null : item.id)}
                                                            className={`w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 ${statusBg(item.status, resolved)} ${isExpanded ? 'ring-2 ring-brand-500/30' : ''}`}
                                                        >
                                                            {statusIcon(item.status, resolved)}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-foreground">{item.label}</span>
                                                                    {resolved && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold">Resolved</span>}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                                                            </div>
                                                            <ConfidenceScoreBadge score={item.confidence} size="sm" />
                                                        </button>

                                                        {/* ── Label Photo: QR Scan ── */}
                                                        {isExpanded && item.id === 'label-photo' && !resolved && (
                                                            <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <AIAgentAvatar />
                                                                    <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                                </div>

                                                                {!qrScanning && !qrDone && !uploadingLabel && !labelUploaded && (
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <button
                                                                            onClick={() => {
                                                                                setQrScanning(true);
                                                                                setTimeout(pauseAware(() => { setQrScanning(false); setQrDone(true); }), 2500);
                                                                            }}
                                                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <QrCodeIcon className="w-3.5 h-3.5" />
                                                                            Scan QR Code
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setUploadingLabel(true);
                                                                                setTimeout(pauseAware(() => { setUploadingLabel(false); setLabelUploaded(true); }), 2000);
                                                                            }}
                                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5"
                                                                        >
                                                                            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                                                                            Upload Label
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleResolveItem(item.id)}
                                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                        >
                                                                            Accept As-Is
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* QR Scanning Animation */}
                                                                {qrScanning && (
                                                                    <div className="mt-3 animate-in fade-in duration-300">
                                                                        <div className="relative w-full max-w-[280px] aspect-square rounded-lg overflow-hidden border-2 border-indigo-300 dark:border-indigo-500/40 bg-zinc-100 dark:bg-zinc-800">
                                                                            <img src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop" alt="Furniture label with QR code" className="w-full h-full object-cover" />
                                                                            {/* Scanning overlay */}
                                                                            <div className="absolute inset-0 bg-indigo-500/10">
                                                                                <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 animate-[scan_2s_ease-in-out_infinite]" style={{ animation: 'scan 2s ease-in-out infinite' }} />
                                                                            </div>
                                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-3 py-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="flex gap-1">
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                                                    </div>
                                                                                    <span className="text-[11px] text-white font-medium">Scanning QR code...</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* QR Done */}
                                                                {qrDone && (
                                                                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                        <div className="p-3 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-lg">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                                                <span className="text-xs font-bold text-green-700 dark:text-green-400">QR Decoded: CC-AZ-2025 — SKU verified</span>
                                                                            </div>
                                                                            <p className="text-[11px] text-green-600 dark:text-green-400/80 ml-6">Product label matches order reference. Model year variant confirmed.</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleResolveItem(item.id)}
                                                                            className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* Upload Label Animation */}
                                                                {uploadingLabel && (
                                                                    <div className="mt-3 animate-in fade-in duration-300">
                                                                        <div className="relative w-full max-w-[280px] h-[180px] rounded-lg overflow-hidden border-2 border-blue-300 dark:border-blue-500/40 bg-zinc-100 dark:bg-zinc-800">
                                                                            <img src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&h=200&fit=crop" alt="Furniture product label" className="w-full h-full object-cover opacity-60" />
                                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                                                                <ArrowUpTrayIcon className="w-8 h-8 text-white mb-2 animate-bounce" />
                                                                                <span className="text-[11px] text-white font-medium">Uploading label image...</span>
                                                                                <div className="mt-2 w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                                                    <div className="h-full bg-blue-400 rounded-full animate-[upload_2s_ease-in-out_forwards]" style={{ animation: 'upload 2s ease-in-out forwards' }} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Upload Label Done */}
                                                                {labelUploaded && (
                                                                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="relative w-[100px] h-[100px] rounded-lg overflow-hidden border border-green-300 dark:border-green-500/30 shrink-0">
                                                                                <img src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=100&h=100&fit=crop" alt="Uploaded label" className="w-full h-full object-cover" />
                                                                                <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                    <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="p-2.5 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-lg">
                                                                                    <div className="flex items-center gap-2 mb-1">
                                                                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                                                        <span className="text-xs font-bold text-green-700 dark:text-green-400">Label uploaded — CC-AZ-2025 identified</span>
                                                                                    </div>
                                                                                    <p className="text-[11px] text-green-600 dark:text-green-400/80 ml-6">Product label image attached to request. SKU cross-referenced with order.</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleResolveItem(item.id)}
                                                                            className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* ── Box Photo: Multi-File Upload ── */}
                                                        {isExpanded && item.id === 'box-photo' && !resolved && (
                                                            <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <AIAgentAvatar />
                                                                    <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                                </div>

                                                                {!uploadingEvidence && !uploadDone && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setUploadingEvidence(true);
                                                                            setUploadedPhotos(0);
                                                                            setTimeout(pauseAware(() => setUploadedPhotos(1)), 800);
                                                                            setTimeout(pauseAware(() => setUploadedPhotos(2)), 1600);
                                                                            setTimeout(pauseAware(() => setUploadedPhotos(3)), 2400);
                                                                            setTimeout(pauseAware(() => { setUploadingEvidence(false); setUploadDone(true); }), 3000);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md transition-colors flex items-center gap-1.5"
                                                                    >
                                                                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                                                                        Upload Evidence
                                                                    </button>
                                                                )}

                                                                {/* Upload Progress */}
                                                                {(uploadingEvidence || uploadDone) && (
                                                                    <div className="mt-3 space-y-2">
                                                                        <div className="flex items-center gap-3">
                                                                            {[
                                                                                { src: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=100&h=100&fit=crop', alt: 'Office chair packaging 1' },
                                                                                { src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop', alt: 'Office chair packaging 2' },
                                                                                { src: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=100&h=100&fit=crop', alt: 'Office chair packaging 3' },
                                                                            ].map((img, i) => (
                                                                                i < uploadedPhotos && (
                                                                                    <div key={i} className="relative w-[80px] h-[80px] rounded-lg overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-300">
                                                                                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                                                                                        <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                            <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            ))}
                                                                            {uploadingEvidence && uploadedPhotos < 3 && (
                                                                                <div className="w-[80px] h-[80px] rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center">
                                                                                    <div className="flex gap-1">
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {uploadDone && (
                                                                            <div className="animate-in fade-in duration-300">
                                                                                <div className="p-2.5 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-lg flex items-center gap-2">
                                                                                    <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                                                                    <span className="text-xs font-bold text-green-700 dark:text-green-400">3 evidence photos uploaded</span>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleResolveItem(item.id)}
                                                                                    className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                                >
                                                                                    Accept
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* ── Generic Items (order-number, line-number, issue-photo) ── */}
                                                        {isExpanded && item.aiSuggestion && !resolved && item.id !== 'label-photo' && item.id !== 'box-photo' && (
                                                            <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <AIAgentAvatar />
                                                                    <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleResolveItem(item.id)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                                >
                                                                    Accept
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Contact Requester Card */}
                                    <div className="mt-4 p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <DemoAvatar name="Carlos Rivera" size="md" />
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Carlos Rivera</p>
                                                <p className="text-xs text-muted-foreground">Site Supervisor — Facilities</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground">
                                                <PhoneIcon className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground">
                                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => nextStep()}
                                            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Validate & Continue
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3.2: Labor Reimbursement Review ═══ */}
                {currentStep?.id === '3.2' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                            <AIAgentAvatar />
                            <div>
                                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">LaborReimbursementAgent</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">Validating installer quote for REQ-PL-2026-047</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">
                            {/* Labor Header Card */}
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            Labor Reimbursement Requested: Yes
                                        </span>
                                    </div>
                                    <ConfidenceScoreBadge score={87} label="Validation" size="sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Installer</p>
                                        <p className="text-xs font-bold text-foreground">ProInstall LLC</p>
                                    </div>
                                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Certification</p>
                                        <p className="text-xs font-bold text-green-600 dark:text-green-400">Verified — Since 2019</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Breakdown */}
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Quote Breakdown</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Repair</p>
                                            <p className="text-xs text-muted-foreground">6 hrs @ $85/hr</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">$510.00</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Trip Charge</p>
                                            <p className="text-xs text-muted-foreground">Zone 3 — Standard rate</p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">$175.00</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/10 border-2 border-brand-200 dark:border-brand-500/30 rounded-lg">
                                        <p className="text-sm font-bold text-brand-700 dark:text-brand-400">Grand Total</p>
                                        <p className="text-lg font-bold text-brand-700 dark:text-brand-400">$685.00</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Business Rules Checklist */}
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Business Rules Validation</p>
                                <div className="space-y-2">
                                    {BUSINESS_RULES.map((rule) => {
                                        const eff = effectiveRuleStatus(rule);
                                        const isValidated = validatedRules.has(rule.id);
                                        const suggestions = AI_RULE_SUGGESTIONS[rule.id] || [];
                                        return (
                                        <div key={rule.id} className={`p-3 rounded-lg border transition-all duration-500 ${ruleStatusBg(eff)}`}>
                                            <div className="flex items-center gap-3">
                                                {ruleStatusIcon(eff)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">{rule.label}</span>
                                                        {isValidated ? (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold">Validated</span>
                                                        ) : rule.status === 'warning' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold">Warning</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {isValidated ? `Adjusted to ${editValues[rule.id]} — expert validated` : rule.detail}
                                                    </p>
                                                </div>
                                                {rule.editable && !isValidated && editingRule !== rule.id && (
                                                    <button
                                                        onClick={() => setEditingRule(rule.id)}
                                                        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-muted-foreground"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Inline Edit Form + AI Suggestions */}
                                            {editingRule === rule.id && (
                                                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-500/20 animate-in slide-in-from-top-2 fade-in duration-200">
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-medium text-muted-foreground">
                                                            {rule.id === 'repair-threshold' ? 'Adjusted Amount ($)' : 'Adjusted Hours'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editValues[rule.id] || ''}
                                                            onChange={(e) => setEditValues(prev => ({ ...prev, [rule.id]: e.target.value }))}
                                                            className="w-24 px-2 py-1 text-sm border border-border rounded-md bg-white dark:bg-zinc-800 text-foreground focus:ring-1 focus:ring-brand-500 focus:outline-none"
                                                        />
                                                        <button
                                                            onClick={() => { setValidatedRules(prev => new Set(prev).add(rule.id)); setEditingRule(null); }}
                                                            className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-md transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingRule(null)}
                                                            className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-foreground text-xs font-bold rounded-md transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    {/* AI Suggestion Chips */}
                                                    {suggestions.length > 0 && (
                                                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                                                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                                                <SparklesIcon className="w-3.5 h-3.5" />
                                                                AI Suggestions
                                                            </span>
                                                            {suggestions.map((s) => (
                                                                <button
                                                                    key={s.value}
                                                                    onClick={() => setEditValues(prev => ({ ...prev, [rule.id]: s.value }))}
                                                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
                                                                >
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Approve / Reject / Edit Quote */}
                            <div className="flex items-center gap-3 pt-2">
                                {!approvedLabor ? (
                                    <>
                                        <button
                                            onClick={() => setApprovedLabor(true)}
                                            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button className="px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg transition-colors">
                                            Reject
                                        </button>
                                        <button className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-foreground text-xs font-bold rounded-lg transition-colors">
                                            Edit Quote
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Labor quote approved
                                        </div>
                                        <div className="flex-1" />
                                        <button
                                            onClick={() => nextStep()}
                                            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Approve & Submit Claim
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3.3: Claim Submission & Tracking ═══ */}
                {currentStep?.id === '3.3' && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        {/* AI Context Header */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2">
                            <AIAgentAvatar />
                            <div>
                                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-300">ClaimSubmissionAgent</span>
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">Assembling claim CLM-2026-114</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px] scrollbar-micro">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-muted-foreground">Claim Assembly Progress</p>
                                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{claimProgress}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
                                        style={{ width: `${claimProgress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Agent Log Terminal */}
                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 max-h-[220px] overflow-y-auto scrollbar-micro">
                                <div className="space-y-1.5">
                                    {claimLogs.map((log, i) => (
                                        <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-4 fade-in duration-300">
                                            <span className="text-zinc-600 font-mono text-[10px] mt-0.5 select-none shrink-0">[{String(i + 1).padStart(2, '0')}]</span>
                                            <span className={`text-[11px] font-mono ${i === claimLogs.length - 1 ? 'text-green-400 animate-pulse' : 'text-zinc-400'}`}>
                                                {log}
                                            </span>
                                        </div>
                                    ))}
                                    {claimProgress < 100 && (
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-zinc-600 font-mono text-[10px]">[..]</span>
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Claim Package Summary — 3-col grid */}
                            {claimProgress >= 60 && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Claim Package Summary</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <PhotoIcon className="w-4 h-4 text-blue-500" />
                                                <p className="text-xs font-bold text-foreground">Photos Forwarded</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">2 evidence photos + 1 label photo uploaded with SHA256 verification</p>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DocumentTextIcon className="w-4 h-4 text-amber-500" />
                                                <p className="text-xs font-bold text-foreground">Issue Description</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Freight handling damage — upholstery tear on 2x Conference Room Chairs (Azure)</p>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPinIcon className="w-4 h-4 text-green-500" />
                                                <p className="text-xs font-bold text-foreground">Ship-To Address</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground">742 Evergreen Terrace, Suite 200, Springfield, IL 62704</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Acknowledgement Card */}
                            {claimPhase === 'acknowledged' && (
                                <div className="p-4 bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-start gap-3">
                                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-green-800 dark:text-green-300">Claim Acknowledged</p>
                                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                                Replacement unit in production — <span className="font-bold">estimated delivery 8 business days</span>. Claim reference: CLM-2026-114.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tracking Timeline */}
                            {claimPhase === 'acknowledged' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Shipment Tracking</p>
                                    <div className="flex items-center gap-0">
                                        {[
                                            { label: 'Submitted', done: true },
                                            { label: 'Acknowledged', done: true },
                                            { label: 'In Production', active: true },
                                            { label: 'Shipped', done: false },
                                            { label: 'Delivered', done: false },
                                        ].map((node, i, arr) => (
                                            <React.Fragment key={i}>
                                                <div className="flex flex-col items-center gap-1.5 flex-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${node.done ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : node.active ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-500/30' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'}`}>
                                                        {node.done ? <CheckCircleIcon className="w-4 h-4" /> : node.active ? <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-zinc-400" />}
                                                    </div>
                                                    <span className={`text-[10px] font-medium text-center ${node.done ? 'text-green-600 dark:text-green-400' : node.active ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>{node.label}</span>
                                                </div>
                                                {i < arr.length - 1 && (
                                                    <div className={`h-0.5 flex-1 -mt-5 ${node.done ? 'bg-green-300 dark:bg-green-600/50' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Liability Analysis */}
                            {showLiability && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <LiabilityAnalysisPanel
                                        carrierLiability={65}
                                        mfgLiability={35}
                                        reasoning="Based on photo evidence: upholstery damage pattern consistent with impact during transit (65% carrier). Packaging analysis shows insufficient protective wrapping around chair arms, suggesting partial manufacturer responsibility (35%). Serial SN-2025-88712 confirmed within warranty period."
                                    />
                                </div>
                            )}

                            {/* Dashboard integration note */}
                            {claimPhase === 'acknowledged' && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-border animate-in fade-in duration-300">
                                    <CubeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-xs text-muted-foreground">Claim visible on Warranty dashboard. Sales rep, PM, and facilities coordinator have been notified via digest.</span>
                                </div>
                            )}

                            {/* CTA */}
                            {showLiability && (
                                <div className="flex justify-end gap-3 pt-2 animate-in fade-in duration-300">
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 border border-border"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        Review Changes
                                    </button>
                                    <button
                                        onClick={() => nextStep()}
                                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Approve and Send to Client
                                    </button>
                                </div>
                            )}

                            {/* Review Changes Modal */}
                            {showReviewModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowReviewModal(false)}>
                                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto scrollbar-micro mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
                                        {/* Modal Header */}
                                        <div className="px-5 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 rounded-t-2xl z-10">
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">Expert Submission Review</h3>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">REQ-PL-2026-047 — CLM-2026-114</p>
                                            </div>
                                            <button onClick={() => setShowReviewModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                <XMarkIcon className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        </div>

                                        <div className="p-5 space-y-5">
                                            {/* Section 1: Validation Results */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Validation Results</p>
                                                <div className="space-y-1.5">
                                                    {VALIDATION_ITEMS.map((item) => {
                                                        const resolved = resolvedItems.has(item.id);
                                                        return (
                                                            <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                                                {resolved || item.status === 'present'
                                                                    ? <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                                                    : item.status === 'needs_clarification'
                                                                        ? <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                                                        : <XMarkIcon className="w-4 h-4 text-red-500 shrink-0" />
                                                                }
                                                                <span className="text-xs font-medium text-foreground flex-1">{item.label}</span>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${resolved || item.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.status === 'needs_clarification' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                    {resolved ? 'Resolved' : item.status === 'present' ? 'Present' : item.status === 'needs_clarification' ? 'Clarified' : 'Missing'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Section 2: Labor Decision */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Labor Decision</p>
                                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Installer</span>
                                                        <span className="text-xs font-bold text-foreground">ProInstall LLC (Certified)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Repair Amount</span>
                                                        <span className="text-xs font-bold text-foreground">${editValues['repair-threshold'] || '510'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Labor Hours</span>
                                                        <span className="text-xs font-bold text-foreground">{editValues['labor-hours'] || '6'} hrs</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Trip Charge</span>
                                                        <span className="text-xs font-bold text-foreground">$175.00 (Zone 3)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                                        <span className="text-xs font-bold text-foreground">Status</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Approved</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Section 3: Claim Package */}
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Claim Package</p>
                                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Claim ID</span>
                                                        <span className="text-xs font-bold text-foreground">CLM-2026-114</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Evidence</span>
                                                        <span className="text-xs font-bold text-foreground">2 photos + 1 label + SHA256</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Ship-To</span>
                                                        <span className="text-xs font-bold text-foreground">742 Evergreen Terrace, Springfield</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Liability Split</span>
                                                        <span className="text-xs font-bold text-foreground">Carrier 65% / Manufacturer 35%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Manufacturer</span>
                                                        <span className="text-xs font-bold text-foreground">AIS Furniture Corp</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                                        <span className="text-xs font-bold text-foreground">Status</span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Acknowledged — 8 days ETA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Request to Dealer Section */}
                                        {showDealerRequest && !dealerRequestSent && (
                                            <div className="mx-5 mb-3 p-3 border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 rounded-xl space-y-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                                                <div className="flex items-center gap-2">
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Request Additional Info from Dealer</p>
                                                </div>
                                                <textarea
                                                    value={dealerMessage}
                                                    onChange={(e) => setDealerMessage(e.target.value)}
                                                    placeholder="Describe what additional information or evidence you need from the dealer..."
                                                    className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-white dark:bg-zinc-900 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none resize-none"
                                                    rows={3}
                                                />
                                                <div className="flex items-center justify-between">
                                                    <button
                                                        onClick={() => {
                                                            if (dealerPhotos.length < 3) {
                                                                const photoUrls = [
                                                                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
                                                                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&h=100&fit=crop',
                                                                    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop',
                                                                ];
                                                                setDealerPhotos(prev => [...prev, photoUrls[prev.length]]);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <PaperClipIcon className="w-3.5 h-3.5" />
                                                        Attach Photo {dealerPhotos.length > 0 && `(${dealerPhotos.length})`}
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { setShowDealerRequest(false); setDealerMessage(''); setDealerPhotos([]); }}
                                                            className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => setDealerRequestSent(true)}
                                                            disabled={!dealerMessage.trim()}
                                                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[10px] font-bold rounded-lg transition-colors"
                                                        >
                                                            Send Request
                                                        </button>
                                                    </div>
                                                </div>
                                                {dealerPhotos.length > 0 && (
                                                    <div className="flex gap-2 pt-1">
                                                        {dealerPhotos.map((url, i) => (
                                                            <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border animate-in fade-in zoom-in-90 duration-300">
                                                                <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                                                                <button
                                                                    onClick={() => setDealerPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                                                                >
                                                                    <XMarkIcon className="w-2.5 h-2.5 text-white" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Sent Confirmation */}
                                        {dealerRequestSent && (
                                            <div className="mx-5 mb-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">Request sent to dealer</p>
                                                </div>
                                                <p className="text-[11px] text-green-600/80 dark:text-green-400/70 mt-1 ml-6">The dealer will be notified and can respond with additional evidence or clarifications.</p>
                                            </div>
                                        )}

                                        {/* Modal Footer */}
                                        <div className="px-5 py-3 border-t border-border flex justify-between sticky bottom-0 bg-white dark:bg-zinc-900 rounded-b-2xl">
                                            {!showDealerRequest && !dealerRequestSent && (
                                                <button
                                                    onClick={() => setShowDealerRequest(true)}
                                                    className="flex items-center gap-1.5 px-3 py-2 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    Request to Dealer
                                                </button>
                                            )}
                                            {(showDealerRequest || dealerRequestSent) && <div />}
                                            <button
                                                onClick={() => setShowReviewModal(false)}
                                                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Default: No step active — show empty state */}
                {!['3.1', '3.2', '3.3'].includes(currentStep?.id) && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl min-h-[400px]">
                        <ExclamationTriangleIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h4 className="text-lg font-medium text-zinc-900 dark:text-white">Select a Punch List Item</h4>
                        <p className="text-sm text-zinc-500 max-w-sm mt-2">Choose an item from the left to view installer reports, photos, and AI-suggested warranty actions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
