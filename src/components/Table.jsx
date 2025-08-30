
// const Table = ({ cart, metodoPago, showOriginalPrice = false }) => {
//     return (
//         <div className="table-responsive">
//             <table className="table">
//                 <thead>
//                     <tr>
//                         <th>Producto</th>
//                         <th className="text-center">Cantidad</th>
//                         <th className="text-end">Precio Unitario</th>
//                         <th className="text-end">Subtotal</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {cart.map((item) => {
//                         // Usar precioConRecargo si existe, sino precioFinal
//                         const precioUnitario = item.precioConRecargo || item.precioFinal || 0;
//                         const precioOriginal = item.precioOriginal || item.precioFinal || 0;
//                         const subtotal = precioUnitario * item.cantidad;

//                         return (
//                             <tr key={item.id}>
//                                 <td>
//                                     <div>
//                                         <strong>{item.marca} {item.nombre}</strong>
//                                         {item.presentacion && (
//                                             <small className="text-muted d-block">{item.presentacion}</small>
//                                         )}
//                                     </div>
//                                 </td>
//                                 <td className="text-center">{item.cantidad}</td>
//                                 <td className="text-end">
//                                     <div>
//                                         <span className={showOriginalPrice && precioOriginal !== precioUnitario ? "text-success fw-bold" : ""}>
//                                             ${precioUnitario.toLocaleString('es-AR')}
//                                         </span>
//                                         {showOriginalPrice && precioOriginal !== precioUnitario && (
//                                             <small className="text-muted d-block">
//                                                 <s>${precioOriginal.toLocaleString('es-AR')}</s>
//                                             </small>
//                                         )}
//                                     </div>
//                                 </td>
//                                 <td className="text-end fw-bold">
//                                     ${subtotal.toLocaleString('es-AR')}
//                                 </td>
//                             </tr>
//                         );
//                     })}
//                 </tbody>
//             </table>
//         </div>
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
                                        {/* MOSTRAR SABOR SI EXISTE - USANDO saborSeleccionado */}
                                        {item.saborSeleccionado && (
                                            <small className="text-muted d-block">🍦 Sabor: {item.saborSeleccionado}</small>
                                        )}
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