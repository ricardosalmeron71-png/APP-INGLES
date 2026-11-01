/* =========================================================
   RENDERIZADO DE EJERCICIOS + MOTOR DE LECCIÓN
   ========================================================= */
window.Exercises = (function () {
  const A = window.Analysis, S = window.Speech;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = window.Lessons.shuffle;

  const speakerBtns = (text) => `
    <div class="speakers">
      <button class="btn-speaker big" data-say="${esc(text)}" aria-label="Escuchar">🔊</button>
      <button class="btn-speaker slow" data-say="${esc(text)}" data-slow="1" aria-label="Escuchar lento">🐢</button>
    </div>`;

  function bindSpeakers(root) {
    root.querySelectorAll('[data-say]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      b.classList.add('playing');
      S.speak(b.dataset.say, { slow: !!b.dataset.slow }).then(() => b.classList.remove('playing'));
    }));
  }

  function optionsHtml(options, cls = '') {
    return `<div class="options ${cls}">${options.map((o, i) => `<button class="option" data-i="${i}"><span class="key">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  }
  function bindOptions(root, ctx, onSelect) {
    let selected = null;
    root.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => {
      root.querySelectorAll('.option').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      selected = +b.dataset.i;
      if (onSelect) onSelect(selected, b);
      ctx.setReady(true);
    }));
    return () => selected;
  }

  /* ------------------ RENDERERS ------------------
     Cada renderer recibe (ex, el, ctx) y devuelve evaluate() → resultado */
  const R = {};

  R.intro = (ex, el, ctx) => {
    el.innerHTML = `
      <div class="ex-title">Palabra nueva ✨</div>
      <div class="intro-card pop">
        <div class="intro-emoji">${ex.emoji}</div>
        <div class="intro-word">${esc(ex.word)}</div>
        <div class="intro-meaning">${esc(ex.meaning)}</div>
        ${speakerBtns(ex.word)}
      </div>`;
    bindSpeakers(el);
    S.speak(ex.word);
    ctx.setReady(true, 'Continuar');
    return () => ({ nograde: true });
  };

  R.tip = (ex, el, ctx) => {
    el.innerHTML = `<div class="ex-title">💡 ${esc(ex.tip.title)}</div><div class="tip-card">${ex.tip.html}</div>`;
    ctx.setReady(true, 'Entendido');
    return () => ({ nograde: true });
  };

  R.choice = (ex, el, ctx) => {
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      ${ex.audio ? speakerBtns(ex.audio) : ''}
      ${optionsHtml(ex.options)}`;
    bindSpeakers(el);
    if (ex.audio) S.speak(ex.audio);
    const get = bindOptions(el, ctx);
    return () => ({ correct: get() === ex.answer, answer: ex.options[ex.answer], explain: ex.explain, speakAnswer: /[a-z]/i.test(ex.options[ex.answer]) && !ex.audio ? ex.options[ex.answer] : ex.audio });
  };

  R.listen_choice = (ex, el, ctx) => {
    el.innerHTML = `<div class="ex-title">${esc(ex.question)}</div>${speakerBtns(ex.audio)}${optionsHtml(ex.options)}`;
    bindSpeakers(el);
    setTimeout(() => S.speak(ex.audio), 300);
    if (!S.canSpeak()) el.querySelector('.speakers').insertAdjacentHTML('afterend', `<div class="note">Tu navegador no reproduce audio. Texto: <b>${esc(ex.audio)}</b></div>`);
    const get = bindOptions(el, ctx);
    return () => ({ correct: get() === ex.answer, answer: ex.options[ex.answer], explain: `Audio: "${ex.audio}"`, speakAnswer: ex.audio });
  };

  R.picture = (ex, el, ctx) => {
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      <div class="picture-grid">${ex.options.map((o, i) => `
        <button class="option picture" data-i="${i}"><div class="pic">${o.emoji}</div><div>${esc(o.text)}</div></button>`).join('')}</div>`;
    const get = bindOptions(el, ctx, (i) => S.speak(ex.options[i].text));
    return () => ({ correct: get() === ex.answer, answer: ex.options[ex.answer].text, speakAnswer: ex.options[ex.answer].text });
  };

  R.fill = (ex, el, ctx) => {
    const parts = ex.sentence.split('___');
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      <div class="fill-sentence">${esc(parts[0])}<span class="blank">&nbsp;</span>${esc(parts[1] || '')}</div>
      <div class="chips">${ex.options.map((o, i) => `<button class="option chip" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
    const blank = el.querySelector('.blank');
    const get = bindOptions(el, ctx, (i) => { blank.textContent = ex.options[i]; blank.classList.add('filled'); });
    const full = ex.sentence.replace('___', ex.options[ex.answer]);
    return () => ({ correct: get() === ex.answer, answer: full, explain: ex.explain, speakAnswer: full });
  };

  R.read = (ex, el, ctx) => {
    el.innerHTML = `
      <div class="passage">
        <div class="passage-head"><b>📖 ${esc(ex.title)}</b><button class="btn-speaker small" data-say="${esc(ex.text)}">🔊</button></div>
        <p>${esc(ex.text)}</p>
      </div>
      <div class="ex-title small">${esc(ex.question)}</div>
      ${optionsHtml(ex.options)}`;
    bindSpeakers(el);
    const get = bindOptions(el, ctx);
    return () => ({ correct: get() === ex.answer, answer: ex.options[ex.answer] });
  };

  function bankUI(ex, el, ctx) {
    const area = el.querySelector('.bank-answer'), bank = el.querySelector('.bank');
    const chosen = [];
    const render = () => {
      area.innerHTML = chosen.map((w, i) => `<button class="word" data-a="${i}">${esc(w.w)}</button>`).join('') || '<span class="placeholder">Toca las palabras en orden</span>';
      bank.innerHTML = ex.bank.map((w, i) => `<button class="word ${chosen.some((c) => c.i === i) ? 'used' : ''}" data-b="${i}">${esc(w)}</button>`).join('');
      area.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => { chosen.splice(+b.dataset.a, 1); render(); }));
      bank.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => {
        const i = +b.dataset.b; if (chosen.some((c) => c.i === i)) return;
        chosen.push({ i, w: ex.bank[i] }); S.speak(ex.bank[i]); render();
      }));
      ctx.setReady(chosen.length > 0);
    };
    render();
    return () => chosen.map((c) => c.w).join(' ');
  }

  R.translate = (ex, el, ctx) => {
    const listenOnly = ex.source === '🎧';
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      ${ex.audio ? speakerBtns(ex.audio) : ''}
      ${listenOnly ? '' : `<div class="bubble-row"><div class="mascot-sm">🦉</div><div class="bubble">${esc(ex.source)}</div></div>`}
      ${ex.hint ? `<div class="note">${esc(ex.hint)}</div>` : ''}
      ${ex.bank ? '<div class="bank-answer"></div><div class="bank"></div>' : `<textarea class="answer-input" rows="3" placeholder="Escribe en inglés..." autocapitalize="sentences" spellcheck="false"></textarea>`}`;
    bindSpeakers(el);
    if (ex.audio) setTimeout(() => S.speak(ex.audio), 300);
    let getText;
    if (ex.bank) getText = bankUI(ex, el, ctx);
    else {
      const ta = el.querySelector('textarea');
      ta.addEventListener('input', () => ctx.setReady(ta.value.trim().length > 0));
      ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ctx.submit(); } });
      setTimeout(() => ta.focus(), 50);
      getText = () => ta.value;
    }
    return () => {
      const r = A.checkAnswer(getText(), ex.answers);
      // En modo estricto (verbos) la ortografía debe ser exacta
      const ok = r.ok && !(ex.strict && r.typo);
      return { correct: ok, typo: ok && r.typo, answer: r.best, given: getText(), explain: ex.explain, speakAnswer: r.best };
    };
  };

  R.listen_type = (ex, el, ctx) => {
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      ${speakerBtns(ex.audio)}
      <textarea class="answer-input" rows="3" placeholder="Escribe lo que escuchas..." autocapitalize="sentences" spellcheck="false"></textarea>`;
    bindSpeakers(el);
    setTimeout(() => S.speak(ex.audio), 300);
    const ta = el.querySelector('textarea');
    ta.addEventListener('input', () => ctx.setReady(ta.value.trim().length > 0));
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ctx.submit(); } });
    return () => {
      const r = A.checkAnswer(ta.value, ex.answers);
      const al = A.alignWords(ex.audio, ta.value);
      const html = r.ok ? '' : `<div class="align">${al.words.map((w) => `<span class="${w.ok ? 'w-ok' : 'w-bad'}">${esc(w.word)}</span>`).join(' ')}</div>`;
      const ok = r.ok && !(ex.strict && r.typo);
      return { correct: ok, typo: ok && r.typo, answer: ex.shown || ex.audio, explain: ex.translation, html: ok ? '' : html, speakAnswer: ex.audio };
    };
  };

  R.match = (ex, el, ctx) => {
    const left = shuffle(ex.pairs.map((p, i) => ({ t: p[0], i })));
    const right = shuffle(ex.pairs.map((p, i) => ({ t: p[1], i })));
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      <div class="match">
        <div class="col">${left.map((x) => `<button class="option m" data-side="L" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
        <div class="col">${right.map((x) => `<button class="option m" data-side="R" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
      </div>`;
    let sel = null, matched = 0, errors = 0;
    el.querySelectorAll('.m').forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('done')) return;
      if (b.dataset.side === 'L') S.speak(b.textContent);
      if (!sel || sel.dataset.side === b.dataset.side) {
        el.querySelectorAll(`.m[data-side="${b.dataset.side}"]`).forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected'); sel = b; return;
      }
      if (sel.dataset.i === b.dataset.i) {
        [sel, b].forEach((x) => { x.classList.remove('selected'); x.classList.add('done'); });
        matched++; ctx.sound('ok');
        if (matched === ex.pairs.length) setTimeout(() => ctx.finish({ correct: errors <= 1, answer: errors <= 1 ? '' : `Tuviste ${errors} errores`, explain: ex.pairs.map((p) => `${p[0]} = ${p[1]}`).join(' · ') }), 300);
      } else {
        errors++; ctx.sound('bad');
        [sel, b].forEach((x) => { x.classList.add('wrong'); setTimeout(() => x.classList.remove('wrong', 'selected'), 450); });
      }
      sel = null;
    }));
    ctx.setReady(false, null, true);
    return () => ({ correct: errors <= 1 });
  };

  R.speak = (ex, el, ctx) => {
    const settings = ctx.settings || {};
    const sttOK = S.canListen();
    el.innerHTML = `
      <div class="ex-title">${esc(ex.question)}</div>
      <div class="speak-card">
        ${ex.hideText ? `<div class="speak-es">${esc(ex.translation)}</div><div class="speak-text hidden-text">• • •</div>` : `<div class="speak-text">${esc(ex.text)}</div><div class="speak-es">${esc(ex.translation || '')}</div>`}
        ${ex.hideText ? '' : speakerBtns(ex.text)}
      </div>
      <div class="mic-zone">
        <button class="mic-btn" aria-label="Hablar">🎤</button>
        <div class="mic-label">${sttOK ? 'Toca y habla' : (S.canRecord() ? 'Toca para grabarte' : 'Escucha y repite en voz alta')}</div>
        <div class="interim"></div>
      </div>
      <div class="speak-result"></div>
      <button class="link-btn skip-speak">🔇 No puedo hablar ahora</button>`;
    bindSpeakers(el);
    const mic = el.querySelector('.mic-btn'), label = el.querySelector('.mic-label'), out = el.querySelector('.speak-result'), interim = el.querySelector('.interim');
    let result = null, recording = false;
    const skip = el.querySelector('.skip-speak');
    if (skip) skip.addEventListener('click', () => ctx.skipSpeaking());

    const showAnalysis = (an) => {
      result = an;
      const cls = an.score >= 75 ? 'good' : an.score >= 55 ? 'mid' : 'low';
      out.innerHTML = `
        <div class="pron-result ${cls} pop">
          <div class="pron-score"><div class="ring" style="--p:${an.score}"><span>${an.score}</span></div>
            <div><b>${an.emoji} ${an.label}</b><div class="small muted">Escuché: "${esc(an.heard || '—')}"</div></div></div>
          <div class="align">${an.words.map((w) => `<span class="${w.ok ? 'w-ok' : 'w-bad'}">${esc(w.word)}</span>`).join(' ')}</div>
          ${an.tips.map((t) => `<div class="pron-tip">🗣️ ${esc(t)}</div>`).join('')}
          <div class="small muted">Puedes intentarlo de nuevo o continuar.</div>
        </div>`;
      ctx.setReady(true);
    };

    mic.addEventListener('click', async () => {
      if (sttOK) {
        if (recording) { S.stopListening(); return; }
        recording = true; mic.classList.add('recording'); label.textContent = 'Escuchando... habla ahora'; interim.textContent = '';
        try {
          const r = await S.listen({ onInterim: (t) => { interim.textContent = t; } });
          showAnalysis(A.analyzeSpeech(ex.text, r.alternatives, r.confidence));
        } catch (e) {
          const msg = { 'not-allowed': 'Permite el acceso al micrófono en tu navegador.', 'no-speech': 'No te escuché. Acércate al micrófono e inténtalo otra vez.', 'network': 'El reconocimiento de voz necesita conexión a internet.' }[e.message] || 'No se pudo usar el micrófono. Inténtalo de nuevo.';
          out.innerHTML = `<div class="note warn">${msg}</div>`;
        }
        recording = false; mic.classList.remove('recording'); label.textContent = 'Toca para intentar de nuevo';
      } else if (S.canRecord()) {
        if (!recording) {
          try { await S.startRecording(); recording = true; mic.classList.add('recording'); label.textContent = 'Grabando... toca para terminar'; }
          catch (e) { out.innerHTML = '<div class="note warn">Permite el acceso al micrófono.</div>'; }
        } else {
          const url = await S.stopRecording(); recording = false; mic.classList.remove('recording'); label.textContent = 'Toca para grabar de nuevo';
          selfEval(url);
        }
      } else selfEval(null);
    });

    function selfEval(url) {
      out.innerHTML = `
        <div class="pron-result mid pop">
          <b>Compara tu voz con el modelo</b>
          <div class="row gap">${url ? `<button class="btn small secondary" id="play-me">▶️ Mi voz</button>` : ''}<button class="btn small secondary" data-say="${esc(ex.text)}">🔊 Modelo</button></div>
          <div class="small muted">Tu navegador no permite análisis automático de voz. ¿Cómo te salió?</div>
          <div class="row gap"><button class="btn small" id="self-ok">👍 Bien</button><button class="btn small danger" id="self-bad">👎 Practicar más</button></div>
        </div>`;
      bindSpeakers(out);
      if (url) out.querySelector('#play-me').addEventListener('click', () => new Audio(url).play());
      out.querySelector('#self-ok').addEventListener('click', () => { result = { score: 80, self: true }; ctx.submit(); });
      out.querySelector('#self-bad').addEventListener('click', () => { result = { score: 40, self: true }; ctx.submit(); });
    }

    ctx.setReady(false);
    if (settings.autoplay !== false && !ex.hideText) setTimeout(() => S.speak(ex.text), 300);
    return () => {
      const score = result ? result.score : 0;
      ctx.onSpeak && ctx.onSpeak(score);
      return { correct: score >= 65, answer: ex.text, explain: result && !result.self ? `Puntuación de pronunciación: ${score}/100` : '', speakAnswer: ex.text, score };
    };
  };

  R.free_write = (ex, el, ctx) => {
    el.innerHTML = `
      <div class="ex-title">✍️ ${esc(ex.question)}</div>
      <div class="bubble-row"><div class="mascot-sm">🦉</div><div class="bubble">${esc(ex.prompt)}</div></div>
      <textarea class="answer-input tall" rows="7" placeholder="Escribe aquí en inglés (mínimo ${ex.min} palabras)..." autocapitalize="sentences"></textarea>
      <div class="counter"><span class="wc">0</span> / ${ex.min} palabras ${ex.keywords && ex.keywords.length ? `· Usa: ${ex.keywords.map((k) => `<code>${esc(k)}</code>`).join(' ')}` : ''}</div>
      <div class="write-result"></div>`;
    const ta = el.querySelector('textarea'), wc = el.querySelector('.wc');
    ta.addEventListener('input', () => {
      const n = ta.value.trim().split(/\s+/).filter(Boolean).length;
      wc.textContent = n; wc.parentElement.classList.toggle('ok', n >= ex.min);
      ctx.setReady(n >= 3);
    });
    return () => {
      const an = A.analyzeWriting(ta.value, ex);
      ctx.onWrite && ctx.onWrite(ta.value, an, ex);
      el.querySelector('.write-result').innerHTML = writingReport(an);
      ta.readOnly = true;
      return { correct: an.score >= 60, answer: `Puntuación: ${an.score}/100`, explain: an.score >= 60 ? 'Revisa los comentarios para seguir mejorando.' : 'Revisa los comentarios de arriba y vuelve a intentarlo después.', score: an.score, keepBody: true };
    };
  };

  function writingReport(an) {
    const icon = { error: '❌', warn: '⚠️', info: '💡' };
    return `
      <div class="write-report pop">
        <div class="pron-score"><div class="ring" style="--p:${an.score}"><span>${an.score}</span></div>
          <div><b>Análisis de escritura</b><div class="small muted">${an.wordCount} palabras · ${an.stats.sentences || 0} oraciones · ${an.stats.errors || 0} errores</div></div></div>
        ${an.positives.length ? `<div class="good-list">${an.positives.map((p) => `<div>✅ ${esc(p)}</div>`).join('')}</div>` : ''}
        ${an.issues.map((i) => `<div class="issue ${i.type}">${icon[i.type]} ${esc(i.msg)}${i.excerpt ? ` <span class="excerpt">"${esc(i.excerpt)}"</span>` : ''}${i.fix ? ` → <b>${esc(i.fix)}</b>` : ''}</div>`).join('')}
        <div class="stat-row">
          <span>📏 ${an.stats.avgLen || 0} pal/oración</span><span>🎨 Variedad ${an.stats.richness || 0}%</span><span>🔗 ${an.stats.linkers || 0} conectores</span>
        </div>
      </div>`;
  }

  /* =============== MOTOR DE LECCIÓN ===============
     run({ exercises, mode, title, onExit, onComplete, settings, hooks }) */
  function run(root, opts) {
    const mode = opts.mode || 'lesson';
    const queue = opts.exercises.map((e) => ({ ...e, _id: Math.random() }));
    const graded = new Map(); // _id → primer intento correcto
    const wrongList = [];
    let idx = 0, ready = false, checking = false, evaluate = null, combo = 0;
    const start = Date.now();

    root.innerHTML = `
      <div class="lesson">
        <div class="lesson-top">
          <button class="icon-btn close" aria-label="Salir">✕</button>
          <div class="progress"><div class="bar"></div></div>
          <div class="combo"></div>
        </div>
        <div class="lesson-body"></div>
        <div class="lesson-foot">
          <button class="btn secondary skip-btn">Omitir</button>
          <button class="btn check-btn" disabled>Comprobar</button>
        </div>
        <div class="sheet"></div>
      </div>`;
    const body = root.querySelector('.lesson-body'), bar = root.querySelector('.bar'), checkBtn = root.querySelector('.check-btn');
    const skipBtn = root.querySelector('.skip-btn'), sheet = root.querySelector('.sheet'), comboEl = root.querySelector('.combo');

    root.querySelector('.close').addEventListener('click', () => {
      if (idx === 0 || confirm('¿Salir de la lección? Perderás el progreso de esta lección.')) { S.stopListening(); opts.onExit && opts.onExit(); }
    });

    const sound = (t) => { if (!opts.settings || opts.settings.sound !== false) S.beep(t); };

    const ctx = {
      mode, settings: opts.settings,
      setReady(v, label, hideCheck) {
        ready = v;
        checkBtn.disabled = !v;
        checkBtn.textContent = label || 'Comprobar';
        checkBtn.style.display = hideCheck ? 'none' : '';
        skipBtn.style.display = label || mode === 'test' ? 'none' : '';
      },
      submit() { if (ready && !checking) check(); },
      finish(result) { showFeedback(result); },
      sound,
      skipSpeaking() {
        S.stopListening();
        opts.hooks && opts.hooks.speakingOff && opts.hooks.speakingOff();
        for (let i = queue.length - 1; i > idx; i--) if (queue[i].type === 'speak') queue.splice(i, 1);
        graded.delete(queue[idx]._id);
        idx++; next();
      },
      onSpeak: opts.hooks && opts.hooks.onSpeak,
      onWrite: opts.hooks && opts.hooks.onWrite
    };

    function next() {
      sheet.className = 'sheet'; sheet.innerHTML = '';
      checking = false;
      if (idx >= queue.length) return complete();
      bar.style.width = `${Math.round(100 * idx / queue.length)}%`;
      const ex = queue[idx];
      body.innerHTML = ''; body.scrollTop = 0;
      const el = document.createElement('div'); el.className = 'ex slide-in'; body.appendChild(el);
      ctx.setReady(false);
      evaluate = (R[ex.type] || R.choice)(ex, el, ctx);
    }

    function check() {
      checking = true;
      const r = evaluate();
      if (r.nograde) { idx++; return next(); }
      showFeedback(r);
    }

    function showFeedback(r) {
      checking = true;
      const ex = queue[idx];
      if (!graded.has(ex._id) && !ex._retry) graded.set(ex._id, { ok: r.correct, ex });
      opts.hooks && opts.hooks.onResult && opts.hooks.onResult(ex, r.correct, !!ex._retry);
      if (r.correct) { combo++; sound('ok'); } else { combo = 0; sound('bad'); }
      comboEl.textContent = combo >= 3 ? `🔥 ${combo}` : '';
      if (!r.correct && mode !== 'test') {
        if (!ex._retry) { queue.push({ ...ex, _retry: true, _id: Math.random() }); wrongList.push(ex); }
      }
      if (mode === 'test') { idx++; return next(); }
      const praise = ['¡Excelente!', '¡Correcto!', '¡Muy bien!', '¡Genial!', '¡Perfecto!', '¡Así se hace!'];
      sheet.className = `sheet show ${r.correct ? 'ok' : 'bad'}`;
      sheet.innerHTML = `
        <div class="sheet-inner">
          <div class="sheet-head">
            <span class="sheet-icon">${r.correct ? '✅' : '❌'}</span>
            <b>${r.correct ? (r.typo ? '¡Correcto! Pero revisa la ortografía:' : praise[Math.floor(Math.random() * praise.length)]) : 'Respuesta correcta:'}</b>
            ${r.speakAnswer ? `<button class="btn-speaker small" data-say="${esc(r.speakAnswer)}">🔊</button>` : ''}
          </div>
          ${(!r.correct || r.typo) && r.answer ? `<div class="sheet-answer">${esc(r.answer)}</div>` : ''}
          ${r.explain ? `<div class="sheet-explain">${esc(r.explain)}</div>` : ''}
          ${r.html || ''}
          <button class="btn continue ${r.correct ? '' : 'danger'}">Continuar</button>
        </div>`;
      bindSpeakers(sheet);
      const cont = sheet.querySelector('.continue');
      cont.addEventListener('click', () => { idx++; next(); });
      setTimeout(() => cont.focus(), 50);
      checkBtn.disabled = true;
    }

    checkBtn.addEventListener('click', () => ctx.submit());
    skipBtn.addEventListener('click', () => { if (!checking) showFeedback({ ...(evaluate ? safeEval() : {}), correct: false }); });
    function safeEval() { if (['speak', 'free_write', 'match'].includes(queue[idx].type)) return {}; try { const r = evaluate(); return { answer: r.answer, explain: r.explain, speakAnswer: r.speakAnswer }; } catch (e) { return {}; } }

    function complete() {
      bar.style.width = '100%';
      const results = [...graded.values()];
      const total = results.length;
      const correct = results.filter((r) => r.ok).length;
      const score = total ? Math.round(100 * correct / total) : 100;
      opts.onComplete && opts.onComplete({ score, correct, total, wrong: wrongList, minutes: (Date.now() - start) / 60000, results });
    }

    // Atajos de teclado (útil en tablet / escritorio)
    const keyHandler = (e) => {
      if (!document.body.contains(root.querySelector('.lesson'))) return document.removeEventListener('keydown', keyHandler);
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9) { const o = body.querySelectorAll('.option')[n - 1]; if (o) o.click(); }
      if (e.key === 'Enter') { const c = sheet.querySelector('.continue'); if (c) c.click(); else ctx.submit(); }
    };
    document.addEventListener('keydown', keyHandler);

    next();
  }

  window.ExercisesRenderers = R;
  return { run, writingReport, bindSpeakers, speakerBtns, esc, renderers: R };
})();
