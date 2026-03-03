import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    SparklesIcon,
    XMarkIcon,
    EnvelopeOpenIcon,
    DocumentTextIcon,
    TableCellsIcon,
    CpuChipIcon,
    CheckCircleIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import AgentPipelineStrip from '../simulations/AgentPipelineStrip';
import type { AgentStep } from '../simulations/AgentPipelineStrip';
import { useDemo } from '../../context/DemoContext';

interface AIProcessingModalProps {
    open: boolean;
    onComplete: () => void;
}

interface ProcessingLog {
    agent: string;
    message: string;
    type: 'info' | 'success' | 'extract';
}

const EXTRACTED_ITEMS = [
    { label: 'Product', value: '200 Executive Task Chairs', icon: '🪑' },
    { label: 'Spec File', value: 'Specs.pdf (1.4 MB) — Ergonomic features parsed', icon: '📄' },
    { label: 'Line Items', value: 'OrderData.csv — 200 items, 4 delivery zones', icon: '📊' },
    { label: 'Dealer', value: 'Apex Furniture (orders@apexfurniture.com)', icon: '🏢' },
    { label: 'Priority', value: 'Urgent — RFQ tagged high priority', icon: '🔴' },
    { label: 'Freight', value: 'Multi-zone routing required (4 locations)', icon: '🚚' },
];

export default function AIProcessingModal({ open, onComplete }: AIProcessingModalProps) {
    const { isPaused } = useDemo();
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<ProcessingLog[]>([]);
    const [pipeline, setPipeline] = useState<AgentStep[]>([]);
    const [phase, setPhase] = useState<'processing' | 'complete'>('processing');
    const [extractedCount, setExtractedCount] = useState(0);

    // Ref tracks pause state so timer callbacks can check without re-triggering effects
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    const pauseAware = useCallback((fn: () => void) => {
        return () => {
            if (!isPausedRef.current) { fn(); return; }
            const poll = setInterval(() => {
                if (!isPausedRef.current) { clearInterval(poll); fn(); }
            }, 300);
        };
    }, []);

    const reset = useCallback(() => {
        setProgress(0);
        setLogs([]);
        setPhase('processing');
        setExtractedCount(0);
        setPipeline([
            { id: 'intake', name: 'EmailIntake', status: 'running' },
            { id: 'ocr', name: 'OCR/TextExtract', status: 'pending' },
            { id: 'parser', name: 'DataParser', status: 'pending' },
            { id: 'normalizer', name: 'Normalizer', status: 'pending' },
            { id: 'validator', name: 'Validator', status: 'pending' },
        ]);
    }, []);

    useEffect(() => {
        if (!open) return;
        reset();

        const timeline: Array<{
            delay: number;
            log: ProcessingLog;
            progress: number;
            pipelineUpdate: AgentStep[];
        }> = [
            {
                delay: 1500,
                log: { agent: 'EmailIntakeAgent', message: 'Parsing email body — identified RFQ request with 2 attachments.', type: 'info' },
                progress: 10,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'running', detail: 'Parsing...' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'pending' },
                    { id: 'parser', name: 'DataParser', status: 'pending' },
                    { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                    { id: 'validator', name: 'Validator', status: 'pending' },
                ],
            },
            {
                delay: 4000,
                log: { agent: 'EmailIntakeAgent', message: 'Extracted sender: Apex Furniture, subject: RFQ for 200 Executive Task Chairs.', type: 'extract' },
                progress: 20,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'running' },
                    { id: 'parser', name: 'DataParser', status: 'pending' },
                    { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                    { id: 'validator', name: 'Validator', status: 'pending' },
                ],
            },
            {
                delay: 6500,
                log: { agent: 'OCR/TextExtract', message: 'Processing Specs.pdf — extracted ergonomic feature requirements and dimensions.', type: 'info' },
                progress: 35,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'running', detail: 'Specs.pdf' },
                    { id: 'parser', name: 'DataParser', status: 'pending' },
                    { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                    { id: 'validator', name: 'Validator', status: 'pending' },
                ],
            },
            {
                delay: 9000,
                log: { agent: 'OCR/TextExtract', message: 'Processing OrderData.csv — 200 line items with quantities, finishes, and ship-to addresses.', type: 'extract' },
                progress: 50,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'done', detail: '2 files' },
                    { id: 'parser', name: 'DataParser', status: 'running' },
                    { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                    { id: 'validator', name: 'Validator', status: 'pending' },
                ],
            },
            {
                delay: 11500,
                log: { agent: 'DataParser', message: 'Mapped 200 line items to catalog schema. Identified 4 delivery zones.', type: 'info' },
                progress: 65,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'done', detail: '2 files' },
                    { id: 'parser', name: 'DataParser', status: 'done', detail: '200 items' },
                    { id: 'normalizer', name: 'Normalizer', status: 'running' },
                    { id: 'validator', name: 'Validator', status: 'pending' },
                ],
            },
            {
                delay: 14000,
                log: { agent: 'Normalizer', message: 'Unified product codes, quantities, and shipping addresses to standard RFQ model.', type: 'info' },
                progress: 80,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'done', detail: '2 files' },
                    { id: 'parser', name: 'DataParser', status: 'done', detail: '200 items' },
                    { id: 'normalizer', name: 'Normalizer', status: 'done' },
                    { id: 'validator', name: 'Validator', status: 'running' },
                ],
            },
            {
                delay: 16500,
                log: { agent: 'Validator', message: 'Validation complete. Confidence: 82%. Flagged: multi-zone freight routing needs Expert review.', type: 'success' },
                progress: 100,
                pipelineUpdate: [
                    { id: 'intake', name: 'EmailIntake', status: 'done' },
                    { id: 'ocr', name: 'OCR/TextExtract', status: 'done', detail: '2 files' },
                    { id: 'parser', name: 'DataParser', status: 'done', detail: '200 items' },
                    { id: 'normalizer', name: 'Normalizer', status: 'done' },
                    { id: 'validator', name: 'Validator', status: 'done', detail: '82% confidence' },
                ],
            },
        ];

        const timers: ReturnType<typeof setTimeout>[] = [];

        timeline.forEach(({ delay, log, progress: p, pipelineUpdate }) => {
            timers.push(
                setTimeout(pauseAware(() => {
                    setProgress(p);
                    setLogs(prev => [...prev, log]);
                    setPipeline(pipelineUpdate);
                }), delay)
            );
        });

        // Show extracted items one by one after processing completes
        timers.push(
            setTimeout(pauseAware(() => {
                setPhase('complete');
            }), 18000)
        );

        EXTRACTED_ITEMS.forEach((_, i) => {
            timers.push(
                setTimeout(pauseAware(() => {
                    setExtractedCount(i + 1);
                }), 18500 + i * 500)
            );
        });

        // Auto-advance after showing results (presenter has time to explain)
        timers.push(
            setTimeout(pauseAware(() => {
                onComplete();
            }), 25000)
        );

        return () => timers.forEach(clearTimeout);
    }, [open, reset, onComplete, pauseAware]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700/50 rounded-2xl shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 fade-in duration-500 overflow-hidden">
                {/* Top glow bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                            </div>
                            {phase === 'processing' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                            )}
                            {phase === 'complete' && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                {phase === 'processing' ? 'AI Agent Pipeline — Processing RFQ' : 'Extraction Complete'}
                            </h3>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {phase === 'processing'
                                    ? '5 agents working on Apex Furniture RFQ'
                                    : '5 agents completed — RFQ data extracted and normalized'}
                            </p>
                        </div>
                    </div>
                    {phase === 'complete' && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                            <span className="text-[11px] font-bold text-emerald-400">Done</span>
                        </div>
                    )}
                </div>

                {/* Pipeline Strip */}
                <div className="px-6 pb-3">
                    <AgentPipelineStrip agents={pipeline} accentColor="purple" />
                </div>

                {/* Progress Bar */}
                <div className="px-6 pb-4">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                            {phase === 'processing' ? 'Processing...' : 'All agents completed'}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                                phase === 'complete'
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-500'
                            }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {phase === 'processing' ? (
                    /* Agent Logs */
                    <div className="px-6 pb-5">
                        <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 max-h-[200px] overflow-y-auto scrollbar-micro">
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-2 animate-in slide-in-from-left-4 fade-in duration-300"
                                    >
                                        <span className="text-zinc-600 font-mono text-[10px] mt-0.5 select-none">{'>'}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-[10px] font-bold mr-1.5 ${
                                                log.type === 'success' ? 'text-emerald-400' :
                                                log.type === 'extract' ? 'text-amber-400' : 'text-indigo-400'
                                            }`}>
                                                {log.agent}:
                                            </span>
                                            <span className={`text-[11px] font-mono ${
                                                i === logs.length - 1 && phase === 'processing'
                                                    ? 'text-zinc-800 dark:text-zinc-200'
                                                    : 'text-zinc-500'
                                            }`}>
                                                {log.message}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {phase === 'processing' && progress < 100 && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="text-zinc-600 font-mono text-[10px]">{'>'}</span>
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
                ) : (
                    /* Extracted Items Summary */
                    <div className="px-6 pb-5">
                        <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <DocumentTextIcon className="w-4 h-4 text-zinc-500" />
                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Extracted Data Summary</span>
                            </div>
                            <div className="space-y-2">
                                {EXTRACTED_ITEMS.slice(0, extractedCount).map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 animate-in slide-in-from-bottom-2 fade-in duration-300"
                                    >
                                        <span className="text-base shrink-0">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                                            <p className="text-[12px] text-zinc-800 dark:text-zinc-200 font-medium truncate">{item.value}</p>
                                        </div>
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 pb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <CpuChipIcon className="w-3.5 h-3.5" />
                        <span>Strata Intelligence Engine v2.0</span>
                    </div>
                    {phase === 'complete' && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 animate-pulse">
                            <span>Advancing to results</span>
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
