import { Link, useParams } from "react-router-dom";
import { PiCheck } from "react-icons/pi";

const ThankYou = () => {
    const { orderId, nombre } = useParams();
    return (
        <section className="af-done af-thankyou">
            <div className="af-done-hero">
                <span className="af-done-check"><PiCheck size={22} /></span>
                <h1 className="af-compra-title af-done-title">¡Gracias{nombre ? ` ${nombre}` : ""} por tu compra!</h1>
                <span className="af-done-text">En instantes nos contactaremos.</span>
                <div className="af-done-order">
                    <span className="af-overline af-overline--soft">N° de orden</span>
                    <span className="af-done-orderid">{orderId}</span>
                </div>
            </div>
            <Link to="/" className="af-btn af-btn-primary af-thankyou-btn">Volver al inicio</Link>
        </section>
    );
};

export default ThankYou;
