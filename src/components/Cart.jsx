import { useContext } from "react";
import { CartContext } from "./context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
    const { cart, cartTotal, precioTotal, removeItem, clear } = useContext(CartContext);

    if (cartTotal() === 0) {
        return (
            <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 341px)' }}>
                <div className="row text-center">
                    <div className="col">
                        <div className="alert alert-dark border border-secondary" role="alert">
                            <i className="fas fa-shopping-cart me-2"></i>
                            No hay productos en el carrito
                        </div>
                        <Link to={"/"} className="btn btn-outline-primary mt-3">
                            ← Volver a inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container alto my-5">
            <div className="row mb-4">
                <div className="col text-center">
                    <h1 className="text-decoration-underline">Resumen de tu compra</h1>
                    <p className="text-muted">{cartTotal()} producto(s) en el carrito</p>
                </div>
            </div>

            {/* Vista para desktop (sin cambios) */}
            <div className="d-none d-lg-block">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        <div className="card border border-secondary ">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Presentación</th>
                                                <th>Precio Unit.</th>
                                                <th>Cantidad</th>
                                                <th>Subtotal</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => {
                                                const subtotal = item.precioFinal * item.cantidad;

                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={item.img}
                                                                    alt={item.nombre}
                                                                    style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        objectFit: 'contain',
                                                                        marginRight: '1rem',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                />
                                                                <div>
                                                                    <div style={{ fontWeight: '600' }}>
                                                                        {item.marca}
                                                                    </div>
                                                                    <div style={{ color: 'var(--text-secondary)' }}>
                                                                        {item.nombreCompleto || item.nombre}
                                                                    </div>
                                                                    {/* MOSTRAR SABOR SI EXISTE */}
                                                                    {item.saborSeleccionado && (
                                                                        <div className="mt-1">
                                                                            <span className="badge bg-info text-dark">
                                                                                🍦 Sabor: {item.saborSeleccionado}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-primary">{item.presentacion}</span>
                                                        </td>
                                                        <td>${item.precioFinal?.toLocaleString('es-AR')}</td>
                                                        <td>
                                                            <span className="badge bg-dark">{item.cantidad}</span>
                                                        </td>
                                                        <td style={{ fontWeight: '600' }}>
                                                            ${subtotal.toLocaleString('es-AR')}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="btn btn-link text-danger p-0"
                                                                title="Eliminar producto"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-lg-none">
                {cart.map((item) => {
                    const subtotal = item.precioFinal * item.cantidad;
                    
                    return (
                        <div key={item.id} className="card mb-3 border border-secondary">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={item.img}
                                            alt={item.nombre}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                objectFit: 'contain',
                                                marginRight: '1rem',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>
                                                {item.marca}
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                {item.nombreCompleto || item.nombre}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="btn btn-link text-danger p-0"
                                        title="Eliminar producto"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                {item.saborSeleccionado && (
                                    <div className="mb-2">
                                        <span className="badge bg-success  te">
                                            🍦 Sabor: {item.saborSeleccionado}
                                        </span>
                                    </div>
                                )}
                                
                                <div className="d-flex justify-content-between flex-wrap">
                                    <div className="me-3 mb-2">
                                        <small className=" ">Presentación:</small>
                                        <div><span className="badge bg-success">{item.presentacion}</span></div>
                                    </div>
                                    <div className="me-3 mb-2">
                                        <small className="">Precio:</small>
                                        <div>${item.precioFinal?.toLocaleString('es-AR')}</div>
                                    </div>
                                    <div className="me-3 mb-2">
                                        <small className="">Cantidad:</small>
                                        <div><span className="badge bg-success">{item.cantidad}</span></div>
                                    </div>
                                    <div className="mb-2">
                                        <small className="">Subtotal:</small>
                                        <div style={{ fontWeight: '600' }}>${subtotal.toLocaleString('es-AR')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sección de total y botones - Mejorada para móvil */}
            <div className="row justify-content-center mt-4">
                <div className="col-12 col-lg-10">
                    <div className="d-lg-flex justify-content-between align-items-center p-3 p-lg-4 border border-secondary rounded">
                        <div className="text-center text-lg-start mb-3 mb-lg-0">
                            <h4 className="mb-0">
                                Total: <span className="text-success">${precioTotal().toLocaleString('es-AR')}</span>
                            </h4>
                        </div>
                        <div className="d-grid d-lg-flex gap-2">
                            <button onClick={clear} className="btn btn-outline-danger mb-2 mb-lg-0">
                                🗑️ Vaciar Carrito
                            </button>
                            <Link to={"/"} className="btn btn-outline-secondary mb-2 mb-lg-0">
                                ← Seguir comprando
                            </Link>
                            <Link to={"/checkout"} className="btn btn-success">
                                ✅ Finalizar Compra
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;