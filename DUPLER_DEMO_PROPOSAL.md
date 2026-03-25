# Dupler — Resumen del Demo

> **Cliente:** Dupler Office & Installation
> **Proyecto:** Mercy Health Phase 2 — 32 muebles (24 de Allsteel/Gunlock + 8 de National Furniture)
> **Sistemas que usa Dupler hoy:** Software de diseño (CET), especificaciones (SPEC), portal de precios de fabricantes (Compass), sistema de pedidos (RPC Core) y CRM (HubSpot)
> **Fabricantes:** Allsteel, Gunlock, National Furniture

---

## La historia que cuenta el demo

> *"Los diseñadores de Dupler pierden horas copiando datos de cotizaciones de fabricantes línea por línea hacia su sistema de especificaciones — un proceso lento, sin registro de dónde salió cada dato, y donde cualquier error pasa desapercibido. Su almacén opera como una caja negra entre 5 sistemas que no se hablan entre sí. Strata unifica todo: lee las cotizaciones con inteligencia artificial, valida precios automáticamente, compara contra los planos del proyecto, y genera reportes que llegan al equipo antes de que los pidan — incluyendo un portal donde el cliente puede ver el avance en tiempo real."*

---

## Flow 1: De la cotización del fabricante al pedido final
*5 pasos — Diseñador + Coordinador de Ventas*

**d1.1 — Carga de la cotización y lectura con IA**
El diseñador sube la cotización de National Furniture (puede ser un PDF o un enlace web) a Strata. La inteligencia artificial lee el documento completo, identifica los 8 muebles cotizados, y extrae los datos clave de cada uno: nombre del producto, cantidad, acabado, opciones y precio. Cada dato recibe un puntaje de confianza que indica qué tan segura está la IA de haberlo leído correctamente — 6 items salen con confianza alta (97%+) y 2 quedan marcados para revisión (72% y 81%).

**d1.2 — Organización y revisión de datos**
Strata organiza los 8 items en el formato de especificación del proyecto. 5 se acomodan automáticamente con confianza alta. Los 3 restantes necesitan la revisión del diseñador — cada uno muestra una vista dividida: a la izquierda el documento original, a la derecha lo que la IA interpretó. El diseñador puede aceptar el valor de la IA o corregirlo manualmente. Un contador muestra el progreso ("X de 3 revisados") y el botón para continuar se activa al completar todas las revisiones.

**d1.3 — Validación de opciones, cargos adicionales y precios**
Strata valida las opciones de producto y detecta $1,380 en cargos adicionales: $1,020 por un acabado especial (Graphite) y $360 por una tela de mayor grado. Para los muebles de Allsteel y Gunlock, los precios se verifican directamente contra el portal del fabricante — se encuentran 2 actualizaciones de precio (+3% y +2.3%). Para los 8 muebles de National, los precios se comprueban contra la cotización original (todos coinciden). Una nota al final indica que los items validados pasarán al Coordinador de Ventas para aplicar descuentos.

**d1.4 — Comparación contra planos y generación del paquete**
Strata cruza las cantidades de la especificación contra los planos arquitectónicos del proyecto: 31 de 32 coinciden, pero hay una diferencia — el escritorio Waveworks aparece 8 veces en la especificación pero 10 veces en el plano. El diseñador resuelve la diferencia, verifica que los documentos originales quedaron archivados (la cotización PDF y el archivo del software de diseño), y genera el paquete de especificación completo. Al final, lo envía al Coordinador de Ventas seleccionándolo de una lista de contactos.

**d1.5 — Revisión del Coordinador y aplicación de descuentos**
Randy Martinez (Coordinador de Ventas) recibe el paquete con indicadores visuales que muestran de dónde vino cada mueble — los que salieron del software de diseño en un color, los extraídos de la cotización del fabricante en otro. Puede hacer clic en "Ver fuente" para consultar el extracto original del documento. Aplica 3 niveles de descuento asistidos por la IA (Allsteel 42%, Gunlock 38%, National 35%) y los totales se actualizan en tiempo real. Al terminar, genera el documento final de precios y lo exporta al sistema de pedidos.

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
| **1** | De la cotización al pedido | 5 (d1.1–d1.5) | Diseñador, Coordinador de Ventas |
| **2** | Inteligencia de almacén | 7 (d2.1–d2.7) | Experto en producto, Dealer |
| **3** | Visibilidad y reportes | 5 (d3.1–d3.5) | Sistema, Experto, Dealer |
| | **Total** | **17 pasos** | **4 roles** |

## Datos clave del demo

| Dato | Valor |
|------|-------|
| Proyecto | Mercy Health Phase 2 |
| Total de muebles | 32 (24 Allsteel/Gunlock + 8 National) |
| Valor total del proyecto | $95,580 |
| Cargos adicionales detectados | $1,380 |
| Descuentos aplicados | Allsteel 42%, Gunlock 38%, National 35% |
| Almacenes | Columbus 72%, Cincinnati 45%, Dayton 38% |
| Puntaje de salud | 78/100 |
| Precisión de inventario | 97.2% |
| Sobrecobro de flete | $340 |
| Reclamos a fabricantes | $2,770 (3 reclamos) |
| Diseñador | Alex Rivera |
| Coordinador de Ventas | Randy Martinez |
| Dealer Principal | Sarah Chen |
