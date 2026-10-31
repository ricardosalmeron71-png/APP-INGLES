/* =========================================================
   NUBE (Supabase): cuentas, sincronización, ranking en vivo y tutor IA
   Usa la API REST de Supabase directamente (sin librerías externas).
   Si js/config.js no tiene datos, todo esto queda desactivado.
   ========================================================= */
window.Cloud = (function () {
  const cfg = window.EU_CONFIG || {};
  const URL_ = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const KEY = cfg.supabaseAnonKey || '';
  const enabled = () => !!(URL_ && KEY);
  const connected = (u) => enabled() && !!(u && u.cloud && u.cloud.refresh_token);

  class CloudError extends Error { constructor(msg, status) { super(msg); this.status = status; } }

  async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
    let res;
    try {
      res = await fetch(URL_ + path, {
        method,
        headers: { apikey: KEY, 'Content-Type': 'application/json', Authorization: `Bearer ${token || KEY}`, ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
      });
    } catch (e) { throw new CloudError('Sin conexión a internet.', 0); }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!res.ok) {
      const msg = (data && (data.error_description || data.msg || data.message || data.error)) || `Error ${res.status}`;
      throw new CloudError(translate(String(msg)), res.status);
    }
    return data;
  }
  function translate(msg) {
    if (/invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
    if (/already registered|already been registered/i.test(msg)) return 'Ese correo ya tiene una cuenta en la nube.';
    if (/email not confirmed/i.test(msg)) return 'Confirma tu correo (revisa tu bandeja de entrada) y vuelve a intentarlo.';
    if (/password should be/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.';
    if (/rate limit/i.test(msg)) return 'Demasiados intentos. Espera un momento.';
    return msg;
  }

  /* ------------------ AUTENTICACIÓN ------------------ */
  const toSession = (d) => ({ uid: d.user.id, access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + (d.expires_in || 3600) * 1000 });

  async function signUp(email, password, name) {
    const d = await request('/auth/v1/signup', { method: 'POST', body: { email, password, data: { name } } });
    if (d && d.access_token) return toSession(d);
    return null; // requiere confirmar el correo
  }
  async function signIn(email, password) {
    return toSession(await request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }));
  }
  /** Entra o, si la cuenta no existe en la nube, la crea. */
  async function signInOrUp(email, password, name) {
    try { return await signIn(email, password); }
    catch (e) {
      if (e.status !== 400) throw e;
      const s = await signUp(email, password, name);
      if (!s) throw new CloudError('Te enviamos un correo para confirmar tu cuenta. Confírmalo y vuelve a intentarlo.', 400);
      return s;
    }
  }

  /** Token válido para el usuario (lo renueva si está por vencer). */
  async function token(u) {
    const c = u.cloud;
    if (c.access_token && c.expires_at - Date.now() > 60000) return c.access_token;
    let d;
    try { d = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: c.refresh_token } }); }
    catch (e) {
      if (e.status === 400 || e.status === 401) window.Store.update((x) => { if (x.cloud) x.cloud.refresh_token = null; });
      throw new CloudError('Tu sesión en la nube expiró. Vuelve a conectarla en Perfil.', 401);
    }
    const s = toSession(d);
    window.Store.update((x) => { x.cloud = { ...x.cloud, ...s }; });
    return s.access_token;
  }

  /* ------------------ SINCRONIZACIÓN ------------------ */
  const privateCopy = (u) => { const { pass, salt, cloud, ...rest } = u; return rest; };

  async function push(u) {
    if (!connected(u)) return;
    const t = await token(u);
    const s = window.Store.summary(u);
    const now = new Date().toISOString();
    await request('/rest/v1/user_data', {
      method: 'POST', token: t, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { id: u.cloud.uid, data: privateCopy(u), updated_at: now }
    });
    await request(`/rest/v1/profiles?id=eq.${u.cloud.uid}`, {
      method: 'PATCH', token: t, headers: { Prefer: 'return=minimal' },
      body: { name: u.name, avatar: u.profile.avatar, is_public: u.settings.publicProfile !== false, summary: s, xp: s.x, week_xp: s.w, level: s.l, cefr: s.c, streak: s.s, updated_at: now }
    });
  }
  async function pull(u) {
    const t = await token(u);
    const rows = await request(`/rest/v1/user_data?id=eq.${u.cloud.uid}&select=data,updated_at`, { token: t });
    return rows && rows[0] ? rows[0] : null;
  }
  async function myProfile(u) {
    const t = await token(u);
    const rows = await request(`/rest/v1/profiles?id=eq.${u.cloud.uid}&select=friend_code,is_public`, { token: t });
    return rows && rows[0];
  }

  let timer = null, syncing = false;
  function scheduleSync() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const u = window.Store.user();
      if (!connected(u) || syncing) return;
      syncing = true;
      try { await push(u); window.Store.markSynced(); } catch (e) { /* se reintenta en el próximo cambio */ }
      syncing = false;
    }, 3000);
  }

  /* ------------------ COMUNIDAD ------------------ */
  const PROFILE_FIELDS = 'id,name,avatar,summary,xp,week_xp,level,cefr,streak,updated_at,friend_code';
  async function friends(u) {
    const t = await token(u);
    const rows = await request(`/rest/v1/friends?user_id=eq.${u.cloud.uid}&select=friend_id`, { token: t });
    if (!rows.length) return [];
    return request(`/rest/v1/profiles?id=in.(${rows.map((r) => r.friend_id).join(',')})&select=${PROFILE_FIELDS}`, { token: t });
  }
  async function leaderboard(u, sort) {
    const t = await token(u);
    const order = sort === 'xp' ? 'xp.desc' : sort === 'streak' ? 'streak.desc' : 'week_xp.desc';
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const recent = sort === 'week' || sort === 'streak' ? `&updated_at=gte.${since}` : '';
    return request(`/rest/v1/profiles?is_public=eq.true${recent}&select=${PROFILE_FIELDS}&order=${order}&limit=50`, { token: t });
  }
  async function addFriend(u, code) {
    const t = await token(u);
    return request('/rest/v1/rpc/add_friend', { method: 'POST', token: t, body: { code } });
  }
  async function removeFriend(u, fid) {
    const t = await token(u);
    return request('/rest/v1/rpc/remove_friend', { method: 'POST', token: t, body: { fid } });
  }

  /* ------------------ TUTOR IA ------------------ */
  async function tutor(u, payload) {
    const t = await token(u);
    return request('/functions/v1/tutor', { method: 'POST', token: t, body: payload });
  }

  return { enabled, connected, signUp, signIn, signInOrUp, push, pull, myProfile, scheduleSync, friends, leaderboard, addFriend, removeFriend, tutor, CloudError };
})();
