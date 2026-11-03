/* =========================================================
   TIEMPOS VERBALES: conjugación, guía y generadores de ejercicios
   9 tiempos × 6 personas × afirmativa / negativa / pregunta, para los 734 verbos.
   ========================================================= */
window.Tenses = (function () {
  const PERSONS = [
    { id: 'I', es: 'yo', be: 'am', beP: 'was', have: 'have', do: 'do' },
    { id: 'you', es: 'tú', be: 'are', beP: 'were', have: 'have', do: 'do' },
    { id: 'he', es: 'él', be: 'is', beP: 'was', have: 'has', do: 'does', third: true },
    { id: 'she', es: 'ella', be: 'is', beP: 'was', have: 'has', do: 'does', third: true },
    { id: 'we', es: 'nosotros', be: 'are', beP: 'were', have: 'have', do: 'do' },
    { id: 'they', es: 'ellos', be: 'are', beP: 'were', have: 'have', do: 'do' }
  ];
  const TENSES = [
    { id: 'ps', name: 'Presente simple', icon: '🔁', level: 'A1', use: 'Rutinas, hábitos y verdades generales.', aff: 'sujeto + verbo (he / she / it: + -s)', neg: "don't / doesn't + verbo", q: 'Do / Does + sujeto + verbo?', markers: ['every day', 'usually', 'always', 'on Mondays', 'often'] },
    { id: 'pc', name: 'Presente continuo', icon: '▶️', level: 'A1', use: 'Lo que está pasando ahora mismo.', aff: 'am / is / are + verbo-ing', neg: 'am / is / are + not + verbo-ing', q: 'Am / Is / Are + sujeto + verbo-ing?', markers: ['now', 'right now', 'at the moment', 'Look!'] },
    { id: 'past', name: 'Pasado simple', icon: '⏮️', level: 'A2', use: 'Acciones terminadas en un momento del pasado.', aff: 'sujeto + pasado (-ed o irregular)', neg: "didn't + verbo base", q: 'Did + sujeto + verbo base?', markers: ['yesterday', 'last week', 'two days ago', 'in 2015'] },
    { id: 'going', name: 'Futuro con going to', icon: '🗓️', level: 'A2', use: 'Planes que ya decidiste.', aff: 'am / is / are + going to + verbo', neg: 'am / is / are + not going to + verbo', q: 'Am / Is / Are + sujeto + going to + verbo?', markers: ['next weekend (plan)', 'this summer (plan)'] },
    { id: 'will', name: 'Futuro con will', icon: '🔮', level: 'A2', use: 'Decisiones del momento, promesas y predicciones.', aff: 'will + verbo', neg: "won't + verbo", q: 'Will + sujeto + verbo?', markers: ['tomorrow', 'next year', 'I think…', 'probably'] },
    { id: 'pastc', name: 'Pasado continuo', icon: '⏪', level: 'B1', use: 'Una acción en progreso en un momento del pasado.', aff: 'was / were + verbo-ing', neg: "wasn't / weren't + verbo-ing", q: 'Was / Were + sujeto + verbo-ing?', markers: ['at 8 p.m. yesterday', 'when…', 'while…'] },
    { id: 'pp', name: 'Presente perfecto', icon: '✅', level: 'B1', use: 'Experiencias, acciones que llegan hasta hoy o muy recientes.', aff: 'have / has + participio', neg: "haven't / hasn't + participio", q: 'Have / Has + sujeto + participio?', markers: ['ever', 'never', 'already', 'since 2020', 'for three years', 'this year'] },
    { id: 'pastp', name: 'Pasado perfecto', icon: '⏭️', level: 'B2', use: 'Algo que pasó ANTES de otra acción pasada.', aff: 'had + participio', neg: "hadn't + participio", q: 'Had + sujeto + participio?', markers: ['before…', 'by the time…', 'already (en el pasado)'] },
    { id: 'cond', name: 'Condicional', icon: '💭', level: 'B2', use: 'Situaciones imaginarias o hipotéticas (sería, haría).', aff: 'would + verbo', neg: "wouldn't + verbo", q: 'Would + sujeto + verbo?', markers: ['if I had…', 'in a perfect world'] }
  ];
  const byId = new Map(TENSES.map((t) => [t.id, t]));
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const POL = { aff: 'afirmativa', neg: 'negativa', q: 'pregunta' };

  /** Tiempos disponibles para un nivel (los demás se ven, pero se recomiendan después) */
  const forLevel = (level) => TENSES.filter((t) => LEVELS.indexOf(t.level) <= Math.max(0, LEVELS.indexOf(level)));

  /**
   * Conjuga un verbo. pol: 'aff' | 'neg' | 'q'.
   * Devuelve { text, vp, answers } — vp es la parte del verbo sin el sujeto (afirmativa).
   */
  function conj(v, tid, pid, pol = 'aff') {
    const P = PERSONS.find((x) => x.id === pid) || PERSONS[0];
    const S = P.id;
    const isBe = v.base === 'be';
    const base = v.base, past = v.past[0], pp = v.pp[0], ing = v.ing[0], s3 = v.s[0];
    const neg = pol === 'neg', q = pol === 'q';
    let aux = null, main = '';
    switch (tid) {
      case 'ps': if (isBe) aux = P.be; else if (neg || q) { aux = P.do; main = base; } else main = P.third ? s3 : base; break;
      case 'pc': aux = P.be; main = ing; break;
      case 'past': if (isBe) aux = P.beP; else if (neg || q) { aux = 'did'; main = base; } else main = past; break;
      case 'pastc': aux = P.beP; main = ing; break;
      case 'pp': aux = P.have; main = pp; break;
      case 'pastp': aux = 'had'; main = pp; break;
      case 'will': aux = 'will'; main = base; break;
      case 'going': aux = P.be; main = `going to ${base}`; break;
      case 'cond': aux = 'would'; main = base; break;
      default: main = base;
    }
    let words;
    if (q) words = [aux, S, main];
    else if (neg) words = [S, aux, 'not', main];
    else words = [S, aux, main];
    words = words.filter(Boolean);
    const text = q ? cap(words.join(' ')) + '?' : cap(words.join(' '));
    const vp = [aux, main].filter(Boolean).join(' ');
    // formas contraídas que no se pueden deducir (he's = he has; I'd = I had)
    const answers = [text];
    if (!q && !neg && tid === 'pp' && P.third) answers.push(`${cap(S)}'s ${pp}`);
    if (!q && !neg && tid === 'pastp') answers.push(`${cap(S)}'d ${pp}`);
    return { text, vp, answers, subject: S };
  }

  /* ------------------ DOMINIO POR TIEMPO ------------------ */
  const store = (u) => (u.progress.tenses = u.progress.tenses || {});
  function record(u, tid, ok) {
    if (!tid) return;
    const t = (store(u)[tid] = store(u)[tid] || { hist: [] });
    t.hist.push(ok ? 1 : 0); if (t.hist.length > 30) t.hist.shift();
  }
  function mastery(u, tid) {
    const t = store(u)[tid]; if (!t || !t.hist.length) return null;
    const h = t.hist.slice(-20);
    return Math.round(100 * (h.reduce((a, b) => a + b, 0) + 1) / (h.length + 2));
  }
  function weakest(u, list = TENSES) {
    return list.map((t) => ({ t, m: mastery(u, t.id) })).sort((a, b) => (a.m == null ? 50 : a.m) - (b.m == null ? 50 : b.m) || Math.random() - 0.5)[0].t;
  }

  /* ------------------ EJERCICIOS ------------------ */
  const shuffle = (a) => window.Lessons.shuffle(a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const usable = (verbs) => verbs.filter((v) => v.base !== 'be');
  const formula = (t, pol) => `${t.name} (${POL[pol]}): ${t[pol]}.`;

  /** Ruleta: construir la frase completa con las fichas */
  function buildEx(v, tid, pid, pol) {
    const t = byId.get(tid), c = conj(v, tid, pid, pol);
    const P = PERSONS.find((x) => x.id === pid);
    const correctTokens = c.text.replace(/\?$/, '').split(' ');
    const lower = new Set(correctTokens.map((w) => w.toLowerCase()));
    const pool = ['do', 'does', 'did', 'have', 'has', 'had', 'am', 'is', 'are', 'was', 'were', 'will', 'would', 'not', 'going', 'to', v.base, v.past[0], v.pp[0], v.ing[0], v.s[0]];
    const distract = shuffle([...new Set(pool)].filter((w) => !lower.has(w.toLowerCase()))).slice(0, 4);
    return {
      type: 'translate', skill: 'grammar', verb: v.base, tense: tid, strict: true,
      question: pol === 'q' ? 'Construye la pregunta' : pol === 'neg' ? 'Construye la frase negativa' : 'Construye la frase',
      source: `👤 ${P.id} (${P.es}) · ⚙️ ${v.base} (${v.es}) · ${t.icon} ${t.name}${pol !== 'aff' ? ` · ${pol === 'q' ? '❓ pregunta' : '🚫 negativa'}` : ''}`,
      answers: c.answers, bank: shuffle([...correctTokens, ...distract]),
      explain: `${formula(t, pol)} → ${c.text}`, sayAfter: c.text
    };
  }
  function ruletaSession(verbs, tid, level, n = 8) {
    const vs = usable(verbs);
    const pols = LEVELS.indexOf(level) >= 1 ? ['aff', 'neg', 'q', 'aff'] : ['aff', 'neg', 'aff'];
    return Array.from({ length: n }, (_, i) => buildEx(vs[i % vs.length], tid, pick(PERSONS).id, pols[i % pols.length]));
  }

  /* Detective: elegir el tiempo correcto según la pista de tiempo de la frase */
  // dis = tiempos que con esa pista son claramente incorrectos (errores típicos de hispanohablantes)
  const CUES = [
    { t: 'ps', dis: ['pc', 'pp', 'pastp'], cue: '"every day / on Mondays / every weekend" indican una rutina → presente simple', tpl: ['Every day, {S} {V}.', '{S} {V} every weekend.', 'On Mondays, {S} {V}.'] },
    { t: 'pc', dis: ['ps', 'pp', 'past'], cue: '"right now / at the moment" indican algo que pasa en este momento → presente continuo', tpl: ['Look! {S} {V} right now.', '{S} {V} at the moment.'] },
    { t: 'past', dis: ['ps', 'pp', 'will'], cue: '"yesterday / last week / ago" indican un pasado terminado → pasado simple (nunca presente perfecto)', tpl: ['Yesterday, {S} {V}.', '{S} {V} last week.', 'Two days ago, {S} {V}.'] },
    { t: 'pastc', dis: ['ps', 'pp', 'will'], cue: 'una acción EN PROGRESO en un momento del pasado → was / were + -ing', tpl: ['At 8 p.m. yesterday, {S} {V}.', '{S} {V} when the phone rang.'] },
    { t: 'pp', dis: ['ps', 'pc', 'past'], cue: '"since / so far" llegan hasta hoy → have / has + participio (en español diríamos "desde 2020 juega", pero en inglés no se usa presente)', tpl: ['{S} {V} since 2020.', '{S} {V} since last summer.', '{S} {V} three times so far this year.'] },
    { t: 'pastp', dis: ['ps', 'pp', 'will'], cue: 'pasó ANTES de otra acción pasada → had + participio', tpl: ['Before the class started, {S} {V}.', 'By the time we arrived, {S} {V}.'] },
    { t: 'will', dis: ['past', 'pp', 'pastp'], cue: '"tomorrow / next year / I think" hablan del futuro → will + verbo', tpl: ['Tomorrow, {S} {V}.', 'Next year, {S} {V}.', 'I think {S} {V} soon.'] },
    { t: 'cond', dis: ['ps', 'past', 'will'], cue: 'una situación imaginaria ("if I had…") → would + verbo (no "will")', tpl: ['If I had more time, {S} {V}.', 'In a perfect world, {S} {V}.'] }
  ];
  function detectiveEx(v, cueObj) {
    const pid = pick(PERSONS).id;
    const tpl = pick(cueObj.tpl);
    const correct = conj(v, cueObj.t, pid).vp;
    const others = cueObj.dis.map((tid) => conj(v, tid, pid).vp).filter((x) => x !== correct);
    const options = shuffle([correct, ...new Set(others)]);
    const subj = tpl.startsWith('{S}') ? cap(pid) : pid;
    const sentence = tpl.replace('{S}', subj).replace('{V}', `___ (${v.base})`);
    const full = tpl.replace('{S}', subj).replace('{V}', correct);
    const t = byId.get(cueObj.t);
    return { type: 'fill', skill: 'grammar', verb: v.base, tense: cueObj.t, question: '🕵️ ¿Qué tiempo pide la pista?', sentence, options, answer: options.indexOf(correct), explain: `${cueObj.cue}. Fórmula: ${t.aff}. → ${full}`, sayAfter: full };
  }
  function detectiveSession(verbs, tenseIds, n = 10) {
    const vs = usable(verbs);
    const cues = CUES.filter((c) => tenseIds.includes(c.t));
    return Array.from({ length: n }, (_, i) => detectiveEx(vs[i % vs.length], cues[i % cues.length]));
  }
  /** Tabla de ejemplo para la guía */
  function table(v, tid) {
    return ['I', 'she', 'they'].map((pid) => ({ pid, aff: conj(v, tid, pid, 'aff').text, neg: conj(v, tid, pid, 'neg').text, q: conj(v, tid, pid, 'q').text }));
  }

  return { PERSONS, TENSES, byId, forLevel, conj, record, mastery, weakest, ruletaSession, detectiveSession, table, CUES, POL };
})();
