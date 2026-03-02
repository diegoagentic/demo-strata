import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { useTheme } from 'strata-design-system';
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronLeft,
    Play
} from 'lucide-react';

// Apps belonging to Expert Hub — System steps in these show as "Expert"
const EXPERT_HUB_APPS = ['expert-hub', 'ack-detail', 'transactions', 'mac', 'quote-detail'];

function resolveRoleLabel(role: string, app: string): string {
    if (role === 'System') {
        return EXPERT_HUB_APPS.includes(app) ? 'Expert' : 'Dealer';
    }
    return role;
}

export default function DemoSidebar() {
    const { currentStepIndex, steps, nextStep, prevStep, goToStep, isDemoActive, setIsDemoActive, isSidebarCollapsed, setIsSidebarCollapsed } = useDemo();
    const { theme } = useTheme();

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
                    <span>Start Demo</span>
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
                                            STEP {step.id}
                                        </span>
                                        {(() => {
                                            const label = resolveRoleLabel(step.role, step.app);
                                            return (
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${label === 'Dealer' ? c.dealerBadge : c.expertBadge}`}>
                                                    {label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <h3 className={`font-semibold text-sm leading-tight ${isActive ? c.textTitle : c.textBody}`}>
                                        {step.title}
                                    </h3>
                                    {isActive && (
                                        <p className={`text-[11px] ${c.textMuted} leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300`}>
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

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
