// =========================================================
// EnglishUp — Tutor de conversación con IA (Supabase Edge Function)
//
// La clave de Anthropic vive SOLO aquí, como secreto del servidor
// (Supabase → Edge Functions → Secrets → ANTHROPIC_API_KEY).
// La app nunca la ve.
//
// Secretos opcionales:
//   TUTOR_MODEL     modelo de Claude (por defecto claude-haiku-5-5, el más económico)
//   AI_DAILY_LIMIT  mensajes por usuario al día (por defecto 40)
//
// Ahorro de costos: modelo Haiku, esfuerzo "low", solo los últimos mensajes
// de la conversación, respuestas cortas y límite diario por usuario.
// =========================================================
import Anthropic from "npm:@anthropic-ai/sdk";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MODEL = Deno.env.get("TUTOR_MODEL") || "claude-haiku-5-5";
const DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT") || 40);
// La red de respaldo del servidor (fallbacks) existe para Opus, Fable y Sonnet 5.5; no para Haiku.
const SUPPORTS_FALLBACKS = /^claude-(opus-5|fable-5|sonnet-5-5)/.test(MODEL);

const client = new Anthropic(); // lee ANTHROPIC_API_KEY de los secretos

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Solo se envían los últimos mensajes: menos texto = menos costo
const MAX_TURNS = 14;

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

const CHAT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "reply_es", "has_error", "corrected", "explanation_es", "score", "suggestions"],
  properties: {
    reply: { type: "string", description: "Your next spoken line, in English, in character." },
    reply_es: { type: "string", description: "Spanish translation of reply." },
    has_error: { type: "boolean", description: "True if the learner's LAST message had a real grammar/vocabulary error or a clearly unnatural phrase." },
    corrected: { type: "string", description: "Natural, correct version of the learner's last message. Empty string if has_error is false." },
    explanation_es: { type: "string", description: "Short explanation in Spanish of the correction (max ~25 words). Empty if no error." },
    score: { type: "integer", description: "0-100 quality of the learner's last message for their level. 100 if there was no learner message yet." },
    suggestions: { type: "array", items: { type: "string" }, description: "Two short, natural things the learner could say next, in English, at their level." },
  },
};

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["overall_es", "strengths_es", "improvements", "vocabulary", "fluency", "grammar", "vocabulary_score", "level_estimate"],
  properties: {
    overall_es: { type: "string", description: "2-3 encouraging sentences in Spanish summarizing the learner's performance." },
    strengths_es: { type: "array", items: { type: "string" }, description: "Up to 3 strengths, in Spanish." },
    improvements: {
      type: "array",
      description: "Up to 5 of the most useful corrections from the conversation.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original", "corrected", "explanation_es"],
        properties: { original: { type: "string" }, corrected: { type: "string" }, explanation_es: { type: "string" } },
      },
    },
    vocabulary: {
      type: "array",
      description: "Up to 6 useful words or phrases from the conversation worth learning.",
      items: { type: "object", additionalProperties: false, required: ["en", "es"], properties: { en: { type: "string" }, es: { type: "string" } } },
    },
    fluency: { type: "integer", description: "0-100" },
    grammar: { type: "integer", description: "0-100" },
    vocabulary_score: { type: "integer", description: "0-100" },
    level_estimate: { type: "string", enum: LEVELS },
  },
};

function systemPrompt(level: string, persona: string, scenario: string, learner: string) {
  return `You are ${persona}, a warm, curious native English speaker having a real spoken conversation with ${learner || "a learner"}, a Spanish speaker learning English at CEFR level ${level}.

Scenario: ${scenario}

How to talk:
- Sound like a real person, not a teacher: react to what they say, share small opinions or anecdotes, use humor and empathy.
- Keep each reply short (1-3 sentences) and end with a natural question or prompt so the conversation keeps flowing.
- Use vocabulary and grammar suitable for ${level}, occasionally slightly above it to stretch them.
- Stay in character and in the scenario. Never put corrections inside your reply.
- If the learner writes in Spanish or gets stuck, answer in simple English and encourage them.
- Keep everything appropriate for all ages.

How to correct (fill the correction fields, not the reply):
- The learner's messages come from speech recognition: ignore missing punctuation, capitalization and obvious transcription glitches.
- Flag real grammar mistakes, wrong words, and phrases a native speaker would not say. Do not flag acceptable informal speech.
- "corrected" is the natural version of their whole last message; "explanation_es" is one short, friendly explanation in Spanish.

Latency-sensitive; begin your visible answer immediately.`;
}

type Turn = { role: "user" | "assistant"; content: string };

function cleanHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const turns: Turn[] = [];
  for (const m of raw.slice(-MAX_TURNS)) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
    const content = m.content.trim().slice(0, 500);
    if (content) turns.push({ role: m.role, content });
  }
  return turns;
}

async function getUser(authHeader: string | null) {
  if (!authHeader) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: authHeader, apikey: SERVICE_KEY } });
  if (!r.ok) return null;
  return await r.json();
}

async function bumpUsage(userId: string): Promise<number> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bump_ai_usage`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_user: userId, p_limit: DAILY_LIMIT }),
  });
  if (!r.ok) throw new Error(`usage ${r.status}`);
  return Number(await r.json());
}

async function askClaude(system: string, messages: Anthropic.Beta.BetaMessageParam[], schema: object, maxTokens: number) {
  const params: Record<string, unknown> = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort: "low", format: { type: "json_schema", schema } },
  };
  if (SUPPORTS_FALLBACKS) {
    params.betas = ["server-side-fallback-2026-07-01"];
    params.fallbacks = "default";
  }
  const response = await client.beta.messages.create(params as unknown as Anthropic.Beta.MessageCreateParamsNonStreaming);
  if (response.stop_reason === "refusal") return { refused: true as const };
  const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return { refused: false as const, data: JSON.parse(text), truncated: response.stop_reason === "max_tokens" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  const user = await getUser(req.headers.get("Authorization"));
  if (!user?.id) return json({ error: "Inicia sesión en la nube para usar el tutor." }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Solicitud no válida" }, 400); }

  const level = LEVELS.includes(String(body.level)) ? String(body.level) : "A2";
  const persona = String(body.persona || "Emma, from London").slice(0, 80);
  const scenario = String(body.scenario || "A friendly casual chat about everyday life.").slice(0, 400);
  const learner = String(body.learner || "").slice(0, 40);
  const history = cleanHistory(body.history);
  const mode = body.mode === "summary" ? "summary" : "chat";

  let remaining: number;
  try {
    remaining = await bumpUsage(user.id);
  } catch (e) {
    console.error(e);
    return json({ error: "No se pudo verificar el límite de uso." }, 500);
  }
  if (remaining < 0) return json({ error: `Llegaste al límite de ${DAILY_LIMIT} mensajes con el tutor por hoy. ¡Vuelve mañana!` }, 429);

  try {
    if (mode === "chat") {
      // La conversación debe empezar con un mensaje del usuario: abrimos con una indicación de escena.
      const messages: Anthropic.Beta.BetaMessageParam[] = [
        { role: "user", content: "[The learner just opened the chat. Greet them in character and start the scenario with a question.]" },
        ...history,
      ];
      const r = await askClaude(systemPrompt(level, persona, scenario, learner), messages, CHAT_SCHEMA, 2000);
      if (r.refused) return json({ reply: "Let's talk about something else! What did you do today?", reply_es: "¡Hablemos de otra cosa! ¿Qué hiciste hoy?", has_error: false, corrected: "", explanation_es: "", score: 100, suggestions: [], remaining });
      return json({ ...r.data, remaining });
    }

    const transcript = history.map((t) => `${t.role === "user" ? "LEARNER" : "TUTOR"}: ${t.content}`).join("\n");
    const r = await askClaude(
      `You are an expert English teacher for Spanish speakers. Evaluate the learner (CEFR target ${level}) based only on their lines in the conversation transcript. Be encouraging, specific and honest. Ignore punctuation and capitalization (speech recognition).`,
      [{ role: "user", content: `Conversation transcript:\n\n${transcript || "(empty)"}` }],
      SUMMARY_SCHEMA,
      3000,
    );
    if (r.refused) return json({ error: "No se pudo evaluar esta conversación." }, 422);
    return json({ ...r.data, remaining });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "El tutor está muy ocupado. Intenta en unos segundos." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "La clave de Anthropic del servidor no es válida." }, 500);
    if (e instanceof Anthropic.APIError) { console.error(e.status, e.message); return json({ error: "El tutor no está disponible ahora." }, 502); }
    console.error(e);
    return json({ error: "Ocurrió un error con el tutor." }, 500);
  }
});
