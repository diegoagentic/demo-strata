import {
    ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon,
    PlusIcon, CheckCircleIcon, DocumentTextIcon, CubeIcon,
    ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, EllipsisHorizontalIcon, SunIcon, MoonIcon,
    XMarkIcon, HomeIcon, Squares2X2Icon, ArrowTrendingUpIcon, ClipboardDocumentListIcon,
    UserIcon, CalendarIcon, ChartBarIcon, ExclamationCircleIcon, ArrowRightOnRectangleIcon, PencilSquareIcon, EnvelopeIcon, SparklesIcon, ArrowPathIcon,
    PaperAirplaneIcon, ChatBubbleLeftRightIcon, PhotoIcon, PaperClipIcon, ClockIcon, CheckIcon, PencilIcon, DocumentChartBarIcon
} from '@heroicons/react/24/outline'
import { Transition, TransitionChild, Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment } from 'react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useTheme } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/DemoProfileContext'
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge'
import { AIAgentAvatar } from './components/simulations/DemoAvatars'
import AgentPipelineStrip from './components/simulations/AgentPipelineStrip'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const items = [
    { id: "T-RCR306029HLG2", name: "TBL, REC, 30Dx60Wx29H", category: "Tables", tag: "A", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1261.00, discPct: 62.0, netPrice: 479.18, amount: 1916.72, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Confirmed", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "X-BBFPFS182812", name: "CBX Full Depth BBF Ped", category: "Storage", tag: "A", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1048.00, discPct: 62.0, netPrice: 398.24, amount: 1592.96, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Confirmed", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "W-WS3072", name: "WORKSURFACE RECT 30Dx72W", category: "Worksurfaces", tag: "B", qtyOrd: 6, qtyShip: 6, qtyBO: 0, listPrice: 656.00, discPct: 62.0, netPrice: 249.28, amount: 1495.68, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Confirmed", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "S-LATJJ2D36", name: 'LATERAL FILE 2 DRAWER 36"', category: "Storage", tag: "C", qtyOrd: 3, qtyShip: 3, qtyBO: 0, listPrice: 1492.00, discPct: 62.0, netPrice: 566.96, amount: 1700.88, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Confirmed", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "F-SSC346030C", name: 'LB LOUNGE 2 SEAT 34"H', category: "Seating", tag: "D", qtyOrd: 2, qtyShip: 0, qtyBO: 2, listPrice: 4836.00, discPct: 58.0, netPrice: 2031.12, amount: 4062.24, configs: ["Fabric: CF-6036 Ocean Blue", "Finish: LG2-Loft Gray"], status: "Exception: Finish", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning" },
    { id: "7730", name: "AUBURN GRAY CONFERENCE CHAIR", category: "Seating", tag: "D", qtyOrd: 12, qtyShip: 12, qtyBO: 0, listPrice: 1048.00, discPct: 55.0, netPrice: 471.60, amount: 5659.20, configs: ["Fabric: GR-5505 Charcoal", "Arms: ADJ-Adjustable"], status: "Confirmed", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "X-LTD661218L", name: "CBX Triple Door Locker", category: "Storage", tag: "E", qtyOrd: 8, qtyShip: 6, qtyBO: 2, listPrice: 1836.00, discPct: 62.0, netPrice: 697.68, amount: 5581.44, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike", "Shelf: 1-One Adjustable"], status: "Exception: Date", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning" },
    { id: "P-PN60HBF", name: "PANEL 60Hx48W FABRIC BOTH", category: "Panels", tag: "F", qtyOrd: 10, qtyShip: 10, qtyBO: 0, listPrice: 892.00, discPct: 62.0, netPrice: 338.96, amount: 3389.60, configs: ["Fabric: CF-6036 Ocean Blue", "Frame: LG2-Loft Gray"], status: "Confirmed", statusColor: "bg-zinc-100 text-zinc-700" },
]

interface Message {
    id: number | string;
    sender: string;
    avatar: string;
    content: React.ReactNode;
    time: string;
    type: 'system' | 'ai' | 'user' | 'action_processing' | 'action_success';
}

const DiscrepancyResolutionFlow = () => {
    const { currentStep, nextStep } = useDemo()
    const [status, setStatus] = useState<'initial' | 'requesting' | 'pending' | 'approved' | 'sending' | 'sent'>('initial')
    const [requestText, setRequestText] = useState('')
    const [shipmentResolution, setShipmentResolution] = useState('accept')

    const resolutions = [
        { id: 'accept', label: 'Accept new date (Nov 27, 2025)' },
        { id: 'expedite', label: 'Expedite Shipping (Nov 20, 2025)' },
        { id: 'cancel', label: 'Cancel Backordered Item' }
    ]

    const handleRequest = () => {
        setStatus('pending')
        setTimeout(() => setStatus('approved'), 3000)
    }

    const handleSendUpdate = () => {
        setStatus('sending')
        setTimeout(() => {
            setStatus('sent')
            if (currentStep.id === '2.3') {
                setTimeout(nextStep, 2000)
            }
        }, 1500)
    }

    if (status === 'initial') {
        return (
            <div data-demo-target="expert-ack-fix" className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium tracking-tight">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    Found 2 discrepancies against PO #ORD-2055.
                </div>

                {/* AI Recommendation Banner */}
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">AI Analysis Complete — DiscrepancyResolverAgent pre-analyzed both exceptions</p>
                        <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Exception 1:</span>
                                <ConfidenceScoreBadge score={91} label="Confidence" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Exception 2:</span>
                                <ConfidenceScoreBadge score={76} label="Confidence" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side-by-Side Comparison UI for Delta 1 */}
                <div className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden bg-white dark:bg-zinc-800/50 my-2">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-bold text-foreground flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                        Exception 1: Finish Backordered / Substitution Proposed
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Original PO (SKU-OFF-2025-003)</span>
                            <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-900/30 line-through">
                                Finish: Fabric / Navy
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Manufacturer Acknowledgement</span>
                            <div className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 p-2 rounded border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                                <span>Finish: Fabric / Azure</span>
                                <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded text-[9px] font-bold">IN STOCK</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Note for Exception 1 */}
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-800 -mt-1">
                    <SparklesIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-green-700 dark:text-green-400">Azure is catalog-equivalent to Navy. Same dimensions, price ($89/ea), and lead time. Confidence: 91%</span>
                </div>

                {/* Side-by-Side Comparison UI for Delta 2 */}
                <div className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden bg-white dark:bg-zinc-800/50 mb-2">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-bold text-foreground flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-amber-500" />
                        Exception 2: Ship Date Slipped
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Original PO (SKU-OFF-2025-006)</span>
                            <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-900/30 line-through">
                                Ship Date: Nov 15, 2025
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Manufacturer Acknowledgement</span>
                            <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 p-2 rounded border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                                <span>Ship Date: Nov 27, 2025</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">+12 Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Note for Exception 2 */}
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-800 -mt-1">
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">12-day slip impacts project timeline. Expedite available at +$800. Consider alternative vendor for faster delivery. Confidence: 76%</span>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 mt-2 mb-2">
                    <label className="block text-xs font-semibold text-zinc-900 dark:text-white mb-2">Select Resolution for Ship Date Slip:</label>
                    <select
                        className="w-full text-sm p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 ring-primary outline-none"
                        value={shipmentResolution}
                        onChange={(e) => setShipmentResolution(e.target.value)}
                    >
                        {resolutions.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 mt-1">
                    <button
                        onClick={handleRequest}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-zinc-900 hover:bg-primary/90 hover:shadow-md text-xs font-bold rounded-lg transition-all"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" /> Send Request
                    </button>
                    <button
                        onClick={() => setStatus('requesting')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                        <PencilIcon className="w-3.5 h-3.5" /> Request Revisions
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'requesting') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Describe required changes:</p>
                <textarea
                    className="w-full text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 ring-primary outline-none transition-all placeholder:text-zinc-400"
                    rows={3}
                    placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                    <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-primary transition-colors">
                        <PaperClipIcon className="w-4 h-4" /> Attach File
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatus('initial')}
                            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRequest}
                            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved' || status === 'sending' || status === 'sent') {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                    <CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-zinc-900 dark:text-zinc-100 font-bold mb-1">Exceptions approved. Records updated.</p>
                        <p className="text-zinc-700 dark:text-zinc-300">The Delivery Date has been updated to <span className="font-bold underline decoration-green-300 underline-offset-2">{shipmentResolution === 'expedite' ? 'Nov 20, 2025' : shipmentResolution === 'cancel' ? 'N/A' : 'Nov 27, 2025'}</span>.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden shadow-sm">
                    {status === 'sent' ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-center text-zinc-900 dark:text-white animate-in zoom-in duration-300">
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </div>
                            <p className="font-bold">Client Update Sent</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[280px]">The client has been notified of the adjustments and new estimated delivery date.</p>
                        </div>
                    ) : status === 'sending' ? (
                        <div className="p-10 flex flex-col items-center justify-center gap-3 animate-in fade-in">
                            <ArrowPathIcon className="w-6 h-6 animate-spin text-primary" />
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sending Client Update...</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                    <DocumentTextIcon className="w-4 h-4 text-primary" />
                                    Auto-Drafted Client Update
                                </div>
                                <span className="bg-primary/10 text-primary-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">Ready to Send</span>
                            </div>
                            <div className="p-3 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                                <p><span className="font-semibold text-zinc-900 dark:text-white">To:</span> client@automanufacture.com</p>
                                <p><span className="font-semibold text-zinc-900 dark:text-white">Subject:</span> Update regarding your recent order #ORD-2055</p>
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-100 dark:border-zinc-800 font-serif leading-relaxed italic text-zinc-600 dark:text-zinc-400">
                                    "Hi Team, just a quick update on Order #ORD-2055. The manufacturer noted that the Navy fabric for your Conference Room Chairs is currently backordered. We've proactively substituted it with the identical fabric in 'Azure', which is in stock, to ensure no delays. {shipmentResolution === 'expedite' ? "We've also upgraded the shipping to expedite the order, and your estimated ship date is now Nov 20, 2025." : shipmentResolution === 'accept' ? "Also, please note your estimated ship date has been updated to Nov 27, 2025." : "We've removed the backordered Lounge Chair from the order as it was severely delayed."} Let us know if you have any questions!"
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSendUpdate}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded shadow-sm transition-all"
                                    >
                                        <PaperAirplaneIcon className="w-3.5 h-3.5" /> Send Update
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 hover:bg-muted text-foreground text-xs font-medium rounded transition-all">
                                        <PencilSquareIcon className="w-3.5 h-3.5" /> Edit Draft
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                        <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">ACK_Revised_ORD-2055.pdf</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Updated just now</p>
                    </div>
                    <button className="p-2 hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary dark:hover:text-zinc-900 rounded-lg transition-colors group">
                        <ArrowDownTrayIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900" />
                    </button>
                </div>
            </div>
        )
    }

    return null
}

const DiscrepancyActionCard = ({ msg }: { msg: Message }) => {
    const [isRequesting, setIsRequesting] = useState(false)
    const [requestText, setRequestText] = useState('')
    const [status, setStatus] = useState<'initial' | 'pending' | 'approved'>('initial')

    const handleSubmit = () => {
        setStatus('pending')
        setTimeout(() => {
            setStatus('approved')
            setIsRequesting(false)
        }, 2000)
    }

    if (status === 'pending') {
        return (
            <div className={cn(
                "rounded-2xl p-4 shadow-sm bg-green-50 dark:bg-green-900/20 text-zinc-900 dark:text-zinc-100 border border-green-100 dark:border-green-800"
            )}>
                <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved') {
        return (
            <div className={cn(
                "rounded-2xl p-4 shadow-sm bg-green-50 dark:bg-green-900/20 text-zinc-900 dark:text-zinc-100 border border-green-100 dark:border-green-800"
            )}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{msg.sender}</span>
                    <span className="text-xs text-zinc-400">{msg.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Action Updated</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium mb-3">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p>Changes approved. PO updated.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-800/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                    <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                        <DocumentTextIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">PO_Revised_Final.pdf</p>
                        <p className="text-xs text-zinc-500">2.4 MB • Generated just now</p>
                    </div>
                    <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "rounded-2xl p-4 shadow-sm transition-all duration-300",
            isRequesting ? "ring-2 ring-indigo-500/20 bg-white dark:bg-zinc-800" : "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
        )}>
            {!isRequesting ? (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">{msg.sender}</span>
                        <span className="text-xs text-zinc-400">{msg.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Action Completed</span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">{msg.content}</p>

                    <div className="mt-3 space-y-3">
                        {/* PDF File */}
                        <div className="flex items-center gap-3 bg-white dark:bg-zinc-800/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                            <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                                <DocumentTextIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">PO_ORD-2055_Final.pdf</p>
                                <p className="text-xs text-zinc-500">2.4 MB • Generated just now</p>
                            </div>
                            <button className="p-2 hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary dark:hover:text-zinc-900 rounded-lg text-zinc-400 transition-colors group">
                                <ArrowDownTrayIcon className="h-5 w-5 group-hover:text-zinc-900" />
                            </button>
                        </div>

                        {/* Attention Selection */}
                        <div className="pl-4 border-l-4 border-amber-500 py-2 my-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                                        Attention Needed
                                    </p>
                                    <p className="text-sm text-zinc-900 dark:text-zinc-300 mt-1">
                                        Discrepancy detected for <span className="font-semibold text-zinc-900 dark:text-white">SKU-OFF-2025-003</span>:
                                    </p>
                                    <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Warehouse</span>
                                            <span className="text-zinc-900 dark:text-white font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">42</span>
                                        </div>
                                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Local</span>
                                            <span className="text-zinc-900 dark:text-white font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">35</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-sm transition-colors">
                                Sync Database
                            </button>
                            <button className="px-4 py-2 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary dark:hover:text-zinc-900 text-xs font-medium rounded-lg transition-colors">
                                Resolve Manually
                            </button>
                            <button
                                onClick={() => setIsRequesting(true)}
                                className="px-3 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-900 hover:bg-primary dark:hover:bg-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto group"
                            >
                                <PencilIcon className="w-3.5 h-3.5" />
                                Request Changes
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Describe required changes:</h4>
                        <button onClick={() => setIsRequesting(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <textarea
                        className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 border-0 rounded-lg p-3 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                        rows={3}
                        autoFocus
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                        <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <PaperClipIcon className="w-3.5 h-3.5" />
                            Attach File
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsRequesting(false)}
                                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg shadow-sm transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const collaborators = [
    { name: "David Park", role: "Regional Sales Mgr", status: "online", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { name: "Mike Ross", role: "Warehouse Lead", status: "offline", avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    { name: "AI Agent", role: "System Bot", status: "online", avatar: "AI" },
]

const documents = [
    { name: "Packing_Slip_2055.pdf", size: "245 KB", uploaded: "Jan 12, 2025" },
    { name: "Invoice_INV-8992.pdf", size: "1.2 MB", uploaded: "Jan 12, 2025" },
]

interface DetailProps {
    onBack: () => void;
    onLogout: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate?: (page: string) => void;
    initialTab?: number;
}

export default function AckDetail({ onBack, onLogout, onNavigateToWorkspace, onNavigate, initialTab }: DetailProps) {
    const { currentStep, isDemoActive, nextStep } = useDemo()
    const { activeProfile } = useDemoProfile()
    const isContinua = activeProfile.id === 'continua'
    const showAckSummary = isContinua && currentStep?.id === '2.3'
    const [activeTabIndex, setActiveTabIndex] = useState(initialTab || 0)

    // Auto-switch to AI Assistant tab when entering step 2.4
    useEffect(() => {
        if (currentStep.id === '2.4') {
            setActiveTabIndex(1);
        }
    }, [currentStep.id]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: "System",
            avatar: "",
            content: "AIS Sales Order 1151064-B received — Acknowledgement #ACK-3099 via EDI. 40 line items, Total Order: $127,880.17.",
            time: "10 mins ago",
            type: "system",
        },
        {
            id: 2,
            sender: "AI Assistant",
            avatar: "AI",
            content: "DiscrepancyResolverAgent compared Acknowledgement against PO #ORD-2055. Match rate: 95%. Found 2 exceptions — Item F-SSC346030C (finish backordered, substitution proposed) and X-LTD661218L (2 units backordered, ETA Nov 27).",
            time: "10 mins ago",
            type: "action_processing",
        },
        {
            id: 3,
            sender: "AI Assistant",
            avatar: "AI",
            content: <DiscrepancyResolutionFlow />,
            time: "9 mins ago",
            type: "ai",
        }
    ])
    const [selectedItem, setSelectedItem] = useState(items[0])
    const [sections, setSections] = useState({
        quickActions: true,
        productOverview: true,
        lifecycle: true,
        aiSuggestions: true
    })
    const [isPOModalOpen, setIsPOModalOpen] = useState(false)
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
    const [isAiDiagnosisOpen, setIsAiDiagnosisOpen] = useState(false)
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
    const [isManualFixMode, setIsManualFixMode] = useState(false)
    const [resolutionMethod, setResolutionMethod] = useState<'local' | 'remote' | 'custom'>('remote')
    const [customValue, setCustomValue] = useState('')

    const toggleSection = (key: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const { theme, toggleTheme } = useTheme()
    const { currentTenant } = useTenant()

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-200">
            {/* Floating Info Navbar */}
            <Navbar onLogout={onLogout} activeTab="Inventory" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate || (() => { })} />

            {/* Page Header (moved from original header, adjusted for floating nav) */}
            <div className="pt-24 px-6 pb-4 flex items-center justify-between border-b border-border bg-transparent transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button onClick={onBack} className="p-1 hover:bg-primary hover:text-zinc-900 dark:hover:text-zinc-900 rounded-md transition-colors">
                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                    </button>
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: onBack },
                            { label: 'Transactions', onClick: onBack },
                            { label: 'Acknowledgement #ACK-3099', active: true }
                        ]}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-primary hover:text-zinc-900 group transition-colors">
                        <FunnelIcon className="h-4 w-4 text-muted-foreground group-hover:text-zinc-900" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-primary hover:text-zinc-900 group transition-colors">
                        <ArrowDownTrayIcon className="h-4 w-4 text-muted-foreground group-hover:text-zinc-900" /> Export
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90">
                        <PlusIcon className="h-4 w-4" /> Add New Item
                    </button>
                </div>
            </div>

            <div className="flex flex-col p-6 gap-6">
                {/* Collapsible Summary — hidden for demo build */}
                {false && (isSummaryExpanded ? (
                    <>
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-0 transition-all duration-300">
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsSummaryExpanded(false)} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-900 transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-primary dark:hover:bg-primary px-2.5 py-1.5 rounded-lg">
                                    Hide Details <ChevronUpIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in zoom-in duration-300">
                                {[
                                    { label: 'MATCH RATE', value: '95%' },
                                    { label: 'LINE ITEMS', value: '40' },
                                    { label: 'TOTAL ORDER', value: '$127,880.17' },
                                    { label: 'P.O. REF', value: '#ORD-2055' },
                                    { label: 'SHIP VIA', value: 'Best Way' },
                                    { label: 'EXCEPTIONS', value: '2', color: 'text-amber-600 dark:text-amber-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
                                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className={cn("text-2xl font-bold tracking-tight", stat.color || "text-zinc-900 dark:text-white")}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Integrated Stepper - Matched to Dashboard */}
                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4 ml-1">Workflow Progress</h4>
                                <div className="relative pb-2">
                                    <div className="absolute top-3 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-700" />
                                    <div className="relative z-10 flex justify-between w-full max-w-4xl mx-auto px-4">
                                        {[
                                            { name: 'Received', status: 'completed' },
                                            { name: 'Matched', status: 'completed' },
                                            { name: 'Exceptions', status: 'current' },
                                            { name: 'Resolved', status: 'pending' },
                                            { name: 'Confirmed', status: 'pending' }
                                        ].map((step, i) => {
                                            const isCompleted = step.status === 'completed';
                                            const isCurrent = step.status === 'current';
                                            // Matching Dashboard logic: Completed & Current (active) use primary/brand colors. 
                                            // Dashboard uses index logic (i <= 1), here we use status.
                                            // Dashboard classes: h-6 w-6 rounded-full flex items-center justify-center
                                            // Active/Completed: bg-primary text-primary-foreground
                                            // Pending: bg-gray-200 dark:bg-zinc-700 text-gray-400

                                            // However, for correct visual flow in this context:
                                            // Completed: Primary Background, Check Icon
                                            // Current: Primary Background, Dot
                                            // Pending: Gray Background

                                            return (
                                                <div key={i} className="flex flex-col items-center bg-white dark:bg-zinc-800 px-1 group cursor-default">
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
                                                        isCompleted || isCurrent
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                                                    )}>
                                                        {isCompleted ? <CheckIcon className="w-4 h-4" /> :
                                                            isCurrent ? <div className="w-2 h-2 rounded-full bg-primary-foreground" /> :
                                                                <div className="w-2 h-2 rounded-full bg-white/50 dark:bg-zinc-600" />}
                                                    </div>
                                                    <span className={cn(
                                                        "mt-2 text-xs font-medium transition-colors duration-300",
                                                        isCompleted || isCurrent ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-500'
                                                    )}>
                                                        {step.name.split(' ')[0]}
                                                    </span>
                                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5">{step.name.split(' ').slice(1).join(' ')}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                            {[
                                { label: 'Match Rate', value: '95%' },
                                { label: 'Est. Delivery', value: 'Nov 27, 2025' },
                                { label: 'Exceptions', value: '2', color: 'text-amber-600 dark:text-amber-400' },
                                { label: 'Status', value: 'Review Needed', color: 'text-amber-600 dark:text-amber-400' },
                            ].map((stat, i) => (
                                <Fragment key={i}>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{stat.label}:</span>
                                        <span className={cn("text-lg font-bold leading-none mt-1", stat.color || "text-zinc-900 dark:text-white")}>{stat.value}</span>
                                    </div>
                                    {i < 3 && <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 hidden sm:block"></div>}
                                </Fragment>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            {/* Resolution Time Indicator */}
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Resolution Time</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ClockIcon className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">Under 10 mins</span>
                                    <span className="text-[10px] text-muted-foreground ml-1">(Industry Avg: 2-3 days)</span>
                                </div>
                            </div>

                            <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden lg:block mx-2"></div>

                            {/* Current Phase Indicator */}
                            <div className="flex items-center gap-3 hidden md:flex">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current Phase</span>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">Reviewing Exceptions</span>
                                </div>
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-900 dark:border-white bg-white dark:bg-zinc-800">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white" />
                                </div>
                            </div>

                            <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                            <button
                                onClick={() => setIsSummaryExpanded(true)}
                                className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors"
                            >
                                <div className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">Show Details</span>
                            </button>
                        </div>
                    </div>
                ))}



                {/* ═══ Continua Step 1.3 — ACK Validation Summary ═══ */}
                {showAckSummary && (
                    <div className="px-6 py-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                            <div className="flex items-center gap-2">
                                <AIAgentAvatar size="sm" />
                                <span className="text-xs font-bold text-red-700 dark:text-red-400">
                                    TrackingAgent — Price Discrepancy Detected on Knoll ACK
                                </span>
                            </div>
                            <ConfidenceScoreBadge score={96} label="Match Confidence" />
                        </div>

                        {/* Validation Summary Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">ACK Validation Report</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">12 POs tracked · 9 ACKs validated · 1 discrepancy</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                                    Dispute Required
                                </span>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Validation Steps */}
                                <div className="space-y-2">
                                    {[
                                        { label: 'PO monitoring active', detail: '12 active purchase orders tracked across 4 manufacturers', ok: true },
                                        { label: '9 ACKs validated', detail: 'Qty, price, delivery dates matched against PO terms', ok: true },
                                        { label: '3 ACKs pending', detail: 'Aging alerts generated — supplier follow-up queued', ok: true },
                                        { label: 'Knoll ACK discrepancy', detail: '+4% price increase on task chairs vs contracted rate', ok: false },
                                    ].map((step, i) => (
                                        <div key={i} className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg border",
                                            step.ok
                                                ? "bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20"
                                                : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
                                        )}>
                                            <div className={cn("w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0",
                                                step.ok ? "bg-green-500" : "bg-red-500"
                                            )}>
                                                {step.ok
                                                    ? <CheckIcon className="w-3.5 h-3.5" />
                                                    : <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground">{step.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dispute Draft Preview */}
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                    <div className="flex items-center gap-2 text-xs mb-2">
                                        <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
                                        <span className="font-bold text-amber-700 dark:text-amber-400">Auto-Generated Dispute Draft</span>
                                    </div>
                                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70">
                                        "Per contract KN-2026-001 Section 4.2, unit price for Task Chair (Model GN-304) is fixed at $1,295.
                                        ACK shows $1,347 (+4.01%). Requesting correction to contracted rate. Supporting documentation attached."
                                    </p>
                                </div>

                                {/* Synced Systems */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-muted-foreground font-medium">Synced:</span>
                                    {['Contract DB', 'PO Tracker', 'Vendor Portal', 'Dispute Queue'].map(sys => (
                                        <span key={sys} className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircleIcon className="w-3 h-3" /> {sys}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => { nextStep(); onBack(); }}
                                    className="w-full px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01] flex items-center justify-center gap-2"
                                >
                                    Continue to Step 1.4 — Warehouse Receiving
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex flex-col">
                    <TabGroup className="flex flex-col" selectedIndex={activeTabIndex} onChange={setActiveTabIndex}>
                        <div className="px-4 border-b border-border flex items-center justify-between bg-background">
                            <TabList className="flex gap-6">
                                <Tab
                                    className={({ selected }) =>
                                        cn(
                                            "py-4 text-sm font-medium border-b-2 outline-none transition-colors",
                                            selected
                                                ? "border-zinc-500 text-zinc-900 dark:border-primary dark:text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        )
                                    }
                                >
                                    Acknowledgement Items
                                </Tab>
                                <Tab
                                    className={({ selected }) =>
                                        cn(
                                            "py-4 text-sm font-medium border-b-2 outline-none transition-colors",
                                            selected
                                                ? "border-zinc-500 text-zinc-900 dark:border-primary dark:text-foreground"
                                                : "border-transparent text-muted-foreground hover:text-foreground"
                                        )
                                    }
                                >
                                    AI Assistant
                                </Tab>
                            </TabList>
                        </div>
                        <TabPanels className="">
                            <TabPanel className="flex flex-col focus:outline-none">
                                <div className="grid grid-cols-12 gap-6 p-6">
                                    {/* Left Panel: List */}
                                    <div className="col-span-8 flex flex-col bg-white dark:bg-zinc-800 border border-border rounded-lg shadow-sm">
                                        {/* Search and Filter Bar */}
                                        <div className="flex items-center justify-between p-4 border-b border-border">
                                            <div className="flex-1 max-w-lg relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search SKU, Product Name..."
                                                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button className="inline-flex items-center px-3 py-2 border border-input shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none">
                                                    All Materials
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </button>
                                                <button className="inline-flex items-center px-3 py-2 border border-input shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none">
                                                    Line Status
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                            <table className="min-w-full divide-y divide-border">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                                                            <input type="checkbox" className="h-4 w-4 rounded border-input text-zinc-900 dark:text-primary focus:ring-primary bg-background" />
                                                        </th>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Item #</th>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                                                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                                                        <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Price</th>
                                                        <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-zinc-800 divide-y divide-border">
                                                    {items.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => setSelectedItem(item)}
                                                            className={cn(
                                                                "cursor-pointer transition-colors hover:bg-muted/50",
                                                                selectedItem.id === item.id ? "bg-muted/80" : ""
                                                            )}
                                                        >
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <input type="checkbox" className="h-4 w-4 rounded border-input text-zinc-900 dark:text-primary focus:ring-primary bg-background" />
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className="text-sm font-mono font-medium text-foreground">{item.id}</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div>
                                                                    <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                                                        {item.name}
                                                                        {item.aiStatus && (
                                                                            <div className={cn(
                                                                                "h-2 w-2 rounded-full",
                                                                                item.aiStatus === 'warning' ? "bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]" : "bg-primary shadow-[0_0_0_2px_rgba(var(--primary),0.2)]"
                                                                            )} />
                                                                        )}
                                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600">Tag {item.tag}</span>
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-0.5">{item.configs.join(' · ')}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-center">
                                                                <div className="text-sm font-medium text-foreground">{item.qtyOrd}</div>
                                                                {item.qtyBO > 0 && (
                                                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">BO: {item.qtyBO}</div>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-right">
                                                                <div className="text-sm text-foreground">${item.netPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                                                                <div className="text-[10px] text-muted-foreground">-{item.discPct}%</div>
                                                            </td>
                                                            <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium text-foreground">
                                                                ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <span className={cn(
                                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                                    item.status === 'Confirmed' ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700" :
                                                                        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800"
                                                                )}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Right Panel: Details */}
                                    <div className="col-span-4 flex flex-col bg-white dark:bg-zinc-800 border border-border rounded-lg shadow-sm">
                                        {/* Details Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-border">
                                            <h3 className="text-lg font-semibold text-foreground">Item Details</h3>
                                            <div className="flex gap-1">
                                                <button onClick={() => setIsDocumentModalOpen(true)} className="p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                </button>
                                                <button className="p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <PaperAirplaneIcon className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setIsAiDiagnosisOpen(true)} className="relative p-1 text-indigo-600 hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <SparklesIcon className="h-4 w-4" />
                                                    <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-900" />
                                                </button>
                                                <div className="w-px h-4 bg-border mx-1 self-center" />
                                                <button className="p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <EllipsisHorizontalIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-6">
                                            {/* AI Side Panel Section */}
                                            {selectedItem.aiStatus && (
                                                <div>
                                                    <button
                                                        onClick={() => toggleSection('aiSuggestions')}
                                                        className="flex items-center justify-between w-full mb-2 group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <SparklesIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-sm font-bold text-foreground">AI Suggestions</span>
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                                            </span>
                                                        </div>
                                                        <ChevronDownIcon
                                                            className={cn(
                                                                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                                                sections.aiSuggestions ? "transform rotate-0" : "transform -rotate-90"
                                                            )}
                                                        />
                                                    </button>

                                                    {sections.aiSuggestions && (
                                                        selectedItem.aiStatus === 'info' ? (
                                                            <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                                                                <h4 className="text-sm font-bold text-foreground mb-2">Optimization Opportunity</h4>
                                                                <div className="space-y-2">
                                                                    <div className="p-2 bg-background border border-border rounded cursor-pointer hover:border-primary transition-colors">
                                                                        <div className="flex gap-2">
                                                                            <div className="mt-1 h-3 w-3 rounded-full border border-muted-foreground"></div>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-foreground">Standard {selectedItem.name}</div>
                                                                                <div className="text-xs text-muted-foreground">Listed Price</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-2 bg-background border-2 border-green-500 rounded cursor-pointer">
                                                                        <div className="flex gap-2">
                                                                            <div className="mt-1 h-3 w-3 rounded-full border-4 border-green-500"></div>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-green-700 dark:text-green-400">Eco-Friendly {selectedItem.name}</div>
                                                                                <div className="text-xs text-muted-foreground">-15% Carbon Footprint</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-2 bg-background border border-border rounded cursor-pointer hover:border-indigo-500 transition-colors">
                                                                        <div className="flex gap-2">
                                                                            <div className="mt-1 h-3 w-3 rounded-full border border-muted-foreground"></div>
                                                                            <div>
                                                                                <div className="text-sm font-medium text-indigo-700 dark:text-indigo-400">Premium {selectedItem.name}</div>
                                                                                <div className="text-xs text-muted-foreground">+ High Durability Finish</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <button className="w-full mt-1 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded shadow-sm transition-colors">
                                                                        Apply Selection
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                                                                <div className="flex gap-3">
                                                                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                                                    <div className="w-full">
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <h4 className="text-sm font-bold text-foreground">Database Discrepancy</h4>
                                                                                <p className="text-xs text-muted-foreground mt-1">Stock count mismatch detected.</p>
                                                                            </div>
                                                                            {!isManualFixMode && (
                                                                                <button
                                                                                    onClick={() => setIsManualFixMode(true)}
                                                                                    className="text-xs text-muted-foreground underline hover:text-foreground"
                                                                                >
                                                                                    Resolve Manually
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {!isManualFixMode ? (
                                                                            <>
                                                                                <div className="flex items-center justify-between mt-2 mb-3 px-2 py-2 bg-muted/50 rounded">
                                                                                    <div className="text-center">
                                                                                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Local</div>
                                                                                        <div className="text-sm font-bold text-foreground">{selectedItem.stock}</div>
                                                                                    </div>
                                                                                    <ArrowPathIcon className="h-4 w-4 text-muted-foreground" />
                                                                                    <div className="text-center">
                                                                                        <div className="text-[10px] text-muted-foreground uppercase font-medium">Remote</div>
                                                                                        <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{(selectedItem.stock || 0) + 5}</div>
                                                                                    </div>
                                                                                </div>
                                                                                <button className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded shadow-sm transition-colors">
                                                                                    Auto-Sync to Warehouse
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <div className="mt-3 space-y-2">
                                                                                {/* Manual Resolution Options */}
                                                                                <div
                                                                                    onClick={() => setResolutionMethod('local')}
                                                                                    className={cn(
                                                                                        "p-2 rounded cursor-pointer border",
                                                                                        resolutionMethod === 'local' ? "bg-card border-amber-500" : "border-transparent hover:bg-muted/50"
                                                                                    )}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className={cn("h-3 w-3 rounded-full border", resolutionMethod === 'local' ? "border-4 border-amber-500" : "border-zinc-400")}></div>
                                                                                        <div>
                                                                                            <div className="text-xs font-bold text-foreground">Keep Local Value</div>
                                                                                            <div className="text-[10px] text-muted-foreground">{selectedItem.stock} items</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div
                                                                                    onClick={() => setResolutionMethod('remote')}
                                                                                    className={cn(
                                                                                        "p-2 rounded cursor-pointer border",
                                                                                        resolutionMethod === 'remote' ? "bg-card border-amber-500" : "border-transparent hover:bg-muted/50"
                                                                                    )}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className={cn("h-3 w-3 rounded-full border", resolutionMethod === 'remote' ? "border-4 border-amber-500" : "border-zinc-400")}></div>
                                                                                        <div>
                                                                                            <div className="text-xs font-bold text-foreground">Accept Warehouse Value</div>
                                                                                            <div className="text-[10px] text-muted-foreground">{(selectedItem.stock || 0) + 5} items</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="flex gap-2 mt-3">
                                                                                    <button
                                                                                        onClick={() => setIsManualFixMode(false)}
                                                                                        className="flex-1 py-1.5 bg-background border border-input text-foreground text-xs font-medium rounded hover:bg-muted"
                                                                                    >
                                                                                        Cancel
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            alert(`Fixed with: ${resolutionMethod}`)
                                                                                            setIsManualFixMode(false)
                                                                                        }}
                                                                                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-sm"
                                                                                    >
                                                                                        Confirm Fix
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                            {/* Product Overview */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection('productOverview')}
                                                    className="flex items-center justify-between w-full mb-2 group"
                                                >
                                                    <span className="text-sm font-medium text-foreground">Product Overview</span>
                                                    <ChevronDownIcon
                                                        className={cn(
                                                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                                            sections.productOverview ? "transform rotate-0" : "transform -rotate-90"
                                                        )}
                                                    />
                                                </button>
                                                {sections.productOverview && (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 bg-zinc-50 dark:bg-zinc-800 border border-border rounded-lg p-4">
                                                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                                            <CubeIcon className="h-12 w-12 text-muted-foreground/50" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-semibold text-foreground">{selectedItem.name}</h4>
                                                            <p className="text-xs font-mono text-muted-foreground">{selectedItem.id}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                <span className={cn(
                                                                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                                    selectedItem.statusColor
                                                                )}>
                                                                    {selectedItem.status}
                                                                </span>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                                                                    Tag {selectedItem.tag}
                                                                </span>
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                                                                    {selectedItem.category}
                                                                </span>
                                                            </div>
                                                            <div className="mt-3 space-y-1.5">
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-muted-foreground">Qty Ordered</span>
                                                                    <span className="font-medium text-foreground">{selectedItem.qtyOrd}</span>
                                                                </div>
                                                                {selectedItem.qtyBO > 0 && (
                                                                    <div className="flex justify-between text-xs">
                                                                        <span className="text-amber-600 dark:text-amber-400">Backordered</span>
                                                                        <span className="font-medium text-amber-600 dark:text-amber-400">{selectedItem.qtyBO}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-muted-foreground">Net Price</span>
                                                                    <span className="font-medium text-foreground">${selectedItem.netPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-muted-foreground">Amount</span>
                                                                    <span className="font-bold text-foreground">${selectedItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                                </div>
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-muted-foreground">Discount</span>
                                                                    <span className="font-medium text-foreground">{selectedItem.discPct}%</span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-border">
                                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Configurations</p>
                                                                <div className="space-y-1">
                                                                    {selectedItem.configs.map((cfg, i) => (
                                                                        <p key={i} className="text-xs text-muted-foreground">{cfg}</p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="h-px bg-border my-4" />

                                            {/* Lifecycle */}
                                            <div>
                                                <button
                                                    onClick={() => toggleSection('lifecycle')}
                                                    className="flex items-center justify-between w-full mb-2 group"
                                                >
                                                    <span className="text-sm font-medium text-foreground">Lifecycle Status</span>
                                                    <ChevronDownIcon
                                                        className={cn(
                                                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                                            sections.lifecycle ? "transform rotate-0" : "transform -rotate-90"
                                                        )}
                                                    />
                                                </button>
                                                {sections.lifecycle && (
                                                    <div className="pl-4 border-l border-border ml-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 bg-zinc-50 dark:bg-zinc-800 border-r border-y border-border rounded-r-lg p-4">
                                                        {['Material Sourced', 'Manufacturing', 'Quality Control'].map((step, i) => (
                                                            <div key={i} className="relative pb-2 last:pb-0">
                                                                <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
                                                                <p className="text-sm font-medium text-foreground leading-none">{step}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">Completed Jan {5 + i * 5}, 2026</p>
                                                            </div>
                                                        ))}
                                                        <div className="relative">
                                                            <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full bg-background border-2 border-zinc-400 dark:border-primary ring-4 ring-background" />
                                                            <p className="font-medium text-foreground leading-none">Warehouse Storage</p>
                                                            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="h-px bg-border my-4" />

                                            {/* Action Required */}
                                            <div>
                                                <h4 className="text-sm font-medium text-foreground mb-2">Action Required</h4>
                                                <div className="pl-4 border-l border-border ml-2 space-y-3">
                                                    <button
                                                        onClick={() => setIsPOModalOpen(true)}
                                                        className="w-full py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg shadow-sm transition-colors"
                                                    >
                                                        Create Purchase Order
                                                    </button>
                                                    <button className="w-full py-1.5 bg-background hover:bg-muted text-muted-foreground text-xs font-semibold rounded-lg border border-border transition-colors">
                                                        Send Acknowledgement
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel className="flex focus:outline-none min-h-[800px]">
                                <div className="flex flex-col min-w-0 bg-muted/10 w-full">
                                    {/* Chat Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-foreground">Activity Stream</h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">AIS SO 1151064-B</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Real-time updates and collaboration</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {collaborators.map((c, i) => (
                                                    <div key={i} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                                        {c.avatar === 'AI' ? (
                                                            <div className="h-full w-full rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
                                                        ) : (
                                                            <img className="h-full w-full rounded-full object-cover" src={c.avatar} alt={c.name} />
                                                        )}
                                                        <span className={cn(
                                                            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                                                            c.status === 'online' ? "bg-green-400" : "bg-zinc-300"
                                                        )} />
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                                <PlusIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="p-6 space-y-6">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={cn("flex gap-4 max-w-3xl", msg.type === 'user' ? "ml-auto flex-row-reverse" : "")}>
                                                <div className="flex-shrink-0">
                                                    {msg.type === 'action_processing' ? (
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                                                            <DocumentTextIcon className="h-5 w-5 text-zinc-900 dark:text-primary" />
                                                        </div>
                                                    ) : msg.type === 'action_success' ? (
                                                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-800">
                                                            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                    ) : msg.avatar === 'AI' ? (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                                                            <SparklesIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                    ) : msg.avatar ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={msg.avatar} alt={msg.sender} />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                            <ExclamationTriangleIcon className="h-5 w-5 text-zinc-900 dark:text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="text-sm font-semibold text-foreground">{msg.sender}</span>
                                                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                                                    </div>

                                                    {msg.type === 'action_success' ? (
                                                        <DiscrepancyActionCard msg={msg} />
                                                    ) : (
                                                        <div
                                                            id={msg.id === 3 ? "discrepancy-resolver" : undefined}
                                                            className={cn(
                                                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                                                msg.type === 'user'
                                                                    ? "bg-brand-400 text-primary-foreground rounded-tr-sm"
                                                                    : "bg-card border border-border rounded-tl-sm text-foreground"
                                                            )}>
                                                            {msg.content}
                                                            {msg.type === 'action_processing' && (
                                                                <div className="mt-3 flex items-center gap-2 text-zinc-900 dark:text-primary font-medium">
                                                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                                                    <span>Processing request...</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="sticky bottom-4 mx-4 p-4 bg-background border border-border rounded-2xl shadow-lg z-10 transition-all duration-200">
                                        <div className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Type a message or use @ to mention..."
                                                    className="w-full pl-4 pr-12 py-3 bg-muted/50 border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary transition-shadow"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
                                                        <PaperClipIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <button className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                                                <PaperAirplaneIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contextual Quick Actions Sidebar */}
                                <div className="w-80 border-l border-border bg-muted/30 flex flex-col h-full animate-in slide-in-from-right duration-500">
                                    <div className="p-5 border-b border-border bg-background/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Context</h3>
                                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center border border-amber-200 dark:border-amber-500/30">
                                                <DocumentChartBarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Acknowledgement Review</p>
                                                <p className="text-xs text-muted-foreground">2 Exceptions Found · $127,880.17</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Suggested Actions</h4>
                                            <div className="space-y-3">
                                                <button onClick={() => setIsDocumentModalOpen(true)} className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-zinc-900 dark:text-primary">
                                                        <ClipboardDocumentListIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-zinc-900 dark:group-hover:text-primary transition-colors">Compare vs PO</p>
                                                        <p className="text-[10px] text-muted-foreground">Side-by-side Acknowledgement vs original PO</p>
                                                    </div>
                                                </button>

                                                <button className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
                                                        <ExclamationTriangleIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Resolve Exceptions</p>
                                                        <p className="text-[10px] text-muted-foreground">2 items need attention</p>
                                                    </div>
                                                </button>

                                                <button className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-green-500/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600 dark:text-green-400">
                                                        <CheckIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Approve Acknowledgement</p>
                                                        <p className="text-[10px] text-muted-foreground">Confirm & move to fulfillment</p>
                                                    </div>
                                                </button>

                                                <button className="w-full group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-indigo-500/50 hover:shadow-md transition-all text-left">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-indigo-600 dark:text-indigo-400">
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Export PDF</p>
                                                        <p className="text-[10px] text-muted-foreground">Download industry-format PDF</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Live Updates</h4>
                                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                <div className="flex gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
                                                        <div className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-900 dark:text-primary">DiscrepancyResolverAgent analyzing exceptions...</p>
                                                        <p className="text-[10px] text-zinc-700 dark:text-primary/80 mt-1">Comparing 40 line items against PO #ORD-2055</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-border bg-muted/50">
                                        <button className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                                            View Activity Log <ArrowRightOnRectangleIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </TabPanel >
                        </TabPanels >
                    </TabGroup >
                </div >
            </div >

            <Transition show={isDocumentModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsDocumentModalOpen}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <DialogTitle as="h3" className="text-lg font-bold leading-6 text-foreground">
                                                Order Document Preview
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Previewing Purchase Order #PO-2025-001
                                            </p>
                                        </div>
                                        <button onClick={() => setIsDocumentModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="bg-white text-black p-10 rounded-lg border border-zinc-200 h-[600px] overflow-auto shadow-sm">
                                        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
                                            <h2 className="text-2xl font-bold uppercase">Purchase Order</h2>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">STRATA INC.</div>
                                                <div className="text-sm">123 Innovation Dr., Tech City</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between mb-8">
                                            <div>
                                                <div className="text-xs font-bold text-zinc-500 mb-1 uppercase">VENDOR</div>
                                                <div className="font-bold">OfficeSupplies Co.</div>
                                                <div className="text-sm">555 Supplier Lane</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-zinc-500">PO #:</span>
                                                    <span className="text-sm font-bold">PO-2025-001</span>
                                                </div>
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-zinc-500">DATE:</span>
                                                    <span className="text-sm">Jan 12, 2026</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex bg-zinc-100 p-2 font-bold text-sm mb-2">
                                                <div className="flex-grow-[2]">ITEM</div>
                                                <div className="flex-1 text-right">QTY</div>
                                                <div className="flex-1 text-right">UNIT PRICE</div>
                                                <div className="flex-1 text-right">TOTAL</div>
                                            </div>
                                            <div className="flex p-2 border-b border-zinc-100">
                                                <div className="flex-grow-[2]">
                                                    <div className="font-bold text-sm">{selectedItem.name}</div>
                                                    <div className="text-xs text-zinc-500">{selectedItem.id}</div>
                                                </div>
                                                <div className="flex-1 text-right text-sm">50</div>
                                                <div className="flex-1 text-right text-sm">$45.00</div>
                                                <div className="flex-1 text-right text-sm">$2,250.00</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="w-64">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-zinc-500">Subtotal:</span>
                                                    <span className="text-sm font-bold">$2,250.00</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100">
                                                    <span className="text-lg font-bold">TOTAL:</span>
                                                    <span className="text-xl font-bold text-foreground">$2,250.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none"
                                            onClick={() => setIsDocumentModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus:outline-none"
                                            onClick={() => { }}
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div >
    )
}




function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={cn(
            "relative flex items-center justify-center h-9 px-3 rounded-full transition-all duration-300 group overflow-hidden",
            active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}>
            <span className="relative z-10">{icon}</span>
            <span className={cn(
                "ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out",
                active ? "max-w-xs opacity-100" : ""
            )}>
                {label}
            </span>
        </button>
    )
}
