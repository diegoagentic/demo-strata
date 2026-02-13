import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { useTenant } from './TenantContext';
import InventoryMovements from './components/InventoryMovements';
import InventoryMaintenance from './components/InventoryMaintenance';
import MACRequests from './components/MACRequests';
import {
    Squares2X2Icon,
    WrenchScrewdriverIcon,
    ArrowPathRoundedSquareIcon,
    ClipboardDocumentCheckIcon
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
    const [activeTab, setActiveTab] = useState<'movements' | 'maintenance' | 'requests'>('requests');

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            <Navbar onLogout={onLogout} activeTab="mac" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate} />
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
                        { id: 'maintenance', label: 'Maintenance', count: 3, icon: WrenchScrewdriverIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:text-zinc-900 dark:hover:text-white hover:bg-brand-300 dark:hover:bg-brand-600/50"
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
                    {activeTab === 'movements' && <InventoryMovements />}
                    {activeTab === 'maintenance' && <InventoryMaintenance />}
                    {activeTab === 'requests' && <MACRequests />}
                </div>

            </div>
        </div>
    )
}
