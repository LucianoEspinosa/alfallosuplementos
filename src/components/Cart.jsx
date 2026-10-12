import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PiArrowRight, PiShoppingBagOpen, PiTrash } from "react-icons/pi";
import { CartContext } from "./context/CartContext";
import CompraHeader from "./af/CompraHeader";
import ProductPhoto from "./af/ProductPhoto";
import { formatoPrecio, precioTransferencia, etiquetaCantidad } from "../utils/productos";

const Cart = () => {
    const { cart, cartTotal, precioTotal, removeItem, clear } = useContext(CartContext);
    const navigate = useNavigate();

    const volver = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    };

    if (cartTotal() === 0) {
        return (
            <div className="af-compra">
                <CompraHeader paso={0} onBack={volver} />
                <section className="af-cart-empty">
                    <div className="af-cart-empty-icon"><PiShoppingBagOpen size={26} /></div>
                    <h1 className="af-compra-title af-compra-title--empty">Tu carrito está vacío</h1>
                    <span className="af-cart-empty-text">No hay productos en el carrito.</span>
                    <div className="af-cart-empty-actions">
                        <Link to="/" className="af-btn af-btn-primary af-cart-empty-btn">Volver al inicio</Link>
                    </div>
                </section>
            </div>
        );
    }

    const total = precioTotal();

    return (
        <div className="af-compra">
            <CompraHeader paso={0} onBack={volver} />
            <div className="af-cart">
                <section className="af-cart-main">
                    <div className="af-compra-titles">
                        <h1 className="af-compra-title">Tu carrito</h1>
                        <span className="af-compra-count">{etiquetaCantidad(cartTotal())}</span>
                    </div>

                    <div className="af-cart-list">
                        {cart.map((item) => {
                            const subtotal = item.precioFinal * item.cantidad;
                            return (
                                <div key={item.id} className="af-cartitem">
                                    <div className="af-tile af-cartitem-thumb">
                                        <ProductPhoto img={item.img} marca={item.marca} nombre={item.nombre} variant="initial" />
                                    </div>
                                    <div className="af-cartitem-body">
                                        <div className="af-cartitem-top">
                                            <div className="af-cartitem-names">
                                                <span className="af-cartitem-brand">{item.marca}</span>
                                                <span className="af-cartitem-name">{item.nombre}</span>
                                            </div>
                                            <button type="button" className="af-cartitem-remove" onClick={() => removeItem(item.id)} aria-label="Eliminar producto" title="Eliminar producto">
                                                <PiTrash size={18} />
                                            </button>
                                        </div>
                                        <div className="af-cartitem-tags">
                                            {item.presentacion && <span className="af-cartitem-tag">{item.presentacion}</span>}
                                            {item.saborSeleccionado && <span className="af-cartitem-tag">{item.saborSeleccionado}</span>}
                                        </div>
                                        <div className="af-cartitem-bottom">
                                            <span className="af-cartitem-qty">{item.cantidad} × {formatoPrecio(item.precioFinal)}</span>
                                            <span className="af-cartitem-sub">{formatoPrecio(subtotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="af-cart-actions">
                        <Link to="/" className="af-btn af-btn-secondary af-cart-keep">Seguir comprando</Link>
                        <button type="button" className="af-btn af-btn-ghost af-cart-clear" onClick={clear}>Vaciar carrito</button>
                    </div>
                </section>

                <aside className="af-cart-side">
                    <div className="af-cart-total">
                        <div className="af-cart-totalrow">
                            <span>Total en efectivo</span>
                            <span className="af-cart-totalvalue">{formatoPrecio(total)}</span>
                        </div>
                        <div className="af-cart-transfer">
                            <span>Con transferencia (+7,5%)</span>
                            <span>{formatoPrecio(precioTransferencia(total))}</span>
                        </div>
                        <span className="af-cart-note">Elegís el medio de pago en el próximo paso.</span>
                        <Link to="/checkout" className="af-btn af-btn-primary af-cart-checkout-d">
                            Finalizar compra<PiArrowRight size={18} />
                        </Link>
                    </div>
                </aside>
            </div>

            {/* Mobile: barra fija con el total y "Finalizar compra" */}
            <div className="af-buybar af-buybar--compra">
                <div className="af-buybar-total">
                    <span className="af-buybar-label">Total efectivo</span>
                    <span className="af-buybar-value">{formatoPrecio(total)}</span>
                </div>
                <Link to="/checkout" className="af-btn af-btn-primary af-buybar-btn af-buybar-btn--lg">
                    Finalizar compra<PiArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};

export default Cart;
