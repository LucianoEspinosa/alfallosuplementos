import { Link, useParams } from "react-router-dom";
const ThankYou = () => {
    const { orderId,nombre } = useParams();
    return (
        <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
            <div className="text-center">
                <h2>¡Gracias {nombre} por tu compra!</h2>
                <p>Tu número de orden es: <span className="fw-bold fs-5 text-primary"> {orderId}</span></p>
                <p>En instantes nos contactaremos</p>
                <Link to="/" className="btn btn-primary mt-4">Volver al inicio</Link>
            </div>
        </div>

    );
};

export default ThankYou;
