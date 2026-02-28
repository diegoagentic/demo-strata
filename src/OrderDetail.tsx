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
import { useTheme, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, Checkbox, Card, Input } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import { useDemo } from './context/DemoContext'
import BackorderTraceCard from './components/widgets/BackorderTraceCard'
import type { BackorderLine } from './components/widgets/BackorderTraceCard'
import AgentPipelineStrip from './components/simulations/AgentPipelineStrip'
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const items = [
    { id: "SKU-OFF-2025-001", name: "Executive Chair Pro", category: "Premium Series", properties: "Leather / Black", stock: 285, status: "In Stock", statusColor: "bg-zinc-100 text-zinc-700", aiStatus: "info" },
    { id: "SKU-OFF-2025-002", name: "Ergonomic Task Chair", category: "Standard Series", properties: "Mesh / Gray", stock: 520, status: "In Stock", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "SKU-OFF-2025-003", name: "Conference Room Chair", category: "Meeting Series", properties: "Fabric / Navy", stock: 42, status: "Low Stock", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning" },
    { id: "SKU-OFF-2025-004", name: "Visitor Stacking Chair", category: "Guest Series", properties: "Plastic / White", stock: 180, status: "In Stock", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "SKU-OFF-2025-005", name: "Gaming Office Chair", category: "Sport Series", properties: "Leather / Red", stock: 0, status: "Out of Stock", statusColor: "bg-red-50 text-red-700 ring-red-600/20" },
    { id: "SKU-OFF-2025-006", name: "Reception Lounge Chair", category: "Lobby Series", properties: "Velvet / Teal", stock: 95, status: "In Stock", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "SKU-OFF-2025-007", name: "Drafting Stool High", category: "Studio Series", properties: "Mesh / Black", stock: 340, status: "In Stock", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "SKU-OFF-2025-008", name: "Bench Seating 3-Seat", category: "Waiting Series", properties: "Metal / Chrome", stock: 28, status: "Low Stock", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20" },
]

const demoItems = [
    { id: "AER-REM-2025-BLK", name: "Aeron Remastered", category: "Task Seating", properties: "Graphite / Size B", stock: 120, status: "In Stock", statusColor: "bg-green-50 text-green-700", aiStatus: "check" },
    { id: "EMB-CHR-2025-GRY", name: "Embody Chair", category: "Performance", properties: "Sync / Gray", stock: 45, status: "Low Stock", statusColor: "bg-amber-50 text-amber-700" },
    { id: "NVI-DSK-2025-WAL", name: "Nevi Sit-Stand Desk", category: "Desking", properties: "Walnut / White", stock: 200, status: "In Stock", statusColor: "bg-zinc-100 text-zinc-700" }
];

const flow1Items = [
    { id: "SKU-OFF-2025-002", name: "Ergonomic Task Chair", category: "Standard Series", properties: "Mesh / Gray", stock: 125, status: "Allocated", statusColor: "bg-brand/10 text-brand ring-brand/20", aiStatus: "check" }
];

interface Message {
    id: number | string;
    sender: string;
    avatar: string;
    content: React.ReactNode;
    time: string;
    type: 'system' | 'ai' | 'user' | 'action_processing' | 'action_success';
}

const DiscrepancyResolutionFlow = () => {
    const [status, setStatus] = useState<'initial' | 'requesting' | 'pending' | 'approved'>('initial')
    const [requestText, setRequestText] = useState('')

    const handleRequest = () => {
        setStatus('pending')
        setTimeout(() => setStatus('approved'), 3000)
    }

    if (status === 'initial') {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Found 3 discrepancies in recent shipments.
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 text-zinc-600 dark:text-zinc-300">
                    <li>Order #ORD-2054: Weight mismatch (Logs: 50kg vs Gateway: 48kg)</li>
                    <li>Order #ORD-2051: Timestamp sync error</li>
                    <li>Order #ORD-2048: Missing carrier update</li>
                </ul>
                <div className="flex gap-2 mt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-zinc-900 dark:text-primary hover:bg-primary/20 text-xs font-medium rounded-lg transition-colors">
                        <ArrowPathIcon className="w-3.5 h-3.5" /> Sync & Report
                    </button>
                    <button
                        onClick={() => setStatus('requesting')}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary dark:hover:text-zinc-900 transition-colors"
                    >
                        <PencilIcon className="w-3.5 h-3.5" /> Request Changes
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
                    className="w-full text-sm p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-card text-zinc-900 dark:text-white focus:ring-2 ring-primary outline-none transition-all placeholder:text-zinc-400"
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

    if (status === 'approved') {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p>Changes approved. PO updated.</p>
                </div>
                <div className="bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                        <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">PO_Revised_Final.pdf</p>
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
                <div className="flex items-center gap-3 bg-card/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                    <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                        <DocumentTextIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">PO_Revised_Final.pdf</p>
                        <p className="text-xs text-zinc-500">2.4 MB • Generated just now</p>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "rounded-2xl p-4 shadow-sm transition-all duration-300",
            isRequesting ? "ring-2 ring-indigo-500/20 bg-card" : "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
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
                        <div className="flex items-center gap-3 bg-card/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
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
                                            <span className="text-zinc-900 dark:text-white font-mono text-sm bg-zinc-100 dark:bg-card px-1.5 py-0.5 rounded">42</span>
                                        </div>
                                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Local</span>
                                            <span className="text-zinc-900 dark:text-white font-mono text-sm bg-zinc-100 dark:bg-card px-1.5 py-0.5 rounded">35</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg shadow-sm transition-colors">
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
                        className="w-full text-sm bg-zinc-50 dark:bg-card border-0 rounded-lg p-3 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                        rows={3}
                        autoFocus
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-muted transition-colors">
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
    { name: "Sarah Chen", role: "Logistics Mgr", status: "online", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
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
}

const BACKORDER_LINES: BackorderLine[] = [
    { sku: 'SKU-OFF-2025-003', name: 'Conference Room Chair', originalQty: 50, fulfilledQty: 35, backorderedQty: 15, eta: 'Mar 15, 2026', impact: 'Delayed delivery for 2nd floor conference rooms. Manufacturer backlog on Navy fabric.' },
    { sku: 'SKU-OFF-2025-008', name: 'Bench Seating 3-Seat', originalQty: 20, fulfilledQty: 12, backorderedQty: 8, eta: 'Mar 22, 2026', impact: 'Lobby installation delayed. Chrome finish supplier capacity constraint.' },
];

const SHIPMENT_STEPS = [
    { status: 'Order Placed', date: 'Jan 15, 2026', detail: 'PO #ORD-2055 confirmed', completed: true },
    { status: 'In Production', date: 'Jan 22, 2026', detail: 'Manufacturing started at Plant B', completed: true },
    { status: 'Ready to Ship', date: 'Feb 10, 2026', detail: '35 of 50 units packaged', completed: true },
    { status: 'Shipped', date: 'Feb 12, 2026', detail: 'Tracking: FX-2026-887744', completed: true },
    { status: 'In Transit', date: 'Feb 14, 2026', detail: 'FedEx Hub — Memphis, TN', completed: false, current: true },
    { status: 'Delivered', date: 'Est. Feb 18', detail: 'Austin, TX Warehouse', completed: false },
];

export default function OrderDetail({ onBack, onLogout, onNavigateToWorkspace, onNavigate }: DetailProps) {
    const { currentStep, nextStep } = useDemo();
    const [isDemoOrder, setIsDemoOrder] = useState(false);
    const [isFlow1Order, setIsFlow1Order] = useState(false);

    useEffect(() => {
        const demoId = localStorage.getItem('demo_view_order_id');
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');

        if ((demoId === 'ORD-7829') || (urlId === 'ORD-7829')) {
            setIsDemoOrder(true);
            setSelectedItem(demoItems[0]);
        } else if ((demoId === 'PO-1029') || (urlId === 'PO-1029')) {
            setIsFlow1Order(true);
            setSelectedItem(flow1Items[0]);
        }
    }, []);

    const currentItems = isFlow1Order ? flow1Items : (isDemoOrder ? demoItems : items);
    const orderId = isFlow1Order ? '#PO-1029' : (isDemoOrder ? '#ORD-7829' : '#ORD-2055');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: "System",
            avatar: "",
            content: `Order ${orderId} has been successfully placed via Smart Quote Hub.`,
            time: "Just now",
            type: "system",
        },
        // ... (We can keep or clear other messages, for demo cleaner is better)
    ]);

    // If it's the demo order, we might want cleaner messages
    useEffect(() => {
        if (isDemoOrder) {
            setMessages([
                {
                    id: 1,
                    sender: "System",
                    avatar: "",
                    content: `Order ${orderId} generated from Quote #QT-9921.`,
                    time: "2 mins ago",
                    type: "system",
                },
                {
                    id: 2,
                    sender: "AI Assistant",
                    avatar: "AI",
                    content: "I've verified the stock for replaced item 'Aeron Remastered'. 120 units available at NY-05 Distribution Center.",
                    time: "1 min ago",
                    type: "ai",
                },
                {
                    id: 3,
                    sender: "System",
                    avatar: "",
                    content: `Cost Center 'Marketing-101' applied successfully.`,
                    time: "Just now",
                    type: "system",
                }
            ]);
        } else if (isFlow1Order) {
            setMessages([
                {
                    id: 1,
                    sender: "System",
                    avatar: "",
                    content: `Purchase Order ${orderId} auto-generated from approved Quote #QT-1025.`,
                    time: "Just now",
                    type: "system",
                },
                {
                    id: 2,
                    sender: "AI Assistant",
                    avatar: "AI",
                    content: "I've successfully received and allocated 125 units of Ergonomic Task Chairs for Apex Furniture. Total value confirmed at $43,750.",
                    time: "Just now",
                    type: "ai",
                }
            ]);
        }
    }, [isDemoOrder, isFlow1Order, orderId]);

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

    // Step 1.7 — PO Generation Animation
    const [poGenPhase, setPoGenPhase] = useState<'building' | 'mapping' | 'validating' | 'complete'>('building')
    useEffect(() => {
        if (currentStep?.id !== '1.7') { setPoGenPhase('building'); return; }
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        timeouts.push(setTimeout(() => setPoGenPhase('mapping'), 1500));
        timeouts.push(setTimeout(() => setPoGenPhase('validating'), 3000));
        timeouts.push(setTimeout(() => setPoGenPhase('complete'), 4500));
        return () => timeouts.forEach(clearTimeout);
    }, [currentStep?.id]);

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
                    <Button variant="ghost" onClick={onBack} className="p-1 h-auto text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-900">
                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                    </Button>
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: onBack },
                            { label: 'Transactions', onClick: onBack },
                            { label: `Order ${orderId}`, active: true }
                        ]}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-background border-input hover:bg-primary hover:text-zinc-900 group">
                        <FunnelIcon className="h-4 w-4 text-muted-foreground group-hover:text-zinc-900" /> Filter
                    </Button>
                    <Button variant="outline" className="gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-background border-input hover:bg-primary hover:text-zinc-900 group">
                        <ArrowDownTrayIcon className="h-4 w-4 text-muted-foreground group-hover:text-zinc-900" /> Export
                    </Button>
                    <Button variant="primary" className="gap-2 px-3 py-1.5 text-sm font-medium">
                        <PlusIcon className="h-4 w-4" /> Add New Item
                    </Button>
                </div>
            </div>

            <div className="flex flex-col p-6 gap-6">
                {/* Step 2.6: Backorder Trace Panel + Agent Attribution */}
                {currentStep?.id === '2.6' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Pipeline Strip */}
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done', detail: '2 exceptions' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'done', detail: '1 auto, 1 manual' },
                            { id: 'bo', name: 'Backorder', status: 'done', detail: '2 lines split' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="blue" />

                        {/* AI Attribution Header */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">BackorderAgent split order into fulfilled/backordered from ACK data</span>
                            </div>
                            <ConfidenceScoreBadge score={98} label="Accuracy" size="md" />
                        </div>

                        {/* Backorder Trace Card */}
                        <BackorderTraceCard lines={BACKORDER_LINES} orderId="#ORD-2055" />

                        {/* Impact Summary Card */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-foreground mb-3">Impact Summary</h4>
                            <div className="space-y-3">
                                {/* Fulfillment Bar */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-muted-foreground">Fulfilled vs Backordered</span>
                                        <span className="font-bold text-foreground">47/70 units (67%)</span>
                                    </div>
                                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                                        <div className="bg-green-500 transition-all" style={{ width: '67%' }} />
                                        <div className="bg-amber-500 transition-all" style={{ width: '33%' }} />
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Fulfilled (47)</span>
                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Backordered (23)</span>
                                    </div>
                                </div>

                                {/* Timeline Impact */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Zone A — HQ</span>
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">On Schedule</span>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">25 chairs ready Feb 15</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Zone B — Annex</span>
                                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Delayed +5 weeks</span>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">23 units ETA Mar 28</p>
                                    </div>
                                </div>

                                {/* AI Suggestion */}
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Consider alternative vendor for 15 chairs (2-week vs 5-week lead). Estimated savings: $1,200 in expedite fees.</span>
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                className="mt-4 w-full px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01] flex items-center justify-center gap-2"
                            >
                                Proceed to Approval Chain
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1.7: PO Generation from Approved Quote */}
                {currentStep?.id === '1.7' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Pipeline Strip */}
                        <AgentPipelineStrip agents={[
                            { id: 'email', name: 'EmailIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR/Parser', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'valid', name: 'Validator', status: 'done' },
                            { id: 'quote', name: 'QuoteBuilder', status: 'done', detail: 'QT-1025' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'done', detail: '3/3 approved' },
                            { id: 'po', name: 'POBuilder', status: poGenPhase === 'complete' ? 'done' : 'running', detail: poGenPhase === 'complete' ? 'PO-1029' : 'Generating...' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* AI Attribution */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">POBuilderAgent generating Purchase Order from approved Quote QT-1025</span>
                            </div>
                            <ConfidenceScoreBadge score={99} label="Mapping" size="md" />
                        </div>

                        {/* PO Generation Progress Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                                        <DocumentTextIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Purchase Order Generation</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Auto-converting Quote QT-1025 → PO-1029</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                    poGenPhase === 'complete'
                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                }`}>
                                    {poGenPhase === 'building' && 'Building PO...'}
                                    {poGenPhase === 'mapping' && 'Mapping Line Items...'}
                                    {poGenPhase === 'validating' && 'Validating...'}
                                    {poGenPhase === 'complete' && 'PO Generated'}
                                </span>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Generation Steps */}
                                <div className="space-y-2">
                                    {[
                                        { phase: 'building' as const, label: 'Extracting approved quote structure', detail: '5 line items, 3 warranty options, 2 discounts' },
                                        { phase: 'mapping' as const, label: 'Mapping quote fields to PO format', detail: 'SKUs, quantities, unit prices, shipping terms' },
                                        { phase: 'validating' as const, label: 'Validating against vendor catalog & inventory', detail: 'Stock confirmed at distribution centers' },
                                        { phase: 'complete' as const, label: 'PO finalized with compliance stamps', detail: 'Approval chain signatures embedded' },
                                    ].map((step, i) => {
                                        const phases = ['building', 'mapping', 'validating', 'complete'] as const;
                                        const currentIdx = phases.indexOf(poGenPhase);
                                        const stepIdx = phases.indexOf(step.phase);
                                        const isDone = stepIdx < currentIdx || poGenPhase === 'complete';
                                        const isActive = stepIdx === currentIdx && poGenPhase !== 'complete';

                                        return (
                                            <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-500 ${
                                                isDone ? 'bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20' :
                                                isActive ? 'bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20' :
                                                'bg-muted/20 border border-transparent'
                                            }`}>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                                                    isDone ? 'bg-green-500 text-white' :
                                                    isActive ? 'bg-blue-500 text-white' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                    {isDone ? <CheckIcon className="w-3.5 h-3.5" /> :
                                                     isActive ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> :
                                                     <span className="text-[9px] font-bold">{i + 1}</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-medium ${isDone || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                                                    <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* PO Line Items Table (visible after mapping phase) */}
                                {(poGenPhase === 'validating' || poGenPhase === 'complete') && (
                                    <div className="rounded-xl border border-border overflow-hidden animate-in fade-in duration-500">
                                        <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PO-1029 Line Items (from QT-1025)</span>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-border/50 bg-muted/20">
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground">Line</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground">SKU</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground">Description</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground text-right">Qty</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground text-right">Unit Price</th>
                                                    <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {[
                                                    { line: 1, sku: 'ERG-5100', desc: 'Ergonomic Task Chair', qty: 125, price: 350, warranty: '+5yr Extended' },
                                                    { line: 2, sku: 'DSK-2200', desc: 'Height-Adjustable Desk', qty: 80, price: 580, warranty: '+3yr Standard' },
                                                    { line: 3, sku: 'ARM-4D10', desc: 'Adjustable 4D Armrest', qty: 125, price: 18, warranty: null },
                                                    { line: 4, sku: 'MON-3400', desc: 'Monitor Arm Dual', qty: 60, price: 145, warranty: '+2yr Extended' },
                                                    { line: 5, sku: 'CAB-1100', desc: 'Mobile Pedestal Cabinet', qty: 40, price: 220, warranty: null },
                                                ].map(item => (
                                                    <tr key={item.line} className="text-xs">
                                                        <td className="px-4 py-2 text-muted-foreground">{item.line}</td>
                                                        <td className="px-4 py-2 font-mono text-foreground font-medium">{item.sku}</td>
                                                        <td className="px-4 py-2 text-foreground">
                                                            {item.desc}
                                                            {item.warranty && (
                                                                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded font-medium">{item.warranty}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-foreground text-right">{item.qty}</td>
                                                        <td className="px-4 py-2 text-foreground text-right">${item.price.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-foreground text-right font-bold">${(item.qty * item.price).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t border-border bg-muted/30">
                                                    <td colSpan={4} className="px-4 py-2 text-[10px] text-muted-foreground">Discounts: Early Payment (2%) + Mixed Category (2%)</td>
                                                    <td className="px-4 py-2 text-[10px] text-muted-foreground text-right">Subtotal</td>
                                                    <td className="px-4 py-2 text-xs font-bold text-foreground text-right">$139,850</td>
                                                </tr>
                                                <tr className="border-t border-border">
                                                    <td colSpan={4} />
                                                    <td className="px-4 py-2 text-[10px] text-muted-foreground text-right">After Discounts (4%)</td>
                                                    <td className="px-4 py-2 text-sm font-bold text-foreground text-right">$134,256</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}

                                {/* PO Summary (visible on complete) */}
                                {poGenPhase === 'complete' && (
                                    <div className="space-y-4 animate-in fade-in duration-500">
                                        {/* Summary Grid */}
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { label: 'PO Number', value: 'PO-1029', color: 'text-foreground' },
                                                { label: 'Source Quote', value: 'QT-1025', color: 'text-blue-600 dark:text-blue-400' },
                                                { label: 'Vendor', value: 'Apex Furniture', color: 'text-foreground' },
                                                { label: 'Total Value', value: '$134,256', color: 'text-green-600 dark:text-green-400' },
                                            ].map(item => (
                                                <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{item.label}</p>
                                                    <p className={`text-sm font-bold mt-1 ${item.color}`}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Compliance Stamps */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {['Approval Chain ✓', 'Pricing Policy ✓', 'Inventory Reserved ✓', 'Compliance Validated ✓'].map(stamp => (
                                                <span key={stamp} className="text-[10px] px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 font-medium">
                                                    {stamp}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Success */}
                                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-green-700 dark:text-green-300">Purchase Order PO-1029 Generated Successfully</p>
                                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-0.5">5 line items mapped, 3 warranties applied, 2 discounts calculated. Ready for vendor submission.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={nextStep}
                                        disabled={poGenPhase !== 'complete'}
                                        className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
                                            poGenPhase === 'complete'
                                                ? 'bg-primary text-primary-foreground hover:opacity-90'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        Send Notifications
                                        <ChevronRightIcon className="w-3.5 h-3.5" />
                                    </button>
                                    {poGenPhase === 'complete' && (
                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                            <SparklesIcon className="w-3 h-3" />
                                            NotificationAgent will deliver persona-aware digests
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3.3: Shipment Timeline */}
                {currentStep?.id === '3.3' && (
                    <div className="bg-card border border-border rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Shipment Tracking — #ORD-2055</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">FedEx — Tracking: FX-2026-887744</p>
                            </div>
                            <button
                                onClick={nextStep}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                                Continue to MAC
                            </button>
                        </div>
                        <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-zinc-200 dark:before:bg-zinc-700">
                            {SHIPMENT_STEPS.map((step, idx) => (
                                <div key={idx} className="flex gap-4 relative pb-6 last:pb-0">
                                    <div className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all",
                                        step.completed ? "bg-green-500 text-white shadow-lg shadow-green-500/20" :
                                        (step as any).current ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20 animate-pulse" :
                                        "bg-zinc-200 dark:bg-zinc-700 text-muted-foreground"
                                    )}>
                                        {step.completed ? <CheckIcon className="w-4 h-4" /> :
                                         (step as any).current ? <ClockIcon className="w-4 h-4" /> :
                                         <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "text-xs font-bold",
                                                step.completed || (step as any).current ? "text-foreground" : "text-muted-foreground"
                                            )}>{step.status}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{step.date}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Collapsible Summary */}
                {isSummaryExpanded ? (
                    <>
                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-0 transition-all duration-300">
                            <div className="flex justify-end mb-4">
                                <Button variant="ghost" onClick={() => setIsSummaryExpanded(false)} className="gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-900 bg-zinc-100 dark:bg-card hover:bg-primary dark:hover:bg-primary px-2.5 py-1.5 rounded-lg">
                                    Hide Details <ChevronUpIcon className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-in fade-in zoom-in duration-300">
                                {[
                                    { label: 'ORDER VALUE', value: isFlow1Order ? '$43,750.00' : '$45,200.00' },
                                    { label: 'ITEMS', value: isFlow1Order ? '125' : '12' },
                                    { label: 'FULFILLMENT', value: isFlow1Order ? 'Allocated' : 'Partial', color: isFlow1Order ? 'text-brand' : 'text-amber-600 dark:text-amber-400' },
                                    { label: 'CARRIER', value: 'FedEx' },
                                    { label: 'STATUS', value: 'Processing', color: 'text-blue-600 dark:text-blue-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-zinc-50 dark:bg-card/50 p-4 rounded-xl border border-zinc-100 dark:border-white/5">
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
                                            { name: 'Placed', status: 'completed' },
                                            { name: 'Confirmed', status: 'completed' },
                                            { name: 'Processing', status: 'current' },
                                            { name: 'Shipped', status: 'pending' },
                                            { name: 'Delivered', status: 'pending' }
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
                                                <div key={i} className="flex flex-col items-center bg-card px-1 group cursor-default">
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
                    <div className="bg-card p-4 rounded-xl shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                            {[
                                { label: 'Order Value', value: isFlow1Order ? '$43.75k' : '$45.2k' },
                                { label: 'Fulfillment', value: isFlow1Order ? 'Allocated' : 'Partial', color: isFlow1Order ? 'text-brand' : 'text-amber-600 dark:text-amber-400' },
                                { label: 'Carrier', value: 'FedEx' },
                                { label: 'Status', value: 'Processing', color: 'text-blue-600 dark:text-blue-400' },
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
                            {/* Current Phase Indicator */}
                            <div className="flex items-center gap-3 hidden md:flex">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Current Phase</span>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">Processing</span>
                                </div>
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-900 dark:border-white bg-card">
                                    <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
                                </div>
                            </div>

                            <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                            <Button
                                variant="ghost"
                                onClick={() => setIsSummaryExpanded(true)}
                                className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary h-auto"
                            >
                                <div className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">Show Details</span>
                            </Button>
                        </div>
                    </div>
                )}



                {/* Main Content Area */}
                <div className="flex flex-col">
                    <TabGroup className="flex flex-col">
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
                                    Order Items
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
                                    Tracking & Activity
                                </Tab>
                            </TabList>
                        </div>
                        <TabPanels className="">
                            <TabPanel className="flex flex-col focus:outline-none">
                                <div className="grid grid-cols-12 gap-6 p-6">
                                    {/* Left Panel: List */}
                                    <Card className="col-span-8 flex flex-col bg-card border border-border shadow-sm">
                                        {/* Search and Filter Bar */}
                                        <div className="flex items-center justify-between p-4 border-b border-border">
                                            <div className="flex-1 max-w-lg relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Search SKU, Product Name..."
                                                    className="w-full pl-10 pr-3 py-2 border-input rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:ring-primary sm:text-sm"
                                                />
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button variant="outline" className="gap-2 px-3 py-2 border-input text-sm leading-4 font-medium text-foreground bg-background hover:bg-muted">
                                                    All Materials
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="gap-2 px-3 py-2 border-input text-sm leading-4 font-medium text-foreground bg-background hover:bg-muted">
                                                    Stock Status
                                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-0.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-track]:bg-transparent pb-2">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-10">
                                                            <Checkbox className="border-input text-zinc-900 dark:text-primary focus:ring-primary bg-background" />
                                                        </TableHead>
                                                        <TableHead>SKU ID</TableHead>
                                                        <TableHead>Image</TableHead>
                                                        <TableHead>Product Name</TableHead>
                                                        <TableHead>Properties</TableHead>
                                                        <TableHead>Stock Level</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {items.map((item) => (
                                                        <TableRow
                                                            key={item.id}
                                                            onClick={() => setSelectedItem(item)}
                                                            className={cn(
                                                                "cursor-pointer",
                                                                selectedItem.id === item.id ? "bg-muted/80" : ""
                                                            )}
                                                        >
                                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                                <Checkbox
                                                                    checked={selectedItem.id === item.id}
                                                                    onChange={() => setSelectedItem(item)}
                                                                    className="border-input text-zinc-900 dark:text-primary focus:ring-primary bg-background"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                                {item.id}
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                                <div className="h-10 w-10 flex-shrink-0">
                                                                    {item.image ? (
                                                                        <img className="h-10 w-10 rounded-full object-cover" src={item.image} alt="" />
                                                                    ) : (
                                                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                            <CubeIcon className="h-6 w-6 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                <div className="flex flex-col">
                                                                    <span className="text-foreground font-medium">{item.name}</span>
                                                                    <span className="text-xs text-muted-foreground/70 mt-0.5">{item.category}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                {item.properties}
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex items-end">
                                                                        <div
                                                                            className={cn(
                                                                                "w-full rounded-full transition-all",
                                                                                item.stock > 100 ? "bg-green-500" : item.stock > 20 ? "bg-amber-500" : "bg-red-500"
                                                                            )}
                                                                            style={{ height: `${Math.min((item.stock / 600) * 100, 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground font-medium min-w-[3ch]">{Math.round((item.stock / 600) * 100)}%</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-6 py-4 whitespace-nowrap">
                                                                <Badge
                                                                    variant={
                                                                        item.status === 'In Stock' ? 'success' :
                                                                            item.status === 'Low Stock' ? 'warning' :
                                                                                'error'
                                                                    }
                                                                >
                                                                    {item.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </Card>

                                    {/* Right Panel: Details */}
                                    <Card className="col-span-4 flex flex-col bg-card border border-border shadow-sm">
                                        {/* Details Header */}
                                        <div className="flex items-center justify-between p-4 border-b border-border">
                                            <h3 className="text-lg font-semibold text-foreground">Item Details</h3>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" onClick={() => setIsDocumentModalOpen(true)} className="h-auto p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" className="h-auto p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" className="h-auto p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <PaperAirplaneIcon className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" onClick={() => setIsAiDiagnosisOpen(true)} className="relative h-auto p-1 text-indigo-600 hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <SparklesIcon className="h-4 w-4" />
                                                    <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-900" />
                                                </Button>
                                                <div className="w-px h-4 bg-border mx-1 self-center" />
                                                <Button variant="ghost" className="h-auto p-1 text-muted-foreground hover:text-zinc-900 rounded hover:bg-primary transition-colors">
                                                    <EllipsisHorizontalIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-6">
                                            {/* AI Side Panel Section */}
                                            {selectedItem.aiStatus && (
                                                <div>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => toggleSection('aiSuggestions')}
                                                        className="flex items-center justify-between w-full h-auto p-0 hover:bg-transparent group"
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
                                                    </Button>

                                                    {sections.aiSuggestions && (
                                                        selectedItem.aiStatus === 'info' ? (
                                                            <div className="bg-zinc-50 dark:bg-card/40 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
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

                                                                    <Button variant="primary" className="w-full mt-1 text-xs py-1.5">
                                                                        Apply Selection
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-zinc-50 dark:bg-card/40 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
                                                                <div className="flex gap-3">
                                                                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                                                    <div className="w-full">
                                                                        <div className="flex justify-between items-start">
                                                                            <div>
                                                                                <h4 className="text-sm font-bold text-foreground">Database Discrepancy</h4>
                                                                                <p className="text-xs text-muted-foreground mt-1">Stock count mismatch detected.</p>
                                                                            </div>
                                                                            {!isManualFixMode && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    onClick={() => setIsManualFixMode(true)}
                                                                                    className="h-auto p-0 text-xs text-muted-foreground underline hover:text-foreground hover:bg-transparent"
                                                                                >
                                                                                    Resolve Manually
                                                                                </Button>
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
                                                                                <Button className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm focus-visible:outline-amber-600">
                                                                                    Auto-Sync to Warehouse
                                                                                </Button>
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
                                                                                    <Button
                                                                                        onClick={() => setIsManualFixMode(false)}
                                                                                        variant="outline"
                                                                                        className="flex-1 text-xs py-1.5"
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        onClick={() => {
                                                                                            alert(`Fixed with: ${resolutionMethod}`)
                                                                                            setIsManualFixMode(false)
                                                                                        }}
                                                                                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm focus-visible:outline-amber-600"
                                                                                    >
                                                                                        Confirm Fix
                                                                                    </Button>
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
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSection('productOverview')}
                                                    className="flex items-center justify-between w-full h-auto p-0 mb-2 hover:bg-transparent group"
                                                >
                                                    <span className="text-sm font-medium text-foreground">Product Overview</span>
                                                    <ChevronDownIcon
                                                        className={cn(
                                                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                                            sections.productOverview ? "transform rotate-0" : "transform -rotate-90"
                                                        )}
                                                    />
                                                </Button>
                                                {sections.productOverview && (
                                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 bg-zinc-50 dark:bg-card border border-border rounded-lg p-4">
                                                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                                            <CubeIcon className="h-12 w-12 text-muted-foreground/50" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-semibold text-foreground">{selectedItem.name}</h4>
                                                            <p className="text-sm text-muted-foreground">{selectedItem.id}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <Badge
                                                                    variant={
                                                                        selectedItem.status === 'In Stock' ? 'success' :
                                                                            selectedItem.status === 'Low Stock' ? 'warning' :
                                                                                'error'
                                                                    }
                                                                >
                                                                    {selectedItem.status}
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    Premium
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="h-px bg-border my-4" />

                                            {/* Lifecycle */}
                                            <div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSection('lifecycle')}
                                                    className="flex items-center justify-between w-full h-auto p-0 mb-2 hover:bg-transparent group"
                                                >
                                                    <span className="text-sm font-medium text-foreground">Lifecycle Status</span>
                                                    <ChevronDownIcon
                                                        className={cn(
                                                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                                            sections.lifecycle ? "transform rotate-0" : "transform -rotate-90"
                                                        )}
                                                    />
                                                </Button>
                                                {sections.lifecycle && (
                                                    <div className="pl-4 border-l border-border ml-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200 bg-zinc-50 dark:bg-card border-r border-y border-border rounded-r-lg p-4">
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
                                                    <Button
                                                        onClick={() => setIsPOModalOpen(true)}
                                                        variant="primary"
                                                        className="w-full"
                                                    >
                                                        Create Purchase Order
                                                    </Button>
                                                    <Button
                                                        className="w-full"
                                                        variant="outline"
                                                    >
                                                        Send Acknowledgment
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </TabPanel>
                            <TabPanel className="flex focus:outline-none min-h-[800px]">
                                <div className="flex flex-col min-w-0 bg-muted/10 w-full">
                                    {/* Chat Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-foreground">Activity Stream</h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">#ORD-2055</span>
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
                                            <Button variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                                <PlusIcon className="h-4 w-4" />
                                            </Button>
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
                                                        <div className={cn(
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
                                                <Input
                                                    type="text"
                                                    placeholder="Type a message or use @ to mention..."
                                                    className="w-full pl-4 pr-12 py-3 bg-muted/50 border-0 rounded-xl text-foreground placeholder-muted-foreground focus:ring-primary transition-shadow shadow-none focus:shadow-md"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <Button variant="ghost" className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted">
                                                        <PaperClipIcon className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button variant="primary" className="h-auto w-auto p-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm bg-primary text-primary-foreground">
                                                <PaperAirplaneIcon className="h-5 w-5" />
                                            </Button>
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
                                                <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Pending Review</p>
                                                <p className="text-xs text-muted-foreground">Waiting for Final Approval (2/3)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                                        <div>
                                            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Suggested Actions</h4>
                                            <div className="space-y-3">
                                                <Button
                                                    onClick={() => setIsDocumentModalOpen(true)}
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-zinc-900 dark:text-primary">
                                                        <DocumentTextIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-zinc-900 dark:group-hover:text-primary transition-colors">Process Quote</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">Analyze PDF & Extract Data</p>
                                                    </div>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-green-500/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors text-green-600 dark:text-green-400">
                                                        <CheckIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Approve Order</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">Move to Production</p>
                                                    </div>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    className="w-full h-auto justify-start group relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-amber-500/50 hover:shadow-md transition-all text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600 dark:text-amber-400">
                                                        <PencilIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Request Changes</p>
                                                        <p className="text-[10px] text-muted-foreground font-normal normal-case">Send feedback to vendor</p>
                                                    </div>
                                                </Button>
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
                                                        <p className="text-xs font-medium text-zinc-900 dark:text-primary">AI Assistant is processing the new quote...</p>
                                                        <p className="text-[10px] text-zinc-700 dark:text-primary/80 mt-1">Estimated completion: 30s</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-border bg-muted/50">
                                        <Button variant="ghost" className="w-full h-auto py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
                                            View Activity Log <ArrowRightOnRectangleIcon className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>

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
                                        <Button variant="ghost" onClick={() => setIsDocumentModalOpen(false)} className="h-auto p-1 text-muted-foreground hover:text-foreground">
                                            <XMarkIcon className="h-6 w-6" />
                                        </Button>
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
                                        <Button
                                            variant="outline"
                                            className="px-4 py-2 border-transparent bg-muted hover:bg-muted/80"
                                            onClick={() => setIsDocumentModalOpen(false)}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="px-4 py-2 border-transparent"
                                            onClick={() => { }}
                                        >
                                            Download PDF
                                        </Button>
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
