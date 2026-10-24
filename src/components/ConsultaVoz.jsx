import { useEffect, useRef, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faPaperPlane, faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { formatoPrecio } from "../utils/productos";

// Asistente del panel: se pregunta en voz alta (o escribiendo) cuánto sale un producto,
// a cuánto se vende y cuánto se gana. La voz se pasa a texto en el navegador (gratis, Chrome/Edge)
// y la respuesta la arma la Cloud Function "consultaAdmin" con Gemini.

const Reconocimiento = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

const leerVozGuardada = () => {
    try {
        return localStorage.getItem("consultaVozHablar") !== "0";
    } catch (e) {
        return true;
    }
};

const pct = (n) => (n === null || n === undefined ? "-" : `${String(n).replace(".", ",")}%`);
const plata = (n) => (n === null || n === undefined ? "sin cargar" : formatoPrecio(n));

const ConsultaVoz = () => {
    const [escuchando, setEscuchando] = useState(false);
    const [texto, setTexto] = useState("");
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState("");
    const [hablar, setHablar] = useState(leerVozGuardada);
    const recRef = useRef(null);

    useEffect(() => {
        try {
            localStorage.setItem("consultaVozHablar", hablar ? "1" : "0");
        } catch (e) {
            // sin localStorage: queda solo en memoria
        }
        if (!hablar && window.speechSynthesis) window.speechSynthesis.cancel();
    }, [hablar]);

    useEffect(() => () => {
        if (recRef.current) recRef.current.abort();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }, []);

    const decir = (frase) => {
        if (!hablar || !window.speechSynthesis || !frase) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(frase);
        u.lang = "es-AR";
        window.speechSynthesis.speak(u);
    };

    const consultar = async (pregunta) => {
        const q = (pregunta || "").trim();
        if (!q || cargando) return;
        setCargando(true);
        setError("");
        setResultado(null);
        try {
            const fn = httpsCallable(getFunctions(undefined, "southamerica-east1"), "consultaAdmin");
            const { data } = await fn({ pregunta: q });
            setResultado(data);
            decir(data.respuesta);
        } catch (e) {
            console.error("Error en la consulta:", e);
            const msj = e && e.code && e.code !== "functions/internal" && e.message
                ? e.message
                : "No se pudo hacer la consulta. Si es la primera vez, revisá que la función consultaAdmin esté desplegada.";
            setError(msj);
        } finally {
            setCargando(false);
        }
    };

    const empezarAEscuchar = () => {
        if (!Reconocimiento) {
            setError("Este navegador no permite dictar. Usá Chrome o Edge, o escribí la consulta.");
            return;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setError("");
        const rec = new Reconocimiento();
        rec.lang = "es-AR";
        rec.interimResults = true;
        rec.continuous = false;
        let final = "";
        rec.onresult = (ev) => {
            let parcial = "";
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                const t = ev.results[i][0].transcript;
                if (ev.results[i].isFinal) final += t;
                else parcial += t;
            }
            setTexto((final + parcial).trim());
        };
        rec.onerror = (ev) => {
            if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
                setError("El navegador bloqueó el micrófono. Permitilo desde el candado de la barra de direcciones.");
            } else if (ev.error === "no-speech") {
                setError("No escuché nada. Tocá el micrófono y probá de nuevo.");
            } else if (ev.error !== "aborted") {
                setError("No se pudo usar el micrófono (" + ev.error + ").");
            }
        };
        rec.onend = () => {
            setEscuchando(false);
            recRef.current = null;
            if (final.trim()) consultar(final);
        };
        recRef.current = rec;
        setTexto("");
        setEscuchando(true);
        rec.start();
    };

    const frenar = () => {
        if (recRef.current) recRef.current.stop();
    };

    return (
        <div className="card mb-4" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h2 className="h5 mb-0">Preguntale a tu tienda</h2>
                    <button
                        type="button"
                        className="btn btn-sm border-0 bg-transparent"
                        onClick={() => setHablar((v) => !v)}
                        title={hablar ? "Respuesta en voz alta: activada" : "Respuesta en voz alta: desactivada"}
                        aria-label={hablar ? "Desactivar respuesta en voz alta" : "Activar respuesta en voz alta"}
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <FontAwesomeIcon icon={hablar ? faVolumeHigh : faVolumeXmark} />
                    </button>
                </div>
                <p className="small mb-3" style={{ color: "var(--text-secondary)" }}>
                    Ej.: "¿Cuánto me sale la whey Star Nutrition de 2 libras?" · "¿A cuánto vendo la creatina Pitbull y cuánto gano?"
                </p>

                <form
                    className="d-flex flex-nowrap gap-2 align-items-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        consultar(texto);
                    }}
                >
                    <button
                        type="button"
                        onClick={escuchando ? frenar : empezarAEscuchar}
                        disabled={cargando}
                        className="btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: 52,
                            height: 52,
                            background: escuchando ? "#dc3545" : "var(--accent-color)",
                            borderColor: escuchando ? "#dc3545" : "var(--accent-color)",
                            color: "white",
                            boxShadow: escuchando ? "0 0 0 6px rgba(220,53,69,0.25)" : "none",
                            transition: "box-shadow .2s, background .2s",
                        }}
                        aria-label={escuchando ? "Dejar de escuchar" : "Hablar"}
                    >
                        <FontAwesomeIcon icon={escuchando ? faStop : faMicrophone} size="lg" />
                    </button>
                    <input
                        type="text"
                        className="form-control"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder={escuchando ? "Te escucho…" : "Tocá el micrófono o escribí tu consulta"}
                        maxLength={500}
                        style={{ flex: "1 1 auto", minWidth: 0, width: "auto", margin: 0, background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-color)" }}
                    />
                    <button
                        type="submit"
                        className="btn btn-outline-secondary flex-shrink-0"
                        disabled={cargando || !texto.trim()}
                        aria-label="Consultar"
                        style={{ width: "auto", margin: 0, borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </form>

                {cargando && <p className="small mt-3 mb-0" style={{ color: "var(--text-secondary)" }}>Buscando…</p>}
                {error && <div className="alert alert-warning py-2 mt-3 mb-0 small">{error}</div>}

                {resultado && (
                    <div className="mt-3">
                        <p className="mb-2 fw-semibold">{resultado.respuesta}</p>
                        {resultado.productos && resultado.productos.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-sm mb-0 align-middle" style={{ color: "var(--text-primary)" }}>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th className="text-end">Costo</th>
                                            <th className="text-end">Venta</th>
                                            <th className="text-end">Ganancia</th>
                                            <th className="text-end">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultado.productos.map((p) => (
                                            <tr key={p.id}>
                                                <td className="small">
                                                    <span className="fw-bold">{p.marca}</span> {p.nombre}
                                                    {p.presentacion ? ` (${p.presentacion})` : ""}
                                                    <div style={{ color: "var(--text-secondary)" }}>
                                                        Stock {p.stock}
                                                        {p.descuento > 0 ? ` · ${p.descuento}% off (lista ${formatoPrecio(p.precioLista)})` : ""}
                                                        {p.precioTransferencia ? ` · Transf. ${formatoPrecio(p.precioTransferencia)}` : ""}
                                                    </div>
                                                </td>
                                                <td className="text-end">{plata(p.costo)}</td>
                                                <td className="text-end">{plata(p.precioVenta)}</td>
                                                <td className="text-end fw-bold" style={{ color: p.ganancia < 0 ? "#dc3545" : undefined }}>
                                                    {p.ganancia === null ? "-" : formatoPrecio(p.ganancia)}
                                                </td>
                                                <td className="text-end small">
                                                    {pct(p.gananciaPctCosto)}
                                                    <div style={{ color: "var(--text-secondary)" }} title="Porcentaje sobre el precio de venta">
                                                        {p.gananciaPctVenta === null ? "" : `${pct(p.gananciaPctVenta)} s/venta`}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultaVoz;
