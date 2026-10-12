import { useEffect, useState } from "react";
import { PiImage } from "react-icons/pi";

// Foto de producto dentro del recuadro crema (.af-tile).
// Si no hay imagen o la URL falla, muestra el estado "Foto no disponible" del spec AFCard
// (variant="full") o solo la inicial de la marca (variant="initial", para miniaturas).
const ProductPhoto = ({ img, marca, nombre, pct = 84, variant = "full", alt }) => {
    const [fallo, setFallo] = useState(false);

    useEffect(() => {
        setFallo(false);
    }, [img]);

    if (img && !fallo) {
        return (
            <img
                src={img}
                alt={alt !== undefined ? alt : `${marca || ""} ${nombre || ""}`.trim()}
                loading="lazy"
                onError={() => setFallo(true)}
                style={{ width: `${pct}%`, height: `${pct}%` }}
            />
        );
    }

    const inicial = (marca || "?").trim().charAt(0).toUpperCase();

    if (variant === "initial") {
        return (
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#3A3F45" }}>
                {inicial}
            </span>
        );
    }

    return (
        <div className="af-nophoto">
            <div className="af-nophoto-initial">{inicial}</div>
            <div className="af-nophoto-brand">{marca}</div>
            <div className="af-nophoto-name">{nombre}</div>
            <div className="af-nophoto-label"><PiImage size={12} />Foto no disponible</div>
        </div>
    );
};

export default ProductPhoto;
