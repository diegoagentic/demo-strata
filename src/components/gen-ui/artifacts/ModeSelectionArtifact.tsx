import React, { useState, useEffect } from 'react';
import { CloudArrowUpIcon, ServerStackIcon, DocumentTextIcon, ArrowPathIcon, CheckCircleIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

export default function ModeSelectionArtifact() {
    const { sendMessage } = useGenUI();
    const [view, setView] = useState<'selection' | 'upload' | 'processing'>('selection');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string | null>(null);

    // Simulate Processing
    useEffect(() => {
        if (view === 'processing') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2; // Increment progress
                });
            }, 30); // 30ms * 50 steps = 1.5s approx

            return () => clearInterval(interval);
        }
    }, [view]);

    // Trigger completion when progress hits 100
    useEffect(() => {
        if (progress === 100) {
            setTimeout(() => {
                sendMessage(`Processed Upload: ${fileName || 'Document.pdf'}`);
            }, 800); // Small delay to show 100% complete
        }
    }, [progress, fileName, sendMessage]);

    const handleFileSelect = (name: string) => {
        setFileName(name);
        setView('processing');
    };

    if (view === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center p-8 w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 relative">
                    {progress < 100 ? (
                        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : (
                        <CheckCircleIcon className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" />
                    )}
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {progress < 100 ? 'Analyzing Document...' : 'Extraction Complete'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                    {progress < 100
                        ? 'IDENTIFYING SKUS, QUANTITIES, AND VARIANTS'
                        : 'REDIRECTING TO ASSET REVIEW...'}
                </p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-75 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between w-full mt-2 text-xs text-muted-foreground">
                    <span>{fileName}</span>
                    <span>{progress}%</span>
                </div>
            </div>
        );
    }

    if (view === 'upload') {
        return (
            <div className="flex flex-col w-full max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <button
                        onClick={() => setView('selection')}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-muted-foreground transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-sm text-foreground">Upload Request</span>
                </div>

                <div className="p-8">
                    <div
                        className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                        onClick={() => handleFileSelect('Project_Requirements_v2.pdf')}
                    >
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CloudArrowUpIcon className="w-8 h-8 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <h4 className="text-base font-semibold text-foreground">Click to upload or drag and drop</h4>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                            PDF, Excel, CSV, or Email (.msg) files supported
                        </p>
                    </div>

                    <div className="mt-6 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Files</p>
                        <button
                            onClick={() => handleFileSelect('Office_Renovation_Specs.pdf')}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-left group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                <DocumentTextIcon className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">Office_Renovation_Specs.pdf</p>
                                <p className="text-xs text-muted-foreground">2.4 MB • Today, 10:23 AM</p>
                            </div>
                        </button>
                        <button
                            onClick={() => handleFileSelect('Q1_Requirements.xlsx')}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-left group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                <DocumentTextIcon className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground group-hover:text-blue-600 transition-colors">Q1_Requirements.xlsx</p>
                                <p className="text-xs text-muted-foreground">1.1 MB • Yesterday</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-semibold text-foreground mb-2">How would you like to start?</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Process File */}
                <button
                    onClick={() => setView('upload')}
                    className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group text-left shadow-sm hover:shadow-md"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <CloudArrowUpIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Upload Request</h4>
                        <p className="text-sm text-muted-foreground mt-1">Process a PDF, Excel, or Email request using AI extraction.</p>
                    </div>
                </button>

                {/* Option 2: Connect ERP */}
                <button
                    onClick={() => sendMessage("Mode Selected: Connect ERP")}
                    className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group text-left shadow-sm hover:shadow-md"
                >
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                        <ServerStackIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Connect ERP</h4>
                        <p className="text-sm text-muted-foreground mt-1">Pull open Purchase Orders directly from NetSuite or SAP.</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
