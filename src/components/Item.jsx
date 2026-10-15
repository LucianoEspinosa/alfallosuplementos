import { Link } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import ProductPhoto from "./af/ProductPhoto";
import { precioFinalDe, precioTransferencia, formatoPrecio, badgeDe } from "../utils/productos";

// Card de producto (spec AFCard). Toda la card es un link al detalle; "Ver producto" es visual.
const Item = ({ item }) => {
    // Precio final (con descuento si aplica) y precio con transferencia (+7,5%)
    const precioFinal = precioFinalDe(item);
    const precioConTransferencia = precioTransferencia(precioFinal);
    const badge = badgeDe(item);

    return (
        <Link to={"/item/" + item.id} className="af-card af-reveal">
            <div className="af-tile af-card-tile">
                <ProductPhoto img={item.img} marca={item.marca} nombre={item.nombre} pct={84} />
                {badge && <span className={`af-badge af-badge-${badge.tipo}`}>{badge.texto}</span>}
            </div>
            <div className="af-card-info">
                <div className="af-card-brand">{item.marca}</div>
                <div className="af-card-name">{item.nombre}</div>
                <div className="af-card-size">{item.presentacion}</div>
            </div>
            <div className="af-card-prices">
                <div className="af-card-pricerow">
                    <span className="af-card-price">{formatoPrecio(precioFinal)}</span>
                    {item.descuento > 0 && <span className="af-card-old">{formatoPrecio(item.precio)}</span>}
                </div>
                <div className="af-card-transfer">{formatoPrecio(precioConTransferencia)} con transferencia</div>
            </div>
            <div className="af-card-cta">
                <span className="af-btn af-btn-primary af-card-btn">Ver producto<PiArrowRight size={16} /></span>
            </div>
        </Link>
    );
};

export default Item;
