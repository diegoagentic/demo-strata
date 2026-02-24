import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { useTenant } from './TenantContext';
import InventoryMovements from './components/InventoryMovements';
import InventoryMaintenance from './components/InventoryMaintenance';
import MACRequests from './components/MACRequests';
import MACPunchList from './components/MACPunchList';
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
    const [activeTab, setActiveTab] = useState<'movements' | 'maintenance' | 'requests' | 'punchlist'>('requests');
    const [highlightedTab, setHighlightedTab] = useState<string | null>(null);

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
