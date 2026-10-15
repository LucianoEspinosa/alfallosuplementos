import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PiArrowLeft, PiCheck, PiShoppingBagOpen } from "react-icons/pi";
import ItemCount from "./ItemCount";
import CartWidget from "./CartWidget";
import ProductPhoto from "./af/ProductPhoto";
import { CartContext } from "./context/CartContext";
import { getAllProducts } from "../utils/productsCache";
import { normalizarTexto, precioFinalDe, precioTransferencia, formatoPrecio, badgeDe } from "../utils/productos";

const ItemDetail = ({ producto }) => {
    const { addItem, cartTotal } = useContext(CartContext);
    const navigate = useNavigate();
    const [item, setItem] = useState({});
    const [addedToCart, setAddedToCart] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saborSeleccionado, setSaborSeleccionado] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [cantidad, setCantidad] = useState(1);
    const [stockRestante, setStockRestante] = useState(0);
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        if (producto) {
            setItem(producto);
            setLoading(false);
            setCantidad(1);
            setStockRestante(producto.stock || 0);
            setAddedToCart(false);
            setShowFullDescription(false);

            if (producto.sabores && producto.sabores.length > 0) {
                setSaborSeleccionado(producto.sabores[0]);
            } else {
                setSaborSeleccionado(null);
            }
        }
    }, [producto]);

    // Mobile: la barra de compra es fija abajo y tapaba la confirmación "Producto agregado".
    // Al agregar, se baja lo justo para que el mensaje quede a la vista arriba de la barra.
    // En desktop (>= 768px) la barra no es fija, así que no hace nada.
    useEffect(() => {
        if (!addedToCart || !window.matchMedia("(max-width: 767px)").matches) return undefined;
        const frame = requestAnimationFrame(() => {
            const aviso = document.querySelector(".af-added");
            const barra = document.querySelector(".af-buybar");
            if (!aviso) return;
            const limite = window.innerHeight - (barra ? barra.offsetHeight : 0) - 16;
            const sobra = aviso.getBoundingClientRect().bottom - limite;
            if (sobra > 0) window.scrollBy({ top: sobra, behavior: "smooth" });
        });
        return () => cancelAnimationFrame(frame);
    }, [addedToCart]);

    useEffect(() => {
        if (addedToCart) {
            setAddedToCart(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saborSeleccionado]);

    // Catálogo (lectura compartida) para mostrar las otras presentaciones del mismo producto
    useEffect(() => {
        getAllProducts().then(setTodos).catch(() => {});
    }, []);

    const presentaciones = useMemo(() => {
        if (!item.nombre) return [];
        const mismo = (p) => normalizarTexto(p.marca) === normalizarTexto(item.marca) && normalizarTexto(p.nombre) === normalizarTexto(item.nombre);
        const lista = todos.filter((p) => mismo(p) && p.presentacion);
        if (!lista.some((p) => p.id === item.id) && item.presentacion) lista.push(item);
        return lista.sort((a, b) => (a.precio || 0) - (b.precio || 0));
    }, [todos, item]);

    const onAdd = (quantity) => {
        if (item.sabores && item.sabores.length > 0 && !saborSeleccionado) {
            alert("Por favor selecciona un sabor antes de agregar al carrito");
            return;
        }

        const itemParaCarrito = {
            ...item,
            saborSeleccionado: saborSeleccionado,
            nombreCompleto: saborSeleccionado
                ? `${item.nombre} - ${saborSeleccionado}`
                : item.nombre
        };

        addItem(itemParaCarrito, quantity);
        setAddedToCart(true);
    };

    // Misma regla de stock que tenía ItemCount: no se puede pedir más de lo que queda
    const sumarUnidad = () => {
        if (cantidad < stockRestante) setCantidad(cantidad + 1);
        setAddedToCart(false);
    };
    const restarUnidad = () => {
        if (cantidad > 1) setCantidad(cantidad - 1);
        setAddedToCart(false);
    };
    const agregarAlCarrito = () => {
        if (cantidad <= stockRestante) {
            setStockRestante(stockRestante - cantidad);
            setCantidad(1);
            onAdd(cantidad);
        }
    };

    const volver = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    };

    if (loading) {
        return (
            <div className="af-loading" role="status">
                <span className="af-spinner" />
                <span className="af-sr-only">Cargando producto...</span>
            </div>
        );
    }

    if (!item || !item.nombre) {
        return (
            <div className="af-notfound">
                <h1 className="af-notfound-title">Producto no encontrado</h1>
                <p className="af-notfound-text">El producto que buscas no existe o ha sido removido.</p>
                <Link to="/" className="af-btn af-btn-primary af-notfound-btn">Volver al inicio</Link>
            </div>
        );
    }

    const precioFinal = precioFinalDe(item);
    const precioConTransferencia = precioTransferencia(precioFinal);
    const badge = badgeDe(item);
    const sinStock = stockRestante < 1;
    const descripcion = item.descripcion || "";
    const descripcionCorta = descripcion.length > 140 && !showFullDescription
        ? `${descripcion.substring(0, 140).trim()}…`
        : descripcion;

    return (
        <div className="af-detail">
            <Helmet>
                <title>{item.nombre} | {item.marca} | Al Fallo</title>
                <meta name="description" content={item.descripcion} />
                <link rel="canonical" href={`https://alfallo.vercel.app/item/${item.id}`} />
                <meta property="og:type" content="product" />
                <meta property="og:title" content={`${item.nombre} | ${item.marca} | Al Fallo`} />
                <meta property="og:description" content={item.descripcion} />
                {item.img && <meta property="og:image" content={item.img} />}
                {item.nombre && (
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Product",
                            name: `${item.marca || ""} ${item.nombre}`.trim(),
                            image: item.img ? [item.img] : undefined,
                            description: item.descripcion || undefined,
                            brand: item.marca ? { "@type": "Brand", name: item.marca } : undefined,
                            category: item.categoria || undefined,
                            offers: {
                                "@type": "Offer",
                                url: `https://alfallo.vercel.app/item/${item.id}`,
                                priceCurrency: "ARS",
                                price: item.descuento
                                    ? Math.round(item.precio - (item.precio * item.descuento) / 100)
                                    : item.precio,
                                availability: item.stock > 0
                                    ? "https://schema.org/InStock"
                                    : "https://schema.org/OutOfStock",
                            },
                        })}
                    </script>
                )}
            </Helmet>

            {/* Encabezado propio en mobile: volver, "Inicio / categoría" y carrito */}
            <header className="af-pagehead">
                <button type="button" className="af-btn af-btn-secondary af-btn-icon" aria-label="Volver" onClick={volver}>
                    <PiArrowLeft size={20} />
                </button>
                <span className="af-crumbs">
                    <Link to="/">Inicio</Link> / {item.categoria
                        ? <Link to={`/category/${encodeURIComponent(item.categoria)}`}>{item.categoria}</Link>
                        : "Productos"}
                </span>
                <CartWidget />
            </header>

            <div className="af-detail-grid">
                <div className="af-detail-photo">
                    <div className="af-tile af-detail-tile">
                        <ProductPhoto img={item.img} marca={item.marca} nombre={item.nombre} pct={78} />
                        {badge && <span className={`af-badge af-badge-${badge.tipo} af-detail-badge`}>{badge.texto}</span>}
                    </div>
                </div>

                <section className="af-detail-info">
                    <span className="af-crumbs af-crumbs--desktop">
                        <Link to="/">Inicio</Link> / {item.categoria
                            ? <Link to={`/category/${encodeURIComponent(item.categoria)}`}>{item.categoria}</Link>
                            : "Productos"}
                    </span>

                    <div className="af-detail-head">
                        <span className="af-detail-brand">{item.marca}</span>
                        <h1 className="af-detail-name">{item.nombre}</h1>
                        {descripcion && (
                            <span className="af-detail-desc">
                                {descripcionCorta}
                                {descripcion.length > 140 && (
                                    <button type="button" className="af-detail-more" onClick={() => setShowFullDescription(!showFullDescription)}>
                                        {showFullDescription ? "Ver menos" : "Ver más"}
                                    </button>
                                )}
                            </span>
                        )}
                    </div>

                    <div className="af-detail-price">
                        <div className="af-detail-pricerow">
                            <span className="af-detail-pricevalue">{formatoPrecio(precioFinal)}</span>
                            {item.descuento > 0 && <span className="af-detail-old">{formatoPrecio(item.precio)}</span>}
                            <span className="af-detail-cash">en efectivo</span>
                        </div>
                        <span className="af-detail-transfer">{formatoPrecio(precioConTransferencia)} con transferencia (incluye 7,5% de recargo bancario)</span>
                    </div>

                    {presentaciones.length > 0 && (
                        <div className="af-detail-group">
                            <span className="af-detail-label">Presentación</span>
                            <div className="af-detail-sizes">
                                {presentaciones.map((p) =>
                                    p.id === item.id ? (
                                        <span key={p.id} className="af-optchip af-optchip--size is-on" aria-current="true">{p.presentacion}</span>
                                    ) : (
                                        <Link key={p.id} to={`/item/${p.id}`} className="af-optchip af-optchip--size">{p.presentacion}</Link>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {item.sabores && item.sabores.length > 0 && (
                        <div className="af-detail-group">
                            <span className="af-detail-label">Sabor: <span className="af-detail-labelvalue">{saborSeleccionado}</span></span>
                            <div className="af-detail-flavors">
                                {item.sabores.map((sabor, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`af-optchip af-optchip--flavor ${saborSeleccionado === sabor ? "is-on" : ""}`}
                                        onClick={() => setSaborSeleccionado(sabor)}
                                        aria-pressed={saborSeleccionado === sabor}
                                    >
                                        {sabor}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="af-detail-qtyrow">
                        <span className="af-detail-label">Cantidad</span>
                        <ItemCount value={cantidad} onDec={restarUnidad} onInc={sumarUnidad} />
                    </div>

                    {sinStock && !addedToCart && (
                        <span className="af-detail-nostock">Sin stock por el momento. Escribinos por WhatsApp y te avisamos cuando entre.</span>
                    )}

                    {/* Confirmación después de agregar */}
                    {addedToCart && (
                        <div className="af-added" role="status">
                            <span className="af-added-icon"><PiCheck size={16} /></span>
                            <span className="af-added-text">
                                <span className="af-added-title">¡Producto agregado al carrito!</span>
                                {saborSeleccionado && <span className="af-added-sub">Sabor: {saborSeleccionado}</span>}
                            </span>
                        </div>
                    )}

                    {/* Mobile: barra fija abajo. Desktop: debajo de la cantidad */}
                    {addedToCart ? (
                        <div className="af-buybar af-buybar--added">
                            <Link to="/" className="af-btn af-btn-secondary af-buybar-keep">Seguir comprando</Link>
                            <Link to="/cart" className="af-btn af-btn-primary af-buybar-btn">
                                <PiShoppingBagOpen size={18} />
                                Ver carrito ({cartTotal()})
                            </Link>
                        </div>
                    ) : (
                        <div className="af-buybar">
                            <div className="af-buybar-total">
                                <span className="af-buybar-label">{cantidad === 1 ? "Efectivo" : `${cantidad} u. · efectivo`}</span>
                                <span className="af-buybar-value">{formatoPrecio(precioFinal * cantidad)}</span>
                            </div>
                            <button
                                type="button"
                                className="af-btn af-btn-primary af-buybar-btn"
                                onClick={agregarAlCarrito}
                                disabled={sinStock}
                            >
                                <PiShoppingBagOpen size={18} />
                                Agregar al carrito
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Características */}
            {item.caracteristicas && item.caracteristicas.length > 0 && (
                <section className="af-detail-features">
                    <span className="af-detail-label">Características</span>
                    <ul>
                        {item.caracteristicas.map((caract, index) => (
                            <li key={index}>{caract}</li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="af-buybar-spacer" />
        </div>
    );
};

export default ItemDetail;
