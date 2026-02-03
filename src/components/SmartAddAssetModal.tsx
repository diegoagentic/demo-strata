import React, { useState, useEffect, useRef } from 'react';
import {
    XMarkIcon,
    DocumentTextIcon,
    QrCodeIcon,
    TableCellsIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    CloudArrowUpIcon,
    ArrowPathIcon,
    CameraIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

type TabType = 'manual' | 'template' | 'csv' | 'qr';

interface SmartAddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
}

const STEPS = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Assignment Details' },
    { id: 3, label: 'Additional Details' },
    { id: 4, label: 'Review & Create' }
];

// Mock AI Parsed Data
const MOCK_AI_DATA = {
    assetName: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CH-004',
    category: 'Furniture',
    subCategory: 'Chair',
    description: 'High-back mesh ergonomic chair with lumbar support and adjustable armrests.',
    value: '350.00',
    condition: 'New',
    location: 'Main Warehouse',
    status: 'Available'
};

export default function SmartAddAssetModal({ isOpen, onClose, onConfirm }: SmartAddAssetModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('manual');
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        assetName: '',
        sku: '',
        category: '',
        subCategory: '',
        description: '',
        value: '',
        condition: 'New',
        location: '',
        status: 'Available',
        createMultiple: false
    });

    // Simulation States
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Template/AI
    const [isScanning, setIsScanning] = useState(false); // QR
    const [csvState, setCsvState] = useState<'upload' | 'validating' | 'summary'>('upload');

    // Reset on close/open
    useEffect(() => {
        if (isOpen) {
            setActiveTab('manual');
            setCurrentStep(1);
            setFormData({
                assetName: '',
                sku: '',
                category: '',
                subCategory: '',
                description: '',
                value: '',
                condition: 'New',
                location: '',
                status: 'Available',
                createMultiple: false
            });
            setCsvState('upload');
            setIsScanning(false);
            setIsAnalyzing(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- Tab Switching Logic (Simulations) ---

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        // Reset simulations when switching tabs
        setCsvState('upload');
        setIsScanning(false);
        setIsAnalyzing(false);
    };

    // --- Template / Smart Import Logic ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsAnalyzing(true);
            // Simulate AI Analysis
            setTimeout(() => {
                setIsAnalyzing(false);
                setFormData(prev => ({ ...prev, ...MOCK_AI_DATA }));
                setActiveTab('manual'); // Switch to manual to show filled data
                setCurrentStep(1); // Go to start of form
            }, 2500);
        }
    };

    // --- QR Logic ---
    const startQrScan = () => {
        setIsScanning(true);
        // Simulate Scan Success
        setTimeout(() => {
            setIsScanning(false);
            setFormData(prev => ({ ...prev, ...MOCK_AI_DATA, sku: 'QR-SCANNED-999' }));
            setActiveTab('manual');
            setCurrentStep(1);
        }, 3000);
    };

    // --- CSV Logic ---
    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setCsvState('validating');
            setTimeout(() => {
                setCsvState('summary');
            }, 1500);
        }
    };

    const handleCreateFromCsv = () => {
        onConfirm([{ ...MOCK_AI_DATA, id: 'csv-1' }, { ...MOCK_AI_DATA, id: 'csv-2', assetName: 'Second Item' }]);
        onClose();
    };

    // --- Manual Stepper Logic ---
    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(c => c + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleSubmitManual = () => {
        onConfirm({ ...formData, id: `new-${Date.now()}` });
        onClose();
    };


    // --- Renderers ---

    const renderTabs = () => (
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6">
            {[
                { id: 'manual', label: 'Manual', icon: PencilSquareIcon },
                { id: 'template', label: 'Template', icon: DocumentTextIcon },
                { id: 'csv', label: 'CSV', icon: TableCellsIcon },
                { id: 'qr', label: 'QR', icon: QrCodeIcon },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as TabType)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                        activeTab === tab.id
                            ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                    )}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    );

    const renderStepper = () => (
        <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300",
                            currentStep >= step.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                        )}>
                            {currentStep > step.id ? <CheckCircleIcon className="w-5 h-5" /> : step.id}
                        </div>
                        <span className={cn(
                            "absolute top-10 text-[10px] whitespace-nowrap font-medium transition-colors duration-300",
                            currentStep >= step.id ? "text-foreground font-semibold" : "text-zinc-400"
                        )}>
                            {step.label}
                        </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div className={cn(
                            "h-[2px] w-full mx-2 -mt-4 transition-colors duration-300",
                            currentStep > step.id ? "bg-primary/50" : "bg-zinc-100 dark:bg-zinc-800"
                        )} />
                    )}
                </div>
            ))}
        </div>
    );

    const renderManualContent = () => {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Step Content */}
                <div className="min-h-[320px]">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Asset Name *</label>
                                    <input
                                        type="text"
                                        value={formData.assetName}
                                        onChange={e => setFormData({ ...formData, assetName: e.target.value })}
                                        placeholder="e.g. Executive Office Chair"
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">SKU</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.sku}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            placeholder="Auto-generated"
                                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span className="text-xs text-zinc-400">Auto</span>
                                            <div className="w-8 h-4 bg-primary/20 rounded-full relative cursor-pointer">
                                                <div className="w-4 h-4 bg-primary rounded-full absolute right-0 top-0 shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm appearance-none"
                                    >
                                        <option value="">Select category...</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Lighting">Lighting</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Subcategory</label>
                                    <select
                                        value={formData.subCategory}
                                        onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm appearance-none"
                                    >
                                        <option value="">Select subcategory...</option>
                                        <option value="Chair">Chair</option>
                                        <option value="Desk">Desk</option>
                                        <option value="Lamp">Lamp</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Description</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the asset..."
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full relative cursor-pointer transition-colors"
                                    onClick={() => setFormData(p => ({ ...p, createMultiple: !p.createMultiple }))}>
                                    <div className={cn(
                                        "w-5 h-5 bg-white rounded-full shadow-sm absolute top-0 transition-all border border-zinc-200",
                                        formData.createMultiple ? "right-0 border-primary bg-primary" : "left-0"
                                    )} />
                                </div>
                                <span className="text-sm font-medium">Create multiple assets</span>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Location Assignment</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Assignment Type</label>
                                    <div className="flex bg-zinc-50 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                        {['Warehouse', 'Project', 'Location'].map(type => (
                                            <button
                                                key={type}
                                                className="flex-1 text-xs font-medium py-1.5 rounded-md hover:bg-white dark:hover:bg-zinc-700 shadow-sm transition-all"
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Warehouse</label>
                                <select
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm appearance-none"
                                >
                                    <option value="">Select Warehouse...</option>
                                    <option value="Main Warehouse">Main Warehouse</option>
                                    <option value="Tech Storage Hub">Tech Storage Hub</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Financial & Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Value ($)</label>
                                    <input
                                        type="text"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm appearance-none"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="In Use">In Use</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
                                <h3 className="text-sm font-semibold text-foreground mb-3">Summary to Create</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-primary/10 pb-2">
                                        <span className="text-zinc-500">Asset Name</span>
                                        <span className="font-medium">{formData.assetName || 'Untitled'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-primary/10 pb-2">
                                        <span className="text-zinc-500">Category</span>
                                        <span className="font-medium">{formData.category || '-'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-primary/10 pb-2">
                                        <span className="text-zinc-500">Location</span>
                                        <span className="font-medium">{formData.location || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Value</span>
                                        <span className="font-medium">${formData.value || '0.00'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={currentStep === 1 ? onClose : handlePrev}
                        className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        {currentStep === 1 ? 'Cancel' : 'Previous'}
                    </button>
                    <button
                        onClick={currentStep === 4 ? handleSubmitManual : handleNext}
                        className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        {currentStep === 4 ? 'Create Asset' : 'Next'}
                        {currentStep !== 4 && <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        );
    };

    const renderTemplateContent = () => (
        <div className="h-[400px] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            {isAnalyzing ? (
                <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                        <BoltIcon className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Analyzing Document...</h3>
                        <p className="text-sm text-muted-foreground">Extracting asset specifications</p>
                    </div>
                </div>
            ) : (
                <div className="w-full text-center space-y-6">
                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-3xl p-10 hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileUpload}
                            accept=".pdf,.png,.jpg,.jpeg,.csv"
                        />
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <CloudArrowUpIcon className="w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Drop your file here</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            Upload a spec sheet, invoice, or image. Our AI will extract the details for you.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-full text-xs font-medium text-zinc-500">PDF</span>
                            <span className="px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-full text-xs font-medium text-zinc-500">JPG</span>
                            <span className="px-3 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-full text-xs font-medium text-zinc-500">CSV</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderCsvContent = () => (
        <div className="h-[400px] animate-in fade-in zoom-in-95 duration-300">
            {csvState === 'upload' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-3xl p-10 w-full hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleCsvUpload}
                            accept=".csv"
                        />
                        <TableCellsIcon className="w-16 h-16 text-zinc-300 mx-auto mb-4 group-hover:text-primary transition-colors" />
                        <h3 className="text-lg font-semibold text-foreground">Upload CSV File</h3>
                        <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                        <button className="mt-4 text-xs font-medium text-primary hover:underline z-10 relative">
                            Download Sample Template
                        </button>
                    </div>
                </div>
            )}

            {csvState === 'validating' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ArrowPathIcon className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-medium text-zinc-600">Validating records...</p>
                </div>
            )}

            {csvState === 'summary' && (
                <div className="h-full flex flex-col">
                    <div className="flex-1 space-y-6 pt-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Validation Successful</h4>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Found 7 rows. 6 valid assets ready to create.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-indigo-600">7</span>
                                <span className="text-xs font-medium text-indigo-400">Total Rows</span>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-emerald-600">6</span>
                                <span className="text-xs font-medium text-emerald-400">Valid</span>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-amber-600">1</span>
                                <span className="text-xs font-medium text-amber-400">Duplicate</span>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-rose-600">0</span>
                                <span className="text-xs font-medium text-rose-400">Failed</span>
                            </div>
                        </div>

                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                            <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 flex justify-between">
                                <span className="text-xs font-bold text-zinc-500 uppercase">Preview</span>
                                <span className="text-xs text-zinc-400">Showing 3 of 7</span>
                            </div>
                            <div className="p-4 space-y-2">
                                {['Executive Leather Chair', 'Adjustable LED Floor Lamp', 'Tempered Glass Partition'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-dashed border-zinc-100 dark:border-zinc-800 last:border-0">
                                        <span className="font-medium">{item}</span>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Valid</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800">
                        <button onClick={() => setCsvState('upload')} className="px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded-lg">cancel</button>
                        <button onClick={handleCreateFromCsv} className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg shadow hover:bg-primary/90">
                            Create 6 Assets
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderQrContent = () => (
        <div className="h-[400px] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            {!isScanning ? (
                <div className="text-center space-y-6">
                    <div className="w-full max-w-xs mx-auto aspect-square bg-black rounded-3xl relative overflow-hidden flex items-center justify-center group cursor-pointer" onClick={startQrScan}>
                        <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center mix-blend-overlay"></div>
                        <div className="relative z-10 w-16 h-16 border-2 border-white/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute bottom-4 text-white/80 text-xs font-medium">Click to activate camera</div>
                    </div>
                </div>
            ) : (
                <div className="relative w-full max-w-xs mx-auto aspect-square bg-black rounded-3xl overflow-hidden">
                    {/* Simulated Camera Feed */}
                    <div className="absolute inset-0 bg-zinc-900">
                        {/* Grid Pattern/Noise for effect */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    </div>

                    {/* Scanning Frame */}
                    <div className="absolute inset-8 border-2 border-primary/80 rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        {/* Corner Markers */}
                        <div className="absolute -top-px -left-px w-4 h-4 border-t-4 border-l-4 border-primary"></div>
                        <div className="absolute -top-px -right-px w-4 h-4 border-t-4 border-r-4 border-primary"></div>
                        <div className="absolute -bottom-px -left-px w-4 h-4 border-b-4 border-l-4 border-primary"></div>
                        <div className="absolute -bottom-px -right-px w-4 h-4 border-b-4 border-r-4 border-primary"></div>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-white text-xs">
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                            Detecting QR code...
                        </span>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    50% { top: 100%; opacity: 1; }
                    90% { opacity: 1; }
                }
            `}</style>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Create New Asset</h2>
                        <p className="text-sm text-muted-foreground">Choose your preferred creation method</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {renderTabs()}

                    {activeTab === 'manual' && (
                        <>
                            {renderStepper()}
                            {renderManualContent()}
                        </>
                    )}

                    {activeTab === 'template' && renderTemplateContent()}

                    {activeTab === 'csv' && renderCsvContent()}

                    {activeTab === 'qr' && renderQrContent()}
                </div>

            </div>
        </div>
    );
}
