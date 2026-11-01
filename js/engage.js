/* =========================================================
   MOTIVACIÓN DIARIA
   Misiones del día + cofre, rangos de jugador, hitos de racha,
   palabra del día, resumen semanal y "siguiente paso" sugerido.
   Lógica pura sobre el objeto del usuario (sin DOM).
   Diseño: premiar y celebrar; nunca culpar. La racha tiene protectores.
   ========================================================= */
window.Eng = (function () {
  const St = () => window.Store;
  const { UNITS, LEVELS } = window.DATA;

  /* ------------------ CONTADORES DEL DÍA ------------------ */
  function daily(u, d) {
    const p = u.progress;
    p.daily = p.daily || {};
    const k = d || St().today();
    return (p.daily[k] = p.daily[k] || {});
  }
  function track(u, kind, n = 1) {
    const d = daily(u);
    d[kind] = (d[kind] || 0) + n;
    const keys = Object.keys(u.progress.daily);
    if (keys.length > 70) keys.sort().slice(0, keys.length - 70).forEach((k) => delete u.progress.daily[k]);
  }

  /* ------------------ MISIONES ------------------ */
  const POOL = {
    xp: { icon: '💎', kind: 'xp', reward: 10, text: (t) => `Gana ${t} XP hoy` },
    lessons: { icon: '📚', kind: 'lessons', target: 1, reward: 10, text: () => 'Completa 1 lección' },
    verbs: { icon: '🔤', kind: 'verbs', target: 10, reward: 10, text: () => 'Responde 10 preguntas de verbos' },
    pron: { icon: '🎙️', kind: 'pron', target: 6, reward: 10, text: () => 'Pronuncia 6 palabras o frases' },
    cards: { icon: '🃏', kind: 'cards', target: 8, reward: 10, text: () => 'Repasa 8 tarjetas de vocabulario', needs: 'words' },
    tutor: { icon: '🤖', kind: 'tutor', target: 3, reward: 15, text: () => 'Platica 3 mensajes con el tutor IA', needs: 'cloud' }
  };
  function seeded(str) { // número pseudoaleatorio estable a partir de un texto
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  }
  const cloudOn = (u) => !!(window.Cloud && window.Cloud.connected(u));
  function questState(u) {
    const p = u.progress; p.quests = p.quests || {};
    const d = St().today();
    if (!p.quests[d]) {
      const rnd = seeded(d + u.id);
      const pool = Object.keys(POOL).filter((id) => id !== 'xp' && (POOL[id].needs !== 'words' || Object.keys(p.words || {}).length >= 4) && (POOL[id].needs !== 'cloud' || cloudOn(u)));
      pool.sort(() => rnd() - 0.5);
      const ids = ['xp', ...pool.slice(0, 2)];
      p.quests[d] = { ids, xpTarget: St().buildPlan(u).dailyXP, done: {}, chest: false };
      const keys = Object.keys(p.quests); if (keys.length > 30) keys.sort().slice(0, keys.length - 30).forEach((k) => delete p.quests[k]);
    }
    return p.quests[d];
  }
  function quests(u) {
    const q = questState(u), d = St().today();
    const counts = daily(u, d);
    return q.ids.map((id) => {
      const def = POOL[id];
      const target = id === 'xp' ? q.xpTarget : def.target;
      const progress = id === 'xp' ? (u.progress.xpByDay[d] || 0) : (counts[def.kind] || 0);
      return { id, icon: def.icon, text: def.text(target), target, progress, reward: def.reward, done: !!q.done[id] || progress >= target };
    });
  }
  const chestState = (u) => { const q = questState(u), list = quests(u); const all = list.every((x) => x.done); return all ? (q.chest ? 'opened' : 'ready') : 'locked'; };
  function openChest(u) {
    const q = questState(u);
    if (chestState(u) !== 'ready') return null;
    const rnd = seeded('chest' + St().today() + u.id);
    const xp = 25 + Math.floor(rnd() * 4) * 5;
    const s = u.progress.streak;
    const freeze = s.freezes < 3 && rnd() < 0.3;
    if (freeze) s.freezes += 1;
    St().addXP(u, xp);
    q.chest = true;
    return { xp, freeze };
  }

  /* ------------------ RANGOS ------------------ */
  const RANKS = [
    { xp: 0, name: 'Semilla', icon: '🌱' }, { xp: 100, name: 'Brote', icon: '🌿' }, { xp: 300, name: 'Explorador', icon: '🧭' },
    { xp: 600, name: 'Aventurero', icon: '🎒' }, { xp: 1000, name: 'Conversador', icon: '💬' }, { xp: 1600, name: 'Orador', icon: '📣' },
    { xp: 2500, name: 'Experto', icon: '🎓' }, { xp: 4000, name: 'Maestro', icon: '🏅' }, { xp: 6000, name: 'Leyenda', icon: '👑' }, { xp: 10000, name: 'Sabio', icon: '🦉' }
  ];
  function rank(xp) {
    let i = 0; RANKS.forEach((r, k) => { if (xp >= r.xp) i = k; });
    const next = RANKS[i + 1] || null;
    return { i, ...RANKS[i], next, toNext: next ? next.xp - xp : 0, pct: next ? Math.round(100 * (xp - RANKS[i].xp) / (next.xp - RANKS[i].xp)) : 100 };
  }

  /* ------------------ RACHA ------------------ */
  const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  function streak(u) {
    const cur = St().currentStreak(u), today = St().today();
    const names = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const k = St().today(d);
      return { date: k, label: names[d.getDay()], active: (u.progress.xpByDay[k] || 0) > 0, today: k === today };
    });
    const practicedToday = (u.progress.xpByDay[today] || 0) > 0;
    const hour = new Date().getHours();
    return { current: cur, best: u.progress.streak.best, freezes: u.progress.streak.freezes, week, practicedToday, atRisk: cur > 0 && !practicedToday, urgent: cur > 0 && !practicedToday && hour >= 17 };
  }

  /* ------------------ PALABRA DEL DÍA ------------------ */
  function wordOfDay(u) {
    const li = St().levelIndex(u.level);
    let units = UNITS.filter((x) => St().levelIndex(x.level) <= li);
    if (!units.length) units = UNITS;
    const all = units.flatMap((x) => x.vocab.map((v) => ({ en: v[0], es: v[1], emoji: v[2], unit: x })));
    const w = all[Math.floor(seeded('wod' + St().today() + u.id)() * all.length)];
    const sentence = w.unit.sentences.find((s) => s[0].toLowerCase().includes(w.en.toLowerCase().split(' ')[0]));
    return { en: w.en, es: w.es, emoji: w.emoji, example: sentence ? sentence[0] : null, exampleEs: sentence ? sentence[1] : null, learned: !!(u.progress.words || {})[w.en], taken: u.progress.wodTaken === St().today() };
  }

  /* ------------------ SEMANA ------------------ */
  function weekStats(u) {
    const sum = (from, to) => {
      let xp = 0, minutes = 0, lessons = 0, active = 0;
      for (let i = from; i < to; i++) {
        const d = new Date(); d.setDate(d.getDate() - i); const k = St().today(d);
        const x = u.progress.xpByDay[k] || 0; xp += x; if (x > 0) active++;
        minutes += u.progress.minutesByDay[k] || 0; lessons += ((u.progress.daily || {})[k] || {}).lessons || 0;
      }
      return { xp, minutes: Math.round(minutes), lessons, active };
    };
    const now = sum(0, 7), prev = sum(7, 14);
    const goal = St().buildPlan(u).dailyXP * 5;
    return { now, prev, goal, pct: Math.min(100, Math.round(100 * now.xp / goal)) };
  }

  /* ------------------ EVENTOS (se llaman tras cada cambio) ------------------ */
  /** Revisa misiones, rango, hitos y meta diaria. Devuelve los eventos nuevos para celebrar. */
  function sync(u) {
    const p = u.progress, events = [];
    // misiones (dos pasadas: el premio de una misión puede completar la de XP)
    for (let pass = 0; pass < 2; pass++) {
      const q = questState(u);
      quests(u).forEach((x) => {
        if (x.done && !q.done[x.id]) {
          q.done[x.id] = true; St().addXP(u, x.reward);
          events.push({ type: 'quest', quest: x });
        }
      });
    }
    const list = quests(u);
    if (list.every((x) => x.done) && !questState(u).allNotified) { questState(u).allNotified = true; events.push({ type: 'chest' }); }
    // meta diaria
    const plan = St().buildPlan(u);
    if ((p.xpByDay[St().today()] || 0) >= plan.dailyXP && p.goalSeen !== St().today()) { p.goalSeen = St().today(); events.push({ type: 'goal', xp: plan.dailyXP }); }
    // rango
    const r = rank(p.xp);
    if (p.rankSeen == null) p.rankSeen = r.i;
    else if (r.i > p.rankSeen) { p.rankSeen = r.i; events.push({ type: 'rank', rank: r }); }
    // hitos de racha
    const cur = St().currentStreak(u);
    const reached = MILESTONES.filter((m) => m <= cur).pop() || 0;
    if (p.streakSeen == null) p.streakSeen = reached;
    else if (reached > p.streakSeen) {
      p.streakSeen = reached;
      const bonus = reached >= 30 ? 50 : reached >= 7 ? 25 : 10;
      St().addXP(u, bonus);
      events.push({ type: 'streak', days: reached, bonus });
    } else if (reached < p.streakSeen) p.streakSeen = reached;
    return events;
  }

  /* ------------------ SIGUIENTE PASO ------------------ */
  function suggest(u) {
    const out = [], s = streak(u), ql = quests(u).filter((x) => !x.done);
    if (s.urgent) out.push({ icon: '🔥', title: `Protege tu racha de ${s.current} días`, desc: 'Con 5 minutos es suficiente.', href: '#/quick', cta: 'Práctica rápida' });
    if (ql.length) { const q = ql[0]; const href = { lessons: '#/learn', verbs: '#/verbs', pron: '#/coach', cards: '#/flashcards', tutor: '#/tutor', xp: '#/quick' }[q.id]; out.push({ icon: q.icon, title: q.text, desc: `${q.progress}/${q.target} · misión de hoy`, href, cta: 'Ir' }); }
    const dueV = window.Verbs ? window.Verbs.dueVerbs(u).length : 0;
    if (dueV) out.push({ icon: '🔤', title: `${dueV} verbos listos para repasar`, desc: 'Justo antes de olvidarlos.', href: '#/verbs/play/review/mix', cta: 'Repasar' });
    const dueW = St().dueWords(u).length;
    if (dueW) out.push({ icon: '🃏', title: `${dueW} palabras para repasar`, desc: 'Repaso espaciado.', href: '#/flashcards', cta: 'Repasar' });
    const nxt = St().nextLesson(u);
    if (nxt) out.push({ icon: nxt.type.icon, title: `${nxt.type.name}: ${nxt.unit.title}`, desc: 'Tu siguiente lección.', href: `#/lesson/${nxt.unit.id}/${nxt.type.id}`, cta: 'Empezar' });
    return out;
  }

  return { track, daily, quests, chestState, openChest, rank, RANKS, streak, MILESTONES, wordOfDay, weekStats, sync, suggest, POOL };
})();
