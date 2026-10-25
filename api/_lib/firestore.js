// Acceso a Firestore y a Google desde las funciones de Vercel, sin dependencias externas.
// Usa la cuenta de servicio de Firebase guardada en la variable de entorno FIREBASE_SERVICE_ACCOUNT
// (el JSON completo, o el mismo JSON en base64). Con ella se pide un token de acceso a Google
// y se usan las API REST de Firestore y de Firebase Cloud Messaging.

const crypto = require("crypto");

const PROYECTO = "fragancesnet";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`;

// ---------- Cuenta de servicio y token de acceso ----------

let cuenta = null;
function cuentaDeServicio() {
  if (cuenta) return cuenta;
  const crudo = (process.env.FIREBASE_SERVICE_ACCOUNT || "").trim();
  if (!crudo) throw new Error("Falta la variable FIREBASE_SERVICE_ACCOUNT");
  const json = crudo.startsWith("{") ? crudo : Buffer.from(crudo, "base64").toString("utf8");
  cuenta = JSON.parse(json);
  return cuenta;
}

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

let tokenCache = { valor: "", vence: 0 };
async function tokenDeAcceso() {
  if (tokenCache.valor && Date.now() < tokenCache.vence - 60_000) return tokenCache.valor;
  const sa = cuentaDeServicio();
  const ahora = Math.floor(Date.now() / 1000);
  const cabecera = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const cuerpo = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: ahora,
    exp: ahora + 3600,
  }));
  const firma = b64url(crypto.createSign("RSA-SHA256").update(`${cabecera}.${cuerpo}`).sign(sa.private_key));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${cabecera}.${cuerpo}.${firma}`,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Google no dio el token: ${json.error_description || json.error || res.status}`);
  tokenCache = { valor: json.access_token, vence: Date.now() + json.expires_in * 1000 };
  return tokenCache.valor;
}

// ---------- Conversión de valores de Firestore ----------

function decodificar(v) {
  if (!v || typeof v !== "object") return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(decodificar);
  if ("mapValue" in v) return campos(v.mapValue.fields);
  return undefined;
}

const campos = (fields) => {
  const out = {};
  for (const [k, x] of Object.entries(fields || {})) out[k] = decodificar(x);
  return out;
};

function codificar(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(codificar) } };
  if (typeof v === "object") {
    const fields = {};
    for (const [k, x] of Object.entries(v)) if (x !== undefined) fields[k] = codificar(x);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

// ---------- Operaciones ----------

async function pedir(url, opciones = {}) {
  const token = await tokenDeAcceso();
  const res = await fetch(url, {
    ...opciones,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opciones.headers || {}) },
  });
  if (res.status === 404) return null;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Firestore ${res.status}: ${(json.error && json.error.message) || ""}`);
  return json;
}

// Lee un documento ("coleccion/id"). Devuelve null si no existe.
async function leer(ruta) {
  const doc = await pedir(`${BASE}/${ruta}`);
  return doc ? { id: doc.name.split("/").pop(), ...campos(doc.fields) } : null;
}

// Crea o reemplaza un documento completo ("coleccion/id")
async function guardar(ruta, datos) {
  const fields = codificar(datos).mapValue.fields;
  await pedir(`${BASE}/${ruta}`, { method: "PATCH", body: JSON.stringify({ fields }) });
}

// Agrega un documento con id automático a una colección. Devuelve el id.
async function agregar(coleccion, datos) {
  const fields = codificar(datos).mapValue.fields;
  const doc = await pedir(`${BASE}/${coleccion}`, { method: "POST", body: JSON.stringify({ fields }) });
  return doc.name.split("/").pop();
}

// Lista todos los documentos de una colección (pocas decenas como máximo)
async function listar(coleccion) {
  const doc = await pedir(`${BASE}/${coleccion}?pageSize=300`);
  return ((doc && doc.documents) || []).map((d) => ({ id: d.name.split("/").pop(), ...campos(d.fields) }));
}

async function borrar(ruta) {
  await pedir(`${BASE}/${ruta}`, { method: "DELETE" });
}

module.exports = { PROYECTO, tokenDeAcceso, decodificar, campos, codificar, leer, guardar, agregar, listar, borrar };
