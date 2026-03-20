import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { useTheme } from 'strata-design-system';
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronLeft,
    Play,
    Pause,
    Loader2,
} from 'lucide-react';
import { useDemoProfile } from '../../context/DemoProfileContext';

// Apps belonging to Expert Hub — System steps in these show as "Expert"
const EXPERT_HUB_APPS = ['expert-hub', 'ack-detail', 'transactions', 'mac', 'quote-detail'];

function resolveRoleLabel(role: string, app: string): string {
    if (role === 'System') {
        return EXPERT_HUB_APPS.includes(app) ? 'Expert' : 'Dealer';
    }
    return role;
}

// Data threads — mini-summaries for completed steps
function getStepDataThread(stepId: string): string | null {
    const threads: Record<string, string> = {
        // Continua
        '1.1': 'Health score 87% — 3 alerts',
        '1.2': '12 items cataloged for reuse',
        '1.3': 'Price verified — $110K savings',
        '1.4': '4 locations synced',
        '1.5': '4 RMA, 4 convert-to-purchase',
        '1.6': 'Report approved — all changes confirmed',
        '3.1': 'Project request submitted — $3.2M, 8 floors',
        '3.2': '3 POs generated, $3.2M',
        '3.3': 'PO-to-ACK conversion verified',
        '3.4': 'Approval chain completed — 3/3 approved',
        '3.5': 'QC passed — 1,320 items received',
        '3.6': 'Installation dispatched — 8 floors',
        '2.1': 'REQ-FM-2026-018 — safety flag',
        '2.2': 'Warranty + consignment + relocation plan',
        '2.3': 'Dispatch approved — ProInstall tomorrow',
        '2.4': 'Assets relocated to Office 3-216',
        '2.5': 'Resolved — $0 cost, 26h total',
        '4.1': '194 tons diverted, A- rating',
        '4.2': 'Portal published — 82% progress',
        '4.3': '$11,550 reconciled',
        '4.4': '92% satisfaction, AV flagged',
        // Dupler
        'd1.1': '45 items extracted — 99.2% OCR accuracy',
        'd1.2': '40 auto-mapped, 5 exceptions resolved',
        'd1.3': '$2,140 in discrepancies caught',
        'd1.4': 'SIFF exported — $187K, 45 items',
        'd2.1': '35/38 matched — claim CLM-2026-047',
        'd2.2': '3 zones, 74% capacity — 35 items placed',
        'd2.3': 'Dock conflict resolved — 5 shipments tracked',
        'd2.4': '28/30 staged — dispatch confirmed',
        'd3.1': '$2.8M pipeline — 47 deals synced',
        'd3.2': '47/47 reconciled — 3 exceptions fixed',
        'd3.3': '4-section report assembled',
        'd3.4': 'PDF exported — sent to 3 stakeholders',
    };
    return threads[stepId] || null;
}

export default function DemoSidebar() {
    const { currentStepIndex, steps, nextStep, prevStep, goToStep, isDemoActive, setIsDemoActive, isSidebarCollapsed, setIsSidebarCollapsed, isPaused, togglePause } = useDemo();
    const { activeProfile } = useDemoProfile();
    const { theme } = useTheme();
    const STEP_BEHAVIOR = activeProfile.stepBehavior;
    const isContinua = activeProfile.id === 'continua';
    const isDupler = activeProfile.id === 'dupler';
    const hasDataThreads = isContinua || isDupler;

    // Invert: when app is dark → sidebar is light, when app is light → sidebar is dark
    const isDarkSidebar = theme === 'light';

    // Color tokens based on inverted theme
    const c = isDarkSidebar ? {
        // Dark sidebar (app is in light mode)
        bg: 'bg-zinc-950',
        bgHeader: 'bg-zinc-900',
        bgStep: 'bg-zinc-900/60',
        bgStepActive: 'bg-zinc-800',
        bgBadge: 'bg-zinc-800',
        bgBadgeActive: 'bg-zinc-700',
        bgBtn: 'bg-zinc-800',
        bgBtnHover: 'hover:bg-zinc-700',
        bgNext: 'bg-white',
        bgNextHover: 'hover:bg-zinc-200',
        textNext: 'text-zinc-950',
        border: 'border-zinc-800',
        borderSubtle: 'border-zinc-800/50',
        textTitle: 'text-white',
        textBody: 'text-zinc-300',
        textMuted: 'text-zinc-500',
        textDim: 'text-zinc-600',
        textBadge: 'text-zinc-400',
        textBadgeActive: 'text-zinc-200',
        textBtn: 'text-zinc-300',
        iconDone: 'text-emerald-400',
        iconDoneFill: 'fill-emerald-400/10',
        iconActive: 'border-white bg-zinc-900',
        iconActiveDot: 'bg-white',
        iconPending: 'text-zinc-700',
        connectorDone: 'bg-emerald-500/40',
        connectorPending: 'bg-zinc-800',
        activeBorder: 'border-l-white/70',
        dealerBadge: 'border-blue-800/50 bg-blue-900/30 text-blue-400',
        expertBadge: 'border-purple-800/50 bg-purple-900/30 text-purple-400',
        endUserBadge: 'border-rose-800/50 bg-rose-900/30 text-rose-400',
        collapsedBg: 'bg-zinc-950',
        collapsedText: 'text-zinc-400',
        collapsedBorder: 'border-zinc-800/50',
        fab: 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800',
    } : {
        // Light sidebar (app is in dark mode)
        bg: 'bg-white',
        bgHeader: 'bg-zinc-50',
        bgStep: 'bg-zinc-50/60',
        bgStepActive: 'bg-zinc-100',
        bgBadge: 'bg-zinc-100',
        bgBadgeActive: 'bg-zinc-200',
        bgBtn: 'bg-zinc-100',
        bgBtnHover: 'hover:bg-zinc-200',
        bgNext: 'bg-zinc-900',
        bgNextHover: 'hover:bg-zinc-800',
        textNext: 'text-white',
        border: 'border-zinc-200',
        borderSubtle: 'border-zinc-200/80',
        textTitle: 'text-zinc-900',
        textBody: 'text-zinc-700',
        textMuted: 'text-zinc-500',
        textDim: 'text-zinc-400',
        textBadge: 'text-zinc-500',
        textBadgeActive: 'text-zinc-800',
        textBtn: 'text-zinc-700',
        iconDone: 'text-emerald-600',
        iconDoneFill: 'fill-emerald-600/10',
        iconActive: 'border-zinc-900 bg-white',
        iconActiveDot: 'bg-zinc-900',
        iconPending: 'text-zinc-300',
        connectorDone: 'bg-emerald-500/40',
        connectorPending: 'bg-zinc-200',
        activeBorder: 'border-l-zinc-900',
        dealerBadge: 'border-blue-200 bg-blue-50 text-blue-700',
        expertBadge: 'border-purple-200 bg-purple-50 text-purple-700',
        endUserBadge: 'border-rose-200 bg-rose-50 text-rose-700',
        collapsedBg: 'bg-white',
        collapsedText: 'text-zinc-500',
        collapsedBorder: 'border-zinc-200',
        fab: 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50',
    };

    if (!isDemoActive) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsDemoActive(true)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border transition-all font-semibold ${c.fab}`}
                >
                    <Play size={20} fill="currentColor" />
                    <span>Start</span>
                </button>
            </div>
        );
    }

    if (isSidebarCollapsed) {
        return (
            <div className="fixed left-0 top-32 z-[110]">
                <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-r-xl border border-l-0 shadow-2xl transition-all group w-12 ${c.collapsedBg} ${c.collapsedText} ${c.collapsedBorder} hover:opacity-80`}
                >
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Demo</span>
                </button>
            </div>
        );
    }

    return (
        <div className={`fixed left-0 top-0 h-full w-80 ${c.bg} border-r ${c.borderSubtle} z-[110] flex flex-col shadow-2xl transition-all duration-300`}>
            {/* Header */}
            <div className={`p-6 border-b ${c.border} ${c.bgHeader}`}>
                <div className="flex items-center justify-between mb-1">
                    <h2 className={`text-lg font-bold ${c.textTitle}`}>Demo Flow</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            className={`p-1 rounded-md ${c.textMuted} hover:opacity-70 transition-colors`}
                            title="Collapse"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setIsDemoActive(false)}
                            className={`${c.textMuted} hover:opacity-70 text-xs uppercase tracking-wider font-semibold ml-1 transition-colors`}
                        >
                            Exit
                        </button>
                    </div>
                </div>
                <p className={`text-xs ${c.textDim}`}>Guided Experience Simulation</p>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 pt-6 scrollbar-micro">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const showGroupHeader = index === 0 || steps[index - 1].groupId !== step.groupId;

                    return (
                        <React.Fragment key={step.id}>
                            {showGroupHeader && (
                                <div className="pt-4 pb-2 first:pt-0">
                                    <h3 className={`text-[10px] font-bold ${c.textDim} uppercase tracking-widest`}>{step.groupTitle}</h3>
                                </div>
                            )}
                            <div
                                onClick={() => goToStep(index)}
                                className={`relative flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${isActive ? `${c.bgStepActive} border-l-2 ${c.activeBorder}` : 'hover:opacity-80'}`}
                            >
                                {/* Connector Line */}
                                {index < steps.length - 1 && steps[index + 1].groupId === step.groupId && (
                                    <div className={`absolute left-[22px] top-11 w-0.5 h-8 ${isCompleted ? c.connectorDone : c.connectorPending}`} />
                                )}

                                {/* Icon / Status */}
                                <div className="z-10 mt-0.5 shrink-0">
                                    {isCompleted ? (
                                        <CheckCircle2 size={20} className={`${c.iconDone} ${c.iconDoneFill}`} />
                                    ) : isActive ? (
                                        <div className={`w-5 h-5 rounded-full border-2 ${c.iconActive} flex items-center justify-center`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${c.iconActiveDot}`} />
                                        </div>
                                    ) : (
                                        <Circle size={20} className={c.iconPending} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? `${c.bgBadgeActive} ${c.textBadgeActive}` : `${c.bgBadge} ${c.textBadge}`}`}>
                                            STEP {step.id.replace(/^d/, '')}
                                        </span>
                                        {(() => {
                                            const label = resolveRoleLabel(step.role, step.app);
                                            return (
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${label === 'Dealer' ? c.dealerBadge : label === 'End User' ? c.endUserBadge : c.expertBadge}`}>
                                                    {label}
                                                </span>
                                            );
                                        })()}
                                        {(step.id.startsWith('2.') || step.id === '4.4') && isContinua && (
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border ${isDarkSidebar ? 'border-blue-800/50 bg-blue-900/30 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700'} font-bold`}>
                                                + FM
                                            </span>
                                        )}
                                        {STEP_BEHAVIOR[step.id]?.mode === 'auto' && (
                                            <span className={`text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5 ${isActive ? `${c.bgBadgeActive} ${c.textBadgeActive}` : `${c.bgBadge} ${c.textBadge}`}`}>
                                                <Loader2 size={8} className={isActive ? 'animate-spin' : ''} />
                                                AUTO
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`font-semibold text-sm leading-tight ${isActive ? c.textTitle : c.textBody}`}>
                                        {step.title}
                                    </h3>
                                    {isActive && (
                                        <p className={`text-[11px] ${c.textMuted} leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300`}>
                                            {step.description}
                                        </p>
                                    )}
                                    {isCompleted && hasDataThreads && getStepDataThread(step.id) && (
                                        <p className={`text-[8px] italic ${c.textDim} leading-tight`}>
                                            → {getStepDataThread(step.id)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Paused Indicator */}
            {isPaused && (
                <div className={`mx-4 mb-2 flex items-center justify-center gap-2 py-2 rounded-lg border ${isDarkSidebar ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'} animate-pulse`}>
                    <Pause size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Paused</span>
                </div>
            )}

            {/* Navigation Controls */}
            <div className={`p-4 border-t ${c.border} ${c.bgHeader}`}>
                <div className="flex gap-2">
                    <button
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 ${c.bgBtn} ${c.textBtn} py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${c.bgBtnHover} transition-colors`}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>
                    <button
                        onClick={togglePause}
                        className={`flex items-center justify-center w-10 rounded-lg text-sm font-semibold transition-colors ${isPaused
                            ? (isDarkSidebar ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-amber-100 text-amber-600 hover:bg-amber-200')
                            : `${c.bgBtn} ${c.textBtn} ${c.bgBtnHover}`
                        }`}
                        title={isPaused ? 'Resume' : 'Pause'}
                    >
                        {isPaused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    <button
                        onClick={nextStep}
                        disabled={currentStepIndex === steps.length - 1}
                        className={`flex-[1.5] flex items-center justify-center gap-1.5 ${c.bgNext} ${c.textNext} py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${c.bgNextHover} transition-colors shadow-sm`}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
