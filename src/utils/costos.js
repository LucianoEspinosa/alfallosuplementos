import { getFirestore, collection, getDocs, doc, getDoc, setDoc, writeBatch, deleteField } from "firebase/firestore";

// Costo (precio_costo) y margen (ganancia) de cada producto viven en la colección "costos",
// que solo puede leer el administrador. La ficha pública de "fragancias" ya no los lleva:
// antes cualquier visitante podía ver el costo de cada producto desde el navegador.

export const COLECCION_COSTOS = "costos";
const CAMPOS = ["precio_costo", "ganancia"];

// Separa un producto en { publico, costo }: lo que va a "fragancias" y lo que va a "costos".
export function separarCosto(producto) {
    const publico = { ...producto };
    const costo = {};
    for (const c of CAMPOS) {
        if (publico[c] !== undefined) costo[c] = Number(publico[c]) || 0;
        delete publico[c];
    }
    delete publico.id;
    return { publico, costo };
}

// Mapa id -> { precio_costo, ganancia } (solo funciona logueado como administrador).
export async function getCostos() {
    const snap = await getDocs(collection(getFirestore(), COLECCION_COSTOS));
    const mapa = new Map();
    snap.docs.forEach((d) => mapa.set(d.id, d.data()));
    return mapa;
}

export async function getCosto(id) {
    const snap = await getDoc(doc(getFirestore(), COLECCION_COSTOS, id));
    return snap.exists() ? snap.data() : {};
}

// Agrega costo y margen a cada producto (si un producto todavía los tiene en la ficha vieja, se usan esos).
export function conCostos(productos, mapa) {
    return productos.map((p) => {
        const c = mapa.get(p.id) || {};
        return {
            ...p,
            precio_costo: c.precio_costo ?? p.precio_costo,
            ganancia: c.ganancia ?? p.ganancia,
        };
    });
}

export function guardarCosto(id, costo) {
    if (!costo || Object.keys(costo).length === 0) return Promise.resolve();
    return setDoc(doc(getFirestore(), COLECCION_COSTOS, id), costo, { merge: true });
}

// Mueve a "costos" los productos que todavía tienen costo o margen en la ficha pública y los borra de ahí.
// Se ejecuta solo al abrir el panel; no hace nada si ya está todo migrado. Devuelve cuántos movió.
export async function migrarCostos(productos) {
    const db = getFirestore();
    const pendientes = productos.filter((p) => CAMPOS.some((c) => p[c] !== undefined));
    if (pendientes.length === 0) return 0;
    const existentes = await getCostos();
    for (let i = 0; i < pendientes.length; i += 200) {
        const batch = writeBatch(db);
        for (const p of pendientes.slice(i, i + 200)) {
            const yaGuardado = existentes.get(p.id) || {};
            const costo = {};
            // Si "costos" ya tiene el dato (lo escribió la actualización diaria), ese manda.
            for (const c of CAMPOS) {
                if (yaGuardado[c] !== undefined) costo[c] = yaGuardado[c];
                else if (p[c] !== undefined) costo[c] = Number(p[c]) || 0;
            }
            batch.set(doc(db, COLECCION_COSTOS, p.id), costo, { merge: true });
            batch.update(doc(db, "fragancias", p.id), { precio_costo: deleteField(), ganancia: deleteField() });
        }
        await batch.commit();
    }
    return pendientes.length;
}
