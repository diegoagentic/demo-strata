import React from 'react';
import { useDemo } from '../../context/DemoContext';
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    ChevronLeft,
    Layout,
    Mail,
    BarChart3,
    ShieldCheck,
    Play
} from 'lucide-react';

export default function DemoSidebar() {
    const { currentStepIndex, steps, nextStep, prevStep, goToStep, isDemoActive, setIsDemoActive, isSidebarCollapsed, setIsSidebarCollapsed } = useDemo();

    if (!isDemoActive) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsDemoActive(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all animate-pulse"
                >
                    <Play size={20} fill="currentColor" />
                    <span className="font-semibold">Start Demo Flow</span>
                </button>
            </div>
        );
    }

    if (isSidebarCollapsed) {
        return (
            <div className="fixed left-0 top-32 z-[110]">
                <button
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="flex flex-col items-center justify-center gap-2 bg-card text-foreground py-4 px-2 rounded-r-xl border border-l-0 border-border shadow-2xl hover:bg-muted transition-all group w-12"
                >
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Demo</span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-[110] flex flex-col shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-foreground">Demo Flow</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarCollapsed(true)}
                            className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                            title="Collapse Sidebar"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setIsDemoActive(false)}
                            className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider font-semibold ml-2"
                        >
                            Exit
                        </button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground italic">Guided Experience Simulation</p>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-8 scrollbar-micro">
                {steps.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;
                    const showGroupHeader = index === 0 || steps[index - 1].groupId !== step.groupId;

                    return (
                        <React.Fragment key={step.id}>
                            {showGroupHeader && (
                                <div className="pt-4 pb-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{step.groupTitle}</h3>
                                </div>
                            )}
                            <div
                                onClick={() => goToStep(index)}
                                className={`relative flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-primary/10 border border-primary/20 scale-[1.02]' : 'hover:bg-muted/50'
                                    }`}
                            >
                                {/* Connector Line */}
                                {index < steps.length - 1 && steps[index + 1].groupId === step.groupId && (
                                    <div
                                        className={`absolute left-7 top-12 w-0.5 h-10 ${isCompleted ? 'bg-primary' : 'bg-border'
                                            }`}
                                    />
                                )}

                                {/* Icon / Status */}
                                <div className="z-10 mt-1">
                                    {isCompleted ? (
                                        <CheckCircle2 size={24} className="text-primary fill-primary/10" />
                                    ) : isActive ? (
                                        <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center bg-card">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                        </div>
                                    ) : (
                                        <Circle size={24} className="text-muted-foreground/30" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            STEP {step.id}
                                        </span>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm border ${step.role === 'Dealer' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400' :
                                                step.role === 'Expert' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-400' :
                                                    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400'
                                            }`}>
                                            {step.role}
                                        </span>
                                    </div>
                                    <h3 className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-foreground/70'}`}>
                                        {step.title}
                                    </h3>
                                    {isActive && (
                                        <p className="text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
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
            <div className="p-6 border-t border-border bg-muted/20">
                <div className="flex gap-3">
                    <button
                        onClick={prevStep}
                        disabled={currentStepIndex === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-muted text-foreground py-2.5 rounded-lg font-semibold disabled:opacity-50 hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>
                    <button
                        onClick={nextStep}
                        disabled={currentStepIndex === steps.length - 1}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
