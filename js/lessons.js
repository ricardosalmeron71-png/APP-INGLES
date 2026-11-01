/* =========================================================
   GENERADOR DE LECCIONES
   Crea los ejercicios de cada lección a partir de los datos de la unidad.
   Tipos: intro, choice, picture, match, translate (escribir o banco de palabras),
          fill, listen_choice, listen_type, speak, read, free_write
   ========================================================= */
window.Lessons = (function () {
  const { UNITS } = window.DATA;
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const sameLevelVocab = (unit) => UNITS.filter((u) => u.level === unit.level).flatMap((u) => u.vocab);
  const sameLevelSentences = (unit) => UNITS.filter((u) => u.level === unit.level).flatMap((u) => u.sentences);

  function choiceFrom(correct, pool, n = 4, key = (x) => x) {
    const others = shuffle(pool.filter((p) => key(p) !== key(correct))).slice(0, n - 1);
    const opts = shuffle([correct, ...others]);
    return { options: opts, answer: opts.indexOf(correct) };
  }

  function tokens(sentence) { return sentence.replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean); }
  function wordBank(sentence, unit) {
    const words = tokens(sentence);
    const extra = shuffle(sameLevelSentences(unit).flatMap((s) => tokens(s[0])).filter((w) => !words.map((x) => x.toLowerCase()).includes(w.toLowerCase())));
    const distractors = [...new Set(extra)].slice(0, Math.min(4, Math.max(2, Math.round(words.length / 2))));
    return shuffle([...words, ...distractors]);
  }

  /* ---------- generadores por habilidad ---------- */
  function vocabExercises(unit) {
    const pool = sameLevelVocab(unit);
    const out = [];
    unit.vocab.forEach((v) => out.push({ type: 'intro', skill: 'vocab', word: v[0], meaning: v[1], emoji: v[2] }));
    pick(unit.vocab, 3).forEach((v) => {
      const c = choiceFrom(v, pool, 4, (x) => x[0]);
      out.push({ type: 'picture', skill: 'vocab', question: `¿Cuál es "${v[1]}"?`, options: c.options.map((o) => ({ text: o[0], emoji: o[2] })), answer: c.answer, audioOptions: true });
    });
    pick(unit.vocab, 3).forEach((v) => {
      const c = choiceFrom(v, pool, 4, (x) => x[0]);
      out.push({ type: 'choice', skill: 'vocab', question: `¿Qué significa "${v[0]}"?`, audio: v[0], options: c.options.map((o) => o[1]), answer: c.answer });
    });
    out.push({ type: 'match', skill: 'vocab', question: 'Une las parejas', pairs: pick(unit.vocab, 5).map((v) => [v[0], v[1]]) });
    pick(unit.vocab, 2).forEach((v) => out.push({ type: 'translate', skill: 'vocab', question: 'Escribe en inglés', source: `${v[2]} ${v[1]}`, answers: [v[0]] }));
    return out;
  }

  function grammarExercises(unit) {
    const out = [{ type: 'tip', skill: 'grammar', tip: unit.tip }];
    unit.grammar.forEach((g) => out.push({ type: 'fill', skill: 'grammar', question: 'Completa la oración', sentence: g.q, options: g.o, answer: g.a, explain: g.e }));
    pick(unit.sentences, 3).forEach((s) => out.push({ type: 'translate', skill: 'grammar', question: 'Ordena las palabras para traducir', source: s[1], answers: [s[0], ...s.slice(2)], bank: wordBank(s[0], unit) }));
    pick(unit.grammar, 2).forEach((g) => {
      const correct = g.q.replace('___', g.o[g.a]);
      const wrong = g.o.filter((_, i) => i !== g.a).map((o) => g.q.replace('___', o));
      const opts = shuffle([correct, ...wrong]);
      out.push({ type: 'choice', skill: 'grammar', question: '¿Qué oración es correcta?', options: opts, answer: opts.indexOf(correct), explain: g.e, speakOptions: true, sayAfter: correct });
    });
    return out;
  }

  function listeningExercises(unit) {
    const out = [];
    const pool = sameLevelSentences(unit);
    pick(unit.vocab, 2).forEach((v) => {
      const c = choiceFrom(v, sameLevelVocab(unit), 4, (x) => x[0]);
      out.push({ type: 'listen_choice', skill: 'listening', question: '¿Qué palabra escuchas?', audio: v[0], options: c.options.map((o) => `${o[2]} ${o[0]}`), answer: c.answer });
    });
    pick(unit.sentences, 3).forEach((s) => {
      const c = choiceFrom(s, pool, 3, (x) => x[0]);
      out.push({ type: 'listen_choice', skill: 'listening', question: '¿Qué significa lo que escuchas?', audio: s[0], options: c.options.map((o) => o[1]), answer: c.answer });
    });
    pick(unit.sentences, 3).forEach((s) => out.push({ type: 'listen_type', skill: 'listening', question: 'Escribe lo que escuchas', audio: s[0], answers: [s[0], ...s.slice(2)], translation: s[1] }));
    pick(unit.sentences, 2).forEach((s) => out.push({ type: 'translate', skill: 'listening', question: 'Escucha y ordena', audio: s[0], source: '🎧', answers: [s[0]], bank: wordBank(s[0], unit) }));
    return out;
  }

  function speakingExercises(unit) {
    const out = [];
    pick(unit.vocab, 3).forEach((v) => out.push({ type: 'speak', skill: 'speaking', question: 'Pronuncia la palabra', text: v[0], translation: `${v[2]} ${v[1]}` }));
    pick(unit.sentences, 4).forEach((s) => out.push({ type: 'speak', skill: 'speaking', question: 'Lee en voz alta', text: s[0], translation: s[1] }));
    pick(unit.sentences, 2).forEach((s) => out.push({ type: 'speak', skill: 'speaking', question: 'Di en inglés', text: s[0], translation: s[1], hideText: true }));
    return out;
  }

  function writingExercises(unit) {
    const out = [];
    pick(unit.sentences, 4).forEach((s) => out.push({ type: 'translate', skill: 'writing', question: 'Traduce al inglés', source: s[1], answers: [s[0], ...s.slice(2)] }));
    pick(unit.grammar, 2).forEach((g) => out.push({ type: 'translate', skill: 'writing', question: 'Escribe la oración completa', source: g.q, hint: `Opciones: ${g.o.join(' / ')}`, answers: [g.q.replace('___', g.o[g.a])], explain: g.e }));
    out.push({ type: 'free_write', skill: 'writing', question: 'Escritura libre', prompt: unit.writing.prompt, min: unit.writing.min, keywords: unit.writing.keywords });
    return out;
  }

  function readingExercises(unit) {
    const r = unit.reading;
    const out = r.qs.map((q) => ({ type: 'read', skill: 'reading', title: r.title, text: r.text, question: q.q, options: q.o, answer: q.a }));
    const tf = unit.sentences.slice(0, 2).map((s) => ({ type: 'choice', skill: 'reading', question: `"${s[0]}"`, options: shuffle([s[1], ...pick(sameLevelSentences(unit).filter((x) => x[0] !== s[0]), 2).map((x) => x[1])]), answerText: s[1] }));
    tf.forEach((t) => { t.answer = t.options.indexOf(t.answerText); delete t.answerText; out.push(t); });
    out.push({ type: 'speak', skill: 'speaking', question: 'Lee en voz alta una frase del texto', text: (r.text.match(/^[^.!?]+[.!?]/) || [r.text])[0], translation: 'Primera frase del texto' });
    return out;
  }

  function reviewExercises(unit) {
    const all = [
      ...vocabExercises(unit).filter((e) => e.type !== 'intro'),
      ...grammarExercises(unit).filter((e) => e.type !== 'tip'),
      ...listeningExercises(unit),
      ...speakingExercises(unit),
      ...writingExercises(unit).filter((e) => e.type !== 'free_write'),
      ...readingExercises(unit).slice(0, 2)
    ];
    return pick(all, 14);
  }

  function build(unitId, type) {
    const unit = UNITS.find((u) => u.id === unitId);
    const gen = { vocab: vocabExercises, grammar: grammarExercises, listening: listeningExercises, speaking: speakingExercises, writing: writingExercises, reading: readingExercises, review: reviewExercises }[type];
    let list = gen(unit);
    // Mezcla manteniendo intro/tip al principio
    const head = list.filter((e) => e.type === 'intro' || e.type === 'tip');
    const tail = list.filter((e) => e.type !== 'intro' && e.type !== 'tip' && e.type !== 'free_write');
    const end = list.filter((e) => e.type === 'free_write');
    if (type === 'vocab') {
      // intercalar: presentar 4 palabras, luego ejercicios, luego 4 más
      const t = shuffle(tail);
      list = [...head.slice(0, 4), ...t.slice(0, 4), ...head.slice(4), ...t.slice(4)];
    } else if (type === 'reading') list = [...head, ...tail, ...end];
    else list = [...head, ...shuffle(tail), ...end];
    return { unit, type, exercises: list };
  }

  /* Práctica personalizada: mezcla de una habilidad entre unidades desbloqueadas */
  function practice(skill, units) {
    const gens = { vocab: vocabExercises, grammar: grammarExercises, listening: listeningExercises, speaking: speakingExercises, writing: writingExercises, reading: readingExercises };
    const list = units.flatMap((u) => gens[skill](u)).filter((e) => !['intro', 'tip', 'free_write'].includes(e.type));
    return pick(list, 10);
  }

  return { build, practice, shuffle, pick };
})();
