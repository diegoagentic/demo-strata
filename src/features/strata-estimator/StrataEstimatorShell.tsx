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
import ProposalActionBar from './ProposalActionBar'
import ApprovalChainModal from './ApprovalChainModal'
import ReleaseSuccessModal from './ReleaseSuccessModal'
import RequestClarificationModal from './RequestClarificationModal'
import ProposalPdfPreviewModal from './ProposalPdfPreviewModal'
import ScopeBreachAlert from './ScopeBreachAlert'
import FlaggedItemBanner from './FlaggedItemBanner'
import AuditTrailPanel from './AuditTrailPanel'
import type { AuditCategory, AuditEvent } from './AuditTrailPanel'
import RoleHandoffTransition from './RoleHandoffTransition'
import type { HandoffPerson } from './RoleHandoffTransition'
import VerificationLogCard from './VerificationLogCard'
import ClientProposalDelivery from './ClientProposalDelivery'
import DesignerTaskNotification from './DesignerTaskNotification'
import { ROLE_PROFILES } from './roles'
import { calculateInstall } from './calculations'
import { getStepRole, getStepState, getStepTab } from './stepStates'
import {
    DEALERS,
    INITIAL_CONFIG,
    INITIAL_VARIABLES,
    JPS_CONTRACT_DISCOUNT,
    JPS_CUSTOMER,
    JPS_FREIGHT,
    JPS_LINE_ITEMS,
    JPS_PRODUCT_LIST,
    MOCK_SAVED_ESTIMATES,
    SCOPE_LIMITS,
    getAiConfidence,
} from './mockData'
import type { AiConfidence } from './mockData'
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
    const { currentStep, nextStep, goToStep } = useDemo()
    const stepId = currentStep?.id
    const stepState = getStepState(stepId)
    const connectedUser = getStepRole(stepId) ?? undefined
    const isProposalReview = stepState === 'proposal-review'

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
    const [isApprovalOpen, setIsApprovalOpen] = useState(false)
    const [isReleaseOpen, setIsReleaseOpen] = useState(false)
    const [isClarificationOpen, setIsClarificationOpen] = useState(false)
    const [isProposalPdfOpen, setIsProposalPdfOpen] = useState(false)
    const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>(MOCK_SAVED_ESTIMATES)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // ── w1.1 beat timeline state (refinement Phase 2 + 7.1) ──────────────────
    type W21Phase =
        | 'idle'
        | 'loading-dossier'
        | 'importing-bom'
        | 'mapping-bom'
        | 'scope-breach'
        | 'flagged'
    const [w21Phase, setW21Phase] = useState<W21Phase>('idle')
    const [importStatus, setImportStatus] = useState<string | null>(null)
    const [scopeBreachOpen, setScopeBreachOpen] = useState(false)
    const [scopeBreachActive, setScopeBreachActive] = useState(false)
    const [flaggedRowIds, setFlaggedRowIds] = useState<string[]>([])
    const [escalatedAt, setEscalatedAt] = useState<number | null>(null)
    const [verifiedAt, setVerifiedAt] = useState<number | null>(null)
    const [approvedAt, setApprovedAt] = useState<number | null>(null)
    const [designerTaskOpened, setDesignerTaskOpened] = useState(false)
    const [generateCtaPressed, setGenerateCtaPressed] = useState(false)
    const [mappingResolvedCount, setMappingResolvedCount] = useState<number>(Infinity)
    // Dual-engine calculation progress (0 → 1). Default 1 = show real values.
    const [calcProgress, setCalcProgress] = useState<number>(1)
    const calcRafRef = useRef<number | null>(null)

    // ── Role handoff transition (Phase 7.3 — reusable for all 3 swaps) ──────
    interface PendingHandoff {
        from: HandoffPerson
        to: HandoffPerson
        message: string
    }
    const [handoff2, setHandoff2] = useState<PendingHandoff | null>(null)
    const triggerHandoff = (
        from: HandoffPerson,
        to: HandoffPerson,
        message: string
    ) => {
        setHandoff2({ from, to, message })
    }
    const handleHandoffComplete = () => {
        setHandoff2(null)
        if (nextStep) nextStep()
    }

    // ── Audit trail (Pain #4 — structured data layer proof) ─────────────────
    const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
    const logEvent = (actor: string, action: string, category: AuditCategory) => {
        setAuditLog((prev) => [
            ...prev,
            {
                id: `ev-${Date.now()}-${prev.length}`,
                timestamp: Date.now(),
                actor,
                action,
                category,
            },
        ])
    }

    // Derived: AI confidence map for every line item (mock — HIGH / LOW per
    // the WRG assessment's 85/15 template-vs-fallback split).
    const confidenceMap = useMemo<Record<string, AiConfidence>>(() => {
        return Object.fromEntries(
            lineItems.map((item) => [item.id, getAiConfidence(item.id)])
        )
    }, [lineItems])

    // Derived: sticky scope breach badge (shown after the transient alert
    // fades so the state stays visible throughout w1.1-w2.2).
    const scopeBreachBadge = scopeBreachActive
        ? { category: SCOPE_LIMITS.KD_CHAIRS.category, count: 119, limit: SCOPE_LIMITS.KD_CHAIRS.limit }
        : null

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    // ── Derived: financial estimate (pure calc) ──────────────────────────────
    const estimate = useMemo(
        () => calculateInstall(lineItems, variables, config),
        [lineItems, variables, config]
    )

    // ── w1.1 beat timeline ───────────────────────────────────────────────────
    // Runs every time the demo enters w1.1 (first entry + every restart). The
    // Shell resets to an empty-ish state and then plays the narrative:
    //   loading-dossier → importing-bom (stagger) → scope-breach → flagged
    useEffect(() => {
        if (stepId !== 'w1.1') return

        // Reset the Shell to the "just arrived from CORE" state
        setCustomer({ ...JPS_CUSTOMER, zipCode: '', address: '' })
        setLineItems([])
        setVariables(INITIAL_VARIABLES)
        setScopeBreachOpen(false)
        setScopeBreachActive(false)
        setFlaggedRowIds([])
        setImportStatus(null)
        setW21Phase('loading-dossier')
        setMappingResolvedCount(0) // all rows will first appear as chips
        setCalcProgress(0) // hero starts at $0 and counts up during the calc beat
        setEscalatedAt(null) // drop any stale escalation context
        setVerifiedAt(null) // drop any stale verification context
        setApprovedAt(null) // drop any stale approval context
        setAuditLog([])
        logEvent(
            'AI Agent',
            'Agent Step 1 · Routed JPS Health Network to David Park (Dallas)',
            'ai'
        )
        logEvent('System', 'Session opened · JPS Health Network', 'system')

        const timers: ReturnType<typeof setTimeout>[] = []

        // t=800ms  — dossier filled in (ZIP + address land)
        timers.push(
            setTimeout(() => {
                setCustomer(JPS_CUSTOMER)
                logEvent('AI Agent', 'Loaded CORE export · ZIP 76104 / Fort Worth', 'ai')
            }, 800)
        )

        // t=1100ms — AI import indicator appears above the BoM header
        timers.push(
            setTimeout(() => {
                setW21Phase('importing-bom')
                setImportStatus('Importing 24 items from JPS_specs.pdf…')
            }, 1100)
        )

        // t=1400ms — populate BoM, stagger animation plays
        timers.push(
            setTimeout(() => {
                setLineItems(JPS_LINE_ITEMS)
                logEvent(
                    'AI Agent',
                    'Imported 24 line items from JPS_specs.pdf (85% template, 15% fallback)',
                    'ai'
                )
            }, 1400)
        )

        // t=3600ms — stagger finishes (24 × 80ms), enter the mapping beat.
        // Every row is now showing its TEMPLATE / FALLBACK chip; we resolve
        // them to the real category sequentially, 40ms apart.
        timers.push(
            setTimeout(() => {
                setW21Phase('mapping-bom')
                setImportStatus('Mapping products to labor categories…')
                logEvent(
                    'AI Agent',
                    'Mapping products to labor categories',
                    'ai'
                )
            }, 3600)
        )

        // t=3700 → 3700 + 24×40 = 4660ms — chips resolve one by one
        const itemCount = JPS_LINE_ITEMS.length
        for (let i = 0; i < itemCount; i++) {
            timers.push(
                setTimeout(() => setMappingResolvedCount(i + 1), 3700 + i * 40)
            )
        }

        // t=4700ms — mapping complete, drop the import status
        timers.push(
            setTimeout(() => {
                setImportStatus(null)
                logEvent(
                    'AI Agent',
                    'Mapped 24 items · 21 template, 3 fallback',
                    'ai'
                )
            }, 4700)
        )

        // t=4900ms — scope breach alert (Pain #6: 119 chairs > 50 limit)
        // Per the doc §3, "scope limit enforcement runs first" — so this
        // fires after mapping resolves but before any calculation.
        timers.push(
            setTimeout(() => {
                setW21Phase('scope-breach')
                setScopeBreachOpen(true)
                setScopeBreachActive(true)
                logEvent(
                    'AI Agent',
                    'Scope override · 119 KD chairs > 50 (Delivery Pricer limit)',
                    'ai'
                )
            }, 4900)
        )

        // t=5100 → 6700ms — dual-engine calculation beat (Agent Step 4)
        // Hero's calcProgress rAFs from 0 → 1 with an easeOutCubic curve so
        // every visible value counts up live.
        timers.push(
            setTimeout(() => {
                logEvent(
                    'AI Agent',
                    'Running dual-engine calculation · installation + delivery',
                    'ai'
                )
                const duration = 1600
                const start = performance.now()
                const tick = (now: number) => {
                    const elapsed = now - start
                    const p = Math.min(1, elapsed / duration)
                    // easeOutCubic
                    const eased = 1 - Math.pow(1 - p, 3)
                    setCalcProgress(eased)
                    if (p < 1) {
                        calcRafRef.current = requestAnimationFrame(tick)
                    } else {
                        calcRafRef.current = null
                        logEvent(
                            'AI Agent',
                            'Draft produced · line items + margin + crew',
                            'ai'
                        )
                    }
                }
                calcRafRef.current = requestAnimationFrame(tick)
            }, 5100)
        )

        // t=6900ms — flag OFS Serpentine (row 19) + show Escalate banner
        timers.push(
            setTimeout(() => {
                setW21Phase('flagged')
                setFlaggedRowIds(['li-19'])
                logEvent(
                    'AI Agent',
                    'Flagged OFS Serpentine 12-seat lounge for designer review',
                    'ai'
                )
            }, 6900)
        )

        return () => {
            timers.forEach(clearTimeout)
            if (calcRafRef.current !== null) {
                cancelAnimationFrame(calcRafRef.current)
                calcRafRef.current = null
            }
        }
    }, [stepId])

    // ── w2.1 auto-open waterfall ─────────────────────────────────────────────
    // The Expert's role in w2.1 is supervisory — they watch the assembly run.
    // Instead of requiring a manual click on the Generate Proposal CTA, the
    // Shell simulates a click on the CTA (pulse + ring + scale-95) and then
    // opens the waterfall. The VerificationLogCard (Phase 7.5) sits above
    // the hero so the user reads it first.
    useEffect(() => {
        if (stepId !== 'w2.1') {
            setGenerateCtaPressed(false)
            return
        }
        // t=1800 ms — simulate the press on Generate Proposal (CTA glows)
        // t=2600 ms — waterfall modal slides in
        // t=2900 ms — clear the pressed state so it's ready to replay on restart
        const pressTimer = setTimeout(() => setGenerateCtaPressed(true), 1800)
        const openTimer = setTimeout(() => setIsWaterfallOpen(true), 2600)
        const clearTimer = setTimeout(() => setGenerateCtaPressed(false), 2900)
        return () => {
            clearTimeout(pressTimer)
            clearTimeout(openTimer)
            clearTimeout(clearTimer)
        }
    }, [stepId])

    // ── w1.2 designer task notification ──────────────────────────────────────
    // When the demo enters w1.2, show a centred task notification on a
    // dimmed backdrop BEFORE the DesignerVerificationOverlay slides in. The
    // user has to click 'Open task' to advance — this gives the handoff a
    // concrete anchor instead of the overlay appearing from nowhere.
    useEffect(() => {
        if (stepState !== 'estimation-escalated') {
            setDesignerTaskOpened(false)
        }
    }, [stepState])

    // ── w1.2 scroll-into-view ────────────────────────────────────────────────
    // Only fires after the user clicks the DesignerTaskNotification — that
    // way the scroll happens in sync with the side panel sliding in, not
    // while the task-inbox modal is still on top.
    useEffect(() => {
        if (stepState !== 'estimation-escalated' || !designerTaskOpened) return
        const timer = setTimeout(() => {
            const row = document.querySelector('tr[data-row-id="li-19"]')
            if (row) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [stepState, designerTaskOpened])

    // ── Handoff banner (fires when step role changes) ────────────────────────
    const prevStepIdRef = useRef<string | undefined>(undefined)
    const [handoff, setHandoff] = useState<{
        fromUser: NonNullable<typeof connectedUser>
        toUser: NonNullable<typeof connectedUser>
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

        // Skip the HandoffBanner for steps that already have their own
        // inline arrival surface (DesignerTaskNotification on w1.2, etc.)
        // so we don't duplicate the "role changed" cue.
        if (stepId === 'w1.2') return

        setHandoff({
            fromUser: prevRole,
            toUser: connectedUser,
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

    const handleSendForReview = (dealerId: string) => {
        // Refinement Phase 3 + 7.3: closes the waterfall, plays a handoff
        // transition, then advances to w2.2
        const dealer = DEALERS.find((d) => d.id === dealerId)
        const formatted = Number(estimate.salesPrice).toLocaleString('en-US', {
            maximumFractionDigits: 0,
        })
        logEvent(
            'David Park',
            `Sent $${formatted} proposal to ${dealer?.name ?? 'dealer'} for review`,
            'approval'
        )
        setIsWaterfallOpen(false)
        triggerHandoff(
            ROLE_PROFILES.Expert,
            dealer
                ? { name: dealer.name, role: dealer.role, photo: dealer.photo }
                : ROLE_PROFILES.Dealer,
            `Sending $${formatted} proposal for review`
        )
    }

    // ── w2.2 — Proposal review handlers ──────────────────────────────────────
    const handleRequestClarification = () => {
        logEvent('Sara Chen', 'Opened Request Clarification form', 'edit')
        setIsClarificationOpen(true)
    }

    const handleClarificationSent = (topic: string, _message: string) => {
        logEvent(
            'Sara Chen',
            `Clarification request sent to David Park · ${topic}`,
            'edit'
        )
    }

    const handlePreviewProposalPdf = () => {
        logEvent('Sara Chen', 'Previewed proposal PDF before release', 'edit')
        setIsProposalPdfOpen(true)
    }

    const handleApproveRelease = () => {
        logEvent('Sara Chen', 'Initiated approval chain', 'approval')
        setIsApprovalOpen(true)
    }

    const handleApprovalChainComplete = () => {
        // All 4 signatures collected → swap approval modal for the release modal
        logEvent(
            'System',
            'Approval chain complete · David / Alex / Sara / Jordan',
            'approval'
        )
        logEvent(
            'System',
            `Released $${Number(estimate.salesPrice).toLocaleString('en-US', {
                maximumFractionDigits: 0,
            })} proposal to JPS Health Network`,
            'release'
        )
        setIsApprovalOpen(false)
        setIsReleaseOpen(true)
    }

    const handleReleaseDownloadPdf = () => {
        console.log('Download JPS_proposal.pdf')
    }

    const handleContinueToDelivery = () => {
        // v7 · close the release modal and trigger the Sara → Riley handoff
        // transition. onComplete fires nextStep() → w2.3 (Client delivery).
        setIsReleaseOpen(false)
        setApprovedAt(Date.now())
        logEvent(
            'System',
            'Proposal routed to Sales Coordinator for client representative handoff',
            'ai'
        )
        triggerHandoff(
            ROLE_PROFILES.Dealer,
            ROLE_PROFILES['Sales Coordinator'],
            'Routing approved proposal to Sales Coordinator for representative handoff'
        )
    }

    const handleRestartDemo = () => {
        // Reset every piece of Shell state and jump the demo profile back to w1.1
        setIsReleaseOpen(false)
        setIsApprovalOpen(false)
        setIsWaterfallOpen(false)
        setIsAiModalOpen(false)
        setCustomer(JPS_CUSTOMER)
        setLineItems(JPS_LINE_ITEMS)
        setVariables(INITIAL_VARIABLES)
        setConfig(INITIAL_CONFIG)
        setLastFile(null)
        setActiveTab('ESTIMATOR')
        setSavedEstimates(MOCK_SAVED_ESTIMATES)
        // Refinement Phase 2: reset the w1.1 beat state so the restart replays it
        setW21Phase('idle')
        setImportStatus(null)
        setScopeBreachOpen(false)
        setScopeBreachActive(false)
        setFlaggedRowIds([])
        // Refinement Phase 7.1: restore mapping to "all resolved" for the
        // next w1.1 entry (the beat effect re-sets it to 0 on its own).
        setMappingResolvedCount(Infinity)
        // Refinement Phase 7.2: snap calc progress back to 1 so the hero
        // shows real numbers between runs; the w1.1 beat will drop it to 0.
        setCalcProgress(1)
        if (calcRafRef.current !== null) {
            cancelAnimationFrame(calcRafRef.current)
            calcRafRef.current = null
        }
        // Refinement Phase 7.3: dismiss any pending handoff transition
        setHandoff2(null)
        // Refinement Phase 7.4 + 7.5 + v7: clear every handoff timestamp
        setEscalatedAt(null)
        setVerifiedAt(null)
        setApprovedAt(null)
        // v7 · reset the designer task notification gate
        setDesignerTaskOpened(false)
        // v7 · clear any lingering Generate Proposal press animation
        setGenerateCtaPressed(false)
        // Refinement Phase 6d: clear audit log so the new session starts fresh
        setAuditLog([])
        if (goToStep) goToStep(0)
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

            {/* Tab content */}
            <main>
                {isInitialLoading ? (
                    <div className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-pulse">
                        <div className="h-32 bg-muted/40 rounded-2xl" />
                        <div className="h-64 bg-muted/30 rounded-2xl" />
                        <div className="h-96 bg-muted/20 rounded-2xl" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'ESTIMATOR' && stepState === 'client-delivery' && (
                            <div key="CLIENT-DELIVERY" className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
                                {handoff && (
                                    <HandoffBanner
                                        fromUser={handoff.fromUser}
                                        toUser={handoff.toUser}
                                        message={handoff.message}
                                        onDismiss={() => setHandoff(null)}
                                    />
                                )}
                                <ClientProposalDelivery
                                    proposalPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                                        maximumFractionDigits: 0,
                                    })}
                                    clientName={customer.name}
                                    approvedBy={ROLE_PROFILES.Dealer.name}
                                    approvedAt={approvedAt ?? Date.now()}
                                    onRestart={handleRestartDemo}
                                    onSent={() => {
                                        logEvent(
                                            ROLE_PROFILES['Sales Coordinator'].name,
                                            'Representative-facing PDF sent to JPS Health Network rep',
                                            'edit'
                                        )
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'ESTIMATOR' && stepState !== 'client-delivery' && (
                            <div key="ESTIMATOR" className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-fade-in">

                                {/* v7 · inline handoff banner (replaces the former fixed toast) */}
                                {handoff && (
                                    <HandoffBanner
                                        fromUser={handoff.fromUser}
                                        toUser={handoff.toUser}
                                        message={handoff.message}
                                        onDismiss={() => setHandoff(null)}
                                    />
                                )}

                                {/* v7 · w1.2 · Dupler-style task notification (top of the page,
                                    mutually exclusive with the DesignerVerificationOverlay) */}
                                {stepId === 'w1.2' && !designerTaskOpened && (
                                    <DesignerTaskNotification
                                        fromUser={ROLE_PROFILES.Expert}
                                        taskTitle="OFS Serpentine ready for verification"
                                        taskSummary="Custom product — check connection hardware and confirm the 14 h assembly estimate. 5 modules to validate before sending back."
                                        onOpen={() => {
                                            logEvent(
                                                ROLE_PROFILES.Designer.name,
                                                'Opened verification task from inbox',
                                                'edit'
                                            )
                                            setDesignerTaskOpened(true)
                                        }}
                                    />
                                )}

                                {/* Phase 4: Project Dossier — combobox filters + audit trail slot */}
                                <EstimatorDossierCard
                                    customer={customer}
                                    onCustomerChange={setCustomer}
                                    onRateLookup={handleRateLookup}
                                    isSearchingRates={isSearchingRates}
                                    presets={savedEstimates}
                                    onLoadPreset={handleLoadEstimate}
                                    readOnly={isProposalReview}
                                    rightSlot={
                                        <AuditTrailPanel
                                            events={auditLog}
                                            hidden={stepState === 'estimation-escalated'}
                                        />
                                    }
                                />

                                {/* Refinement Phase 7.5: Verification log card (w2.1 preamble)
                                    — lives ABOVE the hero so it frames the Generate Proposal CTA
                                    the designer just approved. */}
                                {stepId === 'w2.1' && verifiedAt && (
                                    <VerificationLogCard
                                        verifiedByName={ROLE_PROFILES.Designer.name}
                                        verifiedByPhoto={ROLE_PROFILES.Designer.photo}
                                        verifiedAt={verifiedAt}
                                    />
                                )}

                                {/* Phase 5 + Refinement 7.2: Financial Summary Hero with dual-engine calc beat */}
                                <FinancialSummaryHero
                                    estimate={estimate}
                                    onGenerateProposal={handleGenerateProposal}
                                    hideGenerateCTA={isProposalReview}
                                    calculationProgress={calcProgress}
                                    pulseGenerateCTA={generateCtaPressed}
                                />

                                {/* Refinement Phase 2: Scope breach alert (transient) */}
                                {stepId === 'w1.1' && (
                                    <ScopeBreachAlert
                                        isOpen={scopeBreachOpen}
                                        category="KD task chairs"
                                        count={119}
                                        limit={50}
                                        onDismiss={() => setScopeBreachOpen(false)}
                                    />
                                )}

                                {/* Refinement Phase 2: Flagged item banner (above the BoM so the
                                    Escalate CTA sits between the hero and the list, not after it) */}
                                {stepId === 'w1.1' && (
                                    <FlaggedItemBanner
                                        isOpen={w21Phase === 'flagged'}
                                        count={1}
                                        itemLabel="OFS Serpentine 12-seat curved lounge"
                                        reason="Custom product · designer verification recommended"
                                        onEscalate={() => {
                                            logEvent(
                                                'David Park',
                                                'Escalated OFS Serpentine to Alex Rivera',
                                                'edit'
                                            )
                                            setEscalatedAt(Date.now())
                                            triggerHandoff(
                                                ROLE_PROFILES.Expert,
                                                ROLE_PROFILES.Designer,
                                                'Escalating OFS Serpentine for verification'
                                            )
                                        }}
                                    />
                                )}

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
                                    readOnly={isProposalReview}
                                    staggerImport={stepId === 'w1.1' && (w21Phase === 'importing-bom' || w21Phase === 'mapping-bom' || w21Phase === 'scope-breach')}
                                    flaggedRowIds={flaggedRowIds}
                                    importStatus={importStatus}
                                    focusedRowId={stepState === 'estimation-escalated' ? 'li-19' : null}
                                    confidenceMap={confidenceMap}
                                    scopeBreachBadge={scopeBreachBadge}
                                    mappingResolvedCount={mappingResolvedCount}
                                />

                                {/* Phase 7: Operational Constraints */}
                                <OperationalConstraintsPanel
                                    variables={variables}
                                    onVariablesChange={setVariables}
                                    crewSize={estimate.crewSize}
                                    readOnly={isProposalReview}
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

            {/* Phase 13 + Refinement Phase 3: Pricing Waterfall with live numbers */}
            <PricingWaterfall
                isOpen={isWaterfallOpen}
                onClose={() => setIsWaterfallOpen(false)}
                onSendForReview={handleSendForReview}
                productList={JPS_PRODUCT_LIST}
                discount={JPS_CONTRACT_DISCOUNT}
                labor={parseFloat(estimate.salesPrice) || 0}
                freight={JPS_FREIGHT}
                dealers={DEALERS}
            />

            {/* Phase 14 + Refinement 7.4: Designer Verification Overlay with provenance */}
            <DesignerVerificationOverlay
                isOpen={stepState === 'estimation-escalated' && designerTaskOpened}
                onSendBack={() => {
                    logEvent(
                        'Alex Rivera',
                        'Verified OFS Serpentine · 14 h install (modular assembly confirmed)',
                        'edit'
                    )
                    setVerifiedAt(Date.now())
                    triggerHandoff(
                        ROLE_PROFILES.Designer,
                        ROLE_PROFILES.Expert,
                        'Returning verified module to Expert'
                    )
                }}
                onPreviewPdf={() => console.log('Preview PDF')}
                escalationContext={
                    escalatedAt
                        ? {
                              fromName: ROLE_PROFILES.Expert.name,
                              fromRole: ROLE_PROFILES.Expert.role,
                              fromPhoto: ROLE_PROFILES.Expert.photo,
                              reason: 'Custom product · OFS Serpentine 12-seat curved lounge needs designer verification of connection hardware + assembly time',
                              receivedAt: escalatedAt,
                              itemRef: 'li-19',
                          }
                        : undefined
                }
                onScrollToItem={(rowId) => {
                    const row = document.querySelector(`tr[data-row-id="${rowId}"]`)
                    if (row) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }}
            />

            {/* Refinement Phase 1: w2.2 — Proposal review action bar */}
            {isProposalReview && (
                <ProposalActionBar
                    salesPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                        maximumFractionDigits: 0,
                    })}
                    onRequestClarification={handleRequestClarification}
                    onPreviewPdf={handlePreviewProposalPdf}
                    onApproveRelease={handleApproveRelease}
                />
            )}

            {/* v7 · w2.2 — Request Clarification modal (Sara → David) */}
            <RequestClarificationModal
                isOpen={isClarificationOpen}
                onClose={() => setIsClarificationOpen(false)}
                onSent={handleClarificationSent}
            />

            {/* v7 · w2.2 — Proposal PDF preview (reused by the Preview PDF CTA) */}
            <ProposalPdfPreviewModal
                isOpen={isProposalPdfOpen}
                onClose={() => setIsProposalPdfOpen(false)}
                clientName={customer.name}
                productList={JPS_PRODUCT_LIST}
                discount={JPS_CONTRACT_DISCOUNT}
                labor={Number(estimate.totalCost)}
                freight={JPS_FREIGHT}
            />

            {/* Refinement Phase 1: w2.2 — Approval chain */}
            <ApprovalChainModal
                isOpen={isApprovalOpen}
                onClose={() => setIsApprovalOpen(false)}
                onComplete={handleApprovalChainComplete}
            />

            {/* Refinement Phase 1 + v7: w2.2 — Release success → continue to w2.3 */}
            <ReleaseSuccessModal
                isOpen={isReleaseOpen}
                salesPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                    maximumFractionDigits: 0,
                })}
                clientName={customer.name}
                auditLog={auditLog}
                onDownloadPdf={handleReleaseDownloadPdf}
                onContinueToDelivery={handleContinueToDelivery}
            />

            {/* Refinement Phase 6d · v7 · Audit trail panel lives inside the
                Dossier card's rightSlot, not as a separate floating element. */}

            {/* Refinement Phase 7.3: Role handoff transition — plays between
                nextStep() calls on every role change */}
            {handoff2 && (
                <RoleHandoffTransition
                    isOpen={!!handoff2}
                    fromUser={handoff2.from}
                    toUser={handoff2.to}
                    message={handoff2.message}
                    onComplete={handleHandoffComplete}
                />
            )}

            {/* v7 · legacy DealerArrivalToast + AgentRoutingToast were removed —
                HandoffBanner (inline) now covers every role transition on its own. */}
        </div>
    )
}
