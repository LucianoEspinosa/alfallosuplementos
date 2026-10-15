import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PiShoppingCart } from 'react-icons/pi';
import { CartContext } from './context/CartContext';

// Botón de carrito del spec: af-btn af-btn-secondary af-btn-icon con el contador verde.
// Cuando se agrega un producto (sube la cantidad) el ícono rebota, el contador salta y hay un destello verde.
const CartWidget = () => {
    const { cartTotal } = useContext(CartContext);
    const cantidad = cartTotal();
    const anterior = useRef(cantidad);
    const [rebote, setRebote] = useState(0);

    useEffect(() => {
        if (cantidad > anterior.current) setRebote((n) => n + 1);
        anterior.current = cantidad;
    }, [cantidad]);

    return (
        <Link
            key={rebote}
            to="/cart"
            className={`af-btn af-btn-secondary af-btn-icon af-cartbtn ${rebote ? "is-bump" : ""}`}
            aria-label={`Carrito${cantidad > 0 ? ` (${cantidad})` : ""}`}
        >
            <PiShoppingCart size={20} className="af-cartbtn-icon" />
            {cantidad > 0 && <span className="af-cartbtn-count">{cantidad}</span>}
        </Link>
    );
};

export default CartWidget;
