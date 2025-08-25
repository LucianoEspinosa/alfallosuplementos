import { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

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
        presentacion: '',
        stock: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prevProducto) => ({
            ...prevProducto,
            [name]: value
        }));
    };

    const agregarProducto = async () => {
        try {
            const fraganciasCollection = collection(db, 'fragancias');
            await addDoc(fraganciasCollection, nuevoProducto);
            console.log('Nuevo producto agregado a Firestore');
            setNuevoProducto({
                categoria: '',
                descripcion: '',
                descuento: 0,
                img: '',
                marca: '',
                nombre: '',
                precio: 0,
                presentacion: '',
                stock: 0
            });
        } catch (error) {
            console.error('Error al agregar el producto a Firestore', error);
        }
    };

    return (
        <div className='container py-5'>
            <h1 className='row'>Agregar Producto</h1>
            <form className='row'>
                <div className="mb-3 col-md-6">
                    <label htmlFor="marca" className="form-label">Marca:</label>
                    <input type="text" className="form-control" id="marca" name="marca" value={nuevoProducto.marca} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="nombre" className="form-label">Nombre:</label>
                    <input type="text" className="form-control" id="nombre" name="nombre" value={nuevoProducto.nombre} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6 ">
                    <label htmlFor="precio" className="form-label">Precio:</label>
                    <input type="number" className="form-control" id="precio" name="precio" value={nuevoProducto.precio} onChange={handleInputChange} />
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="descuento" className="form-label">Descuento:</label>
                    <input type="number" className="form-control" id="descuento" name="descuento" value={nuevoProducto.descuento} onChange={handleInputChange} />
                </div>
                <div className='col-md-6'>
                <label htmlFor="categoria" className="form-label">Categoria:</label>
                    <select className="form-select" id="categoria" name="categoria" value={nuevoProducto.categoria} onChange={handleInputChange}>
                        <option value="">Seleccionar categoría</option>
                        <option value="proteinas">Proteinas</option>
                        <option value="creatinas">Creatinas</option>
                        <option value="magnesio">Magnesio</option>
                        <option value="ganadordepeso">Ganadores de Peso</option>
                        <option value="aminoacidos">Aminoacidos</option>
                        <option value="quemadores">Quemadores</option>
                    </select>
                </div>
                <div className="mb-3 col-md-6">
                    <label htmlFor="presentacion" className="form-label">Presentación:</label>
                    <input type="text" className="form-control" id="presentacion" name="presentacion" value={nuevoProducto.presentacion} onChange={handleInputChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción:</label>
                    <textarea className="form-control" id="descripcion" name="descripcion" value={nuevoProducto.descripcion} onChange={handleInputChange} />
                </div>

                <div className="mb-3">
                    <label htmlFor="img" className="form-label">Imagen:</label>
                    <input type="text" className="form-control" id="img" name="img" value={nuevoProducto.img} onChange={handleInputChange} />
                </div>



                <div className="mb-3 col-md-3 offset-md-9">
                    <label htmlFor="stock" className="form-label">Stock:</label>
                    <input type="number" className="form-control" id="stock" name="stock" value={nuevoProducto.stock} onChange={handleInputChange} />
                </div>
                <button type="button" className="btn btn-primary col-md-3" onClick={agregarProducto}>Enviar</button>
                <Link to="/admin" className="btn btn-primary col-md-3 offset-md-6">Regresar</Link>
            </form>
        </div>
    );
};

export default AddProduct;
