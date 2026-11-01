// Pruebas de la función de recordatorios. Ejecutar con: deno run -A --no-lock reminders.test.ts
(globalThis as any).__REMINDERS_TEST__ = true;
Deno.env.set("SUPABASE_URL", "https://proj.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service-key");
const mod = await import("./index.ts");
const { handle, decide, buildMessage, allowedEndpoint, localParts } = mod;

let pass = 0, fail = 0;
const ok = (c: boolean, msg: string) => { if (c) { pass++; console.log("  ✅", msg); } else { fail++; console.log("  ❌", msg); } };

/* ---------- base de datos simulada (subconjunto de PostgREST) ---------- */
const db: Record<string, any[]> = { push_config: [{ id: 1, vapid: null, cron_token: "cron-secret-123" }], push_subscriptions: [] };
let seq = 0;
const pushes: { url: string; headers: Headers; body: Uint8Array }[] = [];
const users: Record<string, { id: string }> = { "tok-ana": { id: "u-ana" }, "tok-beto": { id: "u-beto" } };
function matches(row: any, params: URLSearchParams) {
  for (const [k, v] of params) {
    if (["select", "limit", "order", "on_conflict"].includes(k)) continue;
    const [op, ...rest] = v.split("."); const val = rest.join(".");
    const cell = row[k];
    if (op === "eq" && String(cell) !== decodeURIComponent(val)) return false;
    if (op === "lt" && !(Number(cell) < Number(val))) return false;
    if (op === "is" && val === "null" && cell != null) return false;
  }
  return true;
}
globalThis.fetch = (async (input: any, init: any = {}) => {
  const url = new URL(typeof input === "string" ? input : input.url);
  const method = (init.method || "GET").toUpperCase();
  const H = new Headers(init.headers || {});
  const res = (body: unknown, status = 200) => new Response(body === null ? null : JSON.stringify(body), { status });
  if (url.host === "proj.supabase.co" && url.pathname === "/auth/v1/user") {
    const u = users[(H.get("authorization") || "").replace("Bearer ", "")]; return u ? res(u) : res({ msg: "bad jwt" }, 401);
  }
  if (url.host === "proj.supabase.co" && url.pathname.startsWith("/rest/v1/")) {
    if (H.get("apikey") !== "service-key") return res({ message: "no" }, 401);
    const table = url.pathname.split("/").pop()!; const rows = db[table];
    const body = init.body ? JSON.parse(init.body) : null;
    if (method === "GET") { let r = rows.filter((x) => matches(x, url.searchParams)); if (url.searchParams.get("order") === "id.desc") r = r.sort((a, b) => b.id - a.id); return res(r.map((x) => ({ ...x }))); }
    if (method === "POST") {
      if (url.searchParams.get("on_conflict") === "endpoint") { const ex = rows.find((x) => x.endpoint === body.endpoint); if (ex) Object.assign(ex, body); else rows.push({ id: ++seq, last_sent: null, last_alert: null, test_at: null, fail_count: 0, ...body, created_at: new Date().toISOString() }); return new Response(null, { status: 201 }); }
      rows.push({ ...body }); return new Response(null, { status: 201 });
    }
    if (method === "PATCH") { const hit = rows.filter((x) => matches(x, url.searchParams)); hit.forEach((x) => Object.assign(x, body)); return H.get("prefer")?.includes("representation") ? res(hit) : new Response(null, { status: 204 }); }
    if (method === "DELETE") { const keep = rows.filter((x) => !matches(x, url.searchParams)); db[table] = keep; return new Response(null, { status: 204 }); }
  }
  if (url.hostname === "fcm.googleapis.com" || url.hostname.endsWith(".push.services.mozilla.com")) {
    pushes.push({ url: url.href, headers: H, body: new Uint8Array(await new Response(init.body).arrayBuffer()) });
    return new Response(null, { status: url.pathname.includes("gone") ? 410 : 201 });
  }
  throw new Error("fetch inesperado: " + url.href);
}) as any;

const call = (body: unknown, opts: { token?: string; cron?: string } = {}) => handle(new Request("https://f/x", { method: "POST", headers: { "Content-Type": "application/json", ...(opts.token ? { Authorization: "Bearer " + opts.token } : {}), ...(opts.cron ? { "x-cron-token": opts.cron } : {}) }, body: JSON.stringify(body) }));

/* ---------- dispositivo de prueba con llaves reales ---------- */
const b64u = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - s.length % 4) % 4)), (c) => c.charCodeAt(0));
async function newDevice(path = "abc123") {
  const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const pub = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return { kp, pub, auth, sub: { endpoint: `https://fcm.googleapis.com/fcm/send/${path}`, keys: { p256dh: b64u(pub), auth: b64u(auth) } } };
}
const hmac = async (key: Uint8Array, data: Uint8Array) => new Uint8Array(await crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), data));
const cat = (...a: Uint8Array[]) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; a.forEach((x) => { o.set(x, i); i += x.length; }); return o; };
const enc = new TextEncoder();
/** Descifra un mensaje web push (RFC 8291 / RFC 8188) como lo haría el navegador */
async function decrypt(dev: Awaited<ReturnType<typeof newDevice>>, body: Uint8Array) {
  const salt = body.slice(0, 16), idlen = body[20], asPub = body.slice(21, 21 + idlen), data = body.slice(21 + idlen);
  const asKey = await crypto.subtle.importKey("raw", asPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: asKey }, dev.kp.privateKey, 256));
  const prkKey = await hmac(dev.auth, shared);
  const ikm = (await hmac(prkKey, cat(enc.encode("WebPush: info\0"), dev.pub, asPub, new Uint8Array([1])))).slice(0, 32);
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, cat(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, cat(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce }, await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]), data));
  let end = plain.length - 1; while (end >= 0 && plain[end] === 0) end--; // quita relleno; plain[end] es el delimitador 0x01/0x02
  return JSON.parse(new TextDecoder().decode(plain.slice(0, end)));
}

/* ===================== PRUEBAS ===================== */
console.log("\n[reglas de seguridad]");
ok(allowedEndpoint("https://fcm.googleapis.com/fcm/send/abc"), "acepta FCM (Chrome/Android)");
ok(allowedEndpoint("https://updates.push.services.mozilla.com/wpush/v2/x"), "acepta Mozilla");
ok(allowedEndpoint("https://web.push.apple.com/abc"), "acepta Apple");
ok(!allowedEndpoint("https://evil.com/x") && !allowedEndpoint("http://fcm.googleapis.com/x") && !allowedEndpoint("https://169.254.169.254/latest") && !allowedEndpoint("https://fcm.googleapis.com.evil.com/x"), "rechaza sitios no oficiales / internos / http");

console.log("\n[llave pública]");
let r = await (await call({ action: "key" })).json();
ok(typeof r.publicKey === "string" && unb64u(r.publicKey).length === 65, "genera y devuelve la llave pública (65 bytes)");
const r2 = await (await call({ action: "key" })).json();
ok(r.publicKey === r2.publicKey && db.push_config[0].vapid, "es estable y quedó guardada en la base");

console.log("\n[suscripción]");
const dev = await newDevice();
let res = await call({ action: "subscribe", subscription: dev.sub, prefs: { tz: "America/Mexico_City", hour: 19, minute: 0, days: [1, 2, 3, 4, 5], streakAlert: true, name: "Ricardo Test", streak: 5, lastPractice: "2026-10-30" } }, { token: "tok-ana" });
ok(res.status === 200 && db.push_subscriptions.length === 1, "guarda el dispositivo con la sesión correcta");
ok((await call({ action: "subscribe", subscription: dev.sub, prefs: {} })).status === 401, "sin sesión → 401");
ok((await call({ action: "subscribe", subscription: { endpoint: "https://evil.com/x", keys: dev.sub.keys }, prefs: {} }, { token: "tok-ana" })).status === 400, "endpoint no oficial → 400");
await call({ action: "subscribe", subscription: dev.sub, prefs: { tz: "Not/AZone", hour: 99, minute: -5, days: [9, "x"], name: "x".repeat(200), streak: "abc" } }, { token: "tok-ana" });
const row = db.push_subscriptions[0];
ok(db.push_subscriptions.length === 1 && row.tz === "UTC" && row.hour === 23 && row.minute === 0 && row.days.length === 7 && row.name.length === 40 && row.streak === 0, "reenvío = actualiza la misma fila y limpia datos inválidos");
await call({ action: "subscribe", subscription: dev.sub, prefs: { tz: "America/Mexico_City", hour: 19, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], streakAlert: true, name: "Ricardo Test", streak: 5, lastPractice: "2026-10-30" } }, { token: "tok-ana" });
for (let i = 0; i < 6; i++) await call({ action: "subscribe", subscription: (await newDevice("extra" + i)).sub, prefs: {} }, { token: "tok-beto" });
ok(db.push_subscriptions.filter((s) => s.user_id === "u-beto").length === 5, "máximo 5 dispositivos por usuario");

console.log("\n[notificación de prueba con cifrado real]");
res = await call({ action: "test" }, { token: "tok-ana" });
const tr = await res.json();
ok(res.status === 200 && tr.sent === 1, "envía la prueba");
const p1 = pushes[pushes.length - 1];
ok(p1.headers.get("content-encoding") === "aes128gcm" && /^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/.test(p1.headers.get("authorization") || "") && Number(p1.headers.get("ttl")) > 0, "cabeceras Web Push + VAPID correctas");
const msg = await decrypt(dev, p1.body);
ok(msg.title === "¡Funciona! 🎉" && msg.url === "./#/learn", "el dispositivo puede descifrar el mensaje: " + JSON.stringify(msg).slice(0, 60));
ok((await call({ action: "test" }, { token: "tok-ana" })).status === 429, "segunda prueba inmediata → límite de 30 s");

console.log("\n[decisión de enviar: reglas para no molestar]");
const base = { user_id: "u", endpoint: "e", p256dh: "p", auth: "a", tz: "America/Mexico_City", hour: 19, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], streak_alert: true, enabled: true, name: "Ana", streak: 5, last_practice: "2026-10-30", last_sent: null, last_alert: null, created_at: "2026-09-01T00:00:00Z" } as any;
// México (UTC-6 en noviembre 2026 sin horario de verano): 19:05 local = 01:05Z del día siguiente
const at = (iso: string) => new Date(iso);
ok(decide(base, at("2026-10-31T10:00:00Z"))?.kind === undefined, "04:00 local: no envía");
ok(decide(base, at("2026-11-01T01:05:00Z"))?.kind === "main", "19:05 local (31 oct) y no practicó hoy → recordatorio");
ok(decide({ ...base, last_practice: "2026-10-31" }, at("2026-11-01T01:05:00Z"))?.kind === "mark", "ya practicó hoy → no molesta (solo marca)");
ok(decide({ ...base, last_sent: "2026-10-31" }, at("2026-11-01T01:05:00Z")) === null, "ya se envió hoy → no repite");
ok(decide(base, at("2026-11-01T05:30:00Z")) === null, "23:30 local (fuera de ventana) → no envía");
ok(decide({ ...base, last_sent: "2026-10-31" }, at("2026-11-01T02:35:00Z")) === null, "20:35 local: aún no es hora del aviso (21:00)");
ok(decide({ ...base, last_sent: "2026-10-31" }, at("2026-11-01T03:05:00Z"))?.kind === "alert", "21:05 local sigue sin practicar con racha de 5 → aviso de racha en peligro");
ok(decide({ ...base, last_sent: "2026-10-31", streak: 1 }, at("2026-11-01T03:05:00Z")) === null, "racha de 1 día: no hay aviso de peligro");
ok(decide({ ...base, last_sent: "2026-10-31", streak_alert: false }, at("2026-11-01T03:05:00Z")) === null, "aviso de racha desactivado por el usuario");
ok(decide({ ...base, days: [1, 2, 3] }, at("2026-11-01T01:05:00Z")) === null, "domingo no está en sus días elegidos");
ok(decide({ ...base, last_practice: "2026-10-10" }, at("2026-11-01T01:05:00Z"))?.kind === "main" && decide({ ...base, last_practice: "2026-10-10", last_sent: "2026-10-29" }, at("2026-11-01T01:05:00Z")) === null, "14+ días sin practicar: máximo 1 aviso cada 5 días");
ok(decide({ ...base, last_practice: "2026-09-01" }, at("2026-11-01T01:05:00Z"))?.kind === "disable", "45+ días sin practicar: se desactiva solo");
ok(decide({ ...base, tz: "Asia/Tokyo", hour: 8 }, at("2026-10-31T23:10:00Z"))?.kind === "main", "zona horaria Tokio: 08:10 local");
ok(localParts("Zona/Mala", at("2026-11-01T01:05:00Z")).date === "2026-11-01", "zona horaria inválida no rompe");

console.log("\n[cron completo]");
db.push_subscriptions = [];
const dA = await newDevice("ana"), dB = await newDevice("beto"), dC = await newDevice("gone"), dD = await newDevice("done");
const mk = (dev: any, extra: any) => ({ id: ++seq, user_id: "u", endpoint: dev.sub.endpoint, p256dh: dev.sub.keys.p256dh, auth: dev.sub.keys.auth, tz: "America/Mexico_City", hour: 19, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], streak_alert: true, enabled: true, name: "Ana López", streak: 5, last_practice: "2026-10-30", last_sent: null, last_alert: null, fail_count: 0, created_at: "2026-09-01T00:00:00Z", ...extra });
db.push_subscriptions.push(mk(dA, {}), mk(dB, { last_practice: "2026-10-31" }), mk(dC, {}), mk(dD, { last_sent: "2026-10-31" }));
const now = new Date("2026-11-01T01:05:00Z"); const n0 = pushes.length;
const cr = await mod.runCron(now);
ok(cr.checked === 4 && cr.sent === 1 && cr.marked === 1 && cr.gone === 1, "resumen: " + JSON.stringify(cr));
ok(pushes.length - n0 === 2, "solo se contactó a 2 dispositivos (el que toca y el caducado)");
const sentAna = pushes.slice(n0).find((p) => p.url.includes("/ana"))!;
const m2 = await decrypt(dA, sentAna.body);
ok(/Ana/.test(m2.body) && /5/.test(m2.body) && m2.url === "./#/quick", "mensaje personalizado: " + m2.body);
ok(db.push_subscriptions.find((s) => s.endpoint.endsWith("/ana")).last_sent === "2026-10-31", "marca last_sent para no repetir");
ok(!db.push_subscriptions.some((s) => s.endpoint.endsWith("/gone")), "dispositivo caducado (410) se borra solo");
const cr2 = await mod.runCron(now);
ok(cr2.sent === 0, "segunda pasada del cron no repite el aviso");

console.log("\n[acceso al cron]");
ok((await call({ action: "cron" })).status === 401, "sin clave → 401");
ok((await call({ action: "cron" }, { cron: "mala" })).status === 401, "clave incorrecta → 401");
ok((await call({ action: "cron" }, { token: "tok-ana", cron: "cron-secret-123" })).status === 200, "clave correcta → 200");
ok((await call({ action: "nope" }, { token: "tok-ana" })).status === 400, "acción desconocida → 400");

console.log("\n[mensajes]");
const seen = new Set<string>(); for (let d = 1; d <= 20; d++) seen.add(buildMessage("main", { name: "Luis Pérez", streak: 0 }, `2026-11-${String(d).padStart(2, "0")}`, "e").body);
ok(seen.size >= 3 && [...seen].every((b) => b.includes("Luis") && !b.includes("Pérez")), `${seen.size} variantes distintas, usan solo el primer nombre`);
console.log("   ej:", buildMessage("alert", { name: "Luis", streak: 12 }, "d").body);
console.log(`\n${pass} correctas, ${fail} con error`);
Deno.exit(fail ? 1 : 0);
