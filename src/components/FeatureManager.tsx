
import { Fragment } from 'react'
import { Dialog, Transition, Switch } from '@headlessui/react'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

export interface Feature {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    category: 'core' | 'analytics' | 'operations' | 'support';
}

interface FeatureManagerProps {
    isOpen: boolean;
    onClose: () => void;
    features: Feature[];
    onToggleFeature: (id: string, enabled: boolean) => void;
}

export default function FeatureManager({ isOpen, onClose, features, onToggleFeature }: FeatureManagerProps) {
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
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 text-left align-middle shadow-xl transition-all border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-bold leading-6 text-gray-900 dark:text-white"
                                        >
                                            Customize your experience
                                        </Dialog.Title>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Enable or disable features to tailor the dashboard to your workflow.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-500 transition-colors focus:outline-none"
                                    >
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {['core', 'operations', 'analytics', 'support'].map((category) => {
                                        const categoryFeatures = features.filter(f => f.category === category);
                                        if (categoryFeatures.length === 0) return null;

                                        return (
                                            <div key={category}>
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                                </h4>
                                                <div className="space-y-3">
                                                    {categoryFeatures.map((feature) => (
                                                        <div
                                                            key={feature.id}
                                                            className={`flex items-start justify-between p-4 rounded-xl border transition-all ${feature.enabled
                                                                ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                                                                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 opacity-60'
                                                                }`}
                                                        >
                                                            <div className="flex-1 mr-4">
                                                                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {feature.title}
                                                                </h5>
                                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    {feature.description}
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={feature.enabled}
                                                                onChange={(checked) => onToggleFeature(feature.id, checked)}
                                                                className={`${feature.enabled ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'}
                                          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white/75`}
                                                            >
                                                                <span className="sr-only">Use setting</span>
                                                                <span
                                                                    aria-hidden="true"
                                                                    className={`${feature.enabled ? 'translate-x-5' : 'translate-x-0'}
                                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                                                />
                                                            </Switch>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 transition-colors"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Browse App Marketplace
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors shadow-sm"
                                        onClick={onClose}
                                    >
                                        Done
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
