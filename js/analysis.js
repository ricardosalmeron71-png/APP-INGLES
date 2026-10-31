/* =========================================================
   ANÁLISIS: comparación de respuestas, escritura y pronunciación
   Funciona 100% en el dispositivo (sin servidor).
   ========================================================= */
window.Analysis = (function () {
  const CONTRACTIONS = {
    "i'm": 'i am', "you're": 'you are', "he's": 'he is', "she's": 'she is', "it's": 'it is',
    "we're": 'we are', "they're": 'they are', "i've": 'i have', "you've": 'you have', "we've": 'we have',
    "they've": 'they have', "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will',
    "we'll": 'we will', "they'll": 'they will', "it'll": 'it will', "i'd": 'i would', "you'd": 'you would',
    "he'd": 'he would', "she'd": 'she would', "we'd": 'we would', "they'd": 'they would',
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not', "aren't": 'are not',
    "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
    "won't": 'will not', "wouldn't": 'would not', "can't": 'cannot', "couldn't": 'could not',
    "shouldn't": 'should not', "mustn't": 'must not', "let's": 'let us', "that's": 'that is',
    "what's": 'what is', "where's": 'where is', "there's": 'there is', "who's": 'who is', "o'clock": 'oclock'
  };
  const NUMBERS = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', twenty: '20' };

  function normalize(s, opts = {}) {
    let t = (s || '').toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/[“”"]/g, '')
      .replace(/\bcan not\b/g, 'cannot');
    t = t.replace(/[a-z]+'[a-z]+/g, (w) => CONTRACTIONS[w] || w.replace(/'s$/, 's'));
    t = t.replace(/[^a-z0-9áéíóúñü\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (opts.numbers !== false) t = t.split(' ').map((w) => NUMBERS[w] || w).join(' ');
    return t;
  }
  const words = (s) => normalize(s).split(' ').filter(Boolean);

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /** Compara una respuesta escrita con las respuestas aceptadas.
   *  Devuelve { ok, typo, best } — typo=true si es correcta salvo pequeños errores de ortografía. */
  function checkAnswer(input, answers) {
    const ni = normalize(input);
    if (!ni) return { ok: false, typo: false, best: answers[0] };
    let bestDist = Infinity, best = answers[0];
    for (const a of answers) {
      const na = normalize(a);
      if (na === ni) return { ok: true, typo: false, best: a };
      const d = levenshtein(na, ni);
      if (d < bestDist) { bestDist = d; best = a; }
    }
    const nb = normalize(best);
    // tolerancia: 1 error por cada ~12 caracteres, máx 3, y mismo número de palabras
    const tol = Math.min(3, Math.max(1, Math.floor(nb.length / 12)));
    const sameWords = nb.split(' ').length === ni.split(' ').length;
    if (bestDist <= tol && sameWords) return { ok: true, typo: true, best };
    return { ok: false, typo: false, best };
  }

  /** Alineación palabra por palabra (LCS) entre objetivo y lo dicho / escrito. */
  function alignWords(target, said) {
    const T = target.split(/\s+/).filter(Boolean);
    const tn = T.map((w) => normalize(w));
    const S = words(said);
    const m = tn.length, n = S.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const match = (a, b) => a === b || (a.length > 3 && levenshtein(a, b) <= 1);
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = match(tn[i], S[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
    const result = T.map((w) => ({ word: w, ok: false }));
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (match(tn[i], S[j])) { result[i].ok = true; i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    const hits = result.filter((r) => r.ok).length;
    const extra = Math.max(0, n - hits);
    return { words: result, hits, total: m, extra };
  }

  /* -------------------- PRONUNCIACIÓN -------------------- */
  const PRON_TIPS = [
    { re: /th/, tip: 'Sonido "th": coloca la punta de la lengua entre los dientes (think, the, mother).' },
    { re: /^v|v/, tip: '"V" y "B" son distintos: para la "v" toca el labio inferior con los dientes superiores (very, have).' },
    { re: /^s[ptkcmnlw]/, tip: 'No digas "e" antes de "s": es "school", no "eschool"; "Spain", no "Espain".' },
    { re: /ed$/, tip: 'Terminación "-ed": suena /t/ (worked), /d/ (played) o /id/ solo tras t/d (wanted).' },
    { re: /(ee|ea|i)/, tip: 'Distingue la "i" corta (ship, live) de la "ii" larga (sheep, leave).' },
    { re: /^h/, tip: 'La "h" inglesa se aspira suavemente, como una "j" muy suave (hello, house).' },
    { re: /(sh|ch|j)/, tip: '"sh" es como pedir silencio (she); "ch" como en "chico" (cheese); "j" es más sonora (job).' },
    { re: /(t|d|k|p|s|z)$/, tip: 'Pronuncia las consonantes finales: en inglés cambian el significado (cat / cap / cab).' },
    { re: /w/, tip: 'La "w" suena como una "u" rápida: "water" = "uó-ter".' },
    { re: /^y/, tip: 'La "y" inicial suena como "i" (yes, you), no como "ll".' }
  ];

  function analyzeSpeech(target, alternatives, confidence) {
    let best = null;
    for (const alt of alternatives) {
      const a = alignWords(target, alt);
      const score = Math.round(100 * a.hits / Math.max(1, a.total) - Math.min(20, a.extra * 5));
      if (!best || score > best.score) best = { ...a, score: Math.max(0, score), heard: alt };
    }
    if (!best) best = { words: target.split(' ').map((w) => ({ word: w, ok: false })), score: 0, heard: '' };
    // la confianza del reconocedor ajusta ligeramente la nota
    if (typeof confidence === 'number' && confidence > 0 && best.score > 0) {
      best.score = Math.round(best.score * (0.85 + 0.15 * Math.min(1, confidence)));
    }
    const missed = best.words.filter((w) => !w.ok).map((w) => normalize(w.word)).filter(Boolean);
    const tips = [];
    for (const t of PRON_TIPS) {
      if (missed.some((w) => t.re.test(w)) && tips.length < 2) tips.push(t.tip);
    }
    let label, emoji;
    if (best.score >= 90) { label = '¡Pronunciación excelente!'; emoji = '🌟'; }
    else if (best.score >= 75) { label = '¡Muy bien!'; emoji = '👏'; }
    else if (best.score >= 55) { label = 'Bien, pero puedes mejorar'; emoji = '👍'; }
    else { label = 'Sigue practicando'; emoji = '💪'; }
    return { ...best, missed, tips, label, emoji };
  }

  /* -------------------- ESCRITURA -------------------- */
  // Errores frecuentes de hispanohablantes: [regex, mensaje, sugerencia]
  const RULES = [
    [/\bi\b/g, 'El pronombre "I" (yo) siempre va en mayúscula.', 'I', 'caps'],
    [/\bpeople is\b/gi, '"People" es plural: se dice "people are".', 'people are'],
    [/\b(i|you|we|they) has\b/gi, 'Con I / you / we / they se usa "have".', '$1 have'],
    [/\b(he|she|it) have\b/gi, 'Con he / she / it se usa "has".', '$1 has'],
    [/\b(he|she|it) (don't|do not)\b/gi, 'Con he / she / it el negativo es "doesn\'t".', "$1 doesn't"],
    [/(\w+\s+)?\b(he|she|it) (like|want|need|live|work|go|play|eat|love|think|know)\b/gi, 'En presente simple, he / she / it lleva -s (likes, wants, goes...).', null, 'agree'],
    [/\b(i|you|we|they) (is)\b/gi, 'Revisa el verbo "to be": I am / you are / we are / they are.', null],
    [/\bi (are|is)\b/gi, 'Con "I" se usa "am".', 'I am'],
    [/\b(i|you|he|she|we|they) (have|has) (\d+|[a-z]+-?[a-z]*) years( old)?\b/gi, 'La edad se dice con "to be": "I am 20 years old", no "I have".', null],
    [/\bmore (better|worse|bigger|smaller|cheaper|easier|faster|older|younger|taller)\b/gi, 'No combines "more" con un comparativo que ya termina en -er.', null],
    [/\bmore (good|bad)\b/gi, 'Comparativos irregulares: good → better, bad → worse.', null],
    [/\bdid (went|saw|bought|ate|took|had|made|came|gave|wrote|visited|played|worked|watched)\b/gi, 'Después de "did" va el verbo en forma base (did go, did see...).', null],
    [/\bdidn'?t (went|saw|bought|ate|took|had|made|came|gave|wrote|visited|played|worked|watched)\b/gi, 'Después de "didn\'t" va el verbo en forma base.', null],
    [/\bshould to\b/gi, 'Después de "should" no se usa "to".', 'should'],
    [/\bcan to\b/gi, 'Después de "can" no se usa "to".', 'can'],
    [/\bmust to\b/gi, 'Después de "must" no se usa "to".', 'must'],
    [/\ba ([aeiou]\w+)/gi, 'Antes de sonido vocal se usa "an" (an apple, an hour).', 'an $1', 'article'],
    [/\ban ([bcdfgjklmnpqrstvwxz]\w+)/gi, 'Antes de sonido consonante se usa "a" (a book, a university).', 'a $1', 'article'],
    [/\bis raining\b/g, 'Recuerda el sujeto: "It is raining".', 'it is raining', 'subject'],
    [/^(is|are|was) /i, 'En inglés la oración necesita sujeto: "It is...", "There are...".', null],
    [/\bthe (life|love|people|nature|money|music|time) is\b/gi, 'Para hablar en general no se usa "the": "Life is...", "Money is...".', null],
    [/\bexplain me\b/gi, 'Se dice "explain to me".', 'explain to me'],
    [/\bdepend of\b/gi, 'Se dice "depend on".', 'depend on'],
    [/\bmarried with\b/gi, 'Se dice "married to".', 'married to'],
    [/\bin the (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, 'Con días se usa "on": on Monday.', 'on $1'],
    [/\bin (\d{1,2}) o'?clock\b/gi, 'Con horas se usa "at": at 7 o\'clock.', null],
    [/\bon (january|february|march|april|may|june|july|august|september|october|november|december|\d{4})\b/gi, 'Con meses y años se usa "in": in July, in 2020.', null],
    [/\bif (i|you|he|she|it|we|they) will\b/gi, 'Después de "if" no se usa "will": "If it rains, ..."', null],
    [/\bsince (\d+) (years|months|days|weeks)\b/gi, 'Para duración se usa "for": for 3 years. "Since" es para el punto de inicio (since 2019).', 'for $1 $2'],
    [/\bi am agree\b/gi, 'Se dice "I agree" (sin "am").', 'I agree'],
    [/\bmake a (photo|party|question)\b/gi, 'Colocación: take a photo, have a party, ask a question.', null],
    [/\b(informations|advices|furnitures|homeworks|equipments|knowledges)\b/gi, 'Esta palabra es incontable en inglés y no lleva -s.', null],
    [/\bpeoples\b/gi, '"People" ya es plural.', 'people'],
    [/\bactually\b/gi, 'Ojo: "actually" significa "en realidad", no "actualmente" (currently).', null, 'info'],
    [/\bsensible\b/gi, 'Ojo: "sensible" significa "sensato". "Sensible" en español = "sensitive".', null, 'info'],
    [/\bembarrassed\b/gi, 'Ojo: "embarrassed" = avergonzado, no "embarazada" (pregnant).', null, 'info']
  ];

  const MISSPELLINGS = {
    becouse: 'because', beacause: 'because', becuase: 'because', beatiful: 'beautiful', beautifull: 'beautiful',
    wich: 'which', realy: 'really', tomorow: 'tomorrow', tommorow: 'tomorrow', untill: 'until', definately: 'definitely',
    recieve: 'receive', goverment: 'government', enviroment: 'environment', wensday: 'Wednesday', wendsday: 'Wednesday',
    adress: 'address', begining: 'beginning', beleive: 'believe', freind: 'friend', frend: 'friend', famili: 'family',
    whit: 'with', wiht: 'with', teh: 'the', thats: "that's", dont: "don't", doesnt: "doesn't", didnt: "didn't",
    cant: "can't", im: "I'm", ive: "I've", wont: "won't", isnt: "isn't", alot: 'a lot', allways: 'always',
    finaly: 'finally', diferent: 'different', diference: 'difference', interesant: 'interesting', importan: 'important',
    hapy: 'happy', happyness: 'happiness', comunity: 'community', comunication: 'communication', oportunity: 'opportunity',
    profesional: 'professional', necesary: 'necessary', neccessary: 'necessary', accomodation: 'accommodation',
    familly: 'family', excelent: 'excellent', exemple: 'example', studing: 'studying', writting: 'writing',
    stoped: 'stopped', planed: 'planned', travelling: 'traveling', moment: 'moment', problem: 'problem',
    probleme: 'problem', english: 'English', spanish: 'Spanish', mexico: 'Mexico', monday: 'Monday', tuesday: 'Tuesday',
    wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
    january: 'January', february: 'February', april: 'April', june: 'June', july: 'July', august: 'August',
    september: 'September', october: 'October', november: 'November', december: 'December'
  };
  const SPANISH_WORDS = new Set(['el', 'la', 'los', 'las', 'que', 'pero', 'porque', 'muy', 'también', 'tambien', 'yo', 'tengo', 'es', 'son', 'mi', 'mis', 'una', 'uno', 'con', 'para', 'por', 'como', 'cuando', 'donde', 'hola', 'gracias', 'casa', 'trabajo', 'amigo', 'familia', 'del', 'y', 'pues', 'entonces', 'nosotros', 'ellos', 'esta', 'este', 'estoy']);
  const LINKERS = ['and', 'but', 'because', 'so', 'then', 'also', 'however', 'although', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'whereas', 'while', 'first', 'finally', 'besides', 'consequently', 'instead', 'unless', 'despite', 'meanwhile'];

  function analyzeWriting(text, opts = {}) {
    const raw = (text || '').trim();
    const min = opts.min || 10;
    const keywords = opts.keywords || [];
    const issues = [];
    const positives = [];
    const wordList = raw.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w));
    const wc = wordList.length;
    const sentences = (raw.match(/[^.!?]+[.!?]*/g) || []).filter((s) => s.trim().length);

    if (!wc) return { score: 0, wordCount: 0, issues: [{ type: 'error', msg: 'Escribe algo para poder analizarlo.' }], positives: [], stats: {} };

    // 1. Español detectado
    const lw = wordList.map((w) => w.toLowerCase().replace(/[^a-záéíóúñ]/g, ''));
    const esCount = lw.filter((w) => SPANISH_WORDS.has(w) && !['a', 'no', 'me'].includes(w)).length;
    if (esCount >= 2 && esCount / wc > 0.15) issues.push({ type: 'error', msg: 'Parece que hay palabras en español. ¡Intenta escribir todo en inglés!' });

    // 2. Mayúsculas y puntuación
    const lowerStart = sentences.map((s) => s.trim()).filter((t) => /^[a-z]/.test(t));
    if (lowerStart.length) issues.push({ type: 'warn', msg: `Cada oración debe empezar con mayúscula (${lowerStart.length} sin mayúscula).`, excerpt: lowerStart[0].slice(0, 30) });
    if (!/[.!?]$/.test(raw)) issues.push({ type: 'warn', msg: 'Termina tu texto con un signo de puntuación (. ! ?).' });
    if (/¿|¡/.test(raw)) issues.push({ type: 'warn', msg: 'En inglés no se usan los signos de apertura ¿ ni ¡.' });
    if (/ {2,}/.test(raw)) issues.push({ type: 'info', msg: 'Hay espacios dobles entre palabras.' });
    if (/\s[,.!?]/.test(raw)) issues.push({ type: 'info', msg: 'No dejes espacio antes de la coma o el punto.' });

    // 3. Reglas gramaticales
    const seen = new Set();
    for (const [re, msg, sugg, kind] of RULES) {
      re.lastIndex = 0;
      let m;
      const matches = [];
      while ((m = re.exec(raw)) !== null) {
        if (kind === 'caps' && m[0] === 'I') continue;
        if (kind === 'agree' && m[1] && /^(does|did|doesn't|didn't|will|would|can|could|should|must|might|may|to|let|make|help|why|not)\s/i.test(m[1])) continue;
        if (kind === 'article') {
          const w = m[1].toLowerCase();
          // excepciones por sonido
          if (/^(uni|use|eu|one|once|u[st])/.test(w) && m[0].toLowerCase().startsWith('a ')) continue;
          if (/^(hour|honest|honou?r|heir)/.test(w) && m[0].toLowerCase().startsWith('an ')) continue;
        }
        matches.push(m[0]);
        if (!re.global) break;
      }
      if (matches.length && !seen.has(msg)) {
        seen.add(msg);
        const fix = sugg ? matches[0].replace(new RegExp(re.source, 'i'), sugg) : null;
        issues.push({ type: kind === 'info' ? 'info' : 'error', msg, excerpt: matches[0].trim(), fix: kind === 'agree' ? null : fix });
      }
    }

    // 4. Ortografía
    const spelled = new Set();
    wordList.forEach((w) => {
      const clean = w.replace(/[^a-zA-Z']/g, '');
      const lower = clean.toLowerCase();
      if (MISSPELLINGS[lower] && MISSPELLINGS[lower] !== clean && !spelled.has(lower)) {
        const correct = MISSPELLINGS[lower];
        if (correct.toLowerCase() === lower && correct[0] === correct[0].toUpperCase() && clean[0] === clean[0].toUpperCase()) return;
        spelled.add(lower);
        const capsOnly = correct.toLowerCase() === lower;
        issues.push({ type: capsOnly ? 'warn' : 'error', msg: capsOnly ? `"${correct}" se escribe con mayúscula.` : `Ortografía: "${clean}" → "${correct}".`, excerpt: clean, fix: correct });
      }
    });

    // 5. Repeticiones
    const freq = {};
    lw.forEach((w) => { if (w.length > 4) freq[w] = (freq[w] || 0) + 1; });
    const repeated = Object.entries(freq).filter(([, c]) => c >= 4).map(([w]) => w);
    if (repeated.length) issues.push({ type: 'info', msg: `Repites mucho: "${repeated.slice(0, 3).join('", "')}". Usa sinónimos o pronombres.` });

    // 6. Longitud y estructura
    const avgLen = wc / Math.max(1, sentences.length);
    if (wc < min) issues.push({ type: 'warn', msg: `Tu texto tiene ${wc} palabras. Intenta llegar al menos a ${min}.` });
    else positives.push(`Extensión adecuada (${wc} palabras).`);
    if (avgLen > 30) issues.push({ type: 'info', msg: 'Algunas oraciones son muy largas. Divide las ideas para mayor claridad.' });
    if (sentences.length >= 3 && avgLen >= 6 && avgLen <= 22) positives.push('Buena longitud de oraciones.');

    // 7. Riqueza léxica y conectores
    const unique = new Set(lw.filter(Boolean));
    const richness = unique.size / Math.max(1, wc);
    if (wc >= 15 && richness > 0.6) positives.push('Vocabulario variado.');
    const usedLinkers = LINKERS.filter((l) => new RegExp(`\\b${l}\\b`, 'i').test(raw));
    if (usedLinkers.length >= 3) positives.push(`Usas conectores: ${usedLinkers.slice(0, 4).join(', ')}.`);
    else if (wc >= 25) issues.push({ type: 'info', msg: 'Usa más conectores para unir ideas (because, however, also, then...).' });

    // 8. Palabras clave de la tarea
    const lowerRaw = raw.toLowerCase().replace(/[’]/g, "'");
    const kwFound = keywords.filter((k) => lowerRaw.includes(k.toLowerCase()));
    if (keywords.length) {
      if (kwFound.length === keywords.length) positives.push('Usaste las estructuras clave de la lección.');
      else issues.push({ type: 'info', msg: `Intenta usar: ${keywords.filter((k) => !kwFound.includes(k)).map((k) => `"${k}"`).join(', ')}.` });
    }

    // Puntuación
    let score = 100;
    issues.forEach((i) => { score -= i.type === 'error' ? 12 : i.type === 'warn' ? 6 : 2; });
    if (wc < min) score -= Math.round(30 * (1 - wc / min));
    score += Math.min(10, positives.length * 3);
    score = Math.max(0, Math.min(100, Math.round(score)));

    const errors = issues.filter((i) => i.type === 'error').length;
    return {
      score, wordCount: wc, issues, positives,
      stats: { sentences: sentences.length, avgLen: Math.round(avgLen * 10) / 10, richness: Math.round(richness * 100), linkers: usedLinkers.length, errors, keywords: `${kwFound.length}/${keywords.length}` }
    };
  }

  return { normalize, words, levenshtein, checkAnswer, alignWords, analyzeSpeech, analyzeWriting };
})();
