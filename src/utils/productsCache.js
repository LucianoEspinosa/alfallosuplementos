import { getFirestore, collection, getDocs } from "firebase/firestore";

// Lectura única y compartida de la colección "fragancias".
// NavBar, buscador y listado la usan a la vez: sin esto cada visita descargaba el catálogo 3 veces.
// Se guarda en memoria y en sessionStorage durante unos minutos, así también se reutiliza al navegar o recargar.
const TTL_MS = 2 * 60 * 1000;
const CLAVE = "alfallo_productos_v1";

let enMemoria = null; // { t, data }
let enCurso = null;

export function limpiarCacheProductos() {
    enMemoria = null;
    enCurso = null;
    try {
        sessionStorage.removeItem(CLAVE);
    } catch (e) {
        // sessionStorage no disponible (modo privado, etc.): se ignora
    }
}

export function getAllProducts() {
    const ahora = Date.now();

    if (enMemoria && ahora - enMemoria.t < TTL_MS) {
        return Promise.resolve(enMemoria.data);
    }

    try {
        const guardado = sessionStorage.getItem(CLAVE);
        if (guardado) {
            const parsed = JSON.parse(guardado);
            if (parsed && ahora - parsed.t < TTL_MS && Array.isArray(parsed.data)) {
                enMemoria = parsed;
                return Promise.resolve(parsed.data);
            }
        }
    } catch (e) {
        // cache ilegible: se vuelve a pedir
    }

    if (enCurso) return enCurso;

    enCurso = getDocs(collection(getFirestore(), "fragancias"))
        .then((snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            enMemoria = { t: Date.now(), data };
            try {
                sessionStorage.setItem(CLAVE, JSON.stringify(enMemoria));
            } catch (e) {
                // sin espacio o no disponible: queda solo en memoria
            }
            return data;
        })
        .finally(() => {
            enCurso = null;
        });

    return enCurso;
}
