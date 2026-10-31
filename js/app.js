/* =========================================================
   APP PRINCIPAL: navegación y pantallas
   ========================================================= */
(function () {
  const { LEVELS, LESSON_TYPES, SKILLS, UNITS, PLACEMENT, PLACEMENT_SPEAK, DIALOGUES, ACHIEVEMENTS, GOALS } = window.DATA;
  const St = window.Store, Ex = window.Exercises, Sp = window.Speech, An = window.Analysis, Ls = window.Lessons;
  const esc = Ex.esc;
  const app = document.getElementById('app');
  const $ = (sel, root = app) => root.querySelector(sel);
  const $$ = (sel, root = app) => [...root.querySelectorAll(sel)];
  const go = (path) => { if (location.hash === '#' + path) render(); else location.hash = path; };
  const levelOf = (id) => LEVELS.find((l) => l.id === id);
  const unitOf = (id) => UNITS.find((u) => u.id === id);

  /* ------------------ UTILIDADES DE UI ------------------ */
  function toast(html, ms = 2600) {
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = html;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
  }
  function modal(html, onMount) {
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="modal-card pop">${html}</div>`;
    m.addEventListener('click', (e) => { if (e.target === m) close(); });
    const close = () => { m.classList.add('closing'); setTimeout(() => m.remove(), 200); };
    document.body.appendChild(m);
    $$('[data-close]', m).forEach((b) => b.addEventListener('click', close));
    onMount && onMount(m, close);
    return close;
  }
  function confetti() {
    const c = document.createElement('div'); c.className = 'confetti';
    const items = ['🎉', '⭐', '✨', '🎊', '💚', '🏆'];
    c.innerHTML = Array.from({ length: 28 }, () => `<span style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 0.8}s;font-size:${18 + Math.random() * 18}px">${items[Math.floor(Math.random() * items.length)]}</span>`).join('');
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3500);
  }
  function announceAchievements(ids) {
    ids.forEach((id, i) => {
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) setTimeout(() => toast(`<span class="big-emoji">${a.icon}</span><div><b>¡Logro desbloqueado!</b><div>${a.name}</div></div>`, 3200), 600 + i * 1500);
    });
  }
  function applySettings(u) {
    const s = (u && u.settings) || {};
    document.documentElement.classList.toggle('dark', !!s.dark);
    Sp.configure({ accent: s.accent || 'en-US', rate: s.rate || 0.95 });
  }
  const tabbar = (active) => `
    <nav class="tabbar">
      ${[['learn', '🏠', 'Aprender'], ['practice', '💪', 'Práctica'], ['community', '🏆', 'Ranking'], ['progress', '📊', 'Progreso'], ['profile', '👤', 'Perfil']]
        .map(([id, ic, name]) => `<a href="#/${id}" class="${active === id ? 'active' : ''}"><span>${ic}</span><small>${name}</small></a>`).join('')}
    </nav>`;
  const topbar = (u) => {
    const plan = St.buildPlan(u);
    const xpToday = u.progress.xpByDay[St.today()] || 0;
    const streak = St.currentStreak(u);
    const pct = Math.min(100, Math.round(100 * xpToday / plan.dailyXP));
    return `
      <header class="topbar">
        <div class="chip-stat" title="Nivel">${levelOf(u.level).icon} ${u.level}</div>
        <div class="chip-stat streak ${streak ? 'on' : ''}" title="Racha">🔥 ${streak}</div>
        <div class="chip-stat" title="XP total">💎 ${u.progress.xp}</div>
        <div class="goal-mini" title="Meta diaria: ${xpToday}/${plan.dailyXP} XP"><div class="ring sm" style="--p:${pct}"><span>${pct >= 100 ? '✓' : '🎯'}</span></div></div>
      </header>`;
  };

  /* ------------------ ROUTER ------------------ */
  const routes = {};
  const PENDING_FRIEND = 'eu_pending_friend';
  let leaveGuard = null;
  function render() {
    const hash = location.hash.replace(/^#/, '') || '/';
    const [, name, ...params] = hash.split('/');
    const u = St.user();
    applySettings(u);
    // Enlace de amigo (#/add/CODIGO): se guarda y se procesa al tener sesión
    if (name === 'add' && params[0]) {
      localStorage.setItem(PENDING_FRIEND, params[0]);
      if (!u) { toast('👋 Crea tu cuenta o inicia sesión para agregar a tu amigo'); return go('/welcome'); }
    }
    if (u && u.onboarded && localStorage.getItem(PENDING_FRIEND)) {
      const code = localStorage.getItem(PENDING_FRIEND);
      localStorage.removeItem(PENDING_FRIEND);
      addFriendCode(code);
      return go('/community');
    }
    const publicRoutes = ['', 'welcome', 'login', 'register'];
    if (!u && !publicRoutes.includes(name || '')) return go('/welcome');
    if (u && publicRoutes.includes(name || '')) return go(u.onboarded ? '/learn' : '/onboarding');
    if (u && !u.onboarded && !['onboarding', 'placement'].includes(name)) return go('/onboarding');
    Sp.stopListening();
    document.querySelectorAll('.confetti, .modal').forEach((e) => e.remove());
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    window.scrollTo(0, 0);
    (routes[name || 'welcome'] || routes.learn)(...params);
  }
  window.addEventListener('hashchange', () => {
    if (leaveGuard && !leaveGuard()) return;
    leaveGuard = null;
    render();
  });

  /* ------------------ BIENVENIDA / REGISTRO ------------------ */
  routes.welcome = () => {
    const hasUsers = St.allUsers().length > 0;
    app.innerHTML = `
      <div class="screen center welcome">
        <div class="mascot bounce">🦉</div>
        <h1 class="brand">English<span>Up</span></h1>
        <p class="lead">Aprende inglés gratis, a tu ritmo.<br>Escucha, habla, lee y escribe con un plan hecho para ti.</p>
        <div class="features">
          <div>🎯 Prueba de nivel</div><div>🗺️ Plan personalizado</div><div>🎤 Análisis de voz</div><div>✍️ Corrección de escritura</div>
        </div>
        <div class="stack">
          <a class="btn" href="#/register">Empezar ahora</a>
          <a class="btn secondary" href="#/login">${hasUsers ? 'Ya tengo una cuenta' : 'Iniciar sesión'}</a>
        </div>
        <p class="small muted install-hint">📲 Instálala en tu teléfono: en Android toca “Instalar app”; en iPhone toca <b>Compartir</b> → <b>Agregar a inicio</b>.</p>
      </div>`;
  };

  routes.register = () => {
    app.innerHTML = `
      <div class="screen form-screen">
        <a href="#/welcome" class="back">←</a>
        <div class="mascot sm">🦉</div>
        <h2>Crea tu perfil</h2>
        <p class="muted">Guardaremos tu progreso, tu nivel y tu plan.</p>
        <form id="f" class="stack">
          <label>Nombre<input name="name" required maxlength="40" placeholder="¿Cómo te llamas?" autocomplete="name"></label>
          <label>Correo electrónico<input name="email" type="email" required placeholder="tu@correo.com" autocomplete="email"></label>
          <label>Contraseña<input name="password" type="password" required minlength="6" placeholder="Mínimo 6 caracteres" autocomplete="new-password"></label>
          <label>Edad<select name="age"><option value="">Prefiero no decir</option><option>Menos de 13</option><option>13-17</option><option>18-24</option><option>25-34</option><option>35-49</option><option>50+</option></select></label>
          <div class="error" id="err"></div>
          <button class="btn" type="submit">Crear cuenta</button>
        </form>
        <p class="small muted center-text">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p>
      </div>`;
    $('#f').addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      try {
        await St.register(d);
        St.update((u) => { u.profile.age = d.age; });
        go('/onboarding');
      } catch (err) { $('#err').textContent = err.message; }
    });
  };

  routes.login = () => {
    app.innerHTML = `
      <div class="screen form-screen">
        <a href="#/welcome" class="back">←</a>
        <div class="mascot sm">🦉</div>
        <h2>¡Hola de nuevo!</h2>
        <form id="f" class="stack">
          <label>Correo electrónico<input name="email" type="email" required autocomplete="email"></label>
          <label>Contraseña<input name="password" type="password" required autocomplete="current-password"></label>
          <div class="error" id="err"></div>
          <button class="btn" type="submit">Entrar</button>
        </form>
        <p class="small muted center-text">¿No tienes cuenta? <a href="#/register">Regístrate</a></p>
        <label class="small muted center-text import-label">o restaura una copia de seguridad <input type="file" id="imp" accept="application/json" hidden><u>aquí</u></label>
      </div>`;
    $('#f').addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      try { await St.login(d.email, d.password); go('/learn'); } catch (err) { $('#err').textContent = err.message; }
    });
    $('#imp').addEventListener('change', (e) => importFile(e.target.files[0]));
  };
  function importFile(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { try { St.importData(r.result); toast('✅ Datos restaurados'); go('/learn'); } catch (e) { toast('❌ ' + e.message); } };
    r.readAsText(file);
  }

  /* ------------------ ONBOARDING ------------------ */
  routes.onboarding = () => {
    const u = St.user();
    let step = 0;
    const data = { goal: u.profile.goal, minutes: u.profile.minutes, reason: '', self: 'none' };
    const steps = [
      () => `
        <h2>¿Para qué quieres aprender inglés?</h2>
        <div class="grid2">${GOALS.map((g) => `<button class="select-card ${data.goal === g.id ? 'selected' : ''}" data-v="${g.id}"><span class="big-emoji">${g.icon}</span>${g.name}</button>`).join('')}</div>`,
      () => `
        <h2>¿Cuánto inglés sabes?</h2>
        <div class="stack">${[['none', '🐣', 'Nada o casi nada'], ['basic', '🙂', 'Conozco palabras y frases básicas'], ['some', '😎', 'Puedo mantener conversaciones simples'], ['good', '🤓', 'Hablo bien, quiero perfeccionar']]
          .map(([v, e, t]) => `<button class="select-row ${data.self === v ? 'selected' : ''}" data-v="${v}"><span class="big-emoji">${e}</span>${t}</button>`).join('')}</div>`,
      () => `
        <h2>¿Cuál es tu meta diaria?</h2>
        <div class="stack">${[[5, 'Relajada'], [10, 'Normal'], [15, 'Seria'], [20, 'Intensa'], [30, 'Extrema']]
          .map(([m, t]) => `<button class="select-row ${data.minutes === m ? 'selected' : ''}" data-v="${m}"><b>${m} min / día</b><span class="muted">${t}</span></button>`).join('')}</div>`,
      () => `
        <div class="center-text">
          <div class="mascot">🦉</div>
          <h2>¡Ahora descubramos tu nivel!</h2>
          <p class="muted">Una prueba corta y adaptativa (5-10 min) evalúa tu <b>gramática, vocabulario, comprensión auditiva, lectura, pronunciación y escritura</b> para crear tu plan.</p>
          <div class="stack">
            <button class="btn" id="do-test">🎯 Hacer prueba de nivel</button>
            <button class="btn secondary" id="from-zero">🐣 Empezar desde cero (A1)</button>
          </div>
        </div>`
    ];
    const keys = ['goal', 'self', 'minutes'];
    const draw = () => {
      app.innerHTML = `
        <div class="screen onboarding">
          <div class="steps">${steps.map((_, i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>
          <div class="step-body slide-in">${steps[step]()}</div>
          ${step < 3 ? `<div class="foot"><button class="btn" id="next">Continuar</button></div>` : ''}
        </div>`;
      $$('[data-v]').forEach((b) => b.addEventListener('click', () => {
        $$('[data-v]').forEach((x) => x.classList.remove('selected'));
        b.classList.add('selected');
        data[keys[step]] = keys[step] === 'minutes' ? +b.dataset.v : b.dataset.v;
      }));
      if (step < 3) $('#next').addEventListener('click', () => {
        step++; draw();
      });
      else {
        $('#do-test').addEventListener('click', () => { save(); go('/placement'); });
        $('#from-zero').addEventListener('click', () => {
          save();
          St.update((x) => { x.onboarded = true; x.level = 'A1'; x.cefr = null; x.placement = { date: Date.now(), level: 'A1', skills: { vocab: 30, grammar: 30, listening: 30, speaking: 30, writing: 30, reading: 30 }, skipped: true }; });
          go('/plan');
        });
      }
    };
    const save = () => St.update((x) => { x.profile.goal = data.goal; x.profile.minutes = data.minutes; x.profile.self = data.self; });
    draw();
  };

  /* ------------------ PRUEBA DE NIVEL ------------------ */
  routes.placement = () => {
    const blocks = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const stats = { vocab: [0, 0], grammar: [0, 0], listening: [0, 0], reading: [0, 0] };
    let passed = -1, bi = 0, speakScore = null, writeScore = null;

    const intro = () => {
      app.innerHTML = `
        <div class="screen center">
          <div class="mascot">🎯</div>
          <h2>Prueba de nivel</h2>
          <p class="muted">Las preguntas se adaptan a ti: si aciertas, sube la dificultad. No pasa nada si no sabes una respuesta, ¡elige la que creas!</p>
          <div class="test-parts">
            <div>🧩 Gramática y vocabulario</div><div>🎧 Comprensión auditiva</div><div>📖 Lectura</div><div>🎤 Pronunciación</div><div>✍️ Escritura</div>
          </div>
          <button class="btn" id="start">Comenzar</button>
        </div>`;
      $('#start').addEventListener('click', block);
    };

    const toExercise = (q) => {
      if (q.audio) return { type: 'listen_choice', skill: q.skill, question: q.q, audio: q.audio, options: q.o, answer: q.a };
      if (q.text) return { type: 'read', skill: q.skill, title: 'Lee el texto', text: q.text, question: q.q, options: q.o, answer: q.a };
      return { type: 'choice', skill: q.skill, question: q.q, options: q.o, answer: q.a };
    };

    function block() {
      const level = blocks[bi];
      const exercises = PLACEMENT[level].map(toExercise);
      Ex.run(app, {
        mode: 'test', exercises, settings: St.user().settings,
        onExit: () => go(St.user().onboarded ? '/learn' : '/onboarding'),
        hooks: { onResult: (ex, ok) => { const s = stats[ex.skill]; if (s) { s[1]++; if (ok) s[0]++; } } },
        onComplete: (r) => {
          if (r.correct >= 3) { passed = bi; bi++; if (bi < blocks.length) return interstitial(`¡Muy bien! Nivel ${level} superado 🎉`, block); }
          finalTasks();
        }
      });
      const p = $('.progress');
      if (p) p.insertAdjacentHTML('afterend', `<span class="lvl-tag">${level}</span>`);
    }

    function interstitial(msg, cb) {
      app.innerHTML = `<div class="screen center"><div class="mascot bounce">🦉</div><h2>${msg}</h2><p class="muted">Siguiente nivel: ${blocks[bi]}</p><button class="btn" id="c">Continuar</button></div>`;
      $('#c').addEventListener('click', cb);
    }

    function finalTasks() {
      const lvl = blocks[Math.max(0, passed)];
      app.innerHTML = `<div class="screen center"><div class="mascot">🎤✍️</div><h2>Última parte: habla y escribe</h2>
        <p class="muted">Evaluaremos tu pronunciación y tu escritura para personalizar tu plan. Puedes omitirlo.</p>
        <div class="stack"><button class="btn" id="c">Continuar</button><button class="btn secondary" id="s">Omitir</button></div></div>`;
      $('#s').addEventListener('click', finish);
      $('#c').addEventListener('click', () => {
        Ex.run(app, {
          mode: 'test', settings: St.user().settings,
          exercises: [
            { type: 'speak', skill: 'speaking', question: 'Lee esta frase en voz alta', text: PLACEMENT_SPEAK[lvl], translation: '' },
            { type: 'free_write', skill: 'writing', question: 'Escribe sobre ti', prompt: 'Describe your daily routine and your hobbies. (Describe tu rutina diaria y tus pasatiempos.)', min: passed >= 2 ? 50 : 20, keywords: [] }
          ],
          hooks: { onSpeak: (s) => { speakScore = s; }, onWrite: (t, an) => { writeScore = an.score; } },
          onExit: finish, onComplete: finish
        });
      });
    }

    function finish() {
      const pct = (s) => (s[1] ? Math.round(100 * s[0] / s[1]) : null);
      const base = 25 + 15 * (passed + 1);
      const skills = {
        vocab: pct(stats.vocab) ?? base, grammar: pct(stats.grammar) ?? base,
        listening: pct(stats.listening) ?? base, reading: pct(stats.reading) ?? base,
        speaking: speakScore ?? base, writing: writeScore ?? base
      };
      // las habilidades escaladas según el nivel alcanzado
      Object.keys(skills).forEach((k) => { skills[k] = Math.round(Math.min(100, skills[k] * 0.6 + base * 0.4)); });
      const cefr = passed >= 0 ? blocks[passed] : null;
      const studying = blocks[Math.min(blocks.length - 1, passed + 1)];
      St.update((u) => {
        u.onboarded = true; u.cefr = cefr; u.level = studying;
        u.placement = { date: Date.now(), level: cefr || 'A0', skills };
        u.progress.history.push({ date: Date.now(), event: 'placement', level: cefr || 'A0' });
      });
      confetti();
      const L = levelOf(studying);
      app.innerHTML = `
        <div class="screen center result">
          <div class="mascot bounce">🦉</div>
          <h2>¡Prueba completada!</h2>
          <div class="level-badge big" style="--c:${L.color}">${cefr || 'A0'}</div>
          <p><b>Tu nivel actual: ${cefr ? `${cefr} · ${levelOf(cefr).name}` : 'Principiante absoluto'}</b><br><span class="muted">Empezarás a estudiar el nivel <b>${studying}</b> (${L.name}).</span></p>
          ${radarChart(skills)}
          <button class="btn" id="plan">Ver mi plan de aprendizaje →</button>
        </div>`;
      $('#plan').addEventListener('click', () => go('/plan'));
    }
    intro();
  };

  /* ------------------ PLAN ------------------ */
  routes.plan = () => {
    const u = St.user();
    const p = St.buildPlan(u);
    const todayIdx = (new Date().getDay() + 6) % 7;
    app.innerHTML = `
      <div class="screen page">
        <div class="page-head"><a href="#/learn" class="back">←</a><h2>Tu plan de aprendizaje</h2></div>
        <div class="card hero-card">
          <div class="row between"><div><div class="muted small">Objetivo</div><b>${p.goal.icon} ${p.goal.name}</b></div><div class="level-badge" style="--c:${levelOf(p.target).color}">${p.target}</div></div>
          <div class="plan-path">${LEVELS.map((l) => `<span class="${St.levelIndex(l.id) < St.levelIndex(u.level) ? 'done' : l.id === u.level ? 'cur' : ''} ${l.id === p.target ? 'target' : ''}">${l.id}</span>`).join('<i></i>')}</div>
          <div class="grid3 mini-stats">
            <div><b>${p.minutes}</b><small>min/día</small></div>
            <div><b>${p.dailyXP}</b><small>XP meta diaria</small></div>
            <div><b>${p.remaining}</b><small>lecciones para ${p.target}</small></div>
          </div>
          <p class="small">📅 A tu ritmo, alcanzarás el nivel <b>${p.target}</b> aproximadamente el <b>${new Date(p.eta).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}</b>.</p>
        </div>
        <h3>Tus áreas de enfoque</h3>
        <div class="row gap wrap">${p.weak.map((k) => `<span class="pill" style="--c:${SKILLS[k].color}">${SKILLS[k].icon} ${SKILLS[k].name}</span>`).join('')}</div>
        <h3>Semana tipo</h3>
        <div class="week">${p.week.map((d, i) => `
          <div class="day ${i === todayIdx ? 'today' : ''}">
            <div class="day-name">${d.name.slice(0, 3)}</div><div class="day-icon">${d.icon}</div>
            <div class="day-body"><b>${d.focus}</b><ul>${d.items.map((x) => `<li>${x}</li>`).join('')}</ul></div>
          </div>`).join('')}</div>
        <h3>Recomendaciones</h3>
        <div class="card">${p.recs.map((r) => `<p>✔️ ${r}</p>`).join('')}</div>
        <div class="stack"><a class="btn" href="#/learn">¡Empezar a aprender!</a><a class="btn secondary" href="#/profile">Ajustar meta diaria</a></div>
      </div>`;
  };

  /* ------------------ CAMINO DE APRENDIZAJE ------------------ */
  routes.learn = () => {
    const u = St.user();
    const nxt = St.nextLesson(u);
    const curIdx = St.levelIndex(u.level);
    const dueW = St.dueWords(u).length, mist = u.progress.mistakes.length;
    const plan = St.buildPlan(u);
    const xpToday = u.progress.xpByDay[St.today()] || 0;

    const unitHtml = (unit, n) => {
      const unlocked = St.isUnitUnlocked(u, unit);
      const done = St.unitDoneCount(u, unit);
      const mastered = St.unitMastered(u, unit);
      const L = levelOf(unit.level);
      return `
        <section class="unit ${unlocked ? '' : 'locked'}" style="--c:${L.color}">
          <div class="unit-banner">
            <div><div class="small">Unidad ${n} · ${unit.level}</div><b>${unit.icon} ${esc(unit.title)}</b>
              <div class="unit-bar"><div style="width:${Math.round(100 * done / LESSON_TYPES.length)}%"></div></div></div>
            <button class="guide-btn" data-guide="${unit.id}" title="Guía">💡</button>
            ${mastered ? '<span class="crown">👑</span>' : ''}
          </div>
          <div class="nodes">${LESSON_TYPES.map((t, i) => {
            const lid = St.lessonId(unit.id, t.id);
            const rec = u.progress.lessons[lid];
            const open = St.isLessonUnlocked(u, unit, i);
            const isNext = nxt && nxt.unit.id === unit.id && nxt.type.id === t.id;
            const offset = Math.round(Math.sin(i * 1.1) * 70);
            return `<div class="node-wrap" style="transform:translateX(${offset}px)">
              ${isNext ? '<div class="start-tag">EMPEZAR</div>' : ''}
              <button class="node ${rec ? 'done' : ''} ${open ? 'open' : 'locked'} ${isNext ? 'next' : ''} ${t.id === 'review' ? 'review' : ''}" data-unit="${unit.id}" data-type="${t.id}" data-i="${i}">
                <span>${open ? t.icon : '🔒'}</span>
              </button>
              ${rec ? `<div class="stars">${'⭐'.repeat(rec.stars)}</div>` : ''}
            </div>`;
          }).join('')}</div>
        </section>`;
    };

    let n = 0;
    app.innerHTML = `
      ${topbar(u)}
      <main class="screen path-screen">
        <div class="card hello">
          <div><div class="muted small">¡Hola, ${esc(u.name.split(' ')[0])}! ${u.profile.avatar}</div>
            <b>${xpToday >= plan.dailyXP ? '¡Meta diaria cumplida! 🎉' : `Hoy: ${xpToday} / ${plan.dailyXP} XP`}</b>
            <div class="unit-bar"><div style="width:${Math.min(100, 100 * xpToday / plan.dailyXP)}%"></div></div></div>
          ${nxt ? `<button class="btn small" id="continue">▶ Continuar</button>` : ''}
        </div>
        <div class="quick">
          <a href="#/plan" class="quick-item">🗺️<small>Mi plan</small></a>
          <a href="#/flashcards" class="quick-item">🃏<small>Tarjetas${dueW ? ` <b class="badge">${dueW}</b>` : ''}</small></a>
          <a href="#/mistakes" class="quick-item">🧠<small>Errores${mist ? ` <b class="badge">${mist}</b>` : ''}</small></a>
          <a href="#/community" class="quick-item">🏆<small>Ranking</small></a>
        </div>
        ${LEVELS.map((L, li) => {
          const lp = St.levelProgress(u, L.id);
          const locked = li > curIdx;
          return `
          <div class="level-section ${locked ? 'locked' : ''}" id="lvl-${L.id}">
            <div class="level-head" style="--c:${L.color}">
              <div class="level-badge" style="--c:${L.color}">${L.id}</div>
              <div class="grow"><b>${L.icon} ${L.name}</b><div class="small muted">${L.desc}</div>
                <div class="unit-bar"><div style="width:${lp.pct}%"></div></div><div class="small muted">${lp.done}/${lp.total} lecciones · ${lp.pct}%</div></div>
            </div>
            ${locked ? `<div class="locked-msg">🔒 Completa el nivel ${LEVELS[li - 1].id} o <a href="#/retest">vuelve a hacer la prueba de nivel</a> para desbloquearlo.</div>` : ''}
            ${St.unitsOf(L.id).map((un) => unitHtml(un, ++n)).join('')}
          </div>`;
        }).join('')}
        <div class="end-path">🏁 ¡Más contenido pronto!</div>
      </main>
      ${tabbar('learn')}`;

    if (nxt) $('#continue').addEventListener('click', () => go(`/lesson/${nxt.unit.id}/${nxt.type.id}`));
    $$('.node').forEach((b) => b.addEventListener('click', () => lessonSheet(b.dataset.unit, b.dataset.type, +b.dataset.i)));
    $$('[data-guide]').forEach((b) => b.addEventListener('click', () => guideModal(b.dataset.guide)));
    // desplazar a la lección actual
    const target = $('.node.next') || $(`#lvl-${u.level}`);
    if (target) setTimeout(() => target.scrollIntoView({ block: 'center' }), 50);
  };

  function lessonSheet(unitId, typeId, i) {
    const u = St.user(), unit = unitOf(unitId), t = LESSON_TYPES[i];
    const rec = u.progress.lessons[St.lessonId(unitId, typeId)];
    const open = St.isLessonUnlocked(u, unit, i);
    const desc = {
      vocab: 'Aprende palabras nuevas con imágenes y audio.', grammar: 'Domina la estructura gramatical de la unidad.',
      listening: 'Entrena tu oído con dictados y audios.', speaking: 'Practica tu pronunciación con análisis de voz.',
      writing: 'Traduce y escribe textos con corrección automática.', reading: 'Lee un texto y responde preguntas.',
      review: 'Examen de la unidad. Consigue 80% o más para ganar la corona 👑.'
    }[typeId];
    modal(`
      <div class="sheet-lesson" style="--c:${levelOf(unit.level).color}">
        <div class="big-emoji">${t.icon}</div>
        <h3>${t.name}</h3>
        <div class="muted small">${unit.icon} ${esc(unit.title)} · ${unit.level}</div>
        <p>${desc}</p>
        ${rec ? `<div class="rec">Mejor resultado: <b>${rec.best}%</b> ${'⭐'.repeat(rec.stars)} · Intentos: ${rec.attempts}</div>` : ''}
        ${open ? `<button class="btn" id="go">${rec ? '🔁 Repetir lección' : '▶ Empezar'} ${rec ? '' : '+XP'}</button>` : '<div class="locked-msg">🔒 Completa la lección anterior para desbloquear esta.</div>'}
        ${typeId === 'grammar' || typeId === 'review' ? `<button class="btn secondary" id="guide">💡 Ver guía</button>` : ''}
        <button class="btn ghost" data-close>Cerrar</button>
      </div>`, (m, close) => {
      const g = $('#go', m); if (g) g.addEventListener('click', () => { close(); go(`/lesson/${unitId}/${typeId}`); });
      const gd = $('#guide', m); if (gd) gd.addEventListener('click', () => { close(); guideModal(unitId); });
    });
  }

  function guideModal(unitId) {
    const unit = unitOf(unitId);
    modal(`
      <h3>💡 ${esc(unit.tip.title)}</h3>
      <div class="tip-card">${unit.tip.html}</div>
      <h4>Vocabulario de la unidad</h4>
      <div class="vocab-list">${unit.vocab.map((v) => `<button class="vocab-item" data-say="${esc(v[0])}">${v[2]} <b>${esc(v[0])}</b> <span class="muted">${esc(v[1])}</span></button>`).join('')}</div>
      <h4>Frases clave</h4>
      <div class="vocab-list">${unit.sentences.map((s) => `<button class="vocab-item" data-say="${esc(s[0])}">🔊 <b>${esc(s[0])}</b><br><span class="muted">${esc(s[1])}</span></button>`).join('')}</div>
      <button class="btn" data-close>Cerrar</button>`, (m) => Ex.bindSpeakers(m));
  }

  /* ------------------ LECCIÓN ------------------ */
  function lessonHooks(u) {
    return {
      onResult: (ex, ok, retry) => { if (!retry) St.update((x) => { St.recordSkill(x, ex.skill, ok); if (!ok) St.addMistake(x, ex); }); },
      onSpeak: () => St.update((x) => { x.progress.speakCount++; }),
      onWrite: (text, an, ex) => St.update((x) => { x.progress.writeCount++; x.progress.writings.unshift({ date: Date.now(), prompt: ex.prompt, text, score: an.score }); x.progress.writings = x.progress.writings.slice(0, 30); }),
      speakingOff: () => St.update((x) => { x.settings.speakingOffUntil = Date.now() + 15 * 60000; })
    };
  }
  const speakingDisabled = (u) => (u.settings.speakingOffUntil || 0) > Date.now();

  routes.lesson = (unitId, typeId) => {
    const u = St.user();
    const unit = unitOf(unitId);
    const ti = LESSON_TYPES.findIndex((t) => t.id === typeId);
    if (!unit || ti < 0 || !St.isLessonUnlocked(u, unit, ti)) return go('/learn');
    const built = Ls.build(unitId, typeId);
    let exercises = built.exercises;
    if (speakingDisabled(u) && typeId !== 'speaking') exercises = exercises.filter((e) => e.type !== 'speak');
    let finished = false;
    leaveGuard = () => finished || confirm('¿Salir de la lección? Perderás el progreso.');
    Ex.run(app, {
      exercises, settings: u.settings, hooks: lessonHooks(u),
      onExit: () => { finished = true; go('/learn'); },
      onComplete: (r) => { finished = true; leaveGuard = null; lessonComplete(unit, typeId, r); }
    });
  };

  function lessonComplete(unit, typeId, r) {
    const lid = St.lessonId(unit.id, typeId);
    let levelUp = null, got = [];
    const base = typeId === 'review' ? 20 : 10;
    const stars = r.score >= 95 ? 3 : r.score >= 80 ? 2 : 1;
    const u0 = St.user();
    const isRetake = !!u0.progress.lessons[lid];
    const xp = Math.round((base + Math.round(r.score / 10) + (r.score === 100 ? 5 : 0)) * (isRetake ? 0.7 : 1));
    St.update((u) => {
      const p = u.progress;
      const prev = p.lessons[lid];
      p.lessons[lid] = { best: Math.max(prev ? prev.best : 0, r.score), stars: Math.max(prev ? prev.stars : 0, stars), attempts: (prev ? prev.attempts : 0) + 1, last: Date.now() };
      St.addXP(u, xp);
      p.minutesByDay[St.today()] = (p.minutesByDay[St.today()] || 0) + r.minutes;
      if (typeId === 'vocab' || typeId === 'review') St.learnWords(u, unit.vocab);
      levelUp = St.checkLevelUp(u);
      got = St.checkAchievements(u, { perfect: r.score === 100 && r.total >= 5, levelUp: !!levelUp });
    });
    const u = St.user();
    const plan = St.buildPlan(u);
    const xpToday = u.progress.xpByDay[St.today()] || 0;
    Sp.beep('done');
    confetti();
    const passedReview = typeId === 'review' && r.score >= 80;
    app.innerHTML = `
      <div class="screen center result">
        <div class="mascot bounce">${r.score >= 80 ? '🦉🎉' : '🦉💪'}</div>
        <h2>${levelUp ? `¡Subiste al nivel ${levelUp}! 🚀` : passedReview ? '¡Unidad dominada! 👑' : r.score >= 80 ? '¡Lección completada!' : '¡Lección terminada!'}</h2>
        <div class="stars big">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <div class="grid3 result-stats">
          <div class="rs xp"><small>XP</small><b>+${xp}</b></div>
          <div class="rs acc"><small>Precisión</small><b>${r.score}%</b></div>
          <div class="rs time"><small>Tiempo</small><b>${Math.max(1, Math.round(r.minutes))} min</b></div>
        </div>
        <p class="muted">Meta diaria: ${Math.min(xpToday, plan.dailyXP)}/${plan.dailyXP} XP · 🔥 Racha: ${St.currentStreak(u)} días</p>
        ${typeId === 'review' && r.score < 80 ? '<p class="note">Necesitas 80% para ganar la corona. ¡Puedes repetir el repaso cuando quieras!</p>' : ''}
        ${r.wrong.length ? `<details class="card left"><summary>Revisar ${r.wrong.length} error(es)</summary>${r.wrong.map((w) => `<div class="wrong-item">${esc(w.question || '')}: <b>${esc(w.answers ? w.answers[0] : w.text || (w.options ? (w.options[w.answer].text || w.options[w.answer]) : w.sentence || ''))}</b></div>`).join('')}</details>` : ''}
        <div class="stack">
          <button class="btn" id="next">Continuar</button>
          <button class="btn secondary" id="again">🔁 Repetir lección</button>
        </div>
      </div>`;
    $('#next').addEventListener('click', () => go('/learn'));
    $('#again').addEventListener('click', () => go(`/lesson/${unit.id}/${typeId}`));
    announceAchievements(got);
  }

  /* ------------------ PRÁCTICA ------------------ */
  routes.practice = () => {
    const u = St.user();
    const dueW = St.dueWords(u).length, mist = u.progress.mistakes.length;
    app.innerHTML = `
      ${topbar(u)}
      <main class="screen page">
        <h2>Práctica</h2>
        <div class="grid2">
          <a class="practice-card" href="#/mistakes" style="--c:#ff4b4b"><span>🧠</span><b>Repasar errores</b><small>${mist} pendientes</small></a>
          <a class="practice-card" href="#/flashcards" style="--c:#1cb0f6"><span>🃏</span><b>Tarjetas</b><small>${dueW} para hoy · ${Object.keys(u.progress.words).length} palabras</small></a>
          <a class="practice-card" href="#/voicelab" style="--c:#ff9600"><span>🎤</span><b>Laboratorio de voz</b><small>Pronunciación con análisis</small></a>
          <a class="practice-card" href="#/writelab" style="--c:#ce82ff"><span>✍️</span><b>Laboratorio de escritura</b><small>Corrección detallada</small></a>
          <a class="practice-card" href="#/chat" style="--c:#58cc02"><span>💬</span><b>Conversaciones</b><small>Simula situaciones reales</small></a>
          <a class="practice-card" href="#/grammar" style="--c:#2b70c9"><span>📘</span><b>Guía gramatical</b><small>Todas las reglas</small></a>
        </div>
        <h3>Práctica por habilidad</h3>
        <div class="skill-list">${Object.entries(SKILLS).map(([k, s]) => {
          const sc = St.skillScores(u)[k];
          return `<a class="skill-row" href="#/drill/${k}"><span class="big-emoji">${s.icon}</span><div class="grow"><b>${s.name}</b><div class="unit-bar" style="--c:${s.color}"><div style="width:${sc}%"></div></div></div><span class="muted">${sc}%</span></a>`;
        }).join('')}</div>
      </main>
      ${tabbar('practice')}`;
  };

  function unlockedUnits(u) { return UNITS.filter((un) => St.isUnitUnlocked(u, un)); }

  function practiceRun(exercises, title, extra = {}) {
    const u = St.user();
    if (!exercises.length) { toast('No hay ejercicios disponibles todavía.'); return go('/practice'); }
    let finished = false;
    leaveGuard = () => finished || confirm('¿Salir de la práctica?');
    const hooks = lessonHooks(u);
    Ex.run(app, {
      mode: 'practice', exercises, settings: u.settings, hooks: { ...hooks, ...(extra.hooks || {}) },
      onExit: () => { finished = true; go('/practice'); },
      onComplete: (r) => {
        finished = true; leaveGuard = null;
        let got = [];
        const xp = 5 + Math.round(r.score / 10);
        St.update((x) => { St.addXP(x, xp); x.progress.minutesByDay[St.today()] = (x.progress.minutesByDay[St.today()] || 0) + r.minutes; extra.onDone && extra.onDone(x, r); got = St.checkAchievements(x, extra.ctx || {}); });
        Sp.beep('done');
        app.innerHTML = `
          <div class="screen center result">
            <div class="mascot bounce">🦉</div><h2>${esc(title)} completado</h2>
            <div class="grid3 result-stats"><div class="rs xp"><small>XP</small><b>+${xp}</b></div><div class="rs acc"><small>Precisión</small><b>${r.score}%</b></div><div class="rs time"><small>Tiempo</small><b>${Math.max(1, Math.round(r.minutes))} min</b></div></div>
            <div class="stack"><a class="btn" href="#/practice">Continuar</a></div>
          </div>`;
        announceAchievements(got);
      }
    });
  }

  routes.drill = (skill) => {
    const u = St.user();
    if (!SKILLS[skill]) return go('/practice');
    let ex = Ls.practice(skill, unlockedUnits(u));
    if (speakingDisabled(u)) ex = ex.filter((e) => e.type !== 'speak');
    practiceRun(ex, `Práctica de ${SKILLS[skill].name.toLowerCase()}`);
  };

  routes.mistakes = () => {
    const u = St.user();
    const list = u.progress.mistakes.slice(-12).map((m) => m.ex);
    if (!list.length) {
      app.innerHTML = `<div class="screen center"><div class="mascot">🧠</div><h2>¡No tienes errores pendientes!</h2><p class="muted">Los ejercicios que falles aparecerán aquí para repasarlos.</p><a class="btn" href="#/practice">Volver</a></div>`;
      return;
    }
    practiceRun(Ls.shuffle(list), 'Repaso de errores', {
      hooks: { onResult: (ex, ok, retry) => { St.update((x) => { St.recordSkill(x, ex.skill, ok); if (ok && !retry) St.clearMistake(x, ex); }); } },
      ctx: { review: true }
    });
  };

  /* ------------------ TARJETAS (repetición espaciada) ------------------ */
  routes.flashcards = () => {
    const u = St.user();
    let cards = St.dueWords(u);
    const all = Object.entries(u.progress.words);
    let mode = 'due';
    if (!all.length) {
      app.innerHTML = `<div class="screen center"><div class="mascot">🃏</div><h2>Aún no tienes palabras</h2><p class="muted">Completa lecciones de vocabulario y las palabras aparecerán aquí para repasarlas con repetición espaciada.</p><a class="btn" href="#/learn">Ir a aprender</a></div>`;
      return;
    }
    if (!cards.length) { cards = Ls.pick(all, 10); mode = 'extra'; }
    cards = Ls.shuffle(cards).slice(0, 20);
    let i = 0, known = 0;
    const draw = () => {
      if (i >= cards.length) {
        St.update((x) => { St.addXP(x, 5 + known); });
        app.innerHTML = `<div class="screen center result"><div class="mascot bounce">🦉</div><h2>¡Repaso terminado!</h2><p>Recordaste <b>${known}</b> de ${cards.length} palabras.</p><p class="muted">Las palabras que no recordaste volverán mañana. Las que sí, en unos días.</p><a class="btn" href="#/practice">Continuar</a></div>`;
        return;
      }
      const [en, w] = cards[i];
      app.innerHTML = `
        <div class="screen page flash-screen">
          <div class="page-head"><a href="#/practice" class="back">✕</a><div class="progress"><div class="bar" style="width:${100 * i / cards.length}%"></div></div></div>
          <p class="muted center-text">${mode === 'due' ? 'Palabras para repasar hoy' : 'Repaso libre'} · ${i + 1}/${cards.length} · Caja ${w.box}/6</p>
          <div class="flashcard" id="card">
            <div class="face front"><div class="intro-emoji">${w.emoji}</div><div class="intro-word">${esc(en)}</div><small class="muted">Toca para ver la traducción</small></div>
            <div class="face back"><div class="intro-emoji">${w.emoji}</div><div class="intro-meaning">${esc(w.es)}</div><div class="intro-word sm">${esc(en)}</div></div>
          </div>
          <div class="row gap center"><button class="btn-speaker big" data-say="${esc(en)}">🔊</button></div>
          <div class="row gap foot2"><button class="btn danger" id="no">😕 No la sabía</button><button class="btn" id="yes">😄 La sabía</button></div>
        </div>`;
      Ex.bindSpeakers(app);
      Sp.speak(en);
      $('#card').addEventListener('click', () => $('#card').classList.toggle('flipped'));
      $('#yes').addEventListener('click', () => { St.update((x) => St.reviewWord(x, en, true)); known++; i++; Sp.beep('ok'); draw(); });
      $('#no').addEventListener('click', () => { St.update((x) => St.reviewWord(x, en, false)); i++; draw(); });
    };
    draw();
  };

  /* ------------------ LABORATORIO DE VOZ ------------------ */
  routes.voicelab = () => {
    const u = St.user();
    const units = unlockedUnits(u);
    const sentences = units.flatMap((un) => un.sentences.map((s) => ({ en: s[0], es: s[1], level: un.level, unit: un.title })));
    let current = sentences[sentences.length - 1] || { en: 'Hello, how are you?', es: 'Hola, ¿cómo estás?' };
    const draw = () => {
      app.innerHTML = `
        <div class="screen page">
          <div class="page-head"><a href="#/practice" class="back">←</a><h2>🎤 Laboratorio de voz</h2></div>
          ${Sp.canListen() ? '' : `<div class="note warn">Tu navegador no tiene reconocimiento de voz. Usa <b>Chrome</b> en Android o <b>Safari</b> en iPhone para el análisis automático. Mientras, puedes grabarte y compararte con el modelo.</div>`}
          <div class="card">
            <label class="small muted">Elige una frase o escribe la tuya</label>
            <select id="sel">${sentences.map((s, i) => `<option value="${i}" ${s.en === current.en ? 'selected' : ''}>${s.level} · ${esc(s.en)}</option>`).join('')}</select>
            <div class="row gap"><input id="custom" placeholder="O escribe una frase en inglés..."><button class="btn small" id="use">Usar</button></div>
          </div>
          <div id="ex"></div>
          <div class="card"><h4>💡 Consejos de pronunciación para hispanohablantes</h4>
            <ul class="tips">
              <li><b>TH</b>: lengua entre los dientes → <i>think, three, the</i>.</li>
              <li><b>V ≠ B</b>: la V usa dientes y labio → <i>very, vote</i>.</li>
              <li><b>S inicial</b>: sin "e" → <i>school, Spain, street</i>.</li>
              <li><b>I corta / II larga</b>: <i>ship / sheep, live / leave</i>.</li>
              <li><b>-ED</b>: <i>worked</i> /t/, <i>played</i> /d/, <i>wanted</i> /id/.</li>
              <li><b>Consonantes finales</b>: pronúncialas → <i>cat, bag, hand</i>.</li>
            </ul></div>
        </div>`;
      $('#sel').addEventListener('change', (e) => { current = sentences[+e.target.value]; drawEx(); });
      $('#use').addEventListener('click', () => { const v = $('#custom').value.trim(); if (v) { current = { en: v, es: '' }; drawEx(); } });
      drawEx();
    };
    const drawEx = () => {
      const holder = $('#ex');
      // Reutiliza el ejercicio de habla en un contenedor simple
      const ctx = { mode: 'practice', settings: u.settings, setReady() {}, submit() {}, skipSpeaking() {}, sound: () => {}, onSpeak: () => {} };
      const el = document.createElement('div'); el.className = 'card';
      holder.innerHTML = ''; holder.appendChild(el);
      const evalFn = Exercises_speak(current, el, ctx);
      const btn = document.createElement('button'); btn.className = 'btn secondary'; btn.textContent = 'Guardar resultado (+XP)';
      btn.addEventListener('click', () => { const r = evalFn(); St.update((x) => { x.progress.speakCount++; St.recordSkill(x, 'speaking', r.correct); St.addXP(x, r.correct ? 3 : 1); St.checkAchievements(x); }); toast(r.score ? `🎤 Guardado: ${r.score}/100` : 'Graba tu voz primero'); });
      el.appendChild(btn);
      const skip = $('.skip-speak', el); if (skip) skip.remove();
    };
    draw();
  };
  // acceso al renderer de habla
  function Exercises_speak(s, el, ctx) {
    return window.ExercisesRenderers.speak({ type: 'speak', question: 'Pronuncia', text: s.en, translation: s.es }, el, ctx);
  }

  /* ------------------ LABORATORIO DE ESCRITURA ------------------ */
  routes.writelab = () => {
    const u = St.user();
    const units = unlockedUnits(u);
    const prompts = units.map((un) => ({ ...un.writing, level: un.level, title: un.title }));
    const extra = [
      { prompt: 'Escribe un correo a un amigo invitándolo a tu cumpleaños.', min: 30, keywords: ['dear', 'party'], level: 'A2', title: 'Correo informal' },
      { prompt: 'Describe tu película o serie favorita y por qué te gusta.', min: 40, keywords: ['because'], level: 'A2', title: 'Opinión' },
      { prompt: 'Escribe una reseña de un restaurante (comida, servicio, precio).', min: 60, keywords: ['however'], level: 'B1', title: 'Reseña' },
      { prompt: 'Tema libre: escribe sobre lo que quieras.', min: 20, keywords: [], level: 'A1', title: 'Libre' }
    ];
    const all = [...prompts, ...extra];
    let cur = 0;
    const draw = () => {
      app.innerHTML = `
        <div class="screen page">
          <div class="page-head"><a href="#/practice" class="back">←</a><h2>✍️ Laboratorio de escritura</h2></div>
          <select id="sel">${all.map((p, i) => `<option value="${i}" ${i === cur ? 'selected' : ''}>${p.level} · ${esc(p.title)}</option>`).join('')}</select>
          <div id="ex" class="card"></div>
          ${u.progress.writings.length ? `<h3>Tus textos anteriores</h3>${u.progress.writings.slice(0, 8).map((w) => `
            <details class="card left"><summary><b>${w.score}/100</b> · ${new Date(w.date).toLocaleDateString('es')} · ${esc(w.prompt.slice(0, 40))}…</summary><p class="written">${esc(w.text)}</p></details>`).join('')}` : ''}
        </div>`;
      $('#sel').addEventListener('change', (e) => { cur = +e.target.value; draw(); });
      const el = $('#ex');
      const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Analizar mi texto'; btn.disabled = true;
      const ctx = { mode: 'practice', setReady: (v) => { btn.disabled = !v; }, submit() {}, sound() {}, onWrite: lessonHooks(u).onWrite };
      const evalFn = window.ExercisesRenderers.free_write({ type: 'free_write', question: all[cur].title, ...all[cur] }, el, ctx);
      el.appendChild(btn);
      btn.addEventListener('click', () => {
        const r = evalFn(); btn.remove();
        let got = [];
        St.update((x) => { St.recordSkill(x, 'writing', r.correct); St.addXP(x, 5 + Math.round(r.score / 20)); got = St.checkAchievements(x); });
        announceAchievements(got);
        const again = document.createElement('button'); again.className = 'btn secondary'; again.textContent = '✏️ Escribir otro texto';
        again.addEventListener('click', draw); el.appendChild(again);
      });
    };
    draw();
  };

  /* ------------------ CONVERSACIONES ------------------ */
  routes.chat = (id) => {
    const u = St.user();
    if (!id) {
      app.innerHTML = `
        <div class="screen page">
          <div class="page-head"><a href="#/practice" class="back">←</a><h2>💬 Conversaciones</h2></div>
          <p class="muted">Practica diálogos de la vida real. Responde tocando la opción correcta o <b>hablando</b> 🎤.</p>
          ${DIALOGUES.map((d) => {
            const locked = St.levelIndex(d.level) > St.levelIndex(u.level);
            return `<a class="skill-row ${locked ? 'locked' : ''}" href="${locked ? 'javascript:void 0' : `#/chat/${d.id}`}"><span class="big-emoji">${d.icon}</span><div class="grow"><b>${d.title}</b><div class="small muted">Nivel ${d.level}${u.progress.achievements['chat_' + d.id] ? ' · ✅ Completada' : ''}</div></div><span>${locked ? '🔒' : '›'}</span></a>`;
          }).join('')}
        </div>`;
      return;
    }
    const d = DIALOGUES.find((x) => x.id === id);
    if (!d) return go('/chat');
    let t = 0, ok = 0;
    app.innerHTML = `
      <div class="screen chat-screen">
        <div class="page-head"><a href="#/chat" class="back">←</a><h2>${d.icon} ${d.title}</h2></div>
        <div class="chat-log" id="log"></div>
        <div class="chat-input" id="inp"></div>
      </div>`;
    const log = $('#log'), inp = $('#inp');
    const addMsg = (who, text, sub) => {
      log.insertAdjacentHTML('beforeend', `<div class="msg ${who} pop"><div class="msg-bubble">${esc(text)}${sub ? `<div class="msg-sub">${esc(sub)}</div>` : ''}${who === 'bot' ? `<button class="btn-speaker tiny" data-say="${esc(text)}">🔊</button>` : ''}</div></div>`);
      Ex.bindSpeakers(log.lastElementChild);
      log.scrollTop = log.scrollHeight;
    };
    const turn = () => {
      if (t >= d.turns.length) {
        let got = [];
        St.update((x) => { x.progress.achievements['chat_' + d.id] = Date.now(); St.addXP(x, 10 + ok * 2); St.recordSkill(x, 'speaking', ok >= d.turns.length - 1); got = St.checkAchievements(x, { chat: true }); });
        addMsg('bot', '🎉 Great job! Conversation completed.', `Acertaste ${ok} de ${d.turns.length}. +${10 + ok * 2} XP`);
        inp.innerHTML = `<a class="btn" href="#/chat">Terminar</a>`;
        announceAchievements(got);
        return;
      }
      const tr = d.turns[t];
      addMsg('bot', tr.bot, tr.es);
      Sp.speak(tr.bot);
      const opts = Ls.shuffle(tr.o.map((o, i) => ({ o, i })));
      inp.innerHTML = `${opts.map((x) => `<button class="option" data-i="${x.i}">${esc(x.o)}</button>`).join('')}
        ${Sp.canListen() ? '<button class="btn secondary" id="say">🎤 Responder hablando</button>' : ''}`;
      const answer = (i, spoken) => {
        const correct = i === tr.a;
        addMsg('me', spoken || tr.o[i]);
        if (correct) { ok++; Sp.beep('ok'); } else { Sp.beep('bad'); addMsg('hint', `💡 Mejor respuesta: "${tr.o[tr.a]}"`); }
        t++; setTimeout(turn, 900);
      };
      $$('.option', inp).forEach((b) => b.addEventListener('click', () => answer(+b.dataset.i)));
      const say = $('#say', inp);
      if (say) say.addEventListener('click', async () => {
        say.textContent = '🎙️ Escuchando...'; say.classList.add('recording');
        try {
          const r = await Sp.listen();
          const scores = tr.o.map((o) => An.analyzeSpeech(o, r.alternatives, r.confidence).score);
          const best = scores.indexOf(Math.max(...scores));
          if (scores[best] < 50) { toast('No te entendí bien, intenta de nuevo o elige una opción'); say.textContent = '🎤 Responder hablando'; say.classList.remove('recording'); return; }
          answer(best, r.alternatives[0]);
        } catch (e) { toast('No te escuché. Intenta de nuevo.'); say.textContent = '🎤 Responder hablando'; say.classList.remove('recording'); }
      });
    };
    turn();
  };

  /* ------------------ GUÍA GRAMATICAL ------------------ */
  routes.grammar = () => {
    const u = St.user();
    app.innerHTML = `
      <div class="screen page">
        <div class="page-head"><a href="#/practice" class="back">←</a><h2>📘 Guía gramatical</h2></div>
        <input id="q" placeholder="🔍 Buscar tema (ej. pasado, if, should...)">
        <div id="list">${UNITS.map((un) => {
          const open = St.isUnitUnlocked(u, un);
          return `<details class="card left grammar-item" data-text="${esc((un.tip.title + ' ' + un.title + ' ' + un.tip.html.replace(/<[^>]+>/g, ' ')).toLowerCase())}">
            <summary><span class="level-badge sm" style="--c:${levelOf(un.level).color}">${un.level}</span> ${esc(un.tip.title)} ${open ? '' : '🔒'}</summary>
            <div class="tip-card">${un.tip.html}</div></details>`;
        }).join('')}</div>
      </div>`;
    $('#q').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      $$('.grammar-item').forEach((d) => { d.style.display = d.dataset.text.includes(q) ? '' : 'none'; });
    });
  };

  /* ------------------ PROGRESO ------------------ */
  function radarChart(scores, other) {
    const keys = Object.keys(SKILLS);
    const cx = 150, cy = 130, R = 95;
    const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / keys.length; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const rings = [0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${keys.map((_, i) => pt(i, R * f).join(',')).join(' ')}" class="radar-ring"/>`).join('');
    const axes = keys.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}" class="radar-axis"/>`).join('');
    const poly = keys.map((k, i) => pt(i, R * Math.max(0.05, (scores[k] || 0) / 100)).join(',')).join(' ');
    const poly2 = other ? keys.map((k, i) => pt(i, R * Math.max(0.05, (other[k] || 0) / 100)).join(',')).join(' ') : '';
    const labels = keys.map((k, i) => { const [x, y] = pt(i, R + 24); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="radar-label">${SKILLS[k].icon} ${other ? '' : scores[k] || 0}</text>`; }).join('');
    return `<svg viewBox="0 0 300 260" class="radar" role="img" aria-label="Habilidades">${rings}${axes}${other ? `<polygon points="${poly2}" class="radar-area other"/>` : ''}<polygon points="${poly}" class="radar-area"/>${labels}</svg>`;
  }

  routes.progress = () => {
    const u = St.user(), p = u.progress;
    const scores = St.skillScores(u);
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const xpDays = days.map((d) => p.xpByDay[St.today(d)] || 0);
    const maxXP = Math.max(20, ...xpDays);
    const lessonsDone = Object.keys(p.lessons).length;
    const totalLessons = UNITS.length * LESSON_TYPES.length;
    const minutes = Math.round(Object.values(p.minutesByDay).reduce((a, b) => a + b, 0));
    const tot = Object.values(p.skills).reduce((a, s) => [a[0] + s.c, a[1] + s.t], [0, 0]);
    const acc = tot[1] ? Math.round(100 * tot[0] / tot[1]) : 0;
    const L = levelOf(u.level);
    const lp = St.levelProgress(u, u.level);
    const plan = St.buildPlan(u);
    // calendario de actividad (últimas 5 semanas)
    const cal = Array.from({ length: 35 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (34 - i)); const x = p.xpByDay[St.today(d)] || 0; return `<span class="cal-d l${x === 0 ? 0 : x < 20 ? 1 : x < 50 ? 2 : 3}" title="${St.today(d)}: ${x} XP"></span>`; }).join('');

    app.innerHTML = `
      ${topbar(u)}
      <main class="screen page">
        <h2>Tu progreso</h2>
        <div class="card hero-card" style="--c:${L.color}">
          <div class="row between">
            <div><div class="muted small">Nivel certificado</div><b class="xl">${u.cefr || 'A0'}</b> <span class="muted">→ estudiando ${u.level}</span></div>
            <div class="level-badge big" style="--c:${L.color}">${u.level}</div>
          </div>
          <div class="unit-bar thick"><div style="width:${lp.pct}%"></div></div>
          <div class="small muted">${lp.done}/${lp.total} lecciones de ${u.level} · Curso completo: ${Math.round(100 * lessonsDone / totalLessons)}%</div>
        </div>
        <div class="grid3 stat-grid">
          <div class="stat"><span>🔥</span><b>${St.currentStreak(u)}</b><small>Racha (mejor ${p.streak.best})</small></div>
          <div class="stat"><span>💎</span><b>${p.xp}</b><small>XP total</small></div>
          <div class="stat"><span>✅</span><b>${lessonsDone}</b><small>Lecciones</small></div>
          <div class="stat"><span>📚</span><b>${Object.keys(p.words).length}</b><small>Palabras</small></div>
          <div class="stat"><span>⏱️</span><b>${minutes}</b><small>Minutos</small></div>
          <div class="stat"><span>🎯</span><b>${acc}%</b><small>Precisión</small></div>
        </div>
        <div class="card"><h4>XP de los últimos 7 días <span class="muted small">(meta ${plan.dailyXP})</span></h4>
          <div class="bars">${xpDays.map((x, i) => `<div class="bar-col"><div class="bar-v ${x >= plan.dailyXP ? 'met' : ''}" style="height:${Math.max(4, 100 * x / maxXP)}%"><small>${x || ''}</small></div><small>${'DLMXJVS'[days[i].getDay()]}</small></div>`).join('')}</div>
        </div>
        <div class="card"><h4>Calendario de actividad</h4><div class="calendar">${cal}</div><div class="small muted">🛡️ Protectores de racha: ${p.streak.freezes}</div></div>
        <div class="card"><h4>Tus habilidades</h4>${radarChart(scores)}
          ${Object.entries(SKILLS).map(([k, s]) => `<div class="skill-line"><span>${s.icon} ${s.name}</span><div class="unit-bar" style="--c:${s.color}"><div style="width:${scores[k]}%"></div></div><b>${scores[k]}</b></div>`).join('')}
          <p class="small muted">Fortaleza: <b>${SKILLS[Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]].name}</b> · A mejorar: <b>${plan.weak.map((k) => SKILLS[k].name).join(', ')}</b></p>
        </div>
        <div class="card"><h4>Niveles</h4>${LEVELS.map((l) => { const x = St.levelProgress(u, l.id); return `<div class="skill-line"><span><span class="level-badge sm" style="--c:${l.color}">${l.id}</span> ${l.name}</span><div class="unit-bar" style="--c:${l.color}"><div style="width:${x.pct}%"></div></div><b>${x.pct}%</b></div>`; }).join('')}</div>
        <div class="card"><h4>Logros (${ACHIEVEMENTS.filter((a) => p.achievements[a.id]).length}/${ACHIEVEMENTS.length})</h4>
          <div class="achievements">${ACHIEVEMENTS.map((a) => `<div class="ach ${p.achievements[a.id] ? 'got' : ''}" title="${a.desc}"><span>${a.icon}</span><small>${a.name}</small></div>`).join('')}</div></div>
        ${p.writings.length ? `<div class="card"><h4>Evolución de tu escritura</h4><div class="bars small">${p.writings.slice(0, 10).reverse().map((w) => `<div class="bar-col"><div class="bar-v" style="height:${w.score}%;--c:#ce82ff"><small>${w.score}</small></div></div>`).join('')}</div></div>` : ''}
      </main>
      ${tabbar('progress')}`;
  };


  /* ------------------ COMUNIDAD: RANKING Y COMPARAR ------------------ */
  const ago = (t) => {
    const d = Math.floor((Date.now() - t) / 86400000);
    return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`;
  };
  function addFriendCode(text) {
    const str = String(text || '');
    const fromLink = str.match(/#\/add\/([A-Za-z0-9_-]+)/);
    const tokens = str.match(/[A-Za-z0-9_-]{40,}/g);
    const code = fromLink ? fromLink[1] : tokens ? tokens[tokens.length - 1] : str.trim();
    let res, got = [];
    try {
      St.update((u) => { res = St.addFriend(u, code); got = St.checkAchievements(u); });
    } catch (e) { toast('❌ ' + esc(e.message), 3500); return false; }
    toast(`${esc(res.snap.a)} <div><b>${esc(res.snap.n)}</b><div>${res.isNew ? 'agregado a tu ranking' : 'progreso actualizado'}</div></div>`);
    announceAchievements(got);
    return true;
  }

  function shareModal() {
    const u = St.user();
    const code = St.encodeSummary(u);
    const url = `${location.origin}${location.pathname}#/add/${code}`;
    const streak = St.currentStreak(u);
    const text = `${u.profile.avatar} ${u.name} está aprendiendo inglés con EnglishUp: nivel ${u.cefr || 'A0'} (estudiando ${u.level}), ${u.progress.xp} XP y racha de ${streak} 🔥. ¡Agrégame para comparar nuestro progreso!\n\n${url}`;
    modal(`
      <div class="center-text"><div class="big-emoji">📤</div><h3>Compartir mi progreso</h3>
      <p class="muted small">Envía este enlace a tus amigos. Al abrirlo (o pegarlo en <b>Ranking → Agregar amigo</b>) aparecerás en su ranking.</p></div>
      <textarea class="answer-input share-code" readonly rows="4">${esc(text)}</textarea>
      ${navigator.share ? '<button class="btn" id="native-share">📲 Compartir (WhatsApp, etc.)</button>' : ''}
      <button class="btn secondary" id="copy">📋 Copiar</button>
      <p class="small muted">🔒 Solo se comparte tu nombre, avatar, nivel y estadísticas. Nunca tu correo ni tu contraseña. Vuelve a compartir cuando avances para que vean tus datos actualizados.</p>
      <button class="btn ghost" data-close>Cerrar</button>`, (m) => {
      const ta = $('.share-code', m);
      const ns = $('#native-share', m);
      if (ns) ns.addEventListener('click', () => navigator.share({ title: 'EnglishUp', text }).catch(() => {}));
      $('#copy', m).addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(text); toast('✅ Copiado. Pégalo en WhatsApp o donde quieras.'); }
        catch (e) { ta.select(); document.execCommand('copy'); toast('✅ Copiado'); }
      });
    });
  }

  function addFriendModal() {
    modal(`
      <div class="center-text"><div class="big-emoji">🤝</div><h3>Agregar amigo</h3>
      <p class="muted small">Pide a tu amigo que toque <b>Compartir mi progreso</b> en su app y te envíe el mensaje. Pégalo aquí completo:</p></div>
      <textarea class="answer-input" id="code" rows="4" placeholder="Pega aquí el mensaje o el enlace de tu amigo..."></textarea>
      <button class="btn" id="add">Agregar</button>
      <button class="btn ghost" data-close>Cancelar</button>`, (m, close) => {
      $('#add', m).addEventListener('click', () => { if (addFriendCode($('#code', m).value)) { close(); render(); } });
    });
  }

  const RANK_SORTS = {
    week: { name: 'Semana', unit: 'XP', val: (x) => x.w },
    xp: { name: 'XP total', unit: 'XP', val: (x) => x.x },
    level: { name: 'Nivel', unit: '', val: (x) => St.levelIndex(x.l) * 1000 + (x.lp[St.levelIndex(x.l)] || 0) + (x.c === x.l ? 100 : 0), show: (x) => `${x.c}` },
    streak: { name: 'Racha', unit: '🔥', val: (x) => x.s }
  };
  let rankSort = 'week';

  routes.community = () => {
    const u = St.user();
    const list = St.community(u);
    const sorter = RANK_SORTS[rankSort];
    list.sort((a, b) => sorter.val(b) - sorter.val(a) || b.x - a.x);
    const medal = (i) => ['🥇', '🥈', '🥉'][i] || `<span class="rank-n">${i + 1}</span>`;
    const myPos = list.findIndex((x) => x.me);
    app.innerHTML = `
      ${topbar(u)}
      <main class="screen page">
        <h2>🏆 Ranking</h2>
        <div class="card hero-card rank-hero">
          <div class="row between"><div><div class="muted small">Tu posición (${sorter.name.toLowerCase()})</div><b class="xl">#${myPos + 1}</b> <span class="muted">de ${list.length}</span></div>
          <div class="big-emoji">${esc(u.profile.avatar)}</div></div>
          <div class="row gap"><button class="btn small" id="share">📤 Compartir mi progreso</button><button class="btn small secondary" id="addf">➕ Agregar amigo</button></div>
        </div>
        <div class="seg">${Object.entries(RANK_SORTS).map(([k, r]) => `<button data-sort="${k}" class="${k === rankSort ? 'on' : ''}">${r.name}</button>`).join('')}</div>
        <div class="rank-list">${list.map((x, i) => `
          <${x.me ? 'div' : `a href="#/compare/${encodeURIComponent(x.id)}"`} class="rank-row ${x.me ? 'me' : ''}">
            <div class="rank-pos">${medal(i)}</div>
            <div class="rank-av">${esc(x.a)}</div>
            <div class="grow"><b>${esc(x.n)}${x.me ? ' <span class="tag">Tú</span>' : ''}</b>
              <div class="small muted">${x.src === 'local' ? '📱 En este teléfono' : x.src === 'friend' ? `🤝 Amigo · actualizado ${ago(x.t)}` : `🔥 ${x.s} · ${x.ls} lecciones`}</div></div>
            <span class="level-badge sm" style="--c:${levelOf(x.l).color}">${x.c}</span>
            <div class="rank-val">${sorter.show ? '' : `${sorter.val(x)}<small>${sorter.unit}</small>`}</div>
            ${x.me ? '' : '<span class="muted">›</span>'}
          </${x.me ? 'div' : 'a'}>`).join('')}</div>
        ${list.length === 1 ? `<div class="card center-text"><div class="big-emoji">👥</div><p><b>¡Invita a tus amigos!</b></p><p class="muted small">Comparte tu progreso por WhatsApp. Cuando ellos te envíen el suyo, aparecerán aquí y podrán compararse. Los usuarios registrados en este mismo teléfono aparecen automáticamente.</p></div>` : ''}
        <p class="small muted center-text">Toca a una persona para comparar niveles y habilidades. Los datos de tus amigos son los de la última vez que compartieron su progreso.</p>
      </main>
      ${tabbar('community')}`;
    $('#share').addEventListener('click', shareModal);
    $('#addf').addEventListener('click', addFriendModal);
    $$('[data-sort]').forEach((b) => b.addEventListener('click', () => { rankSort = b.dataset.sort; render(); }));
  };

  routes.compare = (rawId) => {
    const u = St.user();
    const id = decodeURIComponent(rawId || '');
    const list = St.community(u);
    const me = list.find((x) => x.me), o = list.find((x) => x.id === id && !x.me);
    if (!o) return go('/community');
    const rows = [
      ['🎓', 'Nivel certificado', (x) => (x.c === 'A0' ? -1 : St.levelIndex(x.c)), (x) => x.c],
      ['📘', 'Nivel en estudio', (x) => St.levelIndex(x.l) * 1000 + (x.lp[St.levelIndex(x.l)] || 0), (x) => `${x.l} · ${x.lp[St.levelIndex(x.l)] || 0}%`],
      ['💎', 'XP total', (x) => x.x],
      ['📅', 'XP últimos 7 días', (x) => x.w],
      ['🔥', 'Racha actual', (x) => x.s],
      ['🏅', 'Mejor racha', (x) => x.b],
      ['✅', 'Lecciones', (x) => x.ls],
      ['📚', 'Palabras', (x) => x.wd],
      ['🏆', 'Logros', (x) => x.ac]
    ];
    let myWins = 0, hisWins = 0;
    const rowHtml = ([ic, label, val, show]) => {
      const a = val(me), b = val(o);
      if (a > b) myWins++; else if (b > a) hisWins++;
      const f = show || val;
      return `<div class="cmp-row"><div class="cmp-v ${a > b ? 'win' : ''}">${esc(f(me))}</div><div class="cmp-l">${ic}<small>${label}</small></div><div class="cmp-v ${b > a ? 'win' : ''}">${esc(f(o))}</div></div>`;
    };
    const skillRows = Object.entries(SKILLS).map(([k, sk]) => {
      const a = me.k[k] || 0, b = o.k[k] || 0;
      return `<div class="cmp-skill"><div class="half left"><b class="${a > b ? 'win-t' : ''}">${a}</b><div class="hbar me"><div style="width:${a}%"></div></div></div>
        <div class="cmp-l">${sk.icon}<small>${sk.name}</small></div>
        <div class="half"><div class="hbar"><div style="width:${b}%"></div></div><b class="${b > a ? 'win-t' : ''}">${b}</b></div></div>`;
    }).join('');
    const statsHtml = rows.map(rowHtml).join('');
    const verdict = myWins > hisWins ? `¡Vas ganando ${myWins} a ${hisWins}! 💪` : hisWins > myWins ? `${esc(o.n)} va ganando ${hisWins} a ${myWins}. ¡Tú puedes alcanzarle! 🚀` : `¡Empate ${myWins} a ${hisWins}! 🤝`;
    const gap = o.x - me.x;
    app.innerHTML = `
      <div class="screen page">
        <div class="page-head"><a href="#/community" class="back">←</a><h2>Comparar</h2></div>
        <div class="vs">
          <div class="vs-p"><div class="rank-av big">${esc(me.a)}</div><b>Tú</b><span class="level-badge" style="--c:${levelOf(me.l).color}">${me.c}</span></div>
          <div class="vs-x">VS</div>
          <div class="vs-p"><div class="rank-av big">${esc(o.a)}</div><b>${esc(o.n)}</b><span class="level-badge" style="--c:${levelOf(o.l).color}">${o.c}</span></div>
        </div>
        <div class="card center-text"><b>${verdict}</b>${gap > 0 ? `<div class="small muted">Te faltan ${gap} XP para alcanzar a ${esc(o.n)} (≈ ${Math.ceil(gap / 15)} lecciones).</div>` : ''}</div>
        <div class="card">${statsHtml}</div>
        <div class="card"><h4>Habilidades</h4>
          ${radarChart(me.k, o.k)}
          <div class="legend"><span class="dot me"></span> Tú <span class="dot other"></span> ${esc(o.n)}</div>
          ${skillRows}</div>
        <div class="card"><h4>Avance por nivel</h4>${LEVELS.map((L, i) => `
          <div class="cmp-skill"><div class="half left"><b>${me.lp[i]}%</b><div class="hbar me"><div style="width:${me.lp[i]}%"></div></div></div>
          <div class="cmp-l"><span class="level-badge sm" style="--c:${L.color}">${L.id}</span></div>
          <div class="half"><div class="hbar"><div style="width:${o.lp[i]}%"></div></div><b>${o.lp[i]}%</b></div></div>`).join('')}</div>
        <p class="small muted center-text">${o.src === 'friend' ? `Datos de ${esc(o.n)} actualizados ${ago(o.t)}.` : 'Usuario de este teléfono · datos en vivo.'}</p>
        ${o.src === 'friend' ? '<button class="btn ghost" id="rm">🗑️ Quitar de mi ranking</button>' : ''}
      </div>`;
    const rm = $('#rm');
    if (rm) rm.addEventListener('click', () => { if (confirm(`¿Quitar a ${o.n} de tu ranking?`)) { St.update((x) => St.removeFriend(x, o.id)); go('/community'); } });
  };

  /* ------------------ PERFIL Y AJUSTES ------------------ */
  routes.profile = () => {
    const u = St.user(), s = u.settings;
    const avatars = ['🦉', '🦊', '🐼', '🐯', '🐸', '🐧', '🦁', '🐨', '🐙', '🦄'];
    app.innerHTML = `
      ${topbar(u)}
      <main class="screen page">
        <div class="profile-head">
          <button class="avatar" id="av">${u.profile.avatar}</button>
          <div><h2>${esc(u.name)}</h2><div class="muted small">${esc(u.email)}</div><div class="muted small">Miembro desde ${new Date(u.createdAt).toLocaleDateString('es')}</div></div>
        </div>
        <div class="card">
          <h4>🎯 Mi plan</h4>
          <label>Objetivo<select id="goal">${GOALS.map((g) => `<option value="${g.id}" ${u.profile.goal === g.id ? 'selected' : ''}>${g.icon} ${g.name}</option>`).join('')}</select></label>
          <label>Meta diaria<select id="min">${[5, 10, 15, 20, 30].map((m) => `<option value="${m}" ${u.profile.minutes === m ? 'selected' : ''}>${m} minutos</option>`).join('')}</select></label>
          <div class="stack"><a class="btn small secondary" href="#/plan">🗺️ Ver mi plan</a><a class="btn small secondary" href="#/retest">🔁 Repetir prueba de nivel</a></div>
        </div>
        <div class="card">
          <h4>🔊 Audio y voz</h4>
          <label>Acento<select id="accent"><option value="en-US" ${s.accent === 'en-US' ? 'selected' : ''}>🇺🇸 Estadounidense</option><option value="en-GB" ${s.accent === 'en-GB' ? 'selected' : ''}>🇬🇧 Británico</option><option value="en-AU" ${s.accent === 'en-AU' ? 'selected' : ''}>🇦🇺 Australiano</option></select></label>
          <label>Velocidad de voz: <b id="rv">${s.rate}</b><input type="range" id="rate" min="0.6" max="1.3" step="0.05" value="${s.rate}"></label>
          <button class="btn small secondary" id="test-voice">🔊 Probar voz</button>
          <label class="toggle"><input type="checkbox" id="sound" ${s.sound !== false ? 'checked' : ''}> Efectos de sonido</label>
          <div class="small muted">Reconocimiento de voz: ${Sp.canListen() ? '✅ disponible' : '❌ no disponible en este navegador (usa Chrome o Safari)'}</div>
        </div>
        <div class="card">
          <h4>🎨 Apariencia</h4>
          <label class="toggle"><input type="checkbox" id="dark" ${s.dark ? 'checked' : ''}> Modo oscuro</label>
        </div>
        <div class="card">
          <h4>💾 Datos</h4>
          <div class="stack">
            <button class="btn small secondary" id="export">⬇️ Exportar copia de seguridad</button>
            <label class="btn small secondary">⬆️ Importar copia<input type="file" id="imp" accept="application/json" hidden></label>
            <button class="btn small secondary" id="logout">🚪 Cerrar sesión</button>
            <button class="btn small danger" id="delete">🗑️ Eliminar cuenta</button>
          </div>
        </div>
        <p class="small muted center-text">EnglishUp v1.0 · Funciona sin conexión</p>
      </main>
      ${tabbar('profile')}`;
    const set = (fn) => { St.update(fn); applySettings(St.user()); };
    $('#av').addEventListener('click', () => modal(`<h3>Elige tu avatar</h3><div class="avatars">${avatars.map((a) => `<button data-a="${a}">${a}</button>`).join('')}</div>`, (m, close) => {
      $$('[data-a]', m).forEach((b) => b.addEventListener('click', () => { set((x) => { x.profile.avatar = b.dataset.a; }); close(); render(); }));
    }));
    $('#goal').addEventListener('change', (e) => { set((x) => { x.profile.goal = e.target.value; }); toast('✅ Objetivo actualizado'); });
    $('#min').addEventListener('change', (e) => { set((x) => { x.profile.minutes = +e.target.value; }); toast('✅ Meta diaria actualizada'); });
    $('#accent').addEventListener('change', (e) => set((x) => { x.settings.accent = e.target.value; }));
    $('#rate').addEventListener('input', (e) => { $('#rv').textContent = e.target.value; set((x) => { x.settings.rate = +e.target.value; }); });
    $('#test-voice').addEventListener('click', () => Sp.speak('Hello! Welcome to English Up. Let\'s learn together.'));
    $('#sound').addEventListener('change', (e) => set((x) => { x.settings.sound = e.target.checked; }));
    $('#dark').addEventListener('change', (e) => set((x) => { x.settings.dark = e.target.checked; }));
    $('#export').addEventListener('click', () => {
      const blob = new Blob([St.exportData()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `englishup-${u.name}.json`; a.click();
    });
    $('#imp').addEventListener('change', (e) => importFile(e.target.files[0]));
    $('#logout').addEventListener('click', () => { St.logout(); go('/welcome'); });
    $('#delete').addEventListener('click', () => { if (confirm('¿Eliminar tu cuenta y todo tu progreso? Esta acción no se puede deshacer.')) { St.deleteAccount(); go('/welcome'); } });
  };

  routes.retest = () => {
    if (!confirm('¿Repetir la prueba de nivel? Tu nivel de estudio se actualizará según el resultado. Tu progreso en lecciones se conserva.')) return go('/profile');
    go('/placement');
  };

  /* ------------------ INICIO ------------------ */
  render();

  // PWA: registrar service worker y prompt de instalación
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    if (!localStorage.getItem('eu_install_dismissed')) {
      const b = document.createElement('div'); b.className = 'install-banner';
      b.innerHTML = `<span>📲 Instala EnglishUp en tu teléfono</span><button class="btn small" id="ins">Instalar</button><button class="icon-btn" id="insx">✕</button>`;
      document.body.appendChild(b);
      b.querySelector('#ins').addEventListener('click', async () => { b.remove(); deferredPrompt.prompt(); deferredPrompt = null; });
      b.querySelector('#insx').addEventListener('click', () => { b.remove(); localStorage.setItem('eu_install_dismissed', '1'); });
    }
  });
})();
