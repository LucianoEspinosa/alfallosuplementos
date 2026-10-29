// Código de descuento que llega por link (ej: alfallo.vercel.app/?cupon=TOMITEAM).
// Se guarda en el navegador del cliente para que quede cargado en el checkout,
// aunque navegue por la tienda antes de comprar o vuelva unos días después.

const CLAVE = "af_cupon_link";
const DURACION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const PARAMETROS = ["cupon", "codigo", "code", "descuento"];

const limpiar = (valor) => String(valor || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");

// Lee el código de la URL (si viene) y lo guarda. Devuelve el código o null.
export const capturarCuponDeUrl = (search) => {
  try {
    const params = new URLSearchParams(search);
    for (const nombre of PARAMETROS) {
      const codigo = limpiar(params.get(nombre));
      if (codigo) {
        localStorage.setItem(CLAVE, JSON.stringify({ codigo, guardado: Date.now() }));
        return codigo;
      }
    }
  } catch (e) {
    // Sin acceso al almacenamiento: no pasa nada, el cliente lo puede escribir a mano
  }
  return null;
};

// Código guardado que todavía no venció, o "" si no hay.
export const leerCupon = () => {
  try {
    const dato = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (!dato?.codigo) return "";
    if (Date.now() - dato.guardado > DURACION_MS) {
      localStorage.removeItem(CLAVE);
      return "";
    }
    return dato.codigo;
  } catch (e) {
    return "";
  }
};

export const borrarCupon = () => {
  try {
    localStorage.removeItem(CLAVE);
  } catch (e) {
    // nada
  }
};
