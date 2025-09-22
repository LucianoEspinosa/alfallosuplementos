import React from 'react';

import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from './context/CartContext';
import bag from "./img/icon/bag.svg";


const CartWidget = () => {
    const { cartTotal, } = useContext(CartContext);
    return (
        <div>
            <Link
                to="/cart"
                className="position-relative d-inline-block"
            >
                <img
                    src={bag}
                    alt="carrito de compras"
                    width={26}
                    style={{ position: "relative", zIndex: 0 }}
                />

                {cartTotal() > 0 && (
                    <span
                        className="badge rounded-pill"
                        style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            backgroundColor: "white",
                            color: "black",
                            border: "1px solid black",
                            minWidth: "20px",
                            height: "20px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            zIndex: 1,
                        }}
                    >
                        {cartTotal()}
                    </span>
                )}
            </Link>



        </div>


    )
}


export default CartWidget;