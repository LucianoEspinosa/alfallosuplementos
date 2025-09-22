


// import { useContext, useEffect, useState } from "react";
// import ItemCount from "./ItemCount";
// import { CartContext } from "./context/CartContext";
// import { Link } from "react-router-dom";

// const ItemDetail = ({ producto }) => {
//     const { addItem, cartTotal } = useContext(CartContext);
//     const [item, setItem] = useState({});
//     const [addedToCart, setAddedToCart] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [saborSeleccionado, setSaborSeleccionado] = useState(null);
//     const [showFullDescription, setShowFullDescription] = useState(false);

//     useEffect(() => {
//         if (producto) {
//             setItem(producto);
//             setLoading(false);
            
//             // Si el producto tiene sabores, seleccionar el primero por defecto
//             if (producto.sabores && producto.sabores.length > 0) {
//                 setSaborSeleccionado(producto.sabores[0]);
//             }
//         }
//     }, [producto]);

//     // Nuevo useEffect para resetear addedToCart cuando cambia el sabor
//     useEffect(() => {
//         if (addedToCart) {
//             setAddedToCart(false);
//         }
//     }, [saborSeleccionado]);

//     const onAdd = (quantity) => {
//         // Para productos con sabores, requerir selección
//         if (item.sabores && item.sabores.length > 0 && !saborSeleccionado) {
//             alert("Por favor selecciona un sabor antes de agregar al carrito");
//             return;
//         }

//         // Crear item para el carrito (incluye sabor si existe)
//         const itemParaCarrito = {
//             ...item,
//             saborSeleccionado: saborSeleccionado,
//             nombreCompleto: saborSeleccionado 
//                 ? `${item.nombre} - ${saborSeleccionado}`
//                 : item.nombre
//         };

//         addItem(itemParaCarrito, quantity);
//         setAddedToCart(true);
//     };

//     if (loading) {
//         return (
//             <div className="container text-center py-5">
//                 <div className="spinner-border text-primary" role="status">
//                     <span className="visually-hidden">Cargando...</span>
//                 </div>
//                 <p className="mt-3">Cargando producto...</p>
//             </div>
//         );
//     }

//     if (!item || Object.keys(item).length === 0) {
//         return (
//             <div className="container text-center py-5">
//                 <h2>Producto no encontrado</h2>
//                 <p>El producto que buscas no existe o ha sido removido.</p>
//                 <Link to="/" className="btn btn-primary">
//                     Volver al inicio
//                 </Link>
//             </div>
//         );
//     }

//     // Calcular precios
//     const precioFinal = item.descuento > 0 
//         ? Math.round(item.precio - (item.precio * item.descuento) / 100)
//         : item.precio;

//     const precioConTransferencia = Math.round(precioFinal * 1.075);
//     const recargoTransferencia = precioConTransferencia - precioFinal;

//     return (
//         <div className="container py-5">
//             {/* Breadcrumb */}
//             <nav aria-label="breadcrumb" className="mb-4">
//                 <ol className="breadcrumb">
//                     <li className="breadcrumb-item">
//                         <Link to="/" className="text-decoration-none text-secondary">
//                             Inicio
//                         </Link>
//                     </li>
//                     <li className="breadcrumb-item">
//                         <Link to={`/category/${item.categoria}`} className="text-decoration-none text-secondary">
//                             {item.categoria}
//                         </Link>
//                     </li>
//                     <li className="breadcrumb-item active text-primary">{item.nombre}</li>
//                 </ol>
//             </nav>

//             <div className="row">
//                 {/* Columna de imagen */}
//                 <div className="col-md-6 mb-4">
//                     <div className="card border-0" style={{ background: 'var(--bg-card)' }}>
//                         <div className="card-body p-4 text-center">
//                             <img 
//                                 src={item.img} 
//                                 alt={item.nombre} 
//                                 className="img-fluid rounded"
//                                 style={{ 
//                                     maxHeight: '400px', 
//                                     width: 'auto',
//                                     objectFit: 'contain'
//                                 }} 
//                                 onError={(e) => {
//                                     e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
//                                 }}
//                             />
//                         </div>
//                     </div>
//                 </div>

//                 {/* Columna de información */}
//                 <div className="col-md-6">
//                     <div className="card border-0 h-100" style={{ background: 'var(--bg-card)' }}>
//                         <div className="card-body p-4 d-flex flex-column">
//                             {/* Marca y nombre */}
//                             <div className="mb-3">
//                                 <span className="badge bg-secondary mb-2">{item.marca}</span>
//                                 <h1 className="h2 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
//                                     {item.nombre}
//                                     {saborSeleccionado && (
//                                         <span className="h4 text-muted"> - {saborSeleccionado}</span>
//                                     )}
//                                 </h1>
//                                 <span className="badge bg-dark">{item.presentacion}</span>
//                                 {item.sabores && item.sabores.length > 0 && (
//                                     <span className="badge bg-info ms-2">Múltiples sabores</span>
//                                 )}
//                             </div>

//                             {/* Descripción - CON ACORDEÓN PARA MÓVIL */}
//                             <div className="mb-4">
//                                 {/* Vista desktop - descripción completa */}
//                                 <div className="d-none d-md-block">
//                                     <p className="text-muted" style={{ lineHeight: '1.6' }}>
//                                         {item.descripcion || "Descripción no disponible."}
//                                     </p>
//                                 </div>

//                                 {/* Vista mobile - acordeón */}
//                                 <div className="d-md-none">
//                                     {showFullDescription ? (
//                                         <>
//                                             <p className="text-muted" style={{ lineHeight: '1.6' }}>
//                                                 {item.descripcion || "Descripción no disponible."}
//                                             </p>
//                                             <button
//                                                 type="button"
//                                                 className="btn btn-link p-0 text-primary"
//                                                 onClick={() => setShowFullDescription(false)}
//                                             >
//                                                 <small>Ver menos ↑</small>
//                                             </button>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <p className="text-muted" style={{ lineHeight: '1.6' }}>
//                                                 {item.descripcion 
//                                                     ? `${item.descripcion.substring(0, 100)}${item.descripcion.length > 100 ? '...' : ''}`
//                                                     : "Descripción no disponible."
//                                                 }
//                                             </p>
//                                             {item.descripcion && item.descripcion.length > 100 && (
//                                                 <button
//                                                     type="button"
//                                                     className="btn btn-link p-0 text-primary"
//                                                     onClick={() => setShowFullDescription(true)}
//                                                 >
//                                                     <small>Ver más ↓</small>
//                                                 </button>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* SELECTOR DE SABORES */}
//                             {item.sabores && item.sabores.length > 0 && (
//                                 <div className="mb-4">
//                                     <h6 className="fw-bold text-light  mb-3">🎨 Elegí tu sabor:</h6>
//                                     <div className="d-flex flex-wrap gap-2">
//                                         {item.sabores.map((sabor, index) => (
//                                             <button
//                                                 key={index}
//                                                 type="button"
//                                                 className={`btn btn-sm ${saborSeleccionado === sabor ? 'btn-primary' : 'btn-outline-primary'}`}
//                                                 onClick={() => setSaborSeleccionado(sabor)}
//                                                 style={{ 
//                                                     transition: 'all 0.3s ease',
//                                                     borderRadius: '20px'
//                                                 }}
//                                             >
//                                                 {sabor}
//                                                 {saborSeleccionado === sabor && (
//                                                     <span className="ms-1">✓</span>
//                                                 )}
//                                             </button>
//                                         ))}
//                                     </div>
//                                     {saborSeleccionado && (
//                                         <div className="mt-2">
//                                             <small className="text-success">
//                                                 ✅ Sabor seleccionado: <strong>{saborSeleccionado}</strong>
//                                             </small>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* PRECIOS */}
//                             <div className="mb-4">
//                                 {/* Precio efectivo */}
//                                 <div className="text-center text-md-start mb-3">
//                                     {item.descuento > 0 ? (
//                                         <>
//                                             <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
//                                                 <span className="text-decoration-line-through text-muted fs-5">
//                                                     ${item.precio?.toLocaleString('es-AR')}
//                                                 </span>
//                                                 <span className="badge bg-danger fs-6">
//                                                     -{item.descuento}% OFF
//                                                 </span>
//                                             </div>
//                                             <h2 className="text-success fw-bold mb-2">
//                                                 ${precioFinal.toLocaleString('es-AR')}
//                                             </h2>
//                                             <small className="text-muted">Precio en efectivo</small>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <h2 className="text-success  fs-1 fw-bold mb-2">
//                                                 ${precioFinal.toLocaleString('es-AR')}
//                                             </h2>
//                                             <small className="text-muted">Precio en efectivo</small>
//                                         </>
//                                     )}
//                                 </div>

//                                 {/* Precio con transferencia */}
//                                 <div className="border-top pt-3">
//                                     <div className="text-center text-md-start">
//                                         <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
//                                             <span className="text-danger fw-bold fs-4">
//                                                 ${precioConTransferencia.toLocaleString('es-AR')}
//                                             </span>
//                                             <span className="badge bg-info">Transferencia</span>
//                                         </div>
//                                         <div className="text-muted small">
//                                             <div>Incluye 7.5% de recargo bancario</div>
//                                             <div>
//                                                 <small className="text-danger">
//                                                     (+${recargoTransferencia.toLocaleString('es-AR')} por comisiones)
//                                                 </small>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Aclaración importante */}
//                                 <div className="alert alert-info mt-3 p-2 small">
//                                     <strong>💡 Importante:</strong> El recargo del 7.5% aplica solo para pagos por transferencia bancaria y cubre comisiones bancarias.
//                                 </div>
//                             </div>

//                             {/* Stock */}
//                             <div className="mb-3">
//                                 <small className={item.stock > 0 ? "text-success" : "text-danger"}>
//                                     {item.stock > 0 ? `✅ ${item.stock} unidades disponibles` : "❌ Sin stock"}
//                                 </small>
//                             </div>

//                             {/* Contador y botones */}
//                             <div className="mt-auto">
//                                 {addedToCart ? (
//                                     <div className="text-center">
//                                         <div className="alert alert-success mb-3">
//                                             <i className="fas fa-check-circle me-2"></i>
//                                             ¡Producto agregado al carrito!
//                                             {saborSeleccionado && (
//                                                 <div>
//                                                     <small>Sabor: {saborSeleccionado}</small>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="d-flex gap-2 justify-content-center">
//                                             <Link to="/" className="btn btn-outline-primary">
//                                                 ← Seguir comprando
//                                             </Link>
//                                             <Link to="/cart" className="btn btn-success">
//                                                 <i className="fas fa-shopping-cart me-2"></i>
//                                                 Ver carrito ({cartTotal()})
//                                             </Link>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <ItemCount 
//                                         stock={item.stock || 0} 
//                                         onAdd={onAdd} 
//                                         initial={1}
//                                         disabled={item.sabores && item.sabores.length > 0 && !saborSeleccionado}
//                                     />
//                                 )}
//                             </div>

//                             {/* Información adicional */}
//                             <div className="mt-4 pt-3 border-top border-secondary">
//                                 <div className="row">
//                                     <div className="col-6">
//                                         <small className="text-muted">
//                                             <i className="fas fa-truck me-1"></i>
//                                             Envío gratis
//                                         </small>
//                                     </div>
//                                     <div className="col-6 text-end">
//                                         <small className="text-muted">
//                                             <i className="fas fa-shield-alt me-1"></i>
//                                             Garantía
//                                         </small>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Sección de características */}
//             {item.caracteristicas && item.caracteristicas.length > 0 && (
//                 <div className="row mt-5">
//                     <div className="col-12">
//                         <div className="card border-0" style={{ background: 'var(--bg-card)' }}>
//                             <div className="card-body p-4">
//                                 <h5 className="mb-3">Características</h5>
//                                 <div className="row">
//                                     {item.caracteristicas.map((caract, index) => (
//                                         <div key={index} className="col-md-6 mb-2">
//                                             <small className="text-muted">
//                                                 • {caract}
//                                             </small>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ItemDetail;

import { useContext, useEffect, useState } from "react";
import ItemCount from "./ItemCount";
import { CartContext } from "./context/CartContext";
import { Link } from "react-router-dom";
// ✅ NUEVO: Importar Helmet
import { Helmet } from "react-helmet";

const ItemDetail = ({ producto }) => {
    const { addItem, cartTotal } = useContext(CartContext);
    const [item, setItem] = useState({});
    const [addedToCart, setAddedToCart] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saborSeleccionado, setSaborSeleccionado] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        if (producto) {
            setItem(producto);
            setLoading(false);
            
            if (producto.sabores && producto.sabores.length > 0) {
                setSaborSeleccionado(producto.sabores[0]);
            }
        }
    }, [producto]);

    useEffect(() => {
        if (addedToCart) {
            setAddedToCart(false);
        }
    }, [saborSeleccionado]);

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

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando producto...</p>
            </div>
        );
    }

    if (!item || Object.keys(item).length === 0) {
        return (
            <div className="container text-center py-5">
                <h2>Producto no encontrado</h2>
                <p>El producto que buscas no existe o ha sido removido.</p>
                <Link to="/" className="btn btn-primary">
                    Volver al inicio
                </Link>
            </div>
        );
    }

    const precioFinal = item.descuento > 0 
        ? Math.round(item.precio - (item.precio * item.descuento) / 100)
        : item.precio;

    const precioConTransferencia = Math.round(precioFinal * 1.075);
    const recargoTransferencia = precioConTransferencia - precioFinal;

    return (
        <div className="container py-5">
            {/* ✅ NUEVO: Helmet para SEO dinámico */}
            <Helmet>
                <title>{item.nombre} | {item.marca} | Al Fallo</title>
                <meta name="description" content={item.descripcion} />
            </Helmet>

            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/" className="text-decoration-none text-secondary">
                            Inicio
                        </Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to={`/category/${item.categoria}`} className="text-decoration-none text-secondary">
                            {item.categoria}
                        </Link>
                    </li>
                    <li className="breadcrumb-item active text-primary">{item.nombre}</li>
                </ol>
            </nav>

            <div className="row">
                {/* Columna de imagen */}
                <div className="col-md-6 mb-4">
                    <div className="card border-0" style={{ background: 'var(--bg-card)' }}>
                        <div className="card-body p-4 text-center">
                            <img 
                                src={item.img} 
                                alt={item.nombre} 
                                className="img-fluid rounded"
                                style={{ 
                                    maxHeight: '400px', 
                                    width: 'auto',
                                    objectFit: 'contain'
                                }} 
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Columna de información */}
                <div className="col-md-6">
                    <div className="card border-0 h-100" style={{ background: 'var(--bg-card)' }}>
                        <div className="card-body p-4 d-flex flex-column">
                            {/* Marca y nombre */}
                            <div className="mb-3">
                                <span className="badge bg-secondary mb-2">{item.marca}</span>
                                <h1 className="h2 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {item.nombre}
                                    {saborSeleccionado && (
                                        <span className="h4 text-muted"> - {saborSeleccionado}</span>
                                    )}
                                </h1>
                                <span className="badge bg-dark">{item.presentacion}</span>
                                {item.sabores && item.sabores.length > 0 && (
                                    <span className="badge bg-info ms-2">Múltiples sabores</span>
                                )}
                            </div>

                            {/* Descripción - CON ACORDEÓN PARA MÓVIL */}
                            <div className="mb-4">
                                {/* Vista desktop - descripción completa */}
                                <div className="d-none d-md-block">
                                    <p className="text-muted" style={{ lineHeight: '1.6' }}>
                                        {item.descripcion || "Descripción no disponible."}
                                    </p>
                                </div>

                                {/* Vista mobile - acordeón */}
                                <div className="d-md-none">
                                    {showFullDescription ? (
                                        <>
                                            <p className="text-muted" style={{ lineHeight: '1.6' }}>
                                                {item.descripcion || "Descripción no disponible."}
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 text-primary"
                                                onClick={() => setShowFullDescription(false)}
                                            >
                                                <small>Ver menos ↑</small>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-muted" style={{ lineHeight: '1.6' }}>
                                                {item.descripcion 
                                                    ? `${item.descripcion.substring(0, 100)}${item.descripcion.length > 100 ? '...' : ''}`
                                                    : "Descripción no disponible."
                                                }
                                            </p>
                                            {item.descripcion && item.descripcion.length > 100 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => setShowFullDescription(true)}
                                                >
                                                    <small>Ver más ↓</small>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* SELECTOR DE SABORES */}
                            {item.sabores && item.sabores.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="fw-bold text-light mb-3">🎨 Elegí tu sabor:</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {item.sabores.map((sabor, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className={`btn btn-sm ${saborSeleccionado === sabor ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setSaborSeleccionado(sabor)}
                                                style={{ 
                                                    transition: 'all 0.3s ease',
                                                    borderRadius: '20px'
                                                }}
                                            >
                                                {sabor}
                                                {saborSeleccionado === sabor && (
                                                    <span className="ms-1">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {saborSeleccionado && (
                                        <div className="mt-2">
                                            <small className="text-success">
                                                ✅ Sabor seleccionado: <strong>{saborSeleccionado}</strong>
                                            </small>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PRECIOS */}
                            <div className="mb-4">
                                <div className="text-center text-md-start mb-3">
                                    {item.descuento > 0 ? (
                                        <>
                                            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                                                <span className="text-decoration-line-through text-muted fs-5">
                                                    ${item.precio?.toLocaleString('es-AR')}
                                                </span>
                                                <span className="badge bg-danger fs-6">
                                                    -{item.descuento}% OFF
                                                </span>
                                            </div>
                                            <h2 className="text-success fw-bold mb-2">
                                                ${precioFinal.toLocaleString('es-AR')}
                                            </h2>
                                            <small className="text-muted">Precio en efectivo</small>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-success fs-1 fw-bold mb-2">
                                                ${precioFinal.toLocaleString('es-AR')}
                                            </h2>
                                            <small className="text-muted">Precio en efectivo</small>
                                        </>
                                    )}
                                </div>

                                <div className="border-top pt-3">
                                    <div className="text-center text-md-start">
                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                                            <span className="text-danger fw-bold fs-4">
                                                ${precioConTransferencia.toLocaleString('es-AR')}
                                            </span>
                                            <span className="badge bg-info">Transferencia</span>
                                        </div>
                                        <div className="text-muted small">
                                            <div>Incluye 7.5% de recargo bancario</div>
                                            <div>
                                                <small className="text-danger">
                                                    (+${recargoTransferencia.toLocaleString('es-AR')} por comisiones)
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="alert alert-info mt-3 p-2 small">
                                    <strong>💡 Importante:</strong> El recargo del 7.5% aplica solo para pagos por transferencia bancaria y cubre comisiones bancarias.
                                </div>
                            </div>

                            {/* Stock */}
                            <div className="mb-3">
                                <small className={item.stock > 0 ? "text-success" : "text-danger"}>
                                    {item.stock > 0 ? `✅ ${item.stock} unidades disponibles` : "❌ Sin stock"}
                                </small>
                            </div>

                            {/* Contador y botones */}
                            <div className="mt-auto">
                                {addedToCart ? (
                                    <div className="text-center">
                                        <div className="alert alert-success mb-3">
                                            <i className="fas fa-check-circle me-2"></i>
                                            ¡Producto agregado al carrito!
                                            {saborSeleccionado && (
                                                <div>
                                                    <small>Sabor: {saborSeleccionado}</small>
                                                </div>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <Link to="/" className="btn btn-outline-primary">
                                                ← Seguir comprando
                                            </Link>
                                            <Link to="/cart" className="btn btn-success">
                                                <i className="fas fa-shopping-cart me-2"></i>
                                                Ver carrito ({cartTotal()})
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <ItemCount 
                                        stock={item.stock || 0} 
                                        onAdd={onAdd} 
                                        initial={1}
                                        disabled={item.sabores && item.sabores.length > 0 && !saborSeleccionado}
                                    />
                                )}
                            </div>

                            {/* Información adicional */}
                            <div className="mt-4 pt-3 border-top border-secondary">
                                <div className="row">
                                    <div className="col-6">
                                        <small className="text-muted">
                                            <i className="fas fa-truck me-1"></i>
                                            Envío gratis
                                        </small>
                                    </div>
                                    <div className="col-6 text-end">
                                        <small className="text-muted">
                                            <i className="fas fa-shield-alt me-1"></i>
                                            Garantía
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de características */}
            {item.caracteristicas && item.caracteristicas.length > 0 && (
                <div className="row mt-5">
                    <div className="col-12">
                        <div className="card border-0" style={{ background: 'var(--bg-card)' }}>
                            <div className="card-body p-4">
                                <h5 className="mb-3">Características</h5>
                                <div className="row">
                                    {item.caracteristicas.map((caract, index) => (
                                        <div key={index} className="col-md-6 mb-2">
                                            <small className="text-muted">
                                                • {caract}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;