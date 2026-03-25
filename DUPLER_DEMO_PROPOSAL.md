# Dupler — Demo Summary (Implementado)

> **Cliente:** Dupler Office & Installation
> **Proyecto demo:** Mercy Health Phase 2
> **Herramientas actuales:** PMX/SPEC, CET, Compass (HNI), RPC Core (ERP), HubSpot
> **Fabricantes:** Allsteel (primario), Gunlock, National Furniture
> **Plataforma:** Strata Experience — React + Vite + TypeScript + Tailwind

---

## Narrativa Central

> *"Los diseñadores de Dupler reciben cotizaciones de fabricantes que NO están en CET — PDFs, websites, portales de vendors — y hoy copian cada línea manualmente a SPEC. Un error en un número de parte o un precio mal copiado puede costar miles de dólares. Mientras tanto, el inventario del almacén se gestiona fragmentado entre sistemas, y los reportes viven dispersos entre CET, Compass, Warehouse y Carrier. Strata unifica todo: el PDF entra, la IA lo procesa con confidence scoring, el designer revisa solo lo que la IA no pudo resolver con certeza, el SC aplica pricing asistido por IA, y el inventario se monitorea proactivamente con alertas predictivas."*

---

## Flow 1: Vendor Data Extraction & Specification Building
### "De datos no estructurados a PMX validado — con trazabilidad completa"

**Objetivo:** Mostrar cómo Strata extrae datos de fuentes no estructuradas (PDFs de vendors, URLs de fabricantes) y los convierte en un PMX validado con confidence scoring, verificación de precios (Compass para HNI, source PDF para non-CET), auditoría contra planos, y handoff estructurado al Sales Coordinator.

**Pain point:** Los fabricantes fuera de CET (como National Furniture) requieren que los diseñadores copien datos línea por línea desde PDFs/websites a SPEC. Proceso lento, propenso a errores, sin trazabilidad de fuente.

**Proyecto:** Mercy Health Phase 2 — 32 items (24 CET/HNI + 8 National non-CET)

---

### d1.1 — Vendor Data Upload & AI Extraction
**Designer** | Interactivo | App: `dupler-pdf`

> *"El diseñador sube una cotización de National Furniture (NF-2026-0412). Puede elegir entre subir un PDF o pegar una URL de fabricante. La IA procesa el documento: 4 agentes trabajan en secuencia — PdfOcrAgent lee el documento, SemanticParser identifica campos estructurados, LineItemDetector encuentra 8 items, y FieldClassifier extrae SKUs, cantidades, acabados, opciones y precios. Los items aparecen uno por uno con confidence scores — 6 items al 97%+, 2 items flaggeados (72% y 81%)."*

**Interacciones del usuario:**
- Zona de upload con tabs PDF/URL (mock auto-selecciona PDF)
- Observa pipeline de 4 agentes AI con progress
- Los 8 items se revelan progresivamente con confidence badges
- Click "Continue to Mapping & Review →"

---

### d1.2 — AI Mapping & Confidence Review
**Designer** | Interactivo | App: `dupler-pdf`

> *"La IA estructura los datos extraídos en formato SPEC/PMX. 5 de 8 items se auto-mapean al 97%+ de confianza. 3 items quedan flaggeados para revisión del diseñador. Cada flag muestra un split-view: a la izquierda el extracto del PDF fuente, a la derecha el valor extraído por la IA. El diseñador puede aceptar el valor AI o corregirlo manualmente."*

**Interacciones del usuario:**
- Summary bar: "5 Auto-Mapped (97%+)" + "3 Flagged for Review"
- Split-view para cada flag: SOURCE PDF vs AI EXTRACTED
- Botones "Accept AI Value" o "Edit" por cada flag
- Click "Approve Mapping — Continue to Validation"

**Flags:**
1. Waveworks Desk — Qty "8-10 units", AI eligió 8 (72%)
2. Realize Desk — Option string cortado "stor..." (81%)
3. Tercer flag con verificación de finish/color

---

### d1.3 — Validation: Options, Upcharges & Pricing
**Designer** | Interactivo | App: `dupler-pdf`

> *"La IA valida opciones, detecta upcharges, y verifica precios por fuente. Sección A: 2 upcharges detectados ($1,380 total — Graphite finish + Grade 3 fabric). Sección B: Compass verifica 22/24 items HNI con 2 actualizaciones de precio (+3% y +2.3%). Sección C: 8/8 items National verificados contra el PDF fuente. Nota informativa: los items validados por el Designer serán ruteados al Sales Coordinator."*

**Interacciones del usuario:**
- Acknowledge 2 upcharges ($1,020 + $360) con CTA por card
- Resolver 2 actualizaciones de Compass (aceptar precio Compass o mantener SPEC)
- Non-CET: verificación automática contra source PDF (informativo)
- Nota "DESIGNER → SC" preparando el handoff
- Click "Continue to Drawing Audit"

---

### d1.4 — Audit vs Drawings & PMX Generation
**Designer** | Interactivo | App: `dupler-pdf`

> *"La IA cruza cantidades del spec contra los planos del piso. 31/32 coinciden. 1 discrepancia: Waveworks Desk — spec dice 8, plano dice 10. El diseñador resuelve y genera el PMX con trazabilidad completa de fuentes. El documento PMX-MH-0412 incluye badges de verificación (Drawing Verified, Source Archived, Validated) y se envía al Sales Coordinator via popover de selección de persona."*

**Interacciones del usuario:**
- Resolver 1 discrepancia de drawing audit (actualizar a qty del plano o mantener spec)
- Observar fuentes archivadas (NF-2026-0412.pdf + MercyHealth_Phase2.sif)
- Click "Generate PMX" → barra de progreso con 4 mensajes del PmxGenerator
- Preview del documento PMX con stats (24 Compass Verified, 8 PDF Extracted, $1,380 Upcharges)
- Click "Send to Sales Coordinator" → popover con Randy Martinez (SC), James Mitchell (AE), Mike Torres (Ops)
- Seleccionar Randy → handoff completo

---

### d1.5 — SC Review & Pricing Application
**SC (Sales Coordinator)** | Interactivo | App: `dashboard`

> *"Randy Martinez recibe el PMX-MH-0412 con trazabilidad completa. Ve la tabla de items con source badges: 'FROM CET' (teal) para HNI items, 'FROM VENDOR PDF' (amber) para National items. Items que fueron flaggeados en d1.2 muestran ícono ⚠ con badge 'DESIGNER CONFIRMED'. Puede hacer click en 'View Source' para ver el extracto del PDF fuente. Aplica descuentos asistidos por IA: Allsteel 42% GPO, Gunlock 38% Dealer, National 35% Volume. Genera SIF y exporta a CORE."*

**Interacciones del usuario:**
- Tabla de items con source badges por línea (CET / Vendor PDF)
- Botón "View Source" en items non-CET → modal con extracto del PDF
- Inline flags ⚠ en items previamente flaggeados + badge "DESIGNER CONFIRMED"
- Aplicar 3 discount tiers con AI assistance (sliders/inputs)
- Totales dinámicos se actualizan en tiempo real
- Click "Generate SIF & Export to CORE" → pipeline de agentes → éxito

---

### Cierre Flow 1

> *"Lo que antes era un diseñador copiando datos línea por línea desde un PDF ahora es un proceso asistido por IA: extracción con confidence scoring, mapeo con split-view para revisión humana, validación cruzada con Compass y planos, y un PMX con trazabilidad completa — desde el PDF fuente hasta el SIF en CORE. El diseñador solo toca lo que la IA no pudo resolver con certeza."*

---

## Flow 2: Warehouse & Inventory Intelligence
### "Visibilidad total — desde el almacén hasta el sitio del proyecto"

**Objetivo:** Gestión inteligente del inventario de Dupler — escaneo de salud del warehouse, receiving con assessment de condición, verificación de precios y márgenes, sync multi-warehouse, tracking de tránsito con alertas predictivas, claims de vendors, y aprobación de dispatch del Dealer.

**Pain point:** Sin visibilidad en tiempo real del inventario. Consignment items olvidados en sitios de clientes ("Wall of Shame"). Allocation conflicts entre proyectos. Freight overcharges no detectados. El almacén es una caja negra.

---

### d2.1 — Warehouse Health & Consignment Intelligence
**Expert** | Interactivo | App: `dupler-warehouse`

> *"3 warehouses escaneados — Columbus al 72% con Mercy Health Phase 2 llegando. Wall of Shame: 3 items de consignment pasados de fecha en sitio de cliente (180+ días). 2 conflictos de allocation: Acuity Chairs prometidas a 2 proyectos (14 necesarias, 12 disponibles). La IA recomienda relocar 85 items a Cincinnati para ahorrar $3,600/mes en overflow."*

**Interacciones:** Review Wall of Shame → Resolve allocation conflicts → Apply relocation recommendations

---

### d2.2 — Receiving & Condition Assessment
**Expert** | Interactivo | App: `dupler-warehouse`

> *"QR scan de 30 items del PO-2026-0389. 28 auto-matched. 2 excepciones: 1 missing/backorder (ETA 2 semanas), 1 wrong finish (Fog vs Graphite). Assessment de condición: 26 pristine, 3 inspeccionar, 1 dañado. Acciones por excepción: Source Alternative, Notify Client, Accept Backorder para missing. Initiate Return, Accept as Substitute, Escalate to Vendor para wrong item."*

**Interacciones:** Resolver 2 excepciones con acciones contextuales → Click "Confirm Receiving"

---

### d2.3 — PO Price & Margin Verification
**Expert** | Interactivo | App: `dupler-warehouse`

> *"15 items verificados contra price lists de Allsteel, Gunlock, National (tabla paginada — 3 páginas). 2 items con margin below 25% flaggeados: Terrace Lounge (23.8%) y Park Table (21.4%). Cards interactivas con 3 acciones por alert: Update PO Price, Override Margin, Escalate to SC. Summary bar con 4 KPIs: Total Items, PO Value, Current Value, Margin Alerts."*

**Interacciones:** Navegar paginación → Resolver 2 margin alerts con acciones contextuales → Click "Approve Pricing"

---

### d2.4 — Multi-Warehouse Sync
**Expert** | Interactivo | App: `dupler-warehouse`

> *"Sincronización de 3 warehouses + 2 job sites. Dock conflict auto-resuelto (SH-002 → Dock 3). Route optimization ahorra $1,200. Sección 'Pending Transit Intelligence' con badge 'SYNC DETECTED' y 3 indicadores de status — puente narrativo hacia d2.5."*

**Interacciones:** Observa sync results → Click "Analyze Transit & Freight — 5 Shipments Detected" (CTA que conecta con d2.5)

---

### d2.5 — In-Transit Intelligence & Freight Audit
**Expert** | Interactivo | App: `dupler-warehouse`

> *"5 shipments activos con badge 'FROM WAREHOUSE SYNC'. Alerta predictiva: SH-004 (Indiana Furniture) — delay por clima +2 días, impacto en 9 items de Mercy Health. Freight audit: carrier cobró $1,540, cotizado $1,200 → $340 overcharge. Split-shipment: PO-2026-0389 28/30 recibidos, 2 backordered. 3 acciones creíbles por alerta: Notify Client, Reroute Staging, Request Expedite. 3 acciones por freight: File Freight Claim, Dispute with Carrier, Accept Charge."*

**Interacciones:** Resolver alerta predictiva (1 de 3 acciones) → Resolver freight discrepancy (1 de 3 acciones) → Notificación-puente aparece: "Vendor Claims Detected — 3 ACTIVE CLAIMS, $2,770 Pending" → Click para avanzar a d2.6

---

### d2.6 — Vendor Claims & Returns
**Expert** | Interactivo | App: `dupler-warehouse`

> *"3 claims activos ($2,770 en créditos). Cada claim tiene acciones contextuales: Wrong Finish → Process Return / Credit Only / Quality Escalation. Packaging Damage → Schedule Inspection / Accept As-Is / Request Replacement. Warranty → Schedule Repair / Warranty Replace / Extend Warranty. 4 warranty alerts con acciones inline. Textarea de Expert Note para dejar comentarios y sugerencias."*

**Interacciones:** Resolver 3 claims + 4 warranty alerts con acciones contextuales → Escribir expert note → Click "Submit Claims Report — $2,770 Credits + Expert Notes"

---

### d2.7 — Dealer Review & Dispatch Approval
**Dealer** | Interactivo | App: `dashboard`

> *"Sarah Chen (Dealer) recibe notificación contextual con KPIs clave: items ready, total value, shipments, claims. Click abre el review completo: summary grid, expert notes del paso anterior, staging checklist (24/26 items ready), badge 'AI VERIFIED'. Textarea para dealer comments. 3 opciones de acción: Approve All & Dispatch, Request Changes, Hold for Review."*

**Interacciones:** Click notificación → Review summary → Leer expert notes → Verificar staging → Escribir dealer comment → Click "Approve All & Dispatch"

---

### Cierre Flow 2

> *"El almacén dejó de ser una caja negra. Wall of Shame para consignment overdue, allocation conflicts resueltos, margins verificados, freight audited, claims procesados con expert notes — y un dispatch aprobado con trazabilidad completa. Cada paso conectado narrativamente al siguiente."*

---

## Flow 3: Observability & Client Reporting
### "Cinco sistemas conectados, un solo reporte"

**Objetivo:** Conectar CET, SPEC, Compass, Warehouse, y Carrier en un data bridge unificado. Reconciliar inventario físico vs sistema. Generar reportes con alertas proactivas (Teams/Email/SMS). Distribuir a stakeholders. Portal de cliente read-only.

**Pain point:** Datos fragmentados entre 5+ sistemas. Reconciliar inventario requiere horas. Reportes se arman manualmente en Excel. El cliente no tiene visibilidad de su proyecto.

---

### d3.1 — Cross-System Data Bridge
**Expert** | Interactivo | App: `dupler-reporting`

> *"Notificación con SystemChips mostrando los 5 sistemas a conectar: CET ↔ SPEC ↔ COMPASS ↔ WMS ↔ CARRIER. Click para iniciar. Pipeline de 4 agentes (WarehouseSync, POTracker, StockAnalyzer, HealthScorer). Resultado: diagrama visual de Data Bridge con 5 nodos conectados, gráfica de stock por categoría (bar chart), 4 KPIs (Total Stock $1.2M, Fill Rate 89%, Backorders 42, Utilization 68%). Health score: 78/100."*

**Interacciones:** Click notificación (con SystemChips) → Observa pipeline → Review data bridge diagram + chart + KPIs → Click "Continue to Reconciliation"

---

### d3.2 — Inventory Reconciliation
**Expert** | Interactivo | App: `dupler-reporting`

> *"Conteo físico vs sistema: 97.2% match. 3 discrepancias encontradas: count mismatch (Acuity Chairs), location error (Stride Bench), missing item (Park Table relocated). Cada discrepancia tiene AI suggestion. Progress bar muestra 1837/1840 → 1840/1840 conforme se resuelven."*

**Interacciones:** Resolver 3 discrepancias con AI suggestions → Click "Acknowledge & Continue"

---

### d3.3 — Report Assembly & Proactive Alerts
**System** | Auto (8s) | App: `dupler-reporting`

> *"Ensamblaje automático del reporte de inteligencia de inventario. 3 push notifications mock: Teams (@Randy — Acuity Chairs below safety stock), Email (Mercy Health Phase 2 — 68% staged), SMS (URGENT: Park Table backorder — ETA Apr 7). Report marcado como 'Ready' → auto-advance."*

**Interacciones:** Observa (automático) — pipeline + 3 notificaciones push visuales

---

### d3.4 — Report Review & Distribution
**Dealer** | Interactivo | App: `dupler-reporting`

> *"Notificación con SystemChips (Report Engine, Distribution, PDF Export). Reporte con 4 secciones colapsables: Stock Availability (chart + KPIs), Warehouse Capacity (3 warehouses con forecast), Backorder Analysis (42 items, 3 critical), AI Recommendations (3 insights con confidence scores). 3 botones de acción: Preview (modal PDF de 4 páginas), Download PDF, Send to Team (popover con selección de destinatarios multi-select)."*

**Interacciones:**
- Click notificación → Review secciones del reporte (expandir/colapsar)
- Click "Preview" → modal con vista PDF de 4 páginas (cover, warehouses, AI recommendations, project status)
- Click "Download" → toast de confirmación
- Click "Send" → popover con 4 destinatarios (Randy, Tara, James, Sarah) con checkboxes → enviar → toast de éxito

---

### d3.5 — Client Portal Preview
**Dealer** | Interactivo | App: `dupler-reporting`

> *"Notificación con SystemChips (Portal Service, Milestone Tracker, Client View). Vista read-only del portal del cliente: Mercy Health Phase 2 — 68% complete. Delivery timeline con 5 milestones (2 done, 1 active, 2 pending). Stats: 22/32 Items Staged, On Schedule: Yes, Est. Completion: Apr 5. Nota informativa: 'This is the client's read-only portal view.'"*

**Interacciones:** Click notificación → Review portal preview → Click "Preview Report" (PDF modal) o "Complete Demo"

---

### Cierre Flow 3

> *"Cinco sistemas conectados en un data bridge. Inventario reconciliado al 97.2%. Alertas proactivas enviadas automáticamente por Teams, Email y SMS. Reporte de inteligencia de inventario con preview PDF, descarga, y envío selectivo a stakeholders. Y un portal de cliente donde Mercy Health puede ver el progreso sin llamar a Dupler."*

---

## Cierre General

> *"Tres flujos, una plataforma. Los datos de vendors non-CET se extraen con IA, se validan con confidence scoring, y se convierten en PMX con trazabilidad completa — del PDF fuente al SIF en CORE. El almacén tiene visibilidad total: Wall of Shame, freight audit, claims, y dispatch aprobado con expert notes. Y los 5 sistemas que antes vivían desconectados ahora alimentan un reporte unificado con alertas proactivas y un portal de cliente en tiempo real. Eso es Strata para Dupler."*

---

## Resumen de Implementación

| Flow | Nombre | Pasos | Roles | Objetivo |
|------|--------|-------|-------|----------|
| **1** | Vendor Data Extraction | 5 (d1.1–d1.5) | Designer (d1.1-d1.4), SC (d1.5) | PDF/URL → PMX validado → SIF en CORE |
| **2** | Warehouse & Inventory Intelligence | 7 (d2.1–d2.7) | Expert (d2.1-d2.6), Dealer (d2.7) | Warehouse health → receiving → pricing → sync → transit → claims → dispatch |
| **3** | Observability & Client Reporting | 5 (d3.1–d3.5) | Expert (d3.1-d3.2), System (d3.3), Dealer (d3.4-d3.5) | Data bridge → reconciliation → alerts → report → client portal |

---

## Roles por Flow

| Rol | Flow 1 | Flow 2 | Flow 3 |
|-----|--------|--------|--------|
| **Designer** | d1.1, d1.2, d1.3, d1.4 | — | — |
| **SC** | d1.5 | — | — |
| **Expert** | — | d2.1, d2.2, d2.3, d2.4, d2.5, d2.6 | d3.1, d3.2 |
| **System (Auto)** | — | — | d3.3 |
| **Dealer** | — | d2.7 | d3.4, d3.5 |

---

## Datos Consistentes del Demo

| Dato | Valor | Usado en |
|------|-------|----------|
| Proyecto | Mercy Health Phase 2 | Todos los flows |
| Items non-CET (National) | 8 | d1.1–d1.5 |
| Items CET/HNI (Allsteel + Gunlock) | 24 | d1.3–d1.5 |
| Total items | 32 | d1.3–d1.5 |
| Source PDF | NF-2026-0412 | d1.1–d1.5 |
| PMX ID | PMX-MH-0412 | d1.4, d1.5 |
| Upcharges total | $1,380 (2 items) | d1.3, d1.4, d1.5 |
| Compass price updates | +$170 (2 items) | d1.3 |
| Drawing discrepancy | 1 (Waveworks Desk: spec 8, drawing 10) | d1.4 |
| Project total | $95,580 | d1.4, d1.5 |
| Discount tiers | Allsteel 42%, Gunlock 38%, National 35% | d1.5 |
| Designer | Alex Rivera | d1.1–d1.4 |
| Sales Coordinator | Randy Martinez | d1.4 send, d1.5 review |
| Dealer | Sarah Chen | d2.7, d3.4, d3.5 |
| Warehouses | Columbus (72%), Cincinnati (45%), Dayton (38%) | d2.1, d3.1 |
| Inventory health score | 78/100 | d3.1 |
| Stock accuracy | 97.2% | d3.2 |
| Freight overcharge | $340 (SAIA carrier) | d2.5 |
| Vendor claims | $2,770 (3 claims) | d2.6 |

---

## Arquitectura Técnica

### Componentes Dedicados (Opción B — implementada)
| Componente | Flow | Ubicación |
|-----------|------|-----------|
| `DuplerPdfProcessor.tsx` | Flow 1 (d1.1–d1.4) + `DuplerScReview` (d1.5) | `src/components/simulations/` |
| `DuplerWarehouse.tsx` | Flow 2 (d2.1–d2.6) | `src/components/simulations/` |
| `DuplerReporting.tsx` | Flow 3 (d3.1–d3.5) | `src/components/simulations/` |
| `Dashboard.tsx` | Host de d1.5 (SC Review) y d2.7 (Dealer Review) | `src/` |
| `dupler.ts` | Config: steps, behaviors, messages, timing, self-indicated | `src/config/profiles/` |

### Patrones Reutilizados
- **Phase state machines**: idle → notification → processing → breathing → revealed → results
- **pauseAware**: Wraps setTimeout con polling para demo pause/resume
- **SystemChips**: Badges de conexión de sistemas (CET ↔ SPEC ↔ COMPASS...)
- **AIAgentAvatar + pipeline**: Agentes AI secuenciales con stagger y checkmarks
- **ConfidenceScoreBadge**: Scores de confianza por item
- **Split-view pattern**: PDF fuente vs valor extraído para revisión humana
- **Notification-bridge**: Notificación que conecta narrativamente al siguiente paso
- **SELF_INDICATED**: Steps que manejan su propio AI indicator
