import {
    Settings,
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
    BrainCircuit,
    FileText,
    Cpu,
} from 'lucide-react';
import { useDemo } from '../../context/DemoContext';
import { useTheme } from 'strata-design-system';

// Mini preview config for each lupa step — matches DemoProcessPanel titles/content
const STEP_CARD_PREVIEW: Record<string, {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    detail: string;
    accentClass: string;
}> = {
    '1.2': {
        icon: <CheckCircle2 size={12} className="text-emerald-400" />,
        title: 'Extraction Complete',
        subtitle: '5 agents — 200 items extracted',
        detail: 'OCR + Parser processed 2 PDF attachments. 4 delivery zones mapped.',
        accentClass: 'border-emerald-500/20 bg-emerald-500/5',
    },
    '1.3': {
        icon: <BrainCircuit size={12} className="text-green-400" />,
        title: 'Normalization Pipeline',
        subtitle: '4 agents — Parser + Normalizer',
        detail: 'Mapping 200 line items to catalog schema. Generating confidence scores.',
        accentClass: 'border-green-500/20 bg-green-500/5',
    },
    '1.4': {
        icon: <FileText size={12} className="text-amber-400" />,
        title: 'QuoteBuilder Agent',
        subtitle: '4 agents — Building quote draft',
        detail: 'Applying pricing rules and discounts. Multi-zone freight routing required.',
        accentClass: 'border-amber-500/20 bg-amber-500/5',
    },
    '2.2': {
        icon: <Cpu size={12} className="text-blue-400" />,
        title: 'ERP Normalization',
        subtitle: '8 agents — EDI/855 from eManage ONE',
        detail: 'Mapping raw EDI fields to standard schema. Linking PO ↔ Acknowledgement entities.',
        accentClass: 'border-blue-500/20 bg-blue-500/5',
    },
    '2.3': {
        icon: <Cpu size={12} className="text-red-400" />,
        title: 'Delta Engine',
        subtitle: '8 agents — PO vs Acknowledgement comparison',
        detail: 'Line-by-line comparison in progress. Checking for substitutions and price deltas.',
        accentClass: 'border-red-500/20 bg-red-500/5',
    },
};

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
    { id: 5, title: 'PO #ORD-2055 vs Acknowledgement', dealer: 'Global Workspace', status: 'Delta Match Exception', column: 'awaiting', priority: 'critical', aiInsight: 'Delta Engine flagged 2 exceptions: Freight cost mismatch and Line 2 item substitution.' },
    { id: 6, title: 'Invoice #INV-9001', dealer: 'AutoManufacture Co.', status: 'Document Processing', column: 'active', priority: 'high', aiInsight: 'AI classified as INVOICE. Routed to 3-Way Match Engine for PO/Acknowledgement/Invoice reconciliation.' }
];

// Steps where each card gets a minimal "processing" indicator (detail is in DemoProcessPanel)
const CARD1_PANEL_STEPS = ['1.2', '1.3', '1.4'];
const CARD5_PANEL_STEPS = ['2.2', '2.3'];
const CARD6_PANEL_STEPS: string[] = [];

export default function DealerMonitorKanban(_props: { onNavigate?: (page: string) => void }) {
    const { theme } = useTheme();
    const { currentStep } = useDemo();

    const displayCards = CARDS.filter(c => {
        if (c.id === 5 && !['2.2', '2.3'].includes(currentStep.id)) return false;
        if (c.id === 6) return false;
        return true;
    });

    return (
        <div className="bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-primary selection:text-primary-foreground">
            <main className="p-6 space-y-6 flex flex-col">
                {/* Summary Bar — hidden for demo build */}
                {false && (
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
                )}

                {/* Kanban Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden">
                    {COLUMNS.map(column => (
                        <div key={column.id} className="flex flex-col gap-4 overflow-hidden">
                            <div className="flex items-center justify-between mb-1 px-2">
                                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    {column.title}
                                    <span className="bg-gray-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs px-2 py-0.5 rounded-full">{column.count}</span>
                                </h4>
                                <MoreHorizontal size={16} className="text-zinc-400 dark:text-zinc-500 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-micro bg-gray-100/50 dark:bg-zinc-900/50 rounded-2xl p-3 border border-gray-200/50 dark:border-zinc-800/50">
                                {displayCards.filter(card => card.column === column.id).map(card => {
                                    // Determine data-demo-target for spotlight
                                    const demoTarget =
                                        card.id === 1 && CARD1_PANEL_STEPS.includes(currentStep.id) ? 'kanban-ai-extraction' :
                                        card.id === 5 && CARD5_PANEL_STEPS.includes(currentStep.id) ? 'kanban-ack-normalize' :
                                        card.id === 6 && CARD6_PANEL_STEPS.includes(currentStep.id) ? 'doc-classification' :
                                        undefined;

                                    // Is this card currently showing a panel?
                                    const hasPanel =
                                        (card.id === 1 && CARD1_PANEL_STEPS.includes(currentStep.id)) ||
                                        (card.id === 5 && CARD5_PANEL_STEPS.includes(currentStep.id)) ||
                                        (card.id === 6 && CARD6_PANEL_STEPS.includes(currentStep.id));

                                    return (
                                        <div
                                            key={card.id}
                                            data-demo-target={demoTarget}
                                            className={`bg-white dark:bg-zinc-800 border p-4 rounded-2xl transition-all cursor-pointer group shadow-sm ${hasPanel ? 'ring-2 ring-indigo-500/50 border-indigo-500/30 shadow-lg shadow-indigo-500/10 scale-[1.02]' : `border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 ${card.priority === 'critical' ? 'ring-1 ring-red-500/20' : ''}`}`}
                                        >
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-start justify-between">
                                                    <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ring-1 ring-inset ${card.priority === 'critical' ? 'bg-red-500/10 text-red-400 ring-red-500/30' :
                                                        card.priority === 'high' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/30' :
                                                            'bg-gray-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 ring-gray-300 dark:ring-zinc-600'
                                                        }`}>
                                                        {card.priority}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-zinc-500" />
                                                        <span className="text-[10px] text-zinc-500 font-medium">4h ago</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{card.title}</h4>
                                                    <p className="text-xs text-zinc-500 font-medium">{card.dealer}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-800 bg-gray-300 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
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

                                                {/* Step-specific preview (matches lupa content) during panel steps */}
                                                {hasPanel && STEP_CARD_PREVIEW[currentStep.id] && (() => {
                                                    const preview = STEP_CARD_PREVIEW[currentStep.id];
                                                    return (
                                                        <div className={`mt-2 pt-3 border-t border-gray-200/50 dark:border-zinc-700/50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                                            <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${preview.accentClass}`}>
                                                                {preview.icon}
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">{preview.title}</span>
                                                                    <span className="text-[10px] text-zinc-500 font-medium">{preview.subtitle}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] leading-relaxed text-zinc-400 px-1">
                                                                {preview.detail}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-[10px] text-indigo-600/70 dark:text-indigo-300/70 font-medium py-0.5 px-1">
                                                                <Bot size={10} className="animate-pulse" />
                                                                <span>Agent processing...</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* AI Insight — normal cards (not in panel mode) */}
                                                {!hasPanel && card.aiInsight && (
                                                    <div className="mt-2 pt-3 border-t border-gray-200/50 dark:border-zinc-700/50 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                        <div className="flex items-center gap-2 text-indigo-400">
                                                            <Sparkles size={12} />
                                                            <span className="text-[10px] font-medium uppercase tracking-wider">AI Insight</span>
                                                        </div>
                                                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 italic bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl border border-gray-200/50 dark:border-zinc-700/50">
                                                            "{card.aiInsight}"
                                                        </p>
                                                        <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-primary hover:underline group/btn">
                                                            {card.id === 1 ? 'Route to Expert Hub' : 'Apply Recommendation'}
                                                            <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <button className="w-full py-3 border border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl text-zinc-400 dark:text-zinc-600 hover:border-gray-400 dark:hover:border-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-all text-xs font-medium">
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
