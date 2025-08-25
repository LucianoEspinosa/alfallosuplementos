/*import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getDoc, doc, updateDoc, getFirestore } from "firebase/firestore";


const EditProduct = () => {
    const { id } = useParams();
    const [item, setItem] = useState({});
    const [updated, setUpdated] = useState(false);

    useEffect(() => {
        console.log("consultando");
        const db = getFirestore();
        const producto = doc(db, "fragancias", id);
        getDoc(producto).then(resultado => {
            if (resultado.exists()) {
                setItem({ id: resultado.id, ...resultado.data() })
            } else {
                console.error("Error! No se encontró el producto!");
            }
        });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setItem((prevItem) => ({
            ...prevItem,
            [name]: value
        }));
    };
    const actualizarProducto = () => {
        const db = getFirestore();
        const productoRef = doc(db, "fragancias", id);
        updateDoc(productoRef, item)
            .then(() => {
                console.log("Producto actualizado correctamente");
                setUpdated(true);
            })
            .catch((error) => {
                console.error("Error al actualizar el producto:", error);
            });
    };

    if (updated) {
        return <Navigate to="/admin" />;
    }
    return (
        <div className="container py-5">
            <div className="row text-center text-md-start"><h1 >Editar Producto</h1></div>
            <form className="row justify-content-center my-3">
                <div className="mb-3 col-md-6">
                    <label htmlFor="marca" className="form-label">Marca:</label>
                    <input type="text" className="form-control" id="marca" name="marca" value={item.marca || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" value={item.nombre || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-4">
                    <label htmlFor="precio" className="form-label">Precio:</label>
                    <input type="number" className="form-control" id="precio" name="precio" value={item.precio || 0} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-4">
                    <label htmlFor="precio" className="form-label">Costo:</label>
                    <input type="number" className="form-control" id="precio_costo" name="precio_costo" value={item.precio_costo || 0} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-4">
                    <label htmlFor="descuento" className="form-label">Descuento:</label>
                    <input type="number" className="form-control" id="descuento" name="descuento" value={item.descuento || 0} onChange={handleInputChange} />
                </div>
                <div className="col-md-6">
                    <label htmlFor="categoria" className="form-label">Categoría:</label>
                    <select className="form-select" id="categoria" name="categoria" value={item.categoria} onChange={handleInputChange}>
                        <option value="">Seleccionar categoría</option>
                        <option value="proteina">Proteínas</option>
                        <option value="creatina">Creatina</option>
                        <option value="aminoacidos">Aminoácidos</option>
                        <option value="preentreno">Pre-entreno</option>
                        <option value="intraentreno">Intra-entreno</option>
                        <option value="postentreno">Post-entreno</option>
                        <option value="ganadores">Ganadores de peso</option>
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
                        <option value="barritas">Barritas proteicas</option>
                        <option value="snacks">Snacks saludables</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="presentacion" className="form-label">Presentación:</label>
                    <input type="text" className="form-control" id="presentacion" name="presentacion" value={item.presentacion || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción:</label>
                    <textarea className="form-control" id="descripcion" name="descripcion" value={item.descripcion || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-8">
                    <label htmlFor="img" className="form-label">Imagen:</label>
                    <input type="text" className="form-control" id="img" name="img" value={item.img || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-3 offset-md-1 ">
                    <label htmlFor="stock" className="form-label">Stock:</label>
                    <input type="number" className="form-control" id="stock" name="stock" value={item.stock || 0} onChange={handleInputChange} />
                </div>
            </form>
            <button type="button" className="btn btn-success col-4 offset-1 col-md-2 offset-md-2" onClick={actualizarProducto}>Actualizar</button>
            <Link to="/admin" className="btn btn-primary col-4 offset-2 col-md-2 offset-md-4">Regresar</Link>
        </div>
    );
};

export default EditProduct;*/

import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getDoc, doc, updateDoc, getFirestore } from "firebase/firestore";

const EditProduct = () => {
    const { id } = useParams();
    const [item, setItem] = useState({ ganancia: 1.25 }); // Valor por defecto
    const [updated, setUpdated] = useState(false);
    const [autoCalculate, setAutoCalculate] = useState(true);

    useEffect(() => {
        const db = getFirestore();
        const producto = doc(db, "fragancias", id);
        getDoc(producto).then(resultado => {
            if (resultado.exists()) {
                const data = resultado.data();
                setItem({
                    id: resultado.id,
                    ganancia: data.ganancia || 1.25, // Usa el valor de Firestore o 1.25 por defecto
                    ...data
                });
            }
        });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setItem(prevItem => {
            const updatedItem = {
                ...prevItem,
                [name]: name === 'ganancia' ? parseFloat(value) : value
            };

            // Actualización automática del precio si cambia costo o ganancia
            if (autoCalculate && (name === 'precio_costo' || name === 'ganancia') && updatedItem.precio_costo) {
                updatedItem.precio = Math.round(updatedItem.precio_costo * (updatedItem.ganancia || 1.25));
            }

            return updatedItem;
        });
    };

    const toggleAutoCalculate = () => {
        setAutoCalculate(!autoCalculate);
        // Si se activa el cálculo automático, actualizar el precio
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
            <div className="row text-center text-md-start"><h1>Editar Producto</h1></div>
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
                        <option value="ganadores">Ganadores de peso</option>
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
                        <option value="barritas">Barritas proteicas</option>
                        <option value="snacks">Snacks saludables</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="otros">Otros</option>
                    </select>
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="presentacion" className="form-label">Presentación:</label>
                    <input type="text" className="form-control" id="presentacion" name="presentacion" value={item.presentacion || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción:</label>
                    <textarea className="form-control" id="descripcion" name="descripcion" value={item.descripcion || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-8">
                    <label htmlFor="img" className="form-label">Imagen:</label>
                    <input type="text" className="form-control" id="img" name="img" value={item.img || ""} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-3 offset-md-1 ">
                    <label htmlFor="stock" className="form-label">Stock:</label>
                    <input type="number" className="form-control" id="stock" name="stock" value={item.stock || 0} onChange={handleInputChange} />
                </div>
                {/* Sección de precios mejorada */}
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

                {/* Resto de los campos... */}
            </form>

            <div className="row justify-content-center mt-4">
                <div className="col-md-6 d-flex justify-content-between">
                    <button type="button" className="btn btn-success" onClick={actualizarProducto}>
                        Actualizar
                    </button>
                    <Link to="/admin" className="btn btn-primary">Regresar</Link>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
