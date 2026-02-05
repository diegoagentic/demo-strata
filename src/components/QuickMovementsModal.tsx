import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    MapPinIcon,
    CubeIcon,
    TruckIcon,
    SparklesIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    HomeModernIcon,
    ArchiveBoxIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useMemo } from 'react';

// Types
interface Asset {
    id: string;
    name: string;
    category: string;
    image?: string;
    status: string;
    currentLocation: string;
}

interface PendingMove {
    assetId: string;
    fromZoneId: string;
    toZoneId: string;
    assetName: string;
    timestamp: number;
}

interface DropZone {
    id: string;
    name: string;
    type: 'office' | 'warehouse' | 'project';
    capacity: number;
    items: Asset[];
    icon: React.ElementType;
}

const MOCK_ASSETS: Asset[] = [
    // Unassigned Assets (High Volume)
    { id: '1', name: 'Herman Miller Aeron', category: 'Furniture', status: 'Available', currentLocation: 'Unassigned', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=200' },
    { id: '2', name: 'Dell UltraSharp 27"', category: 'Electronics', status: 'Available', currentLocation: 'Unassigned', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=200' },
    { id: '3', name: 'Standing Desk Pro', category: 'Furniture', status: 'Available', currentLocation: 'Unassigned' },
    { id: '4', name: 'Glass Whiteboard', category: 'Office', status: 'Available', currentLocation: 'Unassigned' },
    { id: '5', name: 'Logitech MX Master 3', category: 'Electronics', status: 'Available', currentLocation: 'Unassigned' },
    { id: '6', name: 'Conference Chair', category: 'Furniture', status: 'In Repair', currentLocation: 'Unassigned' },
    { id: '7', name: 'Cisco IP Phone', category: 'Electronics', status: 'Available', currentLocation: 'Unassigned' },
    { id: '8', name: 'Filing Cabinet', category: 'Storage', status: 'Available', currentLocation: 'Unassigned' },
    { id: '9', name: 'MacBook Pro 16"', category: 'Electronics', status: 'Assigned', currentLocation: 'Unassigned', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=200' },
    { id: '10', name: 'Printer HP LaserJet', category: 'Electronics', status: 'Maintenance', currentLocation: 'Unassigned' },
    { id: '11', name: 'Sony Projector', category: 'Electronics', status: 'Available', currentLocation: 'Unassigned' },
    { id: '12', name: 'Reception Desk', category: 'Furniture', status: 'Available', currentLocation: 'Unassigned' },
    { id: '13', name: 'Lounge Sofa', category: 'Furniture', status: 'Available', currentLocation: 'Unassigned' },
    { id: '14', name: 'Water Dispenser', category: 'Appliances', status: 'Available', currentLocation: 'Unassigned' },
    { id: '15', name: 'Coffee Machine', category: 'Appliances', status: 'Available', currentLocation: 'Unassigned' },
];

const INITIAL_ZONES: DropZone[] = [
    {
        id: 'zone-office-3',
        name: 'Main Office - Floor 3',
        type: 'office',
        capacity: 50,
        items: [
            { id: 'z1-1', name: 'Office Desk', category: 'Furniture', status: 'In Use', currentLocation: 'Main Office - Floor 3' },
            { id: 'z1-2', name: 'Office Chair', category: 'Furniture', status: 'In Use', currentLocation: 'Main Office - Floor 3' },
            { id: 'z1-3', name: 'Monitor', category: 'Electronics', status: 'In Use', currentLocation: 'Main Office - Floor 3' },
            { id: 'z1-4', name: 'Monitor', category: 'Electronics', status: 'In Use', currentLocation: 'Main Office - Floor 3' },
            { id: 'z1-5', name: 'Desk Lamp', category: 'Furniture', status: 'In Use', currentLocation: 'Main Office - Floor 3' },
            { id: 'z1-6', name: 'Docking Station', category: 'Electronics', status: 'In Use', currentLocation: 'Main Office - Floor 3' },
        ],
        icon: BuildingOfficeIcon
    },
    {
        id: 'zone-warehouse-a',
        name: 'Central Warehouse - Zone A',
        type: 'warehouse',
        capacity: 200,
        items: [
            { id: 'z2-1', name: 'Pallet Jack', category: 'Logistics', status: 'Available', currentLocation: 'Central Warehouse - Zone A' },
            { id: 'z2-2', name: 'Shelving Unit', category: 'Storage', status: 'Available', currentLocation: 'Central Warehouse - Zone A' },
            { id: 'z2-3', name: 'Spare Tires', category: 'Automotive', status: 'Available', currentLocation: 'Central Warehouse - Zone A' },
            { id: 'z2-4', name: 'Generator', category: 'Equipment', status: 'Maintenance', currentLocation: 'Central Warehouse - Zone A' },
            { id: 'z2-5', name: 'Ladder', category: 'Equipment', status: 'Available', currentLocation: 'Central Warehouse - Zone A' },
        ],
        icon: ArchiveBoxIcon
    },
    {
        id: 'zone-project-beta',
        name: 'Project Beta Site',
        type: 'project',
        capacity: 30,
        items: [
            { id: 'z3-1', name: 'Safety Gear Box', category: 'Safety', status: 'In Use', currentLocation: 'Project Beta Site' },
            { id: 'z3-2', name: 'Tool Kit', category: 'Tools', status: 'In Use', currentLocation: 'Project Beta Site' },
        ],
        icon: HomeModernIcon
    },
    {
        id: 'zone-recycling',
        name: 'Recycling Center',
        type: 'warehouse',
        capacity: 500,
        items: [],
        icon: ArrowPathIcon
    },
];

interface QuickMovementsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickMovementsModal({ isOpen, onClose }: QuickMovementsModalProps) {
    const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
    const [zones, setZones] = useState<DropZone[]>(INITIAL_ZONES);

    // State: Selection & Filtering
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    // State: Transactional Mode
    const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([]);

    // State: UI
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [showBulkMove, setShowBulkMove] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Toggle accordion
    const toggleCategory = (zoneId: string, category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [`${zoneId}-${category}`]: !prev[`${zoneId}-${category}`]
        }));
    };

    // Refs for drop zones to calculate collision
    const zoneRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
    const subsectionRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleDragStart = (id: string) => {
        setDraggingId(id);
    };

    const handleDrag = (event: any, info: any) => {
        const dropTarget = detectDropZone(info.point);
        // Compare composite IDs
        if (dropTarget !== activeDropZone) {
            setActiveDropZone(dropTarget);
        }
    };

    const handleDragEnd = (event: any, info: any, asset: Asset, sourceZoneId: string) => {
        setDraggingId(null);
        setActiveDropZone(null);

        const dropTarget = detectDropZone(info.point);

        // Parse drop target (could be "zoneId" or "zoneId::category")
        const targetZoneId = dropTarget ? dropTarget.split('::')[0] : null;

        if (targetZoneId && targetZoneId !== sourceZoneId) {
            // Handle Multi-Select Drag
            if (selectedAssetIds.includes(asset.id)) {
                // Move ALL selected items
                selectedAssetIds.forEach(id => {
                    // Find the full asset object (could be in unassigned or a zone)
                    // limit to unassigned for V1 of multi-select to simplify
                    const assetObj = assets.find(a => a.id === id);
                    if (assetObj) {
                        stageMove(assetObj, targetZoneId, 'unassigned');
                    }
                });
            } else {
                // Move single item
                stageMove(asset, targetZoneId, sourceZoneId);
            }
        }
    };

    const detectDropZone = (point: { x: number, y: number }): string | null => {
        const BUFFER = 50; // 50px buffer to make dropping easier

        // 1. Check Subsections first (Priority)
        for (const key in subsectionRefs.current) {
            const el = subsectionRefs.current[key];
            if (el) {
                const rect = el.getBoundingClientRect();
                if (
                    point.x >= rect.left &&
                    point.x <= rect.right &&
                    point.y >= rect.top &&
                    point.y <= rect.bottom
                ) {
                    return key; // Returns "zoneId::category"
                }
            }
        }

        // 2. Check general Zones
        for (const zone of zones) {
            const el = zoneRefs.current[zone.id];
            if (el) {
                const rect = el.getBoundingClientRect();
                if (
                    point.x >= rect.left - BUFFER &&
                    point.x <= rect.right + BUFFER &&
                    point.y >= rect.top - BUFFER &&
                    point.y <= rect.bottom + BUFFER
                ) {
                    return zone.id;
                }
            }
        }
        return null;
    };

    const stageMove = (asset: Asset, targetZoneId: string, sourceZoneId: string) => {
        // Validation: Verify capacity
        const targetZone = zones.find(z => z.id === targetZoneId);
        if (targetZone) {
            const pendingIncoming = pendingMoves.filter(m => m.toZoneId === targetZoneId).length;
            if (targetZone.items.length + pendingIncoming >= targetZone.capacity) {
                // In a real app, show toast error here
                console.warn("Zone capacity exceeded");

                // AI Intervention (Mock)
                setAiSuggestions(["Zone capacity limit reached. Suggest moving to Warehouse instead."]);
                setShowAiPanel(true);
                return;
            }
        }

        const newMove: PendingMove = {
            assetId: asset.id,
            fromZoneId: sourceZoneId,
            toZoneId: targetZoneId,
            assetName: asset.name,
            timestamp: Date.now()
        };

        // If item already has a pending move, update it; otherwise add new
        setPendingMoves(prev => {
            const existing = prev.find(m => m.assetId === asset.id);
            if (existing) {
                // If moving back to original, remove the pending move (Undo)
                if (targetZoneId === existing.fromZoneId) {
                    return prev.filter(m => m.assetId !== asset.id);
                }
                // Update target
                return prev.map(m => m.assetId === asset.id ? { ...m, toZoneId: targetZoneId } : m);
            }
            return [...prev, newMove];
        });
    };

    const commitMoves = () => {
        // 1. Execute all pending moves
        const moves = [...pendingMoves];

        let newAssets = [...assets];
        let newZones = zones.map(z => ({ ...z, items: [...z.items] }));

        moves.forEach(move => {
            // Find item
            let item: Asset | undefined;

            // Remove from source
            if (move.fromZoneId === 'unassigned') {
                item = newAssets.find(a => a.id === move.assetId);
                newAssets = newAssets.filter(a => a.id !== move.assetId);
            } else {
                const sourceZone = newZones.find(z => z.id === move.fromZoneId);
                if (sourceZone) {
                    item = sourceZone.items.find(i => i.id === move.assetId);
                    sourceZone.items = sourceZone.items.filter(i => i.id !== move.assetId);
                }
            }

            // Add to target
            if (item) {
                const targetZone = newZones.find(z => z.id === move.toZoneId);
                if (targetZone) {
                    // Check if item isn't already there (double safety)
                    if (!targetZone.items.find(i => i.id === item!.id)) {
                        targetZone.items.push({ ...item, currentLocation: targetZone.name });
                    }
                }
            }
        });

        setAssets(newAssets);
        setZones(newZones);
        setPendingMoves([]);
        setSelectedAssetIds([]);
        // Notify success
    };

    // --- Computed Views for Rendering (Transactional UI) ---
    const effectiveAssets = useMemo(() => {
        // Show assets that are NOT pending to be moved OUT of 'unassigned'
        const pendingOut = pendingMoves.filter(m => m.fromZoneId === 'unassigned').map(m => m.assetId);
        return assets.filter(a => !pendingOut.includes(a.id));
    }, [assets, pendingMoves]);

    const effectiveZones = useMemo(() => {
        return zones.map(zone => {
            // 1. Items currently in zone MINUS items pending to leave
            const pendingLeaving = pendingMoves.filter(m => m.fromZoneId === zone.id).map(m => m.assetId);
            const remainingItems = zone.items.filter(i => !pendingLeaving.includes(i.id));

            // 2. Items pending to enter this zone
            const pendingEntering = pendingMoves.filter(m => m.toZoneId === zone.id).map(m => {
                // We need the asset object. It could be in 'unassigned' or another zone.
                let asset = assets.find(a => a.id === m.assetId); // Check unassigned
                if (!asset) {
                    // Check other zones
                    for (const z of zones) {
                        const found = z.items.find(i => i.id === m.assetId);
                        if (found) { asset = found; break; }
                    }
                }
                return asset ? { ...asset, isPending: true } : null;
            }).filter(Boolean) as (Asset & { isPending?: boolean })[];

            return {
                ...zone,
                items: [...remainingItems, ...pendingEntering]
            };
        });
    }, [zones, pendingMoves, assets]);

    const generateAiSuggestions = () => {
        setShowAiPanel(true);
        setAiSuggestions([]);

        // Simulate loading
        setTimeout(() => {
            setAiSuggestions([
                "Move 2 'Executive Chairs' to Main Office (Low Stock)",
                "Relocate 'Whiteboard' to Renovation Site (Requested)",
                "Optimizing Warehouse capacity..."
            ]);
        }, 800);
    };

    const applyAiSuggestion = () => {
        // Demo: Move first remaining asset to Office
        if (effectiveAssets.length > 0) {
            stageMove(effectiveAssets[0], 'zone-office-3', 'unassigned');
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-6xl h-[80vh] flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">

                                {/* Header */}
                                <div className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center z-10">
                                    <div>
                                        <Dialog.Title className="text-xl font-bold text-foreground flex items-center gap-2">
                                            <ArrowPathIcon className="w-6 h-6 text-indigo-500" />
                                            Quick Movements
                                        </Dialog.Title>
                                        <p className="text-sm text-muted-foreground">Drag and drop assets to organize your facility.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={generateAiSuggestions}
                                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-indigo-500/20"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            AI Smart Optimization
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                        >
                                            <XMarkIcon className="w-6 h-6 text-zinc-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Area */}
                                <div className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col sm:flex-row bg-zinc-50/50 dark:bg-zinc-950/50">

                                    {/* Sidebar: Assets */}
                                    <div className="w-full sm:w-80 bg-white dark:bg-zinc-900 border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-4 shadow-inner shrink-0">

                                        {/* Filter Toolbar */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setShowBulkMove(!showBulkMove)}
                                                        className={clsx(
                                                            "p-2 rounded-lg transition-colors",
                                                            showBulkMove ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
                                                        )}
                                                        title="Bulk Move Tool"
                                                    >
                                                        <TruckIcon className="w-5 h-5" />
                                                    </button>
                                                    <div className="flex flex-col">
                                                        <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Unassigned Assets</h3>
                                                        <span className="text-xs text-muted-foreground">{effectiveAssets.length} items</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bulk Move Tool */}
                                            <AnimatePresence>
                                                {showBulkMove && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 space-y-3">
                                                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                                <TruckIcon className="w-3 h-3" />
                                                                Bulk Move {selectedAssetIds.length > 0 ? `(${selectedAssetIds.length} selected)` : ''}
                                                            </p>

                                                            {selectedAssetIds.length === 0 ? (
                                                                <p className="text-[10px] text-zinc-500 italic">Select items from the list below first.</p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    <select
                                                                        className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                                                        onChange={(e) => {
                                                                            if (e.target.value) {
                                                                                selectedAssetIds.forEach(id => {
                                                                                    const asset = assets.find(a => a.id === id);
                                                                                    if (asset) stageMove(asset, e.target.value, 'unassigned');
                                                                                });
                                                                                setShowBulkMove(false);
                                                                            }
                                                                        }}
                                                                        defaultValue=""
                                                                    >
                                                                        <option value="" disabled>Select Target Zone...</option>
                                                                        {zones.map(z => (
                                                                            <option key={z.id} value={z.id}>{z.name} ({z.capacity - z.items.length} left)</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search assets..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                                />
                                                <svg className="w-4 h-4 text-zinc-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>

                                            <div className="flex gap-2 text-xs overflow-x-auto pb-1 no-scrollbar">
                                                {['All', 'Furniture', 'Electronics', 'Office'].map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setFilterCategory(cat)}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-full whitespace-nowrap transition-colors",
                                                            filterCategory === cat
                                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-medium"
                                                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                                        )}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                <input
                                                    type="checkbox"
                                                    id="selectAll"
                                                    checked={selectedAssetIds.length === effectiveAssets.length && effectiveAssets.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedAssetIds(effectiveAssets.map(a => a.id));
                                                        } else {
                                                            setSelectedAssetIds([]);
                                                        }
                                                    }}
                                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor="selectAll" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                                                    Select All ({selectedAssetIds.length})
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3 min-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                                            <AnimatePresence>
                                                {effectiveAssets.map((asset) => (
                                                    <motion.div
                                                        key={asset.id}
                                                        layoutId={asset.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.5 }}
                                                        drag
                                                        dragSnapToOrigin
                                                        dragElastic={1}
                                                        onDragStart={() => handleDragStart(asset.id)}
                                                        onDrag={handleDrag}
                                                        onDragEnd={(e, info) => handleDragEnd(e, info, asset, 'unassigned')}
                                                        className={clsx(
                                                            "bg-white dark:bg-zinc-800 p-3 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group relative z-20",
                                                            selectedAssetIds.includes(asset.id) ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10" : "border-zinc-200 dark:border-zinc-700"
                                                        )}
                                                        onClick={(e) => {
                                                            // Multi-select logic on click
                                                            if (e.ctrlKey || e.metaKey) {
                                                                if (selectedAssetIds.includes(asset.id)) {
                                                                    setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                                                                } else {
                                                                    setSelectedAssetIds(prev => [...prev, asset.id]);
                                                                }
                                                            } else {
                                                                // Toggle single selection if not dragging
                                                                if (selectedAssetIds.includes(asset.id)) {
                                                                    setSelectedAssetIds(prev => prev.filter(id => id !== asset.id));
                                                                } else {
                                                                    setSelectedAssetIds([asset.id]);
                                                                }
                                                            }
                                                        }}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileDrag={{ scale: 1.1, zIndex: 9999, cursor: 'grabbing' }}
                                                    >
                                                        {selectedAssetIds.includes(asset.id) && (
                                                            <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                                                {asset.image ? (
                                                                    <img src={asset.image} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <CubeIcon className="w-6 h-6 text-zinc-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-foreground">{asset.name}</h4>
                                                                <p className="text-xs text-muted-foreground">{asset.category}</p>
                                                            </div>
                                                        </div>
                                                        {/* Mobile Actions (Drag alternative) */}
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => stageMove(asset, 'zone-office-3', 'unassigned')}
                                                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-xs"
                                                                title="Move to Office"
                                                            >🏢</button>
                                                            <button
                                                                onClick={() => stageMove(asset, 'zone-warehouse-a', 'unassigned')}
                                                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-xs"
                                                                title="Move to Warehouse"
                                                            >📦</button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {effectiveAssets.length === 0 && (
                                                <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                                    <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                                    <p className="text-sm">All assets assigned!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visual Map Area */}
                                    <div className="flex-1 p-6 relative">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-32">
                                            {effectiveZones.map((zone) => {
                                                // Group items by category (Memoize this if performance becomes an issue)
                                                const groupedItems = zone.items.reduce((acc, item) => {
                                                    const cat = item.category || 'Other';
                                                    if (!acc[cat]) acc[cat] = [];
                                                    acc[cat].push(item);
                                                    return acc;
                                                }, {} as Record<string, typeof zone.items>);

                                                // Sort categories alphabetically or by custom order if needed
                                                const categories = Object.keys(groupedItems).sort();

                                                return (
                                                    <div
                                                        key={zone.id}
                                                        ref={el => { zoneRefs.current[zone.id] = el; }}
                                                        className={clsx(
                                                            "rounded-3xl border-2 border-dashed flex flex-col transition-all min-h-[400px] overflow-hidden bg-white/50 dark:bg-zinc-900/50",
                                                            draggingId ? "scale-[1.01]" : "",
                                                            activeDropZone === zone.id || activeDropZone?.startsWith(zone.id + '::')
                                                                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/10 shadow-xl scale-[1.02]"
                                                                : "border-zinc-200 dark:border-zinc-700"
                                                        )}
                                                    >
                                                        {/* Zone Header (Fixed) */}
                                                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-30">
                                                            <div className="flex items-center gap-3">
                                                                <div className={clsx("p-2 rounded-xl shadow-sm",
                                                                    zone.type === 'office' ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                                                        zone.type === 'warehouse' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
                                                                            "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                                                )}>
                                                                    <zone.icon className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-bold text-sm text-foreground truncate">{zone.name}</h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="h-1.5 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                            <motion.div
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${Math.min((zone.items.length / zone.capacity) * 100, 100)}%` }}
                                                                                className={clsx(
                                                                                    "h-full rounded-full transition-all duration-500",
                                                                                    zone.items.length >= zone.capacity ? "bg-red-500" :
                                                                                        zone.items.length > zone.capacity * 0.8 ? "bg-amber-500" : "bg-green-500"
                                                                                )}
                                                                            />
                                                                        </div>
                                                                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                                                            {zone.items.length}/{zone.capacity}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Scrollable Content Area */}
                                                        <div className="flex-1 p-3 overflow-y-auto max-h-[350px] custom-scrollbar space-y-2 relative">
                                                            {zone.items.length === 0 && (
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
                                                                    <CubeIcon className="w-10 h-10 opacity-20 mb-2" />
                                                                    <p className="text-xs">Drop items here</p>
                                                                </div>
                                                            )}

                                                            {categories.map((category) => {
                                                                const isExpanded = expandedCategories[`${zone.id}-${category}`] ?? true;
                                                                return (
                                                                    <div
                                                                        key={category}
                                                                        ref={el => { subsectionRefs.current[`${zone.id}::${category}`] = el; }}
                                                                        className={clsx(
                                                                            "bg-white dark:bg-zinc-800/40 rounded-lg border overflow-hidden shadow-sm transition-all duration-200",
                                                                            activeDropZone === `${zone.id}::${category}`
                                                                                ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-900/10 scale-[1.02] shadow-md z-10"
                                                                                : "border-zinc-100 dark:border-zinc-800"
                                                                        )}>
                                                                        <button
                                                                            onClick={() => toggleCategory(zone.id, category)}
                                                                            className="w-full flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                {isExpanded ? <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-400" />}
                                                                                <span className="text-xs font-semibold text-foreground">{category}</span>
                                                                            </div>
                                                                            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
                                                                                {groupedItems[category].length}
                                                                            </span>
                                                                        </button>

                                                                        <AnimatePresence>
                                                                            {isExpanded && (
                                                                                <motion.div
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                    className="overflow-hidden"
                                                                                >
                                                                                    <div className="p-2 pt-0 grid grid-cols-4 gap-2">
                                                                                        {groupedItems[category].map((item) => (
                                                                                            <motion.div
                                                                                                layoutId={item.id} // Retain layoutId for smooth transitions if dragging within same context
                                                                                                key={item.id}
                                                                                                drag
                                                                                                dragSnapToOrigin
                                                                                                dragElastic={0.5} // Reduce elasticity slightly for inner items
                                                                                                onDragStart={() => handleDragStart(item.id)}
                                                                                                onDrag={handleDrag}
                                                                                                onDragEnd={(e, info) => handleDragEnd(e, info, item, zone.id)}
                                                                                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                                                                                whileDrag={{ scale: 1.1, zIndex: 9999, cursor: 'grabbing' }}
                                                                                                className={clsx(
                                                                                                    "aspect-square rounded-lg border flex flex-col items-center justify-center p-1 text-center shadow-sm relative cursor-grab active:cursor-grabbing bg-white dark:bg-zinc-800",
                                                                                                    (item as any).isPending
                                                                                                        ? "border-indigo-300 dark:border-indigo-700 opacity-80"
                                                                                                        : "border-zinc-200 dark:border-zinc-700"
                                                                                                )}
                                                                                            >
                                                                                                <div className="w-6 h-6 bg-zinc-50 dark:bg-zinc-700/50 rounded flex items-center justify-center overflow-hidden mb-1">
                                                                                                    {item.image ? (
                                                                                                        <img src={item.image} className="w-full h-full object-cover" />
                                                                                                    ) : (
                                                                                                        <CubeIcon className="w-3.5 h-3.5 text-zinc-300" />
                                                                                                    )}
                                                                                                </div>
                                                                                                <p className="text-[9px] leading-tight font-medium truncate w-full px-0.5 text-zinc-600 dark:text-zinc-300">{item.name}</p>

                                                                                                {/* Pending Badge */}
                                                                                                {(item as any).isPending && (
                                                                                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-800 z-20 shadow-sm" />
                                                                                                )}
                                                                                            </motion.div>
                                                                                        ))}
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* AI Suggestions Overlay */}
                                        <AnimatePresence>
                                            {showAiPanel && (
                                                <motion.div
                                                    initial={{ y: 100, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: 100, opacity: 0 }}
                                                    className="absolute bottom-6 left-6 right-6 bg-white dark:bg-zinc-800 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 z-50 ring-1 ring-indigo-500/20"
                                                >
                                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shrink-0">
                                                        <SparklesIcon className="w-6 h-6 animate-pulse" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                            AI Suggestions
                                                            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">BETA</span>
                                                        </h4>
                                                        <div className="space-y-1 mt-1">
                                                            {aiSuggestions.length === 0 ? (
                                                                <p className="text-sm text-muted-foreground animate-pulse">Analyzing inventory patterns...</p>
                                                            ) : (
                                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                                    {aiSuggestions.map((sug, i) => (
                                                                        <li key={i} className="flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                                                            {sug}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {aiSuggestions.length > 0 && (
                                                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                            <button
                                                                onClick={() => setShowAiPanel(false)}
                                                                className="px-4 py-2 text-zinc-500 hover:text-zinc-700 text-sm font-medium"
                                                            >
                                                                Dismiss
                                                            </button>
                                                            <button
                                                                onClick={applyAiSuggestion}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm whitespace-nowrap"
                                                            >
                                                                Apply All
                                                            </button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>
                                </div>

                                {/* Transactional Footer */}
                                {pendingMoves.length > 0 && (
                                    <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 px-6 flex items-center justify-between animate-in slide-in-from-bottom duration-300 z-50">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                                {pendingMoves.length}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">Pending Moves</p>
                                                <p className="text-xs text-muted-foreground hidden sm:block">
                                                    {pendingMoves.slice(-1)[0].assetName} ➝ {zones.find(z => z.id === pendingMoves.slice(-1)[0].toZoneId)?.name}
                                                    {pendingMoves.length > 1 && ` (+${pendingMoves.length - 1} more)`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setPendingMoves([])}
                                                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                            >
                                                Undo All
                                            </button>
                                            <button
                                                onClick={commitMoves}
                                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                                Confirm Transfers
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition >
    );
}

// Add simple CSS for custom grid background if needed
const css = `
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0.1);
    border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,0.1);
}
.custom-grid-bg {
    background-size: 20px 20px;
    background-image: radial-gradient(circle, #00000008 1px, transparent 1px);
}
.dark .custom-grid-bg {
    background-image: radial-gradient(circle, #ffffff08 1px, transparent 1px);
}
`;
