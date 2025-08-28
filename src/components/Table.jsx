// import { useContext } from "react";
// import { CartContext } from "./context/CartContext";
// import logo from "./img/alfallonegro.png";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';


// const Table = ({ cart, trush }) => {
//     const { precioTotal, removeItem, clear } = useContext(CartContext);
//     return (

//         <table className="table table-sm text-center mt-3">
//             <thead>
//                 <tr>
//                     <th scope="col">
//                         <img src={logo} alt="logotipo alfallo suplementos" width={30} />{" "}
//                     </th>
//                     <th scope="col">Producto</th>
//                     <th scope="col">Cantidad</th>
//                     <th scope="col">Precio</th>
//                     {trush && <th scope="col">&nbsp;</th>}
//                 </tr>
//             </thead>
//             <tbody>
//                 {cart.map((item) => (
//                     <tr key={item.id}>
//                         <td>
//                             <img src={item.img} alt={item.nombre} width={20} />{" "}
//                         </td>
//                         <td>{item.marca} {item.nombre}({item.presentacion})</td>
//                         <td>{item.cantidad}</td>
//                         <td>{item.precioFinal * item.cantidad}</td>
//                         {trush && <td className="vaciar"><FontAwesomeIcon icon={faTrash} onClick={() => removeItem(item.id)} /></td>}
//                     </tr>
//                 ))}
//             </tbody>
//             <tfoot>
//                 <tr>
//                     <td colSpan="3" className="text-end">Total</td>
//                     <td><b>{precioTotal()}</b></td>
//                     <th scope="col">&nbsp;</th>
//                 </tr>
//                 {trush && <tr>
//                     <td colSpan="7" onClick={() => clear()}><span className="col text-center text-decoration-underline vaciar">Vaciar carrito</span></td>
//                 </tr>}
//             </tfoot>
//         </table>

//     );
// };
// export default Table;
const Table = ({ cart, metodoPago, showOriginalPrice = false }) => {
    return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-end">Precio Unitario</th>
                        <th className="text-end">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item) => {
                        // Usar precioConRecargo si existe, sino precioFinal
                        const precioUnitario = item.precioConRecargo || item.precioFinal || 0;
                        const precioOriginal = item.precioOriginal || item.precioFinal || 0;
                        const subtotal = precioUnitario * item.cantidad;

                        return (
                            <tr key={item.id}>
                                <td>
                                    <div>
                                        <strong>{item.marca} {item.nombre}</strong>
                                        {item.presentacion && (
                                            <small className="text-muted d-block">{item.presentacion}</small>
                                        )}
                                    </div>
                                </td>
                                <td className="text-center">{item.cantidad}</td>
                                <td className="text-end">
                                    <div>
                                        <span className={showOriginalPrice && precioOriginal !== precioUnitario ? "text-success fw-bold" : ""}>
                                            ${precioUnitario.toLocaleString('es-AR')}
                                        </span>
                                        {showOriginalPrice && precioOriginal !== precioUnitario && (
                                            <small className="text-muted d-block">
                                                <s>${precioOriginal.toLocaleString('es-AR')}</s>
                                            </small>
                                        )}
                                    </div>
                                </td>
                                <td className="text-end fw-bold">
                                    ${subtotal.toLocaleString('es-AR')}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Table;