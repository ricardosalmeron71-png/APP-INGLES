/* =========================================================
   VOZ: síntesis (escuchar), reconocimiento (hablar) y grabación
   ========================================================= */
window.Speech = (function () {
  const synth = window.speechSynthesis;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voices = [];
  let settings = { accent: 'en-US', rate: 0.95 };

  function loadVoices() { if (synth) voices = synth.getVoices(); }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }

  function pickVoice(lang) {
    const list = voices.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(lang.toLowerCase()));
    const any = list.length ? list : voices.filter((v) => /^en/i.test(v.lang));
    const preferred = any.find((v) => /natural|neural|premium|enhanced|google|samantha|daniel|karen|serena/i.test(v.name));
    return preferred || any[0] || null;
  }

  function configure(s) { settings = { ...settings, ...s }; }

  function speak(text, opts = {}) {
    return new Promise((resolve) => {
      if (!synth) return resolve(false);
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = opts.lang || settings.accent;
        const v = pickVoice(u.lang);
        if (v) u.voice = v;
        u.rate = (opts.slow ? 0.6 : 1) * settings.rate;
        u.pitch = 1;
        u.onend = () => resolve(true);
        u.onerror = () => resolve(false);
        synth.speak(u);
        // Seguridad: algunos navegadores no disparan onend
        setTimeout(() => resolve(true), Math.max(2500, text.length * 120));
      } catch (e) { resolve(false); }
    });
  }

  const canSpeak = () => !!synth;
  const canListen = () => !!Recognition;

  /** Escucha al usuario. Devuelve { alternatives: [...], confidence } */
  function listen(opts = {}) {
    return new Promise((resolve, reject) => {
      if (!Recognition) return reject(new Error('unsupported'));
      const rec = new Recognition();
      rec.lang = opts.lang || settings.accent;
      rec.interimResults = !!opts.onInterim;
      rec.maxAlternatives = 5;
      rec.continuous = false;
      let finalResult = null;
      rec.onresult = (e) => {
        const res = e.results[e.results.length - 1];
        if (opts.onInterim) opts.onInterim(res[0].transcript);
        if (res.isFinal) {
          const alternatives = [];
          for (let i = 0; i < res.length; i++) alternatives.push(res[i].transcript);
          finalResult = { alternatives, confidence: res[0].confidence };
        }
      };
      rec.onerror = (e) => { if (!finalResult) reject(new Error(e.error || 'error')); };
      rec.onend = () => { finalResult ? resolve(finalResult) : reject(new Error('no-speech')); };
      try { rec.start(); } catch (e) { reject(e); }
      listen.current = rec;
      const t = opts.timeout || 9000;
      setTimeout(() => { try { rec.stop(); } catch (e) { /* noop */ } }, t);
      // Seguridad: si el navegador nunca dispara onend, no dejamos al usuario esperando
      setTimeout(() => { finalResult ? resolve(finalResult) : reject(new Error('no-speech')); try { rec.abort(); } catch (e) { /* noop */ } }, t + 2500);
    });
  }
  function stopListening() { try { listen.current && listen.current.stop(); } catch (e) { /* noop */ } }

  /* Grabadora (respaldo cuando no hay reconocimiento de voz): el usuario se escucha y se autoevalúa */
  let mediaRecorder = null, chunks = [];
  async function startRecording() {
    if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error('unsupported');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.start();
  }
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder) return resolve(null);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
        mediaRecorder.stream.getTracks().forEach((t) => t.stop());
        mediaRecorder = null;
        resolve(URL.createObjectURL(blob));
      };
      mediaRecorder.stop();
    });
  }
  const canRecord = () => !!(navigator.mediaDevices && window.MediaRecorder);

  /* Efectos de sonido con WebAudio (sin archivos) */
  let ctx = null;
  function beep(type) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [660, 880], bad: [300, 220], done: [523, 659, 784, 1047], click: [500] }[type] || [440];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type === 'bad' ? 'sawtooth' : 'sine';
        o.frequency.value = f;
        const t = ctx.currentTime + i * 0.11;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(type === 'bad' ? 0.06 : 0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g).connect(ctx.destination);
        o.start(t); o.stop(t + 0.2);
      });
    } catch (e) { /* noop */ }
  }

  return { speak, listen, stopListening, canSpeak, canListen, canRecord, startRecording, stopRecording, configure, beep };
})();
