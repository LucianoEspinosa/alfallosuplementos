import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { PiShoppingBagOpen } from 'react-icons/pi';
import { CartContext } from './context/CartContext';

// Botón de carrito del spec: af-btn af-btn-secondary af-btn-icon con el contador verde.
const CartWidget = () => {
    const { cartTotal } = useContext(CartContext);
    const cantidad = cartTotal();

    return (
        <Link to="/cart" className="af-btn af-btn-secondary af-btn-icon af-cartbtn" aria-label="Carrito">
            <PiShoppingBagOpen size={20} />
            {cantidad > 0 && <span className="af-cartbtn-count">{cantidad}</span>}
        </Link>
    );
};

export default CartWidget;
