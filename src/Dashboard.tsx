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
    Bars3Icon,
    CpuChipIcon,
    CheckBadgeIcon,
    ClipboardDocumentCheckIcon
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
import GenUIContainer from './components/gen-ui/GenUIContainer'
import SmartQuoteHub from './components/widgets/SmartQuoteHub';
import QuoteGenerationFlow from './components/QuoteGenerationFlow';
import { useGenUI } from './context/GenUIContext'
import DashboardMetricsGrid from './components/DashboardMetricsGrid';
import { Card } from 'strata-design-system';
import { useDemo } from './context/DemoContext'
import AgentPipelineStrip from './components/simulations/AgentPipelineStrip'
import DemoAvatar, { AIAgentAvatar } from './components/simulations/DemoAvatars'
import MobileDeviceFrame from './components/simulations/MobileDeviceFrame'
import ConfidenceScoreBadge from './components/widgets/ConfidenceScoreBadge'

// Urgent Actions Data (Dealer Persona)
const urgentActions = [
    {
        id: 4,
        title: 'Acknowledgement Received - 2 Exceptions Require Review',
        description: 'Smart Acknowledgement Engine detected anomalies vs PO #ORD-2055',
        time: 'Under 10 mins',
        type: 'critical',
        action: 'Review Exceptions',
        icon: SparklesIcon
    },
    {
        id: 1,
        title: 'Quote #QT-2941 Expiring',
        description: 'Quote for "Office Images" expires in 2 hours.',
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
    mac: { label: 'Service Center', value: '8 Pending', sub1: '12 Scheduled', sub2: '45 Completed', icon: <TruckIcon className="w-5 h-5" />, color: 'orange', change: '-2%', positive: false },
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
    const { currentStep, nextStep, isDemoActive } = useDemo()

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

    // Demo Flow 1 Types
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedClient, setSelectedClient] = useState('All Clients')
    const [selectedProject, setSelectedProject] = useState('All Projects')

    const [activeTab, setActiveTab] = useState<'metrics' | 'active' | 'completed' | 'all'>('active')
    const [mainTab, setMainTab] = useState<'follow_up' | 'your_tools' | 'metrics'>('follow_up')
    const [expandedActionId, setExpandedActionId] = useState<number | null>(null)
    const [highlightedAction, setHighlightedAction] = useState<number | null>(null)
    const [isCustomizeHighlighted, setIsCustomizeHighlighted] = useState(false)

    // Listen for Demo Guide Highlights
    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'ack-urgent-action') {
                // Assuming 'follow_up' tab is already active default, set highlight to ID 4 (ACK Received)
                setMainTab('follow_up');
                setHighlightedAction(4);
                setTimeout(() => setHighlightedAction(null), 4000);
            } else if (e.detail === 'dashboard-customize-tools') {
                setMainTab('your_tools');
                setIsCustomizeHighlighted(true);
                setTimeout(() => setIsCustomizeHighlighted(false), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    // Step 1.7 — Manager Approval (Sara's dashboard view)
    const [managerApproved17, setManagerApproved17] = useState(false)
    const [notifArrived17, setNotifArrived17] = useState(false)
    const [contentVisible17, setContentVisible17] = useState(false)
    const [lineItemPage17, setLineItemPage17] = useState(0)
    const [requestChangesOpen17, setRequestChangesOpen17] = useState(false)
    useEffect(() => {
        if (currentStep.id !== '1.7') { setManagerApproved17(false); setNotifArrived17(false); setContentVisible17(false); setLineItemPage17(0); setRequestChangesOpen17(false); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setNotifArrived17(true), 800));
        t.push(setTimeout(() => setContentVisible17(true), 2000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);

    // Step 1.6 — Quote Approval Chain (2 approvers: System Policy auto → David Park → auto-advance)
    const [approvalStates16, setApprovalStates16] = useState<('pending' | 'approved')[]>(['pending', 'pending'])
    useEffect(() => {
        if (currentStep.id !== '1.6') {
            setApprovalStates16(['pending', 'pending']);
            return;
        }
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'pending']), 5000));
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'approved']), 10000));
        timeouts.push(setTimeout(() => nextStep(), 14000));
        return () => timeouts.forEach(clearTimeout);
    }, [currentStep.id]);
    const approvedCount16 = approvalStates16.filter(s => s === 'approved').length;

    // Step 1.8 — PO Generation + Order Approval Chain (fully automated)
    const [phase18, setPhase18] = useState<'showing-approvals' | 'po-generating' | 'po-complete' | 'order-chain' | 'order-complete' | 'done'>('showing-approvals')
    const [poGenPhase18, setPoGenPhase18] = useState<'building' | 'mapping' | 'validating' | 'complete'>('building')
    const [orderApprovalStates18, setOrderApprovalStates18] = useState<('pending' | 'approved')[]>(['pending', 'pending', 'pending'])
    useEffect(() => {
        if (currentStep.id !== '1.8') {
            setPhase18('showing-approvals');
            setPoGenPhase18('building');
            setOrderApprovalStates18(['pending', 'pending', 'pending']);
            return;
        }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setPhase18('po-generating'), 2000));
        t.push(setTimeout(() => setPoGenPhase18('mapping'), 4000));
        t.push(setTimeout(() => setPoGenPhase18('validating'), 6000));
        t.push(setTimeout(() => { setPoGenPhase18('complete'); setPhase18('po-complete'); }, 8000));
        t.push(setTimeout(() => setPhase18('order-chain'), 10000));
        t.push(setTimeout(() => setOrderApprovalStates18(['approved', 'pending', 'pending']), 15000));
        t.push(setTimeout(() => setOrderApprovalStates18(['approved', 'approved', 'pending']), 20000));
        t.push(setTimeout(() => setOrderApprovalStates18(['approved', 'approved', 'approved']), 25000));
        t.push(setTimeout(() => setPhase18('order-complete'), 29000));
        t.push(setTimeout(() => { setPhase18('done'); nextStep(); }, 37000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);
    const orderApprovedCount18 = orderApprovalStates18.filter(s => s === 'approved').length;

    // Step 1.10 — Smart Notifications (Action Center shows the notification)

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
            {currentStep.id !== '1.9' && <GenUIContainer />}

            {/* ===== Step 1.9: Dealer Mobile Approval — Fullscreen overlay ===== */}
            {currentStep.id === '1.9' && (
                <div data-demo-target="mobile-dealer-approval" className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950 animate-in fade-in duration-500">
                    {/* Mobile Device Frame — centered, nothing else */}
                    <MobileDeviceFrame>
                        {/* Mobile Navbar */}
                        <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-[10px] font-black text-primary-foreground">S</span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-none">End User</p>
                                    <p className="text-xs font-bold text-foreground leading-tight">Diego Sabatini</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <BellIcon className="w-5 h-5 text-foreground" />
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">1</div>
                                </div>
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face"
                                    alt="Carlos Rivera"
                                    className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                                />
                            </div>
                        </div>

                        {/* Push Notification Banner */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-in slide-in-from-top-2 duration-500">
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg shrink-0">
                                    <BellIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-blue-500 font-medium">Just now</p>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Purchase Order Approved</p>
                                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">PO-1029 for Apex Furniture has been fully approved and transmitted.</p>
                                </div>
                            </div>
                        </div>

                        {/* PO Summary Card */}
                        <div className="mx-3 mt-3 p-4 rounded-xl bg-card border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Purchase Order</p>
                                    <p className="text-base font-bold text-foreground">PO-1029</p>
                                </div>
                                <span className="px-2 py-0.5 bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full">Approved</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Supplier', value: 'Apex Furniture' },
                                    { label: 'Total Value', value: '$134,250' },
                                    { label: 'Line Items', value: '50 SKUs' },
                                    { label: 'Delivery Est.', value: 'Mar 15, 2026' },
                                ].map(item => (
                                    <div key={item.label} className="p-2 rounded-lg bg-muted/50">
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                        <p className="text-xs font-bold text-foreground">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Mini Approval Chain */}
                            <div className="pt-2 border-t border-border">
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">Approval Chain — Complete</p>
                                <div className="flex items-center gap-3">
                                    {[
                                        { name: 'Operations Manager', status: 'Approved' },
                                        { name: 'Finance System', status: 'Approved' },
                                        { name: 'Compliance Engine', status: 'Approved' },
                                    ].map((approver, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div className="relative">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/15 flex items-center justify-center">
                                                    <CpuChipIcon className="w-3 h-3 text-indigo-500" />
                                                </div>
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 text-white flex items-center justify-center ring-1 ring-white dark:ring-zinc-900">
                                                    <CheckIcon className="w-1.5 h-1.5" />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-muted-foreground font-medium">{approver.name.split(' ')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quote Reference */}
                        <div className="mx-3 mt-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-[10px] font-medium text-foreground">From Quote QT-1025</p>
                                    <p className="text-[9px] text-muted-foreground">Auto-generated by POBuilderAgent</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mx-3 mt-4 mb-4">
                            <button
                                onClick={() => nextStep()}
                                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]"
                            >
                                Approve
                            </button>
                        </div>
                    </MobileDeviceFrame>
                </div>
            )}

            {/* Main Content — hidden during step 1.9 (fullscreen mobile overlay) */}
            <div className={`pt-24 px-4 max-w-7xl mx-auto space-y-6 ${currentStep.id === '1.9' ? 'hidden' : ''}`}>
                {/* Page Title & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-baseline gap-4">
                            <h1 className="text-3xl font-brand font-bold tracking-tight text-foreground">
                                {currentTenant} Overview
                            </h1>
                            {false && (
                            <button
                                onClick={() => onNavigate('tenant-settings')}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                                View Full Profile
                            </button>
                            )}
                        </div>
                    </div>


                </div>

                {/* ===== Step 1.6: Quote Approval Chain ===== */}
                {currentStep.id === '1.6' && (
                    <div data-demo-target="approval-chain-progress" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Quote Approval Chain</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Quote QT-1025 ($134,250) triggered policy-based approval workflow</p>
                                    </div>
                                </div>
                                <ConfidenceScoreBadge score={94} label="Policy Match" />
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                                    <AIAgentAvatar className="mt-0.5" />
                                    <div className="text-xs text-indigo-700 dark:text-indigo-300">
                                        <span className="font-bold">ApprovalOrchestratorAgent:</span> Routing to 2-level approval chain — automated compliance check first, then manager sign-off for quote value bracket ($100k-$250k).
                                    </div>
                                </div>

                                <div className="space-y-0">
                                    {[
                                        { name: 'System Policy Engine', role: 'Automated Compliance Check', reason: 'Pricing + discount + policy validation', level: 'Level 1' },
                                        { name: 'David Park', role: 'Regional Sales Manager', reason: 'Quote value > $100k', level: 'Level 2' },
                                    ].map((approver, i) => (
                                        <div key={i}>
                                            {i > 0 && <div className="ml-5 h-6 border-l-2 border-dashed border-border" />}
                                            <div className={cn(
                                                "flex items-center gap-4 p-3 rounded-xl transition-all duration-500",
                                                approvalStates16[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === approvedCount16
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            )}>
                                                <div className="relative shrink-0">
                                                    <DemoAvatar name={approver.name} size="lg" />
                                                    {approvalStates16[i] === 'approved' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-zinc-900"><CheckIcon className="w-2.5 h-2.5" /></div>
                                                    )}
                                                    {approvalStates16[i] !== 'approved' && i === approvedCount16 && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-zinc-900"><ArrowPathIcon className="w-2.5 h-2.5 animate-spin" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-foreground">{approver.name}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{approver.level}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">{approver.role}</p>
                                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Trigger: {approver.reason}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {approvalStates16[i] === 'approved' ? (
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Auto-Approved</span>
                                                    ) : i === approvedCount16 ? (
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Reviewing...</span>
                                                    ) : (
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Pending Approval</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground">Approval Progress</span>
                                        <span className="text-[10px] font-bold text-foreground">{approvedCount16}/2</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-700", approvedCount16 === 2 ? 'bg-emerald-500' : 'bg-blue-500')} style={{ width: `${(approvedCount16 / 2) * 100}%` }} />
                                    </div>
                                </div>

                                {approvedCount16 === 2 ? (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2 animate-in fade-in duration-500">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">All approvals complete — advancing to PO generation</span>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center gap-2">
                                        <ClockIcon className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span className="text-[10px] text-amber-700 dark:text-amber-300">
                                            {approvedCount16 === 0 ? 'System Policy Engine running compliance check...' : 'Awaiting manager approval — notification sent to David Park'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== Step 1.8: PO Generation & Order Approval ===== */}
                {currentStep.id === '1.8' && (
                    <div data-demo-target="po-order-approval" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Context */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">POBuilderAgent:</span> Auto-generating purchase order PO-1029 from approved quote QT-1025, then routing to automated order approval chain.
                            </div>
                        </div>

                        {/* Quote Approval Complete */}
                        <div className="bg-card border border-emerald-200 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Quote Approval Chain — Complete</p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">QT-1025 approved by System Policy Engine + David Park</p>
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-6">
                                {[
                                    { name: 'System Policy Engine', status: 'Auto-Approved' },
                                    { name: 'David Park', status: 'Approved' },
                                ].map((a, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="relative">
                                            <DemoAvatar name={a.name} size="sm" />
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-1 ring-white dark:ring-zinc-900"><CheckIcon className="w-2 h-2" /></div>
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-medium text-foreground">{a.name}</span>
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-1.5">· {a.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PO Generation (compact) */}
                        {['po-generating', 'po-complete', 'order-chain', 'order-complete', 'done'].includes(phase18) && (
                            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                                        <DocumentPlusIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-foreground">PO Generation</h3>
                                        <p className="text-[10px] text-muted-foreground">POBuilderAgent generating purchase order from QT-1025</p>
                                    </div>
                                    {poGenPhase18 === 'complete' && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5" /> PO-1029</span>}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Extracting quote', phase: 'building' },
                                        { label: 'Mapping to PO format', phase: 'mapping' },
                                        { label: 'Validating catalog', phase: 'validating' },
                                        { label: 'PO finalized', phase: 'complete' },
                                    ].map((step) => {
                                        const phases = ['building', 'mapping', 'validating', 'complete'];
                                        const stepIdx = phases.indexOf(step.phase);
                                        const currentIdx = phases.indexOf(poGenPhase18);
                                        const isDone = currentIdx > stepIdx || (currentIdx === stepIdx && poGenPhase18 === 'complete' && step.phase === 'complete');
                                        const isActive = currentIdx === stepIdx && poGenPhase18 !== 'complete';
                                        return (
                                            <div key={step.phase} className={cn("p-2.5 rounded-lg border text-center transition-all", isDone ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5' : isActive ? 'border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 animate-pulse' : 'border-border bg-muted/20')}>
                                                <div className={cn("w-5 h-5 rounded-full mx-auto mb-1 flex items-center justify-center", isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground')}>
                                                    {isDone ? <CheckIcon className="w-3 h-3" /> : isActive ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <ClockIcon className="w-3 h-3" />}
                                                </div>
                                                <p className={cn("text-[9px] font-medium", isDone ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')}>{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Order Approval Chain (automated) */}
                        {['order-chain', 'order-complete', 'done'].includes(phase18) && (
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                                            <ClipboardDocumentCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Order Approval Chain</h3>
                                            <p className="text-[10px] text-muted-foreground">Automated approval for PO-1029 ($134,256)</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-foreground">{orderApprovedCount18}/3</span>
                                </div>
                                <div className="p-5 space-y-0">
                                    {[
                                        { name: 'Operations Manager', role: 'Automated Order Validation', level: 'Level 1' },
                                        { name: 'Finance System', role: 'Budget & Payment Terms', level: 'Level 2' },
                                        { name: 'Compliance Engine', role: 'Regulatory Check', level: 'Level 3' },
                                    ].map((approver, i) => (
                                        <div key={i}>
                                            {i > 0 && <div className="ml-5 h-4 border-l-2 border-dashed border-border" />}
                                            <div className={cn(
                                                "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500",
                                                orderApprovalStates18[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === orderApprovedCount18
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            )}>
                                                <div className="relative shrink-0">
                                                    <DemoAvatar name={approver.name} size="md" />
                                                    {orderApprovalStates18[i] === 'approved' && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-1 ring-white dark:ring-zinc-900"><CheckIcon className="w-2 h-2" /></div>
                                                    )}
                                                    {orderApprovalStates18[i] !== 'approved' && i === orderApprovedCount18 && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-1 ring-white dark:ring-zinc-900"><ArrowPathIcon className="w-2 h-2 animate-spin" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[11px] font-bold text-foreground">{approver.name}</span>
                                                    <span className="text-[10px] text-muted-foreground ml-1.5">· {approver.role}</span>
                                                </div>
                                                <span className={cn("text-[10px] font-bold", orderApprovalStates18[i] === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : i === orderApprovedCount18 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')}>
                                                    {orderApprovalStates18[i] === 'approved' ? 'Approved' : i === orderApprovedCount18 ? 'Reviewing...' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {(phase18 === 'order-complete' || phase18 === 'done') && (
                                    <div className="px-5 pb-4">
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Order PO-1029 Fully Approved</p>
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">All 3 approval levels complete — order entering production pipeline</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Step 1.7: Manager Approval (Sara's Dashboard) ===== */}
                {currentStep.id === '1.7' && (
                    <div data-demo-target="manager-approval-view" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Notification arrival toast */}
                        {notifArrived17 && (
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-300 dark:border-blue-500/30 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-blue-500 text-white shrink-0 animate-bounce">
                                        <BellIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Quote Ready for Review</p>
                                            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">NEW</span>
                                        </div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">Quote <span className="font-bold">QT-1025</span> for your RFQ — <span className="font-bold">$134,250</span> · 5 SKUs</p>
                                        <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-1">AI-generated from your RFQ submission · Ready for your approval</p>
                                    </div>
                                    <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium shrink-0">Just now</span>
                                </div>
                            </div>
                        )}

                        {/* Main quote review card — appears after notification */}
                        {contentVisible17 && (
                            <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-green-50/50 dark:bg-green-500/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center text-sm font-bold">AF</div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">Quote Review — Apex Furniture</h3>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">New HQ RFQ · Austin, TX · Dealer Approval Required</p>
                                        </div>
                                    </div>
                                    <ConfidenceScoreBadge score={94} label="AI Accuracy" />
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Quote summary */}
                                    <div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                            {[
                                                { label: 'Quote ID', value: 'QT-1025' },
                                                { label: 'Total Value', value: '$687,430' },
                                                { label: 'Line Items', value: '50 SKUs' },
                                                { label: 'Delivery Est.', value: 'Mar 15, 2026' },
                                            ].map(item => (
                                                <div key={item.label} className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</p>
                                                    <p className="text-sm font-bold text-foreground mt-1">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                                                <p className="text-[10px] text-muted-foreground">Project</p>
                                                <p className="text-xs font-bold text-foreground">New HQ RFQ — Austin, TX</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                                                <p className="text-[10px] text-muted-foreground">Payment Terms</p>
                                                <p className="text-xs font-bold text-foreground">Net 30 (2% early pay)</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                                                <p className="text-[10px] text-muted-foreground">Discount Applied</p>
                                                <p className="text-xs font-bold text-foreground">4% combined ($5,370)</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line item breakdown — 50 SKUs with pagination */}
                                    {(() => {
                                        const allLineItems = [
                                            { sku: 'ERG-5100', name: 'Ergonomic Task Chair', qty: 125, subtotal: '$43,750' },
                                            { sku: 'DSK-2200', name: 'Height-Adjustable Desk', qty: 80, subtotal: '$46,400' },
                                            { sku: 'ARM-4D10', name: '4D Adjustable Armrest', qty: 125, subtotal: '$2,250' },
                                            { sku: 'MON-3400', name: 'Monitor Arm Dual', qty: 60, subtotal: '$8,700' },
                                            { sku: 'CAB-1100', name: 'Mobile Pedestal Cabinet', qty: 40, subtotal: '$8,800' },
                                            { sku: 'CHP-6200', name: 'Conference Chair Pro', qty: 48, subtotal: '$19,200' },
                                            { sku: 'TBL-3300', name: 'Conference Table 8ft', qty: 12, subtotal: '$14,400' },
                                            { sku: 'FIL-2100', name: 'Lateral File Cabinet 4-Drawer', qty: 30, subtotal: '$8,100' },
                                            { sku: 'WBD-1500', name: 'Whiteboard Mobile 72"', qty: 15, subtotal: '$6,750' },
                                            { sku: 'LMP-0800', name: 'LED Desk Lamp Adjustable', qty: 200, subtotal: '$9,800' },
                                            { sku: 'PNL-4400', name: 'Acoustic Privacy Panel', qty: 60, subtotal: '$12,600' },
                                            { sku: 'SHF-7700', name: 'Bookshelf Unit Modular', qty: 24, subtotal: '$7,200' },
                                            { sku: 'STL-9900', name: 'Standing Mat Anti-Fatigue', qty: 80, subtotal: '$3,200' },
                                            { sku: 'KBT-0100', name: 'Keyboard Tray Sliding', qty: 80, subtotal: '$4,800' },
                                            { sku: 'PWR-5500', name: 'Power Hub Desktop 6-Port', qty: 200, subtotal: '$11,800' },
                                            { sku: 'HDR-6600', name: 'Cable Management Tray', qty: 200, subtotal: '$5,000' },
                                            { sku: 'SCR-2100', name: 'Monitor Privacy Screen 27"', qty: 80, subtotal: '$7,920' },
                                            { sku: 'FTP-3200', name: 'Footrest Ergonomic Tilt', qty: 80, subtotal: '$4,000' },
                                            { sku: 'DRW-1100', name: 'Desk Drawer Organizer', qty: 125, subtotal: '$3,125' },
                                            { sku: 'WPC-8800', name: 'Wireless Charging Pad', qty: 200, subtotal: '$7,800' },
                                            { sku: 'PHN-4100', name: 'Phone Stand Adjustable', qty: 200, subtotal: '$3,400' },
                                            { sku: 'CPH-5200', name: 'CPU Holder Under-Desk', qty: 80, subtotal: '$4,720' },
                                            { sku: 'DSK-2201', name: 'L-Shaped Corner Desk', qty: 20, subtotal: '$15,800' },
                                            { sku: 'CHP-6300', name: 'Guest Chair Stacking', qty: 60, subtotal: '$8,400' },
                                            { sku: 'RCK-9100', name: 'Coat Rack Freestanding', qty: 20, subtotal: '$2,600' },
                                            { sku: 'TBL-3301', name: 'Round Meeting Table 48"', qty: 8, subtotal: '$5,600' },
                                            { sku: 'LCK-7100', name: 'Locker Unit Personal 4-Door', qty: 10, subtotal: '$7,500' },
                                            { sku: 'SOF-8200', name: 'Lounge Sofa 2-Seat', qty: 6, subtotal: '$10,800' },
                                            { sku: 'OTM-8300', name: 'Ottoman Round Fabric', qty: 12, subtotal: '$3,600' },
                                            { sku: 'PLT-0200', name: 'Indoor Planter Large', qty: 20, subtotal: '$3,400' },
                                            { sku: 'BIN-1300', name: 'Recycling Bin Triple Sort', qty: 30, subtotal: '$4,350' },
                                            { sku: 'SGN-2400', name: 'Wayfinding Sign Set', qty: 5, subtotal: '$2,250' },
                                            { sku: 'CRT-3500', name: 'AV Cart Mobile', qty: 4, subtotal: '$3,200' },
                                            { sku: 'PRJ-4600', name: 'Projector Ceiling Mount', qty: 8, subtotal: '$2,400' },
                                            { sku: 'SPK-5700', name: 'Conference Speaker System', qty: 8, subtotal: '$6,400' },
                                            { sku: 'CAM-6800', name: 'Video Conference Camera', qty: 8, subtotal: '$7,200' },
                                            { sku: 'MIC-7900', name: 'Ceiling Microphone Array', qty: 8, subtotal: '$4,800' },
                                            { sku: 'DSP-8000', name: 'Digital Display 55" Wall', qty: 6, subtotal: '$10,200' },
                                            { sku: 'KSK-9200', name: 'Kiosk Stand Interactive', qty: 2, subtotal: '$5,400' },
                                            { sku: 'UMB-0300', name: 'Umbrella Stand Entry', qty: 4, subtotal: '$480' },
                                            { sku: 'MAT-1400', name: 'Entry Mat Commercial', qty: 6, subtotal: '$900' },
                                            { sku: 'CLK-2500', name: 'Wall Clock Analog 14"', qty: 20, subtotal: '$1,400' },
                                            { sku: 'FRM-3600', name: 'Art Frame 24×36"', qty: 20, subtotal: '$2,000' },
                                            { sku: 'CUR-4700', name: 'Window Shade Motorized', qty: 40, subtotal: '$18,000' },
                                            { sku: 'RUG-5800', name: 'Area Rug 8×10 Commercial', qty: 10, subtotal: '$8,500' },
                                            { sku: 'TRH-6900', name: 'Trash Can Sensor Lid', qty: 30, subtotal: '$4,050' },
                                            { sku: 'SAN-7000', name: 'Hand Sanitizer Station', qty: 10, subtotal: '$2,500' },
                                            { sku: 'FAN-8100', name: 'Desk Fan USB Quiet', qty: 80, subtotal: '$2,400' },
                                            { sku: 'HTR-9300', name: 'Space Heater Under-Desk', qty: 40, subtotal: '$3,600' },
                                            { sku: 'AIR-0400', name: 'Air Purifier HEPA Room', qty: 12, subtotal: '$5,880' },
                                        ];
                                        const perPage = 10;
                                        const totalPages = Math.ceil(allLineItems.length / perPage);
                                        const pageItems = allLineItems.slice(lineItemPage17 * perPage, (lineItemPage17 + 1) * perPage);
                                        const startIdx = lineItemPage17 * perPage + 1;
                                        const endIdx = Math.min((lineItemPage17 + 1) * perPage, allLineItems.length);

                                        return (
                                            <div className="rounded-xl border border-border overflow-hidden">
                                                <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line Item Summary — 50 SKUs</p>
                                                    <p className="text-[10px] text-muted-foreground">Showing {startIdx}–{endIdx} of {allLineItems.length}</p>
                                                </div>
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="border-b border-border/50 bg-muted/20">
                                                            <th className="px-3 py-1.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-20">SKU</th>
                                                            <th className="px-3 py-1.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                                                            <th className="px-3 py-1.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-16">Qty</th>
                                                            <th className="px-3 py-1.5 text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-24">Subtotal</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {pageItems.map(ln => (
                                                            <tr key={ln.sku} className="hover:bg-muted/30 transition-colors">
                                                                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{ln.sku}</td>
                                                                <td className="px-3 py-2 text-foreground">{ln.name}</td>
                                                                <td className="px-3 py-2 text-center text-muted-foreground">×{ln.qty}</td>
                                                                <td className="px-3 py-2 text-right font-bold text-foreground">{ln.subtotal}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {/* Pagination */}
                                                <div className="px-3 py-2 bg-muted/30 border-t border-border flex items-center justify-between">
                                                    <p className="text-[10px] text-muted-foreground">Page {lineItemPage17 + 1} of {totalPages}</p>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setLineItemPage17(p => Math.max(0, p - 1))}
                                                            disabled={lineItemPage17 === 0}
                                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                        >
                                                            <ChevronLeftIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </button>
                                                        {Array.from({ length: totalPages }, (_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setLineItemPage17(i)}
                                                                className={cn(
                                                                    'w-5 h-5 rounded text-[10px] font-bold transition-colors',
                                                                    i === lineItemPage17
                                                                        ? 'bg-primary text-primary-foreground'
                                                                        : 'text-muted-foreground hover:bg-muted'
                                                                )}
                                                            >
                                                                {i + 1}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => setLineItemPage17(p => Math.min(totalPages - 1, p + 1))}
                                                            disabled={lineItemPage17 === totalPages - 1}
                                                            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                                                        >
                                                            <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* AI Summary for dealer */}
                                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                                        <AIAgentAvatar className="mt-0.5" />
                                        <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                                            <p><span className="font-bold">AI Summary:</span> Quote generated from your RFQ email + attachments. All 50 SKUs matched to catalog across 8 product categories. Pricing verified. Early payment discount (2%) + volume discount (2%) applied automatically.</p>
                                            <p>Estimated savings vs. list price: <span className="font-bold text-green-600 dark:text-green-400">$27,497 (4%)</span></p>
                                        </div>
                                    </div>

                                    {/* What was resolved */}
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mb-2">Automatically Resolved</p>
                                        <div className="space-y-1">
                                            {[
                                                'Freight calculated: $12,850 (multi-zone LTL to Austin, TX — 50 SKUs)',
                                                'All 50 quantities confirmed from PDF spec + CSV cross-reference',
                                                'Armrest upgraded: 4D Adjustable (faster delivery, +$750)',
                                                '8 vendor substitutions applied (equivalent or better specs)',
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            onClick={() => { setManagerApproved17(true); setTimeout(() => nextStep(), 1000); }}
                                            disabled={managerApproved17 || requestChangesOpen17}
                                            className={cn(
                                                'px-6 py-3 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2',
                                                managerApproved17 ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] disabled:opacity-50'
                                            )}
                                        >
                                            {managerApproved17 ? <><CheckIcon className="w-4 h-4" /> Quote Approved</> : <><CheckBadgeIcon className="w-4 h-4" /> Approve Quote</>}
                                        </button>
                                        <button
                                            onClick={() => setRequestChangesOpen17(!requestChangesOpen17)}
                                            disabled={managerApproved17}
                                            className={cn(
                                                'px-5 py-3 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 border',
                                                requestChangesOpen17
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'bg-card text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 disabled:opacity-50'
                                            )}
                                        >
                                            <PencilSquareIcon className="w-4 h-4" /> Request Changes
                                        </button>
                                        {managerApproved17 && (
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">Generating PO...</span>
                                        )}
                                    </div>

                                    {/* Request Changes panel */}
                                    {requestChangesOpen17 && (
                                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Request Changes to Expert</p>
                                            </div>
                                            <p className="text-[11px] text-amber-600 dark:text-amber-400">Describe any inconsistencies found in the 50 line items. The quote will be sent back to the Expert for revision.</p>
                                            <textarea
                                                placeholder="e.g. Line items 12-15 show incorrect unit pricing for Acoustic Panels. Also, SKU-PLT-0200 quantity should be 30 not 20..."
                                                className="w-full h-20 px-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-500/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setRequestChangesOpen17(false)}
                                                    className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5"
                                                >
                                                    <EnvelopeIcon className="w-3.5 h-3.5" /> Send to Expert
                                                </button>
                                                <button
                                                    onClick={() => setRequestChangesOpen17(false)}
                                                    className="px-4 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Step 2.6: Smart Notifications (Action Center opens in Navbar) ===== */}
                {currentStep.id === '2.6' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">NotificationAgent:</span> Generated 4 persona-specific notifications from 8-agent Acknowledgement pipeline. Dealer receives full lifecycle summary. Expert receives only actionable items — reducing noise by 60%.
                            </div>
                        </div>

                        {/* Completion Summary */}
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="text-sm font-bold text-green-700 dark:text-green-400">Flow 2 Complete — Acknowledgement Processing</h3>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-500 ml-7">2 Acknowledgements processed for Premier Underground Design. HAT: 5 lines confirmed (AI vendor rule). AIS: 50 lines, 3 exceptions resolved, sent to client.</p>
                        </div>
                    </div>
                )}

                {/* Step 1.9 renders as fullscreen overlay — see portal below GenUIContainer */}

                {/* ===== Step 1.10: Smart Notifications (Action Center opens in Navbar) ===== */}
                {currentStep.id === '1.10' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                            <AIAgentAvatar className="mt-0.5" />
                            <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                                <span className="font-bold">NotificationAgent:</span> PO-1029 notification delivered to Dealer portal. Click "View PO" in Action Center to continue to pipeline.
                            </div>
                            <ConfidenceScoreBadge score={97} label="Relevance" />
                        </div>

                        {/* Completion Summary */}
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 space-y-3 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-bold text-green-700 dark:text-green-300">Flow 1 Complete — RFQ to PO Processing</span>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Time', value: '4m 12s' },
                                    { label: 'Agents Used', value: '8/8' },
                                    { label: 'Human Touchpoints', value: '2' },
                                    { label: 'Auto-Resolved', value: '94%' },
                                ].map(stat => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-[10px] text-green-600 dark:text-green-400">{stat.label}</p>
                                        <p className="text-sm font-bold text-green-700 dark:text-green-300">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* KPI Cards / Executive Summary — hidden for demo build */}
                {false && (showMetrics ? (
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
                )}

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
                                        {urgentActions.filter(action => action.id !== 4 || currentStep.id === '2.1').map((action) => (
                                            <div key={action.id} className={`group border rounded-xl hover:border-zinc-400 transition-all duration-700 bg-zinc-50/50 dark:bg-zinc-800/50 ${(highlightedAction === action.id || (action.id === 4 && currentStep.id === '2.1'))
                                                ? 'ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse border-brand-500'
                                                : 'border-border'
                                                }`}>
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
                                                            onClick={() => {
                                                                if (action.id === 4) {
                                                                    nextStep()
                                                                } else {
                                                                    handleGenUIAction(`${action.action} ${action.title}`)
                                                                }
                                                            }}
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
                                                                    <AIAgentAvatar className="mt-0.5" />
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
                                                                                // Original: handleGenUIAction(`Resolve ${item.title} for ${item.related}`);
                                                                                setDemoPhase('ORDERED');
                                                                                setShowConfetti(true);
                                                                                // Simulate Order Creation Backend & Navigate
                                                                                localStorage.setItem('demo_flow_complete', 'true');
                                                                                localStorage.setItem('demo_view_order_id', 'ORD-7829');

                                                                                // Check if onNavigate exists before calling
                                                                                if (onNavigate) {
                                                                                    setTimeout(() => {
                                                                                        onNavigate('transactions');
                                                                                    }, 2500);
                                                                                }
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
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all",
                                        isCustomizeHighlighted && "ring-2 ring-purple-500 animate-pulse relative z-50"
                                    )}
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
                                                    <div className="xl:col-span-2 min-h-[500px]">
                                                        <QuoteGenerationFlow onNavigate={onNavigate} />
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


