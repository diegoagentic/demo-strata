import React, { useState, useMemo, useRef, useEffect } from 'react';
// Imports removed
import RelocateAssetModal from './components/RelocateAssetModal';
import MaintenanceModal from './components/MaintenanceModal';
import SmartAddAssetModal from './components/SmartAddAssetModal';
import InventoryLocations from './components/InventoryLocations';
import ChangeStatusModal from './components/ChangeStatusModal';
import QuickMovementsModal from './components/QuickMovementsModal';
import { useTenant } from './TenantContext';
import Breadcrumbs from './components/Breadcrumbs';
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    ListBulletIcon,
    PlusIcon,
    EllipsisHorizontalIcon,
    MapPinIcon,
    WrenchScrewdriverIcon,
    TrashIcon,
    ArrowPathRoundedSquareIcon,
    TagIcon,
    BuildingOfficeIcon,
    CubeIcon,
    BoltIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    FunnelIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    QrCodeIcon,
    ClipboardDocumentCheckIcon,
    TruckIcon,
    ChartBarIcon,
    CurrencyDollarIcon, // Keep only one
    PhotoIcon,
    LightBulbIcon,
    ComputerDesktopIcon,
    TableCellsIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// --- Mock Data ---

interface InventoryItem {
    id: string;
    assetName: string;
    description: string;
    category: string;
    location: string;
    locationType: 'Project' | 'Warehouse' | 'Office' | 'Consignment';
    status: 'Available' | 'Under Maintenance' | 'In Use' | 'Reserved' | 'In Consignment' | 'Sold' | 'Write-off';
    value: number;
    carbonImpact: 'Low Impact' | 'Medium Impact' | 'High Impact';
    image?: string;
}

const BASE_INVENTORY_ITEMS = [
    {
        assetName: 'LED Desk Lamp',
        description: 'Lighting • Desk Lamp',
        category: 'Lighting',
        location: 'Office Renovation Project',
        locationType: 'Project',
        status: 'Under Maintenance',
        value: 85.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'Executive Office Chair',
        description: 'Furniture • Chair',
        category: 'Furniture',
        location: 'Reception Area',
        locationType: 'Office',
        status: 'Available',
        value: 450.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'LED Ceiling Panel 40W #2',
        description: 'Lighting • LED Panel',
        category: 'Lighting',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Available',
        value: 192.00,
        carbonImpact: 'Low Impact',
        image: undefined // Test fallback
    },
    {
        assetName: 'Glass Office Partition',
        description: 'Partitions • Partition',
        category: 'Partitions',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Available',
        value: 689.00,
        carbonImpact: 'Low Impact',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
    },
    {
        assetName: 'LED Ceiling Panel 40W #1',
        description: 'Lighting • LED Panel',
        category: 'Lighting',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Available',
        value: 192.00,
        carbonImpact: 'Low Impact',
        image: undefined // Test fallback
    },
    {
        assetName: 'Standing Desk (Motorized)',
        description: 'Furniture • Desk',
        category: 'Furniture',
        location: 'Floor 3 Open Plan',
        locationType: 'Office',
        status: 'In Use',
        value: 850.00,
        carbonImpact: 'Medium Impact',
        image: undefined
    },
    {
        assetName: 'Conference Table (Oak)',
        description: 'Furniture • Table',
        category: 'Furniture',
        location: 'Main Warehouse',
        locationType: 'Warehouse',
        status: 'Reserved',
        value: 1200.00,
        carbonImpact: 'Medium Impact',
        image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=800'
    }
];

const MOCK_INVENTORY: InventoryItem[] = Array.from({ length: 50 }, (_, i) => {
    const template = BASE_INVENTORY_ITEMS[i % BASE_INVENTORY_ITEMS.length];
    return {
        ...template,
        id: `${i + 1}`,
        assetName: `${template.assetName} ${Math.floor(i / BASE_INVENTORY_ITEMS.length) + 1}`, // Add number to differentiate
        status: i % 5 === 0 ? 'Under Maintenance' : i % 3 === 0 ? 'In Use' : 'Available',
    } as InventoryItem;
});

// Summary Data adapted for Inventory
const inventorySummary = {
    total_assets: { label: 'Total Assets', value: '1,248', sub: '+12 this week', icon: <CubeIcon className="w-5 h-5" />, color: 'blue' },
    total_value: { label: 'Total Value', value: '$482.5k', sub: 'Current inventory', icon: <TagIcon className="w-5 h-5" />, color: 'green' },
    low_stock: { label: 'Low Stock', value: '14', sub: 'Action required', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'orange' },
    utilization: { label: 'Utilization', value: '87%', sub: 'Assets in use', icon: <BoltIcon className="w-5 h-5" />, color: 'purple' },
    pending_moves: { label: 'Pending Moves', value: '23', sub: 'In transit', icon: <TruckIcon className="w-5 h-5" />, color: 'indigo' },
};

// Color Mapping for Status Icons (from Transactions)
const colorStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
    green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30',
    pink: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300 ring-1 ring-inset ring-pink-600/20 dark:ring-pink-400/30',
    indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
};

// --- Components ---

interface PageProps {
    onLogout: () => void;
    onNavigateToDetail: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: string) => void;
}

export default function Inventory({ onLogout, onNavigateToDetail, onNavigateToWorkspace, onNavigate }: PageProps) {
    const { currentTenant } = useTenant();

    // State
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>(MOCK_INVENTORY);
    const [activeTab, setActiveTab] = useState<'inventory' | 'locations'>('inventory');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showMetrics, setShowMetrics] = useState(false); // Collapsible status

    // Toast State
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ title: '', description: '', action: '' });

    // Toast Timer Ref
    const toastTimerRef = useRef<any>(null);

    const triggerToast = (title: string, description: string, action: string) => {
        setToastMessage({ title, description, action });
        setShowToast(true);

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
    };

    // Modal State
    const [isRelocateModalOpen, setIsRelocateModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isQuickMovementsModalOpen, setIsQuickMovementsModalOpen] = useState(false);

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 300;
            ref.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Filters
    const [filterStatus, setFilterStatus] = useState('All Statuses');
    const [filterLocation, setFilterLocation] = useState('All Locations');
    const [filterType, setFilterType] = useState('All Types');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 12 : 10;

    // Derived Data
    const uniqueLocations = useMemo(() => Array.from(new Set(inventoryData.map(i => i.location))), [inventoryData]);
    const uniqueTypes = useMemo(() => Array.from(new Set(inventoryData.map(i => i.locationType))), [inventoryData]);

    const filteredData = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesSearch = item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'All Statuses' || item.status === filterStatus;
            const matchesLocation = filterLocation === 'All Locations' || item.location === filterLocation;
            const matchesType = filterType === 'All Types' || item.locationType === filterType;

            return matchesSearch && matchesStatus && matchesLocation && matchesType;
        });
    }, [inventoryData, searchQuery, filterStatus, filterLocation, filterType]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterLocation, filterType, viewMode]);

    // Handlers
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredData.map(i => i.id)));
        }
    };

    // Action Handlers
    const handleRelocateConfirm = (data: any) => {
        if (data.targetLocation) {
            setInventoryData(prev => prev.map(item => {
                if (selectedIds.has(item.id)) {
                    return {
                        ...item,
                        location: data.targetLocation,
                        // Optionally update locationType if we had a mapping, but for now just location.
                    };
                }
                return item;
            }));

            setSelectedIds(new Set());
        }

        console.log('Relocation Requested:', data);
        triggerToast('Asset Move Requested', `Asset #${Array.from(selectedIds)[0] || 'Unknown'} moved to new location.`, 'Movements');
    };

    const handleMaintenanceConfirm = (data: any) => {
        console.log('Maintenance Scheduled:', data);
        triggerToast('Maintenance Scheduled', 'Maintenance request has been created successfully.', 'Maintenance');
    };

    const handleAddAssetConfirm = (newData: any) => {
        const newItems = Array.isArray(newData) ? newData : [newData];

        // Transform form data to InventoryItem type
        const formattedItems = newItems.map((item: any) => ({
            id: item.id || `new-${Math.random().toString(36).substr(2, 9)}`,
            assetName: item.assetName,
            description: `${item.category} • ${item.subCategory || item.category}`,
            category: item.category,
            location: item.location || 'Unassigned',
            locationType: 'Warehouse' as 'Project' | 'Warehouse' | 'Office' | 'Consignment',
            status: item.status || 'Available',
            value: parseFloat(item.value) || 0,
            carbonImpact: 'Low Impact' as 'Low Impact' | 'Medium Impact' | 'High Impact',
            image: item.image // Pass through custom image if any
        }));

        setInventoryData(prev => [...formattedItems, ...prev]);
        console.log('Assets Added:', formattedItems);
    };

    const handleStatusConfirm = (data: any) => {
        setInventoryData(prev => prev.map(item => {
            if (selectedIds.has(item.id)) {
                const updates: any = { status: data.status };

                // Handle Consignment Logic
                if (data.status === 'In Consignment' && data.consignmentLocation) {
                    updates.location = data.consignmentLocation;
                    updates.locationType = 'Consignment';
                } else if (data.status === 'Available' && item.status === 'In Consignment') {
                    updates.location = 'Main Warehouse';
                    updates.locationType = 'Warehouse';
                }

                return { ...item, ...updates };
            }
            return item;
        }));
        setSelectedIds(new Set());
        console.log('Status Updated:', data);
    };

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Under Maintenance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'In Use': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Reserved': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'In Consignment': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Sold': return 'bg-zinc-100 text-zinc-700 dark:bg-card dark:text-zinc-400 line-through opacity-75';
            case 'Write-off': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-card dark:text-zinc-400';
        }
    };

    const getImpactBadge = (impact: string) => {
        return impact === 'Low Impact'
            ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10'
            : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10';
    };

    const getCategoryIcon = (category: string, className: string = "w-12 h-12 mb-2 text-zinc-300 dark:text-zinc-600") => {
        switch (category) {
            case 'Lighting': return <LightBulbIcon className={className} />;
            case 'Furniture': return <TableCellsIcon className={className} />; // TableCells as generic furniture/desk
            case 'Partitions': return <Squares2X2Icon className={className} />;
            default: return <ArchiveBoxIcon className={className} />;
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-24 relative">
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
                            { label: 'Inventory' }
                        ]}
                    />
                </div>

                {/* Header Container */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        {/* Pill-style Tabs (Matching Transactions) */}
                        <div className="flex gap-1 bg-zinc-100 dark:bg-card/50 p-1 rounded-lg w-fit overflow-x-auto max-w-full border border-zinc-200 dark:border-zinc-800">
                            {[
                                { id: 'inventory', label: 'Inventory', count: MOCK_INVENTORY.length },
                                { id: 'locations', label: 'Locations', count: 4 }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap",
                                        activeTab === tab.id
                                            ? "bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm"

                                            : "hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50 dark:hover:text-white"
                                    )}
                                >
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span className={cn(
                                            "text-xs px-1.5 py-0.5 rounded-full transition-colors",
                                            activeTab === tab.id
                                                ? "bg-primary-foreground/20 text-primary-foreground"
                                                : "bg-background text-muted-foreground group-hover:bg-muted font-medium"
                                        )}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collapsible Summary Section */}
                {showMetrics ? (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-end mb-2">
                            <button onClick={() => setShowMetrics(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Hide Details <ChevronUpIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 overflow-x-auto pb-4">
                            {Object.entries(inventorySummary).map(([key, data]) => (
                                <div key={key} className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all group min-w-[200px]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{data.label}</p>
                                            <p className="mt-1 text-3xl font-semibold text-foreground group-hover:scale-105 transition-transform origin-left">{data.value}</p>
                                        </div>
                                        <div
                                            className={cn("p-3 rounded-xl relative group", colorStyles[data.color] || 'bg-zinc-50 text-zinc-600')}
                                            title={data.label}
                                        >
                                            {data.icon}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                        <span className="font-medium">{data.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Expanded Quick Actions Row */}
                        <div className="flex flex-wrap items-center gap-4 mt-2 animate-in fade-in slide-in-from-top-3 duration-500 delay-100">
                            <span className="text-sm font-medium text-muted-foreground">Quick Actions:</span>
                            {[
                                { icon: <PlusIcon className="w-4 h-4" />, label: "Add Stock", onClick: () => setIsAddAssetModalOpen(true) },
                                { icon: <ArrowPathRoundedSquareIcon className="w-4 h-4" />, label: "Transfer", onClick: () => setIsRelocateModalOpen(true) },
                                { icon: <WrenchScrewdriverIcon className="w-4 h-4" />, label: "Maintenance", onClick: () => setIsMaintenanceModalOpen(true) },
                                { icon: <ChartBarIcon className="w-4 h-4" />, label: "Export Report", onClick: () => { } },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.onClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 dark:hover:border-zinc-700 hover:text-zinc-900 transition-all shadow-sm"
                                >
                                    {action.icon}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/60 dark:bg-zinc-800 backdrop-blur-md rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Collapsed Ticker View - Carousel */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                                onClick={() => scroll(scrollContainerRef, 'left')}
                                className="p-1.5 rounded-full hover:bg-brand-50 dark:hover:bg-brand-500/15 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>

                            <div
                                ref={scrollContainerRef}
                                className="flex items-center gap-8 overflow-x-auto w-full scrollbar-hide px-2 scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {Object.entries(inventorySummary).map(([key, data]) => (
                                    <div key={key} className="flex items-center gap-3 min-w-fit group cursor-default">
                                        <div
                                            className={cn("relative flex items-center justify-center w-10 h-10 rounded-full transition-colors", colorStyles[data.color])}
                                            title={data.label}
                                        >
                                            {data.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-foreground leading-none">{data.value}</span>
                                            <span className="text-[10px] text-muted-foreground mt-1 font-medium">{data.label}</span>
                                        </div>
                                        {/* Divider (except last) */}
                                        <div className="h-8 w-px bg-border/50 ml-4 hidden md:block lg:hidden xl:block opacity-50"></div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => scroll(scrollContainerRef, 'right')}
                                className="p-1.5 rounded-full hover:bg-brand-50 dark:hover:bg-brand-500/15 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                        {/* Quick Actions (Product Owner Context) */}
                        <div className="flex items-center gap-1 overflow-x-auto min-w-max pl-4 border-l border-zinc-200 dark:border-zinc-700 xl:border-none xl:pl-0">
                            {[
                                { icon: <QrCodeIcon className="w-5 h-5" />, label: "Scan Item" },
                                { icon: <ArrowPathRoundedSquareIcon className="w-5 h-5" />, label: "Quick Transfer", onClick: () => setIsQuickMovementsModalOpen(true) },
                                { icon: <ClipboardDocumentCheckIcon className="w-5 h-5" />, label: "Start Audit" },
                                { icon: <PlusIcon className="w-5 h-5" />, label: "Add Stock", onClick: () => setIsAddAssetModalOpen(true) },
                            ].map((action, i) => (
                                <button key={i} onClick={action.onClick} className="p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/15 text-muted-foreground hover:text-foreground transition-colors relative group" title={action.label}>
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
                    </div >
                )
                }


                {/* Main Content (Tabs Logic) */}
                {
                    activeTab === 'inventory' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Filters & View Toggle Bar */}
                            <div className="bg-card p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

                                {/* Left: Search & Filters */}
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search assets..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-card/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative">
                                            <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm font-medium hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 dark:hover:border-brand-800 transition-colors appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
                                            >
                                                <option value="All Types">All Types</option>
                                                {uniqueTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                        </div>

                                        <div className="relative">
                                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                            <select
                                                value={filterLocation}
                                                onChange={(e) => setFilterLocation(e.target.value)}
                                                className="pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm font-medium hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:border-brand-400 dark:hover:border-brand-800 transition-colors appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none max-w-[200px] truncate"
                                            >
                                                <option value="All Locations">All Locations</option>
                                                {uniqueLocations.map(loc => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: View Toggle */}
                                <div className="flex bg-zinc-100 dark:bg-card p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50")}
                                    >
                                        <ListBulletIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-foreground" : "text-muted-foreground hover:text-zinc-900 hover:bg-brand-300 dark:hover:bg-brand-600/50")}
                                    >
                                        <Squares2X2Icon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="bg-card dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-zinc-50 dark:bg-card/50 border-b border-zinc-200 dark:border-zinc-800">
                                                <tr>
                                                    <th className="p-4 w-12">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                            checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                                                            onChange={toggleAll}
                                                        />
                                                    </th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Asset</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Category</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Location</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Value</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider">Carbon Impact</th>
                                                    <th className="p-4 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                                {filteredData.map((item) => (
                                                    <tr key={item.id} className={cn("group hover:bg-muted/50 transition-colors", selectedIds.has(item.id) ? "bg-primary/5 hover:bg-primary/10" : "")}>
                                                        <td className="p-4">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                                checked={selectedIds.has(item.id)}
                                                                onChange={() => toggleSelection(item.id)}
                                                            />
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                {item.image ? (
                                                                    <>
                                                                        <img
                                                                            src={item.image}
                                                                            alt={item.assetName}
                                                                            className="w-10 h-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = 'none';
                                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                                e.currentTarget.nextElementSibling?.classList.add('flex');
                                                                            }}
                                                                        />
                                                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-card hidden items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                                                            {getCategoryIcon(item.category, "w-6 h-6 text-zinc-400")}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-card flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                                                        {getCategoryIcon(item.category, "w-6 h-6 text-zinc-400")}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-semibold text-foreground">{item.assetName}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-muted-foreground">{item.category}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                                <span>{item.location}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusBadge(item.status), "border-transparent")}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 font-medium">${item.value.toFixed(2)}</td>
                                                        <td className="p-4">
                                                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getImpactBadge(item.carbonImpact))}>
                                                                {item.carbonImpact}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                                                                <EllipsisHorizontalIcon className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {paginatedData.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSelection(item.id)}
                                            className={cn(
                                                "group bg-card dark:bg-zinc-800 rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden flex flex-col h-[340px]",
                                                selectedIds.has(item.id) ? "border-primary ring-1 ring-primary" : "border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                                            )}
                                        >
                                            {/* Image Section */}
                                            <div className="h-44 w-full relative bg-zinc-100 dark:bg-zinc-900">
                                                {item.image ? (
                                                    <>
                                                        <img
                                                            src={item.image}
                                                            alt={item.assetName}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                e.currentTarget.nextElementSibling?.classList.add('flex');
                                                            }}
                                                        />
                                                        <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 hidden flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
                                                            {getCategoryIcon(item.category)}
                                                            <span className="text-xs font-medium">{item.category}</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-600">
                                                        {getCategoryIcon(item.category)}
                                                        <span className="text-xs font-medium">{item.category}</span>
                                                    </div>
                                                )}

                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                {/* Selection Checkbox */}
                                                <div className="absolute top-3 left-3 z-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(item.id)}
                                                        readOnly
                                                        className="rounded border-zinc-300 text-primary focus:ring-primary shadow-sm w-5 h-5 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => toggleSelection(item.id)}
                                                    />
                                                </div>

                                                {/* Kebab Menu */}
                                                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 bg-background/90 backdrop-blur rounded-lg text-foreground hover:bg-background shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                        <EllipsisHorizontalIcon className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Status Badge (On Image) */}
                                                <div className="absolute bottom-3 right-3 z-10">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border border-white/10",
                                                        getStatusBadge(item.status)
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                                        <h3 className="font-semibold text-foreground truncate text-base" title={item.assetName}>{item.assetName}</h3>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-3 truncate">{item.description}</p>

                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                                                        <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{item.location}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Value</p>
                                                        <p className="text-sm font-bold text-foreground">${item.value.toLocaleString()}</p>
                                                    </div>
                                                    <span className={cn("px-2 py-1 rounded text-[10px] font-medium border border-transparent", getImpactBadge(item.carbonImpact))}>
                                                        {item.carbonImpact === 'Low Impact' ? '🌿 ' : '⚠️ '} {item.carbonImpact.split(' ')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Pagination Footer */}
                            {filteredData.length > 0 && (
                                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-8">
                                    <div className="text-sm text-muted-foreground">
                                        Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(endIndex, filteredData.length)}</span> of <span className="font-medium text-foreground">{filteredData.length}</span> results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let p = i + 1;
                                                if (totalPages > 5 && currentPage > 3) {
                                                    p = currentPage - 2 + i;
                                                    if (p > totalPages) p = totalPages - (4 - i);
                                                }
                                                // Ensure p is valid
                                                if (p < 1) p = 1;

                                                return (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p)}
                                                        className={cn(
                                                            "w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                                                            currentPage === p
                                                                ? "bg-primary text-primary-foreground"
                                                                : "text-foreground hover:bg-accent"
                                                        )}
                                                    >
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Locations Tab */}
                {activeTab === 'locations' && <InventoryLocations />}

            </div >

            {/* Sticky Bulk Actions Footer */}
            {
                selectedIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="flex items-center gap-2 border-r border-zinc-200 dark:border-zinc-700 pr-6">
                            <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                                {selectedIds.size}
                            </div>
                            <span className="text-sm font-medium text-foreground">Selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsStatusModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors group"
                            >
                                <div className="p-0.5 rounded-md transition-colors group-hover:bg-brand-300 dark:group-hover:bg-transparent">
                                    <ArrowPathRoundedSquareIcon className="w-4 h-4 text-muted-foreground group-hover:text-zinc-600 dark:group-hover:text-primary transition-colors" />
                                </div>
                                Change Status
                            </button>
                            <button
                                onClick={() => setIsRelocateModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors group"
                            >
                                <MapPinIcon className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                                Move
                            </button>
                            <button
                                onClick={() => setIsMaintenanceModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-lg text-sm font-medium text-foreground transition-colors group"
                            >
                                <WrenchScrewdriverIcon className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                                Maintenance
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 transition-colors group">
                                <TrashIcon className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Toast Notification */}
            {
                showToast && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                        <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-2xl p-4 flex items-start gap-4 max-w-md border border-zinc-800 dark:border-zinc-200">
                            <div className="bg-green-500/20 text-green-500 p-2 rounded-full shrink-0">
                                <CheckCircleIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{toastMessage.title}</h4>
                                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">{toastMessage.description}</p>
                                <div className="mt-3 flex gap-3">
                                    <button
                                        onClick={() => onNavigate('mac')}
                                        className="text-xs font-semibold text-primary hover:underline"
                                    >
                                        View in MAC
                                    </button>
                                    <button
                                        onClick={() => setShowToast(false)}
                                        className="text-xs font-medium text-zinc-500 hover:text-zinc-300 dark:hover:text-zinc-700"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modals */}
            <RelocateAssetModal
                isOpen={isRelocateModalOpen}
                onClose={() => setIsRelocateModalOpen(false)}
                selectedCount={selectedIds.size || 1}
                onConfirm={handleRelocateConfirm}
            />

            <MaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                selectedCount={selectedIds.size || 1}
                onConfirm={handleMaintenanceConfirm}
            />

            <SmartAddAssetModal
                isOpen={isAddAssetModalOpen}
                onClose={() => setIsAddAssetModalOpen(false)}
                onConfirm={handleAddAssetConfirm}
            />

            <ChangeStatusModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                selectedCount={selectedIds.size || 1}
                onConfirm={handleStatusConfirm}
            />

            <QuickMovementsModal
                isOpen={isQuickMovementsModalOpen}
                onClose={() => setIsQuickMovementsModalOpen(false)}
            />
        </div >
    );
}
