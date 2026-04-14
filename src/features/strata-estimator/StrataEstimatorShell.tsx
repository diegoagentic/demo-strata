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
import ProjectsArchiveView from './ProjectsArchiveView'
import EstimatorAdminView from './EstimatorAdminView'
import PricingWaterfall from './PricingWaterfall'
import VisionEngineModal from './VisionEngineModal'
import HandoffBanner from './HandoffBanner'
import DesignerVerificationOverlay from './DesignerVerificationOverlay'
import { calculateInstall } from './calculations'
import { getStepRole, getStepState, getStepTab } from './stepStates'
import {
    INITIAL_CONFIG,
    INITIAL_VARIABLES,
    JPS_CUSTOMER,
    JPS_LINE_ITEMS,
    MOCK_SAVED_ESTIMATES,
} from './mockData'
import type {
    ConfigState,
    Customer,
    EstimateStatus,
    EstimatorTab,
    LineItem,
    OperationalVariables,
    SavedEstimate,
    SyncStatus,
} from './types'

interface StrataEstimatorShellProps {
    onExit?: () => void
}

export default function StrataEstimatorShell({ onExit: _onExit }: StrataEstimatorShellProps = {}) {
    const { currentStep, nextStep } = useDemo()
    const stepId = currentStep?.id
    const stepState = getStepState(stepId)
    const connectedUser = getStepRole(stepId) ?? undefined

    // ── State ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<EstimatorTab>(getStepTab(stepId))
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
    const [customer, setCustomer] = useState<Customer>(JPS_CUSTOMER)
    const [lineItems, setLineItems] = useState<LineItem[]>(JPS_LINE_ITEMS)
    const [variables, setVariables] = useState<OperationalVariables>(INITIAL_VARIABLES)
    const [config, setConfig] = useState<ConfigState>(INITIAL_CONFIG)
    const [isSearchingRates, setIsSearchingRates] = useState(false)
    const [lastFile, setLastFile] = useState<{ name: string } | null>(null)
    const [isAiModalOpen, setIsAiModalOpen] = useState(false)
    const [isWaterfallOpen, setIsWaterfallOpen] = useState(false)
    const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>(MOCK_SAVED_ESTIMATES)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

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
        setIsWaterfallOpen(true)
    }

    const handleSendForReview = () => {
        // Phase 14+: closes the waterfall and advances the demo to w2.4
        setIsWaterfallOpen(false)
        if (nextStep) nextStep()
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

    // ── Projects archive CRUD ────────────────────────────────────────────────
    const handleLoadEstimate = (est: SavedEstimate) => {
        setCustomer(est.customer)
        setLineItems(est.lineItems)
        setVariables(est.variables)
        setActiveTab('ESTIMATOR')
    }

    const handleDeleteEstimate = (id: string) => {
        setSavedEstimates((list) => list.filter((e) => e.id !== id))
    }

    const handleUpdateStatus = (id: string, status: EstimateStatus) => {
        setSavedEstimates((list) =>
            list.map((e) => (e.id === id ? { ...e, status } : e))
        )
    }

    const handleUpdateActualCost = (id: string, actualCost: number) => {
        setSavedEstimates((list) =>
            list.map((e) => (e.id === id ? { ...e, actualCost } : e))
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-10">
            {/* Top navbar — floating pill, matches src/components/Navbar.tsx */}
            <StrataEstimatorNavbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                syncStatus={syncStatus}
                onSave={handleSave}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                connectedUser={connectedUser}
            />

            {/* Handoff banner — sits below the floating pill, auto-dismisses */}
            {handoff && (
                <HandoffBanner
                    fromUser={handoff.fromUser}
                    message={handoff.message}
                    onDismiss={() => setHandoff(null)}
                />
            )}

            {/* Tab content */}
            <main>
                {isInitialLoading ? (
                    <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
                        <div className="h-32 bg-muted/40 rounded-2xl" />
                        <div className="h-64 bg-muted/30 rounded-2xl" />
                        <div className="h-96 bg-muted/20 rounded-2xl" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'ESTIMATOR' && (
                            <div key="ESTIMATOR" className="pt-24 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
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
                            <div key="PROJECTS" className="animate-fade-in">
                                <ProjectsArchiveView
                                    savedEstimates={savedEstimates}
                                    onLoadEstimate={handleLoadEstimate}
                                    onDeleteEstimate={handleDeleteEstimate}
                                    onUpdateStatus={handleUpdateStatus}
                                    onUpdateActualCost={handleUpdateActualCost}
                                />
                            </div>
                        )}

                        {activeTab === 'CONFIG' && (
                            <div key="CONFIG" className="animate-fade-in">
                                <EstimatorAdminView
                                    config={config}
                                    onConfigChange={setConfig}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Phase 8: Vision Engine modal (AI Import / Refine) */}
            <VisionEngineModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onItemsExtracted={handleItemsExtracted}
                lastFile={lastFile}
            />

            {/* Phase 13: Pricing Waterfall (triggered by Generate Proposal) */}
            <PricingWaterfall
                isOpen={isWaterfallOpen}
                onClose={() => setIsWaterfallOpen(false)}
                onSendForReview={handleSendForReview}
            />

            {/* Phase 14: Designer Verification Overlay */}
            <DesignerVerificationOverlay
                isOpen={stepState === 'estimation-escalated'}
                onSendBack={() => {
                    if (nextStep) nextStep()
                }}
                onPreviewPdf={() => console.log('Preview PDF')}
            />
        </div>
    )
}
