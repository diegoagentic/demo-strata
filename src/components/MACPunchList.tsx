import React, { useState, useEffect } from 'react';
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
    const { currentStep, nextStep } = useDemo();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    // Step 3.1 state
    const [expandedValidation, setExpandedValidation] = useState<string | null>(null);
    const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set());

    // Step 3.2 state
    const [approvedLabor, setApprovedLabor] = useState(false);
    const [editingRule, setEditingRule] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({
        'repair-threshold': '510',
        'labor-hours': '6',
    });

    // Step 3.3 state
    const [claimLogs, setClaimLogs] = useState<string[]>([]);
    const [claimProgress, setClaimProgress] = useState(0);
    const [claimPhase, setClaimPhase] = useState<'processing' | 'acknowledged' | 'complete'>('processing');
    const [showLiability, setShowLiability] = useState(false);

    // Auto-select first item when entering Flow 3
    useEffect(() => {
        if (['3.1', '3.2', '3.3'].includes(currentStep?.id)) {
            setSelectedItem('item-1');
        }
    }, [currentStep?.id]);

    // Step 3.1: Auto-expand label-photo after 2s
    useEffect(() => {
        if (currentStep?.id !== '3.1') return;
        setExpandedValidation(null);
        setResolvedItems(new Set());
        const t = setTimeout(() => setExpandedValidation('label-photo'), 2000);
        return () => clearTimeout(t);
    }, [currentStep?.id]);

    // Step 3.2: Reset on enter
    useEffect(() => {
        if (currentStep?.id !== '3.2') return;
        setApprovedLabor(false);
        setEditingRule(null);
    }, [currentStep?.id]);

    // Step 3.3: Auto-animated claim submission
    useEffect(() => {
        if (currentStep?.id !== '3.3') {
            setClaimLogs([]);
            setClaimProgress(0);
            setClaimPhase('processing');
            setShowLiability(false);
            return;
        }
        setClaimLogs([]);
        setClaimProgress(0);
        setClaimPhase('processing');
        setShowLiability(false);

        const timeouts: ReturnType<typeof setTimeout>[] = [];
        CLAIM_LOG_ENTRIES.forEach((entry, i) => {
            timeouts.push(setTimeout(() => {
                setClaimLogs(prev => [...prev, entry]);
                setClaimProgress(Math.round(((i + 1) / CLAIM_LOG_ENTRIES.length) * 100));
            }, (i + 1) * 2000));
        });
        // Acknowledged
        timeouts.push(setTimeout(() => setClaimPhase('acknowledged'), CLAIM_LOG_ENTRIES.length * 2000 + 1000));
        // Show liability
        timeouts.push(setTimeout(() => setShowLiability(true), CLAIM_LOG_ENTRIES.length * 2000 + 2500));

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
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2">Reviewing request REQ-PL-2026-047</span>
                            </div>
                        </div>

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px]">
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
                            <div>
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

                                                {/* Expandable AI Suggestion Panel */}
                                                {isExpanded && item.aiSuggestion && !resolved && (
                                                    <div className="ml-8 mt-2 p-3 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-lg animate-in slide-in-from-top-2 fade-in duration-300">
                                                        <div className="flex items-start gap-2 mb-3">
                                                            <AIAgentAvatar />
                                                            <p className="text-xs text-indigo-900 dark:text-indigo-300">{item.aiSuggestion}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleResolveItem(item.id)}
                                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-foreground text-xs font-bold rounded-md transition-colors">
                                                                Edit
                                                            </button>
                                                            <button className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-md transition-colors flex items-center gap-1">
                                                                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                                                                Contact Requester
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Contact Requester Card */}
                            <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
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
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => nextStep()}
                                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Validate & Continue
                                </button>
                            </div>
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

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px]">
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
                                    {BUSINESS_RULES.map((rule) => (
                                        <div key={rule.id} className={`p-3 rounded-lg border transition-all ${ruleStatusBg(rule.status)}`}>
                                            <div className="flex items-center gap-3">
                                                {ruleStatusIcon(rule.status)}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">{rule.label}</span>
                                                        {rule.status === 'warning' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold">Warning</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{rule.detail}</p>
                                                </div>
                                                {rule.editable && editingRule !== rule.id && (
                                                    <button
                                                        onClick={() => setEditingRule(rule.id)}
                                                        className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-muted-foreground"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Inline Edit Form */}
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
                                                            onClick={() => setEditingRule(null)}
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
                                                </div>
                                            )}
                                        </div>
                                    ))}
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

                        <div className="p-4 space-y-4 overflow-y-auto max-h-[700px]">
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
                                <div className="flex justify-end pt-2 animate-in fade-in duration-300">
                                    <button
                                        onClick={() => nextStep()}
                                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Complete Flow 3
                                    </button>
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
