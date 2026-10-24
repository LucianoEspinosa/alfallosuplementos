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
        <section className="adm-card">
            <div className="adm-card-head">
                <h2 className="adm-h2">Preguntale a tu tienda</h2>
                <button
                    type="button"
                    className="adm-iconbtn"
                    onClick={() => setHablar((v) => !v)}
                    title={hablar ? "Respuesta en voz alta: activada" : "Respuesta en voz alta: desactivada"}
                    aria-label={hablar ? "Desactivar respuesta en voz alta" : "Activar respuesta en voz alta"}
                >
                    <FontAwesomeIcon icon={hablar ? faVolumeHigh : faVolumeXmark} />
                </button>
            </div>
            <div className="adm-muted">Costo, precio de venta y ganancia de cualquier producto.</div>

            <form
                className="adm-ask"
                onSubmit={(e) => {
                    e.preventDefault();
                    consultar(texto);
                }}
            >
                <button
                    type="button"
                    onClick={escuchando ? frenar : empezarAEscuchar}
                    disabled={cargando}
                    className={`adm-mic ${escuchando ? "is-on" : ""}`}
                    aria-label={escuchando ? "Dejar de escuchar" : "Hablar"}
                >
                    <FontAwesomeIcon icon={escuchando ? faStop : faMicrophone} />
                </button>
                <div className="adm-askfield">
                    <input
                        type="text"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder={escuchando ? "Te escucho…" : "Ej.: ¿cuánto gano con la creatina Pitbull?"}
                        maxLength={500}
                        enterKeyHint="send"
                    />
                    <button type="submit" className="adm-send" disabled={cargando || !texto.trim()} aria-label="Consultar">
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                </div>
            </form>

            {cargando && <p className="adm-status">Buscando…</p>}
            {error && <div className="adm-alert">{error}</div>}

            {resultado && (
                <>
                    <p className="adm-answer">{resultado.respuesta}</p>
                    {resultado.productos && resultado.productos.length > 0 && (
                        <div className="adm-results">
                            {resultado.productos.map((p) => (
                                <div className="adm-result" key={p.id}>
                                    <div className="adm-result-name">
                                        <b>{p.marca}</b>{p.nombre}{p.presentacion ? ` (${p.presentacion})` : ""}
                                    </div>
                                    <div className="adm-result-meta">
                                        Stock {p.stock}
                                        {p.descuento > 0 ? ` · ${p.descuento}% off (lista ${formatoPrecio(p.precioLista)})` : ""}
                                        {p.precioTransferencia ? ` · Transferencia ${formatoPrecio(p.precioTransferencia)}` : ""}
                                    </div>
                                    <div className="adm-stats">
                                        <div className="adm-stat"><span>Costo</span><strong>{plata(p.costo)}</strong></div>
                                        <div className="adm-stat"><span>Venta</span><strong>{plata(p.precioVenta)}</strong></div>
                                        <div className={`adm-stat ${p.ganancia < 0 ? "adm-stat--loss" : "adm-stat--gain"}`}>
                                            <span>Ganancia</span><strong>{p.ganancia === null ? "-" : formatoPrecio(p.ganancia)}</strong>
                                        </div>
                                        <div className={`adm-stat ${p.ganancia < 0 ? "adm-stat--loss" : "adm-stat--gain"}`}>
                                            <span>% s/costo</span>
                                            <strong>{pct(p.gananciaPctCosto)}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default ConsultaVoz;
