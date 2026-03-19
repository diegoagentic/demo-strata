import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    MapPinIcon,
    CubeIcon,
    SparklesIcon,
    ArrowPathIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ArrowRightIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

// Types
interface Asset {
    id: string;
    name: string;
    category: string;
    status: string;
}

interface PendingMove {
    assetId: string;
    assetName: string;
    timestamp: number;
}

// ─── FM Flow 2 contextual data ─────────────────────────────────────────────
// Carlos Rivera's workstation assets in Office 3-214
const FM_ASSETS: Asset[] = [
    { id: 'fm-1', name: 'Laptop Dock (Dell WD19)', category: 'Electronics', status: 'In Use' },
    { id: 'fm-2', name: 'Monitor — Dell U2722D (1/2)', category: 'Electronics', status: 'In Use' },
    { id: 'fm-3', name: 'Monitor — Dell U2722D (2/2)', category: 'Electronics', status: 'In Use' },
    { id: 'fm-4', name: 'Keyboard + Mouse Kit', category: 'Peripherals', status: 'In Use' },
    { id: 'fm-5', name: 'Desk Lamp (LED)', category: 'Furniture', status: 'Maintenance' },
];

interface QuickMovementsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function QuickMovementsModal({ isOpen, onClose }: QuickMovementsModalProps) {
    // Assets in source (Office 3-214) — items not yet moved
    const [sourceAssets, setSourceAssets] = useState<Asset[]>(FM_ASSETS);
    // Assets in destination (Office 3-216) — items moved
    const [destAssets, setDestAssets] = useState<Asset[]>([]);
    // Pending moves (staged but not confirmed)
    const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([]);
    // AI animation state
    const [aiAnimating, setAiAnimating] = useState(false);
    const [aiComplete, setAiComplete] = useState(false);
    // Confirmation modal
    const [showConfirmation, setShowConfirmation] = useState(false);
    // Source/dest accordion
    const [sourceExpanded, setSourceExpanded] = useState(true);
    const [destExpanded, setDestExpanded] = useState(true);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSourceAssets(FM_ASSETS);
            setDestAssets([]);
            setPendingMoves([]);
            setAiAnimating(false);
            setAiComplete(false);
            setShowConfirmation(false);
        }
    }, [isOpen]);

    // Move a single asset from source to destination (with animation)
    const moveAsset = useCallback((asset: Asset) => {
        setSourceAssets(prev => prev.filter(a => a.id !== asset.id));
        setDestAssets(prev => [...prev, asset]);
        setPendingMoves(prev => [...prev, { assetId: asset.id, assetName: asset.name, timestamp: Date.now() }]);
    }, []);

    // AI Smart Optimization — auto-animate all moves with stagger
    const runAiOptimization = useCallback(() => {
        if (aiAnimating || sourceAssets.length === 0) return;
        setAiAnimating(true);
        setAiComplete(false);

        const assetsToMove = [...sourceAssets];
        const timers: ReturnType<typeof setTimeout>[] = [];

        assetsToMove.forEach((asset, i) => {
            timers.push(setTimeout(() => {
                moveAsset(asset);
                // Last asset — mark AI as complete
                if (i === assetsToMove.length - 1) {
                    setTimeout(() => {
                        setAiAnimating(false);
                        setAiComplete(true);
                    }, 400);
                }
            }, 600 + i * 700));
        });

        return () => timers.forEach(clearTimeout);
    }, [aiAnimating, sourceAssets, moveAsset]);

    // Confirm transfers
    const confirmTransfers = () => {
        setShowConfirmation(true);
    };

    const hasPendingMoves = pendingMoves.length > 0;

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
                    <div className="flex min-h-full items-center justify-center p-4 pl-[340px]">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl h-[70vh] flex flex-col bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">

                                {/* Header */}
                                <div className="p-5 bg-card border-b border-border flex justify-between items-center z-10">
                                    <div>
                                        <Dialog.Title className="text-lg font-bold text-foreground flex items-center gap-2">
                                            <ArrowPathIcon className="w-5 h-5 text-blue-500" />
                                            Quick Transfer — Office Relocation
                                        </Dialog.Title>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            REQ-FM-2026-018 · Relocate Carlos Rivera's workstation from <span className="font-semibold text-foreground">Office 3-214</span> → <span className="font-semibold text-foreground">Office 3-216</span> (vacant)
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={runAiOptimization}
                                            disabled={aiAnimating || sourceAssets.length === 0}
                                            className={clsx(
                                                "hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md",
                                                aiAnimating
                                                    ? "bg-indigo-400 text-white cursor-wait"
                                                    : sourceAssets.length === 0
                                                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                                                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-indigo-500/20"
                                            )}
                                        >
                                            <SparklesIcon className={clsx("w-4 h-4", aiAnimating && "animate-spin")} />
                                            {aiAnimating ? 'Optimizing...' : 'AI Smart Optimization'}
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-accent rounded-full transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5 text-zinc-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Area — Two columns */}
                                <div className="flex-1 overflow-y-auto relative custom-scrollbar grid grid-cols-2 gap-0 bg-muted/20">

                                    {/* FROM: Office 3-214 */}
                                    <div className="border-r border-border flex flex-col">
                                        <div className="p-4 border-b border-border bg-red-50/50 dark:bg-red-500/5 flex items-center gap-3 sticky top-0 z-10">
                                            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                <BuildingOfficeIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm text-foreground">Office 3-214</h3>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold">SOURCE</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">Carlos Rivera's current workspace</p>
                                            </div>
                                            <button onClick={() => setSourceExpanded(!sourceExpanded)} className="p-1 hover:bg-accent rounded">
                                                {sourceExpanded ? <ChevronDownIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {sourceExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="flex-1 p-4 space-y-2 overflow-y-auto"
                                                >
                                                    {sourceAssets.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                                            <CheckCircleIcon className="w-8 h-8 text-green-500 mb-2" />
                                                            <p className="text-sm font-medium">All items relocated</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">Office 3-214 is now empty</p>
                                                        </div>
                                                    ) : (
                                                        sourceAssets.map((asset) => (
                                                            <motion.div
                                                                key={asset.id}
                                                                layout
                                                                initial={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: 60, scale: 0.8 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm group hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors"
                                                            >
                                                                <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                                                    <CubeIcon className="w-4 h-4 text-muted-foreground/60" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{asset.category} · {asset.status}</p>
                                                                </div>
                                                                {!aiAnimating && (
                                                                    <button
                                                                        onClick={() => moveAsset(asset)}
                                                                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Move to Office 3-216"
                                                                    >
                                                                        <ArrowRightIcon className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* TO: Office 3-216 */}
                                    <div className="flex flex-col">
                                        <div className="p-4 border-b border-border bg-green-50/50 dark:bg-green-500/5 flex items-center gap-3 sticky top-0 z-10">
                                            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                                <BuildingOfficeIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm text-foreground">Office 3-216</h3>
                                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 font-bold">DESTINATION</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">Temporary workspace (vacant)</p>
                                            </div>
                                            <button onClick={() => setDestExpanded(!destExpanded)} className="p-1 hover:bg-accent rounded">
                                                {destExpanded ? <ChevronDownIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />}
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {destExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="flex-1 p-4 space-y-2 overflow-y-auto"
                                                >
                                                    {destAssets.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                                            <MapPinIcon className="w-8 h-8 opacity-30 mb-2" />
                                                            <p className="text-sm font-medium">Vacant office</p>
                                                            <p className="text-[10px] mt-1">Awaiting relocated assets</p>
                                                        </div>
                                                    ) : (
                                                        destAssets.map((asset) => (
                                                            <motion.div
                                                                key={asset.id}
                                                                layout
                                                                initial={{ opacity: 0, x: -60, scale: 0.8 }}
                                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="flex items-center gap-3 p-3 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/5 shadow-sm"
                                                            >
                                                                <div className="w-9 h-9 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                                                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                                                                    <p className="text-[10px] text-green-600 dark:text-green-400">{asset.category} · Relocated</p>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* AI Animation Progress Bar */}
                                {aiAnimating && (
                                    <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-500/5 border-t border-indigo-100 dark:border-indigo-500/20 flex items-center gap-3">
                                        <SparklesIcon className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI optimizing ergonomic arrangement...</p>
                                            <div className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full overflow-hidden mt-1.5">
                                                <motion.div
                                                    className="h-full bg-indigo-500 rounded-full"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: `${(destAssets.length / FM_ASSETS.length) * 100}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{destAssets.length}/{FM_ASSETS.length}</span>
                                    </div>
                                )}

                                {/* Footer — Confirm Transfers */}
                                {hasPendingMoves && !aiAnimating && (
                                    <div className="bg-card border-t border-border p-4 px-5 flex items-center justify-between animate-in slide-in-from-bottom duration-300 z-50">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                                                {pendingMoves.length}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-foreground">Pending Transfers</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Office 3-214 → Office 3-216 · {pendingMoves.length} items staged
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSourceAssets(FM_ASSETS);
                                                    setDestAssets([]);
                                                    setPendingMoves([]);
                                                    setAiComplete(false);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                                            >
                                                Undo All
                                            </button>
                                            <button
                                                onClick={confirmTransfers}
                                                className={clsx(
                                                    "px-5 py-2.5 text-sm font-semibold rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2",
                                                    aiComplete
                                                        ? "bg-green-600 hover:bg-green-500 text-white shadow-green-500/20 ring-2 ring-green-400 ring-offset-2 ring-offset-background animate-pulse"
                                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20"
                                                )}
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                                Confirm Transfers
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ─── Confirmation Modal Overlay ─── */}
                                <AnimatePresence>
                                    {showConfirmation && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-8"
                                        >
                                            <motion.div
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden"
                                            >
                                                {/* Success header */}
                                                <div className="p-6 text-center border-b border-border">
                                                    <div className="w-14 h-14 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-foreground">Transfers Confirmed</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">{pendingMoves.length} assets relocated successfully</p>
                                                </div>

                                                {/* Details */}
                                                <div className="p-5 space-y-3">
                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/20">
                                                        <MapPinIcon className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-bold text-foreground">Office 3-214 → Office 3-216</p>
                                                            <p className="text-[10px] text-muted-foreground">Inventory locations updated in real-time</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                                                        <PaperAirplaneIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-bold text-foreground">Notification Sent to Expert</p>
                                                            <p className="text-[10px] text-muted-foreground">David Park will review the relocation in Expert Hub</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                                        <BuildingOfficeIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                        <div>
                                                            <p className="text-xs font-bold text-foreground">Carlos Rivera Notified</p>
                                                            <p className="text-[10px] text-muted-foreground">Temporary workspace ready at Office 3-216</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="p-5 pt-2">
                                                    <button
                                                        onClick={onClose}
                                                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        Done
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
