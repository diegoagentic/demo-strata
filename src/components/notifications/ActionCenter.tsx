import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { BellIcon, MagnifyingGlassIcon, XMarkIcon, Squares2X2Icon, ExclamationTriangleIcon, CreditCardIcon, ClipboardDocumentCheckIcon, TruckIcon, MegaphoneIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ShieldCheckIcon, CheckCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { Fragment, useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { mockNotifications } from './data';
import FilterTabs from './FilterTabs';
import NotificationItem from './NotificationItem';
import ChatView from './ChatView';
import type { Notification, NotificationTab } from './types';
import { useDemo } from '../../context/DemoContext';

// Flow 1 notifications for Step 1.8
const FLOW1_NOTIFICATIONS: Notification[] = [
    {
        id: 'f1-po', type: 'po_created', priority: 'high',
        title: 'PO Created from RFQ',
        message: 'Order #PO-1029 generated for Apex Furniture',
        meta: 'System Auto-PO', timestamp: 'Just now', unread: true,
        actions: [{ label: 'View PO', primary: true }], persona: 'dealer',
    },
    {
        id: 'f1-discrepancy', type: 'discrepancy', priority: 'high',
        title: 'Quantity Mismatch',
        message: 'Order vs Invoice: 24 → 22 units',
        meta: '#DSC-112', timestamp: '2 min ago', unread: true,
        actions: [{ label: 'Resolve', primary: true }], persona: 'expert',
    },
    {
        id: 'f1-price', type: 'discrepancy', priority: 'high',
        title: 'Price Discrepancy',
        message: 'PO #4521 - $2,340 variance',
        meta: '#DSC-118', timestamp: '15 min ago', unread: true,
        actions: [{ label: 'Review', primary: true }], persona: 'expert',
    },
    {
        id: 'f1-approval', type: 'approval', priority: 'high',
        title: 'Approval Chain Complete — 3/3 Levels',
        message: 'Quote QT-1025 approved: Sarah Chen (Sales) → David Park (Finance) → Policy Engine',
        meta: 'ApprovalOrchestratorAgent', timestamp: '1 min ago', unread: true,
        actions: [{ label: 'View Chain', primary: true }], persona: 'expert',
    },
    {
        id: 'f1-quote', type: 'quote_update', priority: 'medium',
        title: 'Quote QT-1025 — Warranties & Discounts Applied',
        message: 'Extended warranties on 3 SKUs (+$2,400 margin). Discounts: Early Payment 2% + Mixed Category 2%',
        meta: 'QuoteBuilderAgent', timestamp: '2 min ago', unread: true,
        actions: [{ label: 'Review', primary: true }], persona: 'expert',
    },
];

export default function ActionCenter() {
    const { isDemoActive, isSidebarCollapsed, currentStep } = useDemo();
    const sidebarExpanded = isDemoActive && !isSidebarCollapsed;
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');

    // Step 1.8: Auto-open with animated delivery
    const isStep18 = isDemoActive && currentStep?.id === '1.8';
    const [notifDelivered, setNotifDelivered] = useState<number[]>([]);

    useEffect(() => {
        if (!isStep18) { setNotifDelivered([]); return; }
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        timeouts.push(setTimeout(() => setNotifDelivered([0]), 1500));
        timeouts.push(setTimeout(() => setNotifDelivered([0, 1]), 3000));
        timeouts.push(setTimeout(() => setNotifDelivered([0, 1, 2]), 4500));
        return () => timeouts.forEach(clearTimeout);
    }, [isStep18]);

    const tabs: NotificationTab[] = [
        {
            id: 'all',
            label: 'All',
            count: mockNotifications.filter(n => n.unread).length,
            icon: Squares2X2Icon,
            colorTheme: {
                activeBg: 'bg-zinc-800 dark:bg-white/10',
                activeText: 'text-white',
                activeBorder: 'border-white/10',
                badgeBg: 'bg-white/20',
                badgeText: 'text-white'
            },
            filter: () => true
        },
        {
            id: 'discrepancy',
            label: 'Discrepancies',
            count: mockNotifications.filter(n => n.type === 'discrepancy' && n.unread).length,
            icon: ExclamationTriangleIcon,
            colorTheme: {
                activeBg: 'bg-red-500/15',
                activeText: 'text-red-500',
                activeBorder: 'border-red-500/20',
                badgeBg: 'bg-red-500/20',
                badgeText: 'text-red-500'
            },
            filter: (n) => n.type === 'discrepancy'
        },
        {
            id: 'payment',
            label: 'Payments',
            count: mockNotifications.filter(n => n.type === 'payment' && n.unread).length,
            icon: CreditCardIcon,
            colorTheme: {
                activeBg: 'bg-amber-500/15',
                activeText: 'text-amber-500',
                activeBorder: 'border-amber-500/20',
                badgeBg: 'bg-amber-500/20',
                badgeText: 'text-amber-500'
            },
            filter: (n) => n.type === 'payment'
        },
        {
            id: 'approval',
            label: 'Approvals',
            count: mockNotifications.filter(n => n.type === 'approval' && n.unread).length,
            icon: ClipboardDocumentCheckIcon,
            colorTheme: {
                activeBg: 'bg-blue-500/15',
                activeText: 'text-blue-500',
                activeBorder: 'border-blue-500/20',
                badgeBg: 'bg-blue-500/20',
                badgeText: 'text-blue-500'
            },
            filter: (n) => n.type === 'approval'
        },
        {
            id: 'shipping',
            label: 'Shipping',
            count: mockNotifications.filter(n => (n.type === 'shipment' || n.type === 'backorder') && n.unread).length,
            icon: TruckIcon,
            colorTheme: {
                activeBg: 'bg-green-500/15',
                activeText: 'text-green-500',
                activeBorder: 'border-green-500/20',
                badgeBg: 'bg-green-500/20',
                badgeText: 'text-green-500'
            },
            filter: (n) => n.type === 'shipment' || n.type === 'backorder'
        },
        {
            id: 'announcement',
            label: 'Announcements',
            count: mockNotifications.filter(n => n.type === 'announcement' && n.unread).length,
            icon: MegaphoneIcon,
            colorTheme: {
                activeBg: 'bg-indigo-500/15',
                activeText: 'text-indigo-500',
                activeBorder: 'border-indigo-500/20',
                badgeBg: 'bg-indigo-500/20',
                badgeText: 'text-indigo-500'
            },
            filter: (n) => n.type === 'announcement'
        },
        {
            id: 'live_chat',
            label: 'Live Chat',
            count: mockNotifications.filter(n => n.type === 'live_chat' && n.unread).length,
            icon: ChatBubbleLeftRightIcon,
            colorTheme: {
                activeBg: 'bg-indigo-500/15',
                activeText: 'text-indigo-500',
                activeBorder: 'border-indigo-500/20',
                badgeBg: 'bg-indigo-500/20',
                badgeText: 'text-indigo-500'
            },
            filter: (n) => n.type === 'live_chat'
        },
        {
            id: 'quotes',
            label: 'Quotes & POs',
            count: mockNotifications.filter(n => (n.type === 'quote_update' || n.type === 'po_created' || n.type === 'ack_received') && n.unread).length,
            icon: DocumentTextIcon,
            colorTheme: {
                activeBg: 'bg-blue-500/15',
                activeText: 'text-blue-500',
                activeBorder: 'border-blue-500/20',
                badgeBg: 'bg-blue-500/20',
                badgeText: 'text-blue-500'
            },
            filter: (n) => n.type === 'quote_update' || n.type === 'po_created' || n.type === 'ack_received'
        },
        {
            id: 'warranty_mac',
            label: 'Warranty & MAC',
            count: mockNotifications.filter(n => (n.type === 'warranty' || n.type === 'mac') && n.unread).length,
            icon: ShieldCheckIcon,
            colorTheme: {
                activeBg: 'bg-amber-500/15',
                activeText: 'text-amber-500',
                activeBorder: 'border-amber-500/20',
                badgeBg: 'bg-amber-500/20',
                badgeText: 'text-amber-500'
            },
            filter: (n) => n.type === 'warranty' || n.type === 'mac'
        },
    ];

    const filteredNotifications = useMemo(() => {
        const currentTab = tabs.find(t => t.id === activeTab);
        return mockNotifications
            .filter(n => currentTab?.filter(n))
            .filter(n =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.meta.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [activeTab, searchQuery]);

    const urgentCount = mockNotifications.filter(n => n.priority === 'high').length;
    const totalCount = mockNotifications.filter(n => n.unread).length;

    // Flow 1 tabs for step 1.8
    const flow1Tabs: NotificationTab[] = [
        { id: 'all', label: 'All', count: FLOW1_NOTIFICATIONS.length, icon: Squares2X2Icon, colorTheme: { activeBg: 'bg-zinc-800 dark:bg-white/10', activeText: 'text-white', activeBorder: 'border-white/10', badgeBg: 'bg-white/20', badgeText: 'text-white' }, filter: () => true },
        { id: 'discrepancy', label: 'Discrepancies', count: FLOW1_NOTIFICATIONS.filter(n => n.type === 'discrepancy').length, icon: ExclamationTriangleIcon, colorTheme: { activeBg: 'bg-red-500/15', activeText: 'text-red-500', activeBorder: 'border-red-500/20', badgeBg: 'bg-red-500/20', badgeText: 'text-red-500' }, filter: (n) => n.type === 'discrepancy' },
        { id: 'quotes', label: 'Quotes & POs', count: FLOW1_NOTIFICATIONS.filter(n => n.type === 'po_created' || n.type === 'quote_update').length, icon: DocumentTextIcon, colorTheme: { activeBg: 'bg-blue-500/15', activeText: 'text-blue-500', activeBorder: 'border-blue-500/20', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-500' }, filter: (n) => n.type === 'po_created' || n.type === 'quote_update' },
        { id: 'approval', label: 'Approvals', count: FLOW1_NOTIFICATIONS.filter(n => n.type === 'approval').length, icon: ClipboardDocumentCheckIcon, colorTheme: { activeBg: 'bg-green-500/15', activeText: 'text-green-500', activeBorder: 'border-green-500/20', badgeBg: 'bg-green-500/20', badgeText: 'text-green-500' }, filter: (n) => n.type === 'approval' },
    ];

    return (
        <>
        <Popover className="relative">
            {({ open }) => (
                <>
                    <PopoverButton className={clsx(
                        "relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors outline-none",
                        (open || isStep18) ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}>
                        <BellIcon className="w-5 h-5" />
                        {isStep18 && (
                            <span className="absolute inset-0 rounded-full ring-2 ring-green-500 animate-pulse" />
                        )}
                        {totalCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 dark:bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
                        )}
                    </PopoverButton>

                    {/* Normal popover - hidden when step 1.8 to avoid duplication */}
                    {!isStep18 && <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-2 scale-95"
                        enterTo="opacity-100 translate-y-0 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0 scale-100"
                        leaveTo="opacity-0 translate-y-2 scale-95"
                    >
                        <PopoverPanel className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-50 focus:outline-none transition-all duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                            <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

                                {currentView === 'chat' ? (
                                    <ChatView onBack={() => setCurrentView('list')} />
                                ) : (
                                    <>
                                        {/* Header */}
                                        <div className="px-5 pt-5 pb-3 shrink-0">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Action Center</h3>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tabs */}
                                            <FilterTabs
                                                tabs={tabs}
                                                activeTab={activeTab}
                                                onTabChange={setActiveTab}
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-minimal">
                                            {filteredNotifications.length > 0 ? (
                                                filteredNotifications.map(notification => (
                                                    <NotificationItem
                                                        key={notification.id}
                                                        notification={notification}
                                                        onActionClick={notification.type === 'live_chat'
                                                            ? (action) => {
                                                                if (action === 'Reply') setCurrentView('chat');
                                                            }
                                                            : undefined
                                                        }
                                                    />
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
                                                    <BellIcon className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                                                    <p className="text-sm font-medium">No updates found</p>
                                                    <p className="text-xs mt-1">You're all caught up!</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {filteredNotifications.length} actions
                                            </p>
                                            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                {urgentCount} urgent
                                            </p>
                                        </div>
                                    </>
                                )}

                            </div>
                        </PopoverPanel>
                    </Transition>}
                </>
            )}
        </Popover>

        {/* Step 1.8: Always-visible Action Center with Flow 1 notifications */}
        {isStep18 && (
            <div className={clsx("fixed top-[90px] -translate-x-1/2 w-[95vw] max-h-[85vh] lg:w-[600px] p-0 z-50 animate-in fade-in slide-in-from-top-2 duration-300", sidebarExpanded ? 'left-[calc(50%+10rem)]' : 'left-1/2')}>
                <div className="bg-zinc-100 dark:bg-zinc-900/85 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
                    {/* Header */}
                    <div className="px-5 pt-5 pb-3 shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Action Center</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 font-bold">Flow 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                </button>
                                <button className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <FilterTabs tabs={flow1Tabs} activeTab="all" onTabChange={() => {}} />
                    </div>

                    {/* Flow 1 Notifications */}
                    <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4 space-y-3 scrollbar-minimal">
                        {FLOW1_NOTIFICATIONS.map((notification, i) => (
                            <div
                                key={notification.id}
                                className={clsx(
                                    "transition-all duration-700",
                                    i < 2 || notifDelivered.includes(i - 2)
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-4 h-0 overflow-hidden'
                                )}
                            >
                                <div className="relative">
                                    <NotificationItem notification={notification} />
                                    {i >= 2 && notifDelivered.includes(i - 2) && (
                                        <span className="absolute top-3 right-3 text-[9px] font-bold text-green-600 dark:text-green-400 flex items-center gap-1 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                            <CheckCircleIcon className="w-3 h-3" /> Delivered
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-between shrink-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {Math.min(2 + notifDelivered.length, FLOW1_NOTIFICATIONS.length)} actions
                        </p>
                        <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {FLOW1_NOTIFICATIONS.filter(n => n.priority === 'high').length} urgent
                        </p>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}
