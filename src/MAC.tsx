import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { useTenant } from './TenantContext';
import { useDemo } from './context/DemoContext';
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge';
import InventoryMovements from './components/InventoryMovements';
import InventoryMaintenance from './components/InventoryMaintenance';
import MACRequests from './components/MACRequests';
import MACPunchList from './components/MACPunchList';
import AgentPipelineStrip from './components/simulations/AgentPipelineStrip';
import {
    Squares2X2Icon,
    WrenchScrewdriverIcon,
    ArrowPathRoundedSquareIcon,
    ClipboardDocumentCheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Mock Utils if cn is not available globally
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function MAC({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: PageProps) {
    const { currentTenant } = useTenant();
    const { currentStep, nextStep } = useDemo();
    const [activeTab, setActiveTab] = useState<'movements' | 'maintenance' | 'requests' | 'punchlist'>('requests');
    const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

    // Auto-select tab based on step
    useEffect(() => {
        if (currentStep?.id === '3.4') {
            setActiveTab('requests');
        } else if (currentStep?.id === '3.5') {
            setActiveTab('punchlist');
        }
    }, [currentStep?.id]);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'mac-punch-list') {
                setActiveTab('punchlist');
                setHighlightedTab('punchlist');
                setTimeout(() => setHighlightedTab(null), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                            {currentTenant} MAC
                        </h1>
                        <p className="text-muted-foreground mt-1">Moves, Adds, and Changes management.</p>
                    </div>
                </div>

                {/* Step 3.5: Warranty Claims Pipeline */}
                {currentStep?.id === '3.5' && (
                    <AgentPipelineStrip agents={[
                        { id: 'doc-class', name: 'DocClassifier', status: 'done' },
                        { id: 'ocr', name: 'OCR/Extract', status: 'done' },
                        { id: 'data-norm', name: 'DataNorm', status: 'done' },
                        { id: 'match', name: '3-WayMatch', status: 'done' },
                        { id: 'mac', name: 'MACOrch', status: 'done' },
                        { id: 'warranty', name: 'WarrantyAgent', status: 'running', detail: 'Claim assembly' },
                        { id: 'liability', name: 'LiabilityAI', status: 'pending' },
                        { id: 'notif', name: 'Notification', status: 'pending' },
                    ]} accentColor="amber" />
                )}

                {/* Tabs */}
                <div className="flex gap-1 bg-card/50 p-1 rounded-lg w-fit overflow-x-auto max-w-full border border-zinc-200 dark:border-zinc-800">
                    {[
                        { id: 'requests', label: 'Requests', count: 12, icon: ClipboardDocumentCheckIcon },
                        { id: 'movements', label: 'Movements', count: 4, icon: ArrowPathRoundedSquareIcon },
                        { id: 'maintenance', label: 'Maintenance', count: 3, icon: WrenchScrewdriverIcon },
                        { id: 'punchlist', label: 'Punch List', count: 3, icon: ExclamationTriangleIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-card text-brand-600 dark:text-brand-400 shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent",
                                highlightedTab === tab.id && "ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {tab.count !== null && (
                                <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                                    activeTab === tab.id
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-background text-muted-foreground group-hover:bg-muted font-medium"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Step 3.4: AI Validation Banner */}
                {currentStep?.id === '3.4' && activeTab === 'requests' && (
                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-xl">
                                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-green-700 dark:text-green-400">AI Validated MAC Requests</h3>
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">AI Validated</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-green-600/80 dark:text-green-500/80">
                                            3 requests validated against inventory and compliance rules
                                        </p>
                                        <ConfidenceScoreBadge score={94} label="Validation" size="sm" />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => nextStep()}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                            >
                                Continue to Warranty
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'punchlist' && <MACPunchList />}
                    {activeTab === 'movements' && <InventoryMovements />}
                    {activeTab === 'maintenance' && <InventoryMaintenance />}
                    {activeTab === 'requests' && <MACRequests />}
                </div>

            </div>
        </div>
    )
}
