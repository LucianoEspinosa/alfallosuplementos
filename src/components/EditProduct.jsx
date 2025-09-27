// import { useState, useEffect } from "react";
// import { useParams, Link, Navigate } from "react-router-dom";
// import { getDoc, doc, updateDoc } from "firebase/firestore";
// import { getFirestore } from "firebase/firestore";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const EditEjercicio = () => {
//     const { id } = useParams();
//     const [ejercicio, setEjercicio] = useState(null);
//     const [updated, setUpdated] = useState(false);
//     const [loading, setLoading] = useState(true);

//     const db = getFirestore();

//     useEffect(() => {
//         const fetchEjercicio = async () => {
//             try {
//                 const docRef = doc(db, "ejercicios", id);
//                 const docSnap = await getDoc(docRef);
//                 if (docSnap.exists()) {
//                     setEjercicio(docSnap.data());
//                 } else {
//                     console.log("No se encontró el ejercicio.");
//                     setEjercicio(null);
//                 }
//             } catch (error) {
//                 console.error("Error al cargar el ejercicio:", error);
//                 toast.error("Error al cargar el ejercicio.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchEjercicio();
//     }, [db, id]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setEjercicio(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const actualizarEjercicio = async (e) => {
//         e.preventDefault();
//         if (!ejercicio.nombre.trim() || !ejercicio.categoria) {
//             toast.error("Nombre y Categoría son obligatorios.");
//             return;
//         }

//         try {
//             const docRef = doc(db, "ejercicios", id);
//             await updateDoc(docRef, ejercicio);
//             toast.success("¡Ejercicio actualizado con éxito!");
//             setUpdated(true);
//         } catch (error) {
//             console.error("Error al actualizar el ejercicio:", error);
//             toast.error("Error al actualizar el ejercicio.");
//         }
//     };

//     if (updated) return <Navigate to="/admin-ejercicios" />;
//     if (loading) return <div className="container py-5 text-center">Cargando datos del ejercicio...</div>;
//     if (!ejercicio) return <div className="container py-5 text-center">Ejercicio no encontrado.</div>;

//     return (
//         <div className="container py-5">
//             <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
//             <div className="row text-center text-md-start">
//                 <h1>Editar Ejercicio</h1>
//             </div>
//             <form onSubmit={actualizarEjercicio} className="row justify-content-center my-3">
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="nombre" className="form-label">Nombre:</label>
//                     <input type="text" className="form-control" id="nombre" name="nombre" value={ejercicio.nombre || ""} onChange={handleInputChange} required />
//                 </div>
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="categoria" className="form-label">Categoría:</label>
//                     <input type="text" className="form-control" id="categoria" name="categoria" value={ejercicio.categoria || ""} onChange={handleInputChange} required />
//                 </div>
//                 <div className="mb-3 col-12">
//                     <label htmlFor="descripcion" className="form-label">Descripción:</label>
//                     <textarea className="form-control" id="descripcion" name="descripcion" value={ejercicio.descripcion || ""} onChange={handleInputChange} />
//                 </div>
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="imagen" className="form-label">URL de la Imagen:</label>
//                     <input type="url" className="form-control" id="imagen" name="imagen" value={ejercicio.imagen || ""} onChange={handleInputChange} />
//                 </div>
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="video" className="form-label">URL del Video:</label>
//                     <input type="url" className="form-control" id="video" name="video" value={ejercicio.video || ""} onChange={handleInputChange} />
//                 </div>
//                 <div className="col-md-6 d-flex justify-content-between mt-4">
//                     <button type="submit" className="btn btn-success">
//                         Actualizar Ejercicio
//                     </button>
//                     <Link to="/admin-ejercicios" className="btn btn-primary">
//                         ← Regresar
//                     </Link>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditEjercicio;


import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getDoc, doc, updateDoc, getFirestore } from "firebase/firestore";

const EditProduct = () => {
    const { id } = useParams();
    const [item, setItem] = useState({ ganancia: 1.25, sabores: [] });
    const [updated, setUpdated] = useState(false);
    const [autoCalculate, setAutoCalculate] = useState(true);
    const [nuevoSabor, setNuevoSabor] = useState("");

    useEffect(() => {
        const db = getFirestore();
        const producto = doc(db, "fragancias", id);
        getDoc(producto).then(resultado => {
            if (resultado.exists()) {
                const data = resultado.data();
                setItem({
                    id: resultado.id,
                    ganancia: data.ganancia || 1.25,
                    sabores: data.sabores || [], // Asegurar que sabores sea un array
                    ...data
                });
            }
        });
    }, [id]);

    // Función para agregar un nuevo sabor
    const agregarSabor = () => {
        if (nuevoSabor.trim() && !item.sabores.includes(nuevoSabor.trim())) {
            setItem(prev => ({
                ...prev,
                sabores: [...prev.sabores, nuevoSabor.trim()]
            }));
            setNuevoSabor("");
        }
    };

    // Función para eliminar un sabor
    const eliminarSabor = (index) => {
        setItem(prev => ({
            ...prev,
            sabores: prev.sabores.filter((_, i) => i !== index)
        }));
    };

    // Función para editar un sabor
    const editarSabor = (index, nuevoValor) => {
        if (nuevoValor.trim()) {
            setItem(prev => ({
                ...prev,
                sabores: prev.sabores.map((sabor, i) =>
                    i === index ? nuevoValor.trim() : sabor
                )
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setItem(prevItem => {
            const updatedItem = {
                ...prevItem,
                [name]: name === 'ganancia' ? parseFloat(value) : value
            };

            if (autoCalculate && (name === 'precio_costo' || name === 'ganancia') && updatedItem.precio_costo) {
                updatedItem.precio = Math.round(updatedItem.precio_costo * (updatedItem.ganancia || 1.25));
            }

            return updatedItem;
        });
    };

    const toggleAutoCalculate = () => {
        setAutoCalculate(!autoCalculate);
        if (!autoCalculate && item.precio_costo) {
            setItem(prev => ({
                ...prev,
                precio: Math.round(prev.precio_costo * (prev.ganancia || 1.25))
            }));
        }
    };

    const actualizarProducto = () => {
        const db = getFirestore();
        const productoRef = doc(db, "fragancias", id);
        updateDoc(productoRef, item)
            .then(() => setUpdated(true))
            .catch(console.error);
    };

    if (updated) return <Navigate to="/admin" />;

    return (
        <div className="container py-5">
            <div className="row text-center text-md-start">
                <h1>Editar Producto</h1>
            </div>

            <form className="row justify-content-center my-3">
                {/* Campos existentes... */}
                <div className="mb-3 col-md-6">
                    <label htmlFor="marca" className="form-label">Marca:</label>
                    <input type="text" className="form-control" id="marca" name="marca" value={item.marca || ""} onChange={handleInputChange} />
                </div>

                <div className="mb-3 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" value={item.nombre || ""} onChange={handleInputChange} />
                </div>

                {/* SECCIÓN DE SABORES */}
                <div className="col-12 mb-4">
                    <div className="card">
                        <div className="card-header bg-info text-white">
                            <h5 className="mb-0">🍦 Gestión de Sabores</h5>
                        </div>
                        <div className="card-body">
                            {/* Input para agregar nuevo sabor */}
                            <div className="row align-items-end mb-3">
                                <div className="col-md-8">
                                    <label className="form-label">Agregar sabor:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: Chocolate, Vainilla, Fresa..."
                                        value={nuevoSabor}
                                        onChange={(e) => setNuevoSabor(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarSabor())}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        onClick={agregarSabor}
                                        disabled={!nuevoSabor.trim()}
                                    >
                                        + Agregar Sabor
                                    </button>
                                </div>
                            </div>

                            {/* Lista de sabores */}
                            {item.sabores && item.sabores.length > 0 ? (
                                <div className="mt-3">
                                    <h6 className="mb-3">Sabores actuales:</h6>
                                    <div className="row">
                                        {item.sabores.map((sabor, index) => (
                                            <div key={index} className="col-md-3 mb-2">
                                                <div className="card">
                                                    <div className="card-body py-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="flex-grow-1">{sabor}</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => eliminarSabor(index)}
                                                                title="Eliminar sabor"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3">
                                        <small className="text-muted">
                                            {item.sabores.length} sabor(es) configurado(s)
                                        </small>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-3">
                                    <p className="text-muted mb-0">No hay sabores configurados para este producto</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resto de los campos del producto */}
                <div className="mb-3 col-md-4">
                    <label htmlFor="descuento" className="form-label">Descuento:</label>
                    <input type="number" className="form-control" id="descuento" name="descuento" value={item.descuento || 0} onChange={handleInputChange} />
                </div>

                

                <div className="col-md-6">
                    <label htmlFor="categoria" className="form-label">Categoría:</label>
                    <select className="form-select" id="categoria" name="categoria" value={item.categoria} onChange={handleInputChange}>
                        <option value="">Seleccionar categoría</option>
                        <option value="proteinas">Proteínas</option>
                        <option value="creatina">Creatina</option>
                        <option value="aminoacidos">Aminoácidos</option>
                        <option value="preentreno">Pre-entreno</option>
                        <option value="intraentreno">Intra-entreno</option>
                        <option value="postentreno">Post-entreno</option>
                        <option value="ganadores de masa">Ganadores de masa</option>
                        <option value="quemadores">Quemadores</option>
                        <option value="termogenicos">Termogénicos</option>
                        <option value="magnesio">Magnesio</option>
                        <option value="glutamina">Glutamina</option>
                        <option value="vitaminas">Vitaminas</option>
                        <option value="minerales">Minerales</option>
                        <option value="omega">Omega 3/6/9</option>
                        <option value="colageno">Colágeno</option>
                        <option value="energeticos">Energéticos</option>
                        <option value="electrolitos">Electrolitos</option>
                        <option value="carbohidratos">Carbohidratos</option>
                        <option value="barras proteicas">Barritas proteicas</option>
                        <option value="snacks">Snacks saludables</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="oxido nitrico">Óxido nítrico</option>
                        <option value="pre-workout">Pre-workout</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>

                <div className="mb-3 col-md-6">
                    <label htmlFor="presentacion" className="form-label">Presentación:</label>
                    <input type="text" className="form-control" id="presentacion" name="presentacion" value={item.presentacion || ""} onChange={handleInputChange} />
                </div>

                <div className="mb-3 col-12">
                    <label htmlFor="descripcion" className="form-label">Descripción:</label>
                    <textarea className="form-control" id="descripcion" name="descripcion" value={item.descripcion || ""} onChange={handleInputChange} />
                </div>

                <div className="mb-3 col-md-8">
                    <label htmlFor="img" className="form-label">Imagen:</label>
                    <input type="text" className="form-control" id="img" name="img" value={item.img || ""} onChange={handleInputChange} />
                </div>

                <div className="mb-3 col-md-3 offset-md-1">
                    <label htmlFor="stock" className="form-label">Stock:</label>
                    <input type="number" className="form-control" id="stock" name="stock" value={item.stock || 0} onChange={handleInputChange} />
                </div>

                {/* Sección de precios */}
                <div className="mb-3 col-md-3">
                    <label className="form-label">Costo:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="precio_costo"
                        value={item.precio_costo || 0}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="mb-3 col-md-2">
                    <label className="form-label">Ganancia:</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="ganancia"
                        value={item.ganancia || 1.25}
                        onChange={handleInputChange}
                        disabled={!autoCalculate}
                    />
                </div>

                <div className="mb-3 col-md-3">
                    <label className="form-label">Precio:</label>
                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control"
                            name="precio"
                            value={item.precio || 0}
                            onChange={handleInputChange}
                            disabled={autoCalculate}
                        />
                        <span className="input-group-text">
                            {autoCalculate ? 'Auto' : 'Manual'}
                        </span>
                    </div>
                </div>

                <div className="mb-3 col-md-2 d-flex align-items-end">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={autoCalculate}
                            onChange={toggleAutoCalculate}
                        />
                        <label className="form-check-label">Auto</label>
                    </div>
                </div>

                <div className="mb-3 col-md-2 d-flex align-items-end">
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                            if (item.precio_costo) {
                                setItem(prev => ({
                                    ...prev,
                                    precio: Math.round(prev.precio_costo * (prev.ganancia || 1.25))
                                }));
                            }
                        }}
                        disabled={autoCalculate}
                    >
                        Recalcular
                    </button>
                </div>
            </form>

            <div className="row justify-content-center mt-4">
                <div className="col-md-6 d-flex justify-content-between">
                    <button type="button" className="btn btn-success" onClick={actualizarProducto}>
                        💾 Actualizar Producto
                    </button>
                    <Link to="/admin" className="btn btn-primary">← Regresar</Link>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;