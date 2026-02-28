import React from 'react';
import {
    BarChart3,
    Users,
    Settings,
    Bell,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    Sparkles,
    Zap,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Bot,
    Loader2,
    FileText,
    BrainCircuit,
    Cpu
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { useTheme } from 'strata-design-system';
import AgentPipelineStrip from './AgentPipelineStrip';
import type { AgentStep } from './AgentPipelineStrip';
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge';

const COLUMNS = [
    { id: 'awaiting', title: 'Awaiting Validation', count: 12 },
    { id: 'active', title: 'Active Processing', count: 5 },
    { id: 'completed', title: 'Recently Completed', count: 28 },
];

const CARDS = [
    { id: 1, title: 'Apex Furniture RFQ #1029', dealer: 'Apex Furniture', status: 'Requires Expert Review', column: 'awaiting', priority: 'high', aiInsight: 'Extracted 200 Task Chairs from attachments. Freight calculation for multiple delivery zones requires manual routing approval.' },
    { id: 2, title: 'Herman Miller Q1 Proj', dealer: 'HM Partners', status: 'Paused', column: 'active', priority: 'medium', aiInsight: 'Inventory check suggests substitution for SKU-X99 to avoid 2-week delay' },
    { id: 3, title: 'Retailer Group Sync', dealer: 'Multiple', status: 'Normal', column: 'awaiting', priority: 'low' },
    { id: 4, title: 'Office Depot Reconcile', dealer: 'OD Solutions', status: 'Auto-Processing', column: 'active', priority: 'high', aiInsight: 'Agent #29 is resolving 14 duplicate line items' },
    { id: 5, title: 'PO #ORD-2055 vs ACK', dealer: 'Global Workspace', status: 'Delta Match Exception', column: 'awaiting', priority: 'critical', aiInsight: 'Delta Engine flagged 2 exceptions: Freight cost mismatch and Line 2 item substitution.' },
    { id: 6, title: 'Invoice #INV-9001', dealer: 'AutoManufacture Co.', status: 'Document Processing', column: 'active', priority: 'high', aiInsight: 'AI classified as INVOICE. Routed to 3-Way Match Engine for PO/ACK/Invoice reconciliation.' }
];

export default function DealerMonitorKanban({ onNavigate }: { onNavigate?: (page: string) => void }) {
    const { theme } = useTheme();
    const { currentStep, nextStep } = useDemo();
    const [agentProgress, setAgentProgress] = React.useState(0);
    const [agentLogs, setAgentLogs] = React.useState<string[]>([]);
    const [pipelineAgents, setPipelineAgents] = React.useState<AgentStep[]>([]);
    const [confidenceFields, setConfidenceFields] = React.useState<{ field: string; score: number }[]>([]);

    React.useEffect(() => {
        if (currentStep.id === '1.2') {
            setAgentProgress(0);
            setAgentLogs(['Initializing Intelligence Engine...']);
            setPipelineAgents([]);
            setConfidenceFields([]);

            const timeline = [
                { delay: 1000, log: 'EmailIntakeAgent: Parsed RFQ email.' },
                { delay: 2500, log: 'OCR/TextExtractAgent: Extracted 200 items from PDF.' },
                { delay: 4000, log: 'DataNormalizationAgent: Normalizing product codes...' },
                { delay: 5500, log: 'ValidationAgent: Flagged missing routing info.' },
                { delay: 7000, log: 'QuoteBuilderAgent: Drafted Quote. Requires Expert Review.' }
            ];

            timeline.forEach(({ delay, log }, index) => {
                setTimeout(() => {
                    setAgentProgress((index + 1) * 20);
                    setAgentLogs(prev => [...prev, log]);
                }, delay);
            });
        } else if (currentStep.id === '1.3') {
            // Normalization step — shows agent pipeline strip + field confidence
            setAgentProgress(0);
            setAgentLogs(['Initializing Normalization Pipeline...']);
            setConfidenceFields([]);
            setPipelineAgents([
                { id: 'email', name: 'EmailIntake', status: 'done' },
                { id: 'ocr', name: 'OCR Extract', status: 'done' },
                { id: 'parser', name: 'Parser', status: 'running' },
                { id: 'normalizer', name: 'Normalizer', status: 'pending' },
            ]);

            const timeline = [
                { delay: 1200, log: 'Parser: Tokenizing extracted text fields...' },
                { delay: 2800, log: 'Parser: Mapped 200 line items to catalog schema.' },
                { delay: 4200, log: 'Normalizer: Resolving product codes against master catalog...' },
                { delay: 6000, log: 'Normalizer: Complete. Field confidence scores generated.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                setTimeout(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    // Update pipeline agent statuses progressively
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
                }, delay);
            });
        } else if (currentStep.id === '1.4') {
            // Quote Draft step — shows QuoteBuilderAgent branching
            setAgentProgress(0);
            setAgentLogs(['Initializing QuoteBuilder Agent...']);
            setPipelineAgents([
                { id: 'email', name: 'EmailIntake', status: 'done' },
                { id: 'ocr', name: 'OCR Extract', status: 'done' },
                { id: 'normalizer', name: 'Normalizer', status: 'done' },
                { id: 'quotebuilder', name: 'QuoteBuilder', status: 'running' },
            ]);
            setConfidenceFields([]);

            const timeline = [
                { delay: 1000, log: 'QuoteBuilder: Loading normalized line items...' },
                { delay: 2500, log: 'QuoteBuilder: Applying pricing rules and discounts...' },
                { delay: 4000, log: 'QuoteBuilder: Freight zone routing failed — multi-zone delivery.' },
                { delay: 5500, log: 'QuoteBuilder: Draft complete. Flagged for Expert Attention.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                setTimeout(() => {
                    setAgentProgress((index + 1) * 25);
                    setAgentLogs(prev => [...prev, log]);

                    if (index === 3) {
                        setPipelineAgents(prev => prev.map(a =>
                            a.id === 'quotebuilder' ? { ...a, status: 'done' as const, detail: 'Needs Attention' } : a
                        ));
                    }
                }, delay);
            });
        } else if (currentStep.id === '2.2') {
            // Normalization/Linking for Flow 2
            setAgentProgress(0);
            setAgentLogs(['Initializing ERP Normalization Pipeline...']);
            setPipelineAgents([
                { id: 'erp', name: 'ERPConnector', status: 'running' },
                { id: 'normalizer', name: 'Normalizer', status: 'pending' },
                { id: 'ack', name: 'ACKIngest', status: 'pending' },
                { id: 'linker', name: 'EntityLinker', status: 'pending' },
            ]);
            setConfidenceFields([]);

            const timeline = [
                { delay: 1000, log: 'ERPConnectorAgent: Ingesting eManage ONE ACK.' },
                { delay: 2500, log: 'DataNormalizationAgent: Normalizing PO vs ACK formats...' },
                { delay: 4000, log: 'ACKIngestAgent: Parsing acknowledgment line items.' },
                { delay: 5500, log: 'EntityLinkerAgent: Linked PO #ORD-2055 ↔ ACK #ACK-2055.' },
                { delay: 7000, log: 'Pipeline Complete. Ready for Delta Engine.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                setTimeout(() => {
                    setAgentProgress((index + 1) * 20);
                    setAgentLogs(prev => [...prev, log]);

                    // Progressive pipeline status
                    const statusMap: Record<number, AgentStep[]> = {
                        0: [
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'normalizer', name: 'Normalizer', status: 'running' },
                            { id: 'ack', name: 'ACKIngest', status: 'pending' },
                            { id: 'linker', name: 'EntityLinker', status: 'pending' },
                        ],
                        2: [
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'normalizer', name: 'Normalizer', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'linker', name: 'EntityLinker', status: 'running' },
                        ],
                        3: [
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'normalizer', name: 'Normalizer', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'linker', name: 'EntityLinker', status: 'done' },
                        ],
                    };
                    if (statusMap[index]) setPipelineAgents(statusMap[index]);
                }, delay);
            });
        } else if (currentStep.id === '2.3') {
            // Delta Engine — comparison step
            setAgentProgress(0);
            setAgentLogs(['Initializing Delta Engine...']);
            setPipelineAgents([]);
            setConfidenceFields([]);

            const timeline = [
                { delay: 1000, log: 'DeltaEngine: Loading PO #ORD-2055 (4 lines).' },
                { delay: 2500, log: 'DeltaEngine: Loading ACK #ACK-2055 (4 lines).' },
                { delay: 4000, log: 'DeltaEngine: Comparing line items...' },
                { delay: 5500, log: 'DeltaEngine: EXCEPTION — Freight cost mismatch ($45 → $150).' },
                { delay: 7000, log: 'DeltaEngine: EXCEPTION — Line 2 item substitution (SKU-A → SKU-B).' },
                { delay: 8500, log: 'DiscrepancyResolver: 2 exceptions require Expert Review.' }
            ];

            timeline.forEach(({ delay, log }, index) => {
                setTimeout(() => {
                    setAgentProgress((index + 1) * 16.6);
                    setAgentLogs(prev => [...prev, log]);
                }, delay);
            });
        } else if (currentStep.id === '3.1') {
            // Document classification — Flow 3
            setAgentProgress(0);
            setAgentLogs(['Initializing Document Intake Pipeline...']);
            setPipelineAgents([
                { id: 'docintake', name: 'DocIntake', status: 'running' },
                { id: 'ocr', name: 'OCR', status: 'pending' },
                { id: 'parser', name: 'Parser', status: 'pending' },
                { id: 'classifier', name: 'Classifier', status: 'pending' },
                { id: 'linker', name: 'EntityLinker', status: 'pending' },
            ]);
            setConfidenceFields([]);

            const timeline = [
                { delay: 1000, log: 'DocIntakeAgent: Received document upload (PDF, 3 pages).' },
                { delay: 2200, log: 'OCRAgent: Extracting text from scanned invoice...' },
                { delay: 3500, log: 'ParserAgent: Structured 12 fields from invoice text.' },
                { delay: 5000, log: 'ClassifierAgent: Document TYPE → INVOICE (confidence: 97%).' },
                { delay: 6500, log: 'EntityLinkerAgent: Linked to PO #ORD-2055 and ACK #ACK-2055.' },
                { delay: 8000, log: 'Router: Routed to 3-Way Match Engine.' },
            ];

            timeline.forEach(({ delay, log }, index) => {
                setTimeout(() => {
                    setAgentProgress((index + 1) * 16.6);
                    setAgentLogs(prev => [...prev, log]);

                    const statusMap: Record<number, AgentStep[]> = {
                        0: [
                            { id: 'docintake', name: 'DocIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR', status: 'running' },
                            { id: 'parser', name: 'Parser', status: 'pending' },
                            { id: 'classifier', name: 'Classifier', status: 'pending' },
                            { id: 'linker', name: 'EntityLinker', status: 'pending' },
                        ],
                        2: [
                            { id: 'docintake', name: 'DocIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR', status: 'done' },
                            { id: 'parser', name: 'Parser', status: 'done' },
                            { id: 'classifier', name: 'Classifier', status: 'running' },
                            { id: 'linker', name: 'EntityLinker', status: 'pending' },
                        ],
                        4: [
                            { id: 'docintake', name: 'DocIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR', status: 'done' },
                            { id: 'parser', name: 'Parser', status: 'done' },
                            { id: 'classifier', name: 'Classifier', status: 'done' },
                            { id: 'linker', name: 'EntityLinker', status: 'done' },
                        ],
                    };
                    if (statusMap[index]) setPipelineAgents(statusMap[index]);
                }, delay);
            });
        }
    }, [currentStep.id]);

    const displayCards = CARDS.filter(c => {
        if (c.id === 5 && !['2.2', '2.3'].includes(currentStep.id)) return false;
        if (c.id === 6 && currentStep.id !== '3.1') return false;
        return true;
    });

    return (
        <div className="bg-zinc-950 text-zinc-100 font-sans selection:bg-primary selection:text-primary-foreground">
            <main className="p-6 space-y-6 flex flex-col">
                {/* Summary Bar — Adapted from Transactions collapsed KPI */}
                <div className="bg-zinc-900 backdrop-blur-md rounded-2xl p-4 border border-zinc-800 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                        {[
                            { icon: <Clock size={18} />, value: '12', label: 'Awaiting Review', color: 'text-amber-400 bg-amber-500/10' },
                            { icon: <Bot size={18} />, value: '4', label: 'Active Agents', color: 'text-blue-400 bg-blue-500/10' },
                            { icon: <CheckCircle2 size={18} />, value: '28', label: 'Completed Today', color: 'text-green-400 bg-green-500/10' },
                            { icon: <Zap size={18} />, value: '$892K', label: 'Queue Value', color: 'text-indigo-400 bg-indigo-500/10' },
                        ].map((kpi, i) => (
                            <div key={i} className="flex items-center gap-3 min-w-fit">
                                <div className={`flex items-center justify-center w-9 h-9 rounded-full ${kpi.color}`}>
                                    {kpi.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-semibold text-zinc-100 leading-none">{kpi.value}</span>
                                    <span className="text-[10px] text-zinc-500 mt-1 font-medium">{kpi.label}</span>
                                </div>
                                {i < 3 && <div className="h-8 w-px bg-zinc-800 ml-4 hidden xl:block opacity-50" />}
                            </div>
                        ))}
                    </div>
                    <div className="w-px h-12 bg-zinc-800 hidden xl:block mx-2" />
                    {/* Quick Actions */}
                    <div className="flex items-center gap-1 min-w-max pl-4 border-l border-zinc-800 xl:border-none xl:pl-0">
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors" title="Filter">
                            <Filter size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors" title="Search">
                            <Search size={18} />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors" title="Settings">
                            <Settings size={18} />
                        </button>
                        <div className="w-px h-8 bg-zinc-800 mx-1" />
                        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-sm">
                            <Plus size={14} />
                            New Batch
                        </button>
                    </div>
                </div>

                {/* Kanban Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden">
                    {COLUMNS.map(column => (
                        <div key={column.id} className="flex flex-col gap-4 overflow-hidden">
                            <div className="flex items-center justify-between mb-1 px-2">
                                <h4 className="font-medium text-zinc-100 flex items-center gap-2">
                                    {column.title}
                                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">{column.count}</span>
                                </h4>
                                <MoreHorizontal size={16} className="text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-micro bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                                {displayCards.filter(card => card.column === column.id).map(card => (
                                    <div key={card.id} className={`bg-zinc-800 border border-zinc-700 p-4 rounded-2xl hover:border-zinc-600 transition-all cursor-pointer group shadow-sm ${card.priority === 'critical' ? 'ring-1 ring-red-500/20' : ''}`}>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between">
                                                <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ring-1 ring-inset ${card.priority === 'critical' ? 'bg-red-500/10 text-red-400 ring-red-500/30' :
                                                    card.priority === 'high' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/30' :
                                                        'bg-zinc-700 text-zinc-400 ring-zinc-600'
                                                    }`}>
                                                    {card.priority}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={12} className="text-zinc-500" />
                                                    <span className="text-[10px] text-zinc-500 font-medium">4h ago</span>
                                                </div>
                                            </div>

                                            <div id={card.aiInsight ? "kanban-ai-card" : ""} className="space-y-1">
                                                <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-primary transition-colors">{card.title}</h4>
                                                <p className="text-xs text-zinc-500 font-medium">{card.dealer}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-zinc-800 bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-300">
                                                            {i === 1 ? 'AI' : 'JD'}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex-1" />
                                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                                                    <CheckCircle2 size={12} className="text-green-400" />
                                                    <span>4 items ready</span>
                                                </div>
                                            </div>

                                            {card.aiInsight && card.id !== 1 && (
                                                <div className="mt-2 pt-3 border-t border-zinc-700/50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <Sparkles size={12} />
                                                        <span className="text-[10px] font-medium uppercase tracking-wider">AI Insight</span>
                                                    </div>
                                                    <p className="text-[11px] leading-relaxed text-zinc-400 italic bg-zinc-900 p-3 rounded-xl border border-zinc-700/50">
                                                        "{card.aiInsight}"
                                                    </p>
                                                    <button onClick={() => card.id === 1 ? alert("Routing to Expert Hub for manual review...") : undefined} className="w-full flex items-center justify-center gap-2 text-xs font-medium text-primary hover:underline group/btn">
                                                        {card.id === 1 ? 'Route to Expert Hub' : 'Apply Recommendation'}
                                                        <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Step 1.2: AI Processing Simulation for Card 1 */}
                                            {card.id === 1 && currentStep.id === '1.2' && (
                                                <div className="mt-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Bot className={`text-indigo-400 ${agentProgress < 100 ? 'animate-pulse' : ''}`} size={14} />
                                                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                                                            {agentProgress < 100 ? 'AI Agents Processing...' : 'Processing Complete'}
                                                        </span>
                                                        {agentProgress < 100 && <Loader2 size={12} className="text-zinc-500 animate-spin ml-auto" />}
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${agentProgress}%` }}
                                                        />
                                                    </div>

                                                    {/* Agent Logs */}
                                                    <div className="space-y-1.5 text-[10px] font-mono text-zinc-500 max-h-[100px] overflow-y-auto pr-1 scrollbar-micro">
                                                        {agentLogs.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 fade-in">
                                                                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                                                                <span className={i === agentLogs.length - 1 && agentProgress < 100 ? 'text-zinc-300 animate-pulse' : ''}>{log}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {agentProgress === 100 && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-700">
                                                            <div className="flex items-center justify-between text-xs mb-2">
                                                                <span className="text-zinc-500">Confidence Score:</span>
                                                                <span className="text-amber-400 font-medium">82% (Needs Attention)</span>
                                                            </div>
                                                            <p className="text-[11px] leading-relaxed text-zinc-400 italic bg-zinc-800 p-3 rounded-xl border border-zinc-700/50 mb-3">
                                                                "{card.aiInsight}"
                                                            </p>
                                                            <button
                                                                onClick={nextStep}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                            >
                                                                Route to Expert Hub
                                                                <ArrowUpRight size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Step 1.3: Normalization Pipeline for Card 1 */}
                                            {card.id === 1 && currentStep.id === '1.3' && (
                                                <div className="mt-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <BrainCircuit className={`text-green-400 ${agentProgress < 100 ? 'animate-pulse' : ''}`} size={14} />
                                                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                                                            {agentProgress < 100 ? 'Normalization Pipeline...' : 'Normalization Complete'}
                                                        </span>
                                                        {agentProgress < 100 && <Loader2 size={12} className="text-zinc-500 animate-spin ml-auto" />}
                                                    </div>

                                                    {/* Agent Pipeline Strip */}
                                                    <div className="mb-3">
                                                        <AgentPipelineStrip agents={pipelineAgents} accentColor="green" />
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-green-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${agentProgress}%` }}
                                                        />
                                                    </div>

                                                    {/* Agent Logs */}
                                                    <div className="space-y-1.5 text-[10px] font-mono text-zinc-500 max-h-[80px] overflow-y-auto pr-1 scrollbar-micro">
                                                        {agentLogs.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 fade-in">
                                                                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                                                                <span className={i === agentLogs.length - 1 && agentProgress < 100 ? 'text-zinc-300 animate-pulse' : ''}>{log}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Field Confidence Grid */}
                                                    {confidenceFields.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-700">
                                                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Field Confidence</span>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {confidenceFields.map(f => (
                                                                    <div key={f.field} className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-1.5">
                                                                        <span className="text-[11px] text-zinc-400">{f.field}</span>
                                                                        <ConfidenceScoreBadge score={f.score} size="sm" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {/* Handoff Indicator */}
                                                            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/50">
                                                                <div className="flex items-center -space-x-1.5">
                                                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                                                        <Bot size={10} className="text-indigo-400" />
                                                                    </div>
                                                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                                                        <Users size={10} className="text-amber-400" />
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] text-zinc-400">AI Agent + Expert will draft the quote</span>
                                                            </div>

                                                            <button
                                                                onClick={nextStep}
                                                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                            >
                                                                Continue to Quote Draft
                                                                <ArrowUpRight size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Step 1.4: Quote Builder Agent for Card 1 */}
                                            {card.id === 1 && currentStep.id === '1.4' && (
                                                <div className="mt-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FileText className={`text-amber-400 ${agentProgress < 100 ? 'animate-pulse' : ''}`} size={14} />
                                                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                                                            {agentProgress < 100 ? 'QuoteBuilder Agent...' : 'Quote Draft Ready'}
                                                        </span>
                                                        {agentProgress < 100 && <Loader2 size={12} className="text-zinc-500 animate-spin ml-auto" />}
                                                    </div>

                                                    {/* Agent Pipeline Strip */}
                                                    <div className="mb-3">
                                                        <AgentPipelineStrip agents={pipelineAgents} accentColor="amber" />
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-amber-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${agentProgress}%` }}
                                                        />
                                                    </div>

                                                    {/* Agent Logs */}
                                                    <div className="space-y-1.5 text-[10px] font-mono text-zinc-500 max-h-[80px] overflow-y-auto pr-1 scrollbar-micro">
                                                        {agentLogs.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 fade-in">
                                                                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                                                                <span className={i === agentLogs.length - 1 && agentProgress < 100 ? 'text-zinc-300 animate-pulse' : ''}>{log}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {agentProgress === 100 && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-700 space-y-3">
                                                            {/* Branching result */}
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 p-3">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                                        <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">Needs Attention</span>
                                                                    </div>
                                                                    <p className="text-[10px] text-zinc-500">Multi-zone freight routing requires manual approval</p>
                                                                </div>
                                                            </div>
                                                            {/* Handoff Indicator */}
                                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/50">
                                                                <div className="flex items-center -space-x-1.5">
                                                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                                                                        <Bot size={10} className="text-indigo-400" />
                                                                    </div>
                                                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                                                                        <Users size={10} className="text-amber-400" />
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] text-zinc-400">Expert + AI Agent will resolve discrepancies</span>
                                                            </div>

                                                            <button
                                                                onClick={nextStep}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                            >
                                                                Route to Expert Hub (HITL)
                                                                <ArrowUpRight size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Step 2.2: Normalization/Linking for Card 5 */}
                                            {card.id === 5 && currentStep.id === '2.2' && (
                                                <div className="mt-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Cpu className={`text-blue-400 ${agentProgress < 100 ? 'animate-pulse' : ''}`} size={14} />
                                                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                                                            {agentProgress < 100 ? 'ERP Normalization Pipeline...' : 'Normalization Complete'}
                                                        </span>
                                                        {agentProgress < 100 && <Loader2 size={12} className="text-zinc-500 animate-spin ml-auto" />}
                                                    </div>

                                                    {/* Agent Pipeline Strip */}
                                                    <div className="mb-3">
                                                        <AgentPipelineStrip agents={pipelineAgents} accentColor="blue" />
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-blue-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${Math.min(agentProgress, 100)}%` }}
                                                        />
                                                    </div>

                                                    {/* Agent Logs */}
                                                    <div className="space-y-1.5 text-[10px] font-mono text-zinc-500 max-h-[100px] overflow-y-auto pr-1 scrollbar-micro">
                                                        {agentLogs.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 fade-in">
                                                                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                                                                <span className={i === agentLogs.length - 1 && agentProgress < 100 ? 'text-zinc-300 animate-pulse' : ''}>{log}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {agentProgress === 100 && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-700">
                                                            <div className="flex items-center justify-between text-xs mb-2">
                                                                <span className="text-zinc-500">Entity Link:</span>
                                                                <span className="text-blue-400 font-medium">PO #ORD-2055 ↔ ACK #ACK-2055</span>
                                                            </div>
                                                            <button
                                                                onClick={nextStep}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                            >
                                                                Run Delta Engine
                                                                <ArrowUpRight size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Step 2.3: Delta Engine Comparison for Card 5 */}
                                            {card.id === 5 && currentStep.id === '2.3' && (
                                                <div className="mt-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Cpu className={`text-red-400 ${agentProgress < 100 ? 'animate-pulse' : ''}`} size={14} />
                                                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                                                            {agentProgress < 100 ? 'Delta Engine Processing...' : 'Exceptions Found'}
                                                        </span>
                                                        {agentProgress < 100 && <Loader2 size={12} className="text-zinc-500 animate-spin ml-auto" />}
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-red-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${Math.min(agentProgress, 100)}%` }}
                                                        />
                                                    </div>

                                                    {/* Agent Logs */}
                                                    <div className="space-y-1.5 text-[10px] font-mono text-zinc-500 max-h-[100px] overflow-y-auto pr-1 scrollbar-micro">
                                                        {agentLogs.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 fade-in">
                                                                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                                                                <span className={i === agentLogs.length - 1 && agentProgress < 100 ? 'text-zinc-300 animate-pulse' : ''}>{log}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {agentProgress >= 99 && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-700">
                                                            {/* Flagged Deltas */}
                                                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Flagged Deltas</span>
                                                            <div className="space-y-1.5 mb-3">
                                                                <div className="flex items-center gap-2 text-[11px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                                    <span className="text-zinc-300">Substitution: SKU-A → SKU-B (Line 2)</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[11px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                                    <span className="text-zinc-300">Price: Freight $45 → $150 (+233%)</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    nextStep();
                                                                    onNavigate?.('ack-detail');
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                            >
                                                                Route to Expert Hub
                                                                <ArrowUpRight size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Step 3.1: Document Classification for Card 6 */}
                                            {card.id === 6 && currentStep.id === '3.1' && (
                                                <div className="mt-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900 animate-in fade-in zoom-in duration-500">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FileText className={`text-indigo-400 ${agentProgress < 100 ? 'animate-pulse' : ''}`} size={14} />
                                                        <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                                                            {agentProgress < 100 ? 'Document Intake Pipeline...' : 'Classification Complete'}
                                                        </span>
                                                        {agentProgress < 100 && <Loader2 size={12} className="text-zinc-500 animate-spin ml-auto" />}
                                                    </div>

                                                    {/* Agent Pipeline Strip */}
                                                    <div className="mb-3">
                                                        <AgentPipelineStrip agents={pipelineAgents} accentColor="purple" />
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="h-1 w-full bg-zinc-700 rounded-full overflow-hidden mb-3">
                                                        <div
                                                            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                                            style={{ width: `${Math.min(agentProgress, 100)}%` }}
                                                        />
                                                    </div>

                                                    {/* Agent Logs */}
                                                    <div className="space-y-1.5 text-[10px] font-mono text-zinc-500 max-h-[100px] overflow-y-auto pr-1 scrollbar-micro">
                                                        {agentLogs.map((log, i) => (
                                                            <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-2 fade-in">
                                                                <span className="text-zinc-600 mt-0.5">{'>'}</span>
                                                                <span className={i === agentLogs.length - 1 && agentProgress < 100 ? 'text-zinc-300 animate-pulse' : ''}>{log}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {agentProgress >= 99 && (
                                                        <div className="mt-3 pt-3 border-t border-zinc-700">
                                                            {/* Classification Result Badge */}
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 flex items-center gap-2">
                                                                    <span className="text-[10px] font-medium text-zinc-500 uppercase">Type:</span>
                                                                    <span className="text-[11px] font-medium text-indigo-400">INVOICE</span>
                                                                </div>
                                                                <ConfidenceScoreBadge score={97} label="Classification" size="sm" />
                                                            </div>
                                                            <p className="text-[11px] text-zinc-500 mb-3">
                                                                Routed to 3-Way Match Engine (PO + ACK + Invoice)
                                                            </p>
                                                            <button
                                                                onClick={() => {
                                                                    nextStep();
                                                                    onNavigate?.('transactions');
                                                                }}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm"
                                                            >
                                                                View 3-Way Match
                                                                <ArrowUpRight size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {card.id !== 1 && card.id !== 5 && card.id !== 6 && card.aiInsight && (
                                                <div className="mt-2 pt-3 border-t border-zinc-700/50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <Sparkles size={12} />
                                                        <span className="text-[10px] font-medium uppercase tracking-wider">AI Insight</span>
                                                    </div>
                                                    <p className="text-[11px] leading-relaxed text-zinc-400 italic bg-zinc-900 p-3 rounded-xl border border-zinc-700/50">
                                                        "{card.aiInsight}"
                                                    </p>
                                                    <button onClick={() => alert("Routing to Expert Hub for manual review...")} className="w-full flex items-center justify-center gap-2 text-xs font-medium text-primary hover:underline group/btn">
                                                        Route to Expert Hub
                                                        <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button className="w-full py-3 border border-dashed border-zinc-700 rounded-2xl text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 transition-all text-xs font-medium">
                                    + Add Item
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
