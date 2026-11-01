/* =========================================================
   RECORDATORIOS Y NOTIFICACIONES
   - Con la nube conectada: notificaciones push que llegan aunque la app esté cerrada
     (un servidor las envía a la hora que elijas, solo si aún no practicaste).
   - Sin nube: aviso local mientras la app esté abierta.
   - En cualquier teléfono: recordatorio diario en el calendario (.ics).
   Diseñado para no molestar: máximo 2 avisos al día, nunca de madrugada, y cada vez menos
   si dejas de practicar.
   ========================================================= */
window.Notify = (function () {
  const cfg = window.EU_CONFIG || {};
  const St = () => window.Store;
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const hasNotif = () => 'Notification' in window;
  const permission = () => (hasNotif() ? Notification.permission : 'unsupported');
  const pushCapable = () => 'serviceWorker' in navigator && 'PushManager' in window && hasNotif();
  const DEFAULTS = { on: false, hour: 19, minute: 0, days: [0, 1, 2, 3, 4, 5, 6], streakAlert: true };
  const get = (u) => ({ ...DEFAULTS, ...((u && u.settings && u.settings.reminder) || {}) });
  const save = (patch) => St().update((x) => { x.settings.reminder = { ...DEFAULTS, ...(x.settings.reminder || {}), ...patch }; });
  const pad = (n) => String(n).padStart(2, '0');
  const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } };
  const canServerPush = (u) => pushCapable() && !!(window.Cloud && window.Cloud.connected(u)) && !(isIOS && !standalone());

  /** Último día con actividad (YYYY-MM-DD) */
  function lastPractice(u) {
    const days = Object.keys(u.progress.xpByDay || {}).filter((k) => u.progress.xpByDay[k] > 0).sort();
    return days.length ? days[days.length - 1] : null;
  }
  const b64uToBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), (c) => c.charCodeAt(0));
  const sameKey = (buf, bytes) => { const a = new Uint8Array(buf); return a.length === bytes.length && a.every((v, i) => v === bytes[i]); };

  function status(u) {
    const r = get(u);
    if (!hasNotif()) return { state: 'unsupported', text: 'Este navegador no permite notificaciones. Usa el recordatorio de calendario de abajo.' };
    if (permission() === 'denied') return { state: 'denied', text: '⚠️ Las notificaciones están bloqueadas para este sitio. Actívalas en los ajustes del navegador (candado junto a la dirección) y vuelve a intentarlo.' };
    if (isIOS && !standalone()) return { state: 'ios-install', text: 'ℹ️ En iPhone las notificaciones solo funcionan con la app instalada: toca Compartir → "Agregar a inicio", ábrela desde ahí y actívalas.' };
    if (r.on && r.mode === 'push') return { state: 'push', text: '✅ Activo: te avisaremos aunque la app esté cerrada.' };
    if (r.on) return { state: 'local', text: `ℹ️ Funciona mientras la app esté abierta.${window.Cloud && window.Cloud.enabled() ? ' Para recibirlos con la app cerrada, conecta la nube en tu perfil y vuelve a activarlo.' : ''}${r.pushError ? ' (' + r.pushError + ')' : ''}` };
    return { state: 'off', text: '' };
  }

  function prefsPayload(u, r) {
    return { tz: tz(), hour: r.hour, minute: r.minute, days: r.days, streakAlert: r.streakAlert, name: u.name, streak: St().currentStreak(u), lastPractice: lastPractice(u) };
  }
  async function subscribePush(u, r) {
    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await window.Cloud.remindersCall(u, { action: 'key' });
    const key = b64uToBytes(publicKey);
    let sub = await reg.pushManager.getSubscription();
    if (sub && sub.options && sub.options.applicationServerKey && !sameKey(sub.options.applicationServerKey, key)) { await sub.unsubscribe(); sub = null; }
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await window.Cloud.remindersCall(u, { action: 'subscribe', subscription: sub.toJSON(), prefs: prefsPayload(u, r) });
    return sub.endpoint;
  }

  /** Activa los recordatorios (debe llamarse desde un toque del usuario). Devuelve 'push' o 'local'. */
  async function enable(prefs = {}) {
    const u = St().user();
    if (!hasNotif()) throw new Error('unsupported');
    if (isIOS && !standalone()) throw new Error('ios-install');
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('denied');
    const patch = { ...prefs, on: true, pushError: null };
    const r = { ...get(u), ...prefs };
    if (canServerPush(u)) {
      try { patch.endpoint = await subscribePush(u, r); patch.mode = 'push'; }
      catch (e) { patch.mode = 'local'; patch.endpoint = null; patch.pushError = String(e.message || e).slice(0, 120); }
    } else patch.mode = 'local';
    save(patch);
    return patch.mode;
  }
  /** Guarda cambios (hora, días…) y los envía al servidor si corresponde */
  let updTimer = null;
  function update(patch) {
    save(patch);
    clearTimeout(updTimer);
    updTimer = setTimeout(async () => {
      const u = St().user(), r = get(u);
      if (r.on && r.mode === 'push' && canServerPush(u)) { try { await subscribePush(u, r); } catch (e) { /* se reintenta al abrir la app */ } }
    }, 900);
  }
  async function disable() {
    const u = St().user(), r = get(u);
    try {
      if (r.mode === 'push' && window.Cloud && window.Cloud.connected(u) && r.endpoint) await window.Cloud.remindersCall(u, { action: 'unsubscribe', endpoint: r.endpoint });
      if (pushCapable()) { const reg = await navigator.serviceWorker.getRegistration(); const sub = reg && await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); }
    } catch (e) { /* aun así se apaga */ }
    save({ on: false, endpoint: null, mode: null });
  }
  /** Al abrir la app: renueva la suscripción si el navegador la perdió o cambió */
  async function refresh() {
    const u = St().user(); if (!u) return;
    const r = get(u);
    if (!r.on) return;
    if (permission() === 'denied') { save({ on: false, endpoint: null, mode: null }); return; }
    // Si antes no había servidor de recordatorios (modo local por error), intenta pasar a push ahora
    if (r.mode === 'local' && r.pushError && canServerPush(u) && permission() === 'granted') {
      try { save({ endpoint: await subscribePush(u, r), mode: 'push', pushError: null }); } catch (e) { /* todavía no está disponible */ }
      return;
    }
    if (r.mode === 'push' && canServerPush(u) && permission() === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription();
        if (!sub || sub.endpoint !== r.endpoint) save({ endpoint: await subscribePush(u, r) });
      } catch (e) { /* sin conexión: se intenta otro día */ }
    }
  }

  /* ------------------ AVISO LOCAL (app abierta) ------------------ */
  const LOCAL = {
    streak: (n, f) => [`🔥 ${n} días de racha. ${f}hoy toca mantenerla: 5 minutos y listo.`, `🦉 ${f}tu racha de ${n} días te espera. ¡Una práctica rápida!`],
    fresh: (f) => [`👋 ${f}¿un poco de inglés hoy? Una lección rápida basta.`, `🎙️ ${f}hoy puedes mejorar tu pronunciación en 3 minutos.`, `🔤 ${f}¿repasamos unos verbos? Son solo 5 minutos.`]
  };
  async function showLocal(title, body, url = './#/quick') {
    try {
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      if (hasNotif() && Notification.permission === 'granted') {
        if (reg && reg.showNotification) { await reg.showNotification(title, { body, icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: 'englishup-local', data: { url }, lang: 'es' }); return true; }
        new Notification(title, { body, icon: './icons/icon-192.png', tag: 'englishup-local' }); return true;
      }
    } catch (e) { /* cae al aviso dentro de la app */ }
    return false;
  }
  function pickMessage(u) {
    const f = (u.name || '').trim().split(/\s+/)[0]; const first = f ? `${f}, ` : '';
    const n = St().currentStreak(u);
    const list = n >= 1 ? LOCAL.streak(n, first) : LOCAL.fresh(first);
    return list[new Date().getDate() % list.length];
  }
  let onLocal = null;
  const setLocalHandler = (fn) => { onLocal = fn; };
  /** Se llama cada minuto: avisa una vez al día, a la hora elegida, si aún no practicaste */
  async function localTick() {
    const u = St().user(); if (!u) return;
    const r = get(u);
    if (!r.on || r.mode === 'push') return;
    const now = new Date();
    if (!r.days.includes(now.getDay())) return;
    const mins = now.getHours() * 60 + now.getMinutes(), target = r.hour * 60 + r.minute;
    if (mins < target || mins > target + 180) return;
    const today = St().today();
    if (r.lastLocal === today) return;
    save({ lastLocal: today });
    if ((u.progress.xpByDay[today] || 0) > 0) return;
    const body = pickMessage(u);
    const shown = await showLocal('Hora de practicar 🦉', body);
    if (onLocal) onLocal(body, shown);
  }
  async function test() {
    const u = St().user(), r = get(u);
    if (r.mode === 'push' && canServerPush(u)) {
      const res = await window.Cloud.remindersCall(u, { action: 'test' });
      if (res.sent) return 'push';
    }
    const ok = await showLocal('¡Funciona! 🎉', 'Así te recordaré practicar inglés.', './#/learn');
    if (!ok) throw new Error('No se pudo mostrar la notificación. Revisa el permiso del navegador.');
    return 'local';
  }

  /* ------------------ CALENDARIO (.ics) ------------------ */
  function icsText(u) {
    const r = get(u), now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (now.getHours() * 60 + now.getMinutes() >= r.hour * 60 + r.minute ? 1 : 0));
    const dt = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(r.hour)}${pad(r.minute)}00`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const names = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byday = r.days.length && r.days.length < 7 ? `;BYDAY=${[...r.days].sort().map((x) => names[x]).join(',')}` : '';
    const url = (location.origin + location.pathname).replace(/index\.html$/, '');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//EnglishUp//ES', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT', 'UID:englishup-daily@englishup', `DTSTAMP:${stamp}`, `DTSTART:${dt}`, 'DURATION:PT10M', `RRULE:FREQ=DAILY${byday}`,
      'SUMMARY:🦉 Practicar inglés (EnglishUp)', `DESCRIPTION:Tu práctica diaria de 5 minutos. Abre la app: ${url}`, `URL:${url}`,
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Hora de practicar inglés', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function downloadIcs(u) {
    const blob = new Blob([icsText(u)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'englishup-recordatorio.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  return { get, save, status, enable, update, disable, refresh, localTick, setLocalHandler, test, icsText, downloadIcs, lastPractice, canServerPush, isIOS, standalone, permission, DEFAULTS };
})();
