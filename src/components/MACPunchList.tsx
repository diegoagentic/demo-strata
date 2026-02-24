import React, { useState } from 'react';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    SparklesIcon,
    DocumentTextIcon,
    CameraIcon,
    Bars4Icon
} from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function MACPunchList() {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [resolutionStatus, setResolutionStatus] = useState<'initial' | 'assembling' | 'submitted' | 'acknowledged' | 'assigning' | 'assigned'>('initial');

    const handleAssembleClaim = () => {
        setResolutionStatus('assembling');
        setTimeout(() => {
            setResolutionStatus('submitted');
            setTimeout(() => {
                setResolutionStatus('acknowledged');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Punch List Items */}
            <div className="w-full lg:w-1/3 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-4">Active Punch List</h3>

                    <div
                        onClick={() => setSelectedItem('item-1')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedItem === 'item-1' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-brand-300'}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" /> High Priority
                            </span>
                            <span className="text-xs text-zinc-500">2 hours ago</span>
                        </div>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Damaged Upholstery on Delivery</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">2x Conference Room Chairs (Azure)</p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-medium text-zinc-500">
                            <span className="flex items-center gap-1"><CameraIcon className="w-4 h-4" /> 2 Photos</span>
                            <span className="flex items-center gap-1"><Bars4Icon className="w-4 h-4" /> Barcode Scanned</span>
                        </div>
                    </div>

                    <div
                        onClick={() => setSelectedItem('item-2')}
                        className={`mt-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedItem === 'item-2' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-brand-300'}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" /> Medium Priority
                            </span>
                            <span className="text-xs text-zinc-500">4 hours ago</span>
                        </div>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Scratched glass partition</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">1x Acoustic Panel (Frosted)</p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-medium text-zinc-500">
                            <span className="flex items-center gap-1"><CameraIcon className="w-4 h-4" /> 1 Photo</span>
                        </div>
                    </div>

                    <div
                        onClick={() => setSelectedItem('item-3')}
                        className={`mt-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedItem === 'item-3' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-brand-300'}`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <ExclamationTriangleIcon className="w-3.5 h-3.5" /> Low Priority
                            </span>
                            <span className="text-xs text-zinc-500">1 day ago</span>
                        </div>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Missing hardware packet</h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">1x Workstation Desk</p>
                        <div className="flex items-center gap-3 mt-3 text-xs font-medium text-zinc-500">
                            <span className="flex items-center gap-1"><DocumentTextIcon className="w-4 h-4" /> Installer Note</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: AI Assistant & Claim Assembly */}
            <div className="w-full lg:w-2/3">
                {selectedItem ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-muted/20">
                            <SparklesIcon className="w-5 h-5 text-brand-500" />
                            <h3 className="font-bold text-sm text-foreground">Warranty Agent</h3>
                        </div>

                        <div className="p-4 flex-1 space-y-4 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-900/20">
                            {/* AI Suggestion */}
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                    <SparklesIcon className="w-5 h-5" />
                                </div>
                                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl rounded-tl-none shadow-sm border border-zinc-100 dark:border-zinc-700/50 flex-1">
                                    <p className="font-semibold text-sm text-zinc-900 dark:text-white mb-2">Root Cause Analysis</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
                                        I've linked this issue to Shipment <span className="font-mono text-xs bg-muted px-1 rounded">SHP-8821</span> and Line Item 3. Based on the installer's photos and barcode scans, this is **Freight Handling Damage — likely carrier responsibility**.
                                    </p>

                                    {resolutionStatus === 'initial' && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">Recommended Action:</p>
                                            <button
                                                onClick={handleAssembleClaim}
                                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <DocumentTextIcon className="w-4 h-4" />
                                                Assemble Warranty Claim
                                            </button>
                                        </div>
                                    )}

                                    {resolutionStatus === 'assembling' && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Assembling claim with photos, serials, and damage taxonomy...
                                        </div>
                                    )}

                                    {resolutionStatus === 'submitted' && (
                                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Claim assembled and submitted for priority processing.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Manufacturer Response (Simulated after submitting) */}
                            {(resolutionStatus === 'acknowledged' || resolutionStatus === 'assigning' || resolutionStatus === 'assigned') && (
                                <div className="flex items-start gap-3 mt-4 animate-in slide-in-from-bottom-2 fade-in">
                                    <div className="p-2 rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                                    </div>
                                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl rounded-tl-none shadow-sm border border-zinc-100 dark:border-zinc-700/50 flex-1">
                                        <p className="font-semibold text-sm text-zinc-900 dark:text-white mb-2">Manufacturer Update</p>
                                        <div className="flex items-start gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30 mb-2">
                                            <CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="text-zinc-900 dark:text-zinc-100 font-bold mb-1">Claim Acknowledged</p>
                                                <p className="text-zinc-700 dark:text-zinc-300">Replacement ordered. <span className="font-bold">Replacement chairs in production — estimated delivery 8 days.</span></p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-500 mb-4">The sales rep, PM, and facilities coordinator have been notified.</p>

                                        {resolutionStatus === 'acknowledged' && (
                                            <button
                                                onClick={() => setResolutionStatus('assigning')}
                                                className="w-full sm:w-auto px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                Assign Logistics Team & Schedule
                                            </button>
                                        )}

                                        {resolutionStatus === 'assigning' && (
                                            <div className="mt-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 dark:border-zinc-700/50 space-y-4 animate-in slide-in-from-top-2 fade-in">
                                                <p className="font-semibold text-sm text-zinc-900 dark:text-white">Assign Logistics Team & Schedule</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">Assigned Team</label>
                                                        <select className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50">
                                                            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Internal Warranty Team</option>
                                                            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">Site Supervisors</option>
                                                            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">External Contractor</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">Action Priority</label>
                                                        <div className="flex gap-2">
                                                            <button className="flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-muted font-medium text-zinc-600">Standard</button>
                                                            <button className="flex-1 rounded-md border border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1 text-sm shadow-sm font-medium">Auto-Expedite</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2 mt-4 pt-2 border-t dark:border-zinc-800">
                                                    <button
                                                        onClick={() => setResolutionStatus('acknowledged')}
                                                        className="px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => setResolutionStatus('assigned')}
                                                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-md transition-colors shadow-sm"
                                                    >
                                                        Confirm Assignment
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {resolutionStatus === 'assigned' && (
                                            <div className="mt-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 dark:border-zinc-700/50 animate-in slide-in-from-top-2 fade-in">
                                                <p className="font-semibold text-sm text-zinc-900 dark:text-white mb-4">Resolution Tracking</p>
                                                <div className="space-y-4">
                                                    <div className="flex gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">Claim Approved</p>
                                                            <p className="text-xs text-zinc-500">Manufacturer confirmed replacement chairs</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">Logistics Team Assigned</p>
                                                            <p className="text-xs text-zinc-500">Assigned to: Internal Warranty Team (Auto-Expedited)</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 relative">
                                                        <div className="absolute -top-4 left-3 w-px h-[150%] bg-zinc-200 dark:bg-zinc-800 -z-10"></div>
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">Awaiting Delivery & Install</p>
                                                            <p className="text-xs text-zinc-500">Tracking shows estimated arrival in 8 days</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl min-h-[400px]">
                        <ExclamationTriangleIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h4 className="text-lg font-medium text-zinc-900 dark:text-white">Select a Punch List Item</h4>
                        <p className="text-sm text-zinc-500 max-w-sm mt-2">Choose an item from the left to view installer reports, photos, and AI-suggested warranty actions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
