import { PiArrowLeft } from "react-icons/pi";
import logo from "../img/alfallonegro.png";

// Encabezado mobile del flujo de compra (spec AFMobileCompra): volver, logo e indicador de 3 pasos.
const CompraHeader = ({ paso = 0, onBack }) => (
    <header className="af-pagehead af-compra-head">
        <button type="button" className="af-btn af-btn-secondary af-btn-icon" aria-label="Volver" onClick={onBack}>
            <PiArrowLeft size={20} />
        </button>
        <img src={logo} alt="Al Fallo Suplementos" className="af-compra-logo" />
        <div className="af-steps" aria-label={`Paso ${paso + 1} de 3`}>
            {[0, 1, 2].map((i) => (
                <span key={i} className={`af-step ${i <= paso ? "is-on" : ""}`} />
            ))}
        </div>
    </header>
);

export default CompraHeader;
