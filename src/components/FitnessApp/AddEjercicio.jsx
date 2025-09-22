// import { useState } from 'react';
// import { getFirestore, collection, addDoc } from 'firebase/firestore';
// import { Link, Navigate } from 'react-router-dom';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const AddEjercicio = () => {
//     const db = getFirestore();
//     const [nuevoEjercicio, setNuevoEjercicio] = useState({
//         nombre: "",
//         descripcion: "",
//         imagen: "",
//         video: "",
//         categoria: ""
//     });
//     const [added, setAdded] = useState(false);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setNuevoEjercicio(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const agregarEjercicio = async (e) => {
//         e.preventDefault();

//         if (!nuevoEjercicio.nombre.trim() || !nuevoEjercicio.categoria) {
//             toast.error("Nombre y Categoría son obligatorios.");
//             return;
//         }

//         try {
//             const ejerciciosCollection = collection(db, 'ejercicios');
//             await addDoc(ejerciciosCollection, nuevoEjercicio);
//             toast.success("¡Ejercicio agregado con éxito!");
//             setAdded(true);
//         } catch (error) {
//             console.error("Error al agregar el ejercicio:", error);
//             toast.error("Error al agregar el ejercicio.");
//         }
//     };

//     if (added) return <Navigate to="/admin-ejercicios" />;

//     return (
//         <div className="container py-5">
//             <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
//             <div className="row text-center text-md-start">
//                 <h1>Agregar Nuevo Ejercicio</h1>
//             </div>
//             <form onSubmit={agregarEjercicio} className="row justify-content-center my-3">
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="nombre" className="form-label">Nombre:</label>
//                     <input type="text" className="form-control" id="nombre" name="nombre" value={nuevoEjercicio.nombre} onChange={handleInputChange} required />
//                 </div>
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="categoria" className="form-label">Categoría:</label>
//                     <input type="text" className="form-control" id="categoria" name="categoria" value={nuevoEjercicio.categoria} onChange={handleInputChange} required />
//                 </div>
//                 <div className="mb-3 col-12">
//                     <label htmlFor="descripcion" className="form-label">Descripción:</label>
//                     <textarea className="form-control" id="descripcion" name="descripcion" value={nuevoEjercicio.descripcion} onChange={handleInputChange} />
//                 </div>
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="imagen" className="form-label">URL de la Imagen:</label>
//                     <input type="url" className="form-control" id="imagen" name="imagen" value={nuevoEjercicio.imagen} onChange={handleInputChange} />
//                 </div>
//                 <div className="mb-3 col-md-6">
//                     <label htmlFor="video" className="form-label">URL del Video:</label>
//                     <input type="url" className="form-control" id="video" name="video" value={nuevoEjercicio.video} onChange={handleInputChange} />
//                 </div>
//                 <div className="col-md-6 d-flex justify-content-between mt-4">
//                     <button type="submit" className="btn btn-success">
//                         Agregar Ejercicio
//                     </button>
//                     <Link to="/adminexercises" className="btn btn-primary">
//                         ← Regresar
//                     </Link>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddEjercicio;

import { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Link, Navigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddEjercicio = () => {
    const db = getFirestore();
    const [nuevoEjercicio, setNuevoEjercicio] = useState({
        nombre: "",
        descripcion: "",
        grupo_muscular: "",
        region_cuerpo: "",
        imagen: "",
        video: ""
    });
    const [added, setAdded] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoEjercicio(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const agregarEjercicio = async (e) => {
        e.preventDefault();

        if (!nuevoEjercicio.nombre.trim() || !nuevoEjercicio.grupo_muscular || !nuevoEjercicio.region_cuerpo) {
            toast.error("Nombre, Grupo Muscular y Región son obligatorios.");
            return;
        }

        try {
            const ejerciciosCollection = collection(db, "ejercicios");
            await addDoc(ejerciciosCollection, nuevoEjercicio);
            
            toast.success("¡Ejercicio agregado con éxito!");
            setAdded(true);

        } catch (error) {
            console.error("Error al agregar el ejercicio:", error);
            toast.error("Error al agregar el ejercicio.");
        }
    };

    if (added) return <Navigate to="/admin-ejercicios" />;

    return (
        <div className="container py-5">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="row text-center text-md-start">
                <h1>Agregar Nuevo Ejercicio</h1>
            </div>
            <form onSubmit={agregarEjercicio} className="row justify-content-center my-3">
                <div className="mb-3 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" value={nuevoEjercicio.nombre} onChange={handleInputChange} required />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="region_cuerpo" className="form-label">Región del cuerpo:</label>
                    <select className="form-select" id="region_cuerpo" name="region_cuerpo" value={nuevoEjercicio.region_cuerpo} onChange={handleInputChange} required>
                        <option value="">Seleccionar región</option>
                        <option value="Tren superior">Tren superior</option>
                        <option value="Tren inferior">Tren inferior</option>
                        <option value="Core">Core</option>
                    </select>
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="grupo_muscular" className="form-label">Grupo muscular:</label>
                    <select className="form-select" id="grupo_muscular" name="grupo_muscular" value={nuevoEjercicio.grupo_muscular} onChange={handleInputChange} required>
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
                    <textarea className="form-control" id="descripcion" name="descripcion" value={nuevoEjercicio.descripcion} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="imagen" className="form-label">URL de la Imagen:</label>
                    <input type="url" className="form-control" id="imagen" name="imagen" value={nuevoEjercicio.imagen} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="video" className="form-label">URL del Video:</label>
                    <input type="url" className="form-control" id="video" name="video" value={nuevoEjercicio.video} onChange={handleInputChange} />
                </div>
                <div className="col-md-6 d-flex justify-content-between mt-4">
                    <button type="submit" className="btn btn-success">
                        Agregar Ejercicio
                    </button>
                    <Link to="/admin-ejercicios" className="btn btn-primary">
                        ← Regresar
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AddEjercicio;