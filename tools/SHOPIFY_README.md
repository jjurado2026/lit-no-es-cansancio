# LIT · Landing v2 — paquete para Shopify

Landing «No es cansancio, es deshidratación» lista para el tema de litsalt.com: **una sola sección** (`nw-lp2`) con toda la página, sus assets y una plantilla de página que ya trae los productos de LIT.

- Prototipo navegable: https://jjurado2026.github.io/lit-no-es-cansancio/
- Este paquete: https://jjurado2026.github.io/lit-no-es-cansancio/shopify/
- Zip con todo: https://jjurado2026.github.io/lit-no-es-cansancio/lit-landing-shopify.zip
- Lista de archivos con URL y sha256: [`manifest.json`](manifest.json)

## Archivos

| Archivo | Qué es |
|---|---|
| `sections/nw-lp2.liquid` | La landing completa (HTML + Liquid) con ajustes en el editor de temas |
| `snippets/nw-lp2-price.liquid` | Formatea céntimos como «28,35 €» (igual que el JS) |
| `templates/page.landing-lp2.json` | Plantilla de página con la sección y los 9 productos ya elegidos |
| `assets/nw-lp2.css` · `assets/nw-lp2.js` | Estilos y comportamiento de la landing |
| `assets/nw-lp2-gsap.min.js` · `assets/nw-lp2-scrolltrigger.min.js` | GSAP 3.15 (licencia gratuita, uso comercial permitido) |
| `assets/nw-lp2-*.woff2` | Clash Display y Barlow (400/500/600/700) |
| `assets/nw-lp2-*.webp` · `assets/nw-lp2-*.svg` | Sobres recortados, cajas, composiciones de producto, logos de prensa y botellas de la comparativa |

**Ya están en la tienda y no hay que subirlos** (vienen en `manifest.json`):
- Assets del tema actual: `nw-hero-peach-opt.mp4`, `nw-hero-peach-mobile.mp4`, `nw-comotomarlo-opt.mp4`, `nw-hero-peach-poster.webp`, `nw-hero-peach-poster-mobile.webp`, `nw-comotomarlo-poster.webp`. Si se sube a un tema que no los tenga, están en el prototipo (`assets/video/` y `assets/img/`).
- Fotos de Contenido → Archivos, pedidas al CDN de Shopify con el ancho justo (`?width=`).

## Instalación

0. **Trabajar en una copia del tema publicado** (Tienda online → Temas → Duplicar). Todo el paquete es nuevo y lleva el prefijo `nw-lp2`: no hay que modificar ni borrar ningún archivo existente.
1. **Subir los archivos** (cualquiera de estas vías):
   - **Shopify CLI**: descomprimir el zip dentro de la carpeta del tema y ejecutar
     `shopify theme push --theme <ID> --nodelete --only "sections/nw-lp2.liquid" --only "snippets/nw-lp2-price.liquid" --only "templates/page.landing-lp2.json" --only "assets/nw-lp2*"`
   - **Admin API (GraphQL)**: `themeFilesUpsert` con cada archivo de `manifest.json` → `upload`, usando `body: { type: URL, value: <url> }`. Los `.liquid`, `.json`, `.css` y `.js` también se pueden mandar como `type: TEXT`.
   - **A mano**: Editar código → añadir cada archivo en su carpeta.
2. **Layout de la plantilla**: copiar en `templates/page.landing-lp2.json` el valor `"layout"` de la plantilla que usa hoy la landing (`page.landing-b.json` o la que corresponda), para que salga con la misma cabecera mínima y sin header ni pie de tienda.
3. **Crear la página**: Contenido → Páginas → nueva (p. ej. handle `no-es-cansancio-es-deshidratacion-c`), plantilla `landing-lp2`, **oculta** hasta validar.
4. **Revisar** con la vista previa del tema duplicado (checklist de abajo).
5. **Publicar**: subir los mismos archivos al tema publicado (o publicar el duplicado) y hacer visible la página.

## Qué sale de la tienda y qué es fijo

**Sale de los productos** (si cambian en Shopify, la landing cambia sola):
- Variantes: suscripción de 1 caja (variante «30» de cada sabor), compra única de cada sabor y el pack de 4 cajas con sus 15 combinaciones de sabores (se leen del título de cada variante: «2 Salty Lemon + 1 Watermelon + 1 Peach»).
- Precios y todo lo que se calcula con ellos: €/sobre, «Ahorra 25 %», «Ahorras 66,15 €», «Desde 0,71 €/sobre».
- Galería: la composición nueva de caja + sobre y las fotos 2 a 7 de cada producto. La primera foto del producto se salta porque muestra el sobre anterior (1000 mg de sodio); si se cambia, quitar `offset: 1` en la sección.
- Discovery Set: precio, enlace y foto.

**Fijo en la sección**:
- Textos de la landing.
- Frecuencias de suscripción (IDs de selling plan de Seal) y valores por defecto: 45 días en 1 caja y 6 meses en el pack. IDs verificados el 6-oct-2026:
  15 días `691259801949` · 1 mes `691259834717` · 45 días `691259867485` · 2 meses `691259900253` · 3 meses `691259933021` · 4 meses `691259965789` · 5 meses `691259998557` · 6 meses `691260031325`.
  Si cambian en la app, actualizar los `<option>` de `sections/nw-lp2.liquid`.
- Valoración de Trustpilot: solo estrellas (4,5).

**Ajustes en el editor de temas**: barra promo (mostrar/ocultar y texto de ordenador y de móvil; la de Biotherm caduca el 15/10), los 9 productos y el enlace al Discovery Set.

## Checklist antes de publicar

- [ ] Sale sin cabecera ni pie de tienda y sin el logo amarillo fijo duplicado.
- [ ] Precios: suscripción 1 caja 28,35 € (tachado 37,80 €) · 3+1 gratis 85,05 € (tachado 151,20 €) · compra única 37,80 €.
- [ ] «Añadir al carrito» lleva al checkout con producto, cantidad y frecuencia correctos. Probar al menos: Lemon suscripción 1 caja · pack 3+1 con sabores mezclados · compra única Peach con cantidad 2.
- [ ] La muestra de Biotherm (app de regalo) se añade como con la caja actual.
- [ ] Analítica conectada al evento `lp2:add-to-cart` (abajo).
- [ ] Móvil (390 px): sin scroll horizontal; al llegar a la caja de compra se ve entera, hasta el botón, sin hacer scroll.
- [ ] Editor de temas: aparecen los 9 productos elegidos (si falta alguno, la sección muestra un aviso amarillo solo en el editor).

## Analítica

El formulario envía a `/cart/add` con `return_to=/checkout`, como la caja actual (va directa al pago). Justo antes, la sección lanza un evento con los datos de la compra:

```js
document.addEventListener('lp2:add-to-cart', (e) => {
  // e.detail = { variantId, sellingPlanId, quantity, value, currency: 'EUR', offer: 'sub1' | 'sub4' | 'ot1', flavor }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'add_to_cart',
    ecommerce: { currency: e.detail.currency, value: e.detail.value,
                 items: [{ item_id: String(e.detail.variantId), quantity: e.detail.quantity }] },
  });
});
```

Adaptarlo al nombre de evento que ya use el contenedor de GTM de la tienda.

## Convivencia con el tema

- Todo cuelga de `<div class="lp2" id="lp2">` con clases `lp2-*`, atributos `data-lp2-*` y variables CSS definidas en `.lp2`: no pisa estilos ni scripts del tema.
- El tema fuerza `h1`–`h6 { font-size: 1.5em !important }` en móvil; los titulares de la landing llevan su tamaño con `!important` para ganar.
- En esta página se oculta `.nw-lhead` (logo fijo de las landings): la landing lleva su propio logo en el hero.
- El botón «volver arriba» del tema queda por encima de la barra fija de compra.
- Con `?ss` en la URL se desactivan las animaciones (útil para capturas).

## Actualizar

El origen es el prototipo (`prototype/` del repo `jjurado2026/lit-no-es-cansancio`). Después de cambiarlo, `python tools/build_shopify.py` regenera este paquete y el zip.
