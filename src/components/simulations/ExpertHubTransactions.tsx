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

// ═══════════════════════════════════════════
// FLOW 2 DATA: Real ACK data from AIS PDF + HAT vendor email
// ═══════════════════════════════════════════
const ACK_AIS = {
    id: 'ACK-7842', relatedPo: 'PO-1064B', vendor: 'AIS', vendorFull: 'AIS (Adaptive Interior Solutions)',
    status: 'Discrepancy', date: 'Feb 18, 2026', lineItems: 50, total: '$65,439.09', discrepancies: 3,
    project: 'Premier Underground Design', customer: 'Corporate Interior Systems',
    shipTo: '135 E Watkins St, Phoenix, AZ 85004', initials: 'AI', statusColor: 'bg-red-50 text-red-700',
    location: 'Leominster, MA',
};

const ACK_HAT = {
    id: 'ACK-7841', relatedPo: 'PO-1064', vendor: 'HAT', vendorFull: 'HAT Contract',
    status: 'Confirmed', date: 'Feb 18, 2026', lineItems: 5, total: '$8,220.00', discrepancies: 0,
    project: 'Premier Underground Design', customer: 'Corporate Interior Systems',
    initials: 'HC', statusColor: 'bg-green-50 text-green-700', location: 'Holland, MI',
};

const HAT_COMPARISON_LINES = [
    { line: 1, partPO: 'HAT-FL2448', partACK: 'HAT-FL2448', colorPO: 'Warm Grey 4', colorACK: 'Folkstone Grey', descPO: 'Flat Panel 24x48', descACK: 'Flat Panel 24x48', match: true, aiReason: 'Part number matches — color variation accepted per client directive' },
    { line: 2, partPO: 'HAT-TL3060', partACK: 'HAT-TL3060', colorPO: 'N/A', colorACK: 'N/A', descPO: 'Tile Panel 30x60', descACK: 'Acoustical Tile 30x60', match: true, aiReason: 'Part number matches — description variation accepted per client directive' },
];

const ACK_LINE_ITEMS_50 = [
    { line: 1, sku: 'X-TS6030', desc: 'CB Table Shell 60x30', qty: 4, qtyAck: 4, price: '$1,284.00', status: 'match' as const },
    { line: 8, sku: 'X-PNL2460', desc: 'CB Privacy Panel 24x60', qty: 6, qtyAck: 6, price: '$468.00', status: 'match' as const },
    { line: 12, sku: 'X-W3060', desc: 'CB Wardrobe 30x60', qty: 3, qtyAck: 3, price: '$2,154.00', dateShift: '+14 days', status: 'date-shift' as const },
    { line: 23, sku: 'X-P2460', desc: 'CB Pedestal 24x60', qty: 8, qtyAck: 6, price: '$1,092.00', shortfall: 2, status: 'qty-short' as const },
    { line: 34, sku: 'X-BK4818', desc: 'CB Bookcase 48x18', qty: 5, qtyAck: 5, price: '$1,680.00', dateShift: '+11 days', status: 'date-shift' as const },
    { line: 41, sku: 'X-DS6030', desc: 'CB Desk Shell 60x30', qty: 2, qtyAck: 2, price: '$2,568.00', grommetPO: 'No Grommet', grommetACK: 'Grommet Option C - Left Rear Corner #2', status: 'grommet-error' as const },
    { line: 47, sku: 'X-QUADALDR', desc: 'CB Quad Alder Table', qty: 4, qtyAck: 2, price: '$3,440.00', shortfall: 2, status: 'qty-short' as const },
    { line: 68, sku: 'X-DSFM9624', desc: 'CB Desk Shell FM 96x24', qty: 1, qtyAck: 1, price: '$1,812.00', grommetACK: 'No Grommet', status: 'match' as const },
];

const FLOW2_BACKORDER_LINES = [
    { sku: 'X-W3060', desc: 'CB Wardrobe 30x60', qtyShort: 0, qtyBackorder: 3, reason: 'Full line backorder — vendor capacity' },
    { sku: 'X-P2460', desc: 'CB Pedestal 24x60', qtyShort: 2, qtyBackorder: 2, reason: 'Partial — 6 of 8 acknowledged' },
    { sku: 'X-QUADALDR', desc: 'CB Quad Alder Table', qtyShort: 2, qtyBackorder: 2, reason: 'Partial — 2 of 4 acknowledged' },
];

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
    const { currentStep, nextStep, isDemoActive } = useDemo();
    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
    const [showMetrics, setShowMetrics] = useState(false);
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [isAckModalOpen, setIsAckModalOpen] = useState(false);
    const [isBatchAckOpen, setIsBatchAckOpen] = useState(false);
    const [isQuoteWidgetOpen, setIsQuoteWidgetOpen] = useState(false)
    const [showExpertReview, setShowExpertReview] = useState(false)
    const [reviewCorrections, setReviewCorrections] = useState<Record<string, 'accepted' | 'rejected' | null>>({ freight: null, quantity: null, armrest: null, discount: null });

    // Expert review detail panels — expanded state, editable values, notes
    const [expandedReviewItems, setExpandedReviewItems] = useState<Record<string, boolean>>({});
    const [editingField, setEditingField] = useState<string | null>(null);
    const [freightEditValue, setFreightEditValue] = useState('2,450.00');
    const [quantityEditValue, setQuantityEditValue] = useState('125');
    const [expertNotes, setExpertNotes] = useState<Record<string, string>>({ freight: '', quantity: '', armrest: '' });
    const [reviewAuditLog, setReviewAuditLog] = useState<{ time: string; action: string; field: string; icon: 'check' | 'edit' | 'reject' | 'note' }[]>([]);

    const toggleReviewItemExpand = (id: string) => setExpandedReviewItems(p => ({ ...p, [id]: !p[id] }));

    const addAuditEntry = (action: string, field: string, icon: 'check' | 'edit' | 'reject' | 'note') => {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setReviewAuditLog(p => [{ time, action, field, icon }, ...p]);
    };

    const handleReviewAction = (field: string, action: 'accepted' | 'rejected') => {
        setReviewCorrections(p => ({ ...p, [field]: action }));
        addAuditEntry(
            action === 'accepted' ? 'Accepted' : 'Rejected',
            field.charAt(0).toUpperCase() + field.slice(1),
            action === 'accepted' ? 'check' : 'reject'
        );
    };

    const handleFieldEdit = (field: string, value: string) => {
        addAuditEntry(`Value edited to ${value}`, field.charAt(0).toUpperCase() + field.slice(1), 'edit');
        setEditingField(null);
    };

    const handleNoteSave = (field: string) => {
        if (expertNotes[field]?.trim()) {
            addAuditEntry(`Note added: "${expertNotes[field].slice(0, 40)}${expertNotes[field].length > 40 ? '...' : ''}"`, field.charAt(0).toUpperCase() + field.slice(1), 'note');
        }
    };

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

    // Step 1.6 — Quote Approval Chain (2 approvers: System Policy auto → Sarah Chen → auto-advance)
    const [approvalStates16, setApprovalStates16] = useState<('pending' | 'approved')[]>(['pending', 'pending'])
    useEffect(() => {
        if (currentStep.id !== '1.6') {
            setApprovalStates16(['pending', 'pending']);
            return;
        }
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        // T+3s: System Policy Engine finishes compliance review
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'pending']), 3000));
        // T+6s: Sarah Chen approves after reviewing
        timeouts.push(setTimeout(() => setApprovalStates16(['approved', 'approved']), 6000));
        // T+9s: advance to next step (3s to see both approved)
        timeouts.push(setTimeout(() => nextStep(), 9000));
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
        // PO Generation phase (0-6s)
        t.push(setTimeout(() => setPhase18('po-generating'), 1500));
        t.push(setTimeout(() => setPoGenPhase18('mapping'), 3000));
        t.push(setTimeout(() => setPoGenPhase18('validating'), 4500));
        t.push(setTimeout(() => { setPoGenPhase18('complete'); setPhase18('po-complete'); }, 6000));
        // Order Approval Chain (8s-19s) — 3s per approver for readability
        t.push(setTimeout(() => setPhase18('order-chain'), 8000));
        t.push(setTimeout(() => setOrderApprovalStates18(['approved', 'pending', 'pending']), 11000));
        t.push(setTimeout(() => setOrderApprovalStates18(['approved', 'approved', 'pending']), 14000));
        t.push(setTimeout(() => setOrderApprovalStates18(['approved', 'approved', 'approved']), 17000));
        // Completion (19s) + advance (22s)
        t.push(setTimeout(() => setPhase18('order-complete'), 19000));
        t.push(setTimeout(() => { setPhase18('done'); nextStep(); }, 22000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);
    const orderApprovedCount18 = orderApprovalStates18.filter(s => s === 'approved').length;

    // Step 1.10 — Pipeline View with animated card
    const [pipelineNotifShown19, setPipelineNotifShown19] = useState(false)
    const [cardAnimationStage19, setCardAnimationStage19] = useState<'hidden' | 'appearing' | 'arrived'>('hidden')
    useEffect(() => {
        if (currentStep.id !== '1.10') {
            setPipelineNotifShown19(false);
            setCardAnimationStage19('hidden');
            return;
        }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setPipelineNotifShown19(true), 500));
        t.push(setTimeout(() => setCardAnimationStage19('appearing'), 1500));
        t.push(setTimeout(() => setCardAnimationStage19('arrived'), 3000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);

    // ═══════════════════════════════════════════
    // FLOW 2 STATE + EFFECTS
    // ═══════════════════════════════════════════

    // Step 2.1 — Pipeline arrival (both ACK cards appear)
    const [ackArrival21, setAckArrival21] = useState<Record<string, 'hidden' | 'appearing' | 'placed'>>({ AIS: 'hidden', HAT: 'hidden' });
    useEffect(() => {
        if (currentStep.id !== '2.1') { setAckArrival21({ AIS: 'hidden', HAT: 'hidden' }); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setAckArrival21(p => ({ ...p, HAT: 'appearing' })), 1000));
        t.push(setTimeout(() => setAckArrival21(p => ({ ...p, HAT: 'placed' })), 2000));
        t.push(setTimeout(() => setAckArrival21(p => ({ ...p, AIS: 'appearing' })), 2500));
        t.push(setTimeout(() => setAckArrival21(p => ({ ...p, AIS: 'placed' })), 3500));
        t.push(setTimeout(() => nextStep(), 6000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);

    // Step 2.2 — Normalization & smart comparison
    const [normPhase22, setNormPhase22] = useState<'idle' | 'norm-hat' | 'comparing-hat' | 'hat-ai-rule' | 'hat-confirmed' | 'norm-ais' | 'comparing-ais' | 'ais-flagged'>('idle');
    useEffect(() => {
        if (currentStep.id !== '2.2') { setNormPhase22('idle'); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setNormPhase22('norm-hat'), 1000));
        t.push(setTimeout(() => setNormPhase22('comparing-hat'), 3000));
        t.push(setTimeout(() => setNormPhase22('hat-ai-rule'), 5000));
        t.push(setTimeout(() => setNormPhase22('hat-confirmed'), 6500));
        t.push(setTimeout(() => setNormPhase22('norm-ais'), 8000));
        t.push(setTimeout(() => setNormPhase22('comparing-ais'), 10000));
        t.push(setTimeout(() => setNormPhase22('ais-flagged'), 12000));
        t.push(setTimeout(() => nextStep(), 14000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);

    // Step 2.3 — Delta engine (3 discrepancy cards) — interactive: user clicks "Generate Backorder"
    const [deltaPhase23, setDeltaPhase23] = useState<'idle' | 'scanning' | 'grommet-found' | 'grommet-fixed' | 'dates-found' | 'dates-fixed' | 'qty-found' | 'complete'>('idle');
    const [backorderTriggered23, setBackorderTriggered23] = useState(false);
    useEffect(() => {
        if (currentStep.id !== '2.3') { setDeltaPhase23('idle'); setBackorderTriggered23(false); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setDeltaPhase23('scanning'), 1000));
        t.push(setTimeout(() => setDeltaPhase23('grommet-found'), 3000));
        t.push(setTimeout(() => setDeltaPhase23('grommet-fixed'), 5000));
        t.push(setTimeout(() => setDeltaPhase23('dates-found'), 7000));
        t.push(setTimeout(() => setDeltaPhase23('dates-fixed'), 9000));
        t.push(setTimeout(() => setDeltaPhase23('qty-found'), 11000));
        t.push(setTimeout(() => setDeltaPhase23('complete'), 13000));
        // No auto-advance — user clicks "Generate Backorder" on qty card
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);

    // Step 2.4 — Expert review table (auto-advance since backorder already triggered in 2.3)
    useEffect(() => {
        if (currentStep.id !== '2.4') return;
        const t = setTimeout(() => nextStep(), 8000);
        return () => clearTimeout(t);
    }, [currentStep.id]);

    // Step 2.5 — Backorder & approval chain
    const [boPhase25, setBoPhase25] = useState<'generating' | 'generated' | 'approval' | 'complete'>('generating');
    const [approvalStates25, setApprovalStates25] = useState<('pending' | 'approved')[]>(['pending', 'pending', 'pending']);
    useEffect(() => {
        if (currentStep.id !== '2.5') { setBoPhase25('generating'); setApprovalStates25(['pending', 'pending', 'pending']); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        // Backorder generation (0-2s)
        t.push(setTimeout(() => setBoPhase25('generated'), 2000));
        // Approval chain begins (4s) — 3s per approver for readability
        t.push(setTimeout(() => setBoPhase25('approval'), 4000));
        t.push(setTimeout(() => setApprovalStates25(['approved', 'pending', 'pending']), 7000));
        t.push(setTimeout(() => setApprovalStates25(['approved', 'approved', 'pending']), 10000));
        t.push(setTimeout(() => setApprovalStates25(['approved', 'approved', 'approved']), 13000));
        // Completion (15s) + advance (18s)
        t.push(setTimeout(() => setBoPhase25('complete'), 15000));
        t.push(setTimeout(() => nextStep(), 18000));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);
    const approvedCount25 = approvalStates25.filter(s => s === 'approved').length;

    // Step 2.6 — Pipeline resolution
    const [resolvedCards26, setResolvedCards26] = useState<Record<string, 'hidden' | 'appearing' | 'placed'>>({ AIS: 'hidden', HAT: 'hidden' });
    useEffect(() => {
        if (currentStep.id !== '2.6') { setResolvedCards26({ AIS: 'hidden', HAT: 'hidden' }); return; }
        const t: ReturnType<typeof setTimeout>[] = [];
        t.push(setTimeout(() => setResolvedCards26(p => ({ ...p, HAT: 'appearing' })), 500));
        t.push(setTimeout(() => setResolvedCards26(p => ({ ...p, HAT: 'placed' })), 1500));
        t.push(setTimeout(() => setResolvedCards26(p => ({ ...p, AIS: 'appearing' })), 2500));
        t.push(setTimeout(() => setResolvedCards26(p => ({ ...p, AIS: 'placed' })), 3500));
        return () => t.forEach(clearTimeout);
    }, [currentStep.id]);

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
        } else if (['1.6', '1.8'].includes(currentStep.id)) {
            setLifecycleTab('quotes');
            setSearchQuery('');
        } else if (currentStep.id === '1.10') {
            setLifecycleTab('orders');
            setViewMode('pipeline');
            setSearchQuery('');
        } else if (['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'].includes(currentStep.id)) {
            setLifecycleTab('acknowledgments');
            setSearchQuery('');
            if (currentStep.id === '2.1' || currentStep.id === '2.6') {
                setViewMode('pipeline');
            }
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
                        {false && (showMetrics ? (
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
                        ))}
                        <div className="mt-6"></div>
                    </>
                )}

                {lifecycleTab === 'acknowledgments' && (
                    <>
                        {false && (showMetrics ? (
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
                        ))}
                        <div className="mt-6"></div>
                    </>
                )}

                {lifecycleTab === 'orders' && (
                    <>
                        {false && (showMetrics ? (
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
                        ))}
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
                    <div data-demo-target="expert-validation-row" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
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
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Discrepancies to Resolve</h3>
                                        <span className="text-[10px] text-muted-foreground">{Object.values(reviewCorrections).filter(v => v !== null).length}/{Object.keys(reviewCorrections).length} resolved</span>
                                    </div>

                                    {/* ——— Freight Rate ——— */}
                                    <div className={cn("rounded-xl border transition-all overflow-hidden", reviewCorrections.freight === 'accepted' ? 'border-green-500/30 bg-green-500/5' : reviewCorrections.freight === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20')}>
                                        <div className="p-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-xs font-medium text-foreground">Freight Rate</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">High Priority</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ConfidenceScoreBadge score={42} size="sm" />
                                                    <button onClick={() => toggleReviewItemExpand('freight')} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                                                        <ChevronDownIcon className={cn("w-3.5 h-3.5 transition-transform", expandedReviewItems.freight && "rotate-180")} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] mb-2">
                                                <span className="text-muted-foreground line-through">$0.00</span>
                                                <ArrowRightIcon className="w-3 h-3 text-muted-foreground/40" />
                                                {editingField === 'freight' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-muted-foreground">$</span>
                                                        <input
                                                            type="text"
                                                            value={freightEditValue}
                                                            onChange={(e) => setFreightEditValue(e.target.value)}
                                                            className="w-24 px-2 py-0.5 text-[11px] font-medium bg-background border border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleFieldEdit('freight', `$${freightEditValue}`)} className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-medium rounded-md">Save</button>
                                                        <button onClick={() => setEditingField(null)} className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-medium rounded-md">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-foreground group/edit cursor-pointer" onClick={() => setEditingField('freight')}>
                                                        ${freightEditValue} (LTL Austin, TX)
                                                        <PencilSquareIcon className="w-3 h-3 inline ml-1 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            {reviewCorrections.freight ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[10px] font-medium flex items-center gap-1", reviewCorrections.freight === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                                        {reviewCorrections.freight === 'accepted' ? <><CheckCircleIcon className="w-3 h-3" /> Accepted</> : <><XMarkIcon className="w-3 h-3" /> Rejected</>}
                                                    </span>
                                                    <button onClick={() => setReviewCorrections(p => ({ ...p, freight: null }))} className="text-[9px] text-muted-foreground underline ml-1">undo</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => handleReviewAction('freight', 'accepted')} className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded-md transition-colors flex items-center gap-1"><CheckIcon className="w-3 h-3" /> Accept</button>
                                                    <button onClick={() => handleReviewAction('freight', 'rejected')} className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-medium rounded-md transition-colors hover:bg-red-500/20 flex items-center gap-1"><XMarkIcon className="w-3 h-3" /> Reject</button>
                                                    <button onClick={() => setEditingField('freight')} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-medium rounded-md transition-colors hover:bg-muted/80 flex items-center gap-1"><PencilSquareIcon className="w-3 h-3" /> Edit Value</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded Detail Panel */}
                                        {expandedReviewItems.freight && (
                                            <div className="border-t border-border bg-muted/10 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {/* Source Documents */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Source Documents</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex items-start gap-2 p-2 bg-background rounded-lg border border-border/50">
                                                            <DocumentTextIcon className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-medium text-foreground">RFQ Email Body</p>
                                                                <p className="text-[9px] text-muted-foreground">No freight terms specified</p>
                                                                <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">Missing data</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2 p-2 bg-background rounded-lg border border-border/50">
                                                            <DocumentDuplicateIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-medium text-foreground">PDF Attachment</p>
                                                                <p className="text-[9px] text-muted-foreground">Delivery: "Austin, TX 78701"</p>
                                                                <p className="text-[9px] text-green-600 dark:text-green-400 mt-0.5">Address extracted</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Reasoning */}
                                                <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <SparklesIcon className="w-3 h-3 text-indigo-500" />
                                                        <p className="text-[9px] font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">AI Reasoning</p>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 leading-relaxed">
                                                        RFQ did not specify freight terms. Destination is a multi-story commercial building in downtown Austin with loading dock restrictions (floors 12-15). LTL carrier rate calculated using TMS at $2,450 based on: 125 units × 48 lbs/unit = 6,000 lbs total, Class 150, requiring liftgate + inside delivery surcharge. Building has restricted delivery windows (6-9 AM only).
                                                    </p>
                                                </div>

                                                {/* Freight Breakdown */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Rate Breakdown</p>
                                                    <div className="space-y-1">
                                                        {[
                                                            { label: 'Base LTL Rate (6,000 lbs, Class 150)', value: '$1,850.00' },
                                                            { label: 'Liftgate Surcharge', value: '$175.00' },
                                                            { label: 'Inside Delivery (floors 12-15)', value: '$325.00' },
                                                            { label: 'Restricted Access Window', value: '$100.00' },
                                                        ].map((line, i) => (
                                                            <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-background border border-border/30">
                                                                <span className="text-[10px] text-muted-foreground">{line.label}</span>
                                                                <span className="text-[10px] font-medium text-foreground">{line.value}</span>
                                                            </div>
                                                        ))}
                                                        <div className="flex items-center justify-between px-2 py-1.5 rounded bg-foreground/5 border border-border">
                                                            <span className="text-[10px] font-bold text-foreground">Total Freight</span>
                                                            <span className="text-[10px] font-bold text-foreground">$2,450.00</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Comparable Quotes */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Historical Comparison</p>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {[
                                                            { id: 'QT-0987', route: 'Houston, TX', weight: '5,200 lbs', cost: '$2,100', date: 'Nov 2025' },
                                                            { id: 'QT-0921', route: 'Dallas, TX', weight: '6,500 lbs', cost: '$2,380', date: 'Oct 2025' },
                                                            { id: 'QT-0856', route: 'Austin, TX', weight: '4,800 lbs', cost: '$2,250', date: 'Sep 2025' },
                                                        ].map(q => (
                                                            <div key={q.id} className="p-2 bg-background rounded-lg border border-border/50 text-center">
                                                                <p className="text-[9px] font-medium text-foreground">{q.id}</p>
                                                                <p className="text-[9px] text-muted-foreground">{q.route}</p>
                                                                <p className="text-[10px] font-bold text-foreground mt-0.5">{q.cost}</p>
                                                                <p className="text-[8px] text-muted-foreground">{q.weight} · {q.date}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Expert Notes */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Expert Notes</p>
                                                    <textarea
                                                        value={expertNotes.freight}
                                                        onChange={(e) => setExpertNotes(p => ({ ...p, freight: e.target.value }))}
                                                        onBlur={() => handleNoteSave('freight')}
                                                        placeholder="Add review notes for audit trail..."
                                                        className="w-full px-3 py-2 text-[10px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* ——— Quantity Mismatch ——— */}
                                    <div className={cn("rounded-xl border transition-all overflow-hidden", reviewCorrections.quantity === 'accepted' ? 'border-green-500/30 bg-green-500/5' : reviewCorrections.quantity === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20')}>
                                        <div className="p-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <SparklesIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span className="text-xs font-medium text-foreground">Quantity Mismatch</span>
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">AI Resolved</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ConfidenceScoreBadge score={88} size="sm" />
                                                    <button onClick={() => toggleReviewItemExpand('quantity')} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                                                        <ChevronDownIcon className={cn("w-3.5 h-3.5 transition-transform", expandedReviewItems.quantity && "rotate-180")} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] mb-2">
                                                <span className="text-muted-foreground line-through">200 (RFQ body text)</span>
                                                <ArrowRightIcon className="w-3 h-3 text-muted-foreground/40" />
                                                {editingField === 'quantity' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={quantityEditValue}
                                                            onChange={(e) => setQuantityEditValue(e.target.value)}
                                                            className="w-16 px-2 py-0.5 text-[11px] font-medium bg-background border border-primary rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                                            autoFocus
                                                        />
                                                        <span className="text-[10px] text-muted-foreground">units</span>
                                                        <button onClick={() => handleFieldEdit('quantity', quantityEditValue)} className="px-2 py-0.5 bg-primary text-primary-foreground text-[9px] font-medium rounded-md">Save</button>
                                                        <button onClick={() => setEditingField(null)} className="px-2 py-0.5 bg-muted text-muted-foreground text-[9px] font-medium rounded-md">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-foreground group/edit cursor-pointer" onClick={() => setEditingField('quantity')}>
                                                        {quantityEditValue} (verified from PDF attachment)
                                                        <PencilSquareIcon className="w-3 h-3 inline ml-1 text-muted-foreground opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            {reviewCorrections.quantity ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[10px] font-medium flex items-center gap-1", reviewCorrections.quantity === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                                        {reviewCorrections.quantity === 'accepted' ? <><CheckCircleIcon className="w-3 h-3" /> Accepted (AI suggestion)</> : <><XMarkIcon className="w-3 h-3" /> Rejected — using original</>}
                                                    </span>
                                                    <button onClick={() => setReviewCorrections(p => ({ ...p, quantity: null }))} className="text-[9px] text-muted-foreground underline ml-1">undo</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => handleReviewAction('quantity', 'accepted')} className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded-md transition-colors flex items-center gap-1"><CheckIcon className="w-3 h-3" /> Accept (125)</button>
                                                    <button onClick={() => handleReviewAction('quantity', 'rejected')} className="px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-medium rounded-md transition-colors hover:bg-red-500/20 flex items-center gap-1"><XMarkIcon className="w-3 h-3" /> Keep Original (200)</button>
                                                    <button onClick={() => setEditingField('quantity')} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-medium rounded-md transition-colors hover:bg-muted/80 flex items-center gap-1"><PencilSquareIcon className="w-3 h-3" /> Edit</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded Detail Panel */}
                                        {expandedReviewItems.quantity && (
                                            <div className="border-t border-border bg-muted/10 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {/* Source Comparison */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Source Comparison</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="p-2.5 bg-red-50 dark:bg-red-500/5 rounded-lg border border-red-200 dark:border-red-500/20">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <EnvelopeIcon className="w-3 h-3 text-red-500" />
                                                                <p className="text-[9px] font-medium text-red-700 dark:text-red-400 uppercase">Email Body</p>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-red-600 dark:text-red-400 line-through">200 units</p>
                                                            <p className="text-[9px] text-red-600 dark:text-red-300 mt-0.5 italic">"...requesting quote for 200 ergonomic chairs for the new building..."</p>
                                                            <p className="text-[9px] text-red-500 mt-1 font-medium">Likely outdated — email sent 3 days before attachment</p>
                                                        </div>
                                                        <div className="p-2.5 bg-green-50 dark:bg-green-500/5 rounded-lg border border-green-200 dark:border-green-500/20">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <DocumentTextIcon className="w-3 h-3 text-green-500" />
                                                                <p className="text-[9px] font-medium text-green-700 dark:text-green-400 uppercase">PDF Spec Sheet</p>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-green-600 dark:text-green-400">125 units</p>
                                                            <p className="text-[9px] text-green-600 dark:text-green-300 mt-0.5 italic">"Floor plan: 125 workstations, floors 12-15, Building C"</p>
                                                            <p className="text-[9px] text-green-500 mt-1 font-medium">Matches floor plan count exactly</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Reasoning */}
                                                <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <SparklesIcon className="w-3 h-3 text-indigo-500" />
                                                        <p className="text-[9px] font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">AI Reasoning</p>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 leading-relaxed">
                                                        Email mentions 200 units but the attached PDF specification (dated 2 days later) details a floor plan for 125 workstations across 4 floors. The PDF is a more recent and detailed source. Cross-referenced with the building directory: floors 12-15 have 31-32 workstations each = 125 total. Confidence: 88%.
                                                    </p>
                                                </div>

                                                {/* Impact Analysis */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Impact Analysis</p>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        <div className="p-2 bg-background rounded-lg border border-border/50 text-center">
                                                            <p className="text-[9px] text-muted-foreground">If 200 units</p>
                                                            <p className="text-[11px] font-bold text-foreground">$70,000</p>
                                                        </div>
                                                        <div className="p-2 bg-green-50 dark:bg-green-500/5 rounded-lg border border-green-200 dark:border-green-500/20 text-center">
                                                            <p className="text-[9px] text-green-600 dark:text-green-400">If 125 units (AI)</p>
                                                            <p className="text-[11px] font-bold text-green-600 dark:text-green-400">$43,750</p>
                                                        </div>
                                                        <div className="p-2 bg-background rounded-lg border border-border/50 text-center">
                                                            <p className="text-[9px] text-muted-foreground">Difference</p>
                                                            <p className="text-[11px] font-bold text-amber-600">-$26,250</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expert Notes */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Expert Notes</p>
                                                    <textarea
                                                        value={expertNotes.quantity}
                                                        onChange={(e) => setExpertNotes(p => ({ ...p, quantity: e.target.value }))}
                                                        onBlur={() => handleNoteSave('quantity')}
                                                        placeholder="Add review notes for audit trail..."
                                                        className="w-full px-3 py-2 text-[10px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Substitution Proposals */}
                                <div className="bg-card border border-border rounded-2xl shadow-sm p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Substitution Proposals</h3>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">1 suggestion</span>
                                    </div>

                                    <div className={cn("rounded-xl border transition-all overflow-hidden", reviewCorrections.armrest === 'accepted' ? 'border-green-500/30 bg-green-500/5' : reviewCorrections.armrest === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-border bg-muted/20')}>
                                        <div className="p-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <ArrowPathIcon className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-xs font-medium text-foreground">Armrest Upgrade</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <ConfidenceScoreBadge score={91} size="sm" />
                                                    <button onClick={() => toggleReviewItemExpand('armrest')} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                                                        <ChevronDownIcon className={cn("w-3.5 h-3.5 transition-transform", expandedReviewItems.armrest && "rotate-180")} />
                                                    </button>
                                                </div>
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

                                            {/* Action buttons */}
                                            {reviewCorrections.armrest ? (
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[10px] font-medium flex items-center gap-1", reviewCorrections.armrest === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
                                                        {reviewCorrections.armrest === 'accepted' ? <><CheckCircleIcon className="w-3 h-3" /> Substitution Accepted</> : <><XMarkIcon className="w-3 h-3" /> Keeping Original</>}
                                                    </span>
                                                    <button onClick={() => setReviewCorrections(p => ({ ...p, armrest: null }))} className="text-[9px] text-muted-foreground underline ml-1">undo</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => handleReviewAction('armrest', 'accepted')} className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium rounded-md transition-colors flex items-center gap-1"><CheckIcon className="w-3 h-3" /> Accept Substitution</button>
                                                    <button onClick={() => handleReviewAction('armrest', 'rejected')} className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-medium rounded-md transition-colors hover:bg-muted/80 flex items-center gap-1"><XMarkIcon className="w-3 h-3" /> Keep Original</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded Detail Panel */}
                                        {expandedReviewItems.armrest && (
                                            <div className="border-t border-border bg-muted/10 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {/* Detailed Product Comparison */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Detailed Comparison</p>
                                                    <div className="border border-border rounded-lg overflow-hidden">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="bg-muted/30 border-b border-border/50">
                                                                    <th className="px-3 py-1.5 text-[9px] font-medium text-muted-foreground uppercase">Spec</th>
                                                                    <th className="px-3 py-1.5 text-[9px] font-medium text-muted-foreground uppercase text-center">Current</th>
                                                                    <th className="px-3 py-1.5 text-[9px] font-medium text-blue-600 dark:text-blue-400 uppercase text-center">Suggested</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/30">
                                                                {[
                                                                    { spec: 'Model', current: 'ARM-FX-100', suggested: 'ARM-4D10' },
                                                                    { spec: 'Adjustment', current: 'Fixed height only', suggested: '4D: height, width, depth, pivot' },
                                                                    { spec: 'Material', current: 'Molded plastic', suggested: 'Soft PU pad + metal frame' },
                                                                    { spec: 'Unit Price', current: '$12.00', suggested: '$18.00' },
                                                                    { spec: 'Lead Time', current: '3 weeks (backordered)', suggested: 'In Stock — ships same day' },
                                                                    { spec: 'Warranty', current: '2 years', suggested: '5 years' },
                                                                    { spec: 'Ergonomic Rating', current: 'Basic', suggested: 'BIFMA Level 3 Certified' },
                                                                ].map((row, i) => (
                                                                    <tr key={i}>
                                                                        <td className="px-3 py-1.5 text-[10px] font-medium text-foreground">{row.spec}</td>
                                                                        <td className="px-3 py-1.5 text-[10px] text-muted-foreground text-center">{row.current}</td>
                                                                        <td className="px-3 py-1.5 text-[10px] text-blue-600 dark:text-blue-400 text-center font-medium">{row.suggested}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Financial Impact */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Financial Impact</p>
                                                    <div className="grid grid-cols-4 gap-1.5">
                                                        {[
                                                            { label: 'Price Delta', value: '+$6/unit', color: 'text-amber-600 dark:text-amber-400' },
                                                            { label: 'Total Impact', value: '+$750', color: 'text-amber-600 dark:text-amber-400' },
                                                            { label: 'Margin Uplift', value: '+2.1%', color: 'text-green-600 dark:text-green-400' },
                                                            { label: 'Lead Time Saved', value: '3 weeks', color: 'text-green-600 dark:text-green-400' },
                                                        ].map(item => (
                                                            <div key={item.label} className="p-2 bg-background rounded-lg border border-border/50 text-center">
                                                                <p className="text-[9px] text-muted-foreground">{item.label}</p>
                                                                <p className={cn("text-[11px] font-bold", item.color)}>{item.value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* AI Reasoning */}
                                                <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <SparklesIcon className="w-3 h-3 text-indigo-500" />
                                                        <p className="text-[9px] font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">AI Reasoning</p>
                                                    </div>
                                                    <p className="text-[10px] text-indigo-600 dark:text-indigo-300 leading-relaxed">
                                                        ARM-FX-100 is currently backordered (3-week ETA). ARM-4D10 is in stock with 500+ units available. The 4D adjustable armrest has a higher ergonomic rating (BIFMA Level 3) which aligns with the client's request for "ergonomic task chairs." Price increase of $6/unit ($750 total) is offset by eliminating the 3-week delay and providing better client value. Historical data shows 78% of similar RFQs accepted this substitution.
                                                    </p>
                                                </div>

                                                {/* Expert Notes */}
                                                <div>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Expert Notes</p>
                                                    <textarea
                                                        value={expertNotes.armrest}
                                                        onChange={(e) => setExpertNotes(p => ({ ...p, armrest: e.target.value }))}
                                                        onBlur={() => handleNoteSave('armrest')}
                                                        placeholder="Add review notes for audit trail..."
                                                        className="w-full px-3 py-2 text-[10px] bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
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

                        {/* Review Audit Trail */}
                        {reviewAuditLog.length > 0 && (
                            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="text-xs font-medium text-foreground">Review Activity Log</h3>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{reviewAuditLog.length} actions</span>
                                </div>
                                <div className="divide-y divide-border/50 max-h-40 overflow-y-auto">
                                    {reviewAuditLog.map((entry, i) => (
                                        <div key={i} className="px-4 py-2 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                                entry.icon === 'check' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                                                entry.icon === 'reject' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' :
                                                entry.icon === 'edit' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                                'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                            )}>
                                                {entry.icon === 'check' ? <CheckIcon className="w-3 h-3" /> :
                                                 entry.icon === 'reject' ? <XMarkIcon className="w-3 h-3" /> :
                                                 entry.icon === 'edit' ? <PencilSquareIcon className="w-3 h-3" /> :
                                                 <DocumentTextIcon className="w-3 h-3" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] text-foreground font-medium">{entry.field}</span>
                                                <span className="text-[10px] text-muted-foreground ml-1.5">— {entry.action}</span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground shrink-0 font-mono">{entry.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Approve Footer */}
                        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-medium text-foreground">
                                            {Object.values(reviewCorrections).filter(v => v !== null).length}/{Object.keys(reviewCorrections).length} items reviewed
                                        </p>
                                        {Object.values(reviewCorrections).every(v => v !== null) && (
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-medium flex items-center gap-0.5"><CheckCircleIcon className="w-3 h-3" /> All reviewed</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Revised total: <span className="text-foreground font-medium">{formatCurrencyShort(discountFinalTotal)}</span> (incl. discounts) · Savings: <span className="text-green-600 dark:text-green-400 font-medium">{formatCurrencyShort(discountTotalAmount)}</span>
                                    </p>
                                    {reviewAuditLog.length > 0 && (
                                        <p className="text-[9px] text-muted-foreground mt-0.5">{reviewAuditLog.length} review actions logged · Expert: Dr. James Wilson</p>
                                    )}
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
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* FLOW 2: Steps 2.1 through 2.6 */}
                {/* ═══════════════════════════════════════════ */}

                {/* Step 2.1 — ACK Intake Pipeline */}
                {currentStep.id === '2.1' && (
                    <div data-demo-target="ack-pipeline-intake" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done', detail: '2 ACKs received' },
                            { id: 'norm', name: 'DataNorm', status: 'pending' },
                            { id: 'ack', name: 'ACKIngestion', status: 'pending' },
                            { id: 'comp', name: 'POvsACK', status: 'pending' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="blue" />

                        {/* ACK Pipeline Kanban */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <h3 className="text-sm font-bold text-foreground">ACK Pipeline — Incoming</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">2 new acknowledgments received from ERPConnector</p>
                            </div>
                            <div className="p-4 grid grid-cols-4 gap-3">
                                {ackStages.map((stage, si) => (
                                    <div key={stage} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stage}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {si === 0 ? (
                                                    (ackArrival21.HAT !== 'hidden' ? 1 : 0) + (ackArrival21.AIS !== 'hidden' ? 1 : 0)
                                                ) : stage === 'Confirmed' ? recentAcknowledgments.filter(a => a.status === 'Confirmed').length
                                                  : stage === 'Discrepancy' ? recentAcknowledgments.filter(a => a.status === 'Discrepancy').length
                                                  : stage === 'Partial' ? recentAcknowledgments.filter(a => a.status === 'Partial').length
                                                  : 0}
                                            </span>
                                        </div>
                                        <div className="min-h-[120px] space-y-2">
                                            {/* New ACK cards in Pending column */}
                                            {si === 0 && ackArrival21.HAT !== 'hidden' && (
                                                <div className={cn(
                                                    'p-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-500/5 transition-all duration-500',
                                                    ackArrival21.HAT === 'appearing' && 'opacity-70 scale-95',
                                                    ackArrival21.HAT === 'placed' && 'opacity-100 scale-100',
                                                )}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">HC</span>
                                                        <span className="text-xs font-bold text-foreground">{ACK_HAT.id}</span>
                                                        <span className="ml-auto px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-[9px] font-bold text-blue-700 dark:text-blue-400">HAT</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">{ACK_HAT.lineItems} lines · {ACK_HAT.total}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{ACK_HAT.project}</p>
                                                </div>
                                            )}
                                            {si === 0 && ackArrival21.AIS !== 'hidden' && (
                                                <div className={cn(
                                                    'p-3 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-500/5 transition-all duration-500',
                                                    ackArrival21.AIS === 'appearing' && 'opacity-70 scale-95',
                                                    ackArrival21.AIS === 'placed' && 'opacity-100 scale-100',
                                                )}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">AI</span>
                                                        <span className="text-xs font-bold text-foreground">{ACK_AIS.id}</span>
                                                        <span className="ml-auto px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-[9px] font-bold text-purple-700 dark:text-purple-400">AIS</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">{ACK_AIS.lineItems} lines · {ACK_AIS.total}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{ACK_AIS.project}</p>
                                                </div>
                                            )}
                                            {/* Existing ACK cards in their columns */}
                                            {recentAcknowledgments.filter(a => a.status === stage).map(ack => (
                                                <div key={ack.id} className="p-2.5 rounded-lg border border-border bg-card">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn('w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center', ack.statusColor)}>{ack.initials}</span>
                                                        <span className="text-[10px] font-bold text-foreground">{ack.id}</span>
                                                    </div>
                                                    <p className="text-[9px] text-muted-foreground">{ack.vendor}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2.2 — Normalization & Smart Comparison */}
                {currentStep.id === '2.2' && (
                    <div data-demo-target="ack-dual-normalization" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: ['norm-hat', 'norm-ais'].includes(normPhase22) ? 'running' : (normPhase22 !== 'idle' ? 'done' : 'pending'), detail: normPhase22 === 'norm-hat' ? 'HAT...' : normPhase22 === 'norm-ais' ? 'AIS...' : undefined },
                            { id: 'ack', name: 'ACKIngestion', status: ['comparing-hat', 'hat-ai-rule', 'comparing-ais'].includes(normPhase22) ? 'running' : (['hat-confirmed', 'norm-ais', 'ais-flagged'].includes(normPhase22) ? 'done' : 'pending') },
                            { id: 'comp', name: 'POvsACK', status: normPhase22 === 'ais-flagged' ? 'done' : 'pending', detail: normPhase22 === 'ais-flagged' ? '1 flagged' : undefined },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'pending' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="blue" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* HAT Comparison Card */}
                            <div className={cn(
                                'p-4 rounded-2xl border shadow-sm transition-all duration-500',
                                normPhase22 === 'idle' ? 'border-border bg-card opacity-50' :
                                ['hat-confirmed', 'norm-ais', 'comparing-ais', 'ais-flagged'].includes(normPhase22) ? 'border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-500/5' :
                                'border-blue-300 dark:border-blue-700 bg-card'
                            )}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">HC</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">{ACK_HAT.id} — HAT Contract</h4>
                                        <p className="text-[10px] text-muted-foreground">{ACK_HAT.lineItems} lines · {ACK_HAT.total}</p>
                                    </div>
                                    {['hat-confirmed', 'norm-ais', 'comparing-ais', 'ais-flagged'].includes(normPhase22) && (
                                        <span className="ml-auto px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-[10px] font-bold text-green-700 dark:text-green-400 flex items-center gap-1">
                                            <CheckCircleIcon className="w-3 h-3" /> Confirmed
                                        </span>
                                    )}
                                </div>

                                {normPhase22 !== 'idle' && (
                                    <>
                                        {/* PO vs ACK comparison table */}
                                        <div className="rounded-lg border border-border overflow-hidden mb-3">
                                            <table className="w-full text-[10px]">
                                                <thead>
                                                    <tr className="bg-muted/50">
                                                        <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Line</th>
                                                        <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Part#</th>
                                                        <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">PO</th>
                                                        <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">ACK</th>
                                                        <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {HAT_COMPARISON_LINES.map(ln => (
                                                        <tr key={ln.line} className={ln.line === 1 ? 'bg-amber-50/50 dark:bg-amber-500/5' : 'bg-amber-50/50 dark:bg-amber-500/5'}>
                                                            <td className="px-2 py-1.5 font-mono">{ln.line}</td>
                                                            <td className="px-2 py-1.5 font-bold text-foreground">{ln.partPO}</td>
                                                            <td className="px-2 py-1.5 text-muted-foreground">{ln.line === 1 ? ln.colorPO : ln.descPO}</td>
                                                            <td className="px-2 py-1.5">
                                                                <span className="text-amber-700 dark:text-amber-400 font-medium">{ln.line === 1 ? ln.colorACK : ln.descACK}</span>
                                                            </td>
                                                            <td className="px-2 py-1.5">
                                                                {['hat-ai-rule', 'hat-confirmed', 'norm-ais', 'comparing-ais', 'ais-flagged'].includes(normPhase22) ? (
                                                                    <span className="text-green-600 dark:text-green-400 font-bold">✓ OK</span>
                                                                ) : (
                                                                    <span className="text-amber-600 dark:text-amber-400 font-bold">Mismatch</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* AI Training Badge */}
                                        {['hat-ai-rule', 'hat-confirmed', 'norm-ais', 'comparing-ais', 'ais-flagged'].includes(normPhase22) && (
                                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 animate-in fade-in duration-300">
                                                <div className="flex items-start gap-2">
                                                    <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">AI Vendor Rule: HAT Contract</p>
                                                        <p className="text-[10px] text-indigo-600 dark:text-indigo-300 mt-0.5">Part number match is sufficient per client directive. Color and description variations accepted.</p>
                                                    </div>
                                                    <ConfidenceScoreBadge score={99} label="Match" size="sm" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* AIS Comparison Card */}
                            <div className={cn(
                                'p-4 rounded-2xl border shadow-sm transition-all duration-500',
                                ['idle', 'norm-hat', 'comparing-hat', 'hat-ai-rule', 'hat-confirmed'].includes(normPhase22) ? 'border-border bg-card opacity-50' :
                                normPhase22 === 'ais-flagged' ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-500/5' :
                                'border-purple-300 dark:border-purple-700 bg-card'
                            )}>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">AI</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground">{ACK_AIS.id} — AIS</h4>
                                        <p className="text-[10px] text-muted-foreground">{ACK_AIS.lineItems} lines · {ACK_AIS.total}</p>
                                    </div>
                                    {normPhase22 === 'ais-flagged' && (
                                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-[10px] font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                                            <ExclamationTriangleIcon className="w-3 h-3" /> Discrepancy
                                        </span>
                                    )}
                                </div>

                                {['norm-ais', 'comparing-ais', 'ais-flagged'].includes(normPhase22) && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="px-3 py-2 rounded-lg bg-muted/50 flex items-center justify-between">
                                                <span className="text-[10px] text-foreground">Scanning {ACK_AIS.lineItems} line items...</span>
                                                {normPhase22 === 'comparing-ais' && <span className="text-[10px] text-blue-600 dark:text-blue-400 animate-pulse">Comparing...</span>}
                                                {normPhase22 === 'ais-flagged' && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">3 discrepancies found</span>}
                                            </div>
                                            {normPhase22 === 'ais-flagged' && (
                                                <div className="p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-500/5 animate-in fade-in duration-300">
                                                    <p className="text-[10px] font-bold text-red-700 dark:text-red-400 mb-1">Line 41: Grommet Configuration Error</p>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                        <div><span className="text-muted-foreground">PO spec:</span> <span className="font-medium text-foreground">No Grommet</span></div>
                                                        <div><span className="text-muted-foreground">ACK:</span> <span className="font-medium text-red-600 dark:text-red-400">Grommet Option C - Left Rear Corner #2</span></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2.3 — AIS ACK Delta Engine */}
                {currentStep.id === '2.3' && (
                    <div data-demo-target="ack-delta-results" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngestion', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done', detail: '3 exceptions' },
                            { id: 'discrep', name: 'DiscrepResolver', status: deltaPhase23 === 'complete' ? 'done' : 'running', detail: deltaPhase23 === 'complete' ? '2 auto, 1 escalated' : 'analyzing...' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="blue" />

                        <div className="space-y-3">
                            {/* Grommet Config Error */}
                            {['grommet-found', 'grommet-fixed', 'dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) && (
                                <div className={cn(
                                    'p-4 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-left-4 duration-300',
                                    ['grommet-fixed', 'dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-500/5' : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-500/5'
                                )}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={cn('p-2 rounded-xl', ['grommet-fixed', 'dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) ? 'bg-green-100 dark:bg-green-500/15' : 'bg-red-100 dark:bg-red-500/15')}>
                                            {['grommet-fixed', 'dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) ? <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" /> : <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-foreground">Grommet Config Error — Line 41</h4>
                                            <p className="text-[10px] text-muted-foreground">X-DS6030 CB Desk Shell 60x30</p>
                                        </div>
                                        {['grommet-fixed', 'dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) && <ConfidenceScoreBadge score={97} label="Fix" size="sm" />}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-[10px] ml-11">
                                        <div className="p-2 rounded-lg bg-card border border-border">
                                            <span className="text-muted-foreground block">PO Spec:</span>
                                            <span className="font-bold text-foreground">Calibrate Grommet Choice: No Grommet</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-card border border-red-200 dark:border-red-800">
                                            <span className="text-muted-foreground block">ACK Value:</span>
                                            <span className="font-bold text-red-600 dark:text-red-400 line-through">Grommet Option C - Left Rear Corner #2</span>
                                        </div>
                                    </div>
                                    {['grommet-fixed', 'dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) && (
                                        <div className="mt-2 ml-11 flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                                            <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                                            <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Cross-referenced Line 68 (X-DSFM9624) — correct spec is "No Grommet". Auto-corrected ACK line 41.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Date Shifts */}
                            {['dates-found', 'dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) && (
                                <div className={cn(
                                    'p-4 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-left-4 duration-300',
                                    ['dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-500/5' : 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-500/5'
                                )}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={cn('p-2 rounded-xl', ['dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) ? 'bg-green-100 dark:bg-green-500/15' : 'bg-amber-100 dark:bg-amber-500/15')}>
                                            {['dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) ? <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" /> : <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-foreground">Date Shifts — 2 Items</h4>
                                            <p className="text-[10px] text-muted-foreground">Within 21-day guardrail threshold</p>
                                        </div>
                                        {['dates-fixed', 'qty-found', 'complete'].includes(deltaPhase23) && (
                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400">Auto-Accepted</span>
                                        )}
                                    </div>
                                    <div className="ml-11 space-y-1.5 text-[10px]">
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded bg-muted/50">
                                            <span>Line 12: X-W3060 CB Wardrobe</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">+14 days</span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded bg-muted/50">
                                            <span>Line 34: X-BK4818 CB Bookcase</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400">+11 days</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quantity Shortfall */}
                            {['qty-found', 'complete'].includes(deltaPhase23) && (
                                <div className="p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-500/5 shadow-sm animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/15">
                                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-foreground">Quantity Shortfall — 3 Items</h4>
                                            <p className="text-[10px] text-muted-foreground">Exceeds auto-fix threshold → Expert must review</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-[10px] font-bold text-amber-700 dark:text-amber-400">Escalated</span>
                                    </div>
                                    <div className="ml-11 space-y-1.5 text-[10px]">
                                        {[
                                            { line: 23, sku: 'X-P2460', ordered: 8, acked: 6 },
                                            { line: 34, sku: 'X-BK4818', ordered: 5, acked: 5 },
                                            { line: 47, sku: 'X-QUADALDR', ordered: 4, acked: 2 },
                                        ].filter(l => l.ordered !== l.acked).map(l => (
                                            <div key={l.line} className="flex items-center justify-between px-3 py-1.5 rounded bg-muted/50">
                                                <span>Line {l.line}: {l.sku}</span>
                                                <span><span className="text-muted-foreground">Ordered: {l.ordered}</span> → <span className="font-bold text-amber-600 dark:text-amber-400">ACK: {l.acked}</span></span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Generate Backorder button — inside qty shortfall card */}
                                    {deltaPhase23 === 'complete' && (
                                        <div className="mt-3 ml-11 flex items-center gap-3 animate-in fade-in duration-300">
                                            <button
                                                onClick={() => { setBackorderTriggered23(true); setTimeout(() => nextStep(), 1500); }}
                                                disabled={backorderTriggered23}
                                                className={cn(
                                                    'px-4 py-2 text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all',
                                                    backorderTriggered23 ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground hover:scale-[1.02]'
                                                )}
                                            >
                                                {backorderTriggered23 ? (
                                                    <><CheckCircleIcon className="w-4 h-4" /> Backorder Initiated</>
                                                ) : (
                                                    <><PlusIcon className="w-4 h-4" /> Generate Backorder</>
                                                )}
                                            </button>
                                            {backorderTriggered23 && (
                                                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium animate-pulse">Creating BO-1064B...</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Summary Banner */}
                            {deltaPhase23 === 'complete' && (
                                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-3 animate-in fade-in duration-300">
                                    <SparklesIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">3 discrepancies analyzed: 2 auto-resolved (grommet corrected, dates accepted), 1 requires expert action (quantity shortfall).</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2.4 — Expert Review (50 Line Items) */}
                {currentStep.id === '2.4' && (
                    <div data-demo-target="expert-ack-review" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngestion', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done', detail: '3 exceptions' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'done', detail: '2 auto, 1 escalated' },
                            { id: 'bo', name: 'Backorder', status: 'pending' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* ACK Summary Header */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">AI</span>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">ACK-7842 — Expert Review</h3>
                                            <p className="text-[10px] text-muted-foreground">{ACK_AIS.vendorFull} · {ACK_AIS.project}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 rounded-lg bg-muted text-[10px] font-bold text-foreground">{ACK_AIS.lineItems} lines</span>
                                        <span className="px-2 py-1 rounded-lg bg-muted text-[10px] font-bold text-foreground">{ACK_AIS.total}</span>
                                    </div>
                                </div>
                                {/* Resolution status badges */}
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-[9px] font-bold text-green-700 dark:text-green-400">✓ Grommet corrected</span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-[9px] font-bold text-green-700 dark:text-green-400">✓ Dates accepted</span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-[9px] font-bold text-amber-700 dark:text-amber-400">⚠ Qty shortfall</span>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Line</th>
                                            <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">SKU</th>
                                            <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Description</th>
                                            <th className="text-center px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Qty</th>
                                            <th className="text-center px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">ACK Qty</th>
                                            <th className="text-right px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Price</th>
                                            <th className="text-center px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {ACK_LINE_ITEMS_50.map(item => (
                                            <tr key={item.line} className={cn(
                                                'transition-colors',
                                                item.status === 'grommet-error' && 'bg-green-50/50 dark:bg-green-500/5',
                                                item.status === 'qty-short' && 'bg-amber-50/50 dark:bg-amber-500/5',
                                                item.status === 'date-shift' && 'bg-blue-50/50 dark:bg-blue-500/5',
                                            )}>
                                                <td className="px-3 py-2 font-mono text-muted-foreground">{item.line}</td>
                                                <td className="px-3 py-2 font-bold text-foreground">{item.sku}</td>
                                                <td className="px-3 py-2 text-foreground">{item.desc}</td>
                                                <td className="px-3 py-2 text-center">{item.qty}</td>
                                                <td className={cn('px-3 py-2 text-center font-bold', item.status === 'qty-short' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>{item.qtyAck}</td>
                                                <td className="px-3 py-2 text-right text-muted-foreground">{item.price}</td>
                                                <td className="px-3 py-2 text-center">
                                                    {item.status === 'match' && <span className="text-green-600 dark:text-green-400 font-bold">✓</span>}
                                                    {item.status === 'grommet-error' && <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-500/20 text-[9px] font-bold text-green-700 dark:text-green-400">AI Fixed</span>}
                                                    {item.status === 'date-shift' && <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-[9px] font-bold text-blue-700 dark:text-blue-400">{item.dateShift}</span>}
                                                    {item.status === 'qty-short' && <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-[9px] font-bold text-amber-700 dark:text-amber-400">-{item.shortfall}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-3 py-2 bg-muted/30 border-t border-border text-[10px] text-muted-foreground">
                                Showing 8 of {ACK_AIS.lineItems} line items (flagged items highlighted)
                            </div>
                        </div>

                        {/* Backorder initiated badge */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-green-700 dark:text-green-400">Backorder BO-1064B Initiated</p>
                                <p className="text-[10px] text-green-600 dark:text-green-500">3 SKUs, 6 units — awaiting approval chain</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2.5 — Backorder & Approval Chain */}
                {currentStep.id === '2.5' && (
                    <div data-demo-target="backorder-approval-chain" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngestion', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'done' },
                            { id: 'bo', name: 'Backorder', status: boPhase25 === 'generating' ? 'running' : 'done', detail: boPhase25 !== 'generating' ? 'BO-1064B' : 'creating...' },
                            { id: 'approval', name: 'ApprovalOrch', status: boPhase25 === 'complete' ? 'done' : (boPhase25 === 'approval' ? 'running' : 'pending'), detail: boPhase25 === 'approval' ? `${approvedCount25}/3` : undefined },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* Backorder Card */}
                        <div className={cn('p-4 rounded-2xl border shadow-sm transition-all duration-500', boPhase25 === 'generating' ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-500/5' : 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-500/5')}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn('p-2 rounded-xl', boPhase25 === 'generating' ? 'bg-blue-100 dark:bg-blue-500/15' : 'bg-green-100 dark:bg-green-500/15')}>
                                    {boPhase25 === 'generating' ? <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" /> : <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Backorder BO-1064B</h4>
                                    <p className="text-[10px] text-muted-foreground">3 SKUs · 6 units · From ACK-7842</p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-border overflow-hidden">
                                <table className="w-full text-[10px]">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="text-left px-3 py-1.5 font-bold text-muted-foreground">SKU</th>
                                            <th className="text-left px-3 py-1.5 font-bold text-muted-foreground">Description</th>
                                            <th className="text-center px-3 py-1.5 font-bold text-muted-foreground">Qty</th>
                                            <th className="text-left px-3 py-1.5 font-bold text-muted-foreground">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {FLOW2_BACKORDER_LINES.map(ln => (
                                            <tr key={ln.sku}>
                                                <td className="px-3 py-1.5 font-bold text-foreground">{ln.sku}</td>
                                                <td className="px-3 py-1.5 text-foreground">{ln.desc}</td>
                                                <td className="px-3 py-1.5 text-center font-bold text-amber-600 dark:text-amber-400">{ln.qtyBackorder}</td>
                                                <td className="px-3 py-1.5 text-muted-foreground">{ln.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Approval Chain */}
                        {['approval', 'complete'].includes(boPhase25) && (
                            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="p-4 border-b border-border">
                                    <h3 className="text-sm font-bold text-foreground">Approval Chain — Backorder BO-1064B</h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-0 relative">
                                        {[
                                            { name: 'System Policy Engine', role: 'Auto-approval' },
                                            { name: 'Sarah Chen', role: 'Regional Sales Manager' },
                                            { name: 'David Park', role: 'Finance Director' },
                                        ].map((approver, i) => (
                                            <div key={i} className="flex items-start gap-4 relative pb-5 last:pb-0">
                                                {i < 2 && (
                                                    <div className={cn('absolute left-[15px] top-8 w-0.5 h-[calc(100%-16px)]', approvalStates25[i] === 'approved' ? 'bg-green-500' : 'bg-border')} />
                                                )}
                                                <div className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500',
                                                    approvalStates25[i] === 'approved' && 'bg-green-500 text-white',
                                                    approvalStates25[i] === 'pending' && i === approvedCount25 && 'bg-amber-500 text-white animate-pulse',
                                                    approvalStates25[i] === 'pending' && i !== approvedCount25 && 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400',
                                                )}>
                                                    {approvalStates25[i] === 'approved' ? <CheckCircleIcon className="w-5 h-5" /> : i === approvedCount25 ? <ClockIcon className="w-5 h-5" /> : <span className="w-2 h-2 rounded-full bg-zinc-500 dark:bg-zinc-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className={cn('text-sm font-bold', approvalStates25[i] === 'approved' && 'text-green-700 dark:text-green-400', approvalStates25[i] === 'pending' && i === approvedCount25 && 'text-amber-700 dark:text-amber-400', approvalStates25[i] === 'pending' && i !== approvedCount25 && 'text-muted-foreground')}>{approver.name}</span>
                                                        {approvalStates25[i] === 'approved' && <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Approved</span>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{approver.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Progress bar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                                            <span className="text-[10px] font-bold text-foreground">{approvedCount25}/3</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                            <div className={cn('h-full rounded-full transition-all duration-500', approvedCount25 === 3 ? 'bg-green-500' : 'bg-primary')} style={{ width: `${(approvedCount25 / 3) * 100}%` }} />
                                        </div>
                                    </div>
                                    {approvedCount25 === 3 && (
                                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 text-center animate-in fade-in zoom-in duration-300">
                                            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                                            <p className="text-xs font-bold text-green-700 dark:text-green-400">All Approvals Complete</p>
                                            <p className="text-[10px] text-green-600 dark:text-green-500">Backorder BO-1064B approved for processing</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2.6 — Pipeline Resolution */}
                {currentStep.id === '2.6' && (
                    <div data-demo-target="ack-pipeline-resolved" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'erp', name: 'ERPConnector', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'ack', name: 'ACKIngestion', status: 'done' },
                            { id: 'comp', name: 'POvsACK', status: 'done' },
                            { id: 'discrep', name: 'DiscrepResolver', status: 'done' },
                            { id: 'bo', name: 'Backorder', status: 'done', detail: 'BO-1064B' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'done', detail: '3/3' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* Success Banner */}
                        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-green-700 dark:text-green-400">Both ACKs Resolved</p>
                                    <p className="text-xs text-green-600 dark:text-green-500">HAT: 5 lines confirmed (AI vendor rule) · AIS: 50 lines, 3 exceptions resolved, backorder BO-1064B approved</p>
                                </div>
                            </div>
                        </div>

                        {/* Pipeline Kanban */}
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border">
                                <h3 className="text-sm font-bold text-foreground">ACK Pipeline — Resolved</h3>
                            </div>
                            <div className="p-4 grid grid-cols-4 gap-3">
                                {ackStages.map((stage) => (
                                    <div key={stage} className="space-y-2">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stage}</span>
                                        <div className="min-h-[100px] space-y-2">
                                            {/* HAT in Confirmed */}
                                            {stage === 'Confirmed' && resolvedCards26.HAT !== 'hidden' && (
                                                <div className={cn(
                                                    'p-3 rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-500/5 transition-all duration-500',
                                                    resolvedCards26.HAT === 'appearing' && 'opacity-70 scale-95',
                                                    resolvedCards26.HAT === 'placed' && 'opacity-100 scale-100',
                                                )}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">HC</span>
                                                        <span className="text-xs font-bold text-foreground">{ACK_HAT.id}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">HAT · {ACK_HAT.lineItems} lines</p>
                                                    <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">AI vendor rule applied</span>
                                                </div>
                                            )}
                                            {/* AIS in Partial */}
                                            {stage === 'Partial' && resolvedCards26.AIS !== 'hidden' && (
                                                <div className={cn(
                                                    'p-3 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-500/5 transition-all duration-500',
                                                    resolvedCards26.AIS === 'appearing' && 'opacity-70 scale-95',
                                                    resolvedCards26.AIS === 'placed' && 'opacity-100 scale-100',
                                                )}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">AI</span>
                                                        <span className="text-xs font-bold text-foreground">{ACK_AIS.id}</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">AIS · {ACK_AIS.lineItems} lines</p>
                                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-[8px] font-bold text-amber-700 dark:text-amber-400">Backorder BO-1064B</span>
                                                </div>
                                            )}
                                            {/* Existing ACK cards */}
                                            {recentAcknowledgments.filter(a => a.status === stage).map(ack => (
                                                <div key={ack.id} className="p-2.5 rounded-lg border border-border bg-card">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={cn('w-5 h-5 rounded-full text-[8px] font-bold flex items-center justify-center', ack.statusColor)}>{ack.initials}</span>
                                                        <span className="text-[10px] font-bold text-foreground">{ack.id}</span>
                                                    </div>
                                                    <p className="text-[9px] text-muted-foreground">{ack.vendor}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Send Notifications Button */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">NotificationAgent ready — persona-aware digests for both ACKs</span>
                            </div>
                            <button
                                onClick={() => nextStep()}
                                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-sm hover:scale-[1.02] transition-transform flex items-center gap-2"
                            >
                                Send Notifications
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1.6 — Quote Approval Chain (System auto → Sarah pending → auto-advance) */}
                {currentStep.id === '1.6' && (
                    <div data-demo-target="approval-chain-progress" className="space-y-4">
                        <AgentPipelineStrip agents={[
                            { id: 'email', name: 'EmailIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR/Parser', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'valid', name: 'Validator', status: 'done' },
                            { id: 'quote', name: 'QuoteBuilder', status: 'done', detail: 'QT-1025' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'running', detail: `${approvedCount16}/2` },
                            { id: 'po', name: 'POBuilder', status: 'pending' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="purple" />

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
                                    <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <div className="text-xs text-indigo-700 dark:text-indigo-300">
                                        <span className="font-bold">ApprovalOrchestratorAgent:</span> Routing to 2-level approval chain — automated compliance check first, then manager sign-off for quote value bracket ($100k-$250k).
                                    </div>
                                </div>

                                <div className="space-y-0">
                                    {[
                                        { name: 'System Policy Engine', role: 'Automated Compliance Check', reason: 'Pricing + discount + policy validation', level: 'Level 1' },
                                        { name: 'Sarah Chen', role: 'Regional Sales Manager', reason: 'Quote value > $100k', level: 'Level 2' },
                                    ].map((approver, i) => (
                                        <div key={i}>
                                            {i > 0 && <div className="ml-5 h-6 border-l-2 border-dashed border-border" />}
                                            <div className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                                                approvalStates16[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === approvedCount16
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            }`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                                                    approvalStates16[i] === 'approved' ? 'bg-emerald-500 text-white' : i === approvedCount16 ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {approvalStates16[i] === 'approved' ? <CheckIcon className="w-5 h-5" /> : i === approvedCount16 ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ClockIcon className="w-4 h-4" />}
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
                                            {approvedCount16 === 0 ? 'System Policy Engine running compliance check...' : 'Awaiting manager approval — notification sent to Sarah Chen'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1.8 — PO Generation & Order Approval (fully automated) */}
                {currentStep.id === '1.8' && (
                    <div data-demo-target="po-order-approval" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'email', name: 'EmailIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR/Parser', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'valid', name: 'Validator', status: 'done' },
                            { id: 'quote', name: 'QuoteBuilder', status: 'done', detail: 'QT-1025' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'done', detail: '2/2 approved' },
                            { id: 'po', name: 'POBuilder', status: poGenPhase18 === 'complete' ? 'done' : ['po-generating', 'po-complete'].includes(phase18) || phase18 === 'po-generating' ? 'running' : 'pending', detail: poGenPhase18 === 'complete' ? 'PO-1029' : phase18 === 'po-generating' ? 'Generating...' : '' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* Quote Approval Complete */}
                        <div className="bg-card border border-emerald-200 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 flex items-center gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Quote Approval Chain — Complete</p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">QT-1025 approved by System Policy Engine + Sarah Chen</p>
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-6">
                                {[
                                    { name: 'System Policy Engine', status: 'Auto-Approved' },
                                    { name: 'Sarah Chen', status: 'Approved' },
                                ].map((a, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center"><CheckIcon className="w-3.5 h-3.5" /></div>
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
                                            <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-500 ${
                                                orderApprovalStates18[i] === 'approved'
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                                                    : i === orderApprovedCount18
                                                        ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 animate-pulse'
                                                        : 'bg-muted/30 border border-border/50'
                                            }`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                                                    orderApprovalStates18[i] === 'approved' ? 'bg-emerald-500 text-white' : i === orderApprovedCount18 ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {orderApprovalStates18[i] === 'approved' ? <CheckIcon className="w-4 h-4" /> : i === orderApprovedCount18 ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ClockIcon className="w-3.5 h-3.5" />}
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
                                {phase18 === 'order-complete' || phase18 === 'done' ? (
                                    <div className="px-5 pb-4">
                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
                                            <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Order PO-1029 Fully Approved</p>
                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">All 3 approval levels complete — order entering production pipeline</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1.10 — Pipeline View with animated order card */}
                {currentStep.id === '1.10' && (
                    <div data-demo-target="order-pipeline-view" className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AgentPipelineStrip agents={[
                            { id: 'email', name: 'EmailIntake', status: 'done' },
                            { id: 'ocr', name: 'OCR/Parser', status: 'done' },
                            { id: 'norm', name: 'DataNorm', status: 'done' },
                            { id: 'valid', name: 'Validator', status: 'done' },
                            { id: 'quote', name: 'QuoteBuilder', status: 'done', detail: 'QT-1025' },
                            { id: 'approval', name: 'ApprovalOrch', status: 'done', detail: '2/2' },
                            { id: 'po', name: 'POBuilder', status: 'done', detail: 'PO-1029' },
                            { id: 'notif', name: 'Notification', status: 'pending' },
                        ]} accentColor="green" />

                        {/* Notification toast */}
                        {pipelineNotifShown19 && (
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-green-700 dark:text-green-300">Order #ORD-2056 Created from PO-1029</p>
                                    <p className="text-[10px] text-green-600 dark:text-green-400">Apex Furniture — $134,256 — Automatically added to pipeline</p>
                                </div>
                            </div>
                        )}

                        {/* Pipeline columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-2 min-h-[500px]">
                            {pipelineStages.map((stage) => {
                                const stageOrders = recentOrders.filter(item => item.status === stage);
                                const showNewCard = (stage === 'Order Received' && cardAnimationStage19 !== 'hidden');
                                return (
                                    <div key={stage} className="flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{stage}</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-muted-foreground ring-1 ring-inset ring-black/5">
                                                    {stageOrders.length + (showNewCard ? 1 : 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl p-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-3">
                                            {/* New animated card */}
                                            {showNewCard && (
                                                <div className={cn(
                                                    "bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-md border-2 transition-all duration-700",
                                                    cardAnimationStage19 === 'appearing' ? 'border-brand-500 ring-2 ring-brand-500/20 animate-in fade-in zoom-in duration-500' :
                                                    cardAnimationStage19 === 'arrived' ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-brand-500/50 opacity-0'
                                                )}>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-[8px] font-bold uppercase">New</span>
                                                        <span className="text-[10px] font-bold text-foreground font-black tracking-tight">#ORD-2056</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-foreground leading-tight italic">Apex Furniture</h4>
                                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">New HQ RFQ</p>
                                                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <MapPinIcon className="w-3 h-3" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight italic">Austin</span>
                                                        </div>
                                                        <div className="text-[10px] font-black text-brand-600 dark:text-brand-400">$134,256</div>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Existing orders */}
                                            {stageOrders.map((item) => (
                                                <div key={item.id} className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all cursor-move">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[8px] ring-1 ring-inset ring-black/5 uppercase shadow-sm font-black", item.statusColor.replace('bg-', 'text-').replace('text-', 'bg-'))}>
                                                            {item.initials}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-foreground font-black tracking-tight">{item.id}</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-foreground leading-tight italic line-clamp-1">{item.customer}</h4>
                                                    <p className="text-[10px] text-muted-foreground mt-1 font-medium capitalize truncate">{item.project}</p>
                                                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <MapPinIcon className="w-3 h-3" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight italic">{item.location}</span>
                                                        </div>
                                                        <div className="text-[10px] font-black text-brand-600 dark:text-brand-400">{item.amount}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {stageOrders.length === 0 && !showNewCard && (
                                                <div className="h-24 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl opacity-40">
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">No items</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CTA */}
                        {cardAnimationStage19 === 'arrived' && (
                            <div className="flex items-center gap-3">
                                <button onClick={nextStep} className="px-5 py-2.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-sm flex items-center gap-2">
                                    Send Notifications <ArrowRightIcon className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                                    <SparklesIcon className="w-3 h-3" />
                                    NotificationAgent will deliver persona-aware digests
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Hide table/pipeline when expert review panel or demo steps are active */}
                {!(currentStep.id === '1.5' && showExpertReview) && !['1.6', '1.8', '1.10', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6'].includes(currentStep.id) && (viewMode === 'list' ? (
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
