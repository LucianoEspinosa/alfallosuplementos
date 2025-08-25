import { Link } from "react-router-dom";

const Item = ({ item }) => {
    return (
        <div className="col-6 col-sm-6 col-lg-4 col-xl-3 d-flex justify-content-center mb-4">
            <Link to={"/item/" + item.id} className="text-decoration-none">
                <div className="d-flex flex-column align-items-center tarjeta h-100">
                    {/* Contenedor de imagen fijo */}
                    <div className="image-container" style={{ height: '150px', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            src={item.img} 
                            className="img-fluid product-image" 
                            alt={item.marca + " " + item.nombre}
                            style={{ 
                                maxHeight: '100%', 
                                maxWidth: '100%', 
                                objectFit: 'contain',
                                width: 'auto',
                                height: 'auto'
                            }} 
                        />
                    </div>
                    
                    <div className="card-content w-100 px-2 text-center">
                        <h2 className="card-title mb-1">{item.marca}</h2>
                        <h3 className="card-text mb-2">{item.nombre}</h3>
                        
                        <div className="estiloPresentacion d-flex justify-content-center align-items-center mx-auto mb-2">
                            <span className="card-presentacion">{item.presentacion}</span>
                        </div>
                        
                        {item.descuento > 0 ? (
                            <div className="d-flex flex-column align-items-center">
                                <div className="d-flex align-items-center mb-1">
                                    <h4 className="classPrecio">
                                        <span className="text-decoration-line-through text-secondary me-2">${item.precio}</span>
                                        <span className="text-danger fs-6">-{item.descuento}%</span>
                                    </h4>
                                </div>
                                <h4 className="classPrecio text-success">
                                    ${Math.round(item.precio - (item.precio * item.descuento) / 100)}
                                </h4>
                            </div>
                        ) : (
                            <h4 className="classPrecio">${item.precio}</h4>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default Item;