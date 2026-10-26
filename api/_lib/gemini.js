// Llamada a Gemini (Google) por su API REST, plan gratuito de Google AI Studio.
// Variables de entorno:
//   GEMINI_API_KEY  clave de Google AI Studio (https://aistudio.google.com/apikey)
//   GEMINI_MODEL    opcional, modelo a usar (por defecto gemini-3.5-flash-lite)

const modelo = () => process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

// contents: historial en formato Gemini [{ role: "user"|"model", parts: [...] }]
// herramientas: [{ name, description, parameters }]
// Devuelve { contenido, texto, llamadas: [{ name, args }] }
async function generar({ instrucciones, contents, herramientas = [] }) {
  const body = {
    systemInstruction: { parts: [{ text: instrucciones }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    // El lenguaje coloquial (malas palabras, bromas) es normal en el chat de una tienda: solo se bloquea lo grave
    safetySettings: ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"].map(
      (category) => ({ category, threshold: "BLOCK_ONLY_HIGH" })
    ),
  };
  if (herramientas.length) body.tools = [{ functionDeclarations: herramientas }];

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY || "" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Gemini ${res.status}: ${(json.error && json.error.message) || ""}`);
    err.status = res.status; // 429 = se agotó el cupo gratuito del minuto o del día
    throw err;
  }
  const contenido = (json.candidates && json.candidates[0] && json.candidates[0].content) || { role: "model", parts: [] };
  const partes = contenido.parts || [];
  const motivo = (json.promptFeedback && json.promptFeedback.blockReason) || (json.candidates && json.candidates[0] && json.candidates[0].finishReason) || "";
  return {
    motivo,
    contenido: { role: "model", parts: partes },
    texto: partes.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim(),
    llamadas: partes.filter((p) => p.functionCall).map((p) => ({ name: p.functionCall.name, args: p.functionCall.args || {} })),
  };
}

module.exports = { generar, modelo };
