// =========================================================
// EnglishUp — Recordatorios con notificaciones push (Supabase Edge Function)
//
// Acciones (POST JSON { action: ... }):
//   key          → devuelve la llave pública para suscribirse (la genera la primera vez)
//   subscribe    → guarda el dispositivo y las preferencias (requiere sesión)
//   unsubscribe  → borra el dispositivo (requiere sesión)
//   test         → envía una notificación de prueba a tus dispositivos (requiere sesión)
//   cron         → lo llama el cron cada 15 min con la clave secreta x-cron-token
//
// Todo el estado vive en la base de datos (tablas push_config y push_subscriptions).
// No necesita secretos propios: usa los que Supabase ya da a cada función.
// IMPORTANTE: apaga "Verify JWT" en la configuración de esta función (ella verifica por su cuenta).
// =========================================================
import * as webpush from "jsr:@negrel/webpush@0.5.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const env = (k: string) => Deno.env.get(k) || "";
const baseUrl = () => env("SUPABASE_URL").replace(/\/+$/, "");
const serviceKey = () => env("SUPABASE_SERVICE_ROLE_KEY");
const contact = () => env("VAPID_CONTACT") || "https://ricardosalmeron71-png.github.io/APP-INGLES/";

// Solo se envían notificaciones a los servicios oficiales de cada navegador (evita usar la función para llamar a otros sitios)
const PUSH_HOSTS = ["fcm.googleapis.com", "android.googleapis.com", ".push.services.mozilla.com", ".notify.windows.com", ".push.apple.com"];
export function allowedEndpoint(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || raw.length > 1200) return false;
    return PUSH_HOSTS.some((h) => (h.startsWith(".") ? u.hostname.endsWith(h) : u.hostname === h));
  } catch { return false; }
}

/* ------------------ BASE DE DATOS (REST) ------------------ */
async function rest(path: string, init: RequestInit & { prefer?: string } = {}) {
  const headers: Record<string, string> = {
    apikey: serviceKey(), Authorization: `Bearer ${serviceKey()}`, "Content-Type": "application/json",
    ...(init.prefer ? { Prefer: init.prefer } : {}),
  };
  const r = await fetch(`${baseUrl()}/rest/v1/${path}`, { ...init, headers });
  const text = await r.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) throw new Error(`REST ${r.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data as any;
}

/* ------------------ LLAVES VAPID ------------------ */
let keyCache: { vapidKeys: CryptoKeyPair; publicKey: string } | null = null;
async function getKeys() {
  if (keyCache) return keyCache;
  let rows = await rest("push_config?id=eq.1&select=vapid,cron_token");
  if (!rows.length) { await rest("push_config", { method: "POST", prefer: "resolution=ignore-duplicates,return=minimal", body: JSON.stringify({ id: 1 }) }); rows = await rest("push_config?id=eq.1&select=vapid,cron_token"); }
  let jwk = rows[0]?.vapid;
  if (!jwk) {
    const fresh = await webpush.generateVapidKeys({ extractable: true });
    const exported = await webpush.exportVapidKeys(fresh);
    // solo escribe si nadie más las creó antes (evita carreras)
    const updated = await rest("push_config?id=eq.1&vapid=is.null", { method: "PATCH", prefer: "return=representation", body: JSON.stringify({ vapid: exported }) });
    if (updated.length) jwk = exported;
    else jwk = (await rest("push_config?id=eq.1&select=vapid"))[0].vapid;
  }
  const vapidKeys = await webpush.importVapidKeys(jwk, { extractable: false });
  keyCache = { vapidKeys, publicKey: await webpush.exportApplicationServerKey(vapidKeys) };
  return keyCache;
}
const cronToken = async () => (await rest("push_config?id=eq.1&select=cron_token"))[0]?.cron_token as string;

/* ------------------ HORA LOCAL Y DECISIÓN ------------------ */
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
export function localParts(tz: string, now: Date) {
  let f: Intl.DateTimeFormat;
  try { f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }); }
  catch { f = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" }); }
  const p: Record<string, string> = {};
  f.formatToParts(now).forEach((x) => { p[x.type] = x.value; });
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute), weekday: WD[p.weekday] ?? 0 };
}
const dayNum = (d: string) => Math.floor(Date.parse(d + "T00:00:00Z") / 86400000);
export const daysBetween = (a: string, b: string) => dayNum(b) - dayNum(a);

export interface Sub {
  id?: number; user_id: string; endpoint: string; p256dh: string; auth: string; tz: string; hour: number; minute: number; days: number[];
  streak_alert: boolean; enabled: boolean; name: string; streak: number; last_practice: string | null; last_sent: string | null; last_alert: string | null; created_at?: string;
}
export type Decision = { kind: "main" | "alert" | "mark" | "disable"; date: string } | null;

/** Decide qué hacer con un dispositivo en este momento. Reglas pensadas para no molestar. */
export function decide(s: Sub, now: Date): Decision {
  const L = localParts(s.tz, now);
  const target = s.hour * 60 + s.minute;
  const practiced = s.last_practice === L.date;
  const ref = s.last_practice || (s.created_at ? s.created_at.slice(0, 10) : L.date);
  const idle = Math.max(0, daysBetween(ref, L.date));
  if (idle >= 45) return { kind: "disable", date: L.date };          // dejó de usar la app: no insistimos más
  const gentle = idle >= 14;                                         // mucho tiempo sin practicar: solo 1 aviso cada 5 días
  if (gentle && s.last_sent && daysBetween(s.last_sent, L.date) < 5) return null;
  const todayOk = s.days.includes(L.weekday);
  if (todayOk && L.minutes >= target && L.minutes < target + 180 && s.last_sent !== L.date) {
    return practiced ? { kind: "mark", date: L.date } : { kind: "main", date: L.date };
  }
  if (!gentle && todayOk && s.streak_alert && s.streak >= 2 && !practiced && s.last_alert !== L.date) {
    const alertAt = Math.max(20 * 60 + 30, target + 120);
    if (L.minutes >= alertAt && L.minutes < Math.min(alertAt + 90, 23 * 60)) return { kind: "alert", date: L.date };
  }
  return null;
}

/* ------------------ MENSAJES ------------------ */
function seeded(str: string) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
export function buildMessage(kind: "main" | "alert" | "test", s: { name: string; streak: number }, date: string, endpoint = "") {
  const first = (s.name || "").trim().split(/\s+/)[0] || "";
  const hi = first ? `${first}, ` : "";
  const n = s.streak;
  if (kind === "test") return { title: "¡Funciona! 🎉", body: "Así te recordaré practicar inglés. ¡Nos vemos en la app!", url: "./#/learn", tag: "test" };
  if (kind === "alert") return { title: "Tu racha está en peligro 🔥", body: `${hi}te quedan unas horas para salvar tu racha de ${n} días. ¡Con 5 minutos basta!`, url: "./#/quick", tag: "streak" };
  const withStreak = [
    `🔥 ${n} días de racha. ${hi}hoy toca mantenerla: 5 minutos y listo.`,
    `🦉 ${hi}tu racha de ${n} días te espera. ¡Una práctica rápida!`,
    `⚡ ${hi}con 5 minutos sumas otro día a tu racha de ${n}.`,
  ];
  const fresh = [
    `👋 ${hi}¿un poco de inglés hoy? Una lección rápida basta.`,
    `🎙️ ${hi}hoy puedes mejorar tu pronunciación en 3 minutos.`,
    `🔤 ${hi}¿repasamos unos verbos? Son solo 5 minutos.`,
    `💬 ${hi}habla un poco en inglés hoy. ¡Tú puedes!`,
  ];
  const list = n >= 1 ? withStreak : fresh;
  return { title: "Hora de practicar 🦉", body: list[seeded(date + endpoint) % list.length], url: "./#/quick", tag: "daily" };
}

/* ------------------ ENVÍO ------------------ */
type SendResult = "ok" | "gone" | "fail";
export type Sender = (s: Pick<Sub, "endpoint" | "p256dh" | "auth">, payload: unknown) => Promise<SendResult>;
let senderOverride: Sender | null = null;
export const __setSender = (f: Sender | null) => { senderOverride = f; };
async function send(s: Pick<Sub, "endpoint" | "p256dh" | "auth">, payload: unknown): Promise<SendResult> {
  if (senderOverride) return senderOverride(s, payload);
  try {
    const { vapidKeys } = await getKeys();
    const app = await webpush.ApplicationServer.new({ contactInformation: contact(), vapidKeys });
    const subscriber = app.subscribe({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } });
    await subscriber.pushTextMessage(JSON.stringify(payload), { ttl: 6 * 3600, urgency: webpush.Urgency.Normal });
    return "ok";
  } catch (e) {
    if (e instanceof webpush.PushMessageError) { const st = e.response.status; if (e.isGone() || st === 404) return "gone"; console.error("push", st); }
    else console.error("push error", e instanceof Error ? e.message : e);
    return "fail";
  }
}

/* ------------------ CRON ------------------ */
export async function runCron(now = new Date()) {
  const subs: Sub[] = await rest("push_subscriptions?enabled=eq.true&fail_count=lt.5&select=*&limit=5000");
  const out = { checked: subs.length, sent: 0, marked: 0, disabled: 0, gone: 0, failed: 0 };
  const patch = (id: number, body: Record<string, unknown>) => rest(`push_subscriptions?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify(body) });
  for (let i = 0; i < subs.length; i += 20) {
    await Promise.all(subs.slice(i, i + 20).map(async (s) => {
      try {
        const d = decide(s, now);
        if (!d) return;
        if (d.kind === "mark") { await patch(s.id!, { last_sent: d.date }); out.marked++; return; }
        if (d.kind === "disable") { await patch(s.id!, { enabled: false }); out.disabled++; return; }
        const r = await send(s, buildMessage(d.kind, s, d.date, s.endpoint));
        if (r === "ok") { await patch(s.id!, d.kind === "alert" ? { last_alert: d.date, fail_count: 0 } : { last_sent: d.date, fail_count: 0 }); out.sent++; }
        else if (r === "gone") { await rest(`push_subscriptions?id=eq.${s.id}`, { method: "DELETE", prefer: "return=minimal" }); out.gone++; }
        else { await patch(s.id!, { fail_count: (s as any).fail_count + 1 || 1 }); out.failed++; }
      } catch (e) { console.error("cron item", e instanceof Error ? e.message : e); out.failed++; }
    }));
  }
  return out;
}

/* ------------------ ACCIONES DE USUARIO ------------------ */
async function getUser(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const r = await fetch(`${baseUrl()}/auth/v1/user`, { headers: { Authorization: auth, apikey: serviceKey() } });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.id ? u : null;
}
const B64URL = /^[A-Za-z0-9_-]{8,200}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const clampInt = (x: unknown, a: number, b: number, d: number) => { const n = Math.round(Number(x)); return Number.isFinite(n) ? Math.min(b, Math.max(a, n)) : d; };
function validTz(tz: unknown) { try { new Intl.DateTimeFormat("en", { timeZone: String(tz) }); return String(tz); } catch { return "UTC"; } }

async function subscribe(user: { id: string }, body: any) {
  const sub = body?.subscription, p = body?.prefs || {};
  const endpoint = String(sub?.endpoint || ""), p256dh = String(sub?.keys?.p256dh || ""), auth = String(sub?.keys?.auth || "");
  if (!allowedEndpoint(endpoint) || !B64URL.test(p256dh) || !B64URL.test(auth)) return json({ error: "Suscripción no válida" }, 400);
  const days = Array.isArray(p.days) ? [...new Set(p.days.map(Number).filter((x: number) => Number.isInteger(x) && x >= 0 && x <= 6))] : [0, 1, 2, 3, 4, 5, 6];
  const row = {
    user_id: user.id, endpoint, p256dh, auth, tz: validTz(p.tz), hour: clampInt(p.hour, 0, 23, 19), minute: clampInt(p.minute, 0, 59, 0),
    days: days.length ? days : [0, 1, 2, 3, 4, 5, 6], streak_alert: p.streakAlert !== false, enabled: true, fail_count: 0,
    name: String(p.name || "").slice(0, 40), streak: clampInt(p.streak, 0, 100000, 0), last_practice: DATE.test(String(p.lastPractice || "")) ? String(p.lastPractice) : null,
  };
  await rest("push_subscriptions?on_conflict=endpoint", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: JSON.stringify(row) });
  // máximo 5 dispositivos por usuario: se borran los más antiguos
  const mine: { id: number }[] = await rest(`push_subscriptions?user_id=eq.${user.id}&select=id&order=id.desc`);
  for (const old of mine.slice(5)) await rest(`push_subscriptions?id=eq.${old.id}`, { method: "DELETE", prefer: "return=minimal" });
  return json({ ok: true });
}

export async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Solicitud no válida" }, 400); }
  const action = String(body?.action || "");
  try {
    if (action === "cron") {
      const token = req.headers.get("x-cron-token") || "";
      const real = await cronToken();
      if (!real || token.length !== real.length || !token.split("").every((c, i) => c === real[i])) return json({ error: "No autorizado" }, 401);
      return json(await runCron());
    }
    if (action === "key") return json({ publicKey: (await getKeys()).publicKey });
    const user = await getUser(req);
    if (!user) return json({ error: "Inicia sesión en la nube primero." }, 401);
    if (action === "subscribe") return await subscribe(user, body);
    if (action === "unsubscribe") {
      const ep = String(body?.endpoint || "");
      await rest(`push_subscriptions?user_id=eq.${user.id}&endpoint=eq.${encodeURIComponent(ep)}`, { method: "DELETE", prefer: "return=minimal" });
      return json({ ok: true });
    }
    if (action === "test") {
      const subs: (Sub & { test_at?: string | null })[] = await rest(`push_subscriptions?user_id=eq.${user.id}&enabled=eq.true&select=*`);
      if (!subs.length) return json({ error: "Este dispositivo aún no está registrado." }, 404);
      if (subs.some((s) => s.test_at && Date.now() - Date.parse(s.test_at) < 30000)) return json({ error: "Espera unos segundos antes de otra prueba." }, 429);
      let sent = 0;
      for (const s of subs) {
        const r = await send(s, buildMessage("test", s, "", s.endpoint));
        if (r === "ok") sent++; else if (r === "gone") await rest(`push_subscriptions?id=eq.${s.id}`, { method: "DELETE", prefer: "return=minimal" });
        await rest(`push_subscriptions?id=eq.${s.id}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ test_at: new Date().toISOString() }) });
      }
      return json({ sent, total: subs.length });
    }
    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return json({ error: "Ocurrió un error con los recordatorios." }, 500);
  }
}

if (!(globalThis as any).__REMINDERS_TEST__) Deno.serve(handle);
