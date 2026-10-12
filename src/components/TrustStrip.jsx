import { PiShieldCheck, PiTruck } from "react-icons/pi";
import { FaWhatsapp } from "react-icons/fa";

const ITEMS = [
    { Icono: PiShieldCheck, m: 20, d: 24, titulo: "Productos originales", sub: "Comprados a distribuidores oficiales" },
    { Icono: PiTruck, m: 20, d: 24, titulo: "Envíos a todo el país", sub: "Coordinamos el envío por WhatsApp" },
    { Icono: FaWhatsapp, m: 18, d: 22, titulo: "Atención por WhatsApp", sub: "Te asesoramos antes de comprar" },
];

// Franja de confianza: tres celdas en mobile (ícono arriba) y con subtítulos en desktop.
const TrustStrip = () => (
    <section className="af-trust" aria-label="Por qué comprar en Al Fallo">
        {ITEMS.map(({ Icono, m, d, titulo, sub }) => (
            <div key={titulo} className="af-trust-item">
                <Icono size={m} className="af-trust-icon af-trust-icon-m" />
                <Icono size={d} className="af-trust-icon af-trust-icon-d" />
                <div className="af-trust-text">
                    <span className="af-trust-title">{titulo}</span>
                    <span className="af-trust-sub">{sub}</span>
                </div>
            </div>
        ))}
    </section>
);

export default TrustStrip;
