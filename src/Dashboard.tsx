import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, Transition, TransitionChild, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, TruckIcon,
    ArrowRightOnRectangleIcon, MagnifyingGlassIcon, BellIcon, CalendarIcon,
    CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, Squares2X2Icon,
    EllipsisHorizontalIcon, ListBulletIcon, SunIcon, MoonIcon,
    ChevronDownIcon, ChevronUpIcon, EyeIcon, PencilIcon, TrashIcon,
    CheckIcon, MapPinIcon, UserIcon, ClockIcon, ShoppingBagIcon, ExclamationTriangleIcon, PencilSquareIcon,
    BookOpenIcon, UsersIcon, TagIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    SparklesIcon,
    ArrowRightIcon,
    BanknotesIcon,
    WrenchScrewdriverIcon,
    ArrowDownTrayIcon,

    ChatBubbleLeftRightIcon,
    CloudArrowUpIcon,
    LinkIcon,
    BuildingStorefrontIcon,
    ComputerDesktopIcon,
    DocumentPlusIcon,
    ChevronLeftIcon,
    ChevronRightIcon,

    LightBulbIcon,
    Bars3BottomLeftIcon,
    Bars3Icon
} from '@heroicons/react/24/outline'
import { Reorder } from 'framer-motion'
import { useState, useMemo, useEffect, useRef } from 'react'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

import { useTenant } from './TenantContext'
import Select from './components/Select'
import FeatureManager, { type Feature } from './components/FeatureManager'
import ERPSyncModal from './components/modals/ERPSyncModal'
import ProjectTrackerWidget from './components/widgets/ProjectTrackerWidget'
import InventoryForecastWidget from './components/widgets/InventoryForecastWidget'
import InstallationSchedulerWidget from './components/widgets/InstallationSchedulerWidget'
import WarrantyClaimsWidget from './components/widgets/WarrantyClaimsWidget'
import POVerificationWidget from './components/widgets/POVerificationWidget'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import CommandCenter from './components/gen-ui/CommandCenter'
import StreamFeed from './components/gen-ui/StreamFeed'
import SmartQuoteHub from './components/widgets/SmartQuoteHub';
import { useGenUI } from './context/GenUIContext'
import DashboardMetricsGrid from './components/DashboardMetricsGrid';
import { Card } from 'strata-design-system';

// Urgent Actions Data (Dealer Persona)
const urgentActions = [
    {
        id: 1,
        title: 'Quote #QT-2941 Expiring',
        description: 'Quote for "Office Expansion" expires in 2 hours.',
        time: '2h remaining',
        type: 'critical',
        action: 'Renew Quote',
        icon: ClockIcon
    },
    {
        id: 2,
        title: 'Low Stock Alert',
        description: 'Ergonomic Chair (Black) is below threshold (5 units).',
        time: 'Urgent',
        type: 'warning',
        action: 'Restock',
        icon: ExclamationTriangleIcon
    },
    {
        id: 3,
        title: 'Pending Approval',
        description: 'Bulk Order #OR-999 requires manager approval.',
        time: '14m ago',
        type: 'info',
        action: 'Approve',
        icon: CheckCircleIcon
    }
]

// Recent Activity Data (Dealer Persona)
const recentActivity = [
    {
        id: 1,
        title: 'Quote converted to PO',
        related: '#QT-2841',
        time: '2 hours ago',
        type: 'success',
        icon: CheckCircleIcon,
        actions: [
            { label: 'View PO', icon: EyeIcon, primary: true },
            { label: 'Download PDF', icon: ArrowDownTrayIcon, primary: false }
        ]
    },
    {
        id: 2,
        title: 'Payment received',
        related: '#INV-7828',
        meta: 'Payment for USD 245.00 was received',
        time: '3 hours ago',
        type: 'info',
        icon: BanknotesIcon,
        actions: [
            { label: 'View Invoice', icon: EyeIcon, primary: true },
            { label: 'Email Receipt', icon: EnvelopeIcon, primary: false }
        ]
    },
    {
        id: 3,
        title: 'Discrepancy detected',
        related: '#OR-9823',
        time: '4 hours ago',
        type: 'warning',
        icon: ExclamationTriangleIcon,
        aiSuggestion: 'AI Suggests: Review shipping logs for weight mismatch.',
        actions: [
            { label: 'Review Issue', icon: WrenchScrewdriverIcon, primary: true },
            { label: 'Contact Support', icon: ChatBubbleLeftRightIcon, primary: false }
        ]
    },
    {
        id: 4,
        title: 'Shipment delayed',
        related: '#SH-4519',
        meta: 'Shipment delayed due to bad weather',
        time: '5 hours ago',
        type: 'error',
        icon: TruckIcon,
        actions: [
            { label: 'Track Shipment', icon: MapPinIcon, primary: true },
            { label: 'Notify Client', icon: ChatBubbleLeftRightIcon, primary: false }
        ]
    }
]

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const salesData = [
    { name: 'Jan', sales: 4000, costs: 2400 },
    { name: 'Feb', sales: 3000, costs: 1398 },
    { name: 'Mar', sales: 2000, costs: 9800 },
    { name: 'Apr', sales: 2780, costs: 3908 },
    { name: 'May', sales: 1890, costs: 4800 },
    { name: 'Jun', sales: 2390, costs: 3800 },
]



const trackingSteps = [
    { status: 'Order Placed', date: 'Dec 20, 9:00 AM', location: 'System', completed: true },
    { status: 'Processing', date: 'Dec 21, 10:30 AM', location: 'Warehouse A', completed: true },
    { status: 'Shipped', date: 'Dec 22, 4:15 PM', location: 'Logistics Center', completed: true },
    { status: 'Customs Hold', date: 'Dec 24, 11:00 AM', location: 'Port of Entry', completed: false, alert: true },
]

// Mock Data for Recent Quotes
const recentQuotes = [
    { id: 'QT-2942', date: 'Oct 24, 2023', amount: '$1,200.00', status: 'Pending' },
    { id: 'QT-2941', date: 'Oct 22, 2023', amount: '$4,500.00', status: 'Approved' },
    { id: 'QT-2940', date: 'Oct 20, 2023', amount: '$850.00', status: 'Draft' },
    { id: 'QT-2939', date: 'Oct 15, 2023', amount: '$2,100.00', status: 'Expired' },
]

const recentOrders = [
    { id: "#ORD-2055", customer: "AutoManfacture Co.", client: "AutoManfacture Co.", project: "Office Renovation", amount: "$385,000", status: "Pending Review", date: "Dec 20, 2025", initials: "AC", statusColor: "bg-zinc-100 text-zinc-700" },
    { id: "#ORD-2054", customer: "TechDealer Solutions", client: "TechDealer Solutions", project: "HQ Upgrade", amount: "$62,500", status: "In Production", date: "Nov 15, 2025", initials: "TS", statusColor: "bg-brand-50 text-brand-700 ring-brand-600/20" },
    { id: "#ORD-2053", customer: "Urban Living Inc.", client: "Urban Living Inc.", project: "Lobby Refresh", amount: "$112,000", status: "Shipped", date: "Oct 30, 2025", initials: "UL", statusColor: "bg-green-50 text-green-700 ring-green-600/20" },
    { id: "#ORD-2052", customer: "Global Logistics", client: "Global Logistics", project: "Warehouse Expansion", amount: "$45,000", status: "Delivered", date: "Oct 15, 2025", initials: "GL", statusColor: "bg-gray-100 text-gray-700" },
]



// Mock Data for Performance Metrics
const performanceMetrics = [
    { label: 'Quote win rate', value: 68, target: 65, color: 'bg-brand-400' },
    { label: 'On-time delivery', value: 92, target: 90, color: 'bg-brand-400' },
    { label: 'Discrepancy resolution', value: 45, target: 80, color: 'bg-amber-500' },
    { label: 'Payment speed', value: 78, target: 75, color: 'bg-brand-400' },
    { label: 'Inventory accuracy', value: 99, target: 98, color: 'bg-brand-400' },
]

// Mock Data for AI Suggestions
const aiSuggestions = [
    {
        id: 1,
        title: 'Consolidate Shipments',
        description: 'Combine 3 pending orders for "TechDealer" to save 12% on shipping.',
        impact: 'Save $450',
        icon: TruckIcon,
        type: 'savings'
    },
    {
        id: 2,
        title: 'Bulk Discount Available',
        description: 'Order 5 more "ErgoChairs" to unlock tier-2 pricing (-5%).',
        impact: 'Margin +2%',
        icon: TagIcon,
        type: 'opportunity'
    },
    {
        id: 3,
        title: 'Renew Service Agreement',
        description: 'Tenant "Global Logistics" contract expires in 15 days.',
        impact: 'Retention',
        icon: DocumentTextIcon,
        type: 'action'
    }
]

// Color Mapping for Status Icons - Optimized for Dark Mode Contrast
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
}

// Solid Color Mapping for Action Buttons (High Contrast)
const solidColorStyles: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-blue-500',
    purple: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-purple-500/20 border-indigo-500',
    orange: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-orange-500/20 border-amber-500',
    green: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-500/20 border-green-500',
    pink: 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-500/20 border-pink-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 border-indigo-500',
}

// Simulate Platform Summary Data
const platformSummary = {
    inventory: { label: 'Inventory', value: '$1.2M', sub1: '4.5x Turnover', sub2: '15 Low Stock', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', change: '+0.2%', positive: true },
    catalogs: { label: 'Catalogs', value: '12 Active', sub1: '450 New Items', sub2: '8.5k Views', icon: <BookOpenIcon className="w-5 h-5" />, color: 'purple', change: '+15%', positive: true },
    mac: { label: 'MAC', value: '8 Pending', sub1: '12 Scheduled', sub2: '45 Completed', icon: <TruckIcon className="w-5 h-5" />, color: 'orange', change: '-2%', positive: false },
    transactions: { label: 'Transactions', value: '$385k Rev', sub1: '12 Pending', sub2: '$4.2k Avg Order', icon: <ClipboardDocumentListIcon className="w-5 h-5" />, color: 'green', change: '+3.5%', positive: true },
    crm: { label: 'CRM', value: '45 Leads', sub1: '22% Conv. Rate', sub2: '4.8/5 CSAT', icon: <UsersIcon className="w-5 h-5" />, color: 'pink', change: '+1.2%', positive: true },
    pricing: { label: 'Pricing', value: '24% Margin', sub1: '3 Discounts', sub2: '150 Updates', icon: <TagIcon className="w-5 h-5" />, color: 'indigo', change: '0%', positive: true },
}

// Define props interface if not heavily inferred or complex
interface DashboardProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Dashboard({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: DashboardProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showMetrics, setShowMetrics] = useState(false);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    // const { theme, toggleTheme } = useTheme() // Removed - useTheme not available
    const { currentTenant } = useTenant()
    const { sendMessage, setStreamOpen, setShowTriggers } = useGenUI()

    const handleGenUIAction = (prompt: string) => {
        setStreamOpen(true);
        setShowTriggers(false);
        sendMessage(prompt);
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const expandedScrollRef = useRef<HTMLDivElement>(null)

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 320; // Adjusted for card width + gap
            ref.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedClient, setSelectedClient] = useState('All Clients')
    const [selectedProject, setSelectedProject] = useState('All Projects')
    const [activeTab, setActiveTab] = useState<'metrics' | 'active' | 'completed' | 'all'>('active')
    const [mainTab, setMainTab] = useState<'follow_up' | 'your_tools' | 'metrics'>('follow_up')
    const [expandedActionId, setExpandedActionId] = useState<number | null>(null)
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null)
    const [performanceTimePeriod, setPerformanceTimePeriod] = useState<'Day' | 'Month' | 'Sem' | 'Year'>('Month')
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [isERPSyncModalOpen, setIsERPSyncModalOpen] = useState(false);
    const [isFeatureManagerOpen, setIsFeatureManagerOpen] = useState(false);

    // Mock dashboard customization
    const [activeFeatures, setActiveFeatures] = useState([
        'smart_quote',
        'follow_up_assistant',
        'inventory_forecast'
    ])
    const [features, setFeatures] = useState<Feature[]>([
        // Core (Existing)
        { id: 'recent_orders', title: 'Recent Orders', description: 'Track active, completed, and pending orders at a glance.', enabled: true, category: 'core' },
        { id: 'quick_quote', title: 'Quick Quote', description: 'Start quotes manually or via ERP upload.', enabled: true, category: 'core', required: true },
        // ... other features
        { id: 'project_tracker', title: 'Project Tracker', description: 'Monitor progress across all active installations.', enabled: true, category: 'core' },
        { id: 'inventory_forecast', title: 'Inventory Forecast', description: 'Predict stock needs based on seasonal trends.', enabled: false, category: 'analytics' },
        { id: 'installation_scheduler', title: 'Installation Scheduler', description: 'Manage field teams and site visits.', enabled: false, category: 'operations' },
        { id: 'warranty_claims', title: 'Warranty Claims', description: 'Process and track product issues.', enabled: true, category: 'support' },
        { id: 'po_verification', title: 'PO Verification', description: 'Automated 3-way matching for purchases.', enabled: false, category: 'finance' },
    ])

    // Tools Ordering State
    const [toolsOrder, setToolsOrder] = useState<string[]>([
        'recent_orders',
        'quick_quote',
        'project_tracker',
        'warranty_claims'
    ])

    // Effect to ensure toolsOrder stays in sync with enabled features (optional auto-cleanup)
    // For now, the loop below just checks `features.find(f => f.id === toolId)?.enabled`

    const handleToggleFeature = (id: string, enabled: boolean) => {
        setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled } : f))

        // If enabling a feature not in order, add it to top (or bottom)
        if (enabled && !toolsOrder.includes(id)) {
            setToolsOrder(prev => [id, ...prev])
        }
    }

    const clients = ['All Clients', ...Array.from(new Set(recentOrders.map(o => o.client)))]

    // Filter projects based on selected client
    const availableProjects = useMemo(() => {
        if (selectedClient === 'All Clients') {
            return ['All Projects', ...Array.from(new Set(recentOrders.map(o => o.project)))]
        }
        return ['All Projects', ...Array.from(new Set(recentOrders.filter(o => o.client === selectedClient).map(o => o.project)))]
    }, [selectedClient])

    // Update selectedProject when selectedClient changes
    useEffect(() => {
        if (selectedClient !== 'All Clients' && availableProjects.length > 1) {
            // Auto-select first specific project as requested
            setSelectedProject(availableProjects[1])
        } else {
            setSelectedProject('All Projects')
        }
    }, [selectedClient, availableProjects])
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [trackingOrder, setTrackingOrder] = useState<any>(null)

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedIds(newExpanded)
    }

    // Dynamic Metrics Data based on current filters (Client/Project)


    const filteredOrders = useMemo(() => {
        return recentOrders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesProject = selectedProject === 'All Projects' || order.project === selectedProject
            const matchesClient = selectedClient === 'All Clients' || order.client === selectedClient

            let matchesTab = true;
            if (activeTab === 'active') {
                matchesTab = !['Delivered', 'Completed'].includes(order.status)
            } else if (activeTab === 'completed') {
                matchesTab = ['Delivered', 'Completed'].includes(order.status)
            } else if (activeTab === 'metrics') {
                matchesTab = true // Metrics view handles its own data, this filter is for the table if shown
            }

            return matchesSearch && matchesProject && matchesClient && matchesTab
        })
    }, [searchQuery, selectedProject, selectedClient, activeTab])

    const counts = useMemo(() => {
        return {
            active: recentOrders.filter(o => !['Delivered', 'Completed'].includes(o.status)).length,
            completed: recentOrders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length,
            all: recentOrders.length
        }
    }, [])

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">
            <CommandCenter />
            <StreamFeed />
            {/* Main Content Content - Padded top to account for floating nav */}
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">
                {/* Page Title & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-baseline gap-4">
                            <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                                {currentTenant} Overview
                            </h1>
                            <button
                                onClick={() => onNavigate('tenant-settings')}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                                View Full Profile
                            </button>
                        </div>
                    </div>


                </div>


                {/* KPI Cards / Executive Summary */}
                {showMetrics ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Platform Executive Summary</h2>
                            <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Collapse Summary <ChevronUpIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            {/* Left Column: Carousel */}
                            <div className="relative group/expanded flex-1 min-w-0">
                                {/* Left Scroll Button (Expanded) */}
                                <button
                                    onClick={() => scroll(expandedScrollRef, 'left')}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-gray-200 dark:border-white/10 text-zinc-500 hover:text-foreground opacity-0 group-hover/expanded:opacity-100 transition-all disabled:opacity-0"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>

                                <div
                                    ref={expandedScrollRef}
                                    className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {Object.entries(platformSummary).map(([key, data]) => (
                                        <div
                                            key={key}
                                            className={`min-w-[230px] max-w-[230px] h-[200px] flex flex-col justify-between bg-white dark:bg-zinc-800 backdrop-blur-sm rounded-xl p-3 border border-zinc-200 dark:border-zinc-700 transition-all duration-300 group/card ${expandedCardId === key ? 'ring-1 ring-primary/20 shadow-md' : 'shadow-sm hover:shadow-md'}`}
                                        >
                                            <div className="flex-1 flex flex-col">
                                                {/* Header: Label + Icon */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{data.label}</span>
                                                    <div
                                                        className={`p-1 rounded-md ${colorStyles[data.color]?.replace('ring-1', '') || 'bg-gray-100 dark:bg-zinc-800'} bg-opacity-50 relative group`}
                                                        title={data.label}
                                                    >
                                                        <div className="w-3.5 h-3.5 child-svg:w-full child-svg:h-full">
                                                            {data.icon}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Main Value */}
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="text-xl font-bold text-foreground tracking-tight">{data.value}</span>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${data.positive ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                        {data.change}
                                                    </span>
                                                </div>

                                                {/* Footer: Sub Metrics (Visible by default) */}
                                                <div className={`space-y-0.5 mb-2 ${expandedCardId === key ? 'hidden' : 'block'}`}>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <div className={`w-1 h-1 rounded-full bg-${data.color}-500 shrink-0`}></div>
                                                        <span className="truncate">{data.sub1}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                        <div className={`w-1 h-1 rounded-full bg-${data.color}-500 shrink-0`}></div>
                                                        <span className="truncate">{data.sub2}</span>
                                                    </div>
                                                </div>

                                                {/* Expanded Details (Conditional) */}
                                                {expandedCardId === key && (
                                                    <div className="mt-auto animate-in fade-in slide-in-from-top-1 flex-1 flex flex-col justify-end">
                                                        <div className="space-y-1.5 mb-2">
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-muted-foreground">Trend (30d)</span>
                                                                <span className="font-medium text-foreground">+12%</span>
                                                            </div>
                                                            <div className="flex justify-between text-[10px]">
                                                                <span className="text-muted-foreground">Projection</span>
                                                                <span className="font-medium text-foreground">On Track</span>
                                                            </div>
                                                        </div>
                                                        <button className={`w-full py-1.5 text-[10px] font-semibold rounded-lg transition-all text-center border ${solidColorStyles[data.color]}`}>
                                                            View Report
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons Row */}
                                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-transparent group-hover/card:border-border/50 transition-colors">
                                                <button
                                                    onClick={() => setExpandedCardId(expandedCardId === key ? null : key)}
                                                    className="p-1 -ml-1 hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-medium"
                                                >
                                                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expandedCardId === key ? 'rotate-180' : ''}`} />
                                                    {expandedCardId === key ? 'Less' : 'Details'}
                                                </button>

                                                <button className={`p-1.5 rounded-full transition-all hover:scale-105 border ${solidColorStyles[data.color]}`} title={`Go to ${data.label}`}>
                                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Scroll Button (Expanded) */}
                                <button
                                    onClick={() => scroll(expandedScrollRef, 'right')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-gray-200 dark:border-white/10 text-zinc-500 hover:text-foreground opacity-0 group-hover/expanded:opacity-100 transition-all"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Right Column: Quick Actions Grid */}
                            <div className="w-full xl:w-[400px] shrink-0 flex flex-col h-[200px] xl:h-[200px]">
                                <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3 h-full">
                                    {[
                                        { icon: <DocumentPlusIcon className="w-6 h-6" />, label: "New Quote", desc: "Create a new quote" },
                                        { icon: <CubeIcon className="w-6 h-6" />, label: "Check Stock", desc: "View inventory" },
                                        { icon: <ChartBarIcon className="w-6 h-6" />, label: "Gen. Report", desc: "Analytics summary" },
                                        { icon: <CloudArrowUpIcon className="w-6 h-6" />, label: "ERP Sync", desc: "Sync with ERP", action: () => setIsERPSyncModalOpen(true) },
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={action.action}
                                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border bg-white/50 dark:bg-zinc-800/50 hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 hover:text-zinc-900 transition-all group"
                                        >
                                            <div className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-900 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/20 transition-colors">
                                                {action.icon}
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs font-semibold text-foreground group-hover:text-zinc-900 block">{action.label}</span>
                                                <span className="text-[10px] text-muted-foreground hidden sm:block">{action.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Collapsed Ticker View - Carousel */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Left Scroll Button */}
                            <button
                                onClick={() => scroll(scrollContainerRef, 'left')}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Ensure scrollbar is hidden
                            >
                                {Object.entries(platformSummary).map(([key, data]) => (
                                    <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                        {/* Icon with Floating Tooltip */}
                                        <div
                                            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-zinc-800'}`}
                                            title={data.label}
                                        >
                                            {data.icon}
                                        </div>

                                        {/* Stacked Value & Change */}
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                            <span className={`text-[10px] font-bold mt-1 ${data.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {data.change}
                                            </span>
                                        </div>

                                        {/* Divider (except last) */}
                                        <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Scroll Button */}
                            <button
                                onClick={() => scroll(scrollContainerRef, 'right')}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                        {/* Quick Actions Integrated - Compact */}
                        <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                            {[
                                { icon: <DocumentPlusIcon className="w-5 h-5" />, label: "New Quote" },
                                { icon: <CubeIcon className="w-5 h-5" />, label: "Check Stock" },
                                { icon: <ChartBarIcon className="w-5 h-5" />, label: "Gen. Report" },
                                { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "ERP Sync", action: () => setIsERPSyncModalOpen(true) },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.action}
                                    className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white transition-colors relative group"
                                    title={action.label}
                                >
                                    {action.icon}
                                </button>
                            ))}
                            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
                            <button className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white transition-colors relative group" title="View All & Manage">
                                <Squares2X2Icon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                        <button
                            onClick={() => setShowMetrics(true)}
                            className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            title="Expand Summary"
                        >
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                )
                }

                {/* Main Tabs Navigation */}
                <div className="flex items-center mt-8 mb-6">
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setMainTab('follow_up')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                mainTab === 'follow_up'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <ListBulletIcon className="w-4 h-4" />
                            Follow Up
                        </button>
                        <button
                            onClick={() => setMainTab('your_tools')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                mainTab === 'your_tools'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                            Your tools
                        </button>
                        <button
                            onClick={() => setMainTab('metrics')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                mainTab === 'metrics'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <ChartBarIcon className="w-4 h-4" />
                            Metrics
                        </button>
                    </div>
                </div>


                {/* Follow Up Tab Content */}
                {
                    mainTab === 'follow_up' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* New Section: Urgent Actions & Recent Activity */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Left Column: Urgent Actions */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                            Urgent Actions
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold">
                                            3 Pending
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {urgentActions.map((action) => (
                                            <div key={action.id} className="group border border-border rounded-xl hover:border-zinc-400 transition-all duration-200 bg-zinc-50/50 dark:bg-zinc-800/50">
                                                <div
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => setExpandedActionId(expandedActionId === action.id ? null : action.id)}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex gap-3">
                                                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${action.type === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                                action.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                                }`}>
                                                                <action.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-foreground">{action.title}</h4>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${action.type === 'critical' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                action.type === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                    'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                                }`}>
                                                                {action.time}
                                                            </span>
                                                            <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform ${expandedActionId === action.id ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Expandable Quick Action */}
                                                <div className={`overflow-hidden transition-all duration-300 ${expandedActionId === action.id ? 'max-h-20 opacity-100 border-t border-border' : 'max-h-0 opacity-0'}`}>
                                                    <div className="p-3 bg-secondary flex justify-end gap-2">
                                                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors">
                                                            Dismiss
                                                        </button>
                                                        <button
                                                            onClick={() => handleGenUIAction(`${action.action} ${action.title}`)}
                                                            className="text-xs font-bold bg-primary text-zinc-900 px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
                                                        >
                                                            {action.action}
                                                            <ArrowRightIcon className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Recent Activity Feed */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2">
                                            {/* Changed from text-primary (lime) to text-zinc-500 for better visibility in light mode */}
                                            <ClockIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                                            Recent Activity
                                        </h3>
                                        <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors">
                                            Related to You
                                            <ChevronDownIcon className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {recentActivity.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${expandedActivityId === item.id
                                                    ? 'bg-muted/30 border-zinc-400 shadow-sm'
                                                    : 'bg-secondary border-border hover:border-zinc-400 hover:bg-muted/10'
                                                    }`}
                                            >
                                                <div
                                                    className="p-4 cursor-pointer"
                                                    onClick={() => setExpandedActivityId(expandedActivityId === item.id ? null : item.id)}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                                            item.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                                                item.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                            }`}>
                                                            <item.icon className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    {/* Removed group-hover:text-primary for better legibility, added decoration instead */}
                                                                    <p className="text-sm font-medium text-foreground group-hover:underline decoration-zinc-300 dark:decoration-zinc-600 underline-offset-4 transition-all truncate">
                                                                        {item.title}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                                                        <span>{item.time}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                                                        <span className="font-mono">{item.related}</span>
                                                                    </p>
                                                                </div>
                                                                <ChevronDownIcon className={`w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0 ${expandedActivityId === item.id ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expandable Details & Actions */}
                                                <div className={`transition-all duration-300 ease-in-out ${expandedActivityId === item.id ? 'max-h-80 opacity-100 border-t border-border/50' : 'max-h-0 opacity-0'
                                                    }`}>
                                                    <div className="p-4 bg-muted/20 space-y-4">
                                                        {item.meta && (
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 pl-2 border-l-2 border-border">
                                                                {item.meta}
                                                            </div>
                                                        )}

                                                        {/* Quick Actions Integration */}
                                                        {item.actions && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.actions.map((action, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${action.primary
                                                                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent hover:bg-zinc-700 dark:hover:bg-zinc-200'
                                                                            : 'bg-white dark:bg-transparent text-foreground border-border hover:bg-muted'
                                                                            }`}
                                                                    >
                                                                        <action.icon className="w-3.5 h-3.5" />
                                                                        {action.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {item.aiSuggestion && (
                                                            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/10 p-3">
                                                                <div className="flex items-start gap-3">
                                                                    <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                                    <div className="flex-1">
                                                                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                                                            AI Insight
                                                                        </p>
                                                                        <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed mb-2">
                                                                            {item.aiSuggestion}
                                                                        </p>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleGenUIAction(`Resolve ${item.title} for ${item.related}`);
                                                                            }}
                                                                            className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                                                                        >
                                                                            Resolve Issue <SparklesIcon className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-muted/50">
                                            View All Activity
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* New Section: Performance & AI Suggestions */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {/* Left Column: AI Suggestions */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2">
                                            <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                            AI Suggestions
                                        </h3>
                                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                            3 New
                                        </span>
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        {aiSuggestions.map((suggestion) => (
                                            <div key={suggestion.id} className="p-4 rounded-xl border border-border bg-muted dark:bg-secondary/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors group cursor-pointer">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-card dark:bg-secondary border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                        <suggestion.icon className="w-5 h-5 text-zinc-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="text-sm font-semibold text-foreground">{suggestion.title}</h4>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                                {suggestion.impact}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                            {suggestion.description}
                                                        </p>
                                                        <button
                                                            onClick={() => handleGenUIAction(`Apply Suggestion: ${suggestion.title}`)}
                                                            className="mt-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group/btn"
                                                        >
                                                            Apply Suggestion <ArrowRightIcon className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: Performance Tracking (Adaptive) */}
                                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full relative overflow-hidden group">
                                    {/* Background glow effect - Adaptive */}
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-brand-500/10 dark:bg-brand-500/20 blur-3xl rounded-full pointer-events-none opacity-50 dark:opacity-100"></div>

                                    <div className="flex items-center justify-between mb-8 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-brand font-semibold text-foreground">Performance</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Operational metrics vs Targets</p>
                                        </div>
                                        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700/50">
                                            {['Day', 'Month', 'Sem', 'Year'].map((period) => (
                                                <button key={period} className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${period === 'Month' ? 'bg-white dark:bg-brand-400 text-foreground dark:text-zinc-900 shadow-sm border border-border dark:border-transparent' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700'}`}>
                                                    {period}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1 relative z-10">
                                        {performanceMetrics.map((metric, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                                                    <span className="text-lg font-bold text-foreground">{metric.value}%</span>
                                                </div>
                                                <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full ${metric.color} rounded-full`}
                                                        style={{ width: `${metric.value}%` }}
                                                    ></div>
                                                    {/* Target Marker - Adaptive Contrast */}
                                                    <div
                                                        className="absolute top-0 w-0.5 h-full bg-zinc-400 dark:bg-white/50 z-10"
                                                        style={{ left: `${metric.target}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-end mt-1">
                                                    <span className="text-[10px] text-muted-foreground font-mono tracking-tight">{metric.target}% TARGET</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Your Tools Tab Content */}
                {
                    mainTab === 'your_tools' && (
                        <div className="lg:col-span-3 space-y-6">
                            {/* Config Bar - Optimized for Contrast */}
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-zinc-900/10 border border-gray-200/50 dark:border-white/5 rounded-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Tools configured for you</span>
                                </div>
                                <button
                                    onClick={() => setIsFeatureManagerOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                                >
                                    <PencilSquareIcon className="w-3.5 h-3.5" />
                                    Customize
                                </button>
                            </div>

                            <FeatureManager
                                isOpen={isFeatureManagerOpen}
                                onClose={() => setIsFeatureManagerOpen(false)}
                                features={features}
                                onToggleFeature={handleToggleFeature}
                            />

                            <Reorder.Group axis="y" values={toolsOrder} onReorder={setToolsOrder} className="space-y-6">
                                {toolsOrder.map((toolId) => {
                                    const feature = features.find(f => f.id === toolId)
                                    // Only render if feature exists and is enabled
                                    if (!feature || !feature.enabled) return null;

                                    return (
                                        <Reorder.Item
                                            key={toolId}
                                            value={toolId}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                                            className="mb-8 rounded-2xl bg-card overflow-hidden relative"
                                        >
                                            {/* Drag Handle Overlay - Optional if using specific handle, but Reorder.Item defaults to whole item draggable unless dragListener={false} */}
                                            {/* We want smooth reordering, so we'll let the user drag from anywhere or just handle? User asked for guidance, usually handle is explicit. */}
                                            {/* Let's try explicit handle for better control as requested "guide" */}

                                            {toolId === 'recent_orders' ? (
                                                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    {/* Header for Orders */}
                                                    <div className="p-6 border-b border-border">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2 cursor-grab active:cursor-grabbing">
                                                                <Bars3Icon className="w-5 h-5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors" />
                                                                Recent Orders
                                                            </h3>
                                                        </div>
                                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                                            {/* Tabs */}
                                                            <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
                                                                {[
                                                                    { id: 'active', label: 'Active', count: counts.active },
                                                                    { id: 'completed', label: 'Completed', count: counts.completed },
                                                                    { id: 'all', label: 'All', count: counts.all },
                                                                    { id: 'metrics', label: 'Metrics', count: null }
                                                                ].map((tab) => (
                                                                    <button
                                                                        key={tab.id}
                                                                        onClick={() => setActiveTab(tab.id as any)}
                                                                        className={cn(
                                                                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none",
                                                                            activeTab === tab.id
                                                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                                                : "text-muted-foreground hover:text-foreground"
                                                                        )}
                                                                    >
                                                                        {tab.id === 'metrics' && <ChartBarIcon className="w-4 h-4" />}
                                                                        {tab.label}
                                                                        {tab.count !== null && (
                                                                            <span className={cn(
                                                                                "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                                                                                activeTab === tab.id
                                                                                    ? "bg-primary-foreground/10 text-primary-foreground"
                                                                                    : "bg-background text-muted-foreground group-hover:bg-muted"
                                                                            )}>
                                                                                {tab.count}
                                                                            </span>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <div className="relative group">
                                                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search orders..."
                                                                        className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground w-full sm:w-64 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground"
                                                                        value={searchQuery}
                                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                                    />
                                                                </div>

                                                                {/* Client Filter */}
                                                                <div className="w-48">
                                                                    <Select
                                                                        value={selectedClient}
                                                                        onChange={setSelectedClient}
                                                                        options={clients}
                                                                    />
                                                                </div>

                                                                {/* Project Filter */}
                                                                <div className="w-48">
                                                                    <Select
                                                                        value={selectedProject}
                                                                        onChange={setSelectedProject}
                                                                        options={availableProjects}
                                                                    />
                                                                </div>

                                                                <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

                                                                <div className="flex bg-muted p-1 rounded-lg">
                                                                    <button
                                                                        onClick={() => setViewMode('list')}
                                                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                                    >
                                                                        <ListBulletIcon className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setViewMode('grid')}
                                                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                                                    >
                                                                        <Squares2X2Icon className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-6 bg-muted/30 min-h-[300px]">
                                                        {activeTab === 'metrics' ? (
                                                            <DashboardMetricsGrid selectedClient={selectedClient} />
                                                        ) : viewMode === 'list' ? (
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full divide-y divide-border">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                                                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                                                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                                                            <th className="px-3 py-3.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                                                            <th className="relative px-3 py-3.5"><span className="sr-only">Actions</span></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-border bg-transparent">
                                                                        {filteredOrders.map((order) => (
                                                                            <Fragment key={order.id}>
                                                                                <tr
                                                                                    className={`hover:bg-muted/50 transition-colors cursor-pointer ${expandedIds.has(order.id) ? 'bg-primary/5' : ''}`}
                                                                                    onClick={() => toggleExpand(order.id)}
                                                                                >
                                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-foreground flex items-center gap-2">
                                                                                        {expandedIds.has(order.id) ? <ChevronDownIcon className="h-4 w-4 text-foreground" /> : <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />}
                                                                                        {order.id}
                                                                                    </td>
                                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground/80">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">{order.initials}</div>
                                                                                            {order.customer}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground/80">{order.amount}</td>
                                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                                        <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", order.statusColor)}>
                                                                                            {order.status}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground/80">{order.date}</td>
                                                                                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                                                                                        <Menu as="div" className="relative inline-block text-left">
                                                                                            <MenuButton onClick={(e) => e.stopPropagation()} className="bg-transparent p-1 rounded-full text-muted-foreground hover:text-foreground">
                                                                                                <EllipsisHorizontalIcon className="h-5 w-5" />
                                                                                            </MenuButton>
                                                                                            <Transition
                                                                                                as={Fragment}
                                                                                                enter="transition ease-out duration-100"
                                                                                                enterFrom="transform opacity-0 scale-95"
                                                                                                enterTo="transform opacity-100 scale-100"
                                                                                                leave="transition ease-in duration-75"
                                                                                                leaveFrom="transform opacity-100 scale-100"
                                                                                                leaveTo="transform opacity-0 scale-95"
                                                                                            >
                                                                                                <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-border">
                                                                                                    <div className="py-1">
                                                                                                        <MenuItem>
                                                                                                            {({ active }) => (
                                                                                                                <button onClick={(e) => { e.stopPropagation(); onNavigateToDetail(); }} className={`${active ? 'bg-muted' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground`}>
                                                                                                                    <span className="w-4 h-4 mr-2" ><DocumentTextIcon /></span> View Details
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </MenuItem>
                                                                                                        <MenuItem>
                                                                                                            {({ active }) => (
                                                                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}>
                                                                                                                    <span className="w-4 h-4 mr-2" ><PencilSquareIcon /></span> Edit
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </MenuItem>
                                                                                                        <MenuItem>
                                                                                                            {({ active }) => (
                                                                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
                                                                                                                    <span className="w-4 h-4 mr-2" ><TrashIcon /></span> Delete
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </MenuItem>
                                                                                                        <MenuItem>
                                                                                                            {({ active }) => (
                                                                                                                <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}>
                                                                                                                    <span className="w-4 h-4 mr-2" ><EnvelopeIcon /></span> Contact
                                                                                                                </button>
                                                                                                            )}
                                                                                                        </MenuItem>
                                                                                                    </div>
                                                                                                </MenuItems>
                                                                                            </Transition>
                                                                                        </Menu>
                                                                                    </td>
                                                                                </tr>
                                                                                {/* Details Row */}
                                                                                {expandedIds.has(order.id) && (
                                                                                    <tr>
                                                                                        <td colSpan={6} className="px-0 py-0 border-b border-gray-200 dark:border-white/10">
                                                                                            <div className="p-4 bg-muted dark:bg-secondary pl-12">
                                                                                                <div className="flex items-start gap-4">
                                                                                                    <div className="flex-1 space-y-4">
                                                                                                        <div className="flex items-center gap-3">
                                                                                                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><UserIcon className="w-6 h-6 text-gray-500" /></div>
                                                                                                            <div>
                                                                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                                                                                                                <p className="text-xs text-gray-500">Project Manager</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className="h-px bg-gray-200 dark:bg-white/10 w-full"></div>
                                                                                                        {/* Progress Bar Simple */}
                                                                                                        <div className="relative">
                                                                                                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                                                                                                            <div className="relative flex justify-between">
                                                                                                                {['Placed', 'Mfg', 'Qual', 'Ship'].map((step, i) => (
                                                                                                                    <div key={i} className={`flex flex-col items-center gap-2 ${i < 2 ? 'text-zinc-900 dark:text-white' : 'text-gray-400'}`}>
                                                                                                                        <div className={`w-3 h-3 rounded-full ${i < 2 ? 'bg-primary ring-4 ring-brand-100 dark:ring-brand-900/30' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                                                                                                        <span className="text-xs font-medium">{step}</span>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="w-64">
                                                                                                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                                                                                                            <p className="text-xs font-medium text-gray-500 uppercase">Alert</p>
                                                                                                            <div className="mt-2 flex items-start gap-2">
                                                                                                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                                                                                                <div>
                                                                                                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Customs Delay</p>
                                                                                                                    <p className="text-xs text-gray-500 mt-1">Shipment held at port. ETA +24h.</p>
                                                                                                                    <button onClick={() => setTrackingOrder(order)} className="mt-2 text-xs font-medium text-zinc-900 dark:text-primary decoration-primary underline-offset-2 hover:underline">Track Shipment</button>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                )}
                                                                            </Fragment>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                                {filteredOrders.map((order) => (
                                                                    <div
                                                                        key={order.id}
                                                                        className={`group relative bg-secondary rounded-2xl border ${expandedIds.has(order.id) ? 'border-zinc-300 dark:border-zinc-600 ring-1 ring-zinc-300 dark:ring-zinc-600' : 'border-gray-200 dark:border-white/10'} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col`}
                                                                        onClick={() => toggleExpand(order.id)}
                                                                    >
                                                                        <div className="p-5">
                                                                            <div className="flex items-center justify-between mb-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                                                                        {order.initials}
                                                                                    </div>
                                                                                    <div>
                                                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{order.customer}</h4>
                                                                                        <p className="text-xs text-gray-500">{order.id}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <button onClick={(e) => { e.stopPropagation(); onNavigateToDetail(); }} className="p-1 rounded-full hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary text-gray-400 hover:text-zinc-900 dark:hover:text-zinc-900 transition-colors">
                                                                                        <DocumentTextIcon className="h-5 w-5" />
                                                                                    </button>
                                                                                    <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-full hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary text-gray-400 hover:text-zinc-900 dark:hover:text-zinc-900 transition-colors">
                                                                                        <PencilSquareIcon className="h-5 w-5" />
                                                                                    </button>
                                                                                    <Menu as="div" className="relative inline-block text-left">
                                                                                        <MenuButton onClick={(e) => e.stopPropagation()} className="p-1 rounded-full hover:bg-primary hover:text-zinc-900 dark:hover:bg-primary text-gray-400 dark:hover:text-zinc-900">
                                                                                            <EllipsisHorizontalIcon className="h-5 w-5" />
                                                                                        </MenuButton>
                                                                                        <Transition
                                                                                            as={Fragment}
                                                                                            enter="transition ease-out duration-100"
                                                                                            enterFrom="transform opacity-0 scale-95"
                                                                                            enterTo="transform opacity-100 scale-100"
                                                                                            leave="transition ease-in duration-75"
                                                                                            leaveFrom="transform opacity-100 scale-100"
                                                                                            leaveTo="transform opacity-0 scale-95"
                                                                                        >
                                                                                            <MenuItems className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-white/10">
                                                                                                <div className="py-1">
                                                                                                    <MenuItem>
                                                                                                        {({ active }) => (
                                                                                                            <button onClick={(e) => e.stopPropagation()} className={`${active ? 'bg-gray-50 dark:bg-white/5' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}>
                                                                                                                <span className="w-4 h-4 mr-2" ><TrashIcon /></span> Delete
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </MenuItem>
                                                                                                </div>
                                                                                            </MenuItems>
                                                                                        </Transition>
                                                                                    </Menu>
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-3">
                                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                                                                    <span className="text-xs text-gray-500">Amount</span>
                                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{order.amount}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                                                                                    <span className="text-xs text-gray-500">Date</span>
                                                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{order.date}</span>
                                                                                </div>
                                                                                <div className="flex justify-between items-center pt-2">
                                                                                    <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", order.statusColor)}>
                                                                                        {order.status}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {expandedIds.has(order.id) && (
                                                                            <div className="mt-4 pt-4 px-5 border-t border-gray-100 dark:border-white/5">
                                                                                <div className="flex flex-col md:flex-row gap-8">
                                                                                    <div className="flex-1 space-y-6">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                                                                                <UserIcon className="h-4 w-4" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="text-sm font-bold text-gray-900 dark:text-white">Sarah Johnson</p>
                                                                                                <p className="text-xs text-gray-500">Project Manager</p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="relative py-2">
                                                                                            <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 dark:bg-zinc-700" />
                                                                                            <div className="relative z-10 flex justify-between">
                                                                                                {['Placed', 'Mfg', 'Qual', 'Ship'].map((step, i) => (
                                                                                                    <div key={i} className="flex flex-col items-center bg-white dark:bg-zinc-900 px-1">
                                                                                                        <div className={`h-6 w-6 rounded-full flex items-center justify-center ${i <= 1 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 dark:bg-zinc-700 text-gray-400'}`}>
                                                                                                            {i < 1 ? <CheckIcon className="h-4 w-4" /> : <div className={`h-2 w-2 rounded-full ${i <= 1 ? 'bg-primary-foreground' : 'bg-white/50'}`} />}
                                                                                                        </div>
                                                                                                        <span className={`mt-2 text-xs font-medium ${i <= 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-gray-500'}`}>{step}</span>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="w-full md:w-[280px]">
                                                                                        <div className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
                                                                                            <div className="flex gap-3">
                                                                                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 shrink-0" />
                                                                                                <div>
                                                                                                    <h5 className="text-sm font-bold text-amber-700 dark:text-amber-400">Alert: Customs Delay</h5>
                                                                                                    <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/70">Held at port. ETA +24h.</p>
                                                                                                    <button onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }} className="mt-2 text-xs font-medium text-zinc-900 dark:text-primary decoration-primary underline-offset-2 hover:underline">
                                                                                                        Track Shipment
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {expandedIds.has(order.id) && (
                                                                            <div className="mt-6 bg-gray-50 dark:bg-white/5 p-4 border-t border-gray-200 dark:border-white/10">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <ShoppingBagIcon className="h-4 w-4 text-gray-400" />
                                                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Order Items (3)</span>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    {['Office Chair Ergonomic', 'Standing Desk Motorized'].map((item, i) => (
                                                                                        <div key={i} className="flex justify-between text-xs">
                                                                                            <span className="text-gray-500">{item}</span>
                                                                                            <span className="text-gray-900 dark:text-white font-medium">x1</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="p-4 pt-0 mt-auto">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                                                                className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center justify-center gap-2"
                                                                            >
                                                                                <MapPinIcon className="h-3 w-3" /> Track Shipment
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : toolId === 'quick_quote' ? (
                                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                                    {/* Left Column: Quick Quote Action Panel (2/3 width) */}
                                                    <div className="xl:col-span-2">
                                                        <SmartQuoteHub onNavigate={onNavigate} />
                                                    </div>

                                                    {/* Right Column: Recent Quotes List (1/3 width) */}
                                                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col h-full">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-lg font-brand font-semibold text-foreground">Recent Quotes</h3>
                                                            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">View All</button>
                                                        </div>

                                                        <div className="flex-1 overflow-auto">
                                                            <div className="space-y-4">
                                                                {recentQuotes.map((quote) => (
                                                                    <div key={quote.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 transition-colors cursor-pointer group">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                                                                                <DocumentTextIcon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-foreground">{quote.id}</p>
                                                                                <p className="text-xs text-muted-foreground">{quote.date}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-bold text-foreground">{quote.amount}</p>
                                                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${quote.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                                                quote.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                                                                }`}>
                                                                                {quote.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <button className="w-full mt-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                                            Create New Quote
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : toolId === 'project_tracker' ? (
                                                <ProjectTrackerWidget />
                                            ) : toolId === 'inventory_forecast' ? (
                                                <InventoryForecastWidget />
                                            ) : toolId === 'installation_scheduler' ? (
                                                <InstallationSchedulerWidget />
                                            ) : toolId === 'warranty_claims' ? (
                                                <WarrantyClaimsWidget />
                                            ) : toolId === 'po_verification' ? (
                                                <POVerificationWidget />
                                            ) : (
                                                /* Placeholder for New B2B Widgets */
                                                <div className="bg-card rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="w-12 h-12 rounded-full bg-muted dark:bg-secondary flex items-center justify-center mb-4">
                                                        <CubeIcon className="w-6 h-6 text-zinc-400" />
                                                    </div>
                                                    <h3 className="text-lg font-brand font-semibold text-foreground">{feature?.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1 max-w-md">{feature?.description}</p>
                                                    <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                                        Launch Preview
                                                    </button>
                                                </div>
                                            )}
                                        </Reorder.Item>
                                    )
                                })}
                            </Reorder.Group>
                        </div>
                    )
                }

                {/* Charts Area */}
                {
                    mainTab === 'metrics' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <DashboardMetricsGrid selectedClient={selectedClient} />
                        </div>
                    )
                }
            </div >

            <Transition appear show={!!trackingOrder} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setTrackingOrder(null)}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 dark:bg-black/80 backdrop-blur-sm" />
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
                                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-zinc-900 dark:text-white flex justify-between items-center mb-6"
                                    >
                                        <span>Tracking Details - {trackingOrder?.id}</span>
                                        <button
                                            onClick={() => setTrackingOrder(null)}
                                            className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </Dialog.Title>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left Col: Timeline */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider">Shipment Progress</h4>
                                            <div className="space-y-6 relative pl-2 border-l border-zinc-200 dark:border-zinc-800 ml-2">
                                                {trackingSteps.map((step, idx) => (
                                                    <div key={idx} className="relative pl-6">
                                                        <div className={cn(
                                                            "absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-zinc-900",
                                                            step.completed ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700",
                                                            step.alert && "bg-red-500 dark:bg-red-500"
                                                        )} />
                                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{step.status}</p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{step.date} · {step.location}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Col: Georefence & Actions */}
                                        <div className="flex flex-col h-full">
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider">Delivery Location</h4>

                                            {/* Map Placeholder */}
                                            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg h-40 w-full mb-4 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                                <div className="text-center">
                                                    <MapPinIcon className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Map Preview Unavailable</span>
                                                </div>
                                            </div>

                                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 mb-6">
                                                <p className="text-xs font-medium text-zinc-900 dark:text-white">Distribution Center NY-05</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">45 Industrial Park Dr, Brooklyn, NY 11201</p>
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                                <button
                                                    type="button"
                                                    className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-brand-300 dark:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                                                    onClick={() => console.log('Contacting support...')}
                                                >
                                                    <EnvelopeIcon className="h-4 w-4" />
                                                    Contact Support
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* ERP Sync Modal */}
            <ERPSyncModal
                isOpen={isERPSyncModalOpen}
                onClose={() => setIsERPSyncModalOpen(false)}
            />

        </div >
    )
}


