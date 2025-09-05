

import { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Link, Navigate } from 'react-router-dom';

const AddProduct = () => {
    const db = getFirestore();
    const [nuevoProducto, setNuevoProducto] = useState({
        categoria: '',
        descripcion: '',
        descuento: 0,
        img: '',
        marca: '',
        nombre: '',
        precio: 0,
        precio_costo: 0,
        ganancia: 1.25,
        presentacion: '',
        stock: 0
    });
    const [autoCalculate, setAutoCalculate] = useState(true);
    const [added, setAdded] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setNuevoProducto(prevProducto => {
            const updatedProducto = {
                ...prevProducto,
                [name]: name === 'ganancia' || name === 'precio_costo' ? parseFloat(value) || 0 : value
            };

            // Actualización automática del precio si cambia costo o ganancia
            if (autoCalculate && (name === 'precio_costo' || name === 'ganancia') && updatedProducto.precio_costo) {
                updatedProducto.precio = Math.round(updatedProducto.precio_costo * (updatedProducto.ganancia || 1.25));
            }

            return updatedProducto;
        });
    };

    const toggleAutoCalculate = () => {
        setAutoCalculate(!autoCalculate);
        // Si se activa el cálculo automático, actualizar el precio
        if (!autoCalculate && nuevoProducto.precio_costo) {
            setNuevoProducto(prev => ({
                ...prev,
                precio: Math.round(prev.precio_costo * (prev.ganancia || 1.25))
            }));
        }
    };

    const agregarProducto = async () => {
        try {
            const fraganciasCollection = collection(db, 'fragancias');
            
            // Asegurar que el precio esté calculado si está en modo auto
            const productoParaGuardar = { ...nuevoProducto };
            if (autoCalculate && productoParaGuardar.precio_costo) {
                productoParaGuardar.precio = Math.round(productoParaGuardar.precio_costo * (productoParaGuardar.ganancia || 1.25));
            }

            await addDoc(fraganciasCollection, productoParaGuardar);
            console.log('Nuevo producto agregado a Firestore');
            setAdded(true);
            
        } catch (error) {
            console.error('Error al agregar el producto a Firestore', error);
        }
    };

    if (added) return <Navigate to="/admin" />;

    return (
        <div className='container py-5'>
            <div className="row text-center text-md-start">
                <h1>Agregar Producto</h1>
            </div>
            
            <form className="row justify-content-center my-3">
                {/* Información básica */}
                <div className="mb-3 col-md-6">
                    <label htmlFor="marca" className="form-label">Marca:</label>
                    <input type="text" className="form-control" id="marca" name="marca" value={nuevoProducto.marca} onChange={handleInputChange} required />
                </div>
                
                <div className="mb-3 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" value={nuevoProducto.nombre} onChange={handleInputChange} required />
                </div>

                <div className="mb-3 col-md-6">
                    <label htmlFor="presentacion" className="form-label">Presentación:</label>
                    <input type="text" className="form-control" id="presentacion" name="presentacion" value={nuevoProducto.presentacion} onChange={handleInputChange} required />
                </div>

                <div className="mb-3 col-md-6">
                    <label htmlFor="categoria" className="form-label">Categoría:</label>
                    <select className="form-select" id="categoria" name="categoria" value={nuevoProducto.categoria} onChange={handleInputChange} required>
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

                {/* Sección de precios */}
                <div className="mb-3 col-md-3">
                    <label className="form-label">Costo:</label>
                    <input
                        type="number"
                        className="form-control"
                        name="precio_costo"
                        value={nuevoProducto.precio_costo}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="mb-3 col-md-2">
                    <label className="form-label">Ganancia:</label>
                    <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="ganancia"
                        value={nuevoProducto.ganancia}
                        onChange={handleInputChange}
                        disabled={!autoCalculate}
                        min="1.0"
                    />
                </div>

                <div className="mb-3 col-md-3">
                    <label className="form-label">Precio Final:</label>
                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control"
                            name="precio"
                            value={nuevoProducto.precio}
                            onChange={handleInputChange}
                            disabled={autoCalculate}
                            min="0"
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
                            if (nuevoProducto.precio_costo) {
                                setNuevoProducto(prev => ({
                                    ...prev,
                                    precio: Math.round(prev.precio_costo * (prev.ganancia || 1.25))
                                }));
                            }
                        }}
                        disabled={autoCalculate}
                    >
                        Calcular
                    </button>
                </div>

                {/* Descuento y Stock */}
                <div className="mb-3 col-md-3">
                    <label htmlFor="descuento" className="form-label">Descuento (%):</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="descuento" 
                        name="descuento" 
                        value={nuevoProducto.descuento} 
                        onChange={handleInputChange} 
                        min="0" 
                        max="100" 
                    />
                </div>

                <div className="mb-3 col-md-3">
                    <label htmlFor="stock" className="form-label">Stock:</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="stock" 
                        name="stock" 
                        value={nuevoProducto.stock} 
                        onChange={handleInputChange} 
                        min="0" 
                    />
                </div>

                {/* Descripción e Imagen */}
                <div className="mb-3 col-md-8">
                    <label htmlFor="descripcion" className="form-label">Descripción:</label>
                    <textarea 
                        className="form-control" 
                        id="descripcion" 
                        name="descripcion" 
                        value={nuevoProducto.descripcion} 
                        onChange={handleInputChange} 
                        rows="3" 
                    />
                </div>

                <div className="mb-3 col-md-8">
                    <label htmlFor="img" className="form-label">URL de la Imagen:</label>
                    <input 
                        type="url" 
                        className="form-control" 
                        id="img" 
                        name="img" 
                        value={nuevoProducto.img} 
                        onChange={handleInputChange} 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                    />
                </div>

                {/* Botones */}
                <div className="col-md-8 d-flex justify-content-between gap-3">
                    <button 
                        type="button" 
                        className="btn btn-success flex-fill" 
                        onClick={agregarProducto}
                        disabled={!nuevoProducto.marca || !nuevoProducto.nombre || !nuevoProducto.categoria}
                    >
                        Agregar Producto
                    </button>
                    
                    <Link to="/admin" className="btn btn-secondary flex-fill">
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;