# COI Interiors — Demo Flow Specification

> **Profile**: COI Interiors
> **Profile ID**: `coi`
> **Company Name**: COI Interiors
> **Total Steps**: 23 (across 3 flows)
> **Source**: `src/config/profiles/coi-demo.ts`

---

## Flow 1: RFQ → PO Processing (11 steps)

**6 automated + 5 HITL** — Data flows email → extraction → normalization → quote → PO without re-typing
**Addresses**: #4 PDF/email quote ingestion, #5 reduce double entry, #9 better customer quote, #10 familiar interfaces

| Step | Title | Mode | Role | AI Automation | Expert-in-the-Loop |
|------|-------|------|------|---------------|-------------------|
| 1.1 | Email Ingestion | auto (34s) | Dealer | System detects email with RFQ, identifies PDF spec + CSV attachments | Dealer sends email (passive trigger) |
| 1.2 | AI Extraction | auto (27s) | System | 5 AI agents: OCR processes PDF, TextExtract parses CSV, extracts 200 line items, maps 4 delivery zones | None — fully automated |
| 1.3 | Normalization | interactive | System | 4 AI agents: DataNormalizationAgent unifies data, generates confidence score per field, flags missing fields. 94% accuracy | Expert sees confidence scores; low-confidence items escalate as "Needs Attention" |
| 1.4 | Quote Draft | interactive | System | QuoteBuilder Agent auto-generates draft with pricing rules, applies volume discounts. Multi-zone freight requires validation | Expert decides: "Route to Expert Hub" if exceptions exist |
| 1.5 | Expert Review (HITL) | interactive | Expert | QuotePricingAgent validated 8 items, avg discount 60.8%. Flag: lounge seating 58% < standard 62%. Flag: Freight LTL $2,450 Austin TX | Expert inputs freight rate manually, reviews warranties, approves corrections. Audit trail records each decision |
| 1.6 | Approval Chain | auto (19s) | Dealer | Policy Engine auto-approves: VP Operations → auto, CFO → auto. 3-level chain | None — visual progression shown |
| 1.7 | Dealer Approval | interactive | Dealer | AI pre-fills summary: $43,750 total, 35.4% margin, key metrics | Dealer reviews and approves final quote |
| 1.8 | Sales Approval (Mobile) | interactive | End User | Automatic push notification to mobile | End User taps "Acknowledge" from phone |
| 1.9 | PO Generation | auto (50s) | Dealer | Generates PO, maps 5 SKUs, executes 3-level approval chain, transmits to supplier | None — fully automated |
| 1.10 | Smart Notifications | interactive | Dealer | AI digests by role: Dealer lifecycle summary, Expert exceptions only by priority | Informational — no action required |
| 1.11 | Pipeline View | interactive | Dealer | New order card with animated column transition. CRM auto-created | Informational |

---

## Flow 2: PO & Acknowledgement Comparison (7 steps)

**AI eliminates ~95% of manual PO vs Acknowledgement comparison work**
**Addresses**: #1 AI acknowledgement processing (highest priority), #2 shipment/order visibility, #3 customer communication

| Step | Title | Mode | Role | AI Automation | Expert-in-the-Loop |
|------|-------|------|------|---------------|-------------------|
| 2.1 | Acknowledgement Intake | auto (14s) | System | EDI/855 automatic intake. AIS (50 lines, $65K) + HAT (5 lines, $8K) arrive in pipeline | None — monitoring only |
| 2.2 | Smart Comparison | interactive | System | 8 AI agents: EDI normalization from eManage ONE. HAT: "Warm Grey 4" vs "Folkstone Grey" → same part# → auto-confirms 91%. AIS: grommet config error → flagged | Expert sees: HAT = green "Confirmed", AIS = red "Discrepancy". Click "Review Discrepancies" |
| 2.3 | Delta Engine | interactive | System | Auto-corrections: (1) Grommet error → auto-corrected, (2) Dates +14d/+11d → auto-accepted. Escalated: Qty shortfall 8→6, 4→2 → exceeds threshold | Expert chooses: Accept new date / Expedite (+$800) / Cancel |
| 2.4 | Expert Review — 50 Lines (HITL) | interactive | Expert | DiscrepancyResolverAgent: Azure fabric ≈ Navy (same price $89, same lead time). Confidence 91%, 76% | Expert reviews side-by-side PO vs Ack: accept ✓, reject ✗, edit, add notes. 50 line items. Full audit log |
| 2.5 | Authorization Chain | auto (20s) | System | 3-approver chain automatic (5s intervals) | None |
| 2.6 | Pipeline Resolution | interactive | Dealer | HAT → Confirmed column. AIS → Partial column | Informational |
| 2.7 | Smart Notifications | interactive | Dealer | "2 Acknowledgements processed, 1 clean, 1 with 3 exceptions resolved" (Dealer). Expert: exceptions only | Informational |

---

## Flow 3: Punch List / Warranty Claims (5 steps)

**AI validates documentation + business rules before expert acts**
**Addresses**: #6 reporting automation, #7 consistent reporting, #2 shipment visibility, #3 customer communication

| Step | Title | Mode | Role | AI Automation | Expert-in-the-Loop |
|------|-------|------|------|---------------|-------------------|
| 3.1 | Request Intake (HITL) | interactive | Expert | AI validates 5 docs: Order# ✓98%, Line# ✓96%, Issue photo ✓94%, Label ⚠️62% (SKU mismatch CC-AZ-2024 vs 2025), Box ✗0% (missing) | Expert reviews flags: Label → "model year variant, confirm". Box → "carrier liability, contact requester" |
| 3.2 | Labor Quote Requested | interactive | Expert | Strata tracks request, triggers AI validation on arrival | Presenter narration — click Next |
| 3.3 | Labor Review (HITL) | interactive | Expert | 6 rules: Repair $510 vs $500 max ⚠️, Trip $175 ✓, Certified ✓, Labor 6hrs vs 4hrs ⚠️, Warranty ✓, No dupes ✓. 4/6 pass | Expert AI suggestions: Repair → [Adjust $495] [Exception $510] [Split 2×$255]. Hours → [4hrs] [5hrs] [6hrs justified] |
| 3.4 | Claim Submission & Tracking | auto (24s) | Dealer | ClaimSubmissionAgent: assembles claim, SHA256 hashes, verifies ship-to, submits, tracks replacement | Expert can review liability (optional) |
| 3.5 | End User Report (Mobile) | interactive | End User | AI generates punch list report with photos, status, timeline | End User reviews on mobile, leaves comments, taps "Acknowledge" |

---

## Summary

| Metric | Flow 1 | Flow 2 | Flow 3 | Total |
|--------|--------|--------|--------|-------|
| Steps | 11 | 7 | 5 | **23** |
| Auto (AI only) | 4 | 2 | 1 | **7** |
| Interactive (HITL) | 7 | 5 | 4 | **16** |
| Named AI Agents | 5 | 8+ | 1 | **14+** |

## Stakeholder Initiative Coverage

| # | Initiative | Covered By |
|---|-----------|------------|
| 1 | AI Acknowledgement Processing | Flow 2 (2.1–2.6) — 8 AI agents, ~95% automation |
| 2 | Shipment/Order Visibility | Flow 2 (2.6–2.7), Flow 3 (3.4) |
| 3 | Customer Communication | Flow 1 (1.8, 1.10), Flow 2 (2.7), Flow 3 (3.5) |
| 4 | PDF/Email Quote Ingestion | Flow 1 (1.1–1.4) — 5+4 AI agents |
| 5 | Reduce Double Entry | Flow 1 (1.2, 1.9 — zero re-entry narrative) |
| 6 | Reporting Automation | Flow 3 (3.1, 3.3) — AI validates before expert acts |
| 7 | Consistent Reporting Logic | Flow 3 (3.3 — 6 business rules validation) |
| 9 | Better Customer Quote Experience | Flow 1 (1.4, 1.7, 1.8) |
| 10 | Familiar Interfaces | All flows reuse existing simulation apps |

## Simulation Apps Used

| App Key | Used In Steps |
|---------|--------------|
| `email-marketplace` | 1.1 |
| `dealer-kanban` | 1.2, 1.3, 1.4 |
| `expert-hub` | 1.5, 1.11, 2.1–2.6 |
| `dashboard` | 1.6–1.10, 2.7, 3.5 |
| `mac` | 3.1–3.4 |
