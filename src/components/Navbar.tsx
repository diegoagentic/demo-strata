import { Menu, MenuButton, MenuItem, MenuItems, Transition, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Fragment } from 'react'
import {
    HomeIcon, CubeIcon, ClipboardDocumentListIcon, ArrowTrendingUpIcon,
    Squares2X2Icon, SunIcon, MoonIcon, ChevronDownIcon,
    UserIcon, DocumentTextIcon, ChartBarIcon, ExclamationCircleIcon,
    CalendarIcon, EllipsisHorizontalIcon, ArrowRightOnRectangleIcon, BriefcaseIcon, CheckIcon,
    BookOpenIcon, TruckIcon, TagIcon, UsersIcon,
    CalculatorIcon, CubeTransparentIcon,
    BanknotesIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    FolderIcon,
    WrenchScrewdriverIcon,
    PhotoIcon,
    CreditCardIcon,
    ArrowPathRoundedSquareIcon,
    PlayCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'strata-design-system'
import { useTenant } from '../TenantContext'

import ActionCenter from './notifications/ActionCenter';

import logoLightBrand from '../assets/logo-light-brand.png';
import logoDarkBrand from '../assets/logo-dark-brand.png';

// Update supported tabs
export type NavTab = 'Overview' | 'Inventory' | 'Catalogs' | 'MAC' | 'Transactions' | 'CRM' | 'Pricing';

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center h-9 px-2 rounded-full transition-all duration-300 group overflow-hidden ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        >
            <span className="relative z-10">{icon}</span>
            <span className={`ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out ${active ? 'max-w-xs opacity-100' : ''}`}>
                {label}
            </span>
        </button>
    )
}

interface NavbarProps {
    onLogout: () => void;
    activeTab?: NavTab | string; // Allow string for flexibility
    onNavigateToWorkspace: () => void;
    onNavigate: (page: any) => void;
    onOpenDemoGuide: () => void;
}

export default function Navbar({ onLogout, activeTab = 'Overview', onNavigateToWorkspace, onNavigate, onOpenDemoGuide }: NavbarProps) {
    const { theme, toggleTheme } = useTheme()
    const { currentTenant, tenants, setTenant } = useTenant()

    const navigation = [
        { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
        { name: 'Catalogs', page: 'catalogs', icon: BookOpenIcon },
        { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
        { name: 'MAC', page: 'mac', icon: ArrowPathRoundedSquareIcon },
        { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
        { name: 'CRM', page: 'crm', icon: UserGroupIcon },
        { name: 'Pricing', page: 'pricing', icon: CurrencyDollarIcon },
    ];

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[60vw] max-w-fit lg:min-w-0 lg:max-w-7xl lg:w-[80vw]">
            <div className="relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md">

                {/* Left Group (Logo + Tenant) */}
                <div className="flex items-center gap-1">
                    {/* Logo */}
                    <div className="px-2 shrink-0">
                        <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
                        <img src={logoDarkBrand} alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
                    </div>

                    <div className="h-6 w-px bg-border mx-1 hidden lg:block"></div>

                    {/* Tenant Selector - Desktop Only */}
                    <Menu as="div" className="relative hidden lg:block">
                        <MenuButton className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors outline-none">
                            <div className="flex flex-col items-start text-left">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">Tenant</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-foreground leading-tight">{currentTenant}</span>
                                    <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                                </div>
                            </div>
                        </MenuButton>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <MenuItems className="absolute left-0 top-full mt-2 w-48 origin-top-left rounded-xl bg-popover shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-border p-1 z-50">
                                {tenants.map((tenant) => (
                                    <MenuItem key={tenant}>
                                        {({ focus }) => (
                                            <button
                                                onClick={() => setTenant(tenant)}
                                                className={`${focus ? 'bg-accent' : ''} group flex w-full items-center px-4 py-2 text-sm text-foreground rounded-lg transition-colors hover:bg-accent`}
                                            >
                                                {tenant}
                                                {currentTenant === tenant && <CheckIcon className="ml-auto w-4 h-4 text-foreground" />}
                                            </button>
                                        )}
                                    </MenuItem>
                                ))}
                            </MenuItems>
                        </Transition>
                    </Menu>
                </div>



                {/* Center Group (Nav Items) - Absolutely Centered on Desktop */}
                <div className="hidden lg:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {navigation.map(item => (
                        <NavItem
                            key={item.name}
                            icon={<item.icon className="w-4 h-4" />}
                            label={item.name}
                            active={activeTab === item.page}
                            onClick={() => onNavigate(item.page)}
                        />
                    ))}
                </div>

                {/* Right Group (Actions) */}
                <div className="flex items-center gap-1">
                    <div className="h-6 w-px bg-border mx-1 hidden lg:block"></div>

                    {/* Action Center - New Feature */}
                    <ActionCenter />

                    <div className="h-4 w-px bg-border mx-1"></div>

                    <Popover className="relative">
                        <PopoverButton className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors outline-none">
                            <Squares2X2Icon className="w-5 h-5" />
                        </PopoverButton>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <PopoverPanel className="fixed top-[90px] left-1/2 -translate-x-1/2 w-[320px] max-h-[80vh] overflow-y-auto p-3 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-3xl z-[100] lg:fixed lg:top-[90px] lg:left-1/2 lg:-translate-x-1/2 lg:mt-4 scrollbar-minimal">
                                <div className="space-y-4">
                                    {/* Mobile Navigation List - Hidden on Desktop */}
                                    <div className="lg:hidden space-y-1">
                                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Navigation</h3>
                                        {navigation.map((item, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onNavigate(item.page)}
                                                className={`flex items-center gap-3 w-full p-2 rounded-xl text-sm font-medium transition-colors ${activeTab === item.page ? 'bg-primary text-primary-foreground shadow-sm dark:bg-primary/10 dark:text-primary dark:shadow-none' : 'hover:bg-muted text-foreground'}`}
                                            >
                                                <item.icon className="w-4 h-4" />
                                                {item.name}
                                            </button>
                                        ))}
                                        <div className="h-px bg-border my-2 mx-1"></div>
                                    </div>

                                    {/* Mobile View: Categorized Grid */}
                                    <div className="lg:hidden space-y-4">
                                        {[
                                            {
                                                title: "Platform",
                                                apps: [
                                                    { icon: <BriefcaseIcon className="w-6 h-6" />, label: "My Work Space", color: "text-zinc-900", bg: "bg-primary", isHighlighted: true, onClick: onNavigateToWorkspace },
                                                    { icon: <HomeIcon className="w-6 h-6" />, label: "Portal", color: "text-zinc-900 dark:text-primary", bg: "bg-primary/10", onClick: () => onNavigate('dashboard') },
                                                ]
                                            },
                                            {
                                                title: "Sales Tools",
                                                apps: [
                                                    { icon: <CalculatorIcon className="w-6 h-6" />, label: "Quoting", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
                                                    { icon: <WrenchScrewdriverIcon className="w-6 h-6" />, label: "Configurator", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                                    { icon: <PhotoIcon className="w-6 h-6" />, label: "Marketing", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-500/10" },
                                                ]
                                            },
                                            {
                                                title: "Finance",
                                                apps: [
                                                    { icon: <CreditCardIcon className="w-6 h-6" />, label: "Credit", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                                                    { icon: <DocumentTextIcon className="w-6 h-6" />, label: "Invoices", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                                                    { icon: <BanknotesIcon className="w-6 h-6" />, label: "Rebates", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
                                                ]
                                            },
                                            {
                                                title: "Support",
                                                apps: [
                                                    { icon: <BookOpenIcon className="w-6 h-6" />, label: "Academy", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                                    { icon: <ExclamationCircleIcon className="w-6 h-6" />, label: "Service", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
                                                ]
                                            }
                                        ].map((category, idx) => (
                                            <div key={idx}>
                                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{category.title}</h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {category.apps.map((app, i) => (
                                                        <button
                                                            key={i}
                                                            // @ts-ignore
                                                            onClick={app.onClick}
                                                            className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all group outline-none focus:ring-2 focus:ring-primary ${
                                                                // @ts-ignore
                                                                app.isHighlighted
                                                                    ? 'ring-1 ring-gray-200 dark:ring-zinc-700 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:ring-0'
                                                                    : 'hover:bg-primary hover:text-primary-foreground hover:shadow-md'
                                                                }`}>
                                                            {/* Badge */}
                                                            {/* @ts-ignore */}
                                                            {app.isHighlighted && (
                                                                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-white/20 text-primary-foreground text-[9px] font-bold shadow-sm backdrop-blur-sm">
                                                                    New
                                                                </span>
                                                            )}
                                                            <div className={`p-2 rounded-2xl transition-all shadow-sm ${
                                                                // @ts-ignore
                                                                app.isHighlighted
                                                                    ? 'bg-primary text-zinc-900 group-hover:bg-transparent group-hover:text-primary-foreground'
                                                                    : `${app.bg} ${app.color} group-hover:bg-transparent group-hover:text-primary-foreground group-hover:shadow-none`
                                                                }`}>
                                                                {app.icon}
                                                            </div>
                                                            <span className={`text-[10px] font-semibold ${
                                                                // @ts-ignore
                                                                app.isHighlighted
                                                                    ? 'text-primary-foreground'
                                                                    : 'text-muted-foreground group-hover:text-primary-foreground'
                                                                }`}>{app.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop View: Unified Grid without Titles */}
                                    <div className="hidden lg:grid grid-cols-3 gap-2">
                                        {[
                                            { icon: <BriefcaseIcon className="w-6 h-6" />, label: "My Work Space", color: "text-zinc-900", bg: "bg-primary", isHighlighted: true, onClick: onNavigateToWorkspace },
                                            { icon: <HomeIcon className="w-6 h-6" />, label: "Portal", color: "text-zinc-900 dark:text-primary", bg: "bg-primary/10", onClick: () => onNavigate('dashboard') },
                                            { icon: <CalculatorIcon className="w-6 h-6" />, label: "Quoting", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
                                            { icon: <WrenchScrewdriverIcon className="w-6 h-6" />, label: "Configurator", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                            { icon: <PhotoIcon className="w-6 h-6" />, label: "Marketing", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-500/10" },
                                            { icon: <CreditCardIcon className="w-6 h-6" />, label: "Credit", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                                            { icon: <DocumentTextIcon className="w-6 h-6" />, label: "Invoices", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                                            { icon: <BanknotesIcon className="w-6 h-6" />, label: "Rebates", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
                                            { icon: <BookOpenIcon className="w-6 h-6" />, label: "Academy", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                            { icon: <ExclamationCircleIcon className="w-6 h-6" />, label: "Service", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
                                        ]
                                            .map((app, i) => (
                                                <button
                                                    key={i}
                                                    // @ts-ignore
                                                    onClick={app.onClick}
                                                    className={`relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all group outline-none focus:ring-2 focus:ring-primary ${
                                                        // @ts-ignore
                                                        app.isHighlighted
                                                            ? 'ring-1 ring-gray-200 dark:ring-zinc-700 hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:ring-0'
                                                            : 'hover:bg-primary hover:text-primary-foreground hover:shadow-md'
                                                        }`}>
                                                    {/* Badge */}
                                                    {/* @ts-ignore */}
                                                    {app.isHighlighted && (
                                                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-bold shadow-sm">
                                                            New
                                                        </span>
                                                    )}
                                                    <div className={`p-2 rounded-2xl ${app.bg} ${app.color} transition-all shadow-sm ${
                                                        // @ts-ignore
                                                        app.isHighlighted
                                                            ? 'bg-primary text-zinc-900 group-hover:bg-transparent group-hover:text-primary-foreground'
                                                            : 'group-hover:bg-transparent group-hover:text-primary-foreground group-hover:shadow-none'
                                                        }`}>
                                                        {app.icon}
                                                    </div>
                                                    <span className={`text-[10px] font-semibold ${
                                                        // @ts-ignore
                                                        app.isHighlighted
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground group-hover:text-primary-foreground'
                                                        }`}>{app.label}</span>
                                                </button>
                                            ))}
                                        {/* More Button - Desktop Only */}
                                        <button className="relative flex flex-col items-center gap-2 p-2 rounded-2xl transition-all group outline-none hover:bg-primary hover:text-primary-foreground hover:shadow-md">
                                            <div className="p-2 rounded-2xl bg-muted text-muted-foreground group-hover:bg-transparent group-hover:text-primary-foreground transition-all shadow-sm">
                                                <EllipsisHorizontalIcon className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary-foreground">More</span>
                                        </button>
                                    </div>
                                </div>
                            </PopoverPanel>
                        </Transition>
                    </Popover>

                    <button onClick={onOpenDemoGuide} className="flex p-2 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-colors animate-pulse ring-2 ring-purple-500/60 ring-offset-2 ring-offset-background shadow-sm" title="Demo Guide">
                        <PlayCircleIcon className="w-5 h-5" />
                    </button>

                    <button onClick={toggleTheme} className="hidden lg:flex p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    </button>

                    <div className="relative group">
                        <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-muted transition-colors text-left outline-none">
                            <div className="flex flex-col items-end mr-1 hidden sm:flex lg:hidden max-w-[140px]">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">Tenant</span>
                                <span className="text-sm font-bold text-foreground leading-tight truncate w-full text-right">{currentTenant}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                                JD
                            </div>
                            <ChevronDownIcon className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {/* User Dropdown */}
                        <div className="absolute top-full right-0 mt-2 w-56 py-2 rounded-xl bg-card/90 backdrop-blur-xl border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">

                            {/* User Info */}
                            <div className="px-4 py-2 border-b border-border mb-1">
                                <p className="text-sm font-medium">Jhon Doe</p>
                                <p className="text-xs text-muted-foreground">Admin</p>
                            </div>

                            {/* Tenant Selector Section */}
                            <div className="px-2 py-1 lg:hidden">
                                <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Switch Tenant</p>
                                {tenants.map((tenant) => (
                                    <button
                                        key={tenant}
                                        onClick={() => setTenant(tenant)}
                                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-foreground rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <span>{tenant}</span>
                                        {currentTenant === tenant && <CheckIcon className="w-3 h-3 text-primary" />}
                                    </button>
                                ))}
                                <div className="h-px bg-border my-1 mx-2"></div>
                            </div>

                            {/* Theme Toggle */}
                            <div className="p-1 lg:hidden">
                                <button onClick={toggleTheme} className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted rounded-lg flex items-center gap-2 transition-colors">
                                    {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                                <div className="h-px bg-border my-1 mx-2"></div>
                            </div>

                            {/* Sign Out */}
                            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted flex items-center gap-2">
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
