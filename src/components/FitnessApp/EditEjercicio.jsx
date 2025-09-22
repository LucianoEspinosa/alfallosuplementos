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
//         if (!ejercicio.nombre.trim()) {
//             toast.error("El nombre es obligatorio.");
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
//                     <Link to="/adminexercises" className="btn btn-primary">
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
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditEjercicio = () => {
    const { id } = useParams();
    const [ejercicio, setEjercicio] = useState(null);
    const [updated, setUpdated] = useState(false);
    const [loading, setLoading] = useState(true);

    const db = getFirestore();

    useEffect(() => {
        const fetchEjercicio = async () => {
            try {
                const docRef = doc(db, "ejercicios", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEjercicio(docSnap.data());
                } else {
                    console.log("No se encontró el ejercicio.");
                    setEjercicio(null);
                }
            } catch (error) {
                console.error("Error al cargar el ejercicio:", error);
                toast.error("Error al cargar el ejercicio.");
            } finally {
                setLoading(false);
            }
        };
        fetchEjercicio();
    }, [db, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEjercicio(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const actualizarEjercicio = async (e) => {
        e.preventDefault();
        if (!ejercicio.nombre.trim()) {
            toast.error("El nombre es obligatorio.");
            return;
        }

        try {
            const docRef = doc(db, "ejercicios", id);
            await updateDoc(docRef, ejercicio);
            toast.success("¡Ejercicio actualizado con éxito!");
            setUpdated(true);
        } catch (error) {
            console.error("Error al actualizar el ejercicio:", error);
            toast.error("Error al actualizar el ejercicio.");
        }
    };

    if (updated) return <Navigate to="/admin-ejercicios" />;
    if (loading) return <div className="container py-5 text-center">Cargando datos del ejercicio...</div>;
    if (!ejercicio) return <div className="container py-5 text-center">Ejercicio no encontrado.</div>;

    return (
        <div className="container py-5">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="row text-center text-md-start">
                <h1>Editar Ejercicio</h1>
            </div>
            <form onSubmit={actualizarEjercicio} className="row justify-content-center my-3">
                <div className="mb-3 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" value={ejercicio.nombre || ""} onChange={handleInputChange} required />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="region_cuerpo" className="form-label">Región del cuerpo:</label>
                    <select className="form-select" id="region_cuerpo" name="region_cuerpo" value={ejercicio.region_cuerpo} onChange={handleInputChange} required>
                        <option value="">Seleccionar región</option>
                        <option value="Tren superior">Tren superior</option>
                        <option value="Tren inferior">Tren inferior</option>
                        <option value="Core">Core</option>
                    </select>
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="grupo_muscular" className="form-label">Grupo muscular:</label>
                    <select className="form-select" id="grupo_muscular" name="grupo_muscular" value={ejercicio.grupo_muscular} onChange={handleInputChange} required>
                        <option value="">Seleccionar grupo</option>
                        <option value="Espalda">Espalda</option>
                        <option value="Pecho">Pecho</option>
                        <option value="Piernas">Piernas</option>
                        <option value="Hombros">Hombros</option>
                        <option value="Biceps">Bíceps</option>
                        <option value="Triceps">Tríceps</option>
                        <option value="Antebrazos">Antebrazos</option>
                        <option value="Zona media">Zona media</option>
                    </select>
                </div>
                <div className="mb-3 col-12">
                    <label htmlFor="descripcion" className="form-label">Descripción:</label>
                    <textarea className="form-control" id="descripcion" name="descripcion" value={ejercicio.descripcion || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="imagen" className="form-label">URL de la Imagen:</label>
                    <input type="url" className="form-control" id="imagen" name="imagen" value={ejercicio.imagen || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="video" className="form-label">URL del Video:</label>
                    <input type="url" className="form-control" id="video" name="video" value={ejercicio.video || ""} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 d-flex justify-content-between mt-4">
                    <button type="submit" className="btn btn-success">
                        Actualizar Ejercicio
                    </button>
                    <Link to="/admin-ejercicios" className="btn btn-primary">
                        ← Regresar
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditEjercicio;