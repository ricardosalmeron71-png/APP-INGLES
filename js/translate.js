/* =========================================================
   MODO TRADUCCIÓN: botón 🌐 en toda la app. Al activarlo, cada palabra en inglés
   se puede tocar para ver su traducción, su forma (ej. "went = pasado de go"),
   escucharla y guardarla en las tarjetas de repaso.
   Detecta automáticamente qué textos están en inglés (no toca el español de la app).
   ========================================================= */
window.Translate = (function () {
  const KEY = 'eu_translate_on';
  const WORD_RE = /[A-Za-z]+(?:['’][A-Za-z]+)*(?:-[A-Za-z]+)*/g;
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SVG', 'CANVAS']);
  const SKIP_SEL = '.tr-fab, .tr-pop, .toast, .tabbar, .topbar, [data-no-tr], .tw';
  let on = false, observer = null, busy = false, pop = null, fab = null;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = () => window.Dict;

  function storedOn() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function store(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* sin almacenamiento */ } }
  /** No se permite durante la prueba de nivel ni fuera de la sesión */
  function allowed() {
    if (!window.Store || !window.Store.user()) return false;
    if (document.querySelector('.lesson[data-mode="test"]')) return false;
    const r = (location.hash.split('/')[1] || '');
    return !['', 'welcome', 'login', 'register', 'onboarding', 'placement'].includes(r);
  }

  /* ------------------ envolver palabras ------------------ */
  function wrapText(node, onlyQuoted) {
    const text = node.nodeValue;
    let ranges = [];
    if (!onlyQuoted) ranges = [[0, text.length]];
    else {
      // en un texto en español, solo las partes entre comillas que estén en inglés
      const q = /["“«]([^"”»]{1,80})["”»]/g; let m;
      while ((m = q.exec(text))) if (D().looksEnglish(m[1])) ranges.push([m.index + 1, m.index + 1 + m[1].length]);
      if (!ranges.length) return;
    }
    const frag = document.createDocumentFragment();
    let last = 0;
    ranges.forEach(([a, b]) => {
      const seg = text.slice(a, b);
      if (a > last) frag.appendChild(document.createTextNode(text.slice(last, a)));
      let p = 0; WORD_RE.lastIndex = 0; let m;
      while ((m = WORD_RE.exec(seg))) {
        if (m.index > p) frag.appendChild(document.createTextNode(seg.slice(p, m.index)));
        const sp = document.createElement('span'); sp.className = 'tw'; sp.textContent = m[0];
        frag.appendChild(sp);
        p = m.index + m[0].length;
      }
      if (p < seg.length) frag.appendChild(document.createTextNode(seg.slice(p)));
      last = b;
    });
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function process(root) {
    if (!on || !root) return;
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || !n.nodeValue || !/[A-Za-z]{2,}/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(p.tagName) || p.closest(SKIP_SEL) || p.isContentEditable) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    busy = true;
    try { nodes.forEach((n) => { if (!n.parentNode) return; const en = D().looksEnglish(n.nodeValue); wrapText(n, !en); }); }
    finally { busy = false; }
  }
  function unwrapAll() {
    busy = true;
    try {
      document.querySelectorAll('.tw').forEach((sp) => { const parent = sp.parentNode; if (!parent) return; parent.replaceChild(document.createTextNode(sp.textContent), sp); parent.normalize(); });
    } finally { busy = false; }
  }
  let pending = false;
  function schedule() {
    if (pending) return; pending = true;
    requestAnimationFrame(() => { pending = false; if (on && allowed()) process(document.body); refreshFab(); });
  }

  /* ------------------ globo con la traducción ------------------ */
  function closePop() { if (pop) { pop.remove(); pop = null; } document.querySelectorAll('.tw.active').forEach((x) => x.classList.remove('active')); }
  function sentenceAround(sp) {
    const block = sp.closest('p, li, .speak-text, .msg-bubble, .option, .bubble, .fill-sentence, .sheet-answer, .why-row, .intro-word, .passage, .vocab-item, .chip-s, .tg-verb, .q-text, .wod, td, label, h2, h3, h4, b, div');
    const text = (block ? block.textContent : sp.textContent).replace(/\s+/g, ' ').trim();
    const sents = text.match(/[^.!?]+[.!?]*/g) || [text];
    return (sents.find((s) => s.includes(sp.textContent)) || text).trim();
  }
  function showPop(sp) {
    closePop();
    sp.classList.add('active');
    const raw = sp.textContent;
    const capitalized = /^[A-Z]/.test(raw);
    const r = D().word(raw, { capitalized });
    const sentence = sentenceAround(sp);
    const sTr = sentence.split(' ').length > 1 ? D().sentence(sentence) : null;
    const base = r && r.base && r.base !== D().normWord(raw) ? r.base : null;
    pop = document.createElement('div');
    pop.className = 'tr-pop pop';
    pop.innerHTML = `
      <div class="tr-head"><b>${esc(raw)}</b><button class="btn-speaker tiny" data-say="${esc(raw)}" aria-label="Escuchar">🔊</button><button class="icon-btn tr-x" aria-label="Cerrar">✕</button></div>
      ${r && r.proper ? '<div class="tr-es">Nombre propio (no se traduce)</div>'
        : r ? `<div class="tr-es">${esc(r.es)}</div>${base || r.form ? `<div class="tr-form">${r.form ? esc(r.form) : 'forma'}${base ? ` de <b>${esc(base)}</b>` : ''}</div>` : ''}`
        : '<div class="tr-es muted">No tengo esta palabra en el diccionario.</div>'}
      ${sTr ? `<div class="tr-sent"><span class="muted small">Frase:</span> ${esc(sTr)}</div>` : (sentence.split(' ').length > 2 ? '<button class="link-btn tr-gloss">Ver la frase palabra por palabra</button>' : '')}
      ${r && !r.proper && window.Store.user() ? '<button class="btn small secondary tr-add">➕ Agregar a mis tarjetas</button>' : ''}`;
    document.body.appendChild(pop);
    // posición junto a la palabra
    const rect = sp.getBoundingClientRect(), pw = Math.min(300, window.innerWidth - 24);
    pop.style.width = pw + 'px';
    const left = Math.max(12, Math.min(window.innerWidth - pw - 12, rect.left + rect.width / 2 - pw / 2));
    pop.style.left = left + 'px';
    const below = rect.bottom + 8, h = pop.offsetHeight;
    pop.style.top = (below + h > window.innerHeight - 10 ? Math.max(10, rect.top - h - 8) : below) + 'px';
    pop.querySelector('.tr-x').addEventListener('click', closePop);
    pop.querySelectorAll('[data-say]').forEach((b) => b.addEventListener('click', () => window.Speech && window.Speech.speak(b.dataset.say)));
    if (window.Speech) window.Speech.speak(raw);
    const g = pop.querySelector('.tr-gloss');
    if (g) g.addEventListener('click', () => {
      const gl = D().gloss(sentence);
      g.outerHTML = `<div class="tr-sent tr-glosslist">${gl.map(([en, es]) => `<span><b>${esc(en)}</b> ${esc(es === '?' ? '—' : es)}</span>`).join('')}</div>`;
    });
    const add = pop.querySelector('.tr-add');
    if (add) add.addEventListener('click', () => {
      const en = base || D().normWord(raw), es = r.es.split(' / ')[0];
      window.Store.update((x) => window.Store.learnWords(x, [[en, es, '🌐']]));
      add.outerHTML = '<div class="small muted">✅ Agregada a tus tarjetas de repaso</div>';
    });
  }

  /* ------------------ botón flotante ------------------ */
  function refreshFab() {
    if (!fab) return;
    const ok = allowed();
    if (fab.hidden !== !ok) fab.hidden = !ok;
    if (!ok && on) { setOn(false, true); }
    else if (ok && !on && storedOn()) { setOn(true, true); }
    paintFab();
  }
  /** Actualiza el botón solo si cambió algo (evita disparar el vigilante de cambios en bucle) */
  function paintFab() {
    if (!fab) return;
    if (fab.classList.contains('on') !== on) fab.classList.toggle('on', on);
    const pressed = on ? 'true' : 'false';
    if (fab.getAttribute('aria-pressed') !== pressed) fab.setAttribute('aria-pressed', pressed);
    const label = on ? 'Traduciendo' : 'Traducir', sm = fab.querySelector('small');
    if (sm.textContent !== label) sm.textContent = label;
  }
  function setOn(v, silent) {
    on = !!v;
    if (!silent) store(on);
    document.body.classList.toggle('tr-on', on);
    closePop();
    if (on) {
      process(document.body);
      let seen = true; try { seen = localStorage.getItem('eu_tr_hint') === '1'; localStorage.setItem('eu_tr_hint', '1'); } catch (e) { seen = true; }
      if (!silent && !seen && window.toastFn) window.toastFn('🌐 Toca cualquier palabra en inglés para ver su traducción. Vuelve a tocar 🌐 para apagarlo.');
    }
    else unwrapAll();
    paintFab();
  }
  function init(toastFn) {
    window.toastFn = toastFn;
    fab = document.createElement('button');
    fab.className = 'tr-fab'; fab.type = 'button';
    fab.setAttribute('aria-label', 'Modo traducción');
    fab.innerHTML = '<span>🌐</span><small>Traducir</small>';
    fab.addEventListener('click', () => setOn(!on));
    document.body.appendChild(fab);
    // tocar una palabra: muestra la traducción (y no activa el botón u opción que la contiene)
    document.addEventListener('click', (e) => {
      if (!on) return;
      const sp = e.target.closest && e.target.closest('.tw');
      if (sp) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); showPop(sp); return; }
      if (pop && !e.target.closest('.tr-pop')) closePop();
    }, true);
    window.addEventListener('scroll', closePop, true);
    window.addEventListener('hashchange', () => { closePop(); setTimeout(schedule, 0); });
    observer = new MutationObserver((list) => {
      if (busy) return;
      // ignora cambios del propio botón y del globo de traducción
      const relevant = list.some((m) => { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; return t && !t.closest('.tr-fab, .tr-pop'); });
      if (relevant) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    on = false;
    if (storedOn() && allowed()) setOn(true, true);
    refreshFab();
  }
  return { init, setOn, isOn: () => on, process };
})();
