/*import { useContext, useEffect, useState } from "react";
import ItemCount from "./ItemCount";
import { CartContext } from "./context/CartContext";

const ItemDetail = ({ producto }) => {
    const { addItem } = useContext(CartContext);
    const [item, setItem] = useState({});

    const onAdd = (quantity) => {

        addItem(item, quantity);
    }

    useEffect(() => {
        setItem(producto);
    }, [producto]);

    return (
        <div className="container p-5">
            <div className="row">
                <div className="col-md-5 offset-md-1">
                <div >
                        <span>{item.marca}</span>
                        <h1>{item.nombre}</h1>
                    </div>
                    <div className="text-center">
                    <img src={item.img} alt={item.nombre} className="w-50 img-fluid" />
                    </div>
                </div>
                <div className="col-md-5 d-flex flex-column text-center text-md-start">
                    
                    <p className="mb-4">{item.descripcion}</p>
                    {item.descuento > 0 ? (
                        <div className="d-flex justify-content-center ">
                            <div className="text-center">
                                <h2 className="text-decoration-line-through text-muted">${item.precio}</h2>
                                <span className="badge bg-primary">{item.descuento}%</span>
                                <h2>${item.precio - (item.precio * item.descuento) / 100}</h2>
                            </div>
                        </div>
                    ) : (<div><h2 className="text-center">${item.precio}</h2></div>)}
                    <div className="mt-auto">
                        <ItemCount stock={item.stock} onAdd={onAdd} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;*/
import { useContext, useEffect, useState } from "react";
import ItemCount from "./ItemCount";
import { CartContext } from "./context/CartContext";
import { Link } from "react-router-dom";

const ItemDetail = ({ producto }) => {
    const { addItem, cartTotal } = useContext(CartContext);
    const [item, setItem] = useState({});
    const [addedToCart, setAddedToCart] = useState(false);

    const onAdd = (quantity) => {
        addItem(item, quantity);
        setAddedToCart(true);
    }

    useEffect(() => {
        setItem(producto);
    }, [producto]);

    // Calcular precio final
    const precioFinal = item.descuento > 0 
        ? Math.round(item.precio - (item.precio * item.descuento) / 100)
        : item.precio;

    return (
        <div className="container py-5">
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
                                </h1>
                                <span className="badge bg-dark">{item.presentacion}</span>
                            </div>

                            {/* Descripción */}
                            <p className="text-muted mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                                {item.descripcion}
                            </p>

                            {/* Precio */}
                            <div className="mb-4">
                                {item.descuento > 0 ? (
                                    <div className="text-center text-md-start">
                                        <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-2">
                                            <span className="text-decoration-line-through text-muted fs-5">
                                                ${item.precio}
                                            </span>
                                            <span className="badge bg-danger fs-6">
                                                -{item.descuento}% OFF
                                            </span>
                                        </div>
                                        <h2 className="text-success fw-bold mb-0">
                                            ${precioFinal}
                                        </h2>
                                    </div>
                                ) : (
                                    <h2 className="text-center text-md-start text-primary fw-bold">
                                        ${item.precio}
                                    </h2>
                                )}
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
                                        stock={item.stock} 
                                        onAdd={onAdd} 
                                        initial={1}
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
            {item.caracteristicas && (
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