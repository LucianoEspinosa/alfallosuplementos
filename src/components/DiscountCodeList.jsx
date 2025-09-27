// const DiscountCodeList = ({ discountCodes, loading, onEditCode, onDeleteCode, onToggleStatus }) => {
//     if (loading) {
//         return (
//             <div className="d-flex justify-content-center my-5">
//                 <div className="spinner-border text-primary" role="status">
//                     <span className="visually-hidden">Cargando...</span>
//                 </div>
//             </div>
//         );
//     }

//     if (discountCodes.length === 0) {
//         return (
//             <div className="alert alert-info text-center">
//                 <i className="fas fa-tags fa-2x mb-3"></i>
//                 <h4>No hay códigos de descuento</h4>
//                 <p>Comienza creando tu primer código de descuento</p>
//             </div>
//         );
//     }

//     return (
//         <div className="card shadow">
//             <div className="card-header bg-white py-3">
//                 <h5 className="mb-0">Lista de Códigos de Descuento</h5>
//             </div>
//             <div className="card-body p-0">
//                 <div className="table-responsive">
//                     <table className="table table-hover mb-0">
//                         <thead className="table-light">
//                             <tr>
//                                 <th>Código</th>
//                                 <th>Descuento</th>
//                                 <th>Usos</th>
//                                 <th>Límite</th>
//                                 <th>Estado</th>
//                                 <th>Expiración</th>
//                                 <th>Acciones</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {discountCodes.map((code) => (
//                                 <tr key={code.id}>
//                                     <td>
//                                         <span className="fw-bold">{code.code}</span>
//                                         {code.description && (
//                                             <div className="text-muted small">{code.description}</div>
//                                         )}
//                                     </td>
//                                     <td>
//                                         <span className="badge bg-info">
//                                             {code.discountType === "percentage" 
//                                                 ? `${parseFloat(code.value).toFixed(2)}%` 
//                                                 : `$${parseFloat(code.value).toFixed(2)}`
//                                             }
//                                         </span>
//                                         {code.minPurchase > 0 && (
//                                             <div className="text-muted small">
//                                                 Mín: ${parseFloat(code.minPurchase).toFixed(2)}
//                                             </div>
//                                         )}
//                                     </td>
//                                     <td>
//                                         {code.timesUsed || 0} / {code.usageLimit || '∞'}
//                                     </td>
//                                     <td>
//                                         {code.usageLimit ? code.usageLimit : 'Ilimitado'}
//                                     </td>
//                                     <td>
//                                         <span className={`badge ${code.active ? 'bg-success' : 'bg-secondary'}`}>
//                                             {code.active ? 'Activo' : 'Inactivo'}
//                                         </span>
//                                     </td>
//                                     <td>
//                                         {code.validUntil 
//                                             ? new Date(code.validUntil.seconds * 1000).toLocaleDateString() 
//                                             : 'Sin expiración'
//                                         }
//                                     </td>
//                                     <td>
//                                         <div className="btn-group btn-group-sm">
//                                             <button
//                                                 className="btn btn-outline-primary"
//                                                 onClick={() => onEditCode(code)}
//                                                 title="Editar"
//                                             >
//                                                 <i className="fas fa-edit"></i>
//                                             </button>
//                                             <button
//                                                 className={`btn ${code.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
//                                                 onClick={() => onToggleStatus(code.id, code.active)}
//                                                 title={code.active ? 'Desactivar' : 'Activar'}
//                                             >
//                                                 <i className={`fas ${code.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//                                             </button>
//                                             <button
//                                                 className="btn btn-outline-danger"
//                                                 onClick={() => onDeleteCode(code.id)}
//                                                 title="Eliminar"
//                                             >
//                                                 <i className="fas fa-trash"></i>
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DiscountCodeList;

import { useState } from "react";

const DiscountCodeList = ({ discountCodes, loading, onEditCode, onDeleteCode, onToggleStatus }) => {
    if (loading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (discountCodes.length === 0) {
        return (
            <div className="alert alert-info text-center">
                <i className="fas fa-tags fa-2x mb-3"></i>
                <h4>No hay códigos de descuento</h4>
                <p>Comienza creando tu primer código de descuento</p>
            </div>
        );
    }

    return (
        <div className="card shadow">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0">Lista de Códigos de Descuento</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Código</th>
                                <th>Descuento</th>
                                <th>Primera compra</th>
                                <th>Usos</th>
                                <th>Límite</th>
                                <th>Estado</th>
                                <th>Expiración</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discountCodes.map((code) => (
                                <tr key={code.id}>
                                    <td>
                                        <span className="fw-bold">{code.code}</span>
                                        {code.description && (
                                            <div className="text-muted small">{code.description}</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="badge bg-info">
                                            {code.discountType === "percentage" 
                                                ? `${parseFloat(code.value).toFixed(2)}%` 
                                                : `$${parseFloat(code.value).toFixed(2)}`
                                            }
                                        </span>
                                        {code.minPurchase > 0 && (
                                            <div className="text-muted small">
                                                Mín: ${parseFloat(code.minPurchase).toFixed(2)}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {code.firstPurchaseOnly ? (
                                            <span className="badge bg-warning">Sí</span>
                                        ) : (
                                            <span className="badge bg-secondary">No</span>
                                        )}
                                    </td>
                                    <td>
                                        {code.timesUsed || 0} / {code.usageLimit || '∞'}
                                    </td>
                                    <td>
                                        {code.usageLimit ? code.usageLimit : 'Ilimitado'}
                                    </td>
                                    <td>
                                        <span className={`badge ${code.active ? 'bg-success' : 'bg-secondary'}`}>
                                            {code.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        {code.validUntil 
                                            ? new Date(code.validUntil.seconds * 1000).toLocaleDateString() 
                                            : 'Sin expiración'
                                        }
                                    </td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                className="btn btn-outline-primary"
                                                onClick={() => onEditCode(code)}
                                                title="Editar"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className={`btn ${code.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                onClick={() => onToggleStatus(code.id, code.active)}
                                                title={code.active ? 'Desactivar' : 'Activar'}
                                            >
                                                <i className={`fas ${code.active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => onDeleteCode(code.id)}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DiscountCodeList;