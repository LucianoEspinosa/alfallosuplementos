import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { capturarCuponDeUrl, LINKS_CORTOS, guardarCupon } from "../utils/cuponLink";

// Detecta ?cupon=CODIGO en cualquier página, lo guarda y avisa al cliente
// que el descuento ya quedó cargado para cuando finalice la compra.
const CuponDesdeLink = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState(null);

  useEffect(() => {
    // Link corto (ej: /tomiteam): guarda el código y lleva al inicio de la tienda
    const corto = LINKS_CORTOS[location.pathname.toLowerCase().replace(/\/+$/, "")];
    if (corto) {
      guardarCupon(corto);
      setCodigo(corto);
      navigate({ pathname: "/", search: location.search }, { replace: true });
      return;
    }

    const encontrado = capturarCuponDeUrl(location.search);
    if (!encontrado) return;

    setCodigo(encontrado);

    // Saca el código de la barra de direcciones (queda guardado igual)
    const params = new URLSearchParams(location.search);
    ["cupon", "codigo", "code", "descuento"].forEach((p) => params.delete(p));
    const resto = params.toString();
    navigate(
      { pathname: location.pathname, search: resto ? `?${resto}` : "", hash: location.hash },
      { replace: true }
    );
  }, [location.search, location.pathname, location.hash, navigate]);

  useEffect(() => {
    if (!codigo) return;
    const timer = setTimeout(() => setCodigo(null), 7000);
    return () => clearTimeout(timer);
  }, [codigo]);

  if (!codigo) return null;

  return (
    <div className="af-cupon-aviso" role="status">
      <span>
        Código <strong>{codigo}</strong> cargado. Se aplica al finalizar la compra.
      </span>
      <button type="button" className="af-cupon-aviso-cerrar" onClick={() => setCodigo(null)} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
};

export default CuponDesdeLink;
