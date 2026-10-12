# Rediseño visual de Al Fallo Suplementos: implementación idéntica al diseño 3a

Repo: `LucianoEspinosa/alfallosuplementos`. Create React App + React 18 + React Router 6, Bootstrap 5.3 por CDN, estilos globales en `public/index.css`, Firebase (Firestore + Functions) y `react-icons`. Producción: alfallo.vercel.app, se despliega desde `main`.

El objetivo es que la tienda quede **visualmente idéntica** al diseño 3a, con **el mismo flujo de compra y la misma lógica que hoy**.

---

## 0. Reglas de seguridad (leelas antes de tocar nada)

1. Creá una rama nueva desde `main`: `git checkout main && git pull && git checkout -b rediseno-3a`. Trabajá **solo** en esa rama.
2. **No hagas merge ni push a `main`, y no cambies la configuración de Vercel.** Vercel arma una preview de cada rama; producción sigue saliendo de `main`.
3. **Firebase es el mismo para la preview y para producción.** No cambies colecciones, reglas, Cloud Functions ni datos existentes. El único cambio permitido es el campo opcional `masVendido` (sección 9), que producción ignora.
4. No crees órdenes de prueba sin avisar. Si probás el checkout, poné "PRUEBA" como nombre y avisame para borrarla. Tené en cuenta que un pedido de prueba también descuenta stock (lo hace la Cloud Function).
5. Un commit por fase (sección 11). Después de cada fase corré `npm run build`: tiene que compilar sin errores.
6. Al terminar, `git push -u origin rediseno-3a` y pasame el link de la preview. No abras un PR hacia `main` salvo que te lo pida.

---

## 1. Archivos de referencia

Te paso una carpeta `handoff/`. Copiala al repo como `docs/rediseno-3a/`, que queda fuera de `public/` y no se publica.

```
docs/rediseno-3a/
  PROMPT.md                     ← este documento
  referencia/rediseno-3a.html   ← el diseño completo e interactivo; abrilo en el navegador
  spec/AFMobileHome.html        ← home mobile: header, lupa flotante + panel de búsqueda, hero, confianza, filtros, grilla, footer, WhatsApp
  spec/AFDesktopHome.html       ← home desktop: header, hero con mosaico, confianza, barra lateral, grilla, footer, WhatsApp
  spec/AFCard.html              ← card de producto + estado "foto no disponible" + badges
  spec/AFMobileDetalle.html     ← detalle de producto mobile
  spec/AFMobileCompra.html      ← carrito, checkout y compra finalizada (mobile, tres estados en un archivo)
```

**Los archivos `spec/` son la fuente de verdad de cada medida.** Tienen todos los estilos escritos en línea con los valores exactos (px, colores, pesos, espacios). Para cada pantalla, abrí el spec correspondiente y trasladá esos valores 1:1. No los aproximes ni los "mejores".

Cómo leer los `spec/`:
- Ignorá el `<head>`, el `<helmet>` y el `<script>` del final, salvo para entender la lógica de ejemplo.
- `<sc-for list="{{ items }}" as="item">` equivale a `items.map(item => …)`. `<sc-if value="{{ x }}">` equivale a `{x && …}`. `{{ algo }}` es un dato.
- `<dc-import name="AFCard">` es la card de `spec/AFCard.html`.
- `style-hover="…"` son los estilos de `:hover`.
- **El primer `<div>` de cada spec es el marco del dispositivo y no se copia.** En mobile: `width:390px; height:844px; border-radius:32px; overflow:hidden; box-shadow`. En desktop: `width:1280px; height:820px; border-radius:14px`. Lo que va adentro es la página. Lo que en el spec tiene `position:absolute` respecto de ese marco (botones flotantes, barras fijas abajo, panel de búsqueda) en la web real va con `position: fixed`.
- Los productos, precios, el código ALFALLO10 y el número de orden de los specs son datos de ejemplo. Usá los datos reales de Firebase.
- Las clases `btn`, `btn-primary`, `tag`, `input` y las variables `var(--color-…)` del spec se traducen con las tablas de las secciones 3 y 4.

---

## 2. El flujo de compra NO cambia

El rediseño es **solo visual**. Esto tiene que seguir funcionando exactamente igual que hoy:

- Card de producto: toda la card es un link al detalle. El botón "Ver producto" es visual y lleva al mismo lugar.
- Detalle: elegir presentación, sabor y cantidad, y tocar "Agregar al carrito" (misma función de hoy).
- Carrito → "Finalizar compra" → `/checkout`.
- Checkout: mismos campos (nombre, email, WhatsApp), misma validación de Yup, misma lógica del código de descuento (incluida la de primera compra con la Cloud Function), mismo recargo, mismo `addDoc` a `orders` y mismo `clearCart()`.
- Al confirmar se muestra `WhatsAppConfirmation` con el mismo `generateWhatsAppMessage()`.
- `CartContext`, las rutas y los textos de los botones ("Agregar al carrito", "Finalizar compra", "Confirmar compra", "Confirmar pedido por WhatsApp") se mantienen.

Si algún detalle visual te obliga a tocar la lógica, frená y preguntame.

---

## 3. Tokens: equivalencias de las variables del spec

Creá `src/styles/af.css` e importalo en `src/index.js`, después de cualquier otro CSS. Va con estas variables. En la columna de la izquierda está lo que aparece en los specs y a la derecha el valor real:

```css
:root {
  /* === color === */
  --color-bg: #101214;            /* fondo de página */
  --color-surface: #1B1E22;       /* cards, paneles */
  --color-text: #F3F1EC;          /* texto principal */
  --color-divider: #2C3137;       /* bordes, divisores */
  --color-neutral-100: #F3F1EC;
  --color-neutral-200: #E6E4DE;
  --color-neutral-300: #D8D6D0;   /* texto secundario */
  --color-neutral-400: #9A9FA5;   /* texto tenue: marca, presentación, transferencia */
  --color-neutral-500: #6B7076;   /* texto muy tenue, tachados */
  --color-neutral-600: #555A60;
  --color-neutral-700: #3A3F45;
  --color-neutral-800: #2C3137;
  --color-neutral-900: #15181B;   /* fondo de inputs, badges oscuros */
  --color-accent: #4ADE80;        /* verde: bordes de botón, chips activos */
  --color-accent-100: #e6fbee;
  --color-accent-200: #c9f5d8;
  --color-accent-300: #a7f0c0;    /* texto verde sobre fondos verdes */
  --color-accent-400: #6EE59A;    /* precios */
  --color-accent-500: #4ADE80;
  --color-accent-600: #34b866;
  --color-accent-700: #2a7f4a;
  --color-accent-800: #1f4a30;
  --color-accent-900: #16241C;
  --tile-a: #F3F1EC;              /* recuadro de foto: centro */
  --tile-b: #D8D6D0;              /* recuadro de foto: borde */

  /* === tipografía === */
  --font-heading: 'Anton', sans-serif;   /* peso 400 siempre */
  --font-heading-weight: 400;
  --font-body: 'Oswald', sans-serif;     /* 400 / 500 / 600 */
  --h-tt: uppercase;      /* donde el spec dice text-transform:var(--h-tt) → uppercase */
  --h-track: 0.005em;     /* donde dice letter-spacing:var(--h-track,…) → 0.005em */
  --h-style: normal;      /* donde dice font-style:var(--h-style,…) → normal */

  /* === radios === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;

  /* === sombras === */
  --shadow-sm: 0 0 0 1px #2C3137;
  --shadow-md: 0 0 0 1px #2C3137, 0 6px 18px rgba(0,0,0,0.55);
}
```

Usá **los mismos nombres de variable que el spec**, así cada `style` se traslada tal cual, `var()` incluido. Donde el spec usa `color-mix(in srgb, var(--color-accent) 14%, transparent)`, dejalo así: los navegadores actuales lo soportan.

Colores fijos que aparecen en el spec y se usan tal cual: `#25D366` (WhatsApp), `#F87171` (borde de error), `#FCA5A5` (texto de error), `#15181B` (fondo de inputs), `#0a0b0c` (no se usa en la página; es el fondo del lienzo de referencia).

**Fuentes** (`public/index.html`): sacá Playfair Display SC y League Spartan y agregá:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600&display=swap" rel="stylesheet">
<meta name="theme-color" content="#101214">
```
Borrá de `public/index.css` todas las reglas de `font-family` con `!important` y las variables viejas (`--bg-primary`, `--accent-color #007bff`, etc.). Si alguna otra pantalla las usa, mapealas a las nuevas.

---

## 4. Clases base: copialas tal cual en `af.css`

Estas son las clases que los specs usan con `class="…"`, con sus valores resueltos. Bootstrap también tiene `.btn` e `.input`: para que no se mezclen, renombralas con prefijo (`af-btn`, `af-btn-primary`, `af-tag`, `af-input`) y usalas así en el JSX.

```css
body { margin:0; background:var(--color-bg); color:var(--color-text);
  font-family:var(--font-body); font-size:15px; line-height:1.55; font-weight:400; }
h1,h2,h3,h4,h5,h6 { font-family:var(--font-heading); font-weight:400; line-height:1.12;
  letter-spacing:-0.015em; margin:0; }
*, *::before, *::after { box-sizing:border-box; }
img { display:block; max-width:100%; }
a { color:var(--color-accent); text-underline-offset:3px; }
a:hover { color:var(--color-text); }
:focus { outline:none; }
:focus-visible { outline:2px solid var(--color-accent); outline-offset:2px; }
::selection { background:color-mix(in srgb, var(--color-accent) 30%, transparent); }

/* botones */
.af-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px;
  cursor:pointer; text-decoration:none; font-family:var(--font-heading); font-weight:400;
  font-size:14px; line-height:1.2; color:var(--color-text); background:transparent;
  border:1px solid transparent; padding:5.6px 10.08px; border-radius:8px; }
.af-btn svg { display:block; }
.af-btn:disabled { opacity:.45; cursor:not-allowed; }
.af-btn-primary { color:var(--color-accent); border-color:var(--color-accent); }
.af-btn-primary:hover { background:color-mix(in srgb, var(--color-accent) 12%, transparent); }
.af-btn-primary:active { background:color-mix(in srgb, var(--color-accent) 22%, transparent); }
.af-btn-secondary { border-color:var(--color-divider); }
.af-btn-secondary:hover { background:color-mix(in srgb, var(--color-text) 7%, transparent); }
.af-btn-secondary:active { background:color-mix(in srgb, var(--color-text) 14%, transparent); }
.af-btn-ghost { color:var(--color-accent); padding-inline:2.8px; }
.af-btn-ghost:hover { background:color-mix(in srgb, var(--color-accent) 10%, transparent); }
.af-btn-icon { width:36px; height:36px; padding:0; }

/* inputs */
.af-input { width:100%; min-height:36px; padding:6px 10px; font:inherit; font-size:14px;
  color:var(--color-text); caret-color:var(--color-accent); background:var(--color-surface);
  border:1px solid var(--color-divider); border-radius:8px; }
.af-input:hover { border-color:color-mix(in srgb, var(--color-text) 45%, transparent); }
.af-input:focus-visible { border-color:var(--color-accent); outline-offset:0; }

/* tags */
.af-tag { display:inline-flex; align-items:center; font-size:11px; letter-spacing:.02em;
  padding:3px 10px; border-radius:6px; }
.af-tag-neutral { background:#2C3137; color:#F3F1EC; }
.af-tag-outline { border:1px solid var(--color-accent); color:var(--color-accent); }

/* divisor que se desvanece en los bordes */
.af-hr { height:1px; border:0; background:linear-gradient(to right, transparent,
  var(--color-divider) 48px, var(--color-divider) calc(100% - 48px), transparent); }

/* scroll horizontal sin barra (chips mobile) */
.af-noscrollbar { scrollbar-width:none; }
.af-noscrollbar::-webkit-scrollbar { display:none; }
```

Importante sobre los botones: el texto va en **Anton, sin mayúsculas forzadas** ("Comprar por WhatsApp", no "COMPRAR POR WHATSAPP"). El botón principal es **verde con borde y fondo transparente**, no relleno. El tamaño de letra y el alto de cada botón están en el `style` del spec (por ejemplo `min-height:50px; font-size:16px` en el hero). Los que llevan glow tienen `box-shadow:0 0 28px color-mix(in srgb, var(--color-accent) 30%, transparent)` o el valor que indique el spec.

**Estrategia de estilos:** para cada componente, pasá los `style` del spec a clases en `af.css` (o en un `.module.css` por componente) con los mismos valores. Se permiten estilos en línea solo para valores dinámicos. No uses clases de Bootstrap (`container`, `row`, `col-*`, `btn-success`, `alert`, `badge`, `card`) en las pantallas rediseñadas. Bootstrap sigue cargado para las pantallas fuera de alcance.

---

## 5. Íconos

El diseño usa **Phosphor (estilo regular)** y el logo oficial de WhatsApp. Como el repo ya tiene `react-icons`, usá `react-icons/pi` y `react-icons/fa`. Estos son los íconos de los specs:

| Uso | Componente |
|---|---|
| Menú | `PiList` |
| Carrito (con contador) | `PiShoppingBagOpen` |
| Lupa | `PiMagnifyingGlass` |
| Volver | `PiArrowLeft` |
| Continuar / flecha en botón | `PiArrowRight` |
| Cerrar / quitar búsqueda | `PiX` |
| Eliminar del carrito | `PiTrash` |
| Tilde (código válido, compra registrada) | `PiCheck` |
| Productos originales | `PiShieldCheck` |
| Envíos a todo el país | `PiTruck` |
| Desplegable / ordenar | `PiCaretDown` |
| Instagram | `PiInstagramLogo` |
| Foto no disponible | `PiImage` |
| "Lo más buscado" | `PiTrendUp` |
| WhatsApp (todos los botones y el flotante) | `FaWhatsapp` (logo oficial) |

El tamaño de cada ícono es el `width` del `<svg>` en el spec. El color es `currentColor` del botón, salvo que el spec diga otra cosa. Al terminar, sacá las librerías de íconos que queden sin uso.

---

## 6. Layout y breakpoints

- **< 768px:** specs mobile, con padding lateral de 16px.
- **768–1023px:** header desktop, con Categorías y Marcas dentro del menú hamburguesa; chips en dos filas como en mobile (no barra lateral) y grilla de 3 columnas.
- **≥ 1024px:** specs desktop. El contenido va dentro de un contenedor `max-width:1280px; margin:0 auto; padding:0 40px` (el spec desktop está a 1280px con 40px de padding). Más allá de 1280px, los fondos (hero, footer) ocupan todo el ancho y el contenido queda centrado.
- El header mobile (62px) y el desktop van `position:sticky; top:0`, con el fondo y el blur del spec.

---

## 7. Pantalla por pantalla

Para cada una: **abrí el spec, replicá estructura, orden, textos y estilos exactos.** Abajo están las decisiones que no se ven a simple vista y los cambios a la lógica actual.

### 7.1 Header (`NavBar.jsx`): specs `AFMobileHome` y `AFDesktopHome`
- **Mobile:** una sola fila. Logo `src/components/img/alfallonegro.png` de **38px de alto** a la izquierda (sin texto al lado). A la derecha, el carrito (`af-btn af-btn-secondary af-btn-icon`, con el contador verde arriba a la derecha) y después el menú. Gap de 8px. Padding `12px 16px`. Fondo `color-mix(in srgb, var(--color-bg) 90%, transparent)` con `backdrop-filter:blur(12px)` y la línea inferior del spec. **Sin buscador en el header.**
- **Desktop:** logo de **40px** de alto, buscador (`max-width:440px`, `af-input` con lupa adentro), menú (Categorías ▾, Marcas ▾, Plan de nutrición) con `white-space:nowrap` y gap 22px, y el carrito al final. Padding `14px 40px`.
- **Bug a resolver:** hoy el menú vive en un `col-md-3` y se parte en dos líneas. Sacalo de esa columna. Eliminá también el borde del desplegable que aparece como recuadro vacío.

### 7.2 Lupa flotante y panel de búsqueda (`FloatingSearchIcon.js` + `Search.jsx`): spec `AFMobileHome`
- **Se mantiene dónde y cómo funciona hoy:** solo en mobile, `position:fixed`, arriba a la izquierda, se oculta con el menú abierto, bloquea el scroll del body y abre la búsqueda a pantalla completa.
- Botón: `left:16px; top:76px`, 46×46px, círculo con fondo `#1B1E22`, borde 1px `var(--color-accent)`, `PiMagnifyingGlass` de 19px en `var(--color-accent-400)` y sombra `0 0 0 5px color-mix(in srgb, var(--color-accent) 10%, transparent), 0 6px 18px rgba(0,0,0,0.5)`. Hover: fondo `#22262B`.
- Para que no tape contenido al cargar, la etiqueta "Suplementos 100% originales" del hero mobile lleva `margin-left:58px`.
- Panel a pantalla completa con fondo `var(--color-bg)` y padding `12px 16px 24px`:
  - Encabezado: botón de cerrar (`PiX`) y "Buscar productos" en Anton mayúscula 22px.
  - Input de 48px: lupa verde, borde `var(--color-accent)`, `box-shadow:0 0 0 4px color-mix(…12%…)`, 16px y foco automático.
  - Sin texto: "Lo más buscado" (Creatina, Whey, Pre-entreno, Aminoácidos, Magnesio) y "Marcas" (grilla de 3 columnas).
  - Con texto: hasta 6 resultados en vivo (cada uno abre el detalle) y el botón "Ver N productos", que cierra el panel y filtra la grilla. Sin resultados: "Sin resultados para "…"." y "Escribinos por WhatsApp y te lo conseguimos."
- Con una búsqueda activa, en lugar de "N productos" aparece arriba de la grilla el chip verde `"texto" · N productos ×`, que borra la búsqueda.
- En `Search.jsx`, sacá el emoji del placeholder ("Buscar proteína, creatina, marca…") y reemplazá `via.placeholder.com` por el estado de foto no disponible.

### 7.3 Hero, confianza, filtros y grilla (`ItemListContainer.jsx` + nuevo `TrustStrip.jsx`)
- Hero mobile y desktop, textos exactos:
  - Etiqueta: "Suplementos 100% originales".
  - H1: "Entrená al fallo." y, en la segunda línea en `var(--color-accent-400)`, "Del resto nos ocupamos nosotros."
  - Texto: "ENA, Gentech, Gold Nutrition, Star, Xtrenght y Pitbull. Consultá stock y precio por WhatsApp y te respondemos al toque."
  - Botones: "Comprar por WhatsApp" (principal, con glow; abre WhatsApp con el número de `config.js`) y "Ver productos" (secundario; baja hasta la grilla).
- El H1 lleva `text-transform:uppercase` (por `--h-tt`): 44px en mobile y 68px en desktop, con `line-height:0.98` en mobile y `0.96` en desktop. Revisá los valores exactos en el spec.
- En el mosaico de fotos del hero desktop, usá 2 productos reales marcados como "Más vendido" (o los primeros 2 con foto).
- Franja de confianza: "Productos originales", "Envíos a todo el país" y "Atención por WhatsApp". En desktop lleva los subtítulos del spec.
- Filtros: categorías y marcas como chips, siempre visibles. En mobile van en dos filas con scroll horizontal; en desktop, en una barra lateral de 220px fija al hacer scroll, con contadores. La primera opción es "Todas". Reemplazan a `CategoryCards` y al botón "Mostrar filtros".
- **Bug a resolver:** el filtro de precio arranca en `[0, 100000]` y oculta los productos de más de $100.000. Por defecto no tiene que filtrar por precio.
- `FilterBar.jsx`: queda solo "Ordenar: más vendidos ▾" (ghost). Si los rangos de precio no se usan, sacalos.
- Grilla: 2 columnas con gap 10px en mobile; 4 columnas con gap 14px en desktop.

### 7.4 Card (`Item.jsx`): spec `AFCard`
- Replicá el spec completo: contenedor, recuadro de foto 1:1 con el degradé crema e imagen al 84% con `mix-blend-mode:multiply`, marca, nombre, presentación, precio, transferencia y botón "Ver producto".
- Datos: marca = `marca`, nombre = `nombre`, presentación = `presentacion`, precio = el precio final que usa hoy la card (con descuento si lo tiene), transferencia = `Math.round(precio * (1 + TRANSFER_SURCHARGE))`, precio tachado = precio sin descuento (solo si `descuento > 0`).
- **Foto no disponible:** si `img` está vacío o dispara `onError`, mostrá el bloque del spec (inicial de la marca en un círculo, marca, nombre y "Foto no disponible") en el mismo recuadro.
- Un solo color de precio (`var(--color-accent-400)`). Nada de verde, azul y rojo a la vez.

### 7.5 Detalle (`ItemDetail.jsx` + `ItemCount.jsx`): spec `AFMobileDetalle`
- Mobile, en este orden:
  - Header con volver, "Inicio / {categoría}" y carrito.
  - Foto en el recuadro crema (78%) con badge.
  - Marca, nombre (H1 Anton 32px en mayúscula) y descripción corta.
  - Bloque de precio.
  - "Presentación" (chips en 2 columnas) y "Sabor: {elegido}" (chips píldora).
  - "Cantidad" con el selector − / + a la derecha.
- Barra fija abajo: a la izquierda "Efectivo" (o "N u. · efectivo") con el subtotal precio × cantidad en verde; a la derecha "Agregar al carrito" (principal, con glow y `PiShoppingBagOpen`). Llama a la misma función que hoy. Después de agregar, el botón dice "Agregado al carrito ✓" hasta que se cambie la presentación, el sabor o la cantidad.
- Desktop (no hay spec): dos columnas, con la foto a la izquierda (50%, fija al hacer scroll) y la info a la derecha con los mismos componentes. "Agregar al carrito" va debajo de la cantidad, no en una barra fija.
- Sacá el aviso azul del 7,5%, los emojis, "Envío gratis", "Garantía" y `via.placeholder.com`.

### 7.6 Carrito (`Cart.jsx`): spec `AFMobileCompra` con `screen="carrito"`
- Replicá el spec:
  - Indicador de 3 pasos en el header (barras de 22×4px).
  - Título "Tu carrito" y "N productos".
  - Cards de ítem: miniatura de 72px, marca, nombre, tacho, etiquetas de presentación y sabor, "N × $precio" y subtotal.
  - Botones "Seguir comprando" (secundario) y "Vaciar carrito" (ghost gris).
  - Panel con "Total en efectivo", "Con transferencia (+7,5%)" y "Elegís el medio de pago en el próximo paso."
  - Barra fija abajo con el total y "Finalizar compra".
- Una sola lista para todos los tamaños: sacá la tabla de desktop. En desktop, la lista va a la izquierda (2/3) y el panel de total a la derecha (1/3, fijo al hacer scroll), con "Finalizar compra" dentro del panel.
- Carrito vacío: replicá el estado `noItems` del spec, con el ícono en un círculo, "Tu carrito está vacío", "No hay productos en el carrito." y "Volver al inicio". El botón "Ver ejemplo con productos" del spec es solo para la demo: no va.
- La lógica sigue igual: `removeItem`, `clear` y `precioTotal`.

### 7.7 Checkout (`Checkout.jsx` + `PaymentMethodSelector.jsx`): spec `AFMobileCompra` con `screen="checkout"`
- **Solo estilo.** Mantené Formik/Yup, `aplicarDescuento`, `revalidarDescuentoPorEmail`, `handlePaymentMethodChange` y `handleSubmit` tal cual.
- Mobile, en este orden:
  - Título "Finalizar compra".
  - Resumen compacto del pedido (miniaturas de 40px y precio según el método elegido).
  - "1 · Tus datos": "Nombre completo *", "Email *" y "WhatsApp *", con la ayuda "Te contactamos por este número.".
  - "¿Tenés un código de descuento?" con "Aplicar" / "Quitar".
  - "2 · Cómo pagás": Efectivo / Transferencia bancaria.
  - "Resumen" y la nota de WhatsApp.
  - "Al completar aceptás nuestros términos y condiciones."
  - Barra fija con el total ("Total efectivo" o "Total transferencia") y "Confirmar compra".
- Inputs (estilos del spec, aplicados a los `<Field>` de Formik): 48px de alto, padding `0 14px`, fondo `#15181B`, borde 1px `var(--color-divider)`, radio 8px y Oswald 16px. Foco: borde `var(--color-accent)`. Con error de Formik: borde `#F87171` y mensaje en `#FCA5A5` 12.5px (usá los mensajes actuales de Yup).
- Mensajes del código: válido, en `var(--color-accent-300)` con `PiCheck` y el texto actual (por ejemplo "10% de descuento aplicado"); inválido, en `#FCA5A5`. El aviso de primera compra va como texto en `var(--color-neutral-400)`, sin el alert azul. Mientras se valida, el botón "Aplicar" muestra el estado de carga. "Para probar, usá ALFALLO10" es solo de la demo: no va.
- `PaymentMethodSelector`: dos botones grandes como en el spec (radio propio de 20px, nombre, descripción y total del método). Textos: "Efectivo / Pago en efectivo al recibir el producto" y "Transferencia bancaria / 7,5% de recargo por costos bancarios". Sin emojis y sin la línea "⚡ El recargo…".
- Resumen: Subtotal; "Recargo por transferencia (7,5%)" en gris, solo con transferencia; "Descuento (CÓDIGO)" en `var(--color-accent-300)`, solo si se aplicó; el badge "Primera compra" como `af-tag af-tag-outline`; divisor `af-hr`; Total; "Incluye 7,5% de recargo." o "Sin recargos adicionales."
- El bloque "📱 Confirmación por WhatsApp" se reemplaza por la nota con borde del spec.
- Estados del botón: "Procesando…" con spinner mientras se envía y deshabilitado si el carrito está vacío. "Recordá completar todos los campos obligatorios" se mantiene, sin emoji, en `#FCA5A5`.
- Desktop (no hay spec): dos columnas como hoy. A la izquierda, el resumen del pedido (fijo al hacer scroll); a la derecha, el formulario con los mismos componentes. "Confirmar compra" va al final del formulario, no en una barra fija.

### 7.8 Compra finalizada (`WhatsAppConfirmation.jsx`): spec `AFMobileCompra` con `screen="confirmacion"`
- **Solo estilo.** `generateWhatsAppMessage()` y la URL de WhatsApp no se tocan; solo el número pasa a salir de `config.js`.
- En este orden:
  - Panel con brillo verde: círculo con tilde, "¡Compra registrada!", "Falta un paso: mandanos el pedido por WhatsApp para confirmarlo." y "N° de orden" con `order.id`.
  - Botón "Confirmar pedido por WhatsApp" (principal, 56px, 17px, glow, `FaWhatsapp` de 24px). Es el `<a href={whatsappUrl} target="_blank">` de hoy.
  - "Resumen de tu compra": ítems, subtotal, recargo, descuento, total y "Método de pago: …".
  - "¿Qué pasa ahora?" con los 3 pasos actuales, numerados en Anton verde.
  - "¿No se abre WhatsApp?" / "Escribinos al 11 6793-6064 y mencioná tu número de orden."
  - "Volver" (ghost), que llama a `onBack`.
- Sacá todos los fondos de colores (alerts verde, amarillo, celeste y gris) y la imagen de Wikimedia.
- `ThankYou.jsx`: aplicale el mismo estilo (panel de arriba y "Volver al inicio"), sin cambiar su comportamiento.

### 7.9 Footer (`Footer.jsx`): specs `AFMobileHome` y `AFDesktopHome`
- Logo de 64px con `align-self:flex-start` (si no, se estira).
- Desktop en 4 columnas: logo y texto, "Tienda" (Categorías, Marcas, Plan de nutrición), "Contacto" (WhatsApp e Instagram) y "Medios de pago".
- Medios de pago: **solo Efectivo y Transferencia**, como `af-tag af-tag-neutral`.
- Fondo `linear-gradient(var(--color-surface), var(--color-bg))`. En mobile, padding inferior de 96px para que el botón de WhatsApp no tape nada.
- **Bug a resolver:** sacá el link "Acerca de nosotros" (`/acerca-de` no existe).

### 7.10 Botón flotante de WhatsApp (`WhatsAppIcon.jsx`)
- Mobile: `right:16px; bottom:18px`, 58×58px, círculo `#25D366`, `FaWhatsapp` blanco de 30px, sombra `0 8px 24px rgba(37,211,102,0.35), 0 10px 28px rgba(0,0,0,0.45)`.
- Desktop: círculo de 60px a `right:28px; bottom:28px`, con la burbuja "¿Te asesoramos?" a la izquierda (gap 12px; fondo `var(--color-surface)`, `var(--shadow-md)`, radio 12px, padding `10px 14px`, Oswald 500 14px).
- No se muestra en el detalle mobile ni en el carrito y el checkout mobile, porque ahí está la barra fija de abajo.
- Número: `WHATSAPP_NUMBER` de `config.js`. **Bug actual:** usa `541167936064`, sin el 9.

---

## 8. Configuración y otros bugs

1. **`src/config.js` (nuevo):** `export const WHATSAPP_NUMBER = '5491167936064'; export const TRANSFER_SURCHARGE = 0.075;`. Reemplazá el número en todos los archivos y los `1.075` sueltos por `1 + TRANSFER_SURCHARGE`. Los resultados de los cálculos tienen que dar exactamente igual que antes.
2. **`App.js`:** sacá la espera fija de 2,5 s (`setTimeout`) de `LoadingScreen`. Mostrala solo mientras haya algo cargando de verdad.
3. **`/masvendidos`:** hoy muestra los productos con `stock < 15`. Ver sección 9.

---

## 9. Badges

- Arriba a la izquierda del recuadro de foto, con los estilos del spec `AFCard`. Se muestra uno solo, con esta prioridad: Oferta > Más vendido > Nuevo.
- **Oferta** (`descuento > 0`): fondo `var(--color-accent)`, texto `#15181B` y "Oferta -X%".
- **Más vendido** (`masVendido === true`): fondo `#15181B`, texto `var(--color-accent-300)`. Agregá un interruptor en `EditProduct.jsx` que guarde ese campo opcional. `/masvendidos` pasa a filtrar por `masVendido`; si ningún producto lo tiene, usa `stock < 15` como hasta ahora.
- **Nuevo** (alta hace menos de 30 días): borde 1px `#2C3137` y texto `#15181B`. Fijate si existe un campo de fecha de alta. Si no existe, agregá `fechaCreacion: Timestamp.now()` solo en `AddProduct.jsx` para los productos nuevos.

---

## 10. Fuera de alcance

El panel de administración (salvo el interruptor de `masVendido`), la Fitness App, el plan de nutrición y la calculadora no se rediseñan. Como toman los colores nuevos, revisalos al final y arreglá solo lo que quede ilegible.

---

## 11. Orden de trabajo (un commit por fase)

1. **Base:** `config.js`, `af.css` (tokens y clases), fuentes, íconos, bugs de precio, foto rota y espera falsa.
2. **Marco:** header, lupa flotante con panel de búsqueda, botón de WhatsApp y footer.
3. **Home:** hero, franja de confianza, filtros, grilla y card.
4. **Detalle.**
5. **Compra:** carrito, checkout y compra finalizada (solo estilo).
6. **Badges:** campo y admin.
7. **Limpieza:** CSS viejo sin uso, librerías de íconos sin uso y `reactstrap` si no se usa. Correr `npm run build`.

---

## 12. Verificación: tiene que quedar idéntico

Para cada pantalla, abrí `docs/rediseno-3a/referencia/rediseno-3a.html` al lado de la preview (DevTools a 390px para mobile y a 1280px para desktop) y compará:

- [ ] Header, hero, card, detalle, carrito, checkout y confirmación coinciden en orden, textos, tamaños de letra, pesos, colores, espacios, radios y bordes. Revisá los valores con el inspector contra el spec.
- [ ] Los botones son verdes con borde (no rellenos) y el texto va en Anton sin mayúsculas forzadas. El botón flotante de WhatsApp es el círculo verde tradicional.
- [ ] La lupa flotante está arriba a la izquierda, no tapa la etiqueta del hero y abre la búsqueda a pantalla completa.
- [ ] Logo: 38px en el header mobile, 40px en el desktop y 64px en el footer, sin deformarse.
- [ ] Hice una compra completa en la preview, de la card al WhatsApp (con nombre "PRUEBA"), y el mensaje sale igual que en producción.
- [ ] Probé el código de descuento válido, el inválido y el de primera compra, y los dos medios de pago. Los totales dan igual que en producción.
- [ ] El botón de WhatsApp abre con `549…`.
- [ ] Aparecen productos de más de $100.000.
- [ ] Las fotos rotas muestran el estado prolijo.
- [ ] A 375, 768, 1024 y 1440px el menú no se parte y no hay recuadros vacíos.
- [ ] No quedan Playfair Display SC ni League Spartan, ni emojis en las pantallas rediseñadas.
- [ ] Medios de pago: solo Efectivo y Transferencia.
- [ ] `npm run build` pasa sin errores ni warnings nuevos, y `main` no se tocó.

Cuando termines, mandame el link de la preview y una lista de cualquier diferencia con el diseño que no hayas podido resolver.
