import { useState } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const CreateDiscountCode = () => {
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage",
        value: 10,
        minPurchase: 0,
        validUntil: "",
        usageLimit: 100,
        description: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const db = getFirestore();
            const discountRef = doc(db, "discountCodes", formData.code.toUpperCase());

            const discountData = {
                code: formData.code.toUpperCase(),
                discountType: formData.discountType,
                value: Number(formData.value),
                minPurchase: Number(formData.minPurchase),
                usageLimit: Number(formData.usageLimit),
                timesUsed: 0,
                active: true,
                description: formData.description,
                createdAt: new Date()
            };

            if (formData.validUntil) {
                discountData.validUntil = new Date(formData.validUntil);
            }

            await setDoc(discountRef, discountData);
            alert("Código de descuento creado exitosamente!");
            setFormData({
                code: "",
                discountType: "percentage",
                value: 10,
                minPurchase: 0,
                validUntil: "",
                usageLimit: 100,
                description: ""
            });

        } catch (error) {
            console.error("Error creando código de descuento:", error);
            alert("Error al crear el código de descuento");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Crear Código de Descuento</h2>
            <form onSubmit={handleSubmit} className="mt-3">
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
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Valor (%) *</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            min="1"
                            max="100"
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
                            placeholder="100"
                        />
                    </div>

                    <div className="col-12 mb-3">
                        <label className="form-label">Descripción</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ej: 15% de descuento en verano"
                        />
                    </div>

                    <div className="col-12">
                        <button type="submit" className="btn btn-primary">
                            Crear Código de Descuento
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateDiscountCode;