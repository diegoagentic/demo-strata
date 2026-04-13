# WRG Demo v6 — Implementation Plan (AI-Optimized)

**Branch:** `demo`
**Base:** `99a05a7` (latest demo-strata/main)
**Target:** New "Strata Estimator" app inspired by Project Aries structure, using Strata DS components
**Date:** 2026-04-10

---

## AI Execution Strategy

This plan is designed to be executed **phase by phase** with Claude (or any LLM agent) to minimize hallucinations and context loss. Each phase is **self-contained** and produces a **verifiable artifact** (file + build passing). Never execute more than one phase per conversation turn without checkpoint validation.

### Anti-hallucination rules:
1. **Read before write** — every phase starts by reading existing files (specific paths given)
2. **One file per phase** when possible — keeps context tight
3. **Build check after every phase** — `npx vite build` must pass
4. **Explicit imports** — every phase declares which existing components to import (no inference)
5. **Mock data inline** — no external JSON, all data embedded in the component
6. **DS tokens listed verbatim** — no interpretation of "use brand colors", exact class names given
7. **Aries parity rule** — NEVER add elements, sections, or features that don't exist in the Aries reference (`docs/wrg-demo/requirements/estimating app V1.txt`). Each phase has a "Must NOT include" list.

---

## 🚨 ARIES PARITY RULE (CRITICAL)

**The WRG Demo v6 must match the Project Aries structure 1:1.** Any component, section, or feature that does NOT exist in the Aries reference code MUST NOT appear in our implementation.

### Global forbidden list (applies to all phases):

The Strata Estimator MUST NOT contain any of the following unless explicitly approved:

- ❌ Breadcrumbs
- ❌ Sidebar (secondary nav)
- ❌ Workflow / status steppers
- ❌ Timeline component
- ❌ Comments / notes panels
- ❌ Related documents section
- ❌ Activity log
- ❌ Notifications / Action Center
- ❌ User avatar / profile menu
- ❌ Tenant selector
- ❌ Theme toggle (in the estimator navbar)
- ❌ My Apps grid
- ❌ Help / support buttons
- ❌ Global search
- ❌ Sort options in Projects tab
- ❌ View toggle (grid/list)
- ❌ Pagination (Aries uses simple vertical list)
- ❌ Summary bar (Aries doesn't have one)
- ❌ Analytics charts
- ❌ Bulk actions
- ❌ Vendor filter
- ❌ Discrepancy status in the Estimator tab
- ❌ Quick actions secondary bar (only the Save in navbar)

### Aries allowed structure (1:1 reference):

**Navbar (exactly these elements):**
1. Brand icon pill + app name + sync status (only `synced` or `saving`)
2. 3 tabs pill (ESTIMATOR, PROJECTS, CONFIG)
3. Backup icon group (Download + UploadCloud)
4. Save Project CTA

**ESTIMATOR tab (exactly these 4 sections, in order):**
1. Project Dossier card (Client Name + Postal/Region + Site Location)
2. Financial Summary Hero (Final Quote Price + 4 stats + Generate Proposal CTA)
3. Bill of Materials table (with AI Import + AI Refine + Add Line buttons)
4. Operational Constraints (Planned Install Days + 4 checkboxes + Crew Capacity card)

**PROJECTS tab (exactly these elements):**
1. Header: "Project History" title + search input
2. Vertical list of project cards, each showing: Client + Status dropdown + ZIP + Date + Proposal Price + Load/Delete + Est./Actual/Variance row

**CONFIG tab (exactly these sections):**
1. Title: "Administrative Logic"
2. Top row: Default Margin slider + Base Labor Rates card
3. Category cards with subcategory rate configs

**Vision Engine Modal (exactly these states):**
1. Initial upload state
2. Refinement state (when file exists)
3. Analyzing state

### Validation checklist for every phase:

Before committing any phase:
- [ ] Does every element I added exist in the Aries reference?
- [ ] Did I add any element from the forbidden list?
- [ ] Is the order of sections identical to Aries?
- [ ] Is every state/variable justified by Aries code?

If any answer violates the rule → **remove the extra element before committing**.

---

## Pre-Phase: Context Loading (DO FIRST on each session)

Before starting ANY phase, the agent must:

1. Confirm branch:
   ```bash
   git branch --show-current  # must be "demo"
   ```
2. Read these 3 anchor files (they define DS conventions):
   - `packages/strata-ds/guidelines/BRAND_STYLING.md`
   - `src/components/widgets/WidgetCard.tsx` (card pattern)
   - `src/components/MetricCard.tsx` (metric pattern)
3. Verify build passes before touching code:
   ```bash
   npx vite build 2>&1 | tail -3
   ```
4. Load the current todo state from this plan (which phases are done).

---

## Implementation Phases

### Phase 0 — Scaffold (30 min)

**Goal:** Create the empty feature folder structure with stubs.

**Files to create:**
- `src/features/strata-estimator/index.ts` — barrel export
- `src/features/strata-estimator/types.ts` — TypeScript interfaces
- `src/features/strata-estimator/mockData.ts` — JPS line items + constants

**Context needed:**
- None (isolated scaffolding)

**Exit criteria:**
- Build passes
- 3 files created, empty exports
- Commit: `feat(estimator): scaffold strata-estimator feature folder`

**Verification:**
```bash
ls src/features/strata-estimator/
npx vite build 2>&1 | tail -3
```

---

### Phase 1 — Types + Mock Data (45 min)

**Goal:** Define all TypeScript types and JPS mock data inline, no UI.

**Files to modify:**
- `src/features/strata-estimator/types.ts`

**Types required (exact):**
```typescript
export type EstimatorTab = 'ESTIMATOR' | 'PROJECTS' | 'CONFIG'
export type EstimateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED'
export type SyncStatus = 'idle' | 'saving' | 'synced' | 'error'

export interface Category {
    id: string
    label: string
    rate: number
    subcategories: Record<string, Subcategory>
}

export interface Subcategory {
    id: string
    label: string
    rate: number
}

export interface LineItem {
    id: string
    categoryId: string
    subCategoryId: string
    description: string
    quantity: number
}

export interface Customer {
    name: string
    address: string
    zipCode: string
}

export interface OperationalVariables {
    noElevator: boolean
    isUnion: boolean
    afterHours: boolean
    siteProtection: boolean
    duration: number
}

export interface EstimateResult {
    baseHours: string
    totalHours: string
    totalCost: string
    salesPrice: string
    grossMargin: string
    crewSize: number
    hourlyRate: number
}

export interface ConfigState {
    categories: Record<string, Category>
    rates: { NON_UNION: number; UNION: number }
    multipliers: { STAIR_CARRY: number; AFTER_HOURS: number; SITE_PROTECTION: number }
    defaultMargin: number
}

export interface SavedEstimate {
    id: string
    customer: Customer
    lineItems: LineItem[]
    variables: OperationalVariables
    config: ConfigState
    estimate: EstimateResult
    status: EstimateStatus
    actualCost: number
    timestamp: number
}
```

**Mock data (`mockData.ts`):**
- `INITIAL_CATEGORIES` — 5 categories (SYSTEMS, PRIVATE_OFFICE, TASK_SEATING, CONFERENCE, ANCILLARY) each with subcategories (copy rates from Project Aries code)
- `INITIAL_RATES` — `{ NON_UNION: 65, UNION: 95 }`
- `INITIAL_MULTIPLIERS` — `{ STAIR_CARRY: 1.30, AFTER_HOURS: 1.50, SITE_PROTECTION: 1.05 }`
- `INITIAL_MARGIN = 0.35`
- `JPS_LINE_ITEMS` — 24 pre-filled items (first pass: 3-5 items representative, rest in Phase 5)
- `MOCK_SAVED_ESTIMATES` — 4 sample projects (JPS, 3 others) with variance data

**Exit criteria:**
- Build passes
- All types exported from barrel
- Commit: `feat(estimator): add types and mock data`

---

### Phase 2 — Calculation Logic (30 min)

**Goal:** Pure function for cost calculation, no UI, unit-testable.

**File:** `src/features/strata-estimator/calculations.ts`

**Function signature:**
```typescript
export function calculateInstall(
    lineItems: LineItem[],
    variables: OperationalVariables,
    config: ConfigState
): EstimateResult
```

**Logic (exact, from Project Aries):**
1. Sum `baseHours` = Σ (rate × quantity) for each line item
2. Apply multipliers: STAIR_CARRY if `noElevator`, AFTER_HOURS if `afterHours`, SITE_PROTECTION if `siteProtection`
3. `cost = adjustedHours × (isUnion ? UNION_RATE : NON_UNION_RATE)`
4. `salesPrice = cost / (1 - defaultMargin)`
5. `crewSize = ceil(adjustedHours / (8 × duration))`
6. Return with `.toFixed(2)` formatting

**Exit criteria:**
- Build passes
- Export from barrel
- Commit: `feat(estimator): add calculation logic`

---

### Phase 3 — Shell + Navbar (1 hour)

**Goal:** Top-level container with 3-tab navigation, no tab content yet.

**Files to create:**
- `src/features/strata-estimator/StrataEstimatorShell.tsx`
- `src/features/strata-estimator/StrataEstimatorNavbar.tsx`

**Context needed (read before coding):**
- `src/components/Navbar.tsx` (for brand area pattern)
- `src/Transactions.tsx` lines 400-460 (tab switcher pattern with `TabGroup` headless UI)

**Navbar requirements (Aries parity):**
- Brand icon pill (Calculator) + "Strata Estimator" + sync status
- Sync badge: ONLY `synced` (Recovery Active) or `saving` (Auto-saving) — NO idle/error states
- Tabs pill: ESTIMATOR | PROJECTS | CONFIG with icons (`LayoutDashboard`, `Archive`, `Settings` from lucide-react)
- Icon buttons: Download / Upload (use `Download` / `UploadCloud` from lucide-react)
- CTA: "Save Project" with `Save` icon, `bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 rounded-lg`

**Must NOT include (Aries parity):**
- ❌ Theme toggle
- ❌ User avatar / profile
- ❌ Notifications / Action Center
- ❌ Tenant selector
- ❌ Search
- ❌ Help button
- ❌ Breadcrumbs below navbar
- ❌ Sync states beyond `synced` and `saving`

**Shell requirements:**
- Full-page container: `flex flex-col min-h-screen bg-background text-foreground`
- Navbar at top
- TabPanels area with placeholder: `<div className="p-6">Tab content placeholder</div>`
- State: `activeTab`, `syncStatus`, `customer`, `lineItems`, `variables`, `config` (initialized from `INITIAL_*`)

**Exit criteria:**
- Build passes
- Shell renders with empty tabs
- Commit: `feat(estimator): add shell and navbar with 3 tabs`

---

### Phase 4 — Project Dossier Card (45 min)

**Goal:** Header card for client info with ZIP rate lookup.

**File:** `src/features/strata-estimator/EstimatorDossierCard.tsx`

**Context needed:**
- `src/components/widgets/WidgetCard.tsx` (base card structure)

**Props:**
```typescript
{
    customer: Customer
    onCustomerChange: (customer: Customer) => void
    onRateLookup: () => void
    isSearchingRates: boolean
}
```

**Structure (Aries parity):**
- Card: `bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-sm relative overflow-hidden`
- Accent left bar: `<div className="absolute top-0 left-0 w-1 h-full bg-primary" />`
- Padding: `p-6`
- Title row: `User` icon + "Project Dossier" (`text-sm font-semibold uppercase tracking-wider text-muted-foreground`)
- 3-column grid (`grid-cols-1 md:grid-cols-3 gap-6`):
  1. Client Name input
  2. Postal/Region input + Search icon button
  3. Site Location input
- Input style: `w-full px-3 py-2 text-sm bg-background border-b border-border focus:border-primary outline-none transition-colors`
- Search button: `p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors`

**Must NOT include (Aries parity):**
- ❌ Save draft button inside the card
- ❌ Project number / ID display
- ❌ Client logo / avatar
- ❌ Status badge
- ❌ Tabs inside this card
- ❌ Contact info fields (phone, email)
- ❌ Project description textarea
- ❌ Due date / deadline

**Wire up in Shell:** Render in ESTIMATOR tab.

**Exit criteria:**
- Build passes
- Card renders with 3 functional inputs
- Commit: `feat(estimator): add project dossier card`

---

### Phase 5 — Financial Summary Hero (1 hour)

**Goal:** Dark hero card showing final quote price + 4 metrics + CTA.

**File:** `src/features/strata-estimator/FinancialSummaryHero.tsx`

**Context needed:**
- `src/components/MetricCard.tsx` (for trend pattern reference)
- Project Aries code lines 432-469 (hero bar layout reference only, DO NOT copy classes)

**Props:**
```typescript
{
    estimate: EstimateResult
    onGenerateProposal: () => void
}
```

**Structure:**
- Outer: `bg-zinc-900 dark:bg-zinc-950 rounded-2xl border-l-4 border-brand-500 shadow-lg p-6 text-white overflow-hidden`
- Flex row: Final Quote Price (left) + divider + 4 metrics inline (center) + CTA (right)
- Final Quote:
  - Label: `text-[10px] font-bold text-brand-400 uppercase tracking-widest`
  - Value: `text-4xl font-bold tracking-tight text-white` with `$` in `text-xl text-zinc-400`
- 4 metrics (grid-cols-4 gap-4):
  1. Base Cost — `text-xs text-zinc-400` label, `text-lg font-semibold` value
  2. Margin (with %) — `text-success` color
  3. Total Hours — normal
  4. Crew Requirement — with "installers" suffix
- CTA button:
  - `bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 rounded-xl px-6 py-3 font-semibold`
  - Icon: `Receipt` + text "Generate Proposal" + `ArrowRight`

**Must NOT include (Aries parity):**
- ❌ Progress bar showing completion %
- ❌ Pricing history trend chart
- ❌ Comparison vs previous quote
- ❌ Currency selector
- ❌ Tax breakdown
- ❌ Discount inputs (discount is in Config tab only)
- ❌ Secondary CTAs (only "Generate Proposal")
- ❌ Price lock indicator

**Wire up in Shell:** Below dossier card in ESTIMATOR tab. Compute `estimate` via `useMemo` calling `calculateInstall()`.

**Exit criteria:**
- Build passes
- Hero renders with live calculations
- Commit: `feat(estimator): add financial summary hero`

---

### Phase 6 — Bill of Materials Table (1.5 hours)

**Goal:** Editable table of line items with AI Import button.

**File:** `src/features/strata-estimator/BillOfMaterialsTable.tsx`

**Context needed:**
- `src/features/po-conversion/PODetailPage.tsx` lines 238-270 (table pattern reference)

**Props:**
```typescript
{
    lineItems: LineItem[]
    config: ConfigState
    onUpdateItem: (id: string, field: keyof LineItem, value: any) => void
    onAddItem: () => void
    onRemoveItem: (id: string) => void
    onAiImport: () => void
    onAiRefine: () => void
    hasLastFile: boolean
}
```

**Structure:**
- Card container: standard DS card
- Header:
  - Title "Bill of Materials" with `FileText` icon
  - Actions right:
    - "AI Import" button: `bg-ai/10 text-ai border border-ai/20 hover:bg-ai/20 px-4 py-2 rounded-lg text-xs font-semibold` with `Sparkles` icon
    - "AI Refine" (if `hasLastFile`): same style but `Wand2` icon
    - "+ Add Line" button: brand CTA
- Table:
  - Columns: Group (select) | Product Line (select) | Description (textarea) | QTY (number) | Actions (trash)
  - Row hover: `hover:bg-muted/50`
  - Inline editing with `bg-transparent` inputs
  - Trash button: `text-muted-foreground hover:text-destructive`

**Must NOT include (Aries parity):**
- ❌ Price column (only qty, no per-item price display)
- ❌ Total row at the bottom (totals are in the Hero above)
- ❌ Category filter
- ❌ Search within line items
- ❌ Bulk select / checkbox column
- ❌ Drag-to-reorder handles
- ❌ Row expansion (subrows)
- ❌ Comments per line
- ❌ Image/thumbnail column
- ❌ SKU separate from Product Line
- ❌ Pagination (Aries shows all items, scrollable)

**Wire up in Shell:** Below Financial Hero in ESTIMATOR tab.

**Exit criteria:**
- Build passes
- Table renders 3-5 mock items from Phase 1
- Inline editing works, quantities recalculate hero in real-time
- Commit: `feat(estimator): add bill of materials table`

---

### Phase 7 — Operational Constraints Panel (1 hour)

**Goal:** Panel for install days + 4 checkboxes + crew capacity display.

**File:** `src/features/strata-estimator/OperationalConstraintsPanel.tsx`

**Props:**
```typescript
{
    variables: OperationalVariables
    onVariablesChange: (variables: OperationalVariables) => void
    crewSize: number
}
```

**Structure:**
- Card container: standard DS card
- Title: "Operational Constraints" with `HardHat` icon
- 2-column grid:
  - **Left column:**
    - Planned Install Days card:
      - `Calendar` icon + "Planned Install Days" label
      - Number input `text-xl font-semibold text-primary` centered
      - "Days" suffix
    - 2x2 grid of checkboxes:
      - Union Force, Stair Carry, After Hours, Protection
      - Each checkbox: `flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary transition-colors cursor-pointer`
  - **Right column:**
    - Target Crew Capacity card (dark):
      - `bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-6 text-white`
      - `HardHat` icon large (right side)
      - "Target Crew Capacity" label in `text-brand-400 text-[10px] uppercase`
      - Crew number in `text-3xl font-bold` + "installers" label

**Must NOT include (Aries parity):**
- ❌ Start date / end date pickers
- ❌ Shift selection (morning/afternoon/night)
- ❌ Equipment needed checklist
- ❌ Site photos / reference images
- ❌ Risk assessment dropdown
- ❌ Permit status
- ❌ Weather forecast
- ❌ Tools required list
- ❌ Supervisor assignment

**Wire up in Shell:** Below BoM table in ESTIMATOR tab.

**Exit criteria:**
- Build passes
- Checkbox changes trigger hero recalculation
- Commit: `feat(estimator): add operational constraints panel`

---

### Phase 8 — Vision Engine Modal (AI Import) (1.5 hours)

**Goal:** Modal for AI spec extraction.

**File:** `src/features/strata-estimator/VisionEngineModal.tsx`

**Context needed:**
- `src/components/modals/AIProcessingModal.tsx` (reuse pattern)
- `src/components/simulations/DuplerPdfProcessor.tsx` lines 1-100 (AI simulation pattern)

**Props:**
```typescript
{
    isOpen: boolean
    onClose: () => void
    onItemsExtracted: (items: LineItem[]) => void
    lastFile: { name: string } | null
}
```

**Structure:**
- `Dialog` from headless UI with backdrop
- Panel: `bg-card dark:bg-zinc-800 rounded-2xl border border-border shadow-2xl max-w-2xl`
- Header:
  - Icon: `Sparkles` in `bg-ai/10 text-ai p-3 rounded-xl`
  - Title: "Strata Vision Engine" + subtitle "Deep Spec Scan" / "Refinement Mode"
  - Close button
- Body (3 states):
  1. **Initial** (no file): Upload area with `Upload` icon + "Select Spec Document" button
  2. **Refinement** (has file): File name display + textarea for corrections
  3. **Analyzing**: Spinner animation (reuse pattern from AIProcessingModal)
- Footer actions: Cancel + Submit (brand CTA)

**Must NOT include (Aries parity):**
- ❌ PDF preview pane
- ❌ Extracted items preview list before confirming
- ❌ Confidence score per item
- ❌ Category mapping preview
- ❌ Progress bar with percentage
- ❌ Agent pipeline visualization
- ❌ History of previous uploads
- ❌ File type selector beyond PDF/image
- ❌ Multiple file upload
- ❌ OCR settings / options

**Simulation:** When user clicks submit, wait 2 seconds, then call `onItemsExtracted` with 5 mock line items.

**Exit criteria:**
- Build passes
- Modal opens from "AI Import" button in BoM table
- Submits mock items that populate the table
- Commit: `feat(estimator): add vision engine modal`

---

### Phase 9 — Wire Up ESTIMATOR Tab (30 min)

**Goal:** Connect all phase 4-8 components in the Shell with shared state.

**File:** `src/features/strata-estimator/StrataEstimatorShell.tsx`

**Tasks:**
1. Add state: `lineItems`, `customer`, `variables`, `config`, `isAiModalOpen`, `lastFile`
2. Compute `estimate` via `useMemo(() => calculateInstall(lineItems, variables, config), [lineItems, variables, config])`
3. Render in ESTIMATOR tab:
   ```tsx
   <main className="p-6 space-y-6 max-w-7xl mx-auto">
     <EstimatorDossierCard ... />
     <FinancialSummaryHero estimate={estimate} ... />
     <BillOfMaterialsTable ... />
     <OperationalConstraintsPanel ... />
   </main>
   ```
4. Wire the VisionEngineModal at the bottom of the shell

**Exit criteria:**
- Build passes
- Full ESTIMATOR tab renders end-to-end
- All calculations live (checkbox → hero update)
- AI Import modal populates table
- Commit: `feat(estimator): wire up ESTIMATOR tab with shared state`

**Checkpoint:** This is the MVP. Demo can show the Estimator tab as standalone feature from here.

---

### Phase 10 — PROJECTS Tab (1 hour)

**Goal:** Archive view listing saved projects with variance tracking.

**File:** `src/features/strata-estimator/ProjectsArchiveView.tsx`

**Context needed:**
- `src/features/po-conversion/PODraftsListPage.tsx` (80% reusable pattern)

**Props:**
```typescript
{
    savedEstimates: SavedEstimate[]
    onLoadEstimate: (estimate: SavedEstimate) => void
    onDeleteEstimate: (id: string) => void
    onUpdateStatus: (id: string, status: EstimateStatus) => void
    onUpdateActualCost: (id: string, cost: number) => void
}
```

**Structure:**
- Header with title "Project History" + search input
- Grid of cards, each showing:
  - Client name + status badge (DRAFT/PENDING/APPROVED/COMPLETED)
  - ZIP + date
  - 3 metrics: Est. Labor | Actual Labor (editable) | Yield Variance (trending up/down)
  - Actions: Load / Delete icon buttons

**Reuse:**
- Status badge pattern from `ConversionStatusBadge` (copy + adapt)
- Card layout from `PODraftsListPage`

**Must NOT include (Aries parity):**
- ❌ Filters bar (status, vendor, date)
- ❌ Sort options
- ❌ View toggle (grid/list/table)
- ❌ Pagination
- ❌ Summary bar with totals
- ❌ Analytics charts
- ❌ Export button (PDF/CSV)
- ❌ Bulk select / bulk delete
- ❌ Archive / unarchive toggle
- ❌ Tag system
- ❌ Starred / favorites
- ❌ Share button
- ❌ Activity feed

**Wire up in Shell:** Render in PROJECTS tab.

**Exit criteria:**
- Build passes
- 4 mock projects render
- Commit: `feat(estimator): add projects archive tab`

---

### Phase 11 — CONFIG Tab (1.5 hours)

**Goal:** Admin view for rates, categories, and margin.

**Files:**
- `src/features/strata-estimator/EstimatorAdminView.tsx`
- `src/features/strata-estimator/RangeSlider.tsx`
- `src/features/strata-estimator/CategoryConfigCard.tsx`

**Range Slider component:**
- `<input type="range">` wrapped in card
- Display value in large brand color
- Accent: `accent-primary`

**Admin View structure:**
- Title: "Administrative Logic" with `Settings2` icon
- 2-column grid:
  - Default Margin slider (0.1 - 0.6)
  - Base Labor Hourly Costs (Non-Union / Union inputs)
- Below: Grid of Category Config Cards
  - Each category: title + subcategories list + add subcategory button
  - Each subcategory: label + editable rate input

**Must NOT include (Aries parity):**
- ❌ User management section
- ❌ Role permissions
- ❌ Tenant / workspace settings
- ❌ API keys / integrations
- ❌ Webhooks
- ❌ Notification preferences
- ❌ Email templates
- ❌ Audit log
- ❌ Data import/export settings
- ❌ Theme / branding customization
- ❌ Language / locale settings
- ❌ Tax settings (beyond margin)
- ❌ Currency settings
- ❌ Backup schedule
- ❌ Multi-step config wizards

**Exit criteria:**
- Build passes
- CONFIG tab fully functional
- Commit: `feat(estimator): add config/admin tab`

---

### Phase 12 — Integration with WRG Demo Flow (1 hour)

**Goal:** Connect the Strata Estimator to the existing WRG demo steps w2.1-w2.3.

**Files to modify:**
- `src/config/profiles/wrg-demo.ts`
- `src/App.tsx` (or demo context routing)

**Tasks:**
1. Update step descriptions in `wrg-demo.ts` for w2.1, w2.2, w2.3 to reference the new Estimator
2. Change `app` field to `wrg-estimator` for w2.1-w2.3
3. Add routing in App.tsx or demo context to render `StrataEstimatorShell` when `app === 'wrg-estimator'`
4. Pre-fill customer data from w1 (JPS Health Network) when transitioning from w1.5 to w2.1

**Exit criteria:**
- Build passes
- Demo flow navigates from w1 to Estimator on w2.1
- Commit: `feat(wrg-demo): integrate estimator into flow 2`

---

### Phase 13 — Pricing Waterfall + Quote Assembly (1.5 hours)

**Goal:** Extract pricing waterfall from `WrgLaborEstimation.tsx` into a reusable component, integrate in Estimator for w2.3.

**Files:**
- `src/features/strata-estimator/PricingWaterfall.tsx` (new)
- Extract logic from `src/components/simulations/WrgLaborEstimation.tsx` (search for "waterfall" or "$287" or pricing animation)

**Component:**
- Shows price breakdown animation: List Price → Discount → Net → +Labor → +Freight → Final
- Each step appears sequentially with fade-in

**Integration:**
- When user clicks "Generate Proposal" in hero, trigger the waterfall animation
- After animation, show "Select Dealer" button to send for review

**Exit criteria:**
- Build passes
- Waterfall plays when Generate Proposal clicked
- Commit: `feat(estimator): add pricing waterfall for quote assembly`

---

### Phase 14 — Designer Verification Sub-view (1 hour)

**Goal:** Overlay view within Estimator for w2.2 (Designer validates 5 modules).

**File:** `src/features/strata-estimator/DesignerVerificationOverlay.tsx`

**Structure:**
- Side panel or overlay over the Estimator
- 5 checkbox modules:
  1. Cost Summary
  2. Project Scope
  3. Escalated Item (OFS Serpentine)
  4. Assembly Verification
  5. Applied Rate ($798)
- Each module expandable with comments textarea
- "Preview PDF" button
- "Send Back to Expert" CTA

**Exit criteria:**
- Build passes
- Overlay triggered during w2.2
- Commit: `feat(estimator): add designer verification overlay`

---

### Phase 15 — Polish + Dark Mode + Narrative (1 hour)

**Goal:** Final polish pass.

**Tasks:**
1. Verify all components render correctly in dark mode (toggle and check each tab)
2. Verify responsive layout on `min-w-[1024px]` viewport
3. Update `wrg-demo.ts` descriptions with user-facing copy (narrative from plan section 8)
4. Add smooth transitions between tabs
5. Add loading skeleton for initial Estimator render

**Exit criteria:**
- Build passes
- Visual QA complete
- Commit: `feat(estimator): polish dark mode, responsive, narrative`

---

### Phase 16 — Documentation + Final Commit (30 min)

**Goal:** Add implementation report and final commit.

**Files:**
- `docs/wrg-demo/IMPLEMENTATION_REPORT.md` — what was built, how to test, gaps

**Tasks:**
1. Write implementation report following SDB-1365 format
2. List all files created/modified
3. Test instructions for each tab
4. Final commit + push

**Exit criteria:**
- Docs complete
- Build passes
- Commit: `docs(wrg-demo): add implementation report`

---

## Phase Dependency Graph

```
Phase 0 (Scaffold)
    ↓
Phase 1 (Types)
    ↓
Phase 2 (Calculations)
    ↓
Phase 3 (Shell + Navbar) ────────┐
    ↓                            │
Phase 4 (Dossier)                │
    ↓                            │
Phase 5 (Hero)                   │
    ↓                            │
Phase 6 (BoM Table)              │
    ↓                            │
Phase 7 (Constraints)            │
    ↓                            │
Phase 8 (Vision Modal)           │
    ↓                            │
Phase 9 (Wire Up) ◄──────────────┘  ← MVP CHECKPOINT
    ↓
Phase 10 (Projects) ─── can run parallel with Phase 11
Phase 11 (Config)
    ↓
Phase 12 (WRG Flow Integration)
    ↓
Phase 13 (Waterfall)
    ↓
Phase 14 (Designer Overlay)
    ↓
Phase 15 (Polish)
    ↓
Phase 16 (Docs)
```

---

## Session Management

### Recommended session sizes:
- **Short session (1-2 phases):** Phase 0+1, Phase 2+3, Phase 4+5, etc.
- **Medium session (3 phases):** Phase 6+7+8 (they build on each other)
- **Never:** More than 3 phases in one session (context loss risk)

### Session template for continuing:

```
Continue WRG Demo v6 implementation from the IMPLEMENTATION_PLAN.md at
docs/wrg-demo/IMPLEMENTATION_PLAN.md

Current state: Phase X completed, commit hash: <hash>
Next phase to execute: Phase Y

Before starting:
1. Verify branch is "demo"
2. Verify build passes
3. Read the "Context needed" files listed in Phase Y
4. Execute Phase Y following the exact structure in the plan
5. Commit with the exact message from the plan

Do NOT execute Phase Y+1 in the same session unless I explicitly ask.
```

---

## Rollback Strategy

If any phase produces a broken build:

1. **Do NOT continue to next phase**
2. `git diff` to see what changed
3. Fix the issue OR `git checkout -- .` to discard changes
4. Re-execute the failed phase with the specific error context
5. If stuck, mark the phase as "blocked" and skip to a parallel phase (see dependency graph)

---

## Success Metrics

- [ ] 16 commits, one per phase
- [ ] Each commit passes `npx vite build`
- [ ] Final demo: Navigate w1.1 → w1.5 → w2.1 (Estimator) → w2.4 (Dealer Review)
- [ ] All 3 tabs (Estimator, Projects, Config) functional
- [ ] Dark mode works in all screens
- [ ] AI Import modal populates BoM with mock items
- [ ] Financial hero updates in real-time when checkboxes toggle
- [ ] Total new code: ~2300 lines
- [ ] Zero regressions in existing Flow 1 (w1.1-w1.5)

---

## Open Questions (Resolve before Phase 12)

1. Should CONFIG tab be hidden from stakeholder demos? (Affects Phase 11 scope)
2. Does w2.4 stay in Transactions or move into Estimator? (Affects Phase 12 routing)
3. Are the 24 JPS line items the same as in `WrgLaborEstimation.tsx`? (Affects Phase 1 mock data)
4. Should the Vision Engine modal show a real PDF preview or just animation? (Affects Phase 8 complexity)
