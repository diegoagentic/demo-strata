// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Top Navbar
// Phase 3 of WRG Demo v6 implementation
// Custom top bar (not the global app Navbar) — based on Project Aries layout
// ═══════════════════════════════════════════════════════════════════════════════

import { clsx } from 'clsx'
import {
    Calculator,
    CheckCircle2,
    RefreshCw,
    LayoutDashboard,
    Archive,
    Settings,
    Download,
    UploadCloud,
    Save,
} from 'lucide-react'
import type { EstimatorTab, SyncStatus } from './types'

interface StrataEstimatorNavbarProps {
    activeTab: EstimatorTab
    onTabChange: (tab: EstimatorTab) => void
    syncStatus: SyncStatus
    onSave: () => void
    onExportBackup?: () => void
    onImportBackup?: () => void
}

const TABS: Array<{ id: EstimatorTab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'ESTIMATOR', label: 'Estimator', icon: LayoutDashboard },
    { id: 'PROJECTS', label: 'Projects', icon: Archive },
    { id: 'CONFIG', label: 'Config', icon: Settings },
]

export default function StrataEstimatorNavbar({
    activeTab,
    onTabChange,
    syncStatus,
    onSave,
    onExportBackup,
    onImportBackup,
}: StrataEstimatorNavbarProps) {
    return (
        <nav className="sticky top-0 z-30 bg-card dark:bg-zinc-900 border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

                {/* Left: Logo + Brand + Tabs */}
                <div className="flex items-center gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-300 dark:bg-brand-500 flex items-center justify-center shrink-0">
                            <Calculator className="w-5 h-5 text-zinc-900" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                Strata
                            </div>
                            <div className="text-sm font-bold text-foreground leading-tight">
                                Estimator
                            </div>
                        </div>

                        {/* Sync status — Aries parity: 2 states only (synced | saving) */}
                        <div className="ml-2 hidden md:flex items-center gap-1.5">
                            {syncStatus === 'synced' && (
                                <>
                                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                        Recovery Active
                                    </span>
                                </>
                            )}
                            {syncStatus === 'saving' && (
                                <>
                                    <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
                                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        Auto-Saving
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
                        {TABS.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors',
                                        isActive
                                            ? 'bg-card dark:bg-zinc-800 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Right: Backup actions + Save CTA */}
                <div className="flex items-center gap-3">
                    {/* Backup icon buttons */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                        <button
                            onClick={onExportBackup}
                            title="Export Project Data"
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-card dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <Download className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onImportBackup}
                            title="Import Project Data"
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-card dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <UploadCloud className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Save Project CTA — brand CTA pattern */}
                    <button
                        onClick={onSave}
                        className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600 rounded-xl shadow-sm transition-colors"
                    >
                        <Save className="h-4 w-4" />
                        Save Project
                    </button>
                </div>
            </div>
        </nav>
    )
}
