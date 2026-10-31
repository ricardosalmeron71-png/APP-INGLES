/* =========================================================
   ALMACENAMIENTO LOCAL: usuarios, progreso, plan y estadísticas
   (Los datos viven en el teléfono. Ver README para conectar un backend.)
   ========================================================= */
window.Store = (function () {
  const KEY = 'englishup_v1';
  const { LEVELS, UNITS, LESSON_TYPES, GOALS } = window.DATA;

  const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 86400000);
  const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id);

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { users: {}, current: null }; }
    catch (e) { return { users: {}, current: null }; }
  }
  let db = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(db)); }

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 5381; for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
      return 'x' + (h >>> 0).toString(16);
    }
  }

  function newProgress() {
    return {
      lessons: {}, xp: 0, xpByDay: {}, minutesByDay: {},
      streak: { count: 0, last: null, best: 0, freezes: 1 },
      skills: { vocab: { c: 0, t: 0 }, grammar: { c: 0, t: 0 }, listening: { c: 0, t: 0 }, speaking: { c: 0, t: 0 }, writing: { c: 0, t: 0 }, reading: { c: 0, t: 0 } },
      mistakes: [], words: {}, achievements: {}, speakCount: 0, writeCount: 0, writings: [], history: []
    };
  }

  async function register({ name, email, password }) {
    email = email.trim().toLowerCase();
    if (Object.values(db.users).some((u) => u.email === email)) throw new Error('Ya existe una cuenta con ese correo.');
    const id = 'u' + Date.now().toString(36);
    const salt = Math.random().toString(36).slice(2);
    db.users[id] = {
      id, name: name.trim(), email, salt, pass: await hash(salt + password), createdAt: Date.now(),
      onboarded: false, profile: { goal: 'talk', minutes: 10, reason: '', avatar: '🦉' },
      cefr: null, level: 'A1', placement: null, progress: newProgress(),
      settings: { accent: 'en-US', rate: 0.95, sound: true, dark: false, speakingOff: false }
    };
    db.current = id; save();
    return db.users[id];
  }

  async function login(email, password) {
    email = email.trim().toLowerCase();
    const u = Object.values(db.users).find((x) => x.email === email);
    if (!u || u.pass !== await hash(u.salt + password)) throw new Error('Correo o contraseña incorrectos.');
    db.current = u.id; save();
    return u;
  }
  function logout() { db.current = null; save(); }
  const user = () => (db.current ? db.users[db.current] : null);
  const allUsers = () => Object.values(db.users);
  function update(fn) { const u = user(); if (u) { fn(u); save(); } return u; }
  function deleteAccount() { const u = user(); if (u) { delete db.users[u.id]; db.current = null; save(); } }
  function exportData() { return JSON.stringify(user(), null, 2); }
  function importData(json) {
    const u = JSON.parse(json);
    if (!u || !u.id || !u.progress) throw new Error('Archivo no válido');
    db.users[u.id] = u; db.current = u.id; save();
  }

  /* ------------------ CURRÍCULO ------------------ */
  const lessonId = (unitId, type) => `${unitId}-${type}`;
  const unitsOf = (level) => UNITS.filter((u) => u.level === level);
  const isDone = (u, lid) => !!(u.progress.lessons[lid] && u.progress.lessons[lid].best >= 0);

  function unitDoneCount(u, unit) { return LESSON_TYPES.filter((t) => isDone(u, lessonId(unit.id, t.id))).length; }
  function unitMastered(u, unit) { const r = u.progress.lessons[lessonId(unit.id, 'review')]; return !!(r && r.best >= 80); }

  function isUnitUnlocked(u, unit) {
    const li = levelIndex(unit.level), cur = levelIndex(u.level);
    if (li < cur) return true;
    if (li > cur) return false;
    const list = unitsOf(unit.level);
    const idx = list.indexOf(unit);
    if (idx === 0) return true;
    return unitDoneCount(u, list[idx - 1]) >= 5 || unitMastered(u, list[idx - 1]);
  }
  function isLessonUnlocked(u, unit, typeIdx) {
    if (!isUnitUnlocked(u, unit)) return false;
    if (levelIndex(unit.level) < levelIndex(u.level)) return true;
    if (typeIdx === 0) return true;
    return isDone(u, lessonId(unit.id, LESSON_TYPES[typeIdx - 1].id));
  }

  function levelProgress(u, level) {
    const list = unitsOf(level);
    const total = list.length * LESSON_TYPES.length;
    const done = list.reduce((s, un) => s + unitDoneCount(u, un), 0);
    return { done, total, pct: total ? Math.round(100 * done / total) : 0 };
  }

  function nextLesson(u) {
    for (const lv of LEVELS.slice(levelIndex(u.level))) {
      for (const unit of unitsOf(lv.id)) {
        for (let i = 0; i < LESSON_TYPES.length; i++) {
          if (isLessonUnlocked(u, unit, i) && !isDone(u, lessonId(unit.id, LESSON_TYPES[i].id))) return { unit, type: LESSON_TYPES[i] };
        }
      }
    }
    return null;
  }

  /** Revisa si el usuario completó todas las unidades de su nivel → sube de nivel */
  function checkLevelUp(u) {
    const list = unitsOf(u.level);
    if (list.every((un) => unitMastered(u, un) || unitDoneCount(u, un) === LESSON_TYPES.length)) {
      const i = levelIndex(u.level);
      if (i < LEVELS.length - 1) {
        u.cefr = u.level;
        u.level = LEVELS[i + 1].id;
        u.progress.history.push({ date: Date.now(), event: 'levelup', level: u.level });
        return u.level;
      }
    }
    return null;
  }

  /* ------------------ RESULTADOS ------------------ */
  function addXP(u, xp) {
    const p = u.progress, d = today();
    p.xp += xp;
    p.xpByDay[d] = (p.xpByDay[d] || 0) + xp;
    // racha
    const s = p.streak;
    if (s.last !== d) {
      const gap = s.last ? daysBetween(s.last, d) : 1;
      if (gap === 1) s.count += 1;
      else if (gap === 2 && s.freezes > 0) { s.freezes -= 1; s.count += 1; }
      else s.count = 1;
      s.last = d;
      s.best = Math.max(s.best, s.count);
      if (s.count % 7 === 0) s.freezes = Math.min(3, s.freezes + 1);
    }
  }
  function currentStreak(u) {
    const s = u.progress.streak;
    if (!s.last) return 0;
    const gap = daysBetween(s.last, today());
    return gap <= 1 || (gap === 2 && s.freezes > 0) ? s.count : 0;
  }

  function recordSkill(u, skill, correct) {
    const sk = u.progress.skills[skill];
    if (!sk) return;
    sk.t += 1; if (correct) sk.c += 1;
  }

  function skillScores(u) {
    const out = {};
    const base = (u.placement && u.placement.skills) || {};
    for (const k of Object.keys(u.progress.skills)) {
      const s = u.progress.skills[k];
      const prior = base[k] != null ? base[k] : 50;
      // mezcla bayesiana: el resultado de la prueba de nivel pesa como 10 ejercicios
      out[k] = Math.round((prior * 10 + 100 * s.c) / (10 + s.t));
    }
    return out;
  }
  function weakSkills(u, n = 2) {
    return Object.entries(skillScores(u)).sort((a, b) => a[1] - b[1]).slice(0, n).map(([k]) => k);
  }

  function addMistake(u, ex) {
    const key = JSON.stringify([ex.type, ex.question || ex.source || ex.audio || ex.text || ex.sentence || '']);
    const list = u.progress.mistakes;
    if (list.some((m) => m.key === key)) return;
    list.push({ key, ex, date: Date.now() });
    if (list.length > 60) list.shift();
  }
  function clearMistake(u, ex) {
    const key = JSON.stringify([ex.type, ex.question || ex.source || ex.audio || ex.text || ex.sentence || '']);
    u.progress.mistakes = u.progress.mistakes.filter((m) => m.key !== key);
  }

  /* Repetición espaciada (sistema Leitner) para el vocabulario */
  const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];
  function learnWords(u, vocab) {
    vocab.forEach(([en, es, emoji]) => {
      if (!u.progress.words[en]) u.progress.words[en] = { es, emoji, box: 1, due: today(), seen: 1 };
    });
  }
  function reviewWord(u, en, knew) {
    const w = u.progress.words[en]; if (!w) return;
    w.box = knew ? Math.min(6, w.box + 1) : 1;
    const d = new Date(); d.setDate(d.getDate() + BOX_DAYS[w.box]);
    w.due = today(d); w.seen = (w.seen || 0) + 1;
  }
  function dueWords(u) { const t = today(); return Object.entries(u.progress.words).filter(([, w]) => w.due <= t); }

  function unlockAchievement(u, id) {
    if (u.progress.achievements[id]) return false;
    u.progress.achievements[id] = Date.now();
    return true;
  }
  function checkAchievements(u, ctx = {}) {
    const p = u.progress, got = [];
    const tryU = (id, cond) => { if (cond && unlockAchievement(u, id)) got.push(id); };
    tryU('first_lesson', Object.keys(p.lessons).length >= 1);
    tryU('perfect', ctx.perfect);
    tryU('streak3', p.streak.count >= 3);
    tryU('streak7', p.streak.count >= 7);
    tryU('streak30', p.streak.count >= 30);
    tryU('xp100', p.xp >= 100);
    tryU('xp1000', p.xp >= 1000);
    tryU('unit', UNITS.some((un) => unitMastered(u, un)));
    tryU('speaker', p.speakCount >= 20);
    tryU('writer', p.writeCount >= 5);
    tryU('words50', Object.keys(p.words).length >= 50);
    tryU('levelup', ctx.levelUp);
    tryU('chat', ctx.chat);
    tryU('review', ctx.review);
    tryU('social', Object.keys(u.friends || {}).length >= 1);
    return got;
  }

  /* ------------------ COMUNIDAD: comparar con otros usuarios ------------------ */
  function weekXP(u) {
    let s = 0;
    for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); s += u.progress.xpByDay[today(d)] || 0; }
    return s;
  }
  /** Resumen público del progreso (sin correo ni contraseña) */
  function summary(u) {
    return {
      v: 1, id: u.id, n: u.name, a: u.profile.avatar, c: u.cefr || 'A0', l: u.level,
      x: u.progress.xp, w: weekXP(u), s: currentStreak(u), b: u.progress.streak.best,
      ls: Object.keys(u.progress.lessons).length, wd: Object.keys(u.progress.words).length,
      ac: Object.keys(u.progress.achievements).filter((k) => !k.startsWith('chat_')).length,
      k: skillScores(u), lp: LEVELS.map((L) => levelProgress(u, L.id).pct), t: Date.now()
    };
  }
  const b64e = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64d = (str) => decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))));
  function encodeSummary(u) { return b64e(JSON.stringify(summary(u))); }

  /** Decodifica y valida un código recibido (dato externo: se limpia todo) */
  function decodeSummary(code) {
    let o;
    try { o = JSON.parse(b64d(String(code).trim())); } catch (e) { throw new Error('El código no es válido. Cópialo completo e inténtalo de nuevo.'); }
    if (!o || o.v !== 1 || typeof o.id !== 'string') throw new Error('El código no es válido.');
    const num = (x, max = 1e7) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));
    const lvl = (x, def) => (LEVELS.some((L) => L.id === x) ? x : def);
    const k = {};
    Object.keys(window.DATA.SKILLS).forEach((key) => { k[key] = num(o.k && o.k[key], 100); });
    return {
      v: 1, id: o.id.slice(0, 40), n: String(o.n || 'Amigo').slice(0, 40), a: String(o.a || '🙂').slice(0, 8),
      c: o.c === 'A0' ? 'A0' : lvl(o.c, 'A0'), l: lvl(o.l, 'A1'),
      x: num(o.x), w: num(o.w), s: num(o.s, 10000), b: num(o.b, 10000), ls: num(o.ls, 10000), wd: num(o.wd, 100000), ac: num(o.ac, 100),
      k, lp: LEVELS.map((_, i) => num(o.lp && o.lp[i], 100)), t: Math.min(Date.now(), num(o.t, 1e14))
    };
  }
  function addFriend(u, code) {
    const snap = decodeSummary(code);
    if (snap.id === u.id) throw new Error('Ese es tu propio código 😄. Compártelo con tus amigos.');
    u.friends = u.friends || {};
    const isNew = !u.friends[snap.id];
    u.friends[snap.id] = snap;
    return { snap, isNew };
  }
  function removeFriend(u, id) { if (u.friends) delete u.friends[id]; }

  /** Lista para el ranking: yo + usuarios de este teléfono (en vivo) + amigos (última copia compartida) */
  function community(u) {
    const list = [{ ...summary(u), me: true, src: 'me' }];
    Object.values(db.users).forEach((o) => { if (o.id !== u.id && o.onboarded) list.push({ ...summary(o), src: 'local' }); });
    Object.values(u.friends || {}).forEach((f) => {
      if (list.some((x) => x.id === f.id)) return;
      const stale = Date.now() - f.t > 7 * 86400000;
      list.push({ ...f, w: stale ? 0 : f.w, src: 'friend' });
    });
    return list;
  }

  /* ------------------ PLAN DE APRENDIZAJE ------------------ */
  function buildPlan(u) {
    const minutes = u.profile.minutes || 10;
    const goal = GOALS.find((g) => g.id === u.profile.goal) || GOALS[4];
    const dailyXP = { 5: 30, 10: 50, 15: 80, 20: 100, 30: 150 }[minutes] || 50;
    const lessonsPerDay = Math.max(1, Math.round(minutes / 5));
    const weak = weakSkills(u, 2);
    const scores = skillScores(u);

    // Lecciones restantes hasta el nivel objetivo
    const targetIdx = Math.max(levelIndex(goal.target), levelIndex(u.level));
    let remaining = 0;
    for (let i = levelIndex(u.level); i <= targetIdx; i++) {
      const lp = levelProgress(u, LEVELS[i].id); remaining += lp.total - lp.done;
    }
    const days = Math.ceil(remaining / (lessonsPerDay * 6 / 7));
    const eta = new Date(); eta.setDate(eta.getDate() + days);

    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const focusMap = { vocab: 'Vocabulario', grammar: 'Gramática', listening: 'Escucha', speaking: 'Pronunciación', writing: 'Escritura', reading: 'Lectura' };
    const rotation = ['vocab', 'grammar', 'listening', 'speaking', 'writing', 'reading'];
    const week = dayNames.map((name, i) => {
      if (i === 6) return { name, focus: 'Repaso', icon: '🧠', items: ['Tarjetas de vocabulario', 'Repasar errores', 'Conversación'] };
      const main = i % 2 === 0 ? weak[(i / 2) % weak.length] : rotation[i % rotation.length];
      return {
        name, focus: focusMap[main], icon: window.DATA.SKILLS[main].icon,
        items: [`${lessonsPerDay} lección(es) del camino`, `Práctica extra de ${focusMap[main].toLowerCase()}`, minutes >= 15 ? 'Tarjetas de vocabulario' : null].filter(Boolean)
      };
    });

    const recs = [];
    if (scores.speaking < 60) recs.push('Practica la pronunciación en voz alta a diario en el Laboratorio de voz 🎤.');
    if (scores.writing < 60) recs.push('Escribe un texto corto cada semana en el Laboratorio de escritura ✍️.');
    if (scores.listening < 60) recs.push('Usa el botón 🐢 para escuchar despacio y luego a velocidad normal.');
    if (scores.grammar < 60) recs.push('Lee el consejo gramatical 💡 antes de cada lección de gramática.');
    if (scores.vocab < 60) recs.push('Repasa tus tarjetas de vocabulario todos los días: 5 minutos bastan.');
    if (goal.id === 'travel') recs.push('Prioriza las unidades "Viajes", "La ciudad" y la conversación "Hotel".');
    if (goal.id === 'work') recs.push('Enfócate en "Trabajo", "Negocios" y la conversación "Entrevista de trabajo".');
    if (goal.id === 'exam') recs.push('Completa los repasos de unidad con 80%+ para simular condiciones de examen.');
    if (!recs.length) recs.push('¡Vas muy bien! Mantén tu racha y sube la dificultad.');

    return { goal, dailyXP, lessonsPerDay, minutes, weak, week, remaining, days, eta: eta.toISOString(), target: LEVELS[targetIdx].id, recs };
  }

  return {
    today, daysBetween, levelIndex, save, register, login, logout, user, allUsers, update, deleteAccount, exportData, importData,
    lessonId, unitsOf, isDone, unitDoneCount, unitMastered, isUnitUnlocked, isLessonUnlocked, levelProgress, nextLesson, checkLevelUp,
    addXP, currentStreak, recordSkill, skillScores, weakSkills, addMistake, clearMistake, learnWords, reviewWord, dueWords,
    checkAchievements, buildPlan, summary, encodeSummary, decodeSummary, addFriend, removeFriend, community, weekXP
  };
})();
