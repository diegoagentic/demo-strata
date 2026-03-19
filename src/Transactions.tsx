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
    FunnelIcon, ArrowRightIcon, SparklesIcon, CheckBadgeIcon, ArrowDownTrayIcon, ArrowsRightLeftIcon, DocumentMagnifyingGlassIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useState, useMemo, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

import { useTheme } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Select from './components/Select'
import CreateOrderModal from './components/CreateOrderModal'
import SmartQuoteHub from './components/widgets/SmartQuoteHub'
import BatchAckModal from './components/BatchAckModal'
import Breadcrumbs from './components/Breadcrumbs'
import PEDExportModal, { getMockPEDData, type PEDData, type PEDDocumentType } from './components/PEDExportModal'
import DocumentConversionModal from './components/DocumentConversionModal'
import AckReconciliationModal from './components/AckReconciliationModal'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useDemo } from './context/DemoContext'
import { useDemoProfile } from './context/DemoProfileContext'
import { AIAgentAvatar } from './components/simulations/DemoAvatars'
import { CONTINUA_STEP_TIMING } from './config/profiles/continua-demo'
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

// ═══════════════════════════════════════════════════
// CONTINUA STEP 2.2 — Purchase Order Generation
// ═══════════════════════════════════════════════════


type ProcurementPhase = 'idle' | 'notification' | 'expert-question' | 'highlight' | 'lupa-active' | 'done'

// ─── Continua Step 1.5: Consignment & Vendor Returns Constants ──────────────
const CONSIGNMENT_AGENTS = [
    { name: 'ConsignmentTracker', detail: 'Reviewing 35 consignment items across 4 manufacturers...' },
    { name: 'WindowAnalyzer', detail: '12 items approaching 90-day return window...' },
    { name: 'RMAGenerator', detail: 'Auto-generating RMA for 4 confirmed returns...' },
    { name: 'DemandAnalyzer', detail: 'Analyzing demand trends — 4 items trending up 12%...' },
    { name: 'DecisionRouter', detail: 'Routing recommendations: return vs convert-to-purchase...' },
]
const CONSIGNMENT_ITEMS = [
    { name: 'Aeron Chair (Mineral)', manufacturer: 'MillerKnoll', daysLeft: 8, qty: 4, value: '$3,580', decision: 'return' as const, reason: 'Low demand, surplus stock' },
    { name: 'Embody Chair (Black)', manufacturer: 'MillerKnoll', daysLeft: 12, qty: 2, value: '$3,190', decision: 'return' as const, reason: 'Duplicate allocation' },
    { name: 'Cosm Chair (Glacier)', manufacturer: 'MillerKnoll', daysLeft: 18, qty: 1, value: '$1,295', decision: 'return' as const, reason: 'Color mismatch for project' },
    { name: 'Sayl Chair (Fog)', manufacturer: 'MillerKnoll', daysLeft: 22, qty: 1, value: '$695', decision: 'return' as const, reason: 'Superseded by spec change' },
    { name: 'Gesture Chair (Graphite)', manufacturer: 'Steelcase', daysLeft: 15, qty: 2, value: '$2,190', decision: 'purchase' as const, reason: 'Demand trending up 18%' },
    { name: 'Think Chair (Licorice)', manufacturer: 'Steelcase', daysLeft: 25, qty: 1, value: '$1,095', decision: 'purchase' as const, reason: 'Spec match for UAL phase 3' },
    { name: 'Diffrient World', manufacturer: 'Humanscale', daysLeft: 30, qty: 3, value: '$2,685', decision: 'purchase' as const, reason: 'Demand up 12%, pipeline match' },
    { name: 'Freedom Chair (Graphite)', manufacturer: 'Humanscale', daysLeft: 45, qty: 1, value: '$1,295', decision: 'purchase' as const, reason: 'Client request — UAL exec suite' },
]
type ConsignmentPhase = 'idle' | 'notification' | 'processing' | 'breathing' | 'revealed' | 'results'

// ─── Projects Tab: Orders nested by project ────────────────────────────────────
const DEMO_PROJECTS = [
    {
        id: 'PRJ-2026-001',
        name: 'United Airlines HQ — 8 Floor Buildout',
        client: 'United Airlines',
        pm: 'Sarah Mitchell',
        fm: 'Carlos Rivera',
        status: 'In Progress' as const,
        totalBudget: '$3.2M',
        spent: '$2.1M',
        completion: 65,
        orders: [
            { id: 'PO-HQ-001', supplier: 'MillerKnoll', amount: '$2.8M', status: 'In Production', deliveryDate: 'Mar 15', progress: 70 },
            { id: 'PO-HQ-002', supplier: 'DIRTT Environmental', amount: '$120K', status: 'Awaiting ACK', deliveryDate: 'Apr 20', progress: 15 },
            { id: 'PO-HQ-003', supplier: 'AV Integration Partners', amount: '$280K', status: 'Shipped', deliveryDate: 'Feb 28', progress: 90 },
        ],
        milestones: [
            { name: 'Floors 1-2 Furniture', date: 'Mar 1', status: 'completed' as const },
            { name: 'Floors 3-4 Delivery', date: 'Mar 15', status: 'in-progress' as const },
            { name: 'AV Integration', date: 'Apr 1', status: 'pending' as const },
            { name: 'Final Punch List', date: 'Apr 15', status: 'pending' as const },
        ],
        fmActions: [
            { action: 'Approve furniture relocation — Floor 3', priority: 'high' as const },
            { action: 'Review space allocation changes', priority: 'medium' as const },
            { action: 'Schedule existing AV maintenance', priority: 'low' as const },
        ]
    },
    {
        id: 'PRJ-2026-002',
        name: 'Apex Furniture — New HQ Fitout',
        client: 'Apex Furniture',
        pm: 'Diego Morales',
        fm: 'Carlos Rivera',
        status: 'Planning' as const,
        totalBudget: '$540K',
        spent: '$43K',
        completion: 8,
        orders: [
            { id: 'QT-1025', supplier: 'Multiple', amount: '$43.7K', status: 'Quote Negotiating', deliveryDate: 'TBD', progress: 0 },
        ],
        milestones: [
            { name: 'Design Approval', date: 'Feb 15', status: 'completed' as const },
            { name: 'Quote Finalization', date: 'Feb 28', status: 'in-progress' as const },
        ],
        fmActions: []
    },
    {
        id: 'PRJ-2026-003',
        name: 'BioLife Inc — Lab Expansion',
        client: 'BioLife Inc',
        pm: 'Sarah Mitchell',
        fm: 'Carlos Rivera',
        status: 'In Progress' as const,
        totalBudget: '$890K',
        spent: '$210K',
        completion: 24,
        orders: [
            { id: 'PO-BL-001', supplier: 'Steelcase', amount: '$340K', status: 'In Production', deliveryDate: 'Mar 20', progress: 45 },
            { id: 'PO-BL-002', supplier: 'Humanscale', amount: '$95K', status: 'Ready to Ship', deliveryDate: 'Mar 5', progress: 85 },
        ],
        milestones: [
            { name: 'Lab Furniture Order', date: 'Feb 1', status: 'completed' as const },
            { name: 'Office Furniture Delivery', date: 'Mar 20', status: 'in-progress' as const },
            { name: 'Installation', date: 'Apr 10', status: 'pending' as const },
        ],
        fmActions: [
            { action: 'Coordinate lab equipment relocation', priority: 'high' as const },
        ]
    }
]

const inventoryData = [
    { name: 'Seating', value: 78, amt: 480 },
    { name: 'Tables', value: 62, amt: 300 },
    { name: 'Storage', value: 45, amt: 340 },
]

const salesDataByPeriod: Record<string, { name: string; sales: number }[]> = {
    Day: [
        { name: '8AM', sales: 800 }, { name: '10AM', sales: 1200 }, { name: '12PM', sales: 950 },
        { name: '2PM', sales: 1800 }, { name: '4PM', sales: 1400 }, { name: '6PM', sales: 600 },
    ],
    Week: [
        { name: 'Mon', sales: 3200 }, { name: 'Tue', sales: 2800 }, { name: 'Wed', sales: 4100 },
        { name: 'Thu', sales: 3600 }, { name: 'Fri', sales: 2900 },
    ],
    Month: [
        { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 2000 },
        { name: 'Apr', sales: 2780 }, { name: 'May', sales: 1890 }, { name: 'Jun', sales: 2390 },
    ],
    Quarter: [
        { name: 'Q1 2025', sales: 9000 }, { name: 'Q2 2025', sales: 7070 },
        { name: 'Q3 2025', sales: 8200 }, { name: 'Q4 2025', sales: 11400 },
    ],
};
const salesData = salesDataByPeriod.Month;

const metricsByPeriod: Record<string, { revenueTrend: string; revenueTrendUp: boolean; activeTrend: string; activeTrendUp: boolean; efficiencyTrend: string; efficiencyTrendUp: boolean; projectTrend: string; projectTrendUp: boolean }> = {
    Day:     { revenueTrend: '+$42K', revenueTrendUp: true, activeTrend: '+2', activeTrendUp: true, efficiencyTrend: '+5%', efficiencyTrendUp: true, projectTrend: '0', projectTrendUp: true },
    Week:    { revenueTrend: '+$180K', revenueTrendUp: true, activeTrend: '+5', activeTrendUp: true, efficiencyTrend: '+3%', efficiencyTrendUp: true, projectTrend: '+1', projectTrendUp: true },
    Month:   { revenueTrend: '+$320K', revenueTrendUp: true, activeTrend: '-2', activeTrendUp: false, efficiencyTrend: '+8%', efficiencyTrendUp: true, projectTrend: '+2', projectTrendUp: true },
    Quarter: { revenueTrend: '-$85K', revenueTrendUp: false, activeTrend: '+12', activeTrendUp: true, efficiencyTrend: '-4%', efficiencyTrendUp: false, projectTrend: '+3', projectTrendUp: true },
};

const trendLabels: Record<string, string> = {
    Day: 'Daily Trends', Week: 'Weekly Trends', Month: 'Monthly Trends', Quarter: 'Quarterly Trends',
};

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
    { id: "#ORD-2049", customer: "Coastal Props", client: "Coastal Props", project: "Beach House", amount: "$210,000", status: "In Production", date: "Dec 10, 2025", initials: "CP", statusColor: "bg-indigo-50 text-indigo-700", location: "London" },
    { id: "#ORD-2048", customer: "Valley Homes", client: "Valley Homes", project: "Mountain Retreat", amount: "$95,000", status: "Ready to Ship", date: "Nov 20, 2025", initials: "VH", statusColor: "bg-indigo-50 text-indigo-700", location: "Berlin" },
    { id: "#ORD-2047", customer: "Elite Builders", client: "Elite Builders", project: "Sky V", amount: "$450,000", status: "In Transit", date: "Nov 05, 2025", initials: "EB", statusColor: "bg-amber-50 text-amber-700", location: "New York" },
]

const recentQuotes = [
    { id: "QT-1025", customer: "Apex Furniture", project: "New HQ", amount: "$43,750", status: "Negotiating", date: "Jan 12, 2026", validUntil: "Feb 12, 2026", probability: "High", initials: "AF", statusColor: "bg-indigo-50 text-indigo-700", location: "Austin" },
    { id: "QT-1024", customer: "BioLife Inc", project: "Lab Expansion", amount: "$540,000", status: "Draft", date: "Jan 10, 2026", validUntil: "Draft", probability: "N/A", initials: "BL", statusColor: "bg-zinc-100 text-zinc-700", location: "Boston" },
    { id: "QT-1023", customer: "FinServe Corp", project: "Branch Rollout", amount: "$890,000", status: "Sent", date: "Jan 08, 2026", validUntil: "Feb 08, 2026", probability: "Medium", initials: "FS", statusColor: "bg-blue-50 text-blue-700", location: "New York" },
    { id: "QT-1022", customer: "Redwood School", project: "Classroom Refresh", amount: "$150,000", status: "Approved", date: "Dec 28, 2025", validUntil: "Jan 28, 2026", probability: "Closed", initials: "RS", statusColor: "bg-green-50 text-green-700", location: "Portland" },
]

const recentAcknowledgments = [
    { id: "Acknowledgement-8839", relatedPo: "PO-2026-001", vendor: "Herman Miller", status: "Confirmed", date: "Jan 14, 2026", expShipDate: "Feb 20, 2026", discrepancy: "None", initials: "HM", statusColor: "bg-green-50 text-green-700", location: "Zeeland" },
    { id: "Acknowledgement-8840", relatedPo: "PO-2026-002", vendor: "Steelcase", status: "Discrepancy", date: "Jan 13, 2026", expShipDate: "Pending", discrepancy: "Price Mismatch ($500)", initials: "SC", statusColor: "bg-red-50 text-red-700", location: "Grand Rapids" },
    { id: "Acknowledgement-8841", relatedPo: "PO-2026-003", vendor: "Knoll", status: "Partial", date: "Jan 12, 2026", expShipDate: "Mar 01, 2026", discrepancy: "Backordered Items", initials: "KN", statusColor: "bg-amber-50 text-amber-700", location: "East Greenville" },
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

// Summary Data by Time Period
type TimePeriod = 'Day' | 'Week' | 'Month' | 'Quarter';
type SummaryItem = { label: string; value: string; sub: string; icon: JSX.Element; color: string; trend: string; trendUp: boolean };

const ordersSummaryByPeriod: Record<TimePeriod, Record<string, SummaryItem>> = {
    Day: {
        active_orders: { label: 'Active Orders', value: '12', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+2', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '3', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+1', trendUp: true },
        in_production: { label: 'In Production', value: '5', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '0', trendUp: true },
        ready_to_ship: { label: 'Ready to Ship', value: '4', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+1', trendUp: true },
        total_value: { label: 'Total Value', value: '$420K', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+8%', trendUp: true },
    },
    Week: {
        active_orders: { label: 'Active Orders', value: '47', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+5', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '8', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-2', trendUp: false },
        in_production: { label: 'In Production', value: '19', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '+3', trendUp: true },
        ready_to_ship: { label: 'Ready to Ship', value: '12', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+4', trendUp: true },
        total_value: { label: 'Total Value', value: '$1.9M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+12%', trendUp: true },
    },
    Month: {
        active_orders: { label: 'Active Orders', value: '89', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+14', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '12', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-3', trendUp: false },
        in_production: { label: 'In Production', value: '34', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '+8', trendUp: true },
        ready_to_ship: { label: 'Ready to Ship', value: '23', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+6', trendUp: true },
        total_value: { label: 'Total Value', value: '$3.8M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+15%', trendUp: true },
    },
    Quarter: {
        active_orders: { label: 'Active Orders', value: '234', sub: 'In production/transit', icon: <CubeIcon className="w-5 h-5" />, color: 'blue', trend: '+28', trendUp: true },
        pending_approval: { label: 'Pending Approval', value: '31', sub: 'Awaiting authorization', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+5', trendUp: true },
        in_production: { label: 'In Production', value: '87', sub: 'Manufacturing stage', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'purple', trend: '-4', trendUp: false },
        ready_to_ship: { label: 'Ready to Ship', value: '58', sub: 'Awaiting dispatch', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo', trend: '+12', trendUp: true },
        total_value: { label: 'Total Value', value: '$11.2M', sub: 'Active orders value', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'green', trend: '+22%', trendUp: true },
    },
};

const quotesSummaryByPeriod: Record<TimePeriod, Record<string, SummaryItem>> = {
    Day: {
        open_quotes: { label: 'Open Quotes', value: '3', sub: 'Draft or Sent', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '+1', trendUp: true },
        negotiating: { label: 'Negotiating', value: '1', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '0', trendUp: true },
        approved_ytd: { label: 'Approved', value: '2', sub: 'Today', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+2', trendUp: true },
        win_rate: { label: 'Win Rate', value: '75%', sub: 'vs yesterday', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+7%', trendUp: true },
        pipeline_val: { label: 'Pipeline Val', value: '$180K', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+5%', trendUp: true },
    },
    Week: {
        open_quotes: { label: 'Open Quotes', value: '8', sub: 'Draft or Sent', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '+3', trendUp: true },
        negotiating: { label: 'Negotiating', value: '3', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '+1', trendUp: true },
        approved_ytd: { label: 'Approved', value: '11', sub: 'This week', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+4', trendUp: true },
        win_rate: { label: 'Win Rate', value: '71%', sub: 'vs last week', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+3%', trendUp: true },
        pipeline_val: { label: 'Pipeline Val', value: '$890K', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+11%', trendUp: true },
    },
    Month: {
        open_quotes: { label: 'Open Quotes', value: '14', sub: 'Draft or Sent', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '+6', trendUp: true },
        negotiating: { label: 'Negotiating', value: '5', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '-1', trendUp: false },
        approved_ytd: { label: 'Approved', value: '42', sub: 'This month', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+9', trendUp: true },
        win_rate: { label: 'Win Rate', value: '68%', sub: 'vs last month', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+3%', trendUp: true },
        pipeline_val: { label: 'Pipeline Val', value: '$2.1M', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+18%', trendUp: true },
    },
    Quarter: {
        open_quotes: { label: 'Open Quotes', value: '38', sub: 'Draft or Sent', icon: <DocumentTextIcon className="w-5 h-5" />, color: 'blue', trend: '-2', trendUp: false },
        negotiating: { label: 'Negotiating', value: '12', sub: 'Client review', icon: <UserIcon className="w-5 h-5" />, color: 'orange', trend: '+4', trendUp: true },
        approved_ytd: { label: 'Approved', value: '124', sub: 'This quarter', icon: <CheckIcon className="w-5 h-5" />, color: 'green', trend: '+31', trendUp: true },
        win_rate: { label: 'Win Rate', value: '62%', sub: 'vs last quarter', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '-4%', trendUp: false },
        pipeline_val: { label: 'Pipeline Val', value: '$6.4M', sub: 'Potential revenue', icon: <CurrencyDollarIcon className="w-5 h-5" />, color: 'indigo', trend: '+25%', trendUp: true },
    },
};

const acksSummaryByPeriod: Record<TimePeriod, Record<string, SummaryItem>> = {
    Day: {
        pending_acks: { label: 'Pending Acks', value: '2', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+1', trendUp: true },
        discrepancies: { label: 'Discrepancies', value: '1', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '0', trendUp: true },
        confirmed: { label: 'Confirmed', value: '8', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+3', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '3.8w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '-0.4w', trendUp: true },
        on_time: { label: 'On Time Rate', value: '96%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+2%', trendUp: true },
    },
    Week: {
        pending_acks: { label: 'Pending Acks', value: '5', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-1', trendUp: false },
        discrepancies: { label: 'Discrepancies', value: '2', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '+1', trendUp: true },
        confirmed: { label: 'Confirmed', value: '34', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+8', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '4.0w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '-0.2w', trendUp: true },
        on_time: { label: 'On Time Rate', value: '95%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+1%', trendUp: true },
    },
    Month: {
        pending_acks: { label: 'Pending Acks', value: '8', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '-2', trendUp: false },
        discrepancies: { label: 'Discrepancies', value: '3', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '+1', trendUp: true },
        confirmed: { label: 'Confirmed', value: '156', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+42', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '4.2w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '+0.1w', trendUp: false },
        on_time: { label: 'On Time Rate', value: '94%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '+2%', trendUp: true },
    },
    Quarter: {
        pending_acks: { label: 'Pending Acks', value: '18', sub: 'Awaiting vendor', icon: <ClockIcon className="w-5 h-5" />, color: 'orange', trend: '+6', trendUp: true },
        discrepancies: { label: 'Discrepancies', value: '9', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'red', trend: '+4', trendUp: true },
        confirmed: { label: 'Confirmed', value: '478', sub: 'On track', icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, color: 'green', trend: '+112', trendUp: true },
        avg_lead: { label: 'Avg Lead Time', value: '4.5w', sub: 'Weeks to ship', icon: <CalendarIcon className="w-5 h-5" />, color: 'blue', trend: '+0.3w', trendUp: false },
        on_time: { label: 'On Time Rate', value: '91%', sub: 'Vendor perf.', icon: <ArrowTrendingUpIcon className="w-5 h-5" />, color: 'purple', trend: '-3%', trendUp: false },
    },
};

import AcknowledgementUploadModal from './components/AcknowledgementUploadModal'
import CreateQuoteModal from './components/CreateQuoteModal'

interface TransactionsProps {
    onLogout: () => void;
    onNavigateToDetail: (type: string) => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Transactions({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: TransactionsProps) {
    const { currentStep, nextStep, isDemoActive, setLupaStep, procCompleteStep } = useDemo();
    const { activeProfile } = useDemoProfile()
    const isContinua = activeProfile.id === 'continua'
    const stepId = currentStep?.id || ''

    // ── Continua Step 2.2 Procurement state ──
    const [procPhase, setProcPhase] = useState<ProcurementPhase>('idle')
    const [expertAnswer, setExpertAnswer] = useState<string | null>(null)
    const procPhaseRef = useRef(procPhase)
    useEffect(() => { procPhaseRef.current = procPhase }, [procPhase])

    // Phase orchestration: idle → notification → expert-question → (answer triggers lupa) → highlight → done
    const tp22 = CONTINUA_STEP_TIMING['2.2']
    useEffect(() => {
        if (!isContinua || stepId !== '2.2') { setProcPhase('idle'); return }
        setProcPhase('idle')
        setExpertAnswer(null)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setProcPhase('notification'), tp22.notifDelay))
        timers.push(setTimeout(() => {
            if (procPhaseRef.current === 'notification') setProcPhase('expert-question')
        }, tp22.notifDelay + tp22.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // Expert answer → highlight card first, then trigger lupa
    useEffect(() => {
        if (procPhase !== 'expert-question' || !expertAnswer) return
        const t = setTimeout(() => setProcPhase('highlight'), 1200)
        return () => clearTimeout(t)
    }, [procPhase, expertAnswer])

    // Highlight card → after 1.5s trigger lupa (DemoProcessPanel)
    useEffect(() => {
        if (procPhase !== 'highlight') return
        const t = setTimeout(() => {
            setProcPhase('lupa-active')
            setLupaStep('2.2')
        }, 1500)
        return () => clearTimeout(t)
    }, [procPhase, setLupaStep])

    // procCompleteStep signal from DemoProcessPanel → done with chip
    useEffect(() => {
        if (procCompleteStep !== '2.2' || procPhase === 'done') return
        setProcPhase('done')
    }, [procCompleteStep, procPhase])

    // done → show chip 1.2s → simulate click (scale down) → navigate to order detail
    const [clickSimActive, setClickSimActive] = useState(false)
    useEffect(() => {
        if (procPhase !== 'done' || !isContinua || currentStep?.id !== '2.2') return
        const t1 = setTimeout(() => setClickSimActive(true), 1200)      // flash "click"
        const t2 = setTimeout(() => onNavigateToDetail('order-detail'), 1800) // navigate
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [procPhase, isContinua, currentStep?.id, onNavigateToDetail])

    // ─── Continua Step 2.3: ACK Tracking & Validation ────────────────────────────
    type AckPhase = 'idle' | 'notification' | 'tab-switch' | 'validating' | 'alert' | 'click-sim' | 'navigating'
    const [ackPhase, setAckPhase] = useState<AckPhase>('idle')
    const ackPhaseRef = useRef(ackPhase)
    useEffect(() => { ackPhaseRef.current = ackPhase }, [ackPhase])
    const [ackValidatedCount, setAckValidatedCount] = useState(0)
    const [ackKnollAlert, setAckKnollAlert] = useState(false)
    const [ackClickSim, setAckClickSim] = useState(false)

    // 1.3 phase orchestration: idle → notification → tab-switch → validating → alert → click-sim → navigating
    const tp23 = CONTINUA_STEP_TIMING['2.3']
    useEffect(() => {
        if (!isContinua || stepId !== '2.3') {
            setAckPhase('idle'); setAckValidatedCount(0); setAckKnollAlert(false); setAckClickSim(false)
            return
        }
        setAckPhase('idle'); setAckValidatedCount(0); setAckKnollAlert(false); setAckClickSim(false)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setAckPhase('notification'), tp23.notifDelay))
        timers.push(setTimeout(() => {
            if (ackPhaseRef.current === 'notification') setAckPhase('tab-switch')
        }, tp23.notifDelay + tp23.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // 1.3: tab-switch → auto-switch to ACK tab, then → validating
    useEffect(() => {
        if (ackPhase !== 'tab-switch') return
        setLifecycleTab('acknowledgments')
        setViewMode('pipeline')
        const t = setTimeout(() => setAckPhase('validating'), 800)
        return () => clearTimeout(t)
    }, [ackPhase])

    // 1.3: validating → stagger validated badges, then → alert (Knoll)
    useEffect(() => {
        if (ackPhase !== 'validating') return
        setAckValidatedCount(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        // Validate first 2 ACKs (Herman Miller, Steelcase) — skip Knoll
        for (let i = 0; i < 2; i++) {
            timers.push(setTimeout(() => setAckValidatedCount(i + 1), (i + 1) * tp23.agentStagger))
        }
        // After validations done → Knoll alert
        const alertDelay = 3 * tp23.agentStagger + tp23.breathing
        timers.push(setTimeout(() => {
            setAckKnollAlert(true)
            setAckPhase('alert')
        }, alertDelay))
        return () => timers.forEach(clearTimeout)
    }, [ackPhase])

    // 1.3: alert → hold 2.5s → click-sim
    useEffect(() => {
        if (ackPhase !== 'alert') return
        const t = setTimeout(() => setAckPhase('click-sim'), 2500)
        return () => clearTimeout(t)
    }, [ackPhase])

    // 1.3: click-sim → simulate click on Knoll card → navigate to ack-detail
    useEffect(() => {
        if (ackPhase !== 'click-sim') return
        setAckClickSim(true)
        const t = setTimeout(() => {
            setAckPhase('navigating')
            onNavigateToDetail('ack-detail')
        }, 800)
        return () => clearTimeout(t)
    }, [ackPhase, onNavigateToDetail])

    // ─── Continua Step 1.5: Consignment & Vendor Returns ────────────────────────
    const [csgnPhase, setCsgnPhase] = useState<ConsignmentPhase>('idle')
    const csgnPhaseRef = useRef(csgnPhase)
    useEffect(() => { csgnPhaseRef.current = csgnPhase }, [csgnPhase])
    const [csgnAgents, setCsgnAgents] = useState(CONSIGNMENT_AGENTS.map(a => ({ ...a, visible: false, done: false })))
    const [csgnProgress, setCsgnProgress] = useState(0)

    // Continua 2.5: orchestration
    const tp15 = CONTINUA_STEP_TIMING['1.5']
    useEffect(() => {
        if (!isContinua || stepId !== '1.5') { setCsgnPhase('idle'); return }
        setCsgnPhase('idle')
        setCsgnAgents(CONSIGNMENT_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setCsgnPhase('notification'), tp15.notifDelay))
        timers.push(setTimeout(() => {
            if (csgnPhaseRef.current === 'notification') setCsgnPhase('processing')
        }, tp15.notifDelay + tp15.notifDuration))
        return () => timers.forEach(clearTimeout)
    }, [isContinua, stepId])

    // Continua 2.5: processing → breathing
    useEffect(() => {
        if (csgnPhase !== 'processing') return
        setCsgnAgents(CONSIGNMENT_AGENTS.map(a => ({ ...a, visible: false, done: false })))
        setCsgnProgress(0)
        const timers: ReturnType<typeof setTimeout>[] = []
        timers.push(setTimeout(() => setCsgnProgress(100), 50))
        CONSIGNMENT_AGENTS.forEach((_, i) => {
            timers.push(setTimeout(() => setCsgnAgents(prev => prev.map((a, j) => j === i ? { ...a, visible: true } : a)), i * tp15.agentStagger))
            timers.push(setTimeout(() => setCsgnAgents(prev => prev.map((a, j) => j === i ? { ...a, done: true } : a)), i * tp15.agentStagger + tp15.agentDone))
        })
        timers.push(setTimeout(() => setCsgnPhase('breathing'), CONSIGNMENT_AGENTS.length * tp15.agentStagger + 800))
        return () => timers.forEach(clearTimeout)
    }, [csgnPhase])

    // Continua 2.5: breathing → revealed
    useEffect(() => {
        if (csgnPhase !== 'breathing') return
        const t = setTimeout(() => setCsgnPhase('revealed'), tp15.breathing)
        return () => clearTimeout(t)
    }, [csgnPhase])

    // Continua 2.5: revealed → results
    useEffect(() => {
        if (csgnPhase !== 'revealed') return
        const t = setTimeout(() => setCsgnPhase('results'), 1500)
        return () => clearTimeout(t)
    }, [csgnPhase])

    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
    const [showMetrics, setShowMetrics] = useState(false);
    const [txTimePeriod, setTxTimePeriod] = useState<TimePeriod>('Month');
    const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
    const [isAckModalOpen, setIsAckModalOpen] = useState(false);
    const [isBatchAckOpen, setIsBatchAckOpen] = useState(false);
    const [isQuoteWidgetOpen, setIsQuoteWidgetOpen] = useState(false);
    const [isPEDOpen, setIsPEDOpen] = useState(false);
    const [pedData, setPedData] = useState<PEDData | null>(null);
    const [isConversionOpen, setIsConversionOpen] = useState(false);
    const [conversionMode, setConversionMode] = useState<'quote-to-order' | 'order-to-ack'>('quote-to-order');
    const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);

    const openPEDPreview = (type: PEDDocumentType, id?: string) => {
        setPedData(getMockPEDData(type, id));
        setIsPEDOpen(true);
    };

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
            // Simulate download
            // const element = document.createElement("a");
            // const file = new Blob(["Simulated SIF Content"], {type: 'text/plain'});
            // element.href = URL.createObjectURL(file);
            // element.download = `${type}_Export_${new Date().toISOString().split('T')[0]}.sif`;
            // document.body.appendChild(element); // Required for this to work in FireFox
            // element.click(); 
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
    const [lifecycleTab, setLifecycleTab] = useState<'quotes' | 'orders' | 'acknowledgments' | 'projects'>('orders')
    const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

    useEffect(() => {
        const handleHighlight = (e: CustomEvent) => {
            if (e.detail === 'transactions-orders') {
                setLifecycleTab('orders');
                setActiveTab('active');
                setHighlightedSection('orders');
                setTimeout(() => setHighlightedSection(null), 4000);
            }
        };
        window.addEventListener('demo-highlight', handleHighlight as EventListener);
        return () => window.removeEventListener('demo-highlight', handleHighlight as EventListener);
    }, []);

    const currentDataSet = useMemo(() => {
        if (lifecycleTab === 'quotes') return recentQuotes;
        if (lifecycleTab === 'acknowledgments') return recentAcknowledgments;

        let orders = [...recentOrders];
        const isDemoComplete = localStorage.getItem('demo_flow_complete') === 'true';
        if (isDemoComplete) {
            orders.unshift({
                id: "#ORD-7829",
                customer: currentTenant,
                client: currentTenant,
                project: "HQ Refresh",
                amount: "$124,500",
                status: "Order Placed",
                date: "Just Now",
                initials: currentTenant.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
                statusColor: "bg-green-50 text-green-700 ring-green-600/20",
                location: "New York"
            });
        }
        return orders;
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
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-card/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => setLifecycleTab('quotes')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'quotes'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
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
                            Purchase Orders
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
                            Acknowledgements
                        </button>
                        <button
                            onClick={() => setLifecycleTab('projects')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                lifecycleTab === 'projects'
                                    ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"
                                    : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            Projects
                        </button>
                    </div>
                </div>

                {/* Quotes Tab Content */}
                {lifecycleTab === 'quotes' && (
                    <>
                        {/* KPI Cards for Quotes — hidden during demo */}
                        {false && (showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                                        {Object.entries(quotesSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
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
                                {/* Quick Actions for Quotes */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote", action: () => setIsQuoteWidgetOpen(true) },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate", action: () => triggerToast('Duplicate Quote', 'Select a quote to duplicate from the list.', 'info') },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('quote') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client", action: () => triggerToast('Send to Client', 'Email prepared with quote summary. Ready to review and send.', 'info') },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action && action.action()} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Collapsed Quotes Metrics */
                            <>
                                <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                            {Object.entries(quotesSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                                <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                    <div
                                                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                        title={data.label}
                                                    >
                                                        {data.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                            <span className={`text-[10px] font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                                {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                    {/* Quick Actions Integrated - Compact */}
                                    <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                                        {[
                                            { icon: <PlusIcon className="w-5 h-5" />, label: "New Quote", action: () => setIsQuoteWidgetOpen(true) },
                                            { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate", action: () => triggerToast('Duplicate Quote', 'Select a quote to duplicate from the list.', 'info') },
                                            { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('quote') },
                                            { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send to Client", action: () => triggerToast('Send to Client', 'Email prepared with quote summary.', 'info') },
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
                            </>
                        ))}
                        <div className="mt-6"></div> {/* Spacer */}
                    </>
                )}

                {/* Acknowledgements Tab Content */}
                {lifecycleTab === 'acknowledgments' && (
                    <>
                        {/* KPI Cards for Acks — hidden during demo */}
                        {false && (showMetrics ? (
                            <>
                                <div className="flex justify-end mb-2">
                                    <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Hide Details <ChevronUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                                        {Object.entries(acksSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
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
                                {/* Quick Actions for Acks */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Acknowledgement", action: () => setIsAckModalOpen(true) },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('acknowledgment') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Email Vendor", action: () => triggerToast('Email Vendor', 'Drafting vendor communication with acknowledgement details.', 'info') },
                                        { icon: <CheckBadgeIcon className="w-5 h-5" />, label: "Batch Approve", action: () => setIsBatchAckOpen(true) },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action ? action.action() : null} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all text-xs font-medium">
                                            {action.icon}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Collapsed Acks Metrics */
                            <>
                                <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth">
                                            {Object.entries(acksSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                                <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                    <div
                                                        className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                        title={data.label}
                                                    >
                                                        {data.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                            <span className={`text-[10px] font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                                {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>
                                    {/* Quick Actions Integrated - Compact */}
                                    <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                                        {[
                                            { icon: <CloudArrowUpIcon className="w-5 h-5" />, label: "Upload Acknowledgement", action: () => setIsAckModalOpen(true) },
                                            { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('acknowledgment') },
                                            { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Email Vendor", action: () => triggerToast('Email Vendor', 'Drafting vendor communication.', 'info') },
                                            { icon: <CheckBadgeIcon className="w-5 h-5" />, label: "Batch Approve", action: () => setIsBatchAckOpen(true) },
                                        ].map((action, i) => (
                                            <button key={i} onClick={() => action.action()} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors relative group" title={action.label}>
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
                            </>
                        ))}
                        <div className="mt-6"></div> {/* Spacer */}
                    </>
                )}

                {/* Orders Content (Existing) */}
                {lifecycleTab === 'orders' && (
                    <>
                        {/* KPI Cards / Summary Panel — hidden during demo */}
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
                                        {Object.entries(ordersSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
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
                                {/* Quick Actions below grid when expanded */}
                                <div className="flex items-center gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order", action: () => setIsCreateOrderOpen(true) },
                                        { icon: <DocumentDuplicateIcon className="w-5 h-5" />, label: "Duplicate", action: () => triggerToast('Duplicate Order', 'Select an order to duplicate from the list.', 'info') },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('order') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email", action: () => triggerToast('Send Email', 'Email drafted with order confirmation details.', 'info') },
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
                                {/* Collapsed Ticker View - Carousel */}
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {/* Left Scroll Button */}
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
                                        {Object.entries(ordersSummaryByPeriod[txTimePeriod]).map(([key, data]) => (
                                            <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                                <div
                                                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${colorStyles[data.color] || 'bg-gray-100 dark:bg-card'}`}
                                                    title={data.label}
                                                >
                                                    {data.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                                        <span className={`text-[10px] font-semibold ${data.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                                            {data.trendUp ? '\u2191' : '\u2193'}{data.trend}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                                </div>
                                                <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Scroll Button */}
                                    <button
                                        onClick={() => scroll(scrollContainerRef, 'right')}
                                        className="p-1.5 rounded-full hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                                {/* Quick Actions Integrated - Compact */}
                                <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                                    {[
                                        { icon: <PlusIcon className="w-5 h-5" />, label: "New Order", action: () => setIsCreateOrderOpen(true) },
                                        { icon: <DocumentPlusIcon className="w-5 h-5" />, label: "New Quote", action: () => setIsQuoteWidgetOpen(true) },
                                        { icon: <DocumentTextIcon className="w-5 h-5" />, label: "Export PDF", action: () => openPEDPreview('order') },
                                        { icon: <EnvelopeIcon className="w-5 h-5" />, label: "Send Email", action: () => triggerToast('Send Email', 'Email drafted with order details.', 'info') },
                                    ].map((action, i) => (
                                        <button key={i} onClick={() => action.action()} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors relative group" title={action.label}>
                                            {action.icon}
                                        </button>
                                    ))}
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

                {/* Recent Orders - The Grid/List view handled here */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <div className={cn(
                            "bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-700",
                            highlightedSection === 'orders' && "ring-4 ring-brand-500 shadow-[0_0_30px_rgba(var(--brand-500),0.6)] animate-pulse"
                        )}>
                            {/* Header for Orders */}
                            <div className="p-6 border-b border-border">
                                <div className="flex flex-col gap-6">
                                    {/* Top Row: Title + Tabs */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <h3 className="text-lg font-brand font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                                            {lifecycleTab === 'quotes' ? 'Recent Quotes' : lifecycleTab === 'acknowledgments' ? 'Recent Acknowledgements' : 'Recent Orders'}
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
                                                            : "text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white"
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
                                                    placeholder={lifecycleTab === 'quotes' ? "Search quotes..." : lifecycleTab === 'acknowledgments' ? "Search acknowledgements..." : "Search orders..."}
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
                                                        viewMode === 'list' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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
                                                        viewMode === 'pipeline' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                                    )}
                                                    title="Pipeline View"
                                                >
                                                    <FunnelIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="w-px h-8 bg-border hidden xl:block mx-1"></div>

                                            {/* Quick Actions — icon-only with hover tooltip */}
                                            {activeTab !== 'metrics' && (
                                                <div className="flex items-center gap-1">
                                                    {lifecycleTab === 'quotes' && (<>
                                                        <button onClick={() => triggerToast('Duplicate Quote', 'Select a quote to duplicate from the list.', 'info')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Duplicate">
                                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => openPEDPreview('quote')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => triggerToast('Send to Client', 'Email prepared with quote summary. Ready to review and send.', 'info')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Send to Client">
                                                            <EnvelopeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => { setConversionMode('quote-to-order'); setIsConversionOpen(true); }} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Convert to Order">
                                                            <ArrowsRightLeftIcon className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                                    {lifecycleTab === 'acknowledgments' && (<>
                                                        <button onClick={() => openPEDPreview('acknowledgment')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => triggerToast('Email Vendor', 'Drafting vendor communication with acknowledgement details.', 'info')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Email Vendor">
                                                            <EnvelopeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => setIsBatchAckOpen(true)} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Batch Approve">
                                                            <CheckBadgeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => setIsReconciliationOpen(true)} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Reconcile PO vs ACK">
                                                            <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                                    {lifecycleTab === 'orders' && (<>
                                                        <button onClick={() => triggerToast('Duplicate Order', 'Select an order to duplicate from the list.', 'info')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Duplicate">
                                                            <DocumentDuplicateIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => openPEDPreview('order')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Export PDF">
                                                            <DocumentTextIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => triggerToast('Send Email', 'Email drafted with order confirmation details.', 'info')} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Send Email">
                                                            <EnvelopeIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => { setConversionMode('order-to-ack'); setIsConversionOpen(true); }} className="p-2 rounded-lg hover:bg-brand-300 dark:hover:bg-brand-600/50 text-muted-foreground hover:text-zinc-900 dark:hover:text-white transition-colors" title="Convert to Acknowledgment">
                                                            <ArrowsRightLeftIcon className="w-5 h-5" />
                                                        </button>
                                                    </>)}
                                                </div>
                                            )}

                                            <div className="w-px h-8 bg-border hidden xl:block mx-1"></div>

                                            <button
                                                onClick={() => {
                                                    if (lifecycleTab === 'quotes') {
                                                        setIsQuoteWidgetOpen(true);
                                                    } else if (lifecycleTab === 'acknowledgments') {
                                                        setIsAckModalOpen(true);
                                                        /* @ts-ignore */
                                                        if (onNavigate) onNavigate('order-detail');
                                                    } else {
                                                        setIsCreateOrderOpen(true);
                                                    }
                                                }}
                                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                <span>
                                                    {lifecycleTab === 'quotes' ? 'Create Quote' : lifecycleTab === 'acknowledgments' ? 'Upload Acknowledgement' : 'Create Order'}
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
                                                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-card shadow-xl transition-all">
                                                    <div className="relative">
                                                        {/* Close X Button - Floating */}
                                                        <button
                                                            onClick={() => setIsQuoteWidgetOpen(false)}
                                                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-Card backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
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

                                {/* ═══ CONTINUA STEP 2.2 — Procurement: Notification + Expert Question (inline) ═══ */}
                                {isContinua && stepId === '2.2' && (procPhase === 'notification' || procPhase === 'expert-question') && (
                                    <div className="space-y-4 mb-6">
                                        {/* Notification */}
                                        {procPhase === 'notification' && (
                                            <button onClick={() => setProcPhase('expert-question')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                                                            <ClipboardDocumentListIcon className="h-5 w-5 text-zinc-900" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">PO Package Generation — Corporate HQ Project</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500 text-zinc-900 font-bold">12 manufacturers</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold">$3.2M project</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                <strong className="text-foreground">ProcurementAgent</strong> will parse 1,500 line items, compare contract vs list pricing across <strong className="text-foreground">4 price sources</strong>, apply 5 business rules, and generate consolidated POs.
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                                                                <span>Orders: <strong className="text-foreground">3 consolidated POs</strong> from 12 manufacturers</span>
                                                                <span>·</span>
                                                                <span>Part of: <strong className="text-foreground">Corporate HQ — Phase 2</strong></span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                                                <span>Click to review procurement decisions</span>
                                                                <ArrowRightIcon className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Expert Question — inline before lupa */}
                                        {procPhase === 'expert-question' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {/* Expert question card */}
                                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-300 dark:border-amber-500/30">
                                                    <div className="flex items-start gap-3">
                                                        <AIAgentAvatar size="sm" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Expert Review Required</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold">Decision needed</span>
                                                            </div>
                                                            <p className="text-[11px] text-amber-800 dark:text-amber-200">
                                                                DIRTT architectural walls have a <strong>12-week lead time</strong> (exceeds 8-week threshold). This impacts floor 5 installation schedule. Should we:
                                                            </p>
                                                            <div className="mt-3 space-y-2">
                                                                <button
                                                                    onClick={() => setExpertAnswer('priority')}
                                                                    className={cn("w-full text-left p-2.5 rounded-lg border transition-all text-[11px]",
                                                                        expertAnswer === 'priority'
                                                                            ? "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200 ring-2 ring-green-400/30"
                                                                            : "border-amber-200 dark:border-amber-500/20 bg-white/60 dark:bg-zinc-900/40 text-foreground hover:border-amber-300 hover:bg-amber-50/50"
                                                                    )}
                                                                >
                                                                    <span className="font-bold">A. Priority order DIRTT now</span> — Submit PO-HQ-002 immediately, before the full package. Prevents further delays.
                                                                </button>
                                                                <button
                                                                    onClick={() => setExpertAnswer('resequence')}
                                                                    className={cn("w-full text-left p-2.5 rounded-lg border transition-all text-[11px]",
                                                                        expertAnswer === 'resequence'
                                                                            ? "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-200 ring-2 ring-green-400/30"
                                                                            : "border-amber-200 dark:border-amber-500/20 bg-white/60 dark:bg-zinc-900/40 text-foreground hover:border-amber-300 hover:bg-amber-50/50"
                                                                    )}
                                                                >
                                                                    <span className="font-bold">B. Resequence installation</span> — Start with floors 4 & 6, push floor 5 to week 12+. Notify GC of schedule change.
                                                                </button>
                                                            </div>
                                                            {expertAnswer && (
                                                                <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 animate-in fade-in duration-300">
                                                                    <p className="text-[10px] text-green-700 dark:text-green-300 flex items-center gap-1.5">
                                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                                        <span><strong>Expert decision recorded.</strong> {expertAnswer === 'priority' ? 'PO-HQ-002 flagged for priority submission.' : 'Installation re-sequence initiated — GC notification queued.'} Processing PO package...</span>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ═══ Continua Step 2.3 — ACK Tracking & Validation (inline) ═══ */}
                                {isContinua && stepId === '2.3' && ackPhase !== 'idle' && (
                                    <div data-demo-target="ack-tracking-dashboard" className="space-y-4 mb-6">
                                        {/* Notification banner */}
                                        {ackPhase === 'notification' && (
                                            <button onClick={() => setAckPhase('tab-switch')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-600 text-white">
                                                            <DocumentMagnifyingGlassIcon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-foreground">TrackingAgent — ACK Validation</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">12 POs</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 font-bold">9 ACKs received</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                                Monitoring <strong className="text-foreground">12 active purchase orders</strong>. 9 ACKs received — auto-validating qty, price, and delivery dates against POs.
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-700 dark:text-brand-400 font-medium">
                                                                <span>Click to view validation</span>
                                                                <ArrowRightIcon className="h-3 w-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Validation progress + Knoll alert */}
                                        {(ackPhase === 'validating' || ackPhase === 'alert' || ackPhase === 'click-sim') && (
                                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AIAgentAvatar size="sm" />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {ackKnollAlert
                                                            ? 'Discrepancy Detected — Knoll ACK'
                                                            : `TrackingAgent Validating ACKs... (${ackValidatedCount}/9)`
                                                        }
                                                    </span>
                                                    {ackKnollAlert && (
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold animate-pulse">
                                                            Price +4%
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Progress bar */}
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-700 ease-linear",
                                                            ackKnollAlert ? "bg-red-500" : "bg-indigo-500"
                                                        )}
                                                        style={{ width: `${ackKnollAlert ? 100 : Math.round((ackValidatedCount / 9) * 100)}%` }}
                                                    />
                                                </div>
                                                {/* Knoll alert detail */}
                                                {ackKnollAlert && (
                                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 animate-in fade-in duration-300">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 shrink-0" />
                                                            <span className="font-bold text-red-700 dark:text-red-400">Knoll ACK: +4% price increase</span>
                                                            <span className="text-red-600/70 dark:text-red-400/70">on task chairs vs contract</span>
                                                        </div>
                                                        <p className="text-[10px] text-red-600/80 dark:text-red-400/70 mt-1 ml-6">
                                                            Auto-generating dispute draft with contractual evidence...
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ═══ Continua Step 1.5 — Consignment & Vendor Returns (interactive) ═══ */}
                                {isContinua && stepId === '1.5' && csgnPhase !== 'idle' && (
                                    <div data-demo-target="consignment-decisions" className="space-y-4 mb-6">
                                        {/* Notification */}
                                        {csgnPhase === 'notification' && (
                                            <button onClick={() => setCsgnPhase('processing')} className="w-full text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border-2 border-brand-400 dark:border-brand-500/40 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-shadow cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-amber-600 text-white"><ClockIcon className="h-4 w-4" /></div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-foreground">Consignment Review — 90-Day Window</span>
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold">12 urgent</span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground mt-1">ConsignmentAgent: <span className="font-semibold text-foreground">35 items on consignment</span> from 4 manufacturers. 12 approaching 90-day return window — decisions needed this week.</p>
                                                            <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">Click to review decisions <ArrowRightIcon className="h-3 w-3" /></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )}

                                        {/* Processing */}
                                        {csgnPhase === 'processing' && (
                                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm animate-in fade-in duration-300">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <AIAgentAvatar size="sm" />
                                                    <span className="text-xs font-bold text-foreground">ConsignmentAgent Analyzing Items...</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                                                    <div className="h-full rounded-full bg-amber-500 transition-all duration-[3500ms] ease-linear" style={{ width: `${csgnProgress}%` }} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    {csgnAgents.map(agent => (
                                                        <div key={agent.name} className={cn("flex items-center gap-2 text-[10px] transition-all duration-300", agent.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")}>
                                                            {agent.done ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <ArrowPathIcon className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />}
                                                            <span className={cn("font-medium", agent.done ? "text-foreground" : "text-amber-600 dark:text-amber-400")}>{agent.name}</span>
                                                            <span className="text-muted-foreground">{agent.detail}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Breathing */}
                                        {csgnPhase === 'breathing' && (
                                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 animate-in fade-in duration-300 flex items-center justify-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-muted-foreground">Processing complete — syncing external systems...</span>
                                            </div>
                                        )}

                                        {/* Confirmed */}
                                        {(csgnPhase === 'revealed' || csgnPhase === 'results') && (
                                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border-2 border-green-300 dark:border-green-500/30 animate-in fade-in duration-300">
                                                <div className="flex items-start gap-2">
                                                    <AIAgentAvatar size="sm" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-green-800 dark:text-green-200"><span className="font-bold">ConsignmentAgent:</span> 35 items reviewed — <span className="font-semibold">4 RMA auto-generated</span> ($8,760). AI recommends converting 4 items to purchase (demand up 12%).</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-[9px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">External Systems · Synced</span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                            {['Consignment DB', 'RMA Portal', 'Demand Forecast', 'Inventory WMS', 'Vendor Portal'].map(sys => (
                                                                <span key={sys} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-300 text-[10px] font-medium border border-green-200/50 dark:border-green-500/20">
                                                                    <CheckCircleIcon className="h-3 w-3" />{sys}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Results */}
                                        {csgnPhase === 'results' && (
                                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                                    {/* Header */}
                                                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                                        <div>
                                                            <h3 className="text-sm font-bold text-foreground">Consignment Decisions — 4 Manufacturers</h3>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">35 items total · 12 approaching window · 4 RMA generated · 4 convert-to-purchase</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold">4 Return</span>
                                                            <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">4 Purchase</span>
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    <div className="p-4 space-y-2">
                                                        {CONSIGNMENT_ITEMS.map((item, i) => (
                                                            <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border",
                                                                item.decision === 'return' ? "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5" :
                                                                "border-green-200 dark:border-green-500/20 bg-green-50/30 dark:bg-green-500/5"
                                                            )}>
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0",
                                                                        item.decision === 'return' ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" :
                                                                        "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                                                                    )}>{item.decision === 'return' ? 'RMA' : 'Purchase'}</span>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                                                                        <p className="text-[10px] text-muted-foreground">{item.manufacturer} · Qty: {item.qty} · {item.reason}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold",
                                                                        item.daysLeft <= 14 ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400" :
                                                                        item.daysLeft <= 30 ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" :
                                                                        "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                                                                    )}>{item.daysLeft}d left</span>
                                                                    <span className="text-[11px] font-bold text-foreground">{item.value}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Summary + CTA */}
                                                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between bg-muted/20">
                                                        <div>
                                                            <p className="text-[10px] text-muted-foreground">4 RMA auto-generated · 4 items recommended for purchase (demand up 12%)</p>
                                                            <p className="text-[11px] font-bold text-foreground mt-0.5">Return value: $8,760 · Purchase value: $7,265</p>
                                                        </div>
                                                        <button onClick={nextStep} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 dark:bg-brand-400 dark:hover:bg-brand-300 text-zinc-900 text-[11px] font-bold shadow-sm transition-all hover:scale-[1.02]">
                                                            <CheckCircleIcon className="h-3.5 w-3.5" />Process Decisions<ArrowRightIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Metrics View special handling */}
                                {activeTab === 'metrics' ? (
                                    <div className="space-y-8">
                                        {/* Period Selector */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-brand font-semibold text-foreground">{trendLabels[txTimePeriod]}</h3>
                                            <div className="flex items-center gap-1 bg-muted/60 dark:bg-zinc-800/60 rounded-lg p-0.5">
                                                {(['Day', 'Week', 'Month', 'Quarter'] as TimePeriod[]).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setTxTimePeriod(p)}
                                                        className={cn(
                                                            'px-3 py-1 text-xs font-medium rounded-md transition-all',
                                                            txTimePeriod === p
                                                                ? 'bg-card dark:bg-zinc-700 text-foreground shadow-sm'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

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
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].revenueTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].revenueTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].revenueTrend}
                                                        </span>
                                                        <span className="text-[10px] text-green-600/60 dark:text-green-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Active Orders Card */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                        {lifecycleTab === 'quotes' ? 'Active Quotes' : lifecycleTab === 'acknowledgments' ? 'Pending Acknowledgements' : 'Active Orders'}
                                                    </p>
                                                    <ShoppingBagIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metricsData.activeOrders}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].activeTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].activeTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].activeTrend}
                                                        </span>
                                                        <span className="text-[10px] text-blue-600/60 dark:text-blue-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Completion Rate Card */}
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                                                        {lifecycleTab === 'quotes' ? 'Win Rate' : lifecycleTab === 'acknowledgments' ? 'Conf. Rate' : 'Completion Rate'}
                                                    </p>
                                                    <ChartBarIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{metricsData.efficiency}%</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].efficiencyTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].efficiencyTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].efficiencyTrend}
                                                        </span>
                                                        <span className="text-[10px] text-indigo-600/60 dark:text-indigo-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Project Count Card */}
                                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-800/20 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Project Count</p>
                                                    <ClipboardDocumentListIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                                        {availableProjects.length > 0 && availableProjects[0] === 'All Projects' ? availableProjects.length - 1 : availableProjects.length}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn('text-xs font-semibold', metricsByPeriod[txTimePeriod].projectTrendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
                                                            {metricsByPeriod[txTimePeriod].projectTrendUp ? '↑' : '↓'} {metricsByPeriod[txTimePeriod].projectTrend}
                                                        </span>
                                                        <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">vs prev.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-[300px] w-full bg-card rounded-2xl p-6 border border-border shadow-sm">
                                            <h4 className="text-md font-medium text-foreground mb-4">{lifecycleTab === 'orders' ? 'Sales' : lifecycleTab === 'quotes' ? 'Pipeline' : 'Acknowledgements'} — {trendLabels[txTimePeriod]}</h4>
                                            <ResponsiveContainer width="100%" height="85%">
                                                <BarChart data={salesDataByPeriod[txTimePeriod]}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} vertical={false} />
                                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} animationDuration={600} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : viewMode === 'list' ? (
                                    /* List View */
                                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
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
                                                                className={cn(
                                                                    "group hover:bg-muted/50 transition-all cursor-pointer",
                                                                    (procPhase === 'highlight' || procPhase === 'lupa-active') && order.id === '#ORD-2055' && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background bg-brand-50/30 dark:bg-brand-500/5 shadow-lg animate-pulse",
                                                                    procPhase === 'done' && order.id === '#ORD-2055' && isContinua && !clickSimActive && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background bg-brand-50/30 dark:bg-brand-500/5 shadow-lg",
                                                                    clickSimActive && order.id === '#ORD-2055' && isContinua && "scale-[0.97] ring-2 ring-brand-500 bg-brand-100 dark:bg-brand-500/20 shadow-2xl transition-transform duration-200"
                                                                )}
                                                                onClick={() => toggleExpand(order.id)}
                                                            >
                                                                <td className="p-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                                                            {order.initials}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-foreground">{lifecycleTab === 'acknowledgments' ? order.vendor : order.customer}</div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-xs text-muted-foreground">{order.id}</div>
                                                                                {order.id === '#ORD-7829' && (
                                                                                    <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                                                                        New
                                                                                    </span>
                                                                                )}
                                                                                {isContinua && order.id === '#ORD-2055' && procPhase === 'done' && (
                                                                                    <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-500">
                                                                                        PO Generated
                                                                                    </span>
                                                                                )}
                                                                            </div>
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
                                                                            onClick={(e) => { e.stopPropagation(); openPEDPreview(lifecycleTab === 'quotes' ? 'quote' : lifecycleTab === 'acknowledgments' ? 'acknowledgment' : 'order', order.id); }}
                                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                                            title="Export PDF"
                                                                        >
                                                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                                                        </button>
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
                                    <div className="flex gap-6 overflow-x-auto pb-4 scale-y-[-1] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/50 hover:[&::-webkit-scrollbar-thumb]:bg-muted dark:[&::-webkit-scrollbar-thumb]:bg-muted/50 dark:hover:[&::-webkit-scrollbar-thumb]:bg-muted">
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
                                                                className={cn(
                                                                    "group relative bg-card dark:bg-zinc-800 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col",
                                                                    expandedIds.has(order.id) ? 'border-brand-400/50 ring-1 ring-brand-400/20 shadow-lg' : 'border-border shadow-sm hover:shadow-md',
                                                                    (procPhase === 'highlight' || procPhase === 'lupa-active') && order.id === '#ORD-2055' && isContinua && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background shadow-xl shadow-brand-400/20 animate-pulse scale-[1.02]",
                                                                    procPhase === 'done' && order.id === '#ORD-2055' && isContinua && !clickSimActive && "ring-2 ring-brand-400 ring-offset-2 ring-offset-background shadow-xl",
                                                                    clickSimActive && order.id === '#ORD-2055' && isContinua && "scale-[0.96] ring-2 ring-brand-500 bg-brand-100 dark:bg-brand-500/20 shadow-2xl transition-transform duration-200",
                                                                    // Step 1.3: Knoll ACK card highlighting
                                                                    ackPhase === 'alert' && order.id === 'Acknowledgement-8841' && isContinua && "ring-2 ring-red-500 ring-offset-2 ring-offset-background shadow-xl shadow-red-500/20 animate-pulse scale-[1.02]",
                                                                    ackClickSim && order.id === 'Acknowledgement-8841' && isContinua && "scale-[0.96] ring-2 ring-red-500 bg-red-50 dark:bg-red-500/10 shadow-2xl transition-transform duration-200"
                                                                )}
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
                                                                                <div className="flex items-center gap-1">
                                                                                    <p className="text-[10px] text-muted-foreground font-mono">{order.id}</p>
                                                                                    {order.id === '#ORD-7829' && (
                                                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                                                                            New
                                                                                        </span>
                                                                                    )}
                                                                                    {isContinua && order.id === '#ORD-2055' && procPhase === 'done' && (
                                                                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-500">
                                                                                            PO Generated
                                                                                        </span>
                                                                                    )}
                                                                                    {/* Step 1.3: Validated badges on ACK cards */}
                                                                                    {isContinua && lifecycleTab === 'acknowledgments' && (ackPhase === 'validating' || ackPhase === 'alert' || ackPhase === 'click-sim') && (
                                                                                        <>
                                                                                            {order.id === 'Acknowledgement-8839' && ackValidatedCount >= 1 && (
                                                                                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
                                                                                                    Validated ✓
                                                                                                </span>
                                                                                            )}
                                                                                            {order.id === 'Acknowledgement-8840' && ackValidatedCount >= 2 && (
                                                                                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
                                                                                                    Validated ✓
                                                                                                </span>
                                                                                            )}
                                                                                            {order.id === 'Acknowledgement-8841' && ackKnollAlert && (
                                                                                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-[10px] font-bold uppercase tracking-wider animate-in fade-in duration-300">
                                                                                                    Dispute ⚠
                                                                                                </span>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                </div>
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
                                                                                colorStyles[order.statusColor?.split('-')[1]?.replace('text', '').trim()] || "bg-muted text-muted-foreground border-border"
                                                                            )}>
                                                                                {order.status}
                                                                            </span>

                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); openPEDPreview(lifecycleTab === 'quotes' ? 'quote' : lifecycleTab === 'acknowledgments' ? 'acknowledgment' : 'order', order.id); }}
                                                                                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                                                                    title="Export PDF"
                                                                                >
                                                                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); toggleExpand(order.id); }}
                                                                                    className="text-xs font-bold text-zinc-800 bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-shadow shadow-sm"
                                                                                >
                                                                                    {expandedIds.has(order.id) ? 'Close' : 'Details'}
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); onNavigateToDetail(lifecycleTab === 'quotes' ? 'quote-detail' : lifecycleTab === 'acknowledgments' ? 'ack-detail' : 'order-detail'); }}
                                                                                    className={cn(
                                                                                        "p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
                                                                                        clickSimActive && order.id === '#ORD-2055' && isContinua && "bg-brand-300 text-zinc-900 scale-110 ring-2 ring-brand-400 shadow-lg",
                                                                                        ackClickSim && order.id === 'Acknowledgement-8841' && isContinua && "bg-red-500 text-white scale-110 ring-2 ring-red-400 shadow-lg"
                                                                                    )}
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
                                                                    <div className="bg-card border-t border-border animate-in slide-in-from-top-2 duration-200">
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
                                                                                <button className="w-full py-2.5 text-xs font-bold text-foreground bg-card border border-border rounded-lg hover:bg-accent hover:text-foreground transition-colors shadow-sm">
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
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-lg font-brand font-semibold text-foreground mb-4">Revenue Trend — {trendLabels[txTimePeriod]}</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesDataByPeriod[txTimePeriod]}>
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

                    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                        <h3 className="text-lg font-brand font-semibold text-foreground mb-4">Inventory Breakdown</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={inventoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--popover)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--popover-foreground)' }} />
                                    <Bar dataKey="value" fill="#C3E433" radius={[6, 6, 0, 0]} barSize={40} />
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
                                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
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
                                            className="rounded-full p-1 hover:bg-accent transition-colors"
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
                                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                        <span className="text-sm text-muted-foreground">Total Cost</span>
                                                        <span className="font-mono text-foreground">$850,000</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                                        <span className="text-sm text-muted-foreground">List Price</span>
                                                        <span className="font-mono text-foreground">$1,200,000</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg">
                                                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Net Margin</span>
                                                        <span className="font-bold text-green-700 dark:text-green-400">29.2%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col h-full bg-primary/5 p-5 rounded-xl border border-primary/10">
                                                <div className="flex items-center gap-2 mb-3 text-brand-700 dark:text-brand-300">
                                                    <SparklesIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                                    <span className="font-semibold text-sm">AI Pricing Insight</span>
                                                </div>
                                                <p className="text-sm text-brand-900/80 dark:text-zinc-300 leading-relaxed mb-4">
                                                    Based on recent wins with <strong className="text-brand-950 dark:text-white">Apex Furniture</strong>, you could increase margin to <strong className="text-brand-950 dark:text-white">32%</strong> without impacting win probability.
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
                                                    <span className="block text-xs uppercase text-red-600 dark:text-red-400 mb-1">Vendor Acknowledgement</span>
                                                    <div className="font-semibold text-lg text-red-700 dark:text-red-400">$13,000.00</div>
                                                    <div className="text-xs text-red-600/80 mt-2">Unit Price: $260.00</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-end pt-4 border-t border-border">
                                                <button className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent">
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
                                                <div className="bg-muted rounded-lg h-40 w-full mb-4 flex items-center justify-center border border-border">
                                                    <div className="text-center">
                                                        <MapPinIcon className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Map Preview Unavailable</span>
                                                    </div>
                                                </div>

                                                <div className="bg-muted/30 p-3 rounded-lg border border-border mb-6">
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
                                    )}
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* ═══ PROJECTS TAB CONTENT ═══ */}
            {lifecycleTab === 'projects' && (
                <div className="space-y-6">
                    {/* Project Summary Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Active Projects</h2>
                            <p className="text-sm text-muted-foreground">{DEMO_PROJECTS.length} projects · Orders grouped by project</p>
                        </div>
                    </div>

                    {/* Project Cards */}
                    {DEMO_PROJECTS.map(project => (
                        <div key={project.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            {/* Project Header */}
                            <div className="p-6 border-b border-border">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-bold text-foreground truncate">{project.name}</h3>
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase whitespace-nowrap",
                                                project.status === 'In Progress' ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300" :
                                                project.status === 'Planning' ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                                                "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300"
                                            )}>
                                                {project.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> Client: <strong className="text-foreground">{project.client}</strong></span>
                                            <span className="flex items-center gap-1"><ClipboardDocumentListIcon className="w-3 h-3" /> PM: {project.pm}</span>
                                            <span className="flex items-center gap-1"><WrenchScrewdriverIcon className="w-3 h-3" /> FM: {project.fm}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs text-muted-foreground">Budget</div>
                                        <div className="text-sm font-bold text-foreground">{project.spent} <span className="text-muted-foreground font-normal">/ {project.totalBudget}</span></div>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Overall Progress</span>
                                        <span className="font-bold text-foreground">{project.completion}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${project.completion}%` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
                                {/* Orders Column */}
                                <div className="p-5">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Orders ({project.orders.length})</h4>
                                    <div className="space-y-3">
                                        {project.orders.map(order => (
                                            <div key={order.id} className="p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs font-bold text-foreground">{order.id}</span>
                                                    <span className={cn(
                                                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold",
                                                        order.status === 'Shipped' || order.status === 'Ready to Ship' ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-300" :
                                                        order.status === 'In Production' ? "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300" :
                                                        order.status === 'Awaiting ACK' || order.status === 'Quote Negotiating' ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" :
                                                        "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{order.supplier}</span>
                                                    <span className="font-semibold text-foreground">{order.amount}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${order.progress}%` }} />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1 text-[9px] text-muted-foreground">
                                                        <span>Delivery: {order.deliveryDate}</span>
                                                        <span>{order.progress}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Milestones Column */}
                                <div className="p-5">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Milestones</h4>
                                    <div className="space-y-3 relative">
                                        {project.milestones.map((ms, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn(
                                                        "w-3 h-3 rounded-full border-2 shrink-0",
                                                        ms.status === 'completed' ? "bg-green-500 border-green-500" :
                                                        ms.status === 'in-progress' ? "bg-blue-500 border-blue-500 animate-pulse" :
                                                        "bg-background border-muted-foreground/30"
                                                    )} />
                                                    {idx < project.milestones.length - 1 && (
                                                        <div className={cn(
                                                            "w-0.5 h-6 mt-1",
                                                            ms.status === 'completed' ? "bg-green-300 dark:bg-green-700" : "bg-border"
                                                        )} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 -mt-0.5">
                                                    <p className={cn("text-xs font-medium truncate", ms.status === 'completed' ? "text-muted-foreground line-through" : "text-foreground")}>{ms.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{ms.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FM Actions Column */}
                                <div className="p-5">
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <WrenchScrewdriverIcon className="w-3 h-3" />
                                        FM Actions
                                    </h4>
                                    {project.fmActions.length > 0 ? (
                                        <div className="space-y-2">
                                            {project.fmActions.map((fm, idx) => (
                                                <div key={idx} className={cn(
                                                    "p-3 rounded-xl border text-xs",
                                                    fm.priority === 'high' ? "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20" :
                                                    fm.priority === 'medium' ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20" :
                                                    "bg-muted/30 border-border/50"
                                                )}>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-foreground font-medium">{fm.action}</p>
                                                        <span className={cn(
                                                            "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0",
                                                            fm.priority === 'high' ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400" :
                                                            fm.priority === 'medium' ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                                                            "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                                                        )}>
                                                            {fm.priority}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => triggerToast('Action Approved', `"${fm.action}" has been approved and assigned.`, 'success')} className="text-[9px] px-2 py-1 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-colors">
                                                            Approve
                                                        </button>
                                                        <button onClick={() => triggerToast('Details Requested', 'Request sent to facilities team for more information.', 'info')} className="text-[9px] px-2 py-1 rounded-lg border border-border text-muted-foreground font-bold hover:bg-muted transition-colors">
                                                            Details
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <CheckCircleIcon className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                            <p className="text-xs">No pending FM actions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateOrderModal isOpen={isCreateOrderOpen} onClose={() => setIsCreateOrderOpen(false)} />
            <AcknowledgementUploadModal isOpen={isAckModalOpen} onClose={() => setIsAckModalOpen(false)} />
            <BatchAckModal isOpen={isBatchAckOpen} onClose={() => setIsBatchAckOpen(false)} />
            <CreateQuoteModal isOpen={isQuoteWidgetOpen} onClose={() => setIsQuoteWidgetOpen(false)} onNavigate={onNavigate} />
            <PEDExportModal isOpen={isPEDOpen} onClose={() => setIsPEDOpen(false)} data={pedData} />
            <DocumentConversionModal isOpen={isConversionOpen} onClose={() => setIsConversionOpen(false)} mode={conversionMode} triggerToast={triggerToast} />
            <AckReconciliationModal isOpen={isReconciliationOpen} onClose={() => setIsReconciliationOpen(false)} triggerToast={triggerToast} />

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-popover rounded-xl shadow-2xl shadow-black/10 border border-border p-4 flex items-start gap-4 max-w-sm">
                        <div className={`mt-0.5 p-1 rounded-full ${toastMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : toastMessage.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                            {toastMessage.type === 'success' ? (
                                <CheckCircleIcon className="w-5 h-5" />
                            ) : toastMessage.type === 'info' ? (
                                <DocumentTextIcon className="w-5 h-5" />
                            ) : (
                                <ExclamationCircleIcon className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{toastMessage.title}</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{toastMessage.description}</p>
                        </div>
                        <button onClick={() => setShowToast(false)} className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors">
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

        </div >
    )
}
