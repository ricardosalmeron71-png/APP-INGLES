/* =========================================================
   DICCIONARIO: traduce palabras y frases en inglés (sin internet)
   Fuentes: vocabulario de las unidades, 734 verbos con todas sus formas,
   palabras del entrenador de pronunciación y DICT_EXTRA.
   ========================================================= */
window.Dict = (function () {
  const map = new Map();      // palabra → { es, base?, form? }
  const sentences = new Map(); // frase normalizada → traducción
  const reverse = new Map();  // palabra en español → [inglés]
  const normWord = (w) => String(w || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/^[^a-z']+|[^a-z']+$/g, '');
  const normSent = (s) => String(s || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const stripAccents = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const FORM = { past: 'pasado', pp: 'participio', ing: 'gerundio', s: '3ª persona' };

  function add(en, es, extra) {
    const k = normWord(en);
    if (!k || !es) return;
    if (!map.has(k)) map.set(k, { es, ...(extra || {}) });
    String(es).split(/\s*\/\s*|,\s*/).forEach((t) => {
      const r = stripAccents(t.replace(/\(.*?\)/g, '').trim());
      if (r && r.length > 1) { if (!reverse.has(r)) reverse.set(r, []); if (!reverse.get(r).includes(en)) reverse.get(r).push(en); }
    });
  }
  let built = false;
  function build() {
    if (built) return; built = true;
    const D = window.DATA || {};
    (D.UNITS || []).forEach((u) => {
      u.vocab.forEach(([en, es]) => { add(en, es); if (/\s/.test(en)) sentences.set(normSent(en), es); });
      u.sentences.forEach((s) => { sentences.set(normSent(s[0]), s[1]); s.slice(2).forEach((alt) => sentences.set(normSent(alt), s[1])); });
    });
    (D.DIALOGUES || []).forEach((d) => d.turns.forEach((t) => sentences.set(normSent(t.bot), t.es)));
    if (window.Pron) window.Pron.SOUNDS.forEach((s) => { s.words.forEach(([en, es]) => add(en, es)); s.sentences.forEach(([en, es]) => sentences.set(normSent(en), es)); sentences.set(normSent(s.twister[0]), s.twister[1]); });
    String(window.DICT_EXTRA || '').split('|').forEach((pair) => {
      const i = pair.indexOf('=');
      if (i > 0) add(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
    });
    if (window.Verbs) window.Verbs.list.forEach((v) => {
      add(v.base, v.es, { base: v.base });
      ['past', 'pp', 'ing', 's'].forEach((f) => v[f].forEach((form) => {
        const k = normWord(form);
        const cur = map.get(k);
        if (!cur || cur.verbForm) map.set(k, { es: v.es, base: v.base, form: FORM[f], verbForm: true, ...(cur && cur.verbForm && cur.form !== FORM[f] ? { form: `${cur.form} / ${FORM[f]}` } : {}) });
      }));
    });
  }

  /** Busca una palabra. Devuelve { word, es, base?, form?, proper? } o null */
  function word(raw, opts = {}) {
    build();
    const w = normWord(raw);
    if (!w) return null;
    const hit = (k, extra) => { const e = map.get(k); return e ? { word: w, ...e, ...(extra || {}) } : null; };
    let r = hit(w);
    if (r) return r;
    // posesivo 's
    if (/'s$/.test(w)) { r = hit(w.slice(0, -2)); if (r) return { ...r, word: w, form: 'posesivo (de …)' }; }
    // plurales y 3ª persona
    const tries = [];
    if (/ies$/.test(w)) tries.push([w.slice(0, -3) + 'y', 'plural']);
    if (/(ches|shes|xes|sses|oes)$/.test(w)) tries.push([w.slice(0, -2), 'plural']);
    if (/s$/.test(w) && !/ss$/.test(w)) tries.push([w.slice(0, -1), 'plural']);
    // comparativos / superlativos / adverbios
    if (/ier$/.test(w)) tries.push([w.slice(0, -3) + 'y', 'comparativo (más …)']);
    if (/iest$/.test(w)) tries.push([w.slice(0, -4) + 'y', 'superlativo (el más …)']);
    if (/er$/.test(w)) tries.push([w.slice(0, -2), 'comparativo (más …)'], [w.slice(0, -1), 'comparativo (más …)'], [w.slice(0, -3), 'comparativo (más …)']);
    if (/est$/.test(w)) tries.push([w.slice(0, -3), 'superlativo (el más …)'], [w.slice(0, -2), 'superlativo (el más …)']);
    if (/([bdgmnpt])\1(est|er)$/.test(w)) tries.push([w.replace(/([bdgmnpt])\1(est|er)$/, '$1'), /est$/.test(w) ? 'superlativo (el más …)' : 'comparativo (más …)']);
    if (/ily$/.test(w)) tries.push([w.slice(0, -3) + 'y', 'adverbio (-mente)']);
    if (/ly$/.test(w)) tries.push([w.slice(0, -2), 'adverbio (-mente)']);
    // verbos regulares que no están en la lista
    if (/ied$/.test(w)) tries.push([w.slice(0, -3) + 'y', 'pasado']);
    if (/ed$/.test(w)) tries.push([w.slice(0, -2), 'pasado'], [w.slice(0, -1), 'pasado'], [w.slice(0, -3), 'pasado']);
    if (/ing$/.test(w)) tries.push([w.slice(0, -3), 'gerundio'], [w.slice(0, -3) + 'e', 'gerundio'], [w.slice(0, -4), 'gerundio']);
    for (const [k, form] of tries) { r = hit(k); if (r) return { ...r, word: w, base: r.base || k, form }; }
    if (opts.capitalized) return { word: raw, es: '', proper: true };
    return null;
  }
  /** Traducción de una frase completa si la app la conoce */
  function sentence(text) { build(); return sentences.get(normSent(text)) || null; }
  /** Traducción palabra por palabra (para frases que no están en el diccionario de frases) */
  function gloss(text) {
    build();
    return (String(text).match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || []).map((t) => { const r = word(t); return [t, r ? r.es.split(' / ')[0] : '?']; });
  }
  /** Español → inglés (para explicar opciones en español) */
  function toEnglish(es) { build(); return reverse.get(stripAccents(String(es).replace(/\(.*?\)/g, '').trim())) || []; }
  /** Traduce un texto: frase conocida o, si no, palabra por palabra */
  function translate(text) {
    const s = sentence(text);
    if (s) return { text: s, exact: true };
    const g = gloss(text);
    if (!g.length) return null;
    if (g.length === 1) { const r = word(g[0][0]); return r && r.es ? { text: r.es, exact: true } : null; }
    return { text: g.map(([, es]) => es).join(' '), exact: false, gloss: g };
  }
  const has = (w) => { build(); return map.has(normWord(w)); };
  /* ¿El texto está en inglés? (para no traducir el español de la app) */
  const ES_STOP = new Set('el la los las un una unos unas de del al que en y es son está están estás por para con sin se su sus mi mis tu tus lo le les nos te muy más pero como qué cuál dónde cuándo quién porque cuando ya sí también hay este esta esto estos estas ese esa eso fue era ser estar tiene tienen puede puedes usa toca escribe elige escucha di frase palabra palabras respuesta correcta correcto lección hoy días día bien aquí todo todos nada otro otra cada hasta desde sobre entre ver vas hacer tú yo él ella ellos usted mañana tarde noche años año gracias hola sigue intenta otra vez significa'.split(' '));
  const EN_STOP = new Set('the an is are am was were be been i you he she it we they my your his her our their this that these those to of in on at for with from by and or but if not do does did have has had will would can could should what where when why how who which there here very so as than then just about'.split(' '));
  function looksEnglish(text) {
    const toks = String(text || '').match(/[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:['’][A-Za-z]+)*/g);
    if (!toks) return false;
    if (/[áéíóúñ¿¡]/i.test(text)) { const es = toks.filter((t) => /[áéíóúñ]/i.test(t) || ES_STOP.has(t.toLowerCase())).length; if (es >= Math.max(1, toks.length / 3)) return false; }
    build();
    let en = 0, es = 0;
    toks.forEach((t) => { const w = t.toLowerCase(); if (ES_STOP.has(w)) es += 1; else if (EN_STOP.has(w)) en += 1; else if (map.has(normWord(w)) || word(w)) en += 0.7; else if (/[áéíóúñ]/.test(w)) es += 1; });
    return en > es && en >= 0.7;
  }
  const size = () => { build(); return map.size; };

  return { word, sentence, gloss, toEnglish, translate, has, size, normWord, looksEnglish };
})();
