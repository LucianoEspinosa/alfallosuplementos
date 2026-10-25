// Catálogo público en JSON (lo lee MyChatBot cada pocas horas y sirve para cualquier otro bot).
// URL: https://alfallo.vercel.app/api/catalogo
const { leerCatalogo } = require("./_lib/catalogo");

module.exports = async (req, res) => {
  try {
    const items = await leerCatalogo();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    // Vercel guarda la respuesta 30 minutos: los cambios de precio se ven en el catálogo en menos de media hora
    res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=600");
    res.status(200).send(JSON.stringify(items));
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "No se pudo leer el catálogo", detalle: e.message });
  }
};
