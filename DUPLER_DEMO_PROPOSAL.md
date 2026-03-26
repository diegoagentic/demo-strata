# Dupler — Resumen del Demo

> **Cliente:** Dupler Office & Installation
> **Proyecto:** Mercy Health Phase 2 — 7 items de Meridian Workspace (non-CET) + items de almacén existente
> **Sistemas que usa Dupler hoy:** Software de diseño (CET), especificaciones (SPEC), portal de precios de fabricantes (Compass), sistema de pedidos (RPC Core) y CRM (HubSpot)
> **Fabricantes:** Meridian Workspace (Flow 1), Allsteel/Gunlock/National (Flows 2-3)

---

## La historia que cuenta el demo

> *"Los diseñadores de Dupler encuentran fabricantes que no están en CET y pierden horas transcribiendo datos manualmente desde catálogos web hacia su sistema de especificaciones — sin registro de dónde salió cada dato, y donde cualquier error pasa desapercibido. Strata elimina esa transcripción: el diseñador pega la URL del catálogo, la IA extrae todos los productos automáticamente, sugiere las opciones que puede resolver y escala las complejas al Expert Hub — un especialista de producto que responde en minutos. El resultado: en minutos lo que antes tomaba horas, con trazabilidad completa de cada dato."*

---

## Flow 1: Del catálogo web a la especificación con precio
*5 pasos — Diseñador + Coordinador de Ventas*

**d1.1 — Lectura del catálogo web con IA**
El diseñador pega la URL del catálogo de Meridian Workspace (un fabricante que no está en CET) en Strata. La IA navega la página, extrae los 7 productos del catálogo Healthcare Office con todos sus datos: número de parte, descripción, opciones, cantidad y precio unitario. 3 items se mapean automáticamente con confianza alta (96%+), 2 quedan marcados como "AI Suggested" (la IA puede inferir la opción correcta), y 2 se escalan al Expert Hub (necesitan un especialista). Un resumen muestra la distribución: "4 items fully mapped, 1 AI-suggested, 2 need Expert Hub".

**d1.2 — Sugerencias de IA y resolución del Expert Hub**
Strata presenta los resultados en 3 secciones. Sección A (colapsada, verde): 3 items auto-mapeados sin intervención. Sección B (interactiva): 2 items donde la IA sugiere la opción más probable con su razonamiento — por ejemplo, "C-Clamp mount porque el proyecto usa superficies laminadas" (85% confianza). El diseñador puede aceptar, editar o escalar. Sección C (interactiva): 2 items resueltos por Marcus Chen (Product Specialist, Meridian) — por ejemplo, "Tamper-resistant outlets requeridos por código en instalaciones médicas". El diseñador acepta o modifica cada recomendación. Un contador muestra "X/4 Resolved".

**d1.3 — Validación de opciones y detección de cargos adicionales**
Strata valida los 7 items contra las reglas del catálogo del fabricante y detecta $1,470 en cargos adicionales: $1,110 por tapicería Grade 3 en las sillas Apex y $360 por cerradura Digilock en los SecureBin. Cada upcharge muestra un detalle y el diseñador lo reconoce o lo marca para revisión del SC. Una card verde confirma que los 7 items coinciden con los precios del catálogo web. Una nota azul indica que los items validados pasarán al Coordinador de Ventas para aplicar descuentos.

**d1.4 — Paquete de especificación y envío al SC**
Strata ensambla el paquete de especificación con trazabilidad completa. Cada item muestra su cadena de origen: los 3 auto-mapeados llevan badge "MFR CATALOG" (purple), los 2 de IA llevan "MFR CATALOG" + "AI SUGGESTED" (green), y los 2 del Expert Hub llevan "MFR CATALOG" + "EXPERT HUB" (blue). Las fuentes quedan archivadas: la URL del catálogo de Meridian y las resoluciones del Expert Hub. El diseñador genera el documento SPEC-MH-0412 y lo envía al Coordinador de Ventas seleccionándolo de una lista de contactos.

**d1.5 — Revisión del Coordinador y aplicación de descuento**
Randy Martinez (Coordinador de Ventas) recibe la especificación con indicadores visuales que muestran el origen de cada item — MFR CATALOG, AI SUGGESTED o EXPERT HUB. Los items resueltos por el Expert Hub (líneas 3 y 6) llevan un badge adicional "EXPERT CONFIRMED". Puede hacer clic en "View Source" para consultar el extracto del catálogo web. Aplica el descuento Dealer Standard de Meridian (38%) y el total se actualiza en tiempo real. Al terminar, genera el documento final de precios con trail de auditoría completo (Web Scrape → AI + Expert → Validation → Spec Package → SC Pricing).

---

## Flow 2: Inteligencia de almacén e inventario
*7 pasos — Experto en producto + Dealer*

**d2.1 — Salud del almacén y consignaciones**
Strata escanea los 3 almacenes de Dupler. Columbus está al 72% de capacidad con el proyecto Mercy Health Phase 2 por llegar. Un "Muro de la Vergüenza" muestra 3 muebles que llevan más de 180 días en piso de cliente sin haberse facturado — dinero estancado. También detecta 2 conflictos donde el mismo mueble fue prometido a dos proyectos distintos (necesitan 14 sillas Acuity pero solo hay 12 disponibles). La IA recomienda mover 85 items a Cincinnati para ahorrar $3,600 al mes en espacio.

**d2.2 — Recepción e inspección de condición**
Llegan 30 items de una orden de compra. Se escanean y 28 coinciden con lo esperado. Dos no: uno está faltante (queda en backorder) y otro llegó en el acabado equivocado (Fog en vez de Graphite). Cada excepción ofrece opciones de resolución. La inspección de condición clasifica: 26 en perfecto estado, 3 necesitan revisión cercana y 1 tiene daño visible.

**d2.3 — Verificación de precios y márgenes**
Strata compara los precios de 15 items (en 3 páginas) contra las listas actuales de Allsteel, Gunlock y National. Un panel muestra 4 indicadores clave: total de items, valor de la orden, valor actual y alertas de margen. 2 items tienen margen por debajo del 25% (un sillón al 23.8% y una mesa al 21.4%). Para cada uno, el experto puede actualizar el precio, aceptar el margen o escalar al Coordinador de Ventas.

**d2.4 — Sincronización entre almacenes**
El sistema sincroniza automáticamente los 3 almacenes y 2 sitios de instalación. Resuelve un conflicto de dock de carga (redirige un envío al Dock 3) y optimiza las rutas de entrega ahorrando $1,200. Al completarse, detecta 5 envíos activos que conectan con el siguiente paso.

**d2.5 — Seguimiento de envíos y auditoría de fletes**
5 envíos activos se rastrean en tiempo real. Strata predice que uno sufrirá un retraso de 2 días por clima (87% de certeza), mostrando que esto impacta 9 muebles del proyecto Mercy Health. El experto puede notificar al cliente, redirigir a staging alterno o solicitar envío acelerado. Una auditoría de flete detecta que el transportista cobró $1,540 cuando la cotización era de $1,200 — un sobrecobro de $340. Adicionalmente, de una orden de 30 items solo llegaron 28, con 2 en backorder.

**d2.6 — Reclamos y devoluciones a fabricantes**
3 reclamos activos con $2,770 en créditos pendientes: un acabado equivocado (¿devolver o aceptar crédito?), daño en empaque (¿inspeccionar o reemplazar?) y un tema de garantía (¿reparar o reemplazar?). 4 alertas adicionales de garantía que vencen próximamente. El experto selecciona la resolución para cada caso y deja notas profesionales antes de cerrar.

**d2.7 — Aprobación del Dealer para despacho**
Sarah Chen (Dealer Principal) recibe una notificación con métricas clave: items listos, valor total, envíos y reclamos abiertos. Abre el reporte completo donde ve las notas del experto, la checklist de staging (24 de 26 items listos), y elige entre aprobar el despacho, solicitar cambios o poner en espera. Aprueba para entrega el jueves a las 8AM.

---

## Flow 3: Visibilidad completa y reportes al cliente
*5 pasos — Sistema + Experto + Dealer*

**d3.1 — Conexión de todos los sistemas**
Strata conecta los 5 sistemas que Dupler usa a diario: software de diseño, especificaciones, portal de precios, almacén y transportistas. El resultado es un mapa visual de todas las conexiones, un desglose de inventario por categoría (asientos, escritorios, almacenamiento, mesas, accesorios), y 4 indicadores clave: $1.2M en inventario total, 89% de tasa de cumplimiento, 42 items en backorder y 68% de utilización. Puntaje de salud: 78 de 100.

**d3.2 — Conciliación de inventario**
Se compara el conteo físico contra lo que dice el sistema — coincidencia del 97.2% (1,837 de 1,840 verificados). Las 3 diferencias requieren revisión experta: las sillas Acuity muestran 48 en sistema pero 45 en piso (el experto ingresa la cantidad correcta y selecciona la razón), un banco aparece en una ubicación diferente a la registrada, y una mesa no se puede localizar (opciones: confirmar transferencia, buscar en otros almacenes, marcar como perdida o reportar como encontrada en sitio de instalación).

**d3.3 — Generación del reporte y alertas proactivas**
El sistema ensambla automáticamente un reporte de inteligencia y envía 3 notificaciones proactivas al equipo: un mensaje de Teams avisando que las sillas Acuity están por debajo del mínimo, un email informando que Mercy Health tiene el 68% de su inventario en staging, y un SMS urgente sobre un backorder con fecha estimada de llegada. El reporte queda listo para revisión.

**d3.4 — Revisión y distribución del reporte**
El dealer revisa el reporte completo con 4 secciones desplegables: disponibilidad de stock, capacidad de almacenes, análisis de backorders y 3 recomendaciones de la IA (con niveles de confianza e impacto estimado). Tres acciones disponibles: previsualizar como PDF (un documento de 4 páginas con portada, detalle de almacenes, recomendaciones de IA y estado del proyecto), descargar el PDF, o enviarlo directamente a miembros del equipo seleccionándolos de una lista.

**d3.5 — Vista previa del portal del cliente**
Así ve el cliente final su proyecto: Mercy Health Phase 2 al 68% de avance. Una línea de tiempo muestra 5 hitos: adquisición completada, staging completado, inspección en curso, entrega pendiente y recorrido final pendiente. Un panel con estadísticas (22 de 32 items en staging, proyecto en tiempo, fecha estimada de completación: abril 5). Este portal es solo lectura — el cliente puede consultar su avance sin necesidad de llamadas ni correos.

---

## Resumen

| Flow | Nombre | Pasos | Roles |
|------|--------|-------|-------|
| **1** | Del catálogo web a la especificación | 5 (d1.1–d1.5) | Diseñador, Coordinador de Ventas |
| **2** | Inteligencia de almacén | 7 (d2.1–d2.7) | Experto en producto, Dealer |
| **3** | Visibilidad y reportes | 5 (d3.1–d3.5) | Sistema, Experto, Dealer |
| | **Total** | **17 pasos** | **4 roles** |

## Datos clave del demo

| Dato | Valor |
|------|-------|
| Proyecto | Mercy Health Phase 2 |
| Flow 1 — Fabricante | Meridian Workspace (non-CET, 7 items) |
| Flow 1 — Valor | $28,854 |
| Flow 1 — Cargos adicionales | $1,470 (Grade 3 upholstery + Digilock) |
| Flow 1 — Descuento | Meridian 38% Dealer Standard |
| Flow 1 — Resolución | 3 auto + 2 AI suggested + 2 Expert Hub |
| Almacenes | Columbus 72%, Cincinnati 45%, Dayton 38% |
| Puntaje de salud | 78/100 |
| Precisión de inventario | 97.2% |
| Sobrecobro de flete | $340 |
| Reclamos a fabricantes | $2,770 (3 reclamos) |
| Diseñador | Alex Rivera |
| Coordinador de Ventas | Randy Martinez |
| Dealer Principal | Sarah Chen |
