import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    CheckCircle2,
    ArrowUpRight,
    Bot,
    FileText,
    Cpu,
    Sparkles,
    Users,
    SearchIcon,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import AgentPipelineStrip from '../simulations/AgentPipelineStrip';
import type { AgentStep } from '../simulations/AgentPipelineStrip';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';

// Steps that show the floating lupa panel
const PANEL_STEPS = ['1.2', '1.3', '1.4'];

interface DemoProcessPanelProps {
    onNavigate?: (page: string) => void;
}

// Delay before the lupa panel appears (audience sees the normal page first)
const PANEL_REVEAL_DELAY = 2025;

export default function DemoProcessPanel({ onNavigate }: DemoProcessPanelProps) {
    const { currentStep, nextStep, isDemoActive, isPaused } = useDemo();

    const [panelVisible, setPanelVisible] = useState(false);
    const [agentProgress, setAgentProgress] = useState(0);
    const [agentLogs, setAgentLogs] = useState<string[]>([]);
    const [pipelineAgents, setPipelineAgents] = useState<AgentStep[]>([]);
    const [confidenceFields, setConfidenceFields] = useState<{ field: string; score: number }[]>([]);

    // Ref tracks pause state so timer callbacks can check it without re-triggering effects
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    // Helper: wraps a callback so it waits while paused before executing
    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 300);
        };
    }, []);

    // Delayed panel reveal — audience sees the kanban first, then the lupa zooms in
    useEffect(() => {
        if (!isDemoActive || !PANEL_STEPS.includes(currentStep.id)) {
            setPanelVisible(false);
            return;
        }
        const revealTimer = setTimeout(() => setPanelVisible(true), PANEL_REVEAL_DELAY);
        return () => { clearTimeout(revealTimer); setPanelVisible(false); };
    }, [isDemoActive, currentStep.id]);

    // Reset + run timeline for each step (timelines shifted by PANEL_REVEAL_DELAY)
    useEffect(() => {
        if (!isDemoActive || !PANEL_STEPS.includes(currentStep.id)) return;

        // Reset
        setAgentProgress(0);
        setAgentLogs([]);
        setPipelineAgents([]);
        setConfidenceFields([]);

        const timers: ReturnType<typeof setTimeout>[] = [];
        // All timeline delays are offset so animations start after the panel appears
        const D = PANEL_REVEAL_DELAY;

        if (currentStep.id === '1.2') {
            // Show completed state when panel appears (processing happened in modal at 1.1)
            timers.push(setTimeout(pauseAware(() => {
                setAgentProgress(100);
                setPipelineAgents([
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'done', detail: '2 files' },
                    { id: 'parser', name: 'DataParser', status: 'done', detail: '200 items' },
                    { id: 'normalizer', name: 'Normalizer', status: 'done' },
                    { id: 'validator', name: 'Validator', status: 'done', detail: '82% confidence' },
                ]);
                setConfidenceFields([
                    { field: 'Product', score: 95 },
                    { field: 'Quantity', score: 88 },
                    { field: 'Ship-To', score: 92 },
                    { field: 'Freight', score: 42 },
                ]);
            }), D));
            // Auto-advance after panel is visible for ~27s (presenter explains extraction results)
            timers.push(setTimeout(pauseAware(() => nextStep()), D + 27000));

        } else if (currentStep.id === '1.3') {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing Normalization Pipeline...']);
                setPipelineAgents([
                    { id: 'email', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR Extract', status: 'done' },
                    { id: 'parser', name: 'Parser', status: 'running' },
                    { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 5400, log: 'Parser: Tokenizing extracted text fields...' },
                { delay: D + 12150, log: 'Parser: Mapped 200 line items to catalog schema.' },
                { delay: D + 20250, log: 'Normalizer: Resolving product codes against master catalog...' },
                { delay: D + 27000, log: 'Normalizer: Complete. Field confidence scores generated.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 1) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'parser' ? { ...a, status: 'done' as const } :
                            a.id === 'normalizer' ? { ...a, status: 'running' as const } : a
                        ));
                    }
                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'normalizer' ? { ...a, status: 'done' as const } : a
                        ));
                        setConfidenceFields([
                            { field: 'Product', score: 95 },
                            { field: 'Quantity', score: 88 },
                            { field: 'Ship-To', score: 92 },
                            { field: 'Freight', score: 42 },
                        ]);
                    }
                }), delay));
            });

        } else if (currentStep.id === '1.4') {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing QuoteBuilder Agent...']);
                setPipelineAgents([
                    { id: 'email', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR Extract', status: 'done' },
                    { id: 'normalizer', name: 'Normalizer', status: 'done' },
                    { id: 'quotebuilder', name: 'QuoteBuilder', status: 'running' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 5400, log: 'QuoteBuilder: Loading normalized line items...' },
                { delay: D + 12150, log: 'QuoteBuilder: Applying pricing rules and discounts...' },
                { delay: D + 20250, log: 'QuoteBuilder: Freight zone routing failed — multi-zone delivery.' },
                { delay: D + 27000, log: 'QuoteBuilder: Draft complete. Flagged for Expert Attention.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'quotebuilder' ? { ...a, status: 'done' as const, detail: 'Needs Attention' } : a
                        ));
                    }
                }), delay));
            });

        } else if (currentStep.id === '2.2') {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing ERP Normalization Pipeline...']);
                setPipelineAgents([
                    { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                    { id: 'norm', name: 'DataNorm', status: 'running' },
                    { id: 'ack', name: 'ACKIngest', status: 'pending' },
                    { id: 'comp', name: 'POvsACK', status: 'pending' },
                    { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                    { id: 'bo', name: 'Backorder', status: 'pending' },
                    { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                    { id: 'notif', name: 'Notification', status: 'pending' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 3375, log: 'ERPConnectorAgent: Acknowledgement data received from eManage ONE (EDI/855).' },
                { delay: D + 8100, log: 'DataNormalizationAgent: Mapping raw EDI fields to standard schema...' },
                { delay: D + 13500, log: 'AcknowledgementIngestAgent: Parsing 4 acknowledgement line items.' },
                { delay: D + 18900, log: 'DataNormalizationAgent: Unified 4 raw fields to standard model.' },
                { delay: D + 24300, log: 'EntityLinker: Linked PO #ORD-2055 ↔ Acknowledgement #ACK-2055. Ready for Delta Engine.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 20);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 0) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'running' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                    }
                    if (index === 2) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                    }
                    if (index === 4) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: 'EDI/855' },
                            { id: 'norm', name: 'DataNorm', status: 'done', detail: '4 fields mapped' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                        setConfidenceFields([
                            { field: 'Product SKU', score: 96 },
                            { field: 'Quantity', score: 100 },
                            { field: 'Unit Price', score: 94 },
                            { field: 'Freight', score: 72 },
                        ]);
                    }
                }), delay));
            });

        } else if (currentStep.id === '2.3') {
            timers.push(setTimeout(pauseAware(() => {
                setAgentLogs(['Initializing Delta Engine...']);
                setPipelineAgents([
                    { id: 'erp', name: 'ERPConnector', status: 'done' },
                    { id: 'norm', name: 'DataNorm', status: 'done' },
                    { id: 'ack', name: 'ACKIngest', status: 'done' },
                    { id: 'comp', name: 'POvsACK', status: 'running' },
                    { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                    { id: 'bo', name: 'Backorder', status: 'pending' },
                    { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                    { id: 'notif', name: 'Notification', status: 'pending' },
                ]);
            }), D));

            const timeline = [
                { delay: D + 2700, log: 'POvsACKAgent: Loading PO #ORD-2055 (4 lines).' },
                { delay: D + 6750, log: 'POvsACKAgent: Loading Acknowledgement #ACK-2055 (4 lines).' },
                { delay: D + 11475, log: 'POvsACKAgent: Line-by-line comparison in progress...' },
                { delay: D + 16200, log: 'POvsACKAgent: EXCEPTION — Line 2 substitution SKU-B→SKU-C.' },
                { delay: D + 20925, log: 'POvsACKAgent: EXCEPTION — Freight $45→$150 (+233%).' },
                { delay: D + 25650, log: 'DiscrepancyResolver: 2 exceptions flagged. Escalating to Expert Hub.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                timers.push(setTimeout(pauseAware(() => {
                    setAgentProgress((index + 1) * 16.6);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 3) {
                        setPipelineAgents([
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done', detail: '2 exceptions' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'running' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]);
                    }
                }), delay));
            });

        }

        return () => timers.forEach(clearTimeout);
    }, [isDemoActive, currentStep.id, nextStep, pauseAware]);

    // Don't render at all if not in a panel step
    if (!isDemoActive || !PANEL_STEPS.includes(currentStep.id)) return null;
    // Don't render until the reveal delay has passed — audience sees normal page first
    if (!panelVisible) return null;

    // ─── Step-specific config ───
    const stepConfig: Record<string, {
        icon: React.ReactNode;
        title: string;
        titleDone: string;
        accentColor: 'green' | 'amber' | 'blue' | 'purple';
        progressColor: string;
    }> = {
        '1.2': {
            icon: <Sparkles className="text-emerald-400 animate-pulse" size={18} />,
            title: 'Extraction Complete',
            titleDone: 'Extraction Complete',
            accentColor: 'green',
            progressColor: 'bg-emerald-500',
        },
        '1.3': {
            icon: <Sparkles className="text-green-400" size={18} />,
            title: 'Normalization Pipeline...',
            titleDone: 'Normalization Complete',
            accentColor: 'green',
            progressColor: 'bg-green-500',
        },
        '1.4': {
            icon: <Sparkles className="text-amber-400 animate-pulse" size={18} />,
            title: 'QuoteBuilder Agent...',
            titleDone: 'Quote Draft Ready',
            accentColor: 'amber',
            progressColor: 'bg-amber-500',
        },
        '2.2': {
            icon: <Cpu className="text-blue-400" size={18} />,
            title: 'ERP Normalization Pipeline...',
            titleDone: 'Normalization Complete',
            accentColor: 'blue',
            progressColor: 'bg-blue-500',
        },
        '2.3': {
            icon: <Cpu className="text-red-400" size={18} />,
            title: 'Delta Engine Processing...',
            titleDone: 'Comparison Complete — 2 Exceptions',
            accentColor: 'amber',
            progressColor: 'bg-red-500',
        },
    };

    const config = stepConfig[currentStep.id];
    const isDone = agentProgress >= 99;

    return (
        <div className="fixed inset-0 z-[101] flex items-center justify-end pointer-events-none">
            {/* Backdrop — fades in */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto animate-in fade-in duration-500" />

            {/* Floating Panel — Lupa zoom-in effect (no slide — feels like zoom, not modal) */}
            <div className="relative w-full max-w-2xl mx-4 mr-8 bg-white dark:bg-zinc-800 border border-indigo-500/30 ring-2 ring-indigo-500/50 rounded-2xl shadow-2xl shadow-indigo-500/15 pointer-events-auto animate-in zoom-in-95 fade-in duration-1000 overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-micro" style={{ transformOrigin: 'center center' }}>
                {/* Top glow bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isDone ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500'}`} />

                {/* Lupa badge */}
                <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100/80 dark:bg-zinc-800/80 border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm">
                    <SearchIcon size={12} className="text-zinc-500 dark:text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Detail View</span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center">
                            {config.icon}
                        </div>
                        {!isDone && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                        )}
                        {isDone && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                            {isDone ? config.titleDone : config.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Step {currentStep.id} — {currentStep.title}
                        </p>
                    </div>
                </div>

                {/* Source Badge for 2.2 */}
                {currentStep.id === '2.2' && (
                    <div className="px-6 pb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                            <Cpu size={10} />
                            eManage ONE (EDI/855)
                        </span>
                    </div>
                )}

                {/* Pipeline Strip */}
                {pipelineAgents.length > 0 && (
                    <div className="px-6 pb-3">
                        <AgentPipelineStrip agents={pipelineAgents} accentColor={config.accentColor} />
                    </div>
                )}

                {/* Progress Bar */}
                <div className="px-6 pb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                            {isDone ? 'All agents completed' : 'Processing...'}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{Math.min(Math.round(agentProgress), 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${isDone ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : config.progressColor}`}
                            style={{ width: `${Math.min(agentProgress, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Agent Logs */}
                {agentLogs.length > 0 && (
                    <div className="px-6 pb-4">
                        <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 max-h-[200px] overflow-y-auto scrollbar-micro">
                            <div className="space-y-2">
                                {agentLogs.map((log, i) => (
                                    <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-4 fade-in duration-300">
                                        <span className="text-zinc-600 font-mono text-[11px] mt-0.5 select-none">{'>'}</span>
                                        <span className={`text-[12px] font-mono ${i === agentLogs.length - 1 && !isDone ? 'text-zinc-800 dark:text-zinc-200 animate-pulse' : 'text-zinc-500 dark:text-zinc-500'}`}>
                                            {log}
                                        </span>
                                    </div>
                                ))}
                                {!isDone && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-zinc-600 font-mono text-[11px]">{'>'}</span>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Step-specific completion content ─── */}

                {/* Step 1.2: Extraction Summary */}
                {currentStep.id === '1.2' && (
                    <div className="px-6 pb-5 space-y-4">
                        {/* Extracted Data Table */}
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="text-zinc-500 dark:text-zinc-400" size={14} />
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Extracted Data</span>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Products', value: '200 Executive Task Chairs', badge: '200 items' },
                                    { label: 'Specs', value: 'Ergonomic features from PDF', badge: 'Parsed' },
                                    { label: 'Ship-To', value: '4 delivery zones mapped', badge: '4 zones' },
                                    { label: 'Freight', value: 'Multi-zone routing required', badge: 'Needs Review' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between bg-gray-100/60 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 w-16 shrink-0">{item.label}</span>
                                            <span className="text-[12px] text-zinc-600 dark:text-zinc-300 truncate">{item.value}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                                            item.badge === 'Needs Review'
                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                : 'bg-gray-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                                        }`}>{item.badge}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Field Confidence Grid */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {confidenceFields.map(f => (
                                    <div key={f.field} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg px-3 py-1.5">
                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{f.field}</span>
                                        <ConfidenceScoreBadge score={f.score} size="sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Automation Flow Diagram */}
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="text-indigo-400 animate-pulse" size={14} />
                                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Automation Flow</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-micro">
                                {[
                                    { icon: '📧', label: 'Email RFQ', sub: 'Detected', color: 'border-blue-500/30 bg-blue-500/5' },
                                    { icon: '📄', label: 'OCR Extract', sub: '2 files', color: 'border-purple-500/30 bg-purple-500/5' },
                                    { icon: '🔍', label: 'Data Parse', sub: '200 items', color: 'border-indigo-500/30 bg-indigo-500/5' },
                                    { icon: '🔗', label: 'Normalize', sub: 'Mapped', color: 'border-cyan-500/30 bg-cyan-500/5' },
                                    { icon: '⚡', label: 'Validate', sub: '82%', color: 'border-amber-500/30 bg-amber-500/5' },
                                ].map((step, i, arr) => (
                                    <React.Fragment key={i}>
                                        <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border ${step.color} min-w-[72px] shrink-0`}>
                                            <span className="text-base">{step.icon}</span>
                                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 text-center leading-tight">{step.label}</span>
                                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500">{step.sub}</span>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className="flex items-center shrink-0 px-0.5">
                                                <div className="w-4 h-px bg-zinc-300 dark:bg-zinc-600" />
                                                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-zinc-300 dark:border-l-zinc-600" />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* AI Attribution */}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/15">
                            <Sparkles size={12} className="text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">
                                5 AI agents processed this RFQ in 8.2s. Freight routing flagged for Expert review due to multi-zone complexity.
                            </p>
                        </div>

                        {/* Auto-advance indicator */}
                        <div className="flex items-center justify-center gap-2 text-[11px] text-indigo-400 animate-pulse">
                            <span>Auto-advancing to normalization...</span>
                            <ArrowUpRight size={14} />
                        </div>
                    </div>
                )}

                {/* Step 1.3: Confidence + Continue */}
                {currentStep.id === '1.3' && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Field Confidence Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            {confidenceFields.map(f => (
                                <div key={f.field} className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-lg px-3 py-2">
                                    <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{f.field}</span>
                                    <ConfidenceScoreBadge score={f.score} size="sm" />
                                </div>
                            ))}
                        </div>

                        {/* Handoff Indicator */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700/50">
                            <div className="flex items-center -space-x-1.5">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                    <Bot size={12} className="text-indigo-400" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                    <Users size={12} className="text-amber-400" />
                                </div>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">AI Agent + Expert will draft the quote</span>
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Continue to Quote Draft
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 1.4: Branching Result + Route to Expert */}
                {currentStep.id === '1.4' && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Branching Result */}
                        <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Needs Attention</span>
                            </div>
                            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">Multi-zone freight routing requires manual approval</p>
                        </div>

                        {/* Handoff */}
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200/50 dark:border-zinc-700/50">
                            <div className="flex items-center -space-x-1.5">
                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                    <Bot size={12} className="text-indigo-400" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                    <Users size={12} className="text-amber-400" />
                                </div>
                            </div>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Expert + AI Agent will resolve discrepancies</span>
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Route to Expert Hub (HITL)
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 2.2: Schema Mapping + Run Delta */}
                {currentStep.id === '2.2' && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Entity Link */}
                        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                            <span className="text-zinc-400 dark:text-zinc-500">Entity Link:</span>
                            <span className="text-blue-400 font-medium">PO #ORD-2055 ↔ Acknowledgement #ACK-2055</span>
                        </div>

                        {/* Schema Mapping Table */}
                        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-4 py-2 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Schema Mapping (Raw → Normalized)</span>
                            </div>
                            <table className="w-full text-[12px]">
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {[
                                        { raw: 'PO1*VP*ERG-5100', normalized: 'product_sku: ERG-5100' },
                                        { raw: 'PO1*25*EA', normalized: 'quantity: 25' },
                                        { raw: 'PO1*89.00', normalized: 'unit_price: $89.00' },
                                        { raw: 'PO1*FRT-0001*150', normalized: 'freight_charge: $150.00' },
                                    ].map((row, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2 font-mono text-zinc-400 dark:text-zinc-500">{row.raw}</td>
                                            <td className="px-2 text-zinc-600">→</td>
                                            <td className="px-4 py-2 font-mono text-blue-400">{row.normalized}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Confidence + AI */}
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                                <span className="text-[11px] text-indigo-400 font-medium">DataNormalizationAgent unified 4 raw fields to standard schema</span>
                            </div>
                            <ConfidenceScoreBadge score={94} label="Norm" />
                        </div>

                        <button
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Run Delta Engine
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Step 2.3: Comparison Table + Escalate */}
                {currentStep.id === '2.3' && isDone && (
                    <div className="px-6 pb-5 space-y-4 animate-in fade-in duration-300">
                        {/* Line-by-Line Comparison Table */}
                        <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden">
                            <div className="px-4 py-2 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Line-by-Line Comparison</span>
                            </div>
                            <table className="w-full text-[12px]">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-zinc-800">
                                        <th className="text-left px-4 py-1.5 text-zinc-400 dark:text-zinc-500 font-medium">Line</th>
                                        <th className="text-left px-4 py-1.5 text-zinc-400 dark:text-zinc-500 font-medium">Item</th>
                                        <th className="text-left px-4 py-1.5 text-zinc-400 dark:text-zinc-500 font-medium">PO</th>
                                        <th className="text-left px-4 py-1.5 text-zinc-400 dark:text-zinc-500 font-medium">Acknowledgement</th>
                                        <th className="text-left px-4 py-1.5 text-zinc-400 dark:text-zinc-500 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    <tr>
                                        <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">1</td>
                                        <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">Task Chair</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">ERG-5100</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">ERG-5100</td>
                                        <td className="px-4 py-2"><span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={12} /> Match</span></td>
                                    </tr>
                                    <tr className="bg-amber-500/5">
                                        <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">2</td>
                                        <td className="px-4 py-2 text-amber-700 dark:text-amber-300 font-medium">Desk</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">DSK-B</td>
                                        <td className="px-4 py-2 font-mono text-amber-400">DSK-C</td>
                                        <td className="px-4 py-2"><span className="text-amber-400 font-medium">Substitution</span></td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">3</td>
                                        <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">Armrest</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">ARM-4D10</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">ARM-4D10</td>
                                        <td className="px-4 py-2"><span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={12} /> Match</span></td>
                                    </tr>
                                    <tr className="bg-red-500/5">
                                        <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">4</td>
                                        <td className="px-4 py-2 text-red-700 dark:text-red-300 font-medium">Freight</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500 dark:text-zinc-400">$45</td>
                                        <td className="px-4 py-2 font-mono text-red-400">$150</td>
                                        <td className="px-4 py-2"><span className="text-red-400 font-medium">+233%</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Delta Summary */}
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">4 lines compared: <span className="text-green-400 font-medium">2 matches</span>, <span className="text-red-400 font-medium">2 exceptions</span></span>
                            <ConfidenceScoreBadge score={50} label="Match Rate" />
                        </div>

                        {/* AI Recommendation */}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Sparkles size={12} className="text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                            <span className="text-[11px] text-indigo-400">Substitution within catalog equivalents. Freight exceeds $50 guardrail — escalating to Expert Hub.</span>
                        </div>

                        <button
                            onClick={() => {
                                nextStep();
                                onNavigate?.('ack-detail');
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm hover:opacity-90"
                        >
                            Escalate 2 Exceptions to Expert Hub
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                        <Cpu size={14} />
                        <span>Strata Intelligence Engine v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
