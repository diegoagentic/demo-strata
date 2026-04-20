// ═══════════════════════════════════════════════════════════════════════════════
// MBI — Shared TypeScript types for all mock data
// ═══════════════════════════════════════════════════════════════════════════════

export type Vertical = 'corporate' | 'healthcare' | 'education' | 'government';
export type ContractType = 'HNI' | 'Allsteel' | 'HealthTrust' | 'Omnia' | 'none';
export type BudgetPath = 'design-assisted' | 'quick-budget';
export type BudgetStatus = 'intake' | 'parsing' | 'validation' | 'review' | 'approved';
export type ScenarioTier = 'good' | 'better' | 'best';
export type ValidationSeverity = 'critical' | 'warning' | 'info';
export type ValidationStatus = 'pending' | 'accepted' | 'overridden' | 'rejected';

export interface Tenant {
    name: string;
    short: string;
    hq: string;
    satellite: string;
    remoteDesigners: string[];
    employees: number;
    revenue: string;
    founded: number;
    verticals: Vertical[];
    primaryDealer: string;
    manufacturerCount: number;
    aiReadiness: { current: number; target: number; tier: string };
}

export interface Stakeholder {
    id: string;
    name: string;
    role: string;
    team: 'design' | 'sales' | 'pc' | 'pm' | 'accounting' | 'leadership' | 'bd' | 'healthcare' | 'warehouse';
    q4Trust?: number;  // 1-10
    adoption?: 'innovator' | 'early-adopter' | 'early-majority' | 'late-majority' | 'laggard';
    isEarlyAdopter?: boolean;
    email?: string;
}

export interface Manufacturer {
    id: string;
    name: string;
    isEDI: boolean;
    compassValidated?: boolean;   // HNI/Allsteel/Gunlocke/HON require Compass
    color?: string;               // brand color for UI
}

export interface Contract {
    id: string;
    name: string;
    type: ContractType;
    discount: number;             // 0.55 = 55%
    vertical?: Vertical;
    notes?: string;
}

export interface PricingReferenceRow {
    sku: string;
    manufacturer: string;
    description: string;
    listPrice: number;
    lastUpdated: string;
}

export interface Typical {
    id: string;
    name: string;
    spaceType: 'workstation' | 'private-office' | 'conference' | 'lounge' | 'reception';
    tier: ScenarioTier;
    manufacturer: string;
    lineItems: { sku: string; qty: number }[];
    baselineUnitCost: number;
}

export interface LineItem {
    sku: string;
    manufacturer: string;
    description: string;
    finish: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface SIFSample {
    id: string;
    fileName: string;
    exportedAt: string;
    cetVersion: string;
    fieldCount: number;
    lineItems: LineItem[];
    totals: { itemCount: number; grossValue: number };
    hasIssue?: boolean;           // marks the hero SIF with the $18K issue
}

export interface Scenario {
    tier: ScenarioTier;
    label: string;
    total: number;
    markup: number;               // 0.35 = 35%
    subtotal: number;
    freight: number;
    install: number;
    contingency: number;
    swaps: { from: string; to: string; delta: number }[];
    lineItemCount: number;
}

export interface Validation {
    id: string;
    budgetId: string;
    field: string;
    severity: ValidationSeverity;
    confidence: number;           // 0-100
    expected: string;
    actual: string;
    aiSuggestion: string;
    estimatedImpact?: number;     // dollar amount prevented
    status: ValidationStatus;
}

export interface BudgetRequest {
    id: string;
    client: { name: string; project: string; vertical: Vertical };
    scope: {
        workstations?: number;
        privateOffices?: number;
        conferenceRooms?: number;
        lounge?: number;
        reception?: number;
    };
    contract: ContractType;
    budgetCeiling?: number;
    path: BudgetPath;
    status: BudgetStatus;
    createdBy: string;            // stakeholder.id
    createdAt: string;
    total?: number;
    scenarios?: Scenario[];
    validations?: Validation[];
    sifSampleId?: string;
    isHero?: boolean;             // the $18K scenario
}

export interface Invoice {
    id: string;
    vendor: string;
    poNumber: string;
    amount: number;
    received: string;
    isEDI: boolean;
    isHealthTrust?: boolean;
    has3PctRoyalty?: boolean;
    hasException?: boolean;
    exceptionReason?: string;
    ocrConfidence: number;
}

export interface ARRecord {
    id: string;
    client: string;
    poNumber: string;
    amount: number;
    daysPastDue: number;
    status: 'pending-approval' | 'no-response' | 'committed-to-pay' | 'escalated';
    lastContact?: string;
    salesperson?: string;
}

export interface BillingForecastPoint {
    week: string;                  // ISO week
    projected: number;
    actual?: number;
    confidence: number;
}

export interface Proposal {
    id: string;                    // PROP-2026-001
    budgetId: string;
    coreStatus: 'draft' | 'pending-review' | 'approved' | 'sent';
    lineItemCount: number;
    manufacturers: string[];
    createdBy: string;
    updatedAt: string;
}

export interface SpecCheckReport {
    id: string;
    projectId: string;
    runAt: string;
    lineItemsScanned: number;
    flags: {
        type: 'finish' | 'quantity' | 'option' | 'non-catalog';
        severity: ValidationSeverity;
        description: string;
        lineRef?: string;
    }[];
    status: 'clean' | 'needs-review';
}

export interface DesignProject {
    id: string;
    name: string;
    client: string;
    vertical: Vertical;
    designerId: string;            // stakeholder.id
    status: 'intake' | 'design' | 'review' | 'approved';
    hoursLogged: number;
    budgetTracked?: { allocated: number; spent: number };
}
