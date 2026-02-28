import { Menu, MenuButton, MenuItem, MenuItems, Dialog, DialogPanel, Transition, TransitionChild, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, TruckIcon,
    ArrowRightOnRectangleIcon, MagnifyingGlassIcon, BellIcon, CalendarIcon,
    CurrencyDollarIcon, ChartBarIcon, ArrowTrendingUpIcon, ExclamationCircleIcon,
    PlusIcon, DocumentDuplicateIcon, DocumentTextIcon, EnvelopeIcon, Squares2X2Icon,
    EllipsisHorizontalIcon, ListBulletIcon, SunIcon, MoonIcon,
    ChevronDownIcon, ChevronRightIcon, ChevronUpIcon, EyeIcon, PencilIcon, TrashIcon,
    CheckIcon, MapPinIcon, UserIcon, ClockIcon, ShoppingBagIcon, ExclamationTriangleIcon, PencilSquareIcon, CheckCircleIcon,
    ShoppingCartIcon, ClipboardDocumentCheckIcon, WrenchScrewdriverIcon, ChevronLeftIcon, CloudArrowUpIcon, DocumentPlusIcon,
    FunnelIcon, ArrowRightIcon, SparklesIcon, CheckBadgeIcon, CommandLineIcon, XMarkIcon, ArrowsPointingOutIcon, ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useState, useMemo, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

import { useTheme } from 'strata-design-system'
import { useTenant } from '../../TenantContext'
import CreateOrderModal from '../CreateOrderModal'
import SmartQuoteHub from '../widgets/SmartQuoteHub'
import BatchAckModal from '../BatchAckModal'
import Breadcrumbs from '../Breadcrumbs'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import AcknowledgementUploadModal from '../AcknowledgementUploadModal'
import { useDemo } from '../../context/DemoContext'
import ConfidenceScoreBadge from '../widgets/ConfidenceScoreBadge'
import AgentPipelineStrip from './AgentPipelineStrip'
import Select from '../Select'

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

const rfqTrackingSteps = [
    { status: 'RFQ Received', date: 'Just now', location: 'Dealer Portal', completed: true },
    { status: 'AI Extraction', date: 'Just now', location: 'System', completed: true },
    { status: 'Freight Calculation Exception', date: 'Just now', location: 'System', alert: true, completed: false },
    { status: 'Awaiting Validation', date: 'Just now', location: 'Expert Hub', completed: false },
]

const recentOrders = [
    { id: "#ORD-2055", customer: "AutoManfacture Co.", client: "AutoManfacture Co.", project: "Office Renovation", amount: "$385,000", status: "Order Received", date: "Dec 20, 2025", initials: "AC", statusColor: "bg-zinc-100 text-zinc-700", location: "New York" },
    { id: "#ORD-2054", customer: "TechDealer Solutions", client: "TechDealer Solutions", project: "HQ Upgrade", amount: "$62,500", status: "In Production", date: "Nov 15, 2025", initials: "TS", statusColor: "bg-brand-50 text-brand-700 ring-brand-600/20", location: "London" },
    { id: "#ORD-2053", customer: "Urban Living Inc.", client: "Urban Living Inc.", project: "Lobby Refresh", amount: "$112,000", status: "Ready to Ship", date: "Oct 30, 2025", initials: "UL", statusColor: "bg-green-50 text-green-700 ring-green-600/20", location: "Austin" },
    { id: "#ORD-2052", customer: "Global Logistics", client: "Global Logistics", project: "Warehouse Expansion", amount: "$45,000", status: "Delivered", date: "Oct 15, 2025", initials: "GL", statusColor: "bg-gray-100 text-gray-700", location: "Berlin" },
    { id: "#ORD-2051", customer: "City Builders", client: "City Builders", project: "City Center", amount: "$120,000", status: "Order Received", date: "Jan 05, 2026", initials: "CB", statusColor: "bg-zinc-100 text-zinc-700", location: "New York" },
    { id: "#ORD-2050", customer: "Modern Homes", client: "Modern Homes", project: "Residential A", amount: "$85,000", status: "Acknowledgement", date: "Jan 02, 2026", initials: "MH", statusColor: "bg-blue-50 text-blue-700", location: "Austin" },
    { id: "#ORD-2049", customer: "Coastal Props", client: "Coastal Props", project: "Beach House", amount: "$210,000", status: "In Production", date: "Dec 10, 2025", initials: "CP", statusColor: "bg-indigo-50 text-indigo-700", location: "London" },
    { id: "#ORD-2048", customer: "Valley Homes", client: "Valley Homes", project: "Mountain Retreat", amount: "$95,000", status: "Ready to Ship", date: "Nov 20, 2025", initials: "VH", statusColor: "bg-indigo-50 text-indigo-700", location: "Berlin" },
    { id: "#ORD-2047", customer: "Elite Builders", client: "Elite Builders", project: "Sky V", amount: "$450,000", status: "In Transit", date: "Nov 05, 2025", initials: "EB", statusColor: "bg-amber-50 text-amber-700", location: "New York" },
]

const recentQuotes = [
    { id: "QT-1025", customer: "Apex Furniture", project: "New HQ RFQ", amount: "Pending Approval", status: "Draft", date: "Just now", validUntil: "N/A", probability: "High", initials: "AF", statusColor: "bg-red-50 text-red-700", location: "Austin" },
    { id: "QT-1024", customer: "BioLife Inc", project: "Lab Expansion", amount: "$540,000", status: "Draft", date: "Jan 10, 2026", validUntil: "Draft", probability: "N/A", initials: "BL", statusColor: "bg-zinc-100 text-zinc-700", location: "Boston" },
    { id: "QT-1023", customer: "FinServe Corp", project: "Branch Rollout", amount: "$890,000", status: "Sent", date: "Jan 08, 2026", validUntil: "Feb 08, 2026", probability: "Medium", initials: "FS", statusColor: "bg-blue-50 text-blue-700", location: "New York" },
    { id: "QT-1022", customer: "Redwood School", project: "Classroom Refresh", amount: "$150,000", status: "Approved", date: "Dec 28, 2025", validUntil: "Jan 28, 2026", probability: "Closed", initials: "RS", statusColor: "bg-green-50 text-green-700", location: "Portland" },
]

const recentAcknowledgments = [
    { id: "ACK-8839", relatedPo: "PO-2026-001", vendor: "Herman Miller", status: "Confirmed", date: "Jan 14, 2026", expShipDate: "Feb 20, 2026", discrepancy: "None", initials: "HM", statusColor: "bg-green-50 text-green-700", location: "Zeeland" },
    { id: "ACK-8840", relatedPo: "PO-2026-002", vendor: "Steelcase", status: "Discrepancy", date: "Jan 13, 2026", expShipDate: "Pending", discrepancy: "Price Mismatch ($500)", initials: "SC", statusColor: "bg-red-50 text-red-700", location: "Grand Rapids" },
    { id: "ACK-8841", relatedPo: "PO-2026-003", vendor: "Knoll", status: "Partial", date: "Jan 12, 2026", expShipDate: "Mar 01, 2026", discrepancy: "Backordered Items", initials: "KN", statusColor: "bg-amber-50 text-amber-700", location: "East Greenville" },
]

// Pipeline stages
const pipelineStages = ['Order Received', 'In Production', 'Ready to Ship', 'In Transit', 'Delivered']
const quoteStages = ['Draft', 'Sent', 'Negotiating', 'Approved', 'Lost']
const ackStages = ['Pending', 'Discrepancy', 'Partial', 'Confirmed']


// Color Mapping for Status Icons
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
}

const solidColorStyles: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 border-blue-500',
    purple: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-purple-500/20 border-indigo-500',
    orange: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-orange-500/20 border-amber-500',
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

interface TransactionsProps {
    onLogout: () => void;
    onNavigateToDetail: (type: string) => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function ExpertHubTransactions({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: TransactionsProps) {
    const { currentStep, nextStep } = useDemo();
    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
    const [showMetrics, setShowMetrics] = useState(false);
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [isAckModalOpen, setIsAckModalOpen] = useState(false);
    const [isBatchAckOpen, setIsBatchAckOpen] = useState(false);
    const [isQuoteWidgetOpen, setIsQuoteWidgetOpen] = useState(false)
    const [showExpertReview, setShowExpertReview] = useState(false)
    const [reviewCorrections, setReviewCorrections] = useState<Record<string, 'accepted' | 'rejected' | null>>({ freight: null, quantity: null, armrest: null, warranty: null, discount: null });

    // Warranty & Discount state for step 1.5 expert review
    const [warrantySelections, setWarrantySelections] = useState<Record<string, string>>({});
    const [warrantyPage, setWarrantyPage] = useState(0);
    const [discountSections, setDiscountSections] = useState([
        { id: 'contract', title: 'Contract Pricing', expanded: false, items: [
            { id: 'c1', label: 'GSA Schedule Header', desc: 'Federal government base rate', rate: 45, enabled: true },
            { id: 'c2', label: 'Tier 1 Agreement', desc: 'Priority client discount', rate: 5, enabled: false },
        ]},
        { id: 'special', title: 'Special Authorizations', expanded: false, items: [
            { id: 's1', label: 'Director Approval', desc: 'Manual override code: DIR-2024', rate: 2, enabled: false },
        ]},
        { id: 'volume', title: 'Volume Discounts', expanded: false, items: [
            { id: 'v1', label: 'Bulk Order Tier 1', desc: 'Automated for orders above $50k', rate: 3, enabled: true },
            { id: 'v2', label: 'Container Load', desc: 'Direct from factory shipment', rate: 12, enabled: false },
        ]},
        { id: 'promo', title: 'Promotions', expanded: true, items: [
            { id: 'p1', label: 'Q1 Sales Kickoff', desc: 'Seasonal promotion', rate: 5, enabled: false },
            { id: 'p2', label: 'New Client Bonus', desc: 'One-time signup bonus', rate: 5, enabled: false },
        ]},
        { id: 'additional', title: 'Additional Discounts', expanded: false, items: [
            { id: 'a1', label: 'Early Payment', desc: '2% for payment within 10 days', rate: 2, enabled: true },
            { id: 'a2', label: 'Mixed Category', desc: 'Multiple product categories', rate: 2, enabled: true },
        ]},
    ]);
    const [discountPage, setDiscountPage] = useState(0);

    // Step 1.6 — Approval Chain Animation
    const [approvalStates16, setApprovalStates16] = useState<('pending' | 'approved')[]>(['pending', 'pending', 'pending'])
    const [approvalChainComplete16, setApprovalChainComplete16] = useState(false)
    useEffect(() => {
        if (currentStep.id !== '1.6') {
            setApprovalStates16(['pending', 'pending', 'pending']);
            setApprovalChainComplete16(false);
            return;
        }
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'pending', 'pending']), 2000));
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'approved', 'pending']), 4000));
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'approved', 'approved']), 5500));
        timeouts.push(setTimeout(() => setApprovalChainComplete16(true), 6500));
        return () => timeouts.forEach(clearTimeout);
    }, [currentStep.id]);
    const approvedCount16 = approvalStates16.filter(s => s === 'approved').length;
    const allApproved16 = approvedCount16 === 3;

    const warrantyItems = [
        { sku: 'ERG-5100', name: 'Ergonomic Task Chair', base: '$350', qty: 125, current: 'Standard 5yr' },
        { sku: 'DSK-2200', name: 'Height-Adjustable Desk', base: '$580', qty: 80, current: 'Standard 3yr' },
        { sku: 'ARM-4D10', name: 'Adjustable 4D Armrest', base: '$18', qty: 125, current: 'None' },
        { sku: 'MON-3400', name: 'Monitor Arm Dual', base: '$145', qty: 60, current: 'Standard 2yr' },
        { sku: 'CAB-1100', name: 'Mobile Pedestal Cabinet', base: '$220', qty: 40, current: 'Standard 3yr' },
    ];

    const warrantyTiers = [
        { id: 'standard', label: 'Standard', cost: 'Included', badge: '' },
        { id: 'ext-3yr', label: '+3 yr', cost: '+$25/ea', badge: '' },
        { id: 'ext-5yr', label: '+5 yr', cost: '+$50/ea', badge: 'Popular' },
        { id: 'ext-10yr', label: '+10 yr', cost: '+$95/ea', badge: '' },
    ];

    const subtotalForDiscount = 43750;
    const discountActiveCount = discountSections.reduce((acc, s) => acc + s.items.filter(i => i.enabled).length, 0);
    const discountTotalAmount = discountSections.reduce((acc, s) => acc + s.items.filter(i => i.enabled).reduce((a, i) => a + subtotalForDiscount * (i.rate / 100), 0), 0);
    const discountFinalTotal = subtotalForDiscount - discountTotalAmount;
    const discountRate = (discountTotalAmount / subtotalForDiscount) * 100;
    const formatCurrencyShort = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const toggleDiscountItem = (sectionId: string, itemId: string) => {
        setDiscountSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, enabled: !i.enabled } : i) } : s));
    };

    const toggleDiscountSection = (sectionId: string) => {
        setDiscountSections(prev => prev.map(s => s.id === sectionId ? { ...s, expanded: !s.expanded } : s));
    };

    const toggleAllInDiscountSection = (sectionId: string, enable: boolean) => {
        setDiscountSections(prev => prev.map(s => s.id === sectionId ? { ...s, items: s.items.map(i => ({ ...i, enabled: enable })) } : s));
    };

    const applyWarrantyToAll = (tierId: string) => {
        const bulk: Record<string, string> = {};
        warrantyItems.forEach(item => { bulk[item.sku] = tierId; });
        setWarrantySelections(bulk);
    };

    const applyAIRecommendedWarranties = () => {
        setWarrantySelections({
            'ERG-5100': 'ext-5yr',
            'DSK-2200': 'ext-5yr',
            'ARM-4D10': 'standard',
            'MON-3400': 'ext-3yr',
            'CAB-1100': 'ext-3yr',
        });
    };

    const warrantyTotalCost = Object.entries(warrantySelections).reduce((acc, [sku, tierId]) => {
        const item = warrantyItems.find(i => i.sku === sku);
        if (!item || tierId === 'standard') return acc;
        const tier = warrantyTiers.find(t => t.id === tierId);
        if (!tier) return acc;
        const costNum = parseFloat(tier.cost.replace(/[^0-9.]/g, '')) || 0;
        return acc + costNum * item.qty;
    }, 0);

    const warrantyItemsConfigured = Object.values(warrantySelections).filter(v => v && v !== 'standard').length;

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' }); // success | error | info
    const toastTimerRef = useRef<any>(null);

    const triggerToast = (title: string, description: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToastMessage({ title, description, type });
        setShowToast(true);

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
    };

    const handleExportSIF = (type: string) => {
        triggerToast(`Exporting ${type} SIF...`, 'Generating SIF file. Please wait.', 'info');

        setTimeout(() => {
            triggerToast(`${type} SIF Exported`, 'The SIF file has been successfully generated and downloaded.', 'success');
        }, 1500);
    };
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

    // Auto-switch to correct tab based on demo step
    useEffect(() => {
        if (currentStep.id === '1.5') {
            setLifecycleTab('quotes');
            setSearchQuery('QT-1025');
            setExpandedIds(new Set(['QT-1025']));
        } else if (currentStep.id === '1.6') {
            setLifecycleTab('quotes');
            setSearchQuery('');
        } else if (currentStep.id === '2.4') {
            setLifecycleTab('acknowledgments');
        }
    }, [currentStep.id]);

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
            const amount = (order as any).amount || '0'
            return sum + parseInt(amount.replace(/[^0-9]/g, ''))
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

            const matchesStatus = selectedStatus === 'All Statuses' || item.status === selectedStatus
            const matchesLocation = selectedLocation === 'All Locations' || (item.location || 'Unknown') === selectedLocation

            let matchesTab = true;
            if (activeTab === 'active') {
                matchesTab = !['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)
            } else if (activeTab === 'completed') {
                matchesTab = ['Delivered', 'Completed', 'Closed', 'Combined', 'Confirmed'].includes(item.status)
            } else if (activeTab === 'metrics') {
                matchesTab = true
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
            {/* Header/Nav space */}
            <div className="pt-8 px-4 max-w-[1600px] mx-auto space-y-6">
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
                            { label: 'Transactions' }
                        ]}
                    />
                </div>

                <div className="flex items-center mb-6">
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-card/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setLifecycleTab('quotes')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'quotes'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
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
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
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
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <ClipboardDocumentCheckIcon className="w-4 h-4" />
                            Acknowledgments
                        </button>
                    </div>
                </div>

                {lifecycleTab === 'quotes' && (
                    <>
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
                                            <div key={key} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            data.color === 'purple' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
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
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote" },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export SIF", action: () => handleExportSIF('Quote') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client" },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action && action.action()} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                        {Object.entries(quotesSummary).map(([key, data]) => (
                                            <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                <div
                                                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                    title={data.label}
                                                >
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
                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote" },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export SIF", action: () => handleExportSIF('Quote') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client" },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action && action.action()} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors relative group" title={action.label}>
                                            {action.icon}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                <button
                                    onClick={() => setShowMetrics(true)}
                                    className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-brand-300 dark:hover:bg-brand-600/50 rounded-lg transition-colors"
                                >
                                    <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white">Details</span>
                                </button>
                            </div>
                        )}
                        <div className="mt-6"></div>
                    </>
                )}

                {lifecycleTab === 'acknowledgments' && (
                    <>
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
                                            <div key={key} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            data.color === 'purple' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
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
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Ack", action: () => setIsAckModalOpen(true) },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export Acknowledgement", action: () => handleExportSIF('Acknowledgement') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Email Vendor" },
                                        { icon: <CheckBadgeIcon className="w-5 h-5" />, label: "Approve Orders", action: () => setIsBatchAckOpen(true) },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action ? action.action() : null} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                        {Object.entries(acksSummary).map(([key, data]) => (
                                            <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                <div
                                                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                    title={data.label}
                                                >
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
                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                                    {[
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Ack" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export Acknowledgement" },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Email Vendor" },
                                        { icon: <CheckBadgeIcon className="w-5 h-5" />, label: "Approve Orders" },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => {
                                            if (action.label === 'Upload Ack') setIsAckModalOpen(true);
                                            if (action.label === 'Approve Orders') setIsBatchAckOpen(true);
                                            if (action.label === 'Export Acknowledgement') handleExportSIF('Acknowledgement');
                                        }} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors relative group" title={action.label}>
                                            {action.icon}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                <button
                                    onClick={() => setShowMetrics(true)}
                                    className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-brand-300 dark:hover:bg-brand-600/50 rounded-lg transition-colors"
                                >
                                    <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white">Details</span>
                                </button>
                            </div>
                        )}
                        <div className="mt-6"></div>
                    </>
                )}

                {lifecycleTab === 'orders' && (
                    <>
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
                                            <div key={key} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                                        <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-xl ${data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                                                        data.color === 'orange' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            data.color === 'purple' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
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
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order" },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate" },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export Order", action: () => handleExportSIF('Order') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email" },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action && action.action()} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <button
                                        onClick={() => scroll(scrollContainerRef, 'left')}
                                        className="p-1.5 rounded-full hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
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
                                                <div
                                                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                    title={data.label}
                                                >
                                                    {data.icon}
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                                                        {data.label}
                                                    </span>
                                                </div>

                                                <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => scroll(scrollContainerRef, 'right')}
                                        className="p-1.5 rounded-full hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                                <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                                    {[
                                        { icon: <DocumentPlusIcon className="w-5 h-5" />, label: "New Quote", color: "text-blue-500" },
                                        { icon: <CubeIcon className="w-5 h-5" />, label: "Check Stock", color: "text-amber-500" },
                                        { icon: <ChartBarIcon className="w-5 h-5" />, label: "Gen. Report", color: "text-green-500" },
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "ERP Sync", color: "text-indigo-500" },
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (action.label === 'New Quote') setIsQuoteWidgetOpen(true);
                                            }}
                                            className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors relative group"
                                            title={action.label}
                                        >
                                            {action.icon}
                                        </button>
                                    ))}
                                    <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>
                                    <button onClick={() => handleExportSIF('Order')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors relative group" title="Export Order">
                                        <DocumentTextIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                <button
                                    onClick={() => setShowMetrics(true)}
                                    className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-brand-300 dark:hover:bg-brand-600/50 rounded-lg transition-colors"
                                >
                                    <div className="text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                        <ChevronDownIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Details</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'active'
                                    ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 ring-1 ring-inset ring-brand-600/20"
                                    : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            Active {lifecycleTab === 'orders' ? 'Orders' : lifecycleTab === 'quotes' ? 'Quotes' : 'Pending'} ({counts.active})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                activeTab === 'completed'
                                    ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 ring-1 ring-inset ring-brand-600/20"
                                    : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            History ({counts.completed})
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search transactions..."
                                className="pl-10 pr-4 py-2 w-64 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list'
                                        ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ListBulletIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('pipeline')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'pipeline'
                                        ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Squares2X2Icon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Select
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                        options={statuses}
                        className="w-44"
                    />
                    <Select
                        value={selectedLocation}
                        onChange={setSelectedLocation}
                        options={locations}
                        className="w-44"
                    />
                </div>

                {/* Step 1.5: Needs Attention Banner for Expert Review */}
                {currentStep.id === '1.5' && lifecycleTab === 'quotes' && !showExpertReview && (
                    <div className="p-4 rounded-2xl bg-card border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-medium text-foreground">1 Quote Needs Attention</h3>
                                        <ConfidenceScoreBadge score={82} label="Overall" size="sm" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        QT-1025 (Apex Furniture) — Multi-zone freight routing requires expert validation.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowExpertReview(true)}
                                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                            >
                                Review Now
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1.5: Full Expert Review Module — replaces table when active */}
                {currentStep.id === '1.5' && showExpertReview && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Quote Context Header */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowExpertReview(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-sm font-semibold text-foreground">QT-1025 — Expert Review</h2>
                                            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full ring-1 ring-inset ring-amber-500/20">In Review</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">Apex Furniture — New HQ RFQ — Austin, TX</p>
                                    </div>
                                </div>
                                <ConfidenceScoreBadge score={82} label="Overall" />
                            </div>
                            {/* KPI strip */}
                            <div className="grid grid-cols-5 gap-3">
                                {[
                                    { label: 'Items', value: '125', sub: 'Task Chairs' },
                                    { label: 'Draft Value', value: '$43,750', sub: 'Before corrections' },
                                    { label: 'AI Confidence', value: '82%', sub: '3 fields flagged' },
                                    { label: 'Source', value: 'Email RFQ', sub: 'PDF + CSV attached' },
                                    { label: 'Pipeline', value: 'Step 5/8', sub: 'Expert Review' },
                                ].map((kpi, i) => (
                                    <div key={i} className="bg-muted/30 rounded-xl p-3 border border-border/50">
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                                        <p className="text-base font-semibold text-foreground mt-0.5">{kpi.value}</p>
                                        <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Extraction Traceability */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                                    <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h3 className="text-xs font-medium text-foreground">AI Processing Trail</h3>
                                <span className="text-[10px] text-muted-foreground ml-auto">Completed 12m ago</span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                {['Email Intake', 'OCR Extract', 'Parser', 'Normalizer', 'Quote Builder'].map((agent, i) => (
                                    <Fragment key={agent}>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-green-500/30 bg-green-500/5">
                                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                                            <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">{agent}</span>
                                        </div>
                                        {i < 4 && <ChevronRightIcon className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
                                    </Fragment>
                                ))}
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                RFQ from <span className="text-foreground font-medium">Apex Furniture</span> processed through 5-agent pipeline.
                                Extracted <span className="text-foreground font-medium">125 Ergonomic Task Chairs</span> with specifications.
                                <span className="text-amber-600 dark:text-amber-400 font-medium"> 3 fields flagged</span> for expert review — freight calculation could not resolve non-standard building restrictions at destination.
                            </p>
                        </div>

                        {/* Two-column layout: Line Items + Corrections */}
                        <div className="grid grid-cols-12 gap-4">
                            {/* Left: Extracted Line Items */}
                            <div className="col-span-7 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                                    <h3 className="text-xs font-medium text-foreground">Extracted Line Items</h3>
                                    <span className="text-[10px] text-muted-foreground">1 item · AI-populated from RFQ</span>
                                </div>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/50 bg-muted/30">
                                            <th className="px-5 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                                            <th className="px-5 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                                            <th className="px-5 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-center">Qty</th>
                                            <th className="px-5 py-2.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Unit Price</th>
                                            <th className="px-5 py-2.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider text-center">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-border/30">
                                            <td className="px-5 py-3 text-xs font-medium text-foreground">SKU-OFF-2025-002</td>
                                            <td className="px-5 py-3">
                                                <p className="text-xs font-medium text-foreground">Ergonomic Task Chair</p>
                                                <p className="text-[10px] text-muted-foreground">Mesh / Gray · Standard Series</p>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-foreground text-center">
                                                <span className="inline-flex items-center gap-1">
                                                    125
                                                    <span className="text-[9px] text-amber-500">*</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs font-medium text-foreground text-right">$350.00</td>
                                            <td className="px-5 py-3 text-center"><ConfidenceScoreBadge score={95} size="sm" /></td>
                                        </tr>
                                        <tr className="bg-amber-500/5">
                                            <td className="px-5 py-3 text-xs text-muted-foreground" colSpan={2}>
                                                <div className="flex items-center gap-1.5">
                                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-amber-600 dark:text-amber-400 font-medium">Freight (LTL — Austin, TX)</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-muted-foreground text-center">—</td>
                                            <td className="px-5 py-3 text-xs text-muted-foreground text-right italic">Not calculated</td>
                                            <td className="px-5 py-3 text-center"><ConfidenceScoreBadge score={42} size="sm" /></td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-border">
                                            <td colSpan={3} className="px-5 py-3 text-xs font-medium text-foreground">Subtotal (before freight)</td>
                                            <td className="px-5 py-3 text-xs font-semibold text-foreground text-right">$43,750.00</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Right: Corrections & Substitutions */}
                            <div className="col-span-5 space-y-4">
                                {/* Discrepancies */}
                                <div className="bg-card border border-border rounded-2xl shadow-sm p-4 space-y-3">
                                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Discrepancies to Resolve</h3>

                                    {/* Freight */}
                                    <div className={cn("p-3 rounded-xl border transition-all", reviewCorrections.freight === 'accepted' ? 'border-green-500/30 bg-green-500/5' : reviewCorrections.freight === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20')}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-xs font-medium text-foreground">Freight Rate</span>
                                            </div>
                                            <ConfidenceScoreBadge score={42} size="sm" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] mb-2">
                                            <span className="text-muted-foreground line-through">$0.00</span>
                                            <ArrowRightIcon className="w-3 h-3 text-muted-foreground/40" />
                                            <span className="font-medium text-foreground">$2,450.00 (LTL Austin, TX)</span>
                                        </div>
                                        {reviewCorrections.freight ? (
                                            <span className={cn("text-[10px] font-medium", reviewCorrections.freight === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                                {reviewCorrections.freight === 'accepted' ? 'Accepted' : 'Rejected'} — click to change
                                            </span>
                                        ) : (
                                            <div className="flex gap-1.5">
                                                <button onClick={() => setReviewCorrections(p => ({ ...p, freight: 'accepted' }))} className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-md transition-colors">Accept</button>
                                                <button onClick={() => setReviewCorrections(p => ({ ...p, freight: 'rejected' }))} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-medium rounded-md transition-colors hover:bg-muted/80">Reject</button>
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <span className="text-[10px] text-muted-foreground">or enter:</span>
                                                    <input type="text" placeholder="$" className="w-16 px-2 py-0.5 text-[10px] bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div className={cn("p-3 rounded-xl border transition-all", reviewCorrections.quantity === 'accepted' ? 'border-green-500/30 bg-green-500/5' : reviewCorrections.quantity === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20')}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="text-xs font-medium text-foreground">Quantity Mismatch</span>
                                            </div>
                                            <ConfidenceScoreBadge score={88} size="sm" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] mb-2">
                                            <span className="text-muted-foreground">200 (RFQ body text)</span>
                                            <ArrowRightIcon className="w-3 h-3 text-muted-foreground/40" />
                                            <span className="font-medium text-foreground">125 (verified from PDF attachment)</span>
                                        </div>
                                        {reviewCorrections.quantity ? (
                                            <span className={cn("text-[10px] font-medium", reviewCorrections.quantity === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                                {reviewCorrections.quantity === 'accepted' ? 'Accepted' : 'Rejected'} — click to change
                                            </span>
                                        ) : (
                                            <div className="flex gap-1.5">
                                                <button onClick={() => setReviewCorrections(p => ({ ...p, quantity: 'accepted' }))} className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-md transition-colors">Accept</button>
                                                <button onClick={() => setReviewCorrections(p => ({ ...p, quantity: 'rejected' }))} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-medium rounded-md transition-colors hover:bg-muted/80">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Substitution Proposals */}
                                <div className="bg-card border border-border rounded-2xl shadow-sm p-4 space-y-3">
                                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Substitution Proposals</h3>

                                    <div className={cn("p-3 rounded-xl border transition-all", reviewCorrections.armrest === 'accepted' ? 'border-green-500/30 bg-green-500/5' : reviewCorrections.armrest === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20')}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <ArrowPathIcon className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="text-xs font-medium text-foreground">Armrest Upgrade</span>
                                            </div>
                                            <ConfidenceScoreBadge score={91} size="sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="bg-muted/30 rounded-lg p-2">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current (RFQ)</p>
                                                <p className="text-[11px] font-medium text-foreground mt-0.5">Fixed Armrest</p>
                                                <p className="text-[10px] text-muted-foreground">$12/unit · 3-week lead</p>
                                            </div>
                                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider">Suggested</p>
                                                <p className="text-[11px] font-medium text-foreground mt-0.5">Adjustable 4D</p>
                                                <p className="text-[10px] text-muted-foreground">$18/unit · In Stock</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mb-2">+$750 total · +2.1% margin uplift · eliminates 3-week lead time</p>
                                        {reviewCorrections.armrest ? (
                                            <span className={cn("text-[10px] font-medium", reviewCorrections.armrest === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                                {reviewCorrections.armrest === 'accepted' ? 'Substitution Accepted' : 'Keeping Original'} — click to change
                                            </span>
                                        ) : (
                                            <div className="flex gap-1.5">
                                                <button onClick={() => setReviewCorrections(p => ({ ...p, armrest: 'accepted' }))} className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-md transition-colors">Accept Substitution</button>
                                                <button onClick={() => setReviewCorrections(p => ({ ...p, armrest: 'rejected' }))} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-medium rounded-md transition-colors hover:bg-muted/80">Keep Original</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Extended Warranty Configuration */}
                                <div className={cn("bg-card border rounded-2xl shadow-sm overflow-hidden transition-all", reviewCorrections.warranty === 'accepted' ? 'border-green-500/30' : 'border-border')}>
                                    {/* Warranty Header */}
                                    <div className="p-4 border-b border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                                    <WrenchScrewdriverIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <h3 className="text-xs font-medium text-foreground">Extended Warranty</h3>
                                            </div>
                                            {reviewCorrections.warranty === 'accepted' && (
                                                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Confirmed</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">Activate extended warranties for eligible products. Select coverage tier per item — time-based options available for all categories.</p>
                                    </div>

                                    {/* Warranty Summary Bar */}
                                    <div className="px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-500/5 border-b border-border flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">{warrantyItemsConfigured} extended</span>
                                            <span className="text-[10px] text-muted-foreground">·</span>
                                            <span className="text-[10px] text-muted-foreground">{warrantyItems.length - warrantyItemsConfigured} standard</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-muted-foreground">Added cost: </span>
                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrencyShort(warrantyTotalCost)}</span>
                                        </div>
                                    </div>

                                    {/* Quick Bulk Actions */}
                                    <div className="px-4 py-2.5 border-b border-border bg-muted/10">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Quick Actions — Apply to All 40 Items</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {warrantyTiers.map((tier) => (
                                                <button
                                                    key={tier.id}
                                                    onClick={() => applyWarrantyToAll(tier.id)}
                                                    className={cn(
                                                        "px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all",
                                                        Object.values(warrantySelections).length === warrantyItems.length && Object.values(warrantySelections).every(v => v === tier.id)
                                                            ? "border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                                                            : "border-border bg-card text-muted-foreground hover:border-indigo-500/30 hover:text-foreground"
                                                    )}
                                                >
                                                    All {tier.label} {tier.id !== 'standard' && <span className="text-[9px] ml-0.5 opacity-70">{tier.cost}</span>}
                                                </button>
                                            ))}
                                            <div className="w-px h-5 bg-border mx-0.5" />
                                            <button
                                                onClick={applyAIRecommendedWarranties}
                                                className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-[10px] font-medium text-blue-700 dark:text-blue-300 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center gap-1"
                                            >
                                                <SparklesIcon className="w-3 h-3" />
                                                AI Recommended
                                            </button>
                                        </div>
                                    </div>

                                    {/* Warranty Items */}
                                    <div className="divide-y divide-border">
                                        {warrantyItems.map((item) => {
                                            const selected = warrantySelections[item.sku] || 'standard';
                                            return (
                                                <div key={item.sku} className="px-4 py-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <span className="text-[11px] font-medium text-foreground">{item.name}</span>
                                                            <span className="ml-2 text-[10px] text-muted-foreground">{item.sku} · Qty {item.qty}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground">{item.base}/ea</span>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {warrantyTiers.map((tier) => {
                                                            const isActive = selected === tier.id;
                                                            return (
                                                                <button
                                                                    key={tier.id}
                                                                    onClick={() => setWarrantySelections(p => ({ ...p, [item.sku]: tier.id }))}
                                                                    className={cn(
                                                                        "flex-1 py-1.5 px-2 rounded-lg border text-center transition-all relative",
                                                                        isActive
                                                                            ? "border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10"
                                                                            : "border-border bg-muted/20 hover:border-border/60"
                                                                    )}
                                                                >
                                                                    {tier.badge && (
                                                                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">{tier.badge}</span>
                                                                    )}
                                                                    <div className={cn("text-[10px] font-medium", isActive ? "text-indigo-700 dark:text-indigo-300" : "text-foreground")}>{tier.label}</div>
                                                                    <div className={cn("text-[9px]", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground")}>{tier.cost}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination */}
                                    <div className="px-4 py-2.5 border-t border-border flex items-center justify-between bg-muted/10">
                                        <span className="text-[10px] text-muted-foreground">Showing 1-5 of 40 items</span>
                                        <div className="flex items-center gap-1">
                                            <button disabled className="px-2 py-0.5 text-[10px] text-muted-foreground/40 border border-border/30 rounded">Prev</button>
                                            <button className="px-2 py-0.5 text-[10px] font-medium text-primary-foreground bg-primary rounded">1</button>
                                            <button className="px-2 py-0.5 text-[10px] text-muted-foreground border border-border/30 rounded hover:bg-muted/30">2</button>
                                            <button className="px-2 py-0.5 text-[10px] text-muted-foreground border border-border/30 rounded hover:bg-muted/30">3</button>
                                            <span className="text-[10px] text-muted-foreground">...</span>
                                            <button className="px-2 py-0.5 text-[10px] text-muted-foreground border border-border/30 rounded hover:bg-muted/30">8</button>
                                            <button className="px-2 py-0.5 text-[10px] text-muted-foreground border border-border/30 rounded hover:bg-muted/30">Next</button>
                                        </div>
                                    </div>

                                    {/* Warranty Confirm Footer */}
                                    {!reviewCorrections.warranty && (
                                        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                                            <p className="text-[10px] text-muted-foreground">Review warranty selections then confirm to proceed.</p>
                                            <button
                                                onClick={() => setReviewCorrections(p => ({ ...p, warranty: 'accepted' }))}
                                                className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-lg transition-colors"
                                            >
                                                Confirm Warranties
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Discount Structure */}
                                <div className={cn("bg-card border rounded-2xl shadow-sm overflow-hidden transition-all", reviewCorrections.discount === 'accepted' ? 'border-green-500/30' : 'border-border')}>
                                    {/* Discount Header */}
                                    <div className="p-4 border-b border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg">
                                                    <CurrencyDollarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                </div>
                                                <h3 className="text-xs font-medium text-foreground">Discount Structure</h3>
                                            </div>
                                            {reviewCorrections.discount === 'accepted' && (
                                                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Confirmed</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-relaxed">Toggle applicable discounts by category. AI pre-activated contract and volume pricing based on dealer tier and order value. Approval chain triggers automatically for totals above $40K.</p>
                                    </div>

                                    {/* Green Summary Card */}
                                    <div className="mx-4 mt-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-xl">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-medium text-green-700 dark:text-green-400 uppercase tracking-wider">Active Discounts</span>
                                            <span className="text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-500/20 px-1.5 py-0.5 rounded-full">{discountActiveCount} applied</span>
                                        </div>
                                        <div className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">{formatCurrencyShort(discountFinalTotal)}</div>
                                        <div className="flex items-center justify-between border-t border-green-200/50 dark:border-green-800/30 pt-2">
                                            <div>
                                                <div className="text-[9px] text-green-600 dark:text-green-500">Total Savings</div>
                                                <div className="text-sm font-semibold text-green-700 dark:text-green-400">{formatCurrencyShort(discountTotalAmount)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-green-600 dark:text-green-500">Discount Rate</div>
                                                <div className="text-sm font-semibold text-green-700 dark:text-green-400">{discountRate.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Discount Sections */}
                                    <div className="p-4 space-y-2">
                                        {discountSections.map(section => {
                                            const activeInSection = section.items.filter(i => i.enabled).length;
                                            const isAllEnabled = activeInSection === section.items.length && section.items.length > 0;
                                            const sectionColors: Record<string, { bg: string; border: string; text: string }> = {
                                                contract: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800/30', text: 'text-blue-700 dark:text-blue-400' },
                                                special: { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-800/30', text: 'text-amber-700 dark:text-amber-400' },
                                                volume: { bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-100 dark:border-indigo-800/30', text: 'text-indigo-700 dark:text-indigo-400' },
                                                promo: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-100 dark:border-green-800/30', text: 'text-green-700 dark:text-green-400' },
                                                additional: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800/30', text: 'text-blue-700 dark:text-blue-400' },
                                            };
                                            const sc = sectionColors[section.id] || sectionColors.contract;

                                            return (
                                                <div key={section.id} className={cn("border rounded-xl transition-all", section.expanded ? `${sc.bg} ${sc.border}` : 'border-border')}>
                                                    <button onClick={() => toggleDiscountSection(section.id)} className="w-full flex items-center justify-between px-3 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("text-[11px] font-medium", section.expanded ? sc.text : 'text-foreground')}>{section.title}</span>
                                                            <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", section.expanded ? `${sc.text}` : 'text-muted-foreground bg-muted/40')}>{activeInSection}/{section.items.length}</span>
                                                        </div>
                                                        <ChevronDownIcon className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", section.expanded && "rotate-180")} />
                                                    </button>

                                                    {section.expanded && (
                                                        <div className="px-3 pb-3 space-y-2">
                                                            {/* Toggle All */}
                                                            <div className={cn("flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-dashed", sc.border)}>
                                                                <span className={cn("text-[10px] font-medium", sc.text)}>Toggle All</span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleAllInDiscountSection(section.id, !isAllEnabled); }}
                                                                    className={cn("relative inline-flex h-4 w-7 items-center rounded-full transition-colors", isAllEnabled ? 'bg-foreground' : 'bg-muted-foreground/20')}
                                                                >
                                                                    <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white dark:bg-zinc-800 transition-transform", isAllEnabled ? 'translate-x-3.5' : 'translate-x-0.5')} />
                                                                </button>
                                                            </div>

                                                            {section.items.map(item => (
                                                                <div key={item.id} className="bg-card border border-border rounded-lg p-2.5 flex items-center justify-between">
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                                            <span className="text-[11px] font-medium text-foreground">{item.label}</span>
                                                                            <span className="text-[9px] px-1 py-0.5 bg-muted rounded font-medium text-muted-foreground border border-border/50">{item.rate}%</span>
                                                                        </div>
                                                                        <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                                                                        {item.enabled && (
                                                                            <div className="mt-1 flex items-center gap-1 text-[9px] text-green-600 dark:text-green-400 font-medium">
                                                                                <CheckCircleIcon className="w-3 h-3" />
                                                                                Applied: -{formatCurrencyShort(subtotalForDiscount * (item.rate / 100))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleDiscountItem(section.id, item.id)}
                                                                        className={cn("relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors shrink-0", item.enabled ? 'bg-foreground' : 'bg-muted-foreground/20')}
                                                                    >
                                                                        <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-800 transition-transform", item.enabled ? 'translate-x-4' : 'translate-x-0.5')} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Discount Info Footer */}
                                    <div className="mx-4 mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg flex gap-2">
                                        <SparklesIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-blue-700 dark:text-blue-400 font-medium mb-0.5">AI-Optimized Pricing</p>
                                            <p className="text-[9px] text-blue-600 dark:text-blue-300">Contract and volume discounts were pre-activated based on dealer tier (Tier 2) and order value. Toggle any discount to see real-time impact on the quote total.</p>
                                        </div>
                                    </div>

                                    {/* Discount Confirm Footer */}
                                    {!reviewCorrections.discount && (
                                        <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                                            <p className="text-[10px] text-muted-foreground">Final discount: <span className="font-medium text-foreground">{discountRate.toFixed(1)}%</span> · triggers approval chain (&gt;$40K)</p>
                                            <button
                                                onClick={() => setReviewCorrections(p => ({ ...p, discount: 'accepted' }))}
                                                className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-lg transition-colors"
                                            >
                                                Confirm Discounts
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Approve Footer */}
                        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    {Object.values(reviewCorrections).filter(v => v !== null).length}/{Object.keys(reviewCorrections).length} items reviewed
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Revised total: <span className="text-foreground font-medium">{formatCurrencyShort(discountFinalTotal + warrantyTotalCost)}</span> (incl. discounts + warranty) · Savings: <span className="text-green-600 dark:text-green-400 font-medium">{formatCurrencyShort(discountTotalAmount)}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowExpertReview(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-lg transition-colors hover:bg-muted/80"
                                >
                                    Back to Queue
                                </button>
                                <button
                                    onClick={() => nextStep()}
                                    className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                    disabled={Object.values(reviewCorrections).some(v => v === null)}
                                >
                                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                                    Approve & Send to Approval Chain
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2.4: Auto-Fix Branching for Acknowledgments */}
                {currentStep.id === '2.4' && lifecycleTab === 'acknowledgments' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Pipeline Strip */}
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngest', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done', detail: '2 exceptions' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'done', detail: '1 auto, 2 escalated' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* Auto-Resolved Card */}
                        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-foreground">Auto-Resolved (Within Guardrails)</h3>
                                    <p className="text-xs text-muted-foreground">1 discrepancy auto-corrected by DiscrepancyResolverAgent</p>
                                </div>
                                <ConfidenceScoreBadge score={96} label="Confidence" size="md" />
                            </div>
                            <div className="ml-12 space-y-3">
                                <div className="bg-muted/50 rounded-lg px-4 py-3">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-foreground font-medium">Line 3: Date shift (Feb 20 → Feb 22)</span>
                                        <span className="text-green-600 dark:text-green-400 font-bold">Auto-Accepted</span>
                                    </div>
                                    {/* Guardrail Threshold Bar */}
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>Delivery Shift</span>
                                            <span>Threshold: 5 days</span>
                                        </div>
                                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                            <div className="absolute inset-0 border-2 border-dashed border-green-500/30 rounded-full" />
                                            <div className="h-full bg-green-500/60 rounded-full transition-all" style={{ width: '40%' }} />
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1">
                                            <span>0 days</span>
                                            <span className="text-green-600 dark:text-green-400 font-bold">2 days (within limit)</span>
                                            <span>5 days</span>
                                        </div>
                                    </div>
                                </div>
                                {/* AI Explanation */}
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400">2-day delivery shift is within the 5-day guardrail threshold. Auto-accepted per policy.</span>
                                </div>
                            </div>
                        </div>

                        {/* Escalated Card */}
                        <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-foreground">Requires Expert Review</h3>
                                    <p className="text-xs text-muted-foreground">2 exceptions exceed guardrail thresholds</p>
                                </div>
                            </div>
                            <div className="ml-12 space-y-3">
                                {/* Freight Exception with Guardrail Bar */}
                                <div className="bg-muted/50 rounded-lg px-4 py-3">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-foreground font-medium">Freight: $45 → $150 (+233%)</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold">Escalated</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>Price Increase</span>
                                            <span>Threshold: +20% or +$50</span>
                                        </div>
                                        <div className="relative h-3 bg-muted rounded-full overflow-visible">
                                            <div className="absolute h-full w-[20%] border-r-2 border-dashed border-red-500/50 rounded-l-full" />
                                            <div className="h-full bg-red-500/60 rounded-full transition-all" style={{ width: '100%' }} />
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-1">
                                            <span>0%</span>
                                            <span className="text-red-600 dark:text-red-400 font-bold">+233% (exceeds +20% limit)</span>
                                            <span>+233%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* SKU Substitution */}
                                <div className="bg-muted/50 rounded-lg px-4 py-3">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-foreground font-medium">Line 2: SKU substitution (DSK-B → DSK-C)</span>
                                        <span className="text-red-600 dark:text-red-400 font-bold">Escalated</span>
                                    </div>
                                    <div className="mt-1 px-3 py-1.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800">
                                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">SKU changes require Expert verification per policy — automatic resolution disabled.</span>
                                    </div>
                                </div>

                                {/* AI Recommendation */}
                                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Accept freight if carrier surcharge justified (check BOL). DSK-C is catalog-equivalent to DSK-B — verify dimensions match project specs.</span>
                                </div>
                            </div>

                            <div className="mt-4 ml-12 flex items-center gap-3">
                                <button
                                    onClick={() => onNavigateToDetail('ack-detail')}
                                    className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                >
                                    Open Guided Correction
                                    <ArrowRightIcon className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                    <SparklesIcon className="w-3 h-3" />
                                    AI has pre-filled recommendations
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1.6 — Approval Chain */}
                {currentStep.id === '1.6' && (
                    <div className="space-y-4">
                        {/* Agent Pipeline */}
                        <AgentPipelineStrip agents={[
                            { id: 'email', name: 'EmailIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR/Parser', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'valid', name: 'Validator', status: 'done' },
                            { id: 'quote', name: 'QuoteBuilder', status: 'done', detail: 'QT-1025' },
                            { id: 'approval', name: 'ApprovalOrch', status: allApproved16 ? 'done' : 'running', detail: allApproved16 ? '3/3 approved' : `${approvedCount16}/3` },
                            { id: 'po', name: 'POBuilder', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="purple" />

                        <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-lg">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Approval Chain Required</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Quote QT-1025 triggered policy-based approval workflow</p>
                                    </div>
                                </div>
                                <ConfidenceScoreBadge score={94} label="Policy Match" />
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Trigger Reason */}
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 mb-1.5">Approval Trigger</p>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                            <CurrencyDollarIcon className="w-3.5 h-3.5 shrink-0" />
                                            <span>Quote total <span className="font-bold">$134,250</span> exceeds $100,000 threshold</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                            <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                                            <span>Non-standard discounts applied: <span className="font-bold">Early Payment (2%) + Mixed Category (2%)</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                            <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 shrink-0" />
                                            <span>Extended warranty options selected for 3 SKUs</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis */}
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                                    <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <div className="text-xs text-indigo-700 dark:text-indigo-300">
                                        <span className="font-bold">ApprovalOrchestratorAgent:</span> Identified 3 policy triggers. Routing to sequential 3-level approval chain based on quote value bracket ($100k-$250k) and discount policy.
                                    </div>
                                </div>

                                {/* Approval Chain */}
                                <div className="space-y-0">
                                    {[
                                        { name: 'Sarah Chen', role: 'Regional Sales Manager', reason: 'Quote value > $100k', level: 'Level 1' },
                                        { name: 'David Park', role: 'Finance Director', reason: 'Non-standard discounts applied', level: 'Level 2' },
                                        { name: 'System Policy Engine', role: 'Automated Compliance Check', reason: 'Warranty + pricing validation', level: 'Level 3' },
                                    ].map((approver, i) => (
                                        <div key={i}>
                                            {i > 0 && (
                                                <div className="ml-5 h-6 border-l-2 border-dashed border-border" />
                                            )}
                                            <div className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                                                approvalStates16[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === approvedCount16
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            }`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                                                    approvalStates16[i] === 'approved'
                                                        ? 'bg-emerald-500 text-white'
                                                        : i === approvedCount16
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {approvalStates16[i] === 'approved' ? (
                                                        <CheckIcon className="w-5 h-5" />
                                                    ) : i === approvedCount16 ? (
                                                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <ClockIcon className="w-4 h-4" />
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
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Approved</span>
                                                    ) : i === approvedCount16 ? (
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Reviewing...</span>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground">Pending</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold text-muted-foreground">Approval Progress</span>
                                        <span className="text-[10px] font-bold text-foreground">{approvedCount16}/3</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${allApproved16 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                            style={{ width: `${(approvedCount16 / 3) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Success banner */}
                                {allApproved16 && (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">All Approvals Complete</p>
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Quote QT-1025 ($134,250) approved through all 3 levels. Ready for PO generation.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Quote Summary */}
                                {approvalChainComplete16 && (
                                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Approved Quote Summary</p>
                                        <div className="grid grid-cols-4 gap-3">
                                            {[
                                                { label: 'Quote ID', value: 'QT-1025' },
                                                { label: 'Total Value', value: '$134,250' },
                                                { label: 'Line Items', value: '5 SKUs' },
                                                { label: 'Discount Applied', value: '4% combined' },
                                            ].map(item => (
                                                <div key={item.label} className="text-center">
                                                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                                    <p className="text-sm font-bold text-foreground">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={nextStep}
                                        disabled={!approvalChainComplete16}
                                        className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
                                            approvalChainComplete16
                                                ? 'bg-primary text-primary-foreground hover:opacity-90'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        Generate Purchase Order
                                        <ArrowRightIcon className="w-3.5 h-3.5" />
                                    </button>
                                    {approvalChainComplete16 && (
                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                            <SparklesIcon className="w-3 h-3" />
                                            POBuilderAgent will auto-generate PO from approved quote
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hide table/pipeline when expert review panel is open */}
                {!(currentStep.id === '1.5' && showExpertReview) && !(currentStep.id === '1.6') && (viewMode === 'list' ? (
                    <div className="bg-card glass border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-800/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transaction</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Project / Entity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Value</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredData.map((item) => (
                                        <Fragment key={item.id}>
                                            <tr className={cn(
                                                "group hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors cursor-pointer",
                                                expandedIds.has(item.id) && "bg-brand-50/50 dark:bg-brand-500/10"
                                            )} onClick={() => toggleExpand(item.id)}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-black/5 shadow-sm transition-transform group-hover:scale-110", (item as any).statusColor.replace('bg-', 'text-').replace('text-', 'bg-'))}>
                                                            {(item as any).initials}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">{item.id}</div>
                                                            <div className="text-[10px] font-medium text-muted-foreground">{(item as any).customer || (item as any).vendor}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-foreground">{(item as any).project || (item as any).relatedPo || "Standard Project"}</div>
                                                    <div className="text-[10px] flex items-center gap-1 text-muted-foreground font-medium uppercase tracking-tight">
                                                        <MapPinIcon className="w-3 h-3" />
                                                        {item.location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="text-sm font-bold text-foreground">{(item as any).amount || "-"}</div>
                                                    {(item as any).probability && (
                                                        <div className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 italic">{(item as any).probability} Prob.</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border leading-none", (item as any).statusColor)}>
                                                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs font-semibold text-foreground uppercase tracking-wider italic">{item.date}</div>
                                                    <div className="text-[10px] font-medium text-muted-foreground">Updated 2h ago</div>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-muted-foreground hover:text-foreground transition-colors shadow-sm ring-1 ring-inset ring-black/5" title="View Details">
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-muted-foreground hover:text-foreground transition-colors shadow-sm ring-1 ring-inset ring-black/5" title="Edit">
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-muted-foreground hover:text-red-500 transition-colors shadow-sm ring-1 ring-inset ring-black/5" title="Delete">
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedIds.has(item.id) && (
                                                <tr className={`bg-muted/30 animate-in fade-in duration-300 ${currentStep.id === '1.5' && item.id === "QT-1025" ? 'ring-1 ring-inset ring-amber-500/20' : ''}`}>
                                                    <td colSpan={6} className="px-8 py-6">
                                                        {/* Step 1.5 QT-1025: Prompt to open full review panel */}
                                                        {currentStep.id === '1.5' && item.id === "QT-1025" ? (
                                                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl animate-in fade-in duration-300">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                                                                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-medium text-foreground">3 discrepancies flagged by AI — freight, quantity, substitution</p>
                                                                        <p className="text-[10px] text-muted-foreground mt-0.5">Open the review panel to resolve and continue quote generation.</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setShowExpertReview(true)}
                                                                    className="px-4 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                                                >
                                                                    Open Review
                                                                </button>
                                                            </div>
                                                        ) : (
                                                        /* Default expanded row */
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-l-2 border-border pl-3">Timeline & Status</h4>
                                                                <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-border">
                                                                    {(item.id === "QT-1025" ? rfqTrackingSteps : trackingSteps).map((step, idx) => (
                                                                        <div key={idx} className="flex gap-3 relative">
                                                                            <div className={cn(
                                                                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10",
                                                                                step.completed ? "bg-green-500 text-white" :
                                                                                    step.alert ? "bg-red-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-muted-foreground"
                                                                            )}>
                                                                                {step.completed ? <CheckIcon className="w-3.5 h-3.5" /> :
                                                                                    step.alert ? <ExclamationTriangleIcon className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                                            </div>
                                                                            <div className="flex-1 pb-3">
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className={cn("text-xs font-medium leading-none", step.completed ? "text-foreground" : "text-muted-foreground")}>{step.status}</span>
                                                                                    <span className="text-[10px] text-muted-foreground">{step.date}</span>
                                                                                </div>
                                                                                <div className="text-[10px] text-muted-foreground mt-0.5">{step.location}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-l-2 border-border pl-3">AI Intelligence Report</h4>
                                                                <div className="bg-card rounded-xl p-4 border border-border">
                                                                    <div className="flex items-start gap-3 mb-3">
                                                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                                                                            <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-medium text-foreground">Strata AI Insights</p>
                                                                            <p className="text-[10px] text-muted-foreground mt-0.5">Generated 12m ago</p>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                                                        Order identified as <span className="text-foreground font-medium">High Risk</span> due to Customs hold. AI predicted resolution: <span className="font-medium text-foreground">48.2h</span>.
                                                                    </p>
                                                                    <button className="mt-3 w-full px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5">
                                                                        <CheckBadgeIcon className="w-3.5 h-3.5" />
                                                                        Initiate Remediation
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-l-2 border-border pl-3">Quick Actions</h4>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[
                                                                        { icon: <DocumentDuplicateIcon className="w-4 h-4" />, label: "Duplicate" },
                                                                        { icon: <EnvelopeIcon className="w-4 h-4" />, label: "Notify Client" },
                                                                        { icon: <CloudArrowUpIcon className="w-4 h-4" />, label: "Update File" },
                                                                        { icon: <CommandLineIcon className="w-4 h-4" />, label: "CRM Sync" },
                                                                    ].map((btn, i) => (
                                                                        <button key={i} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors group">
                                                                            <div className="text-muted-foreground group-hover:text-foreground transition-colors">{btn.icon}</div>
                                                                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider">{btn.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        )}
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
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-4 min-h-[600px]">
                        {(lifecycleTab === 'quotes' ? quoteStages : lifecycleTab === 'acknowledgments' ? ackStages : pipelineStages).map((stage) => {
                            const stageData = filteredData.filter(item => item.status === stage);
                            return (
                                <div key={stage} className="flex flex-col h-full group/col">
                                    <div className="flex items-center justify-between mb-4 group/header">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{stage}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-muted-foreground ring-1 ring-inset ring-black/5">{stageData.length}</span>
                                        </div>
                                        <button className="p-1 rounded opacity-0 group-hover/header:opacity-100 text-muted-foreground hover:text-foreground">
                                            <EllipsisHorizontalIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl p-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-brand-500/30 transition-colors space-y-3">
                                        {stageData.map((item) => (
                                            <div
                                                key={item.id}
                                                draggable
                                                className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all cursor-move group/card relative overflow-hidden"
                                                onClick={() => {
                                                    setLifecycleTab(lifecycleTab);
                                                    toggleExpand(item.id);
                                                    setViewMode('list');
                                                }}
                                            >
                                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/card:opacity-100">
                                                    <ArrowsPointingOutIcon className="w-3" />
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[8px] ring-1 ring-inset ring-black/5 uppercase shadow-sm font-black", (item as any).statusColor.replace('bg-', 'text-').replace('text-', 'bg-'))}>
                                                        {(item as any).initials}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-foreground font-black tracking-tight">{item.id}</span>
                                                </div>
                                                <h4 className="text-xs font-bold text-foreground leading-tight italic line-clamp-1">{(item as any).customer || (item as any).vendor}</h4>
                                                <p className="text-[10px] text-muted-foreground mt-1 font-medium capitalize truncate">{(item as any).project || (item as any).relatedPo}</p>

                                                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPinIcon className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tight italic">{item.location}</span>
                                                    </div>
                                                    <div className="text-[10px] font-black text-brand-600 dark:text-brand-400">{(item as any).amount || "-"}</div>
                                                </div>
                                            </div>
                                        ))}

                                        {stageData.length === 0 && (
                                            <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl opacity-40">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">No items</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <CreateOrderModal isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />
            <AcknowledgementUploadModal isOpen={isAckModalOpen} onClose={() => setIsAckModalOpen(false)} />
            <BatchAckModal isOpen={isBatchAckOpen} onClose={() => setIsBatchAckOpen(false)} />
            <SmartQuoteHub isOpen={isQuoteWidgetOpen} onClose={() => setIsQuoteWidgetOpen(false)} />

            <Transition show={showToast} as={Fragment}>
                <div className="fixed bottom-10 right-10 z-[100] w-96 pointer-events-none">
                    <TransitionChild
                        as={Fragment}
                        enter="transform ease-out duration-300 transition"
                        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="pointer-events-auto bg-white dark:bg-card/90 backdrop-blur shadow-2xl rounded-2xl border-l-[6px] border border-zinc-200 dark:border-zinc-800 overflow-hidden ring-1 ring-black/5" style={{ borderColor: toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'info' ? '#3b82f6' : '#22c55e' }}>
                            <div className="p-5">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        {toastMessage.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />}
                                        {toastMessage.type === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />}
                                        {toastMessage.type === 'info' && <BellIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />}
                                    </div>
                                    <div className="ml-4 w-0 flex-1">
                                        <p className="text-sm font-black text-foreground uppercase tracking-widest">{toastMessage.title}</p>
                                        <p className="mt-1 text-xs font-bold text-muted-foreground italic leading-relaxed">{toastMessage.description}</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex">
                                        <button
                                            className="rounded-md inline-flex text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => setShowToast(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionChild>
                </div>
            </Transition>
        </div>
    )
}
