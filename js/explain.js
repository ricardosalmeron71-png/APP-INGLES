/* =========================================================
   EXPLICACIONES: por qué una respuesta está mal y cómo debería ser
   Se usa en la hoja de resultado de TODOS los ejercicios (lecciones, práctica,
   verbos, pronunciación, repasos, práctica rápida).
   ========================================================= */
window.Explain = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = () => window.Dict;
  const A = () => window.Analysis;
  const isEn = (t) => !!t && D() && D().looksEnglish(t);
  /** Traducción corta de un texto en inglés (o null) */
  function tr(text) {
    if (!text || !D()) return null;
    const words = String(text).match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || [];
    if (words.length === 1) {
      const r = D().word(words[0]);
      if (!r || !r.es) return null;
      return r.base && r.form && r.base !== D().normWord(words[0]) ? `${r.form} de ${r.base} (${r.es})` : r.es;
    }
    // frases: solo traducciones exactas (una traducción palabra por palabra confunde)
    return D().sentence(text);
  }
  /** Para una opción en español, su equivalente en inglés */
  function toEn(text) { const r = D() ? D().toEnglish(text) : []; return r.length ? r.slice(0, 2).join(' / ') : null; }
  /** "texto (= traducción)" según el idioma */
  function withMeaning(text) {
    if (!text) return '';
    if (isEn(text)) { const t = tr(text); return `<b>${esc(text)}</b>${t ? ` <span class="why-tr">= ${esc(t)}</span>` : ''}`; }
    const e = toEn(text);
    return `<b>${esc(text)}</b>${e ? ` <span class="why-tr">= en inglés: ${esc(e)}</span>` : ''}`;
  }

  /* ---------- comparación palabra por palabra (traducir / dictado) ---------- */
  const toks = (s) => (A() ? A().normalize(s) : String(s).toLowerCase()).split(' ').filter(Boolean);
  function diff(given, correct) {
    const g = toks(given), c = toks(correct);
    const m = g.length, n = c.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = g[i] === c[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const extra = [], missing = [], common = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (g[i] === c[j]) { common.push(g[i]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) extra.push(g[i++]);
      else missing.push(c[j++]);
    }
    while (i < m) extra.push(g[i++]);
    while (j < n) missing.push(c[j++]);
    // errores de ortografía: una palabra sobrante muy parecida a una faltante
    const sameWords = g.length === c.length && [...g].sort().join(' ') === [...c].sort().join(' ');
    const spelling = [];
    const close = (x, y) => x !== y && y.length > 2 && (A().levenshtein(x, y) <= Math.max(1, Math.floor(y.length / 4)) || (x.length === y.length && [...x].sort().join('') === [...y].sort().join('')) || (y.length >= 6 && A().levenshtein(x, y) <= 2));
    if (!sameWords) extra.slice().forEach((x) => {
      const k = missing.findIndex((y) => close(x, y));
      if (k >= 0) { spelling.push([x, missing[k]]); missing.splice(k, 1); extra.splice(extra.indexOf(x), 1); }
    });
    return { extra, missing, spelling, orderOnly: sameWords && g.join(' ') !== c.join(' '), givenTokens: g, correctTokens: c };
  }
  const NOTES = {
    a: 'artículo "un / una"', an: 'artículo "un / una" (antes de sonido vocal)', the: 'artículo "el / la / los / las"',
    am: 'verbo to be con "I"', is: 'verbo to be con he / she / it', are: 'verbo to be con you / we / they',
    do: 'auxiliar para preguntas y negativos', does: 'auxiliar con he / she / it', did: 'auxiliar del pasado',
    to: '"to" del infinitivo o preposición "a"', of: 'preposición "de"', in: 'preposición "en"', on: 'preposición "en / sobre"', at: 'preposición "en / a"',
    not: 'negación', will: 'auxiliar del futuro', have: 'tener / haber', has: 'tiene / ha (he, she, it)', been: 'participio de be (sido / estado)'
  };
  const wordNote = (w) => NOTES[w] || (tr(w) ? `"${tr(w)}"` : '');

  function grammarIssues(text) {
    if (!A() || !text || !isEn(text)) return [];
    try {
      return A().analyzeWriting(text, { min: 1 }).issues.filter((x) => x.type === 'error' && !/mayúscula|Ortografía|español/.test(x.msg)).map((x) => x.msg).slice(0, 2);
    } catch (e) { return []; }
  }

  /* ---------- reglas de verbos ---------- */
  const FORM_NAME = { past: 'pasado', pp: 'participio', ing: 'gerundio (-ing)', s: '3ª persona (he/she/it)' };
  function verbRule(ex, given) {
    const V = window.Verbs; if (!V || !ex.verb) return null;
    const v = V.byBase.get(ex.verb); if (!v) return null;
    const f = ex.form;
    const lines = [];
    if (f && v[f]) {
      const correct = v[f].join(' / ');
      if (v.irregular && (f === 'past' || f === 'pp')) lines.push(`"${v.base}" es un verbo <b>irregular</b>: su ${FORM_NAME[f]} es <b>${esc(correct)}</b>, no se forma con -ed.`);
      else if (f === 'past' || f === 'pp') {
        const b = v.base;
        if (/e$/.test(b)) lines.push(`Termina en <b>-e</b>: solo se agrega <b>-d</b> → ${esc(correct)}.`);
        else if (/[^aeiou]y$/.test(b)) lines.push(`Termina en consonante + <b>y</b>: la y cambia a <b>-ied</b> → ${esc(correct)}.`);
        else if (correct.startsWith(b + b.slice(-1))) lines.push(`Sílaba corta consonante-vocal-consonante: se <b>duplica</b> la última letra → ${esc(correct)}.`);
        else lines.push(`Verbo <b>regular</b>: se agrega <b>-ed</b> → ${esc(correct)}.`);
      } else if (f === 'ing') {
        const b = v.base;
        if (/ie$/.test(b)) lines.push(`Termina en <b>-ie</b>: cambia a <b>-ying</b> → ${esc(correct)}.`);
        else if (/[^e]e$/.test(b) && b.length > 2) lines.push(`Termina en <b>-e</b>: se quita la e y se agrega -ing → ${esc(correct)}.`);
        else if (correct.startsWith(b + b.slice(-1))) lines.push(`Sílaba corta consonante-vocal-consonante: se <b>duplica</b> la última letra → ${esc(correct)}.`);
        else lines.push(`Se agrega <b>-ing</b> a la base → ${esc(correct)}.`);
      } else if (f === 's') {
        if (/(s|sh|ch|x|z|o)$/.test(v.base)) lines.push(`Termina en s, sh, ch, x, z u o: se agrega <b>-es</b> → ${esc(correct)}.`);
        else if (/[^aeiou]y$/.test(v.base)) lines.push(`Consonante + y: cambia a <b>-ies</b> → ${esc(correct)}.`);
        else lines.push(`Con he / she / it se agrega <b>-s</b> → ${esc(correct)}.`);
      }
      // ¿eligió otra forma del mismo verbo?
      const g = String(given || '').toLowerCase().trim();
      const other = Object.keys(FORM_NAME).find((k) => k !== f && v[k].includes(g) && !v[f].includes(g));
      if (g && g === v.base) lines.push(`Elegiste la forma base (<b>${esc(g)}</b>), pero aquí se pide el ${FORM_NAME[f]}.`);
      else if (other) lines.push(`<b>${esc(g)}</b> también es de este verbo, pero es el <b>${FORM_NAME[other]}</b>, no el ${FORM_NAME[f]}.`);
      else if (g && /ed$/.test(g) && v.irregular) lines.push(`<b>${esc(g)}</b> no existe: es un error común aplicar -ed a un verbo irregular.`);
    }
    lines.push(`Formas: <b>${esc(V.allForms(v))}</b> · ${esc(v.es)}`);
    return lines;
  }

  /* ---------- evidencia en lecturas ---------- */
  function evidence(text, question, answer) {
    const sents = String(text).match(/[^.!?]+[.!?]*/g) || [];
    const want = new Set([...toks(answer), ...toks(question)].filter((w) => w.length > 2 && !['the', 'and', 'does', 'what', 'who', 'where', 'why', 'how', 'did', 'was', 'were', 'are'].includes(w)));
    let best = null, score = 0;
    sents.forEach((s) => { const sc = toks(s).filter((w) => want.has(w)).length; if (sc > score) { score = sc; best = s.trim(); } });
    return score ? best : null;
  }

  /** HTML de explicación para la hoja de resultado. r = { correct, typo, answer, given, skipped } */
  function html(ex, r) {
    if (!ex || (r.correct && !r.typo)) return '';
    const rows = [], why = [];
    const given = r.given != null ? String(r.given).trim() : '';
    const correct = r.answer != null ? String(r.answer) : '';
    // en verbos, una forma inventada (ej. "stoping") no se traduce como si existiera
    const vb = ex.verb && window.Verbs ? window.Verbs.byBase.get(ex.verb) : null;
    const realForm = !vb || [vb.base, ...vb.past, ...vb.pp, ...vb.ing, ...vb.s].includes(given.toLowerCase());
    const mineRow = () => rows.push(given ? `<div class="why-row mine">❌ Tu respuesta: ${realForm ? withMeaning(given) : `<b>${esc(given)}</b>`}</div>` : `<div class="why-row mine">⏭️ No respondiste esta vez</div>`);
    const okRow = (txt = correct) => txt && rows.push(`<div class="why-row ok">✅ Correcta: ${withMeaning(txt)}</div>`);

    switch (ex.type) {
      case 'choice': case 'listen_choice': case 'picture': case 'read': case 'fill': {
        if (!r.typo) mineRow();
        okRow(ex.type === 'fill' ? correct : correct);
        if (ex.verb && ex.form) why.push(...(verbRule(ex, given) || []));
        else if (ex.kind === 'meaning') why.push(`"${esc(ex.src)}" significa <b>${esc(ex.es)}</b>.${given ? ` La opción que elegiste, "${esc(given)}", ${toEn(given) ? `en inglés es <b>${esc(toEn(given))}</b>` : 'es otra palabra'}.` : ''}`);
        else if (ex.kind === 'picture') why.push(`"${esc(ex.es)}" en inglés es <b>${esc(ex.src)}</b>.${given ? ` "${esc(given)}" significa ${esc(tr(given) || 'otra cosa')}.` : ''}`);
        else if (ex.kind === 'listen-word') why.push(`El audio decía <b>${esc(ex.src)}</b>${tr(ex.src) ? ` (${esc(tr(ex.src))})` : ''}. Escúchalo otra vez con 🐢 para notar la diferencia${given ? ` con "${esc(given.replace(/^\S+\s/, ''))}"` : ''}.`);
        else if (ex.kind === 'listen-meaning') why.push(`El audio decía: <b>"${esc(ex.src)}"</b>, que significa "${esc(ex.es)}".`);
        else if (ex.type === 'read') { const ev = evidence(ex.text, ex.question, correct); if (ev) why.push(`📖 El texto lo dice aquí: <i>"${esc(ev)}"</i>${tr(ev) && D().sentence(ev) ? ` (${esc(D().sentence(ev))})` : ''}`); }
        else if (ex.pron && ex.sound && window.Pron) { const s = window.Pron.byId.get(ex.sound); if (s) why.push(`Se escuchaba <b>${esc(ex.audio)}</b>. ${esc(s.name)}: ${esc(s.how[0])}`); }
        if (ex.type === 'fill' && given && ex.sentence) {
          const mine = ex.sentence.replace('___', given);
          rows.splice(0, 1, `<div class="why-row mine">❌ Con tu opción: <b>${esc(mine)}</b></div>`);
          const issues = grammarIssues(mine);
          if (issues.length) why.push(`Tu opción no funciona porque: ${esc(issues[0])}`);
        }
        if (ex.type === 'choice' && !ex.kind && !ex.verb && given && isEn(given) && ex.question && /oraci[oó]n es correcta/i.test(ex.question)) {
          const issues = grammarIssues(given);
          if (issues.length) why.push(`En tu opción: ${esc(issues[0])}`);
        }
        if (ex.explain && !(ex.verb && ex.form)) why.push(esc(ex.explain));
        break;
      }
      case 'translate': case 'listen_type': {
        const target = ex.type === 'listen_type' ? (ex.shown || ex.audio) : correct;
        if (!r.typo) mineRow(); okRow(target);
        if (ex.verb && ex.form) { why.push(...(verbRule(ex, given) || [])); break; }
        if (given) {
          const d = diff(given, target);
          d.spelling.forEach(([x, y]) => {
            const morph = (x.startsWith(y) || y.startsWith(x)) && Math.abs(x.length - y.length) <= 3;
            why.push(morph ? `✏️ Escribiste <b>${esc(x)}</b>; aquí la forma correcta es <b>${esc(y)}</b>${y.length < x.length && /s$/.test(x) ? ' (sin -s)' : ''}.` : `✏️ Ortografía: escribiste <b>${esc(x)}</b>, se escribe <b>${esc(y)}</b>.`);
          });
          if (d.orderOnly) why.push('🔀 Usaste las palabras correctas pero en otro <b>orden</b>. En inglés el orden normal es: sujeto + verbo + complemento.');
          else {
            // muestra cada palabra como aparece en el texto (respeta mayúsculas: I, Spain)
            const orig = (w, txt) => { const m = String(txt).match(new RegExp(`\\b${w.replace(/[^a-z0-9']/gi, '')}\\b`, 'i')); return m ? m[0] : w; };
            if (d.missing.length) why.push(`➕ Te faltó: ${d.missing.slice(0, 4).map((w) => `<b>${esc(orig(w, target))}</b>${wordNote(w) ? ` (${esc(wordNote(w))})` : ''}`).join(', ')}.`);
            if (d.extra.length) why.push(`➖ Sobra: ${d.extra.slice(0, 4).map((w) => `<b>${esc(orig(w, given))}</b>`).join(', ')}.`);
          }
          grammarIssues(given).forEach((m) => why.push(`📘 ${esc(m)}`));
        }
        if (ex.type === 'listen_type' && ex.translation) why.push(`🎧 Significa: ${esc(ex.translation)}`);
        else if (ex.source && ex.source !== '🎧' && !isEn(ex.source)) why.push(`🇪🇸 La frase original: "${esc(ex.source)}"`);
        if (ex.explain) why.push(esc(ex.explain));
        break;
      }
      case 'match':
        rows.push('<div class="why-row mine">❌ Tuviste más de un error al unir las parejas.</div>');
        if (ex.pairs) why.push('Las parejas correctas: ' + ex.pairs.map((p) => `<b>${esc(p[0])}</b> = ${esc(p[1])}`).join(' · '));
        break;
      case 'speak': case 'coach': {
        const t = tr(ex.text);
        rows.push(`<div class="why-row ok">🗣️ Debías decir: ${withMeaning(ex.text)}</div>`);
        if (r.explain) why.push(esc(r.explain));
        if (!t && ex.translation) why.push(`Significa: ${esc(ex.translation)}`);
        why.push('Escucha el modelo 🔊 (y 🐢 lento) y repítelo en voz alta. Volverá a aparecer para practicarlo.');
        break;
      }
      default:
        if (correct) okRow();
        if (r.explain) why.push(esc(r.explain));
    }
    if (!rows.length && !why.length) return '';
    return `<div class="why">${rows.join('')}${why.length ? `<div class="why-text"><b>💡 ¿Por qué?</b><ul>${why.map((w) => `<li>${w}</li>`).join('')}</ul></div>` : ''}</div>`;
  }

  /** Explicación para las conversaciones guiadas */
  function dialogue(turn, chosen) {
    const ok = turn.o[turn.a];
    const reason = turn.why && turn.why[chosen];
    return `<div class="why">
      <div class="why-row mine">❌ Elegiste: ${withMeaning(turn.o[chosen])}</div>
      <div class="why-row ok">✅ Mejor respuesta: ${withMeaning(ok)}</div>
      ${reason ? `<div class="why-text"><b>💡 ¿Por qué?</b> ${esc(reason)}</div>` : ''}</div>`;
  }

  return { html, dialogue, diff, verbRule, evidence, tr };
})();
