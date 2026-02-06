import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, Transition, TransitionChild, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, TruckIcon,
    ArrowRightOnRectangleIcon, MagnifyingGlassIcon, BellIcon, CalendarIcon,
    CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, Squares2X2Icon,
    EllipsisHorizontalIcon, ListBulletIcon, SunIcon, MoonIcon,
    ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, EyeIcon, PencilIcon, TrashIcon,
    CheckIcon, MapPinIcon, UserIcon, ClockIcon, ShoppingBagIcon, ExclamationTriangleIcon, PencilSquareIcon,
    ShoppingCartIcon, ClipboardDocumentCheckIcon, WrenchScrewdriverIcon, ChevronLeftIcon, CloudArrowUpIcon, DocumentPlusIcon,
    FunnelIcon, ArrowRightIcon, SparklesIcon
} from '@heroicons/react/24/outline'
import { useState, useMemo, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

import { useTheme } from './useTheme'
import { useTenant } from './TenantContext'
import Select from './components/Select'
import CreateOrderModal from './components/CreateOrderModal'
import SmartQuoteHub from './components/widgets/SmartQuoteHub'
import Breadcrumbs from './components/Breadcrumbs'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const inventoryData = [
    { name: 'Seating', value: 78, amt: 480 },
    { name: 'Tables', value: 62, amt: 300 },
    { name: 'Storage', value: 45, amt: 340 },
]

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

const recentOrders = [
    { id: "#ORD-2055", customer: "AutoManfacture Co.", client: "AutoManfacture Co.", project: "Office Renovation", amount: "$385,000", status: "Order Received", date: "Dec 20, 2025", initials: "AC", statusColor: "bg-zinc-100 text-zinc-700", location: "New York" },
    { id: "#ORD-2054", customer: "TechDealer Solutions", client: "TechDealer Solutions", project: "HQ Upgrade", amount: "$62,500", status: "In Production", date: "Nov 15, 2025", initials: "TS", statusColor: "bg-brand-50 text-brand-700 ring-brand-600/20", location: "London" },
    { id: "#ORD-2053", customer: "Urban Living Inc.", client: "Urban Living Inc.", project: "Lobby Refresh", amount: "$112,000", status: "Ready to Ship", date: "Oct 30, 2025", initials: "UL", statusColor: "bg-green-50 text-green-700 ring-green-600/20", location: "Austin" },
    { id: "#ORD-2052", customer: "Global Logistics", client: "Global Logistics", project: "Warehouse Expansion", amount: "$45,000", status: "Delivered", date: "Oct 15, 2025", initials: "GL", statusColor: "bg-gray-100 text-gray-700", location: "Berlin" },
    { id: "#ORD-2051", customer: "City Builders", client: "City Builders", project: "City Center", amount: "$120,000", status: "Order Received", date: "Jan 05, 2026", initials: "CB", statusColor: "bg-zinc-100 text-zinc-700", location: "New York" },
    { id: "#ORD-2050", customer: "Modern Homes", client: "Modern Homes", project: "Residential A", amount: "$85,000", status: "Acknowledgement", date: "Jan 02, 2026", initials: "MH", statusColor: "bg-blue-50 text-blue-700", location: "Austin" },
    { id: "#ORD-2049", customer: "Coastal Props", client: "Coastal Props", project: "Beach House", amount: "$210,000", status: "In Production", date: "Dec 10, 2025", initials: "CP", statusColor: "bg-purple-50 text-purple-700", location: "London" },
    { id: "#ORD-2048", customer: "Valley Homes", client: "Valley Homes", project: "Mountain Retreat", amount: "$95,000", status: "Ready to Ship", date: "Nov 20, 2025", initials: "VH", statusColor: "bg-indigo-50 text-indigo-700", location: "Berlin" },
    { id: "#ORD-2047", customer: "Elite Builders", client: "Elite Builders", project: "Sky V", amount: "$450,000", status: "In Transit", date: "Nov 05, 2025", initials: "EB", statusColor: "bg-orange-50 text-orange-700", location: "New York" },
]

const recentQuotes = [
    { id: "QT-1025", customer: "Apex Tech", project: "New HQ", amount: "$1,200,000", status: "Negotiating", date: "Jan 12, 2026", validUntil: "Feb 12, 2026", probability: "High", initials: "AT", statusColor: "bg-purple-50 text-purple-700", location: "Austin" },
    { id: "QT-1024", customer: "BioLife Inc", project: "Lab Expansion", amount: "$540,000", status: "Draft", date: "Jan 10, 2026", validUntil: "Draft", probability: "N/A", initials: "BL", statusColor: "bg-zinc-100 text-zinc-700", location: "Boston" },
    { id: "QT-1023", customer: "FinServe Corp", project: "Branch Rollout", amount: "$890,000", status: "Sent", date: "Jan 08, 2026", validUntil: "Feb 08, 2026", probability: "Medium", initials: "FS", statusColor: "bg-blue-50 text-blue-700", location: "New York" },
    { id: "QT-1022", customer: "Redwood School", project: "Classroom Refresh", amount: "$150,000", status: "Approved", date: "Dec 28, 2025", validUntil: "Jan 28, 2026", probability: "Closed", initials: "RS", statusColor: "bg-green-50 text-green-700", location: "Portland" },
]

const recentAcknowledgments = [
    { id: "ACK-8839", relatedPo: "PO-2026-001", vendor: "Herman Miller", status: "Confirmed", date: "Jan 14, 2026", expShipDate: "Feb 20, 2026", discrepancy: "None", initials: "HM", statusColor: "bg-green-50 text-green-700", location: "Zeeland" },
    { id: "ACK-8840", relatedPo: "PO-2026-002", vendor: "Steelcase", status: "Discrepancy", date: "Jan 13, 2026", expShipDate: "Pending", discrepancy: "Price Mismatch ($500)", initials: "SC", statusColor: "bg-red-50 text-red-700", location: "Grand Rapids" },
    { id: "ACK-8841", relatedPo: "PO-2026-003", vendor: "Knoll", status: "Partial", date: "Jan 12, 2026", expShipDate: "Mar 01, 2026", discrepancy: "Backordered Items", initials: "KN", statusColor: "bg-orange-50 text-orange-700", location: "East Greenville" },
]

// Pipeline stages
const pipelineStages = ['Order Received', 'In Production', 'Ready to Ship', 'In Transit', 'Delivered']
const quoteStages = ['Draft', 'Sent', 'Negotiating', 'Approved', 'Lost']
const ackStages = ['Pending', 'Discrepancy', 'Partial', 'Confirmed']


// Color Mapping for Status Icons
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-400/30',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
}

const solidColorStyles: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-blue-500',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/20 border-purple-500',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-500/20 border-orange-500',
    green: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-500/20 border-green-500',
    pink: 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-500/20 border-pink-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 border-indigo-500',
}

// Summary Data matching Wireframe
const ordersSummary = {
    active_orders: { label: 'Active Orders', value: '89', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue' },
    pending_approval: { label: 'Pending Approval', value: '12', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange' },
    in_production: { label: 'In Production', value: '34', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple' },
    ready_to_ship: { label: 'Ready to Ship', value: '23', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo' },
    total_value: { label: 'Total Value', value: '$3.8M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green' },
}

const quotesSummary = {
    open_quotes: { label: 'Open Quotes', value: '14', sub: 'Draft or Sent', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue' },
    negotiating: { label: 'Negotiating', value: '5', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange' },
    approved_ytd: { label: 'Approved', value: '42', sub: 'This year', icon: <CheckIcon className="w-5 h-5" />, color: 'green' },
    win_rate: { label: 'Win Rate', value: '68%', sub: 'vs Last Quarter', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple' },
    pipeline_val: { label: 'Pipeline Val', value: '$2.1M', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo' },
}

const acksSummary = {
    pending_acks: { label: 'Pending Acks', value: '8', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange' },
    discrepancies: { label: 'Discrepancies', value: '3', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red' },
    confirmed: { label: 'Confirmed', value: '156', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green' },
    avg_lead: { label: 'Avg Lead Time', value: '4.2w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue' },
    on_time: { label: 'On Time Rate', value: '94%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple' },
}

// Define props interface if not heavily inferred or complex
interface TransactionsProps {
    onLogout: () => void;
    onNavigateToDetail: (type: string) => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Transactions({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: TransactionsProps) {
    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
    const [showMetrics, setShowMetrics] = useState(false);
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [isQuoteWidgetOpen, setIsQuoteWidgetOpen] = useState(false);
    const { theme, toggleTheme } = useTheme()
    const { currentTenant } = useTenant()

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const expandedScrollRef = useRef<HTMLDivElement>(null)

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 320;
            ref.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    }

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('All Statuses')
    const [selectedLocation, setSelectedLocation] = useState('All Locations')

    const [activeTab, setActiveTab] = useState<'metrics' | 'active' | 'completed' | 'all'>('active')
    const [lifecycleTab, setLifecycleTab] = useState<'quotes' | 'orders' | 'acknowledgments'>('orders')

    const currentDataSet = useMemo(() => {
        if (lifecycleTab === 'quotes') return recentQuotes;
        if (lifecycleTab === 'acknowledgments') return recentAcknowledgments;
        return recentOrders;
    }, [lifecycleTab]);

    const statuses = useMemo(() => ['All Statuses', ...Array.from(new Set(currentDataSet.map(o => o.status)))], [currentDataSet]);
    const locations = useMemo(() => ['All Locations', ...Array.from(new Set(currentDataSet.map(o => o.location || ''))).filter(Boolean)], [currentDataSet]);
    const availableProjects = useMemo(() => ['All Projects', ...Array.from(new Set(currentDataSet.map(o => (o as any).project || ''))).filter(Boolean)], [currentDataSet]);

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

    // Dynamic URL Param Handling
    useEffect(() => {
        const handleUrlParams = () => {
            const params = new URLSearchParams(window.location.search);
            const tab = params.get('tab');
            const id = params.get('id');

            if (tab === 'quotes') setLifecycleTab('quotes');
            if (tab === 'orders') setLifecycleTab('orders');
            if (tab === 'acknowledgments') setLifecycleTab('acknowledgments');

            if (id) {
                setSearchQuery(id);
                setExpandedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.add(id);
                    return newSet;
                });
            }
        };

        handleUrlParams(); // Run on mount

        // Listen for internal navigation events
        window.addEventListener('popstate', handleUrlParams);
        return () => window.removeEventListener('popstate', handleUrlParams);
    }, []);

    // Dynamic Metrics Data based on current filters (Status/Location)
    const metricsData = useMemo(() => {
        const dataToAnalyze = currentDataSet.filter(order => {
            const matchesStatus = selectedStatus === 'All Statuses' || order.status === selectedStatus
            const matchesLocation = selectedLocation === 'All Locations' || (order.location || 'Unknown') === selectedLocation
            return matchesStatus && matchesLocation
        })

        const totalValue = dataToAnalyze.reduce((sum, order) => {
            return sum + parseInt(order.amount.replace(/[^0-9]/g, ''))
        }, 0)

        const activeCount = dataToAnalyze.filter(o => {
            if (lifecycleTab === 'quotes') return !['Approved', 'Lost'].includes((o as any).status);
            if (lifecycleTab === 'acknowledgments') return !['Confirmed'].includes((o as any).status);
            return !['Delivered', 'Completed'].includes(o.status);
        }).length

        const completedCount = dataToAnalyze.filter(o => {
            if (lifecycleTab === 'quotes') return ['Approved', 'Lost'].includes((o as any).status);
            if (lifecycleTab === 'acknowledgments') return ['Confirmed'].includes((o as any).status);
            return ['Delivered', 'Completed'].includes(o.status);
        }).length

        return {
            revenue: totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
            activeOrders: activeCount,
            completedOrders: completedCount,
            efficiency: dataToAnalyze.length > 0 ? Math.round((completedCount / dataToAnalyze.length) * 100) : 0
        }
    }, [selectedStatus, selectedLocation, currentDataSet, lifecycleTab])

    const filteredData = useMemo(() => {
        let currentData = [];
        if (lifecycleTab === 'quotes') currentData = recentQuotes;
        else if (lifecycleTab === 'acknowledgments') currentData = recentAcknowledgments;
        else currentData = recentOrders;

        return currentData.filter(item => {
            const searchString = JSON.stringify(item).toLowerCase();
            const matchesSearch = searchString.includes(searchQuery.toLowerCase());

            // Specific field checks if needed, but JSON dump is easier for generic search
            // const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            //     (item.customer || item.vendor || '').toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = selectedStatus === 'All Statuses' || item.status === selectedStatus
            const matchesLocation = selectedLocation === 'All Locations' || (item.location || 'Unknown') === selectedLocation

            let matchesTab = true;
            if (activeTab === 'active') {
                matchesTab = !['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)
            } else if (activeTab === 'completed') {
                matchesTab = ['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)
            } else if (activeTab === 'metrics') {
                matchesTab = true // Metrics view handles its own data
            }

            return matchesSearch && matchesStatus && matchesLocation && matchesTab
        })
    }, [searchQuery, selectedStatus, selectedLocation, activeTab, lifecycleTab])

    const counts = useMemo(() => {
        return {
            active: currentDataSet.filter(item => !['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)).length,
            completed: currentDataSet.filter(item => ['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)).length,
            all: currentDataSet.length
        }
    }, [currentDataSet])

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">

            {/* Main Content Content - Padded top to account for floating nav */}
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
                            { label: 'Transactions' }
                        ]}
                    />
                </div>

                {/* Lifecycle Tabs Navigation */}
                <div className="flex items-center mb-6">
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setLifecycleTab('quotes')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'quotes'
                                    ? "bg-primary text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50 hover:text-foreground"
                            )}
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            Quotes
                        </button>
                        <button
                            onClick={() => setLifecycleTab('orders')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'orders'
                                    ? "bg-primary text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50 hover:text-foreground"
                            )}
                        >
                            <ShoppingCartIcon className="w-4 h-4" />
                            Orders
                        </button>
                        <button
                            onClick={() => setLifecycleTab('acknowledgments')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'acknowledgments'
                                    ? "bg-primary text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50 hover:text-foreground"
                            )}
                        >
                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            Acknowledgments
                        </button>
                    </div>
                </div>

                {/* Quotes Tab Content */}
                {lifecycleTab === 'quotes' && (
                    <>
                        {/* KPI Cards for Quotes */}
                        {showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                                        {Object.entries(quotesSummary).map(([key, data]) => (
                                            <div key={key} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                                                            data.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                                                                data.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                    'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        }`}>
                                                        {data.icon}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                    <span className="font-medium">{data.sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Quick Actions for Quotes */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote" },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF" },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client" },
                                    ].map((action, i) => (
                                        <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:bg-primary dark:hover:bg-primary hover:text-zinc-900 dark:hover:text-zinc-900 text-gray-500 dark:text-gray-400 transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Collapsed Quotes Metrics */
                            <>
                                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                            {Object.entries(quotesSummary).map(([key, data]) => (
                                                <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-zinc-800'}`}>
                                                        {data.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden xl:block mx-2"></div>
                                    {/* Quick Actions Integrated - Compact */}
                                    <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-gray-200 dark:border-white/10 xl:border-none xl:pl-0">
                                        {[
                                            { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote" },
                                            { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                            { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF" },
                                            { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client" },
                                        ].map((action, i) => (
                                            <button key={i} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground transition-colors relative group" title={action.label}>
                                                {action.icon}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden xl:block mx-2"></div>
                                    <button
                                        onClick={() => setShowMetrics(true)}
                                        className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors"
                                    >
                                        <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-zinc-900" />
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-zinc-900">Details</span>
                                    </button>
                                </div>
                            </>
                        )}
                        <div className="mt-6"></div> {/* Spacer */}
                    </>
                )}

                {/* Acknowledgments Tab Content */}
                {lifecycleTab === 'acknowledgments' && (
                    <>
                        {/* KPI Cards for Acks */}
                        {showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                                        {Object.entries(acksSummary).map(([key, data]) => (
                                            <div key={key} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                                                            data.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                                                                data.color === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                                                    'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        }`}>
                                                        {data.icon}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                    <span className="font-medium">{data.sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Quick Actions for Acks */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Ack" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export List" },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Email Vendor" },
                                        { icon: <WrenchScrewdriverIcon className="w-5 h-5" />, label: "Resolve All" },
                                    ].map((action, i) => (
                                        <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:bg-primary dark:hover:bg-primary hover:text-zinc-900 dark:hover:text-zinc-900 text-gray-500 dark:text-gray-400 transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Collapsed Acks Metrics */
                            <>
                                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                            {Object.entries(acksSummary).map(([key, data]) => (
                                                <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-zinc-800'}`}>
                                                        {data.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden xl:block mx-2"></div>
                                    {/* Quick Actions Integrated - Compact */}
                                    <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-gray-200 dark:border-white/10 xl:border-none xl:pl-0">
                                        {[
                                            { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Ack" },
                                            { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export List" },
                                            { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Email Vendor" },
                                            { icon: <WrenchScrewdriverIcon className="w-5 h-5" />, label: "Resolve All" },
                                        ].map((action, i) => (
                                            <button key={i} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground transition-colors relative group" title={action.label}>
                                                {action.icon}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden xl:block mx-2"></div>
                                    <button
                                        onClick={() => setShowMetrics(true)}
                                        className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors"
                                    >
                                        <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-zinc-900" />
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-zinc-900">Details</span>
                                    </button>
                                </div>
                            </>
                        )}
                        <div className="mt-6"></div> {/* Spacer */}
                    </>
                )}

                {/* Orders Content (Existing) */}
                {lifecycleTab === 'orders' && (
                    <>
                        {/* KPI Cards / Summary Panel */}
                        {showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div
                                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4"
                                        ref={expandedScrollRef}
                                    >
                                        {Object.entries(ordersSummary).map(([key, data]) => (
                                            <div key={key} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                                                            data.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                                                                data.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                                    'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                        }`}>
                                                        {data.icon}
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                                    <span className="font-medium">{data.sub}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Quick Actions below grid when expanded */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order" },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF" },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email" },
                                    ].map((action, i) => (
                                        <button key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary hover:bg-primary dark:hover:bg-primary hover:text-zinc-900 dark:hover:text-zinc-900 text-gray-500 dark:text-gray-400 transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
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
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {Object.entries(ordersSummary).map(([key, data]) => (
                                            <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                {/* Icon with Floating Tooltip */}
                                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-zinc-800'}`}>
                                                    {data.icon}
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg z-50 animate-in fade-in zoom-in duration-200">
                                                        {data.label}
                                                        {/* Arrow */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
                                                    </div>
                                                </div>

                                                {/* Stacked Value & Change */}
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                                                        {data.label}
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

                                <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden xl:block mx-2"></div>

                                {/* Quick Actions Integrated - Compact */}
                                <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-gray-200 dark:border-white/10 xl:border-none xl:pl-0">
                                    {[
                                        { icon: <DocumentPlusIcon className="w-5 h-5" />, label: "New Quote", color: "text-blue-500" },
                                        { icon: <CubeIcon className="w-5 h-5" />, label: "Check Stock", color: "text-orange-500" },
                                        { icon: <ChartBarIcon className="w-5 h-5" />, label: "Gen. Report", color: "text-green-500" },
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "ERP Sync", color: "text-purple-500" },
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (action.label === 'New Quote') setIsQuoteWidgetOpen(true);
                                            }}
                                            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-foreground transition-colors relative group"
                                            title={action.label}
                                        >
                                            {action.icon}
                                        </button>
                                    ))}
                                    <div className="w-px h-6 bg-border/50 mx-1"></div>
                                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-purple-500 transition-colors relative group" title="View All & Manage">
                                        <Squares2X2Icon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="w-px h-12 bg-gray-200 dark:bg-white/10 hidden xl:block mx-2"></div>
                                <button
                                    onClick={() => setShowMetrics(true)}
                                    className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors"
                                >
                                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">Details</span>
                                </button>
                            </div>
                        )}



                    </>
                )}

                {/* Recent Orders - The Grid/List view handled here */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border shadow-sm overflow-hidden">
                            {/* Header for Orders */}
                            <div className="p-6 border-b border-border">
                                <div className="flex flex-col gap-6">
                                    {/* Top Row: Title + Tabs */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                                            {lifecycleTab === 'quotes' ? 'Recent Quotes' : lifecycleTab === 'acknowledgments' ? 'Recent Acknowledgments' : 'Recent Orders'}
                                        </h3>
                                        <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>
                                        {/* Tabs */}
                                        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit overflow-x-auto max-w-full">
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
                                                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap",
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
                                    </div>

                                    {/* Bottom Row: Filters + Actions */}
                                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
                                        {/* Filters Container */}
                                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
                                            <div className="relative group w-full sm:w-auto">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder={lifecycleTab === 'quotes' ? "Search quotes..." : lifecycleTab === 'acknowledgments' ? "Search acknowledgments..." : "Search orders..."}
                                                    className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground w-full sm:w-48 lg:w-64 focus:ring-2 focus:ring-primary outline-none placeholder:text-muted-foreground transition-all"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>

                                            {/* Status Filter */}
                                            <div className="w-full sm:w-40">
                                                <Select
                                                    value={selectedStatus}
                                                    onChange={setSelectedStatus}
                                                    options={statuses}
                                                />
                                            </div>

                                            {/* Location Filter */}
                                            <div className="w-full sm:w-40">
                                                <Select
                                                    value={selectedLocation}
                                                    onChange={setSelectedLocation}
                                                    options={locations}
                                                />
                                            </div>
                                        </div>

                                        {/* Actions Group: View Mode + Create Button */}
                                        <div className="flex items-center gap-4 self-start xl:self-auto">
                                            {/* View Mode Toggle */}
                                            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        viewMode === 'list' ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                                    )}
                                                    title="List View"
                                                >
                                                    <ListBulletIcon className="w-5 h-5" />
                                                </button>
                                                <div className="w-px h-4 bg-border mx-1"></div>
                                                <button
                                                    onClick={() => setViewMode('pipeline')}
                                                    className={cn(
                                                        "p-1.5 rounded-md transition-all",
                                                        viewMode === 'pipeline' ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
                                                    )}
                                                    title="Pipeline View"
                                                >
                                                    <FunnelIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="w-px h-8 bg-border hidden xl:block mx-1"></div>

                                            <button
                                                onClick={() => {
                                                    if (lifecycleTab === 'quotes') {
                                                        setIsQuoteWidgetOpen(true);
                                                    } else {
                                                        setIsCreateOrderOpen(true);
                                                    }
                                                }}
                                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                <span>
                                                    {lifecycleTab === 'quotes' ? 'Create Quote' : lifecycleTab === 'acknowledgments' ? 'Upload Ack' : 'Create Order'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CreateOrderModal isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />

                            {/* Smart Quote Hub Modal */}
                            <Transition appear show={isQuoteWidgetOpen} as={Fragment}>
                                <Dialog as="div" className="relative z-50" onClose={() => setIsQuoteWidgetOpen(false)}>
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
                                                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-xl transition-all">
                                                    <div className="relative">
                                                        {/* Close X Button - Floating */}
                                                        <button
                                                            onClick={() => setIsQuoteWidgetOpen(false)}
                                                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-sm text-zinc-500 hover:text-foreground transition-colors"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <SmartQuoteHub onNavigate={(page: string) => { setIsQuoteWidgetOpen(false); onNavigate(page); }} />
                                                    </div>
                                                </DialogPanel>
                                            </TransitionChild>
                                        </div>
                                    </div>
                                </Dialog>
                            </Transition>

                            {/* Main Content Area */}
                            <div className="p-6 bg-zinc-50/50 dark:bg-black/20 min-h-[500px]">
                                {/* Metrics View special handling */}
                                {activeTab === 'metrics' ? (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
                                            {/* Revenue Card */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                        {lifecycleTab === 'quotes' ? 'Quote Value' : lifecycleTab === 'acknowledgments' ? 'Pending Value' : 'Total Revenue'}
                                                    </p>
                                                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{metricsData.revenue}</p>
                                                    <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">Based on visible {lifecycleTab === 'quotes' ? 'quotes' : 'orders'}</p>
                                                </div>
                                            </div>

                                            {/* Active Orders Card */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                        {lifecycleTab === 'quotes' ? 'Active Quotes' : lifecycleTab === 'acknowledgments' ? 'Pending Acks' : 'Active Orders'}
                                                    </p>
                                                    <ShoppingBagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metricsData.activeOrders}</p>
                                                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                                                        {lifecycleTab === 'quotes' ? 'Sent or Negotiating' : lifecycleTab === 'acknowledgments' ? 'Awaiting Confirmation' : 'In production or pending'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Completion Rate Card */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                                        {lifecycleTab === 'quotes' ? 'Win Rate' : lifecycleTab === 'acknowledgments' ? 'Conf. Rate' : 'Completion Rate'}
                                                    </p>
                                                    <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{metricsData.efficiency}%</p>
                                                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                                                        {lifecycleTab === 'quotes' ? 'Quotes approved' : lifecycleTab === 'acknowledgments' ? 'Acks confirmed' : 'Orders delivered successfully'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Project Count Card */}
                                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-2xl p-6 border border-orange-200 dark:border-orange-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Project Count</p>
                                                    <ClipboardDocumentListIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                                        {availableProjects.length > 0 && availableProjects[0] === 'All Projects' ? availableProjects.length - 1 : availableProjects.length}
                                                    </p>
                                                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">Active projects</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-[300px] w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-border shadow-sm">
                                            <h4 className="text-md font-medium text-foreground mb-4">Monthly Trends</h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={salesData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : viewMode === 'list' ? (
                                    /* List View */
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-muted/50 border-b border-border">
                                                    <tr>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{lifecycleTab === 'acknowledgments' ? 'Vendor' : 'Details'}</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{lifecycleTab === 'acknowledgments' ? 'PO & Location' : 'Project & Location'}</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{lifecycleTab === 'acknowledgments' ? 'Discrepancy' : 'Amount'}</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{lifecycleTab === 'quotes' ? 'Valid Until' : 'Date'}</th>
                                                        <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {filteredData.map((order: any) => (
                                                        <Fragment key={order.id}>
                                                            <tr
                                                                className="group hover:bg-muted/50 transition-colors cursor-pointer"
                                                                onClick={() => toggleExpand(order.id)}
                                                            >
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                                            {order.initials}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-foreground">{lifecycleTab === 'acknowledgments' ? order.vendor : order.customer}</div>
                                                                            <div className="text-xs text-muted-foreground">{order.id}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm text-foreground">{lifecycleTab === 'acknowledgments' ? order.relatedPo : order.project}</span>
                                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <MapPinIcon className="w-3 h-3" /> {order.location}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className={cn("font-semibold text-foreground", lifecycleTab === 'acknowledgments' && order.discrepancy !== 'None' ? 'text-red-500' : '')}>
                                                                        {lifecycleTab === 'acknowledgments' ? order.discrepancy : order.amount}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", order.statusColor)}>
                                                                        {order.status}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-sm text-muted-foreground">
                                                                    {lifecycleTab === 'quotes' ? (order.validUntil || order.date) : order.date}
                                                                </td>
                                                                <td className="p-4 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); onNavigateToDetail(lifecycleTab === 'quotes' ? 'quote-detail' : lifecycleTab === 'acknowledgments' ? 'ack-detail' : 'order-detail'); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                                        >
                                                                            <DocumentTextIcon className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50/50 transition-colors"
                                                                            title="Track Order"
                                                                        >
                                                                            <MapPinIcon className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                                                        >
                                                                            {expandedIds.has(order.id) ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {expandedIds.has(order.id) && (
                                                                <tr className="bg-muted/30">
                                                                    <td colSpan={6} className="p-4">
                                                                        <div className="grid grid-cols-3 gap-6 text-sm">
                                                                            <div>
                                                                                <p className="font-medium text-muted-foreground mb-1">Contact Details</p>
                                                                                <p className="text-foreground">Sarah Johnson</p>
                                                                                <p className="text-muted-foreground text-xs">sarah.j@example.com</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-muted-foreground mb-1">Items</p>
                                                                                <ul className="list-disc list-inside text-muted-foreground text-xs space-y-1">
                                                                                    <li>Office Chair Ergonomic x12</li>
                                                                                    <li>Standing Desk Motorized x5</li>
                                                                                </ul>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <button className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
                                                                                    View Full Order
                                                                                </button>
                                                                                <button className="px-3 py-1.5 border border-border text-foreground text-xs font-medium rounded-lg hover:bg-muted transition-colors">
                                                                                    Download Invoice
                                                                                </button>
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
                                    </div>
                                ) : (
                                    /* Pipeline View */
                                    <div className="flex gap-6 overflow-x-auto pb-4 scale-y-[-1] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200/50 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800/50 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-800">
                                        {(lifecycleTab === 'quotes' ? quoteStages : lifecycleTab === 'acknowledgments' ? ackStages : pipelineStages).map((stage) => {
                                            const stageOrders = filteredData.filter((o: any) => o.status === stage);
                                            return (
                                                <div key={stage} className="min-w-[320px] max-w-[320px] flex-shrink-0 flex flex-col h-full scale-y-[-1] pt-4">
                                                    <div className="flex items-center justify-between mb-4 px-2">
                                                        <h4 className="font-medium text-foreground flex items-center gap-2">
                                                            {stage}
                                                            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">{stageOrders.length}</span>
                                                        </h4>
                                                        <button className="text-muted-foreground hover:text-foreground">
                                                            <EllipsisHorizontalIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    <div className="bg-muted/30 rounded-2xl p-3 h-full min-h-[500px] border border-border/50 space-y-3">
                                                        {stageOrders.map(order => (
                                                            <div
                                                                key={order.id}
                                                                className={`group relative bg-white dark:bg-zinc-900 rounded-2xl border ${expandedIds.has(order.id) ? 'border-brand-400/50 ring-1 ring-brand-400/20 shadow-lg' : 'border-zinc-200 dark:border-white/10 shadow-sm hover:shadow-md'} transition-all duration-200 overflow-hidden flex flex-col`}
                                                            >
                                                                <div className="p-4">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white dark:ring-zinc-900">
                                                                                {order.initials}
                                                                            </div>
                                                                            <div className="space-y-0.5">
                                                                                <h4 className="text-sm font-semibold text-foreground transition-colors">
                                                                                    {lifecycleTab === 'acknowledgments' ? (order as any).vendor : (order as any).customer}
                                                                                </h4>
                                                                                <p className="text-[10px] text-muted-foreground font-mono">{order.id}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-muted-foreground">
                                                                                {lifecycleTab === 'acknowledgments' ? 'Discrepancy' : 'Amount'}
                                                                            </span>
                                                                            <span className={cn("font-semibold text-foreground", lifecycleTab === 'acknowledgments' && (order as any).discrepancy !== 'None' ? 'text-red-500' : '')}>
                                                                                {lifecycleTab === 'acknowledgments' ? (order as any).discrepancy : (order as any).amount}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center text-xs">
                                                                            <span className="text-muted-foreground">Date</span>
                                                                            <span className="text-foreground">{order.date}</span>
                                                                        </div>

                                                                        {/* Use a simple divider */}
                                                                        <div className="h-px bg-border w-full my-2" />

                                                                        {/* Inline Actions Row */}
                                                                        <div className="flex items-center justify-between">
                                                                            {/* Status Badge */}
                                                                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border shadow-sm",
                                                                                colorStyles[order.statusColor?.split('-')[1]?.replace('text', '').trim()] || "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                                                                            )}>
                                                                                {order.status}
                                                                            </span>

                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                                                                    className="text-xs font-bold text-zinc-800 bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-shadow shadow-sm"
                                                                                >
                                                                                    {expandedIds.has(order.id) ? 'Close' : 'Details'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); onNavigateToDetail(lifecycleTab === 'quotes' ? 'quote-detail' : lifecycleTab === 'acknowledgments' ? 'ack-detail' : 'order-detail'); }}
                                                                                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                                                                    title="View Full Details"
                                                                                >
                                                                                    <ArrowRightIcon className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Internal Accordion Content */}
                                                                {expandedIds.has(order.id) && (
                                                                    <div className="bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="p-5 space-y-5">
                                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{lifecycleTab === 'acknowledgments' ? 'PO Number' : 'Project'}</p>
                                                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">{lifecycleTab === 'acknowledgments' ? (order as any).relatedPo : (order as any).project}</p>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Location</p>
                                                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                                                                                        <MapPinIcon className="h-4 w-4 text-zinc-400" />
                                                                                        <span className="truncate">{order.location}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{lifecycleTab === 'quotes' ? 'Valid Until' : lifecycleTab === 'acknowledgments' ? 'Exp. Ship' : 'Date Placed'}</p>
                                                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 font-mono">{lifecycleTab === 'quotes' ? (order as any).validUntil : lifecycleTab === 'acknowledgments' ? (order as any).expShipDate : order.date}</p>
                                                                                </div>
                                                                                <div className="space-y-1.5">
                                                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Items</p>
                                                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">12 Units</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex flex-col gap-3 pt-2">
                                                                                <button className="w-full py-2.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm">
                                                                                    {lifecycleTab === 'quotes' ? 'View Quote Details' : lifecycleTab === 'acknowledgments' ? 'View PO Details' : 'View Full Order Details'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); setTrackingOrder(order); }}
                                                                                    className="w-full py-3 text-sm font-bold text-zinc-950 bg-brand-400 hover:bg-brand-300 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
                                                                                >
                                                                                    <MapPinIcon className="h-4 w-4" />
                                                                                    {lifecycleTab === 'quotes' ? 'Analyze Quote' : lifecycleTab === 'acknowledgments' ? 'Resolve Discrepancy' : 'Track Shipment'}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {stageOrders.length === 0 && (
                                                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground opacity-50 border-2 border-dashed border-border rounded-xl">
                                                                <span className="text-xs">No orders</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-lg font-brand font-semibold text-foreground mb-4">Revenue Trend</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', borderColor: 'var(--border)', color: 'var(--popover-foreground)' }}
                                        itemStyle={{ color: 'var(--popover-foreground)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="var(--chart-trend-line)"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: 'var(--chart-trend-dot-fill)', stroke: 'var(--chart-trend-dot-stroke)' }}
                                        activeDot={{ r: 6, stroke: 'var(--chart-trend-dot-stroke)', fill: 'var(--chart-trend-dot-fill)', strokeWidth: 2 }}
                                    />
                                    <Line type="monotone" dataKey="costs" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-lg font-brand font-semibold text-foreground mb-4">Inventory Breakdown</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inventoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--popover-foreground)' }} />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* Recent Orders - The Grid/List view handled here */}

            </div>

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
                                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all border border-zinc-200 dark:border-zinc-800">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-zinc-900 dark:text-white flex justify-between items-center mb-6"
                                    >
                                        <span>
                                            {lifecycleTab === 'quotes' ? 'Quote Analysis' :
                                                lifecycleTab === 'acknowledgments' ? 'Discrepancy Resolver' :
                                                    `Tracking Details - ${trackingOrder?.id}`}
                                        </span>
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

                                    {lifecycleTab === 'quotes' ? (
                                        /* Quote Details View */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider">Margin Analysis</h4>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                        <span className="text-sm text-muted-foreground">Total Cost</span>
                                                        <span className="font-mono text-foreground">$850,000</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                                        <span className="text-sm text-muted-foreground">List Price</span>
                                                        <span className="font-mono text-foreground">$1,200,000</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                                                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Net Margin</span>
                                                        <span className="font-bold text-green-700 dark:text-green-400">29.2%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col h-full bg-brand-50 dark:bg-zinc-800/80 p-5 rounded-xl border border-brand-100 dark:border-brand-500/30">
                                                <div className="flex items-center gap-2 mb-3 text-brand-700 dark:text-brand-300">
                                                    <SparklesIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                                    <span className="font-semibold text-sm">AI Pricing Insight</span>
                                                </div>
                                                <p className="text-sm text-brand-900/80 dark:text-zinc-300 leading-relaxed mb-4">
                                                    Based on recent wins with <strong className="text-brand-950 dark:text-white">Apex Tech</strong>, you could increase margin to <strong className="text-brand-950 dark:text-white">32%</strong> without impacting win probability.
                                                </p>
                                                <button className="mt-auto w-full py-2 bg-brand-600 hover:bg-brand-700 text-white dark:text-brand-950 dark:bg-brand-400 dark:hover:bg-brand-300 rounded-lg text-sm font-medium transition-colors">
                                                    Apply Suggested Pricing
                                                </button>
                                            </div>
                                        </div>
                                    ) : lifecycleTab === 'acknowledgments' ? (
                                        /* Ack Details View */
                                        <div className="space-y-6">
                                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 flex gap-3">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Price Discrepancy Detected</h4>
                                                    <p className="text-sm text-red-600/90 dark:text-red-400/90 mt-1">Vendor acknowledgement is <span className="font-bold">$500 higher</span> than the Purchase Order.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                                    <span className="block text-xs uppercase text-muted-foreground mb-1">Your PO</span>
                                                    <div className="font-semibold text-lg">$12,500.00</div>
                                                    <div className="text-xs text-muted-foreground mt-2">Unit Price: $250.00</div>
                                                </div>
                                                <div className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5 rounded-lg">
                                                    <span className="block text-xs uppercase text-red-600 dark:text-red-400 mb-1">Vendor Ack</span>
                                                    <div className="font-semibold text-lg text-red-700 dark:text-red-400">$13,000.00</div>
                                                    <div className="text-xs text-red-600/80 mt-2">Unit Price: $260.00</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-end pt-4 border-t border-border">
                                                <button className="px-4 py-2 text-sm font-medium text-foreground bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700">
                                                    Contact Rep
                                                </button>
                                                <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
                                                    Update PO to Match
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
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
                                                        className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                                                        onClick={() => console.log('Contacting support...')}
                                                    >
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                        Contact Support
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div >
    )
}
