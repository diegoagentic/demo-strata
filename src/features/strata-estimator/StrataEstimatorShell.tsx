// ═══════════════════════════════════════════════════════════════════════════════
// Strata Estimator — Shell (main container)
// Phase 3 + 4.8 of WRG Demo v6 implementation
//
// Shell is role-aware: when running inside the WRG demo, it reads the
// currentStep from DemoContext to determine the connected user, the active
// tab, and the visual state (idle / estimation-active / escalated / assembly
// / proposal-review). A HandoffBanner is shown whenever the role changes
// between steps so the narrative of work being passed between David, Alex
// and Sara is visible inside the single collaborative Shell.
// ═══════════════════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import StrataEstimatorNavbar from './StrataEstimatorNavbar'
import EstimatorDossierCard from './EstimatorDossierCard'
import FinancialSummaryHero from './FinancialSummaryHero'
import BillOfMaterialsTable from './BillOfMaterialsTable'
import OperationalConstraintsPanel from './OperationalConstraintsPanel'
import VisionEngineModal from './VisionEngineModal'
import HandoffBanner from './HandoffBanner'
import { calculateInstall } from './calculations'
import { getStepRole, getStepState, getStepTab } from './stepStates'
import {
    INITIAL_CONFIG,
    INITIAL_VARIABLES,
    JPS_CUSTOMER,
    JPS_LINE_ITEMS,
} from './mockData'
import type {
    ConfigState,
    Customer,
    EstimatorTab,
    LineItem,
    OperationalVariables,
    SyncStatus,
} from './types'

interface StrataEstimatorShellProps {
    onExit?: () => void
}

export default function StrataEstimatorShell({ onExit: _onExit }: StrataEstimatorShellProps = {}) {
    const { currentStep } = useDemo()
    const stepId = currentStep?.id
    const stepState = getStepState(stepId)
    const connectedUser = getStepRole(stepId) ?? undefined

    // ── State ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<EstimatorTab>(getStepTab(stepId))
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
    const [customer, setCustomer] = useState<Customer>(JPS_CUSTOMER)
    const [lineItems, setLineItems] = useState<LineItem[]>(JPS_LINE_ITEMS)
    const [variables, setVariables] = useState<OperationalVariables>(INITIAL_VARIABLES)
    const [config, _setConfig] = useState<ConfigState>(INITIAL_CONFIG)
    const [isSearchingRates, setIsSearchingRates] = useState(false)
    const [lastFile, setLastFile] = useState<{ name: string } | null>(null)
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)

    // ── Derived: financial estimate (pure calc) ──────────────────────────────
    const estimate = useMemo(
        () => calculateInstall(lineItems, variables, config),
        [lineItems, variables, config]
    )

    // ── Handoff banner (fires when step role changes) ────────────────────────
    const prevStepIdRef = useRef<string | undefined>(undefined)
    const [handoff, setHandoff] = useState<{
        fromUser: NonNullable<typeof connectedUser>
        message: string
    } | null>(null)

    useEffect(() => {
        const prevId = prevStepIdRef.current
        prevStepIdRef.current = stepId

        // Only show handoff when moving from a previous estimator step to a new one
        if (!prevId || prevId === stepId) return
        const prevRole = getStepRole(prevId)
        if (!prevRole) return
        if (!connectedUser || prevRole.name === connectedUser.name) return

        setHandoff({
            fromUser: prevRole,
            message: `Handed off to ${connectedUser.name} · ${currentStep?.title ?? ''}`,
        })
    }, [stepId, connectedUser, currentStep?.title])

    // ── Sync active tab with the step's declared tab ─────────────────────────
    useEffect(() => {
        setActiveTab(getStepTab(stepId))
    }, [stepId])

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSave = () => {
        setSyncStatus('saving')
        setTimeout(() => setSyncStatus('synced'), 1500)
    }

    const handleExportBackup = () => {
        console.log('Export backup')
    }

    const handleImportBackup = () => {
        console.log('Import backup')
    }

    const handleRateLookup = () => {
        setIsSearchingRates(true)
        setTimeout(() => setIsSearchingRates(false), 1500)
    }

    const handleGenerateProposal = () => {
        // Phase 13: triggers the pricing waterfall modal
        console.log('Generate proposal — Phase 13')
    }

    // ── Line item CRUD ───────────────────────────────────────────────────────
    const handleUpdateItem = (
        id: string,
        field: keyof LineItem,
        value: string | number
    ) => {
        setLineItems((items) =>
            items.map((item) => {
                if (item.id !== id) return item
                // Reset subcategory when the parent category changes
                if (field === 'categoryId') {
                    return { ...item, categoryId: String(value), subCategoryId: '' }
                }
                return { ...item, [field]: value }
            })
        )
    }

    const handleAddItem = () => {
        const firstCategory = Object.keys(config.categories)[0] ?? ''
        setLineItems((items) => [
            ...items,
            {
                id: `item-${Date.now()}`,
                categoryId: firstCategory,
                subCategoryId: '',
                description: '',
                quantity: 1,
            },
        ])
    }

    const handleRemoveItem = (id: string) => {
        setLineItems((items) => items.filter((item) => item.id !== id))
    }

    const handleAiImport = () => {
        setLastFile(null) // force the initial "Select Spec Document" mode
        setIsAiModalOpen(true)
    }

    const handleAiRefine = () => {
        setIsAiModalOpen(true)
    }

    const handleItemsExtracted = (items: LineItem[], fileName: string) => {
        setLineItems(items)
        setLastFile({ name: fileName })
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Top navbar */}
            <StrataEstimatorNavbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                syncStatus={syncStatus}
                onSave={handleSave}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                connectedUser={connectedUser}
            />

            {/* Handoff banner — dismisses automatically after 3s */}
            {handoff && (
                <HandoffBanner
                    fromUser={handoff.fromUser}
                    message={handoff.message}
                    onDismiss={() => setHandoff(null)}
                />
            )}

            {/* Tab content */}
            <main className="flex-1 overflow-auto">
                {activeTab === 'ESTIMATOR' && (
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        {/* Phase 4: Project Dossier */}
                        <EstimatorDossierCard
                            customer={customer}
                            onCustomerChange={setCustomer}
                            onRateLookup={handleRateLookup}
                            isSearchingRates={isSearchingRates}
                        />

                        {/* Phase 5: Financial Summary Hero */}
                        <FinancialSummaryHero
                            estimate={estimate}
                            onGenerateProposal={handleGenerateProposal}
                        />

                        {/* Phase 6: Bill of Materials */}
                        <BillOfMaterialsTable
                            lineItems={lineItems}
                            config={config}
                            onUpdateItem={handleUpdateItem}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            onAiImport={handleAiImport}
                            onAiRefine={handleAiRefine}
                            hasLastFile={!!lastFile}
                        />

                        {/* Phase 7: Operational Constraints */}
                        <OperationalConstraintsPanel
                            variables={variables}
                            onVariablesChange={setVariables}
                            crewSize={estimate.crewSize}
                        />

                        <p className="text-[10px] text-center text-muted-foreground/60 font-mono">
                            step {stepId ?? '—'} · state {stepState} · {variables.duration} day(s)
                        </p>
                    </div>
                )}

                {activeTab === 'PROJECTS' && (
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                Projects archive — content will be added in Phase 10
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'CONFIG' && (
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm p-12 text-center">
                            <p className="text-sm text-muted-foreground">
                                Admin configuration — content will be added in Phase 11
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Phase 8: Vision Engine modal (AI Import / Refine) */}
            <VisionEngineModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onItemsExtracted={handleItemsExtracted}
                lastFile={lastFile}
            />
        </div>
    )
}
