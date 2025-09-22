// import { useState, useEffect } from "react";

// const EditDiscountCode = ({ code, onSubmit, onCancel }) => {
//     const [formData, setFormData] = useState({
//         code: code.code,
//         discountType: code.discountType || "percentage",
//         value: code.value || 10,
//         minPurchase: code.minPurchase || 0,
//         validUntil: code.validUntil ? new Date(code.validUntil.seconds * 1000).toISOString().split('T')[0] : "",
//         usageLimit: code.usageLimit || "",
//         description: code.description || "",
//         active: code.active !== undefined ? code.active : true
//     });

//     useEffect(() => {
//         setFormData({
//             code: code.code,
//             discountType: code.discountType || "percentage",
//             value: code.value || 10,
//             minPurchase: code.minPurchase || 0,
//             validUntil: code.validUntil ? new Date(code.validUntil.seconds * 1000).toISOString().split('T')[0] : "",
//             usageLimit: code.usageLimit || "",
//             description: code.description || "",
//             active: code.active !== undefined ? code.active : true
//         });
//     }, [code]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         await onSubmit({
//             discountType: formData.discountType,
//             value: Number(formData.value),
//             minPurchase: Number(formData.minPurchase),
//             usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
//             validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
//             description: formData.description,
//             active: formData.active
//         });
//     };

//     return (
//         <div className="card shadow">
//             <div className="card-header bg-white py-3">
//                 <h5 className="mb-0">Editar Código de Descuento: {code.code}</h5>
//             </div>
//             <div className="card-body">
//                 <form onSubmit={handleSubmit}>
//                     <div className="row">
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Valor (%) *</label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={formData.value}
//                                 onChange={(e) => setFormData({ ...formData, value: e.target.value })}
//                                 min="1"
//                                 max="100"
//                                 required
//                             />
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Mínimo de compra</label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={formData.minPurchase}
//                                 onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
//                                 min="0"
//                                 placeholder="0 = sin mínimo"
//                             />
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Fecha de expiración</label>
//                             <input
//                                 type="date"
//                                 className="form-control"
//                                 value={formData.validUntil}
//                                 onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
//                                 min={new Date().toISOString().split('T')[0]}
//                             />
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Límite de usos</label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={formData.usageLimit}
//                                 onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
//                                 min="1"
//                                 placeholder="Dejar vacío para ilimitado"
//                             />
//                         </div>

//                         <div className="col-12 mb-3">
//                             <label className="form-label">Descripción</label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 value={formData.description}
//                                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                                 placeholder="Ej: 15% de descuento en verano"
//                             />
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <div className="form-check form-switch">
//                                 <input
//                                     className="form-check-input"
//                                     type="checkbox"
//                                     id="activeSwitch"
//                                     checked={formData.active}
//                                     onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
//                                 />
//                                 <label className="form-check-label" htmlFor="activeSwitch">
//                                     Código activo
//                                 </label>
//                             </div>
//                         </div>

//                         <div className="col-12">
//                             <button type="submit" className="btn btn-primary me-2">
//                                 Guardar Cambios
//                             </button>
//                             <button type="button" className="btn btn-secondary" onClick={onCancel}>
//                                 Cancelar
//                             </button>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default EditDiscountCode;


import { useState, useEffect } from "react";

const EditDiscountCode = ({ code, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        code: code.code,
        discountType: code.discountType || "percentage",
        value: code.value || 10.0,
        minPurchase: code.minPurchase || 0.0,
        validUntil: code.validUntil ? new Date(code.validUntil.seconds * 1000).toISOString().split('T')[0] : "",
        usageLimit: code.usageLimit || "",
        description: code.description || "",
        active: code.active !== undefined ? code.active : true
    });

    useEffect(() => {
        setFormData({
            code: code.code,
            discountType: code.discountType || "percentage",
            value: code.value || 10.0,
            minPurchase: code.minPurchase || 0.0,
            validUntil: code.validUntil ? new Date(code.validUntil.seconds * 1000).toISOString().split('T')[0] : "",
            usageLimit: code.usageLimit || "",
            description: code.description || "",
            active: code.active !== undefined ? code.active : true
        });
    }, [code]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit({
            discountType: formData.discountType,
            value: parseFloat(formData.value),
            minPurchase: parseFloat(formData.minPurchase),
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
            description: formData.description,
            active: formData.active
        });
    };

    return (
        <div className="card shadow">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0">Editar Código de Descuento: {code.code}</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Tipo de descuento *</label>
                            <select
                                className="form-select"
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                            >
                                <option value="percentage">Porcentaje</option>
                                <option value="fixed">Monto fijo</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {formData.discountType === "percentage" ? "Valor (%) *" : "Monto de descuento *"}
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Mínimo de compra</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.minPurchase}
                                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                min="0"
                                step="0.01"
                                placeholder="0 = sin mínimo"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Fecha de expiración</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Límite de usos</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.usageLimit}
                                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                min="1"
                                placeholder="Dejar vacío para ilimitado"
                            />
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">Descripción</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ej: 15.5% de descuento en verano"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="activeSwitch"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="activeSwitch">
                                    Código activo
                                </label>
                            </div>
                        </div>

                        <div className="col-12">
                            <button type="submit" className="btn btn-primary me-2">
                                Guardar Cambios
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDiscountCode;