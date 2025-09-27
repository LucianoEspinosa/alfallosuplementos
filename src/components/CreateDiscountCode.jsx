// import { useState } from "react";

// const CreateDiscountCode = ({ onSubmit, onCancel }) => {
//     const [formData, setFormData] = useState({
//         code: "",
//         discountType: "percentage",
//         value: 10.0,
//         minPurchase: 0.0,
//         validUntil: "",
//         usageLimit: "",
//         description: ""
//     });

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const success = await onSubmit({
//             ...formData,
//             value: parseFloat(formData.value),
//             minPurchase: parseFloat(formData.minPurchase),
//             usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
//             validUntil: formData.validUntil ? new Date(formData.validUntil) : null
//         });
        
//         if (success) {
//             setFormData({
//                 code: "",
//                 discountType: "percentage",
//                 value: 10.0,
//                 minPurchase: 0.0,
//                 validUntil: "",
//                 usageLimit: "",
//                 description: ""
//             });
//         }
//     };

//     return (
//         <div className="card shadow">
//             <div className="card-header bg-white py-3">
//                 <h5 className="mb-0">Crear Código de Descuento</h5>
//             </div>
//             <div className="card-body">
//                 <form onSubmit={handleSubmit}>
//                     <div className="row">
//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Código *</label>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 value={formData.code}
//                                 onChange={(e) => setFormData({ ...formData, code: e.target.value })}
//                                 required
//                                 placeholder="Ej: VERANO15"
//                             />
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Tipo de descuento *</label>
//                             <select
//                                 className="form-select"
//                                 value={formData.discountType}
//                                 onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
//                             >
//                                 <option value="percentage">Porcentaje</option>
//                                 <option value="fixed">Monto fijo</option>
//                             </select>
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">
//                                 {formData.discountType === "percentage" ? "Valor (%) *" : "Monto de descuento *"}
//                             </label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={formData.value}
//                                 onChange={(e) => setFormData({ ...formData, value: e.target.value })}
//                                 min="0.01"
//                                 step="0.01"
//                                 required
//                                 placeholder={formData.discountType === "percentage" ? "15.5" : "50.99"}
//                             />
//                             <div className="form-text">
//                                 {formData.discountType === "percentage" 
//                                     ? "Ej: 15.5 para 15.5% de descuento" 
//                                     : "Ej: 50.99 para $50.99 de descuento"}
//                             </div>
//                         </div>

//                         <div className="col-md-6 mb-3">
//                             <label className="form-label">Mínimo de compra</label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={formData.minPurchase}
//                                 onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
//                                 min="0"
//                                 step="0.01"
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
//                                 placeholder="Ej: 15.5% de descuento en verano"
//                             />
//                         </div>

//                         <div className="col-12">
//                             <button type="submit" className="btn btn-primary me-2">
//                                 Crear Código
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

// export default CreateDiscountCode;

import { useState } from "react";

const CreateDiscountCode = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        value: 10.0,
        minPurchase: 0.0,
        validUntil: "",
        usageLimit: "",
        description: "",
        firstPurchaseOnly: false // Nuevo campo
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await onSubmit({
            ...formData,
            value: parseFloat(formData.value),
            minPurchase: parseFloat(formData.minPurchase),
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
            firstPurchaseOnly: formData.firstPurchaseOnly // Incluir el nuevo campo
        });
        
        if (success) {
            setFormData({
                code: "",
                discountType: "percentage",
                value: 10.0,
                minPurchase: 0.0,
                validUntil: "",
                usageLimit: "",
                description: "",
                firstPurchaseOnly: false
            });
        }
    };

    return (
        <div className="card shadow">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0">Crear Código de Descuento</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Código *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                                placeholder="Ej: VERANO15"
                            />
                        </div>

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
                                placeholder={formData.discountType === "percentage" ? "15.5" : "50.99"}
                            />
                            <div className="form-text">
                                {formData.discountType === "percentage" 
                                    ? "Ej: 15.5 para 15.5% de descuento" 
                                    : "Ej: 50.99 para $50.99 de descuento"}
                            </div>
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

                        {/* NUEVO CAMPO - Solo primera compra */}
                        <div className="col-md-6 mb-3">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="firstPurchaseSwitch"
                                    checked={formData.firstPurchaseOnly}
                                    onChange={(e) => setFormData({ ...formData, firstPurchaseOnly: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="firstPurchaseSwitch">
                                    Solo primera compra
                                </label>
                            </div>
                            <div className="form-text">
                                Solo aplicable si es la primera compra del cliente
                            </div>
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

                        <div className="col-12">
                            <button type="submit" className="btn btn-primary me-2">
                                Crear Código
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

export default CreateDiscountCode;