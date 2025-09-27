import { useState, useEffect } from "react";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import DiscountCodeList from "./DiscountCodeList";
import CreateDiscountCode from "./CreateDiscountCode";
import EditDiscountCode from "./EditDiscountCode";

const DiscountCodeManager = () => {
    const [view, setView] = useState("list"); // "list", "create", "edit"
    const [discountCodes, setDiscountCodes] = useState([]);
    const [selectedCode, setSelectedCode] = useState(null);
    const [loading, setLoading] = useState(true);

    const db = getFirestore();

    // Cargar todos los códigos de descuento
    const loadDiscountCodes = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "discountCodes"));
            const codes = [];
            querySnapshot.forEach((doc) => {
                codes.push({ id: doc.id, ...doc.data() });
            });
            setDiscountCodes(codes);
        } catch (error) {
            console.error("Error cargando códigos de descuento:", error);
            alert("Error al cargar los códigos de descuento");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDiscountCodes();
    }, []);

    // Función para crear un nuevo código
    const handleCreateCode = async (codeData) => {
        try {
            const discountRef = doc(db, "discountCodes", codeData.code.toUpperCase());
            await setDoc(discountRef, {
                ...codeData,
                value: parseFloat(codeData.value),
                minPurchase: parseFloat(codeData.minPurchase),
                timesUsed: 0,
                active: true,
                createdAt: new Date()
            });
            await loadDiscountCodes();
            setView("list");
            return true;
        } catch (error) {
            console.error("Error creando código de descuento:", error);
            alert("Error al crear el código de descuento");
            return false;
        }
    };

    // Función para editar un código existente
    const handleEditCode = async (codeData) => {
        try {
            const discountRef = doc(db, "discountCodes", selectedCode.id);
            await updateDoc(discountRef, {
                ...codeData,
                value: parseFloat(codeData.value),
                minPurchase: parseFloat(codeData.minPurchase)
            });
            await loadDiscountCodes();
            setView("list");
            return true;
        } catch (error) {
            console.error("Error editando código de descuento:", error);
            alert("Error al editar el código de descuento");
            return false;
        }
    };

    // Función para eliminar un código
    const handleDeleteCode = async (codeId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este código de descuento?")) {
            try {
                await deleteDoc(doc(db, "discountCodes", codeId));
                await loadDiscountCodes();
            } catch (error) {
                console.error("Error eliminando código de descuento:", error);
                alert("Error al eliminar el código de descuento");
            }
        }
    };

    // Función para activar/desactivar un código
    const handleToggleCodeStatus = async (codeId, currentStatus) => {
        try {
            const discountRef = doc(db, "discountCodes", codeId);
            await updateDoc(discountRef, { active: !currentStatus });
            await loadDiscountCodes();
        } catch (error) {
            console.error("Error cambiando estado del código:", error);
            alert("Error al cambiar el estado del código");
        }
    };

    // Función para seleccionar un código para editar
    const handleSelectCode = (code) => {
        setSelectedCode(code);
        setView("edit");
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Códigos de Descuento</h2>
                <div>
                    {view !== "create" && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setView("create")}
                        >
                            <i className="fas fa-plus me-2"></i>Nuevo Código
                        </button>
                    )}
                    {view !== "list" && (
                        <button 
                            className="btn btn-secondary ms-2"
                            onClick={() => setView("list")}
                        >
                            <i className="fas fa-arrow-left me-2"></i>Volver
                        </button>
                    )}
                </div>
            </div>

            {view === "list" && (
                <DiscountCodeList 
                    discountCodes={discountCodes}
                    loading={loading}
                    onEditCode={handleSelectCode}
                    onDeleteCode={handleDeleteCode}
                    onToggleStatus={handleToggleCodeStatus}
                />
            )}

            {view === "create" && (
                <CreateDiscountCode 
                    onSubmit={handleCreateCode}
                    onCancel={() => setView("list")}
                />
            )}

            {view === "edit" && selectedCode && (
                <EditDiscountCode 
                    code={selectedCode}
                    onSubmit={handleEditCode}
                    onCancel={() => setView("list")}
                />
            )}
        </div>
    );
};

export default DiscountCodeManager;

