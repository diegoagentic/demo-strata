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
import { Check, MousePointer2, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { useDemo } from '../../context/DemoContext'
import CoreConnectionModal from './CoreConnectionModal'
import type { CorePhase, CursorTarget } from './CoreConnectionModal'
import ProjectContextPanel from './ProjectContextPanel'
import DualEngineCalculation from './DualEngineCalculation'
import CoreOutlookCard from './CoreOutlookCard'
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
import PMExecutionHandoff from './PMExecutionHandoff'
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
    // During w2.2 "Approve & Release", the Shell temporarily redirects to
    // David Park's workspace so the audience watches the notification land
    // in his actual interface before the chain modal opens.
    // See handleApproveRelease below.

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
    const [davidApprovalActive, setDavidApprovalActive] = useState(false)
    const [davidSigned, setDavidSigned] = useState(false)
    const [davidCardVisible, setDavidCardVisible] = useState(false)
    const [davidCursorShown, setDavidCursorShown] = useState(false)
    const [davidClicked, setDavidClicked] = useState(false)
    const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>(MOCK_SAVED_ESTIMATES)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    // ── w1.1 beat timeline state (refinement Phase 2 + 7.1) ──────────────────
    type W21Phase =
        | 'idle'
        | 'importing-files'
        | 'loading-dossier'
        | 'importing-bom'
        | 'mapping-bom'
        | 'scope-breach'
        | 'flagged'
    const [w21Phase, setW21Phase] = useState<W21Phase>('idle')
    // w1.1 pre-phase · CORE connection modal + navbar highlight
    const [importModalOpen, setImportModalOpen] = useState(false)
    const [importModalPhase, setImportModalPhase] = useState<CorePhase>('source-picker')
    const [importModalProgress, setImportModalProgress] = useState(0)
    const [importCursorTarget, setImportCursorTarget] = useState<CursorTarget>(null)
    const [importCursorClicked, setImportCursorClicked] = useState(false)
    const [highlightImportButton, setHighlightImportButton] = useState(false)
    // v8 Paso E · Gap F + B · CORE ↔ Outlook beat cards
    const [outlookIncomingVisible, setOutlookIncomingVisible] = useState(false)
    const [outlookOutgoingVisible, setOutlookOutgoingVisible] = useState(false)
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
    //   importing-files → loading-dossier → importing-bom (stagger) →
    //   scope-breach → flagged
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
        setW21Phase('importing-files')
        setHighlightImportButton(false) // stays false while outlook card shows
        setImportModalOpen(false)
        setImportModalPhase('source-picker')
        setImportModalProgress(0)
        setImportCursorTarget(null)
        setImportCursorClicked(false)
        setOutlookIncomingVisible(true) // v8 Paso E · Gap F — CORE → Outlook
        setOutlookOutgoingVisible(false)
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

        // ─── Pre-phase · CORE ↔ Outlook + connection flow ────────────────
        // v8 Paso E · Gap F adds a 1.8 s beat at t=0 where the CORE →
        // Outlook incoming card explains why David is opening CORE. After
        // that, the original Paso A flow runs unchanged (navbar Import
        // button pulse → CoreConnectionModal with 9 phases). All
        // subsequent w1.1 timers are offset by IMPORT_OFFSET so the rest
        // of the narrative plays with the extra 1.8 s shift.
        const OUTLOOK_LEAD = 1800 // ms · outlook card + import pulse overlap
        const IMPORT_OFFSET = 11200 // ms (= 9400 legacy + 1800 outlook lead)

        // t=0 — outlook card is already visible (set above)
        logEvent(
            'System',
            'CORE → Outlook · new estimating request assigned to David Park',
            'system'
        )

        // t=1500ms — navbar Import button starts pulsing (outlook card
        // still visible for the last 300 ms)
        timers.push(
            setTimeout(() => setHighlightImportButton(true), 1500)
        )

        // t=1800ms — outlook card auto-dismisses
        timers.push(
            setTimeout(() => setOutlookIncomingVisible(false), OUTLOOK_LEAD)
        )

        // t=2300ms — "click" navbar Import button · modal opens on source picker
        timers.push(
            setTimeout(() => {
                setHighlightImportButton(false)
                setImportModalOpen(true)
                setImportModalPhase('source-picker')
                logEvent('David Park', 'Opened new project ingestion dialog', 'edit')
            }, OUTLOOK_LEAD + 500)
        )

        // Cursor lands on "Connect to CORE" card
        timers.push(setTimeout(() => setImportCursorTarget('connect-core'), OUTLOOK_LEAD + 900))
        // "Click" the card
        timers.push(setTimeout(() => setImportCursorClicked(true), OUTLOOK_LEAD + 1500))

        // Transition to CORE login, reset cursor
        timers.push(
            setTimeout(() => {
                setImportModalPhase('core-login')
                setImportCursorTarget(null)
                setImportCursorClicked(false)
            }, OUTLOOK_LEAD + 2000)
        )

        // Cursor lands on Authenticate button
        timers.push(setTimeout(() => setImportCursorTarget('core-authenticate'), OUTLOOK_LEAD + 2500))
        // "Click" authenticate
        timers.push(setTimeout(() => setImportCursorClicked(true), OUTLOOK_LEAD + 3100))

        // Transition to connecting spinner
        timers.push(
            setTimeout(() => {
                setImportModalPhase('core-connecting')
                setImportCursorTarget(null)
                setImportCursorClicked(false)
                logEvent('System', 'CORE · secure session established', 'system')
            }, OUTLOOK_LEAD + 3500)
        )

        // Transition to CORE dashboard (estimating queue)
        timers.push(
            setTimeout(() => {
                setImportModalPhase('core-dashboard')
                logEvent(
                    'David Park',
                    'Browsing CORE estimating queue · 5 projects pending',
                    'edit'
                )
            }, OUTLOOK_LEAD + 4500)
        )

        // Cursor lands on JPS row
        timers.push(setTimeout(() => setImportCursorTarget('project-jps'), OUTLOOK_LEAD + 5100))
        // "Click" JPS
        timers.push(setTimeout(() => setImportCursorClicked(true), OUTLOOK_LEAD + 5700))

        // Transition to project detail
        timers.push(
            setTimeout(() => {
                setImportModalPhase('core-project-detail')
                setImportCursorTarget(null)
                setImportCursorClicked(false)
                logEvent(
                    'David Park',
                    'Opened JPS Health Network project · 24 items · 3 attachments',
                    'edit'
                )
            }, OUTLOOK_LEAD + 6100)
        )

        // Cursor lands on "Pull into Strata"
        timers.push(setTimeout(() => setImportCursorTarget('pull-project'), OUTLOOK_LEAD + 6700))
        // "Click" pull
        timers.push(setTimeout(() => setImportCursorClicked(true), OUTLOOK_LEAD + 7200))

        // Transition to extracting · uploading
        timers.push(
            setTimeout(() => {
                setImportModalPhase('extracting-uploading')
                setImportModalProgress(15)
                setImportCursorTarget(null)
                setImportCursorClicked(false)
                logEvent(
                    'System',
                    'CORE · downloading JPS_PSS_ANCILLARY.pdf, JPS_Spec_Sheet.pdf, JPS_Contract.pdf',
                    'system'
                )
            }, OUTLOOK_LEAD + 7500)
        )

        // Parsing
        timers.push(
            setTimeout(() => {
                setImportModalPhase('extracting-parsing')
                setImportModalProgress(50)
            }, OUTLOOK_LEAD + 8000)
        )

        // Extracting
        timers.push(
            setTimeout(() => {
                setImportModalPhase('extracting-extracting')
                setImportModalProgress(80)
                logEvent(
                    'AI Agent',
                    'Extracting 24 line items from the CORE attachments…',
                    'ai'
                )
            }, OUTLOOK_LEAD + 8500)
        )

        // Done
        timers.push(
            setTimeout(() => {
                setImportModalPhase('extracting-done')
                setImportModalProgress(100)
            }, OUTLOOK_LEAD + 9000)
        )

        // Close modal and hand off to the existing narrative
        timers.push(
            setTimeout(() => {
                setImportModalOpen(false)
                setW21Phase('loading-dossier')
            }, OUTLOOK_LEAD + 9400)
        )

        // t=800ms  — dossier filled in (ZIP + address land) [offset]
        timers.push(
            setTimeout(() => {
                setCustomer(JPS_CUSTOMER)
                logEvent('AI Agent', 'Loaded CORE export · ZIP 76104 / Fort Worth', 'ai')
            }, IMPORT_OFFSET + 800)
        )

        // t=1100ms — AI import indicator appears above the BoM header
        timers.push(
            setTimeout(() => {
                setW21Phase('importing-bom')
                setImportStatus('Importing 24 items from JPS_specs.pdf…')
            }, IMPORT_OFFSET + 1100)
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
            }, IMPORT_OFFSET + 1400)
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
            }, IMPORT_OFFSET + 3600)
        )

        // t=3700 → 3700 + 24×40 = 4660ms — chips resolve one by one
        const itemCount = JPS_LINE_ITEMS.length
        for (let i = 0; i < itemCount; i++) {
            timers.push(
                setTimeout(
                    () => setMappingResolvedCount(i + 1),
                    IMPORT_OFFSET + 3700 + i * 40
                )
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
            }, IMPORT_OFFSET + 4700)
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
            }, IMPORT_OFFSET + 4900)
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
            }, IMPORT_OFFSET + 5100)
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
            }, IMPORT_OFFSET + 6900)
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
    // v8 · w2.1 (Sara/Salesperson) entry beat + auto-forward to SAC.
    // Paso E · Gap B adds a ~2.5 s CoreOutlookCard variant="outgoing" at
    // the top so the audience sees Strata writing back to CORE and CORE
    // triggering the Outlook notification before Sara's normal view takes
    // over. The hero's "Forward to SAC" press is then delayed by
    // OUTGOING_LEAD so the card is readable first.
    useEffect(() => {
        if (stepId !== 'w2.1') {
            setGenerateCtaPressed(false)
            setOutlookOutgoingVisible(false)
            return
        }
        const OUTGOING_LEAD = 2500 // ms · outgoing card visible at top
        setOutlookOutgoingVisible(true)
        logEvent(
            'System',
            'CORE · labor estimate + audit trail written back · Outlook notification triggered',
            'system'
        )
        const hideCard = setTimeout(
            () => setOutlookOutgoingVisible(false),
            OUTGOING_LEAD
        )
        const pressTimer = setTimeout(
            () => setGenerateCtaPressed(true),
            OUTGOING_LEAD + 1800
        )
        const forwardTimer = setTimeout(() => {
            handleForwardToSAC()
        }, OUTGOING_LEAD + 2600)
        const clearTimer = setTimeout(
            () => setGenerateCtaPressed(false),
            OUTGOING_LEAD + 2900
        )
        return () => {
            clearTimeout(hideCard)
            clearTimeout(pressTimer)
            clearTimeout(forwardTimer)
            clearTimeout(clearTimer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepId])

    // v8 · w2.2 (Riley/SAC) auto-opens the pricing waterfall so the
    // audience sees the quote assembly math before the approval checklist.
    useEffect(() => {
        if (stepId !== 'w2.2') return
        const openTimer = setTimeout(() => setIsWaterfallOpen(true), 1400)
        return () => clearTimeout(openTimer)
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
        duration?: number
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
        // v8 · In w2.1 Sara presses this CTA (relabelled "Forward to SAC").
        // handleForwardToSAC handles the Salesperson → SAC transition.
        // In any other step (not expected in v8), fall back to opening the
        // waterfall directly.
        if (stepId === 'w2.1') {
            handleForwardToSAC()
            return
        }
        setIsWaterfallOpen(true)
    }

    const handleForwardToSAC = () => {
        // v8 · w2.1 → w2.2 · Sara (Salesperson) forwards the approved labor
        // estimate to Riley (SAC) for quote assembly.
        const formatted = Number(estimate.salesPrice).toLocaleString('en-US', {
            maximumFractionDigits: 0,
        })
        logEvent(
            'Sara Chen',
            `Forwarded $${formatted} labor estimate to Riley Morgan (SAC) for quote assembly`,
            'approval'
        )
        triggerHandoff(
            ROLE_PROFILES.Dealer,
            ROLE_PROFILES['Sales Coordinator'],
            `Forwarding $${formatted} labor estimate to SAC for quote assembly`
        )
    }

    const handleSendForReview = (dealerId: string) => {
        // v8 · w2.2 · Riley picks the internal reviewer from the pricing
        // waterfall's dealer list. The pick only logs an audit entry and
        // closes the waterfall — the audience stays in w2.2 where the
        // ProposalActionBar lets Riley launch the release checklist.
        const dealer = DEALERS.find((d) => d.id === dealerId)
        const formatted = Number(estimate.salesPrice).toLocaleString('en-US', {
            maximumFractionDigits: 0,
        })
        logEvent(
            'Riley Morgan',
            `Assembled $${formatted} quote · routing to ${dealer?.name ?? 'internal reviewer'}`,
            'approval'
        )
        setIsWaterfallOpen(false)
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
        // Phase 1 — Sara initiates the chain. Open the modal with nobody
        // signed yet so the audience sees the empty chain for a beat.
        logEvent('Sara Chen', 'Initiated approval chain', 'approval')
        setDavidSigned(false)
        setIsApprovalOpen(true)

        // Phase 2 — after ~2.5 s, close the modal and redirect the Shell
        // to David's real workspace so the audience watches the
        // notification land in his Estimator view.
        setTimeout(() => {
            setIsApprovalOpen(false)
            logEvent(
                'Sara Chen',
                'Sent proposal to David Park for approval',
                'approval'
            )
            setDavidApprovalActive(true)
            setHandoff({
                fromUser: ROLE_PROFILES.Dealer,
                toUser: ROLE_PROFILES.Expert,
                message:
                    'Approval request · JPS Health Network · $202,138 awaiting your sign-off',
                // Keep the banner visible for the entire David detour so
                // the audience can read it at a comfortable pace.
                duration: 7500,
            })
            // Scroll the workspace to the top so the banner + approval
            // card are both on-screen when the detour lands.
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }

            // Approval card slides in ~1 s after the banner.
            setTimeout(() => setDavidCardVisible(true), 1000)

            // Halfway through, David "reviews" the line items and the
            // simulated cursor appears over the Approve button.
            setTimeout(() => {
                logEvent(
                    'David Park',
                    'Reviewing proposal line items · OFS Serpentine, Canvas workstations, freight',
                    'edit'
                )
                setDavidCursorShown(true)
            }, 2800)

            // Cursor "clicks" — button flips to Approved with a ring pulse.
            setTimeout(() => setDavidClicked(true), 4500)

            // Phase 3 — after David "reviews and approves" in his own
            // workspace, clear the redirect, mark David signed, and
            // re-open the chain modal to auto-advance Alex / Sara /
            // Jordan.
            setTimeout(() => {
                logEvent(
                    'David Park',
                    'Approved proposal from his workspace',
                    'approval'
                )
                setDavidApprovalActive(false)
                setHandoff(null)
                setDavidCardVisible(false)
                setDavidCursorShown(false)
                setDavidClicked(false)
                setDavidSigned(true)
                setIsApprovalOpen(true)
            }, 7000)
        }, 2500)
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
        setDavidSigned(false) // reset the two-phase gate for next run
        setIsReleaseOpen(true)
    }

    const handleReleaseDownloadPdf = () => {
        console.log('Download JPS_proposal.pdf')
    }

    const handleContinueToPMHandoff = () => {
        // v8 · close the release modal and trigger the Riley (SAC) → James
        // (PM) handoff. onComplete fires nextStep() → w2.3 (PM execution).
        setIsReleaseOpen(false)
        setApprovedAt(Date.now())
        logEvent(
            'System',
            'Quote released · routing execution plan to Senior Project Manager',
            'ai'
        )
        triggerHandoff(
            ROLE_PROFILES['Sales Coordinator'],
            ROLE_PROFILES['Project Manager'],
            'Handing approved quote to James Ortiz for execution planning'
        )
    }

    const handleRestartDemo = () => {
        // Reset every piece of Shell state and jump the demo profile back to w1.1
        setIsReleaseOpen(false)
        setIsApprovalOpen(false)
        setIsWaterfallOpen(false)
        setIsAiModalOpen(false)
        setDavidApprovalActive(false)
        setDavidSigned(false)
        setImportModalOpen(false)
        setImportModalPhase('source-picker')
        setImportModalProgress(0)
        setImportCursorTarget(null)
        setImportCursorClicked(false)
        setHighlightImportButton(false)
        setOutlookIncomingVisible(false)
        setOutlookOutgoingVisible(false)
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

    // When redirected to David's workspace during the w2.2 approval, swap
    // the navbar avatar to David so the audience knows whose view they are
    // looking at. Everything else in the workspace keeps its existing props.
    const effectiveConnectedUser = davidApprovalActive
        ? ROLE_PROFILES.Expert
        : connectedUser

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
                connectedUser={effectiveConnectedUser}
                highlightImport={highlightImportButton}
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
                        {activeTab === 'ESTIMATOR' && stepState === 'pm-handoff' && (
                            <div key="PM-HANDOFF" className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
                                {handoff && (
                                    <HandoffBanner
                                        fromUser={handoff.fromUser}
                                        toUser={handoff.toUser}
                                        message={handoff.message}
                                        duration={handoff.duration}
                                        onDismiss={() => setHandoff(null)}
                                    />
                                )}
                                <ProjectContextPanel defaultCollapsed={true} />
                                <PMExecutionHandoff
                                    proposalPrice={Number(estimate.salesPrice).toLocaleString('en-US', {
                                        maximumFractionDigits: 0,
                                    })}
                                    clientName={customer.name}
                                    approvedBy={ROLE_PROFILES['Sales Coordinator'].name}
                                    approvedAt={approvedAt ?? Date.now()}
                                    onRestart={handleRestartDemo}
                                    onAccepted={() => {
                                        logEvent(
                                            ROLE_PROFILES['Project Manager'].name,
                                            'Accepted execution plan · crews & tools assigned for weeks 8-10',
                                            'edit'
                                        )
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'ESTIMATOR' && stepState !== 'pm-handoff' && (
                            <div key="ESTIMATOR" className="pt-24 px-6 lg:px-10 max-w-7xl mx-auto space-y-6 animate-fade-in">

                                {/* v8 Paso E · Gap F · CORE → Outlook incoming
                                    (start of w1.1, before the CORE modal) */}
                                {outlookIncomingVisible && stepId === 'w1.1' && (
                                    <CoreOutlookCard
                                        variant="incoming"
                                        duration={1800}
                                        onDismiss={() => setOutlookIncomingVisible(false)}
                                    />
                                )}

                                {/* v8 Paso E · Gap B · Strata → CORE → Outlook outgoing
                                    (start of w2.1, before Sara's forward press) */}
                                {outlookOutgoingVisible && stepId === 'w2.1' && (
                                    <CoreOutlookCard
                                        variant="outgoing"
                                        duration={2500}
                                        onDismiss={() => setOutlookOutgoingVisible(false)}
                                    />
                                )}

                                {/* v7 · inline handoff banner (replaces the former fixed toast) */}
                                {handoff && (
                                    <HandoffBanner
                                        fromUser={handoff.fromUser}
                                        toUser={handoff.toUser}
                                        message={handoff.message}
                                        duration={handoff.duration}
                                        onDismiss={() => setHandoff(null)}
                                    />
                                )}

                                {/* v8 · Project Dossier always first on every page */}
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

                                {/* v8 Paso B · Project Context Panel — hidden only
                                    during the w1.1 CORE ingestion modal pre-phase. */}
                                {w21Phase !== 'importing-files' && (
                                    <ProjectContextPanel
                                        defaultCollapsed={stepState === 'estimation-escalated'}
                                    />
                                )}

                                {/* v7 · David's inline approval card — only while the
                                    Shell is redirected to David's workspace during the
                                    w2.2 Approve & Release flow. */}
                                {davidApprovalActive && (
                                    <div
                                        className={clsx(
                                            'transition-all duration-500',
                                            davidCardVisible
                                                ? 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-top-2'
                                                : 'opacity-0 -translate-y-2 pointer-events-none'
                                        )}
                                    >
                                        <div className="bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm overflow-hidden">
                                            <div className="flex items-start gap-4 px-5 py-4 bg-primary/5 dark:bg-primary/10 border-l-4 border-primary ring-1 ring-primary/20 rounded-r-2xl">
                                                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                                                    <ShieldCheck className="w-5 h-5 text-foreground dark:text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground">
                                                        Your approval required
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                                        Sara Chen sent the JPS Health Network proposal for your sign-off. Review the line items below and approve to move it into the 4-person chain.
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Total proposal
                                                            </p>
                                                            <p className="text-base font-black text-foreground tabular-nums">
                                                                $202,138
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Line items
                                                            </p>
                                                            <p className="text-base font-black text-foreground tabular-nums">
                                                                24
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                                Chain
                                                            </p>
                                                            <p className="text-base font-black text-foreground tabular-nums">
                                                                4 signers
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative shrink-0 self-center">
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className={clsx(
                                                            'flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/40 transition-all duration-200',
                                                            davidClicked &&
                                                                'scale-95 ring-4 ring-primary/60 shadow-xl shadow-primary/50'
                                                        )}
                                                    >
                                                        {davidClicked ? (
                                                            <>
                                                                <Check className="w-4 h-4" strokeWidth={3} />
                                                                Approved
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShieldCheck className="w-4 h-4" />
                                                                Approve proposal
                                                            </>
                                                        )}
                                                    </button>
                                                    {davidCursorShown && (
                                                        <MousePointer2
                                                            className={clsx(
                                                                'absolute -right-2 -bottom-3 w-5 h-5 text-foreground drop-shadow-lg pointer-events-none transition-all duration-300',
                                                                davidClicked
                                                                    ? 'translate-x-0 translate-y-0 scale-90'
                                                                    : 'translate-x-1 translate-y-1 animate-bounce'
                                                            )}
                                                            aria-hidden
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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

                                {/* Refinement Phase 7.5: Verification log card (w2.1 preamble)
                                    — frames the forward-to-SAC CTA with what the
                                    designer just approved. */}
                                {stepId === 'w2.1' && verifiedAt && (
                                    <VerificationLogCard
                                        verifiedByName={ROLE_PROFILES.Designer.name}
                                        verifiedByPhoto={ROLE_PROFILES.Designer.photo}
                                        verifiedAt={verifiedAt}
                                    />
                                )}

                                {/* v8 polish · Transient scope/mismatch alerts surface
                                    directly above the BoM they reference. */}
                                {stepId === 'w1.1' && (
                                    <ScopeBreachAlert
                                        isOpen={scopeBreachOpen}
                                        category="KD task chairs"
                                        count={119}
                                        limit={50}
                                        onDismiss={() => setScopeBreachOpen(false)}
                                    />
                                )}

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

                                {/* v8 polish · Critical manipulable surfaces promoted
                                    above the calculation outputs. BoM + Operational
                                    Constraints are the INPUT editors the estimator
                                    touches directly during the demo. */}
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

                                <OperationalConstraintsPanel
                                    variables={variables}
                                    onVariablesChange={setVariables}
                                    crewSize={estimate.crewSize}
                                    readOnly={isProposalReview}
                                />

                                {/* v8 Paso D · Dual-engine calculation (OUTPUT).
                                    Moved below the BoM/constraints so the inputs
                                    read as causes and the calc reads as effect. */}
                                {(stepId === 'w2.1' ||
                                    (stepId === 'w1.1' &&
                                        (w21Phase === 'scope-breach' ||
                                            w21Phase === 'flagged'))) && (
                                    <DualEngineCalculation
                                        progress={stepId === 'w1.1' ? calcProgress : 1}
                                    />
                                )}

                                {/* Phase 5 + Refinement 7.2 + v8: Financial Summary Hero
                                    (OUTPUT). Final number + step CTA. */}
                                <FinancialSummaryHero
                                    estimate={estimate}
                                    onGenerateProposal={handleGenerateProposal}
                                    hideGenerateCTA={isProposalReview}
                                    calculationProgress={calcProgress}
                                    pulseGenerateCTA={generateCtaPressed}
                                    ctaLabel={
                                        stepId === 'w2.1'
                                            ? 'Forward to SAC'
                                            : 'Generate Proposal'
                                    }
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

            {/* Refinement Phase 1: w2.2 — Proposal review action bar
                (hidden while the Shell is in David's workspace redirect) */}
            {isProposalReview && !davidApprovalActive && (
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

            {/* Refinement Phase 1: w2.2 — Approval chain.
                Two-phase: first opens empty for ~2 s while the Shell
                prepares the David redirect, then re-opens with David
                pre-signed and auto-chains through the rest. */}
            <ApprovalChainModal
                isOpen={isApprovalOpen}
                davidSigned={davidSigned}
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
                onContinueToDelivery={handleContinueToPMHandoff}
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

            {/* v8 Paso A · w1.1 opening · CORE connection simulation */}
            <CoreConnectionModal
                isOpen={importModalOpen}
                phase={importModalPhase}
                progress={importModalProgress}
                cursorTarget={importCursorTarget}
                cursorClicked={importCursorClicked}
            />

            {/* v7 · legacy DealerArrivalToast + AgentRoutingToast were removed —
                HandoffBanner (inline) now covers every role transition on its own. */}
        </div>
    )
}
