// import { useState, useEffect } from "react";
// import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
// import { Link } from "react-router-dom";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

// const AdminEjercicios = () => {
//     const db = getFirestore();
//     const [ejercicios, setEjercicios] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchEjercicios = async () => {
//             setLoading(true);
//             try {
//                 const ejerciciosCollection = collection(db, "ejercicios");
//                 const snapshot = await getDocs(ejerciciosCollection);
//                 const ejerciciosList = snapshot.docs.map(doc => ({
//                     id: doc.id,
//                     ...doc.data()
//                 }));
//                 setEjercicios(ejerciciosList);
//             } catch (error) {
//                 console.error("Error al cargar los ejercicios:", error);
//                 toast.error("Error al cargar los ejercicios.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchEjercicios();
//     }, [db]);

//     const eliminarEjercicio = async (id, nombre) => {
//         const confirmacion = window.confirm(`¿Estás seguro de que quieres eliminar el ejercicio "${nombre}"?`);
//         if (!confirmacion) return;

//         try {
//             await deleteDoc(doc(db, "ejercicios", id));
//             setEjercicios(ejercicios.filter(ej => ej.id !== id));
//             toast.success("¡Ejercicio eliminado con éxito!");
//         } catch (error) {
//             console.error("Error al eliminar el ejercicio:", error);
//             toast.error("Error al eliminar el ejercicio.");
//         }
//     };

//     if (loading) {
//         return <div className="container py-5 text-center">Cargando ejercicios...</div>;
//     }

//     return (
//         <div className="container py-5">
//             <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
//             <div className="row text-center text-md-start mb-4">
//                 <h1>Administrar Ejercicios</h1>
//                 <hr/>
//             </div>
//             <div className="d-flex justify-content-end mb-4">
//                 <Link to="/agregar-ejercicio" className="btn btn-success">
//                     + Agregar Nuevo Ejercicio
//                 </Link>
//             </div>
//             <div className="card">
//                 <div className="card-header bg-info text-white">
//                     <h5>Lista de todos los ejercicios</h5>
//                 </div>
//                 <ul className="list-group list-group-flush">
//                     {ejercicios.length > 0 ? (
//                         ejercicios.map(ejercicio => (
//                             <li key={ejercicio.id} className="list-group-item d-flex justify-content-between align-items-center">
//                                 <div>
//                                     <h6 className="mb-0">{ejercicio.nombre}</h6>
//                                     <small className="text-muted">Categoría: {ejercicio.categoria}</small>
//                                 </div>
//                                 <div>
//                                     <Link
//                                         to={`/editar-ejercicio/${ejercicio.id}`}
//                                         className="btn btn-sm btn-outline-warning me-2"
//                                     >
//                                         <FontAwesomeIcon icon={faEdit} />
//                                     </Link>
//                                     <button
//                                         type="button"
//                                         className="btn btn-sm btn-outline-danger"
//                                         onClick={() => eliminarEjercicio(ejercicio.id, ejercicio.nombre)}
//                                     >
//                                         <FontAwesomeIcon icon={faTrashAlt} />
//                                     </button>
//                                 </div>
//                             </li>
//                         ))
//                     ) : (
//                         <li className="list-group-item text-center text-muted">No hay ejercicios cargados.</li>
//                     )}
//                 </ul>
//             </div>
//             <div className="d-flex justify-content-center mt-4">
//                 <Link to="/admin" className="btn btn-primary">← Volver al Panel de Administración</Link>
//             </div>
//         </div>
//     );
// };

// export default AdminEjercicios;
import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const AdminEjercicios = () => {
    const db = getFirestore();
    const [ejercicios, setEjercicios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEjercicios = async () => {
            setLoading(true);
            try {
                const ejerciciosCollection = collection(db, "ejercicios");
                const snapshot = await getDocs(ejerciciosCollection);
                const ejerciciosList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEjercicios(ejerciciosList);
            } catch (error) {
                console.error("Error al cargar los ejercicios:", error);
                toast.error("Error al cargar los ejercicios.");
            } finally {
                setLoading(false);
            }
        };
        fetchEjercicios();
    }, [db]);

    const eliminarEjercicio = async (id, nombre) => {
        const confirmacion = window.confirm(`¿Estás seguro de que quieres eliminar el ejercicio "${nombre}"?`);
        if (!confirmacion) return;

        try {
            await deleteDoc(doc(db, "ejercicios", id));
            setEjercicios(ejercicios.filter(ej => ej.id !== id));
            toast.success("¡Ejercicio eliminado con éxito!");
        } catch (error) {
            console.error("Error al eliminar el ejercicio:", error);
            toast.error("Error al eliminar el ejercicio.");
        }
    };

    if (loading) {
        return <div className="container py-5 text-center">Cargando ejercicios...</div>;
    }

    return (
        <div className="container py-5">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="row text-center text-md-start mb-4">
                <h1>Administrar Ejercicios</h1>
                <hr/>
            </div>
            <div className="d-flex justify-content-end mb-4">
                <Link to="/agregar-ejercicio" className="btn btn-success">
                    + Agregar Nuevo Ejercicio
                </Link>
            </div>
            <div className="card">
                <div className="card-header bg-info text-white">
                    <h5>Lista de todos los ejercicios</h5>
                </div>
                <ul className="list-group list-group-flush">
                    {ejercicios.length > 0 ? (
                        ejercicios.map(ejercicio => (
                            <li key={ejercicio.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    {ejercicio.imagen ? (
                                        <img src={ejercicio.imagen} alt={ejercicio.nombre} className="img-thumbnail me-3" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                    ) : (
                                        <div className="me-3" style={{ width: '60px', height: '60px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '0.7rem', textAlign: 'center' }}>
                                            Sin Imagen
                                        </div>
                                    )}
                                    <div>
                                        <h6 className="mb-0">{ejercicio.nombre}</h6>
                                        <small className="text-muted d-block">Región: {ejercicio.region_cuerpo}</small>
                                        <small className="text-muted d-block">Grupo: {ejercicio.grupo_muscular}</small>
                                    </div>
                                </div>
                                <div>
                                    <Link
                                        to={`/editar-ejercicio/${ejercicio.id}`}
                                        className="btn btn-sm btn-outline-warning me-2"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Link>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => eliminarEjercicio(ejercicio.id, ejercicio.nombre)}
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item text-center text-muted">No hay ejercicios cargados.</li>
                    )}
                </ul>
            </div>
            <div className="d-flex justify-content-center mt-4">
                <Link to="/admin" className="btn btn-primary">← Volver al Panel de Administración</Link>
            </div>
        </div>
    );
};

export default AdminEjercicios;