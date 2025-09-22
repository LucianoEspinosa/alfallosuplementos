import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const ItemCount = ({ stock, onAdd }) => {

    const [items, setItems] = useState(1);
    const [itemStock, setItemStock] = useState(stock);
    const [itemAdded, setItemAdded] = useState(false);

    const sumarUnidad = () => {
        if (items < itemStock) {
            setItems(items + 1);
        }

    }
    const restarUnidad = () => {
        if (items > 1) {
            setItems(items - 1);
        }
    }

    const agregarAlCarrito = () => {
        if (items <= itemStock) {
            setItemStock(itemStock - items);
            setItems(1);
            setItemAdded(true);
            onAdd(items);
            console.log("Seleccionaste " + items + " productos al carrito!\nTe quedan: " + itemStock + " productos");
            
        }
    }
    useEffect(() => {
        setItemStock(stock);
    }, [stock])

    return (
        <div className="container my-3">
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <div className="btn-group" role="group" aria-label="Basic example">
                        <button type="button" className="btn btn-light card" onClick={restarUnidad}>-</button>
                        <button type="button" className="btn btn-light card">{items}</button>
                        <button type="button" className="btn btn-light card" onClick={sumarUnidad}>+</button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    {itemAdded ? (
                        <div><Link to={"/Cart"} className="btn btn-primary my-2">Finalizar Compra</Link>
                        <Link to={"/"} className=" d-block text-center mt-3"><span className="text-secondary text-decoration-underline vaciar">Volver a inicio</span></Link>
                        </div>
                    ) : (
                        <button type="button" className="btn btn-primary my-2" onClick={agregarAlCarrito}>Agregar al carrito</button>
                    )}
                </div>
            </div>
        </div>

    )
}

export default ItemCount;