/*import { useContext } from "react";
import { CartContext } from "./context/CartContext";
import { Link } from "react-router-dom";
import Table from "./Table";
const Cart = () => {
    const { cart, cartTotal} = useContext(CartContext);
    if (cartTotal() === 0) {
        return (
            <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 341px)' }}>
                <div className="row">
                    <div className="col">
                        <div className="alert alert-danger" role="alert">No hay productos en el carrito</div>
                        <Link to={"/"} className=" d-block text-center"><span className="text-secondary text-decoration-underline vaciar">Volver a inicio</span></Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container alto">
            <div className="row">
                <div className="col text-center my-5">
                    <h1 >Resumen de su compra</h1>
                </div>
            </div>
            <div className="row px-2 px-md-0">
                <Table cart={cart} trush={true} />

            </div>
            <div className="row">
                <div className="text-center text-md-end my-3">
                    <Link to={"/checkout"}><button className="btn btn-primary">Finalizar Compra</button></Link>
                </div>
            </div>
        </div>
    )
}
export default Cart;*/




// import { useContext } from "react";
// import { CartContext } from "./context/CartContext";
// import { Link } from "react-router-dom";

// const Cart = () => {
//     const { cart, cartTotal, precioTotal, removeItem, clear } = useContext(CartContext);

//     if (cartTotal() === 0) {
//         return (
//             <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 341px)' }}>
//                 <div className="row text-center">
//                     <div className="col">
//                         <div className="alert alert-dark border border-secondary" role="alert" style={{
//                             background: 'var(--bg-card)',
//                             color: 'var(--text-primary)',
//                             border: '1px solid var(--border-color)'
//                         }}>
//                             <i className="fas fa-shopping-cart me-2"></i>
//                             No hay productos en el carrito
//                         </div>
//                         <Link to={"/"} className="btn btn-outline-primary mt-3">
//                             ← Volver a inicio
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container alto my-5">
//             {/* Header */}
//             <div className="row mb-4">
//                 <div className="col text-center">
//                     <h1 className="text-decoration-underline">Resumen de tu compra</h1>
//                     <p className="text-muted">{cartTotal()} producto(s) en el carrito</p>
//                 </div>
//             </div>

//             {/* Tabla de productos */}
//             <div className="row justify-content-center">
//                 <div className="col-12 col-lg-10">
//                     <div className="card border border-secondary" style={{
//                         background: 'var(--bg-card)',
//                         borderRadius: '8px',
//                         overflow: 'hidden'
//                     }}>
//                         <div className="card-body p-0">
//                             <div className="table-responsive">
//                                 <table className="table table-hover mb-0">
//                                     <thead style={{ background: 'var(--bg-secondary)' }}>
//                                         <tr>
//                                             <th style={{ color: 'var(--text-primary)', padding: '1rem' }}>Producto</th>
//                                             <th style={{ color: 'var(--text-primary)', padding: '1rem' }}>Presentación</th>
//                                             <th style={{ color: 'var(--text-primary)', padding: '1rem' }}>Precio Unit.</th>
//                                             <th style={{ color: 'var(--text-primary)', padding: '1rem' }}>Cantidad</th>
//                                             <th style={{ color: 'var(--text-primary)', padding: '1rem' }}>Subtotal</th>
//                                             <th style={{ color: 'var(--text-primary)', padding: '1rem' }}></th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {cart.map((item) => {
//                                             const precio = item.precioFinal || item.precio || 0;
//                                             const subtotal = precio * (item.cantidad || 0);

//                                             return (
//                                                 <tr key={item.id} style={{ borderColor: 'var(--border-color)' }}>
//                                                     <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
//                                                         <div className="d-flex align-items-center">
//                                                             <img
//                                                                 src={item.img}
//                                                                 alt={item.nombre}
//                                                                 style={{
//                                                                     width: '50px',
//                                                                     height: '50px',
//                                                                     objectFit: 'contain',
//                                                                     marginRight: '1rem',
//                                                                     borderRadius: '4px'
//                                                                 }}
//                                                             />
//                                                             <div>
//                                                                 <div style={{ fontWeight: '600' }}>{item.marca}</div>
//                                                                 <div style={{ color: 'var(--text-secondary)' }}>{item.nombre}</div>
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
//                                                         <span className="badge bg-secondary">{item.presentacion}</span>
//                                                     </td>
//                                                     <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
//                                                         ${precio}
//                                                     </td>
//                                                     <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
//                                                         <span className="badge bg-dark">{item.cantidad}</span>
//                                                     </td>
//                                                     <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: '600' }}>
//                                                         ${subtotal}
//                                                     </td>
//                                                     <td style={{ padding: '1rem', textAlign: 'center' }}>
//                                                         {/* BOTÓN SIMPLE DE BASURA - COMO ANTES */}
//                                                         <button
//                                                             onClick={() => removeItem(item.id)}
//                                                             className="btn btn-link text-danger p-0"
//                                                             title="Eliminar producto"
//                                                             style={{ fontSize: '1.2rem' }}
//                                                         >
//                                                             🗑️
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Total y botones */}
//             <div className="row justify-content-center mt-4">
//                 <div className="col-12 col-lg-10">
//                     <div className="d-flex justify-content-between align-items-center p-4 border border-secondary rounded" style={{
//                         background: 'var(--bg-card)',
//                         borderColor: 'var(--border-color)'
//                     }}>
//                         <div>
//                             <h4 className="mb-0" style={{ color: 'var(--text-primary)' }}>
//                                 Total: <span className="text-success">${precioTotal()}</span>
//                             </h4>
//                         </div>
//                         <div className="d-flex gap-2">
//                             <button
//                                 onClick={clear}
//                                 className="btn btn-outline-danger"
//                                 style={{ borderColor: 'var(--border-color)' }}
//                             >
//                                 🗑️ Vaciar Carrito
//                             </button>
//                             <Link to={"/"} className="btn btn-outline-secondary">
//                                 ← Seguir comprando
//                             </Link>
//                             <Link to={"/checkout"} className="btn btn-success">
//                                 ✅ Finalizar Compra
//                             </Link>
//                         </div>
//                     </div>
//                 </div>
//             </div>


//         </div>
//     );
// };

// export default Cart;



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

            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="card border border-secondary">
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
                                                        <span className="badge bg-secondary">{item.presentacion}</span>
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

            <div className="row justify-content-center mt-4">
                <div className="col-12 col-lg-10">
                    <div className="d-flex justify-content-between align-items-center p-4 border border-secondary rounded">
                        <div>
                            <h4 className="mb-0">
                                Total: <span className="text-success">${precioTotal().toLocaleString('es-AR')}</span>
                            </h4>
                        </div>
                        <div className="d-flex gap-2">
                            <button onClick={clear} className="btn btn-outline-danger">
                                🗑️ Vaciar Carrito
                            </button>
                            <Link to={"/"} className="btn btn-outline-secondary">
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