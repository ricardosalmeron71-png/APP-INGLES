/* =========================================================
   ENTRENADOR DE PRONUNCIACIÓN
   - 14 sonidos difíciles para hispanohablantes (cómo hacerlos, palabras, pares mínimos,
     frases y trabalenguas)
   - Análisis que detecta QUÉ sonido fallaste (ej. dijiste "sink" en vez de "think")
   - Progreso por sonido y por palabra, y sesiones adaptadas a tus puntos débiles
   Funciona con el reconocimiento de voz del teléfono: gratis y sin servidor.
   ========================================================= */
window.Pron = (function () {
  const A = window.Analysis;
  const shuffle = (a) => window.Lessons.shuffle(a);

  // [en, es]
  const SOUNDS = [
    { id: 'th', icon: '👅', name: 'TH sorda', ipa: '/θ/', short: 'think, three',
      how: ['Saca un poquito la punta de la lengua y apóyala entre los dientes.', 'Sopla aire suave, SIN hacer vibrar la garganta.', 'Retira la lengua rápido hacia atrás.', 'Truco: no debe sonar como "s" ni como "t".'],
      error: 'En español no existe este sonido: casi todos dicen "s" (think → sink) o "t" (three → tree).',
      words: [['think', 'pensar'], ['three', 'tres'], ['thank', 'agradecer'], ['thing', 'cosa'], ['thick', 'grueso'], ['thumb', 'pulgar'], ['month', 'mes'], ['mouth', 'boca'], ['bath', 'baño'], ['both', 'ambos']],
      pairs: [['think', 'sink'], ['three', 'tree'], ['thank', 'tank'], ['thin', 'tin'], ['mouth', 'mouse'], ['bath', 'bass']],
      sentences: [['Thank you for the three gifts.', 'Gracias por los tres regalos.'], ['I thought about it all month.', 'Lo pensé todo el mes.']],
      twister: ['Thirty-three thirsty thieves thought thirty-three thoughts.', 'Treinta y tres ladrones sedientos pensaron treinta y tres ideas.'],
      conf: { think: ['sink', 'tink', 'fink', 'sing'], three: ['tree', 'free', 'sree'], thank: ['tank', 'sank', 'fank'], thing: ['sing', 'ting', 'fing'], thick: ['sick', 'tick', 'fick'] } },

    { id: 'dh', icon: '🗣️', name: 'TH sonora', ipa: '/ð/', short: 'this, mother',
      how: ['Misma posición que la TH sorda: lengua entre los dientes.', 'Ahora SÍ haz vibrar la garganta (como una "d" muy suave).', 'Pon la mano en el cuello: debes sentir la vibración.'],
      error: 'Suelen decir una "d" fuerte: this → dis, mother → modder, they → day.',
      words: [['this', 'esto'], ['that', 'eso'], ['these', 'estos'], ['they', 'ellos'], ['mother', 'madre'], ['brother', 'hermano'], ['father', 'padre'], ['weather', 'clima'], ['with', 'con'], ['breathe', 'respirar']],
      pairs: [['they', 'day'], ['then', 'den'], ['though', 'dough'], ['breathe', 'breed'], ['clothe', 'close']],
      sentences: [['This is my brother and that is my mother.', 'Este es mi hermano y esa es mi madre.'], ['I would rather stay with them than go there.', 'Prefiero quedarme con ellos que ir allí.']],
      twister: ['Those other brothers gather together with their mother.', 'Esos otros hermanos se reúnen con su madre.'],
      conf: { this: ['dis', 'des', 'diss'], that: ['dat', 'zat'], they: ['day', 'de'], then: ['den', 'zen'], mother: ['moder', 'modder'] } },

    { id: 'vb', icon: '🦷', name: 'V (no es B)', ipa: '/v/', short: 'very ≠ berry',
      how: ['Apoya los dientes de arriba sobre el labio de abajo.', 'Haz vibrar la garganta y deja salir el aire entre dientes y labio.', 'Los labios NO se juntan: si se juntan, suena "b".'],
      error: 'En español V y B suenan igual. En inglés son distintas: very ≠ berry, vote ≠ boat.',
      words: [['very', 'muy'], ['voice', 'voz'], ['visit', 'visitar'], ['every', 'cada'], ['move', 'mover'], ['have', 'tener'], ['love', 'amor'], ['live', 'vivir'], ['village', 'pueblo'], ['seven', 'siete']],
      pairs: [['very', 'berry'], ['vote', 'boat'], ['vest', 'best'], ['van', 'ban'], ['curve', 'curb']],
      sentences: [['I love to visit my very good friends.', 'Me encanta visitar a mis buenos amigos.'], ['Every Wednesday we have seven vegetables.', 'Cada miércoles tenemos siete verduras.']],
      twister: ['Vincent drove seven vans very carefully.', 'Vincent manejó siete camionetas con mucho cuidado.'],
      conf: { very: ['berry', 'bery'], vote: ['boat', 'bote'], visit: ['bisit'], voice: ['boys', 'boice'], have: ['hab', 'half'], live: ['leave', 'life'] } },

    { id: 'ee', icon: '🎵', name: 'I corta y larga', ipa: '/ɪ/ – /iː/', short: 'ship / sheep',
      how: ['La "i" corta (ship): relajada y breve, boca casi abierta.', 'La "ee" larga (sheep): estira los labios como sonriendo y dura más.', 'Alarga la larga y acorta la corta: ¡la duración cambia la palabra!'],
      error: 'En español solo hay una "i": live y leave, ship y sheep suenan casi igual.',
      words: [['ship', 'barco'], ['sheep', 'oveja'], ['sit', 'sentarse'], ['seat', 'asiento'], ['live', 'vivir'], ['leave', 'irse'], ['bit', 'poquito'], ['beat', 'golpear'], ['fill', 'llenar'], ['feel', 'sentir']],
      pairs: [['ship', 'sheep'], ['sit', 'seat'], ['live', 'leave'], ['bit', 'beat'], ['fill', 'feel'], ['hit', 'heat']],
      sentences: [['The sheep sat on the ship.', 'La oveja se sentó en el barco.'], ['Please leave the seat and fill the bin.', 'Por favor deja el asiento y llena el bote.']],
      twister: ['Did the ship leave while the sheep sat on the seat?', '¿Se fue el barco mientras la oveja estaba sentada en el asiento?'],
      conf: { ship: ['sheep', 'chip'], sheep: ['ship', 'sip'], sit: ['seat', 'set'], seat: ['sit', 'set'], live: ['leave', 'life'], leave: ['live', 'leaf'], bit: ['beat', 'bet'], beat: ['bit', 'bet'] } },

    { id: 'shch', icon: '🤫', name: 'SH y CH', ipa: '/ʃ/ – /tʃ/', short: 'ship / chip',
      how: ['SH: labios redondeados, aire continuo, como pidiendo silencio "shhh".', 'CH: empieza como una "t" y termina en "sh" (como "chico").', 'Prueba: shhh… ch-ch-ch…'],
      error: 'Se confunden: ship → chip, sheep → cheap, wash → watch.',
      words: [['she', 'ella'], ['shoe', 'zapato'], ['share', 'compartir'], ['wash', 'lavar'], ['fish', 'pescado'], ['chair', 'silla'], ['cheese', 'queso'], ['watch', 'mirar / reloj'], ['teach', 'enseñar'], ['child', 'niño']],
      pairs: [['ship', 'chip'], ['shoe', 'chew'], ['share', 'chair'], ['sheep', 'cheap'], ['wash', 'watch'], ['cash', 'catch']],
      sentences: [['She washes her shoes in the kitchen.', 'Ella lava sus zapatos en la cocina.'], ['Teach each child to share cheese.', 'Enseña a cada niño a compartir queso.']],
      twister: ['She sells seashells by the seashore.', 'Ella vende conchas marinas en la orilla del mar.'],
      conf: { ship: ['chip', 'sip'], shoe: ['chew', 'sue'], share: ['chair', 'care'], wash: ['watch', 'wasp'], cheese: ['sheas'], chair: ['share', 'care'], watch: ['wash'] } },

    { id: 'jy', icon: '🎯', name: 'J, Y y G suave', ipa: '/dʒ/ – /j/', short: 'job / yes',
      how: ['J (job): lengua pegada arriba y sonido fuerte, como "dch".', 'Y (yes): lengua suave arriba, como una "i" rápida.', 'Prueba: year / jeer, yellow / jello.'],
      error: 'Dicen "ch" o "sh" para la J (judge → chuch) y una "j" para la Y (yes → jes).',
      words: [['job', 'trabajo'], ['judge', 'juez'], ['jump', 'saltar'], ['orange', 'naranja'], ['yes', 'sí'], ['you', 'tú'], ['young', 'joven'], ['yellow', 'amarillo'], ['year', 'año'], ['yesterday', 'ayer']],
      pairs: [['year', 'jeer'], ['yet', 'jet'], ['yolk', 'joke'], ['yellow', 'jello'], ['yam', 'jam']],
      sentences: [['The young judge ate yellow jelly yesterday.', 'El joven juez comió gelatina amarilla ayer.'], ['You jumped over the orange jar.', 'Saltaste sobre el frasco naranja.']],
      twister: ['Jolly Jack juggles yellow jelly jars.', 'El alegre Jack hace malabares con frascos de gelatina amarilla.'],
      conf: { job: ['chop', 'shop', 'yob'], judge: ['chuch', 'huge'], yes: ['jess', 'guess'], year: ['jeer', 'ear'], yellow: ['jello', 'hello'], you: ['chew', 'jew'] } },

    { id: 'scl', icon: '🐍', name: 'S + consonante', ipa: '/sk-, sp-, st-/', short: 'school, Spain',
      how: ['Empieza con una "s" larga y SIN vocal antes: sss-chool.', 'No agregues una "e" delante (esc-, esp-, est-).', 'Prueba alargando la S: ssssspeak, ssssstudent.'],
      error: 'En español decimos "escuela, España, estudiante": en inglés NO hay "e" al inicio.',
      words: [['school', 'escuela'], ['Spain', 'España'], ['student', 'estudiante'], ['street', 'calle'], ['speak', 'hablar'], ['small', 'pequeño'], ['stop', 'parar'], ['star', 'estrella'], ['sleep', 'dormir'], ['story', 'historia']],
      pairs: [['spill', 'pill'], ['stop', 'top'], ['sport', 'port'], ['smile', 'mile'], ['sky', 'key']],
      sentences: [['The student speaks Spanish in Spain.', 'El estudiante habla español en España.'], ['Stop and smile at the small star.', 'Detente y sonríe a la pequeña estrella.']],
      twister: ['Six slippery snails slid slowly south.', 'Seis caracoles resbalosos se deslizaron lentamente al sur.'],
      conf: { school: ['escuela', 'ischool', 'cool'], spain: ['espain', 'pain'], student: ['estudent', 'tudent'], street: ['estreet', 'treat'], stop: ['top', 'estop'], speak: ['peak', 'espeak'] } },

    { id: 'ed', icon: '⏰', name: 'Terminación -ED', ipa: '/t/ /d/ /ɪd/', short: 'worked, played, wanted',
      how: ['Después de p, k, f, s, sh, ch: suena /t/ → worked, stopped, watched.', 'Después de t o d: se agrega una sílaba extra /ɪd/ → wanted, needed.', 'En los demás casos suena /d/ suave → played, lived, called.', 'NUNCA se dice "work-ed" con sílaba extra en worked o played.'],
      error: 'Pronuncian "ed" como una sílaba en todos los verbos (work-ed, play-ed).',
      words: [['worked', 'trabajó'], ['stopped', 'paró'], ['watched', 'miró'], ['asked', 'preguntó'], ['played', 'jugó'], ['lived', 'vivió'], ['called', 'llamó'], ['wanted', 'quiso'], ['needed', 'necesitó'], ['visited', 'visitó']],
      pairs: [['liked', 'like'], ['asked', 'ask'], ['worked', 'work'], ['played', 'play'], ['stopped', 'stop']],
      sentences: [['Yesterday I worked, watched TV and played football.', 'Ayer trabajé, vi televisión y jugué fútbol.'], ['She wanted and needed to visit us.', 'Ella quería y necesitaba visitarnos.']],
      twister: ['He wanted, needed and waited, but nobody helped.', 'Él quiso, necesitó y esperó, pero nadie ayudó.'],
      conf: { worked: ['work', 'workid'], played: ['play', 'playid'], stopped: ['stop', 'stoped'], watched: ['watch', 'watchid'], asked: ['ask', 'askid'], wanted: ['want', 'wonted'], needed: ['need', 'neded'] } },

    { id: 'fin', icon: '🔚', name: 'Consonantes finales', ipa: '/p t k b d g/', short: 'cap / cab, back / bag',
      how: ['Pronuncia siempre la última consonante: cap, cab, back, bag.', 'En inglés cambia el significado: cat ≠ cap, bet ≠ bed.', 'Si termina en b, d o g: haz vibrar la garganta. Si es p, t o k: sin vibración.'],
      error: 'Se "comen" o suavizan las consonantes finales (bed → be, bag → ba).',
      words: [['cat', 'gato'], ['cap', 'gorra'], ['cab', 'taxi'], ['back', 'espalda'], ['bag', 'bolsa'], ['bed', 'cama'], ['bet', 'apuesta'], ['rope', 'cuerda'], ['robe', 'bata'], ['seed', 'semilla']],
      pairs: [['cap', 'cab'], ['back', 'bag'], ['bet', 'bed'], ['rope', 'robe'], ['seat', 'seed'], ['hat', 'had']],
      sentences: [['Pick up the red bag and the black cap.', 'Recoge la bolsa roja y la gorra negra.'], ['I bet the cab is back.', 'Apuesto a que el taxi ya volvió.']],
      twister: ['Big black bugs bite back.', 'Los grandes bichos negros muerden de vuelta.'],
      conf: { cap: ['cab', 'ca'], cab: ['cap', 'ca'], back: ['bag', 'ba'], bag: ['back', 'ba'], bed: ['bet', 'be'], bet: ['bed', 'be'] } },

    { id: 'h', icon: '💨', name: 'H aspirada', ipa: '/h/', short: 'hello, house',
      how: ['Exhala aire suave desde la garganta, como empañando un vidrio.', 'Es mucho más suave que la "j" española.', 'Prueba: ha-ha-ha… hello, house, happy.'],
      error: 'Dicen una "j" fuerte (house → jaus) o la omiten (hat → at).',
      words: [['hello', 'hola'], ['house', 'casa'], ['happy', 'feliz'], ['hot', 'caliente'], ['who', 'quién'], ['whole', 'entero'], ['hand', 'mano'], ['head', 'cabeza'], ['heart', 'corazón'], ['hair', 'cabello']],
      pairs: [['hat', 'at'], ['hair', 'air'], ['heart', 'art'], ['his', 'is'], ['hear', 'ear'], ['high', 'eye']],
      sentences: [['Hello, how is your happy husband?', 'Hola, ¿cómo está tu feliz esposo?'], ['He hurt his hand in the hot house.', 'Se lastimó la mano en la casa caliente.']],
      twister: ['Harry Hunt hopes his hat hangs high.', 'Harry Hunt espera que su sombrero cuelgue alto.'],
      conf: { hat: ['at', 'jat'], hair: ['air', 'jair'], heart: ['art', 'jart'], hello: ['ello', 'jello'], house: ['ouse', 'jouse'], his: ['is', 'jis'] } },

    { id: 'r', icon: '🌀', name: 'R inglesa', ipa: '/ɹ/', short: 'red, right',
      how: ['Curva la lengua hacia atrás SIN tocar el paladar.', 'Redondea un poco los labios.', 'No hagas vibrar la lengua como en "perro".'],
      error: 'Usan la R española vibrante (red → rred) o la confunden con L (right ↔ light).',
      words: [['red', 'rojo'], ['right', 'derecha'], ['run', 'correr'], ['road', 'camino'], ['rock', 'roca'], ['rain', 'lluvia'], ['around', 'alrededor'], ['brown', 'café (color)'], ['girl', 'niña'], ['world', 'mundo']],
      pairs: [['right', 'light'], ['red', 'led'], ['rock', 'lock'], ['road', 'load'], ['grass', 'glass'], ['correct', 'collect']],
      sentences: [['The red car runs around the road.', 'El carro rojo corre por el camino.'], ['Right now the rain is really strong.', 'Ahora mismo la lluvia es muy fuerte.']],
      twister: ['Rory the rare red rabbit ran around the rock.', 'Rory, el raro conejo rojo, corrió alrededor de la roca.'],
      conf: { right: ['light', 'write', 'rrigh'], red: ['led', 'rred'], rock: ['lock', 'rrock'], road: ['load', 'rrode'], run: ['one', 'rrun'] } },

    { id: 'ae', icon: '🎭', name: 'A, U y O cortas', ipa: '/æ/ /ʌ/ /ɒ/', short: 'cat / cut / cot',
      how: ['/æ/ (cat): boca bien abierta, como una "e" y una "a" a la vez.', '/ʌ/ (cut): sonido corto y relajado, boca poco abierta.', '/ɒ/ (hot): boca redonda, "o" corta.'],
      error: 'Dicen siempre una "a" española: cat, cut y cot suenan casi igual.',
      words: [['cat', 'gato'], ['cut', 'cortar'], ['hat', 'sombrero'], ['hot', 'caliente'], ['bag', 'bolsa'], ['bug', 'insecto'], ['cap', 'gorra'], ['cup', 'taza'], ['bus', 'autobús'], ['back', 'atrás']],
      pairs: [['cat', 'cut'], ['hat', 'hut'], ['bag', 'bug'], ['cap', 'cup'], ['ran', 'run'], ['match', 'much']],
      sentences: [['The fat cat ran under the bus.', 'El gato gordo corrió debajo del autobús.'], ['A cup of hot chocolate is much better.', 'Una taza de chocolate caliente es mucho mejor.']],
      twister: ['A black bug bit a big black bear.', 'Un bicho negro mordió a un gran oso negro.'],
      conf: { cat: ['cut', 'cot', 'kat'], cut: ['cat', 'cot'], hat: ['hut', 'hot'], bag: ['bug'], cap: ['cup', 'cop'], bus: ['bass'] } },

    { id: 'ng', icon: '🔔', name: 'Terminación -NG', ipa: '/ŋ/', short: 'sing, long',
      how: ['La lengua se queda atrás y el sonido sale por la nariz.', 'NO pronuncies una "g" al final: sing, no "sin-g".', 'Prueba: sing… sing-ing… song.'],
      error: 'Dicen "sin" (sin g) o "sing-g" con una g fuerte.',
      words: [['sing', 'cantar'], ['long', 'largo'], ['thing', 'cosa'], ['morning', 'mañana'], ['bring', 'traer'], ['young', 'joven'], ['wrong', 'equivocado'], ['song', 'canción'], ['king', 'rey'], ['ring', 'anillo']],
      pairs: [['sing', 'sin'], ['thing', 'thin'], ['win', 'wing'], ['ban', 'bang'], ['sun', 'sung'], ['ran', 'rang']],
      sentences: [['Singing songs in the morning is a good thing.', 'Cantar canciones por la mañana es algo bueno.'], ['The king is wrong about the long ring.', 'El rey se equivoca sobre el largo anillo.']],
      twister: ['Ding dong, sing a long song.', 'Ding dong, canta una larga canción.'],
      conf: { sing: ['sin', 'sink'], long: ['lon', 'lawn'], thing: ['thin', 'think'], king: ['kin', 'kink'], ring: ['rin', 'rink'] } },

    { id: 'mute', icon: '🤐', name: 'Letras mudas', ipa: '—', short: 'write, know, listen',
      how: ['Algunas letras se escriben pero NO se pronuncian: k en know, w en write, t en listen, b en comb.', 'Aprende estas palabras como bloques: no las leas letra por letra.', 'Pista: knife = "naif", island = "ailand".'],
      error: 'Pronuncian todas las letras (kay-now, lis-ten, ko-mb).',
      words: [['write', 'escribir'], ['know', 'saber'], ['knife', 'cuchillo'], ['island', 'isla'], ['listen', 'escuchar'], ['answer', 'responder'], ['talk', 'hablar'], ['walk', 'caminar'], ['honest', 'honesto'], ['hour', 'hora']],
      pairs: [],
      sentences: [['I know the answer, so listen and write it.', 'Sé la respuesta, así que escucha y escríbela.'], ['An honest man talks for an hour on the island.', 'Un hombre honesto habla una hora en la isla.']],
      twister: ['Know no knots, kneel and write.', 'No sepas de nudos, arrodíllate y escribe.'],
      conf: { write: ['rite', 'wrote'], know: ['kno', 'now'], knife: ['knif', 'life'], island: ['izland', 'iceland'], listen: ['liston', 'lissen'], answer: ['anser', 'answer'] } }
  ];

  const byId = new Map(SOUNDS.map((s) => [s.id, s]));
  const NUMW0 = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const nwEarly = (str) => String(str || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/\b(\d+)\b/g, (m) => NUMW0[Number(m)] || m).replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
  const WORD_SOUND = new Map();
  SOUNDS.forEach((s) => {
    [...s.words.map((w) => w[0]), ...s.pairs.map((p) => p[0])].forEach((w) => { if (!WORD_SOUND.has(w.toLowerCase())) WORD_SOUND.set(w.toLowerCase(), s.id); });
  });
  // palabras que cuentan para dos sonidos: la primera lista manda
  const CONF = {};
  SOUNDS.forEach((s) => {
    Object.entries(s.conf || {}).forEach(([w, list]) => { CONF[`${s.id}:${w.toLowerCase()}`] = list; });
    s.pairs.forEach(([a, b]) => {
      [[a, b], [b, a]].forEach(([x, y]) => {
        const k = `${s.id}:${x.toLowerCase()}`;
        CONF[k] = [...new Set([...(CONF[k] || []), y.toLowerCase()])];
      });
    });
  });

  /** ¿A qué sonido pertenece una palabra cualquiera? (para dar pistas en frases) */
  function soundOf(word) {
    const w = nwEarly(word).replace(/\s/g, '');
    if (WORD_SOUND.has(w)) return WORD_SOUND.get(w);
    if (/^(the|this|that|these|those|they|them|then|than|there|their|with|other|another|brother|mother|father|rather|together)$/.test(w)) return 'dh';
    if (/th/.test(w)) return 'th';
    if (/v/.test(w)) return 'vb';
    if (/ed$/.test(w) && w.length > 3) return 'ed';
    if (/^s[ptkcmnlw]/.test(w)) return 'scl';
    if (/ng$/.test(w)) return 'ng';
    if (/^h/.test(w)) return 'h';
    if (/sh|ch|tion$/.test(w)) return 'shch';
    if (/^(j|y)/.test(w)) return 'jy';
    if (/^(wr|kn)|(mb|lk)$/.test(w)) return 'mute';
    if (/r/.test(w)) return 'r';
    if (/[bdgpkt]$/.test(w)) return 'fin';
    return null;
  }

  /* ------------------ ANÁLISIS ------------------ */
  const lev = A.levenshtein;
  // Normalización propia para palabras sueltas (no convierte "three" en "3")
  const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const nw = (str) => String(str || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/\b(\d+)\b/g, (m) => NUMW[Number(m)] || m).replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim();
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function verdict(score) {
    if (score >= 90) return { label: '¡Excelente! Un nativo te entendería sin problema', emoji: '🌟', cls: 'good' };
    if (score >= 75) return { label: '¡Muy bien! Se entiende claramente', emoji: '👏', cls: 'good' };
    if (score >= 55) return { label: 'Casi lo logras', emoji: '👍', cls: 'mid' };
    return { label: 'Vamos a mejorarlo', emoji: '💪', cls: 'low' };
  }

  /** Una sola palabra: ¿la entendió el reconocedor? ¿qué dijo en su lugar? */
  function analyzeWord(target, alternatives, confidence, soundId) {
    const t = nw(target).replace(/\s/g, '');
    const snd = byId.get(soundId) || byId.get(soundOf(target)) || null;
    const alts = (alternatives || []).map((a) => nw(a)).filter(Boolean);
    const firstTok = (a) => a.split(' ')[0];
    const idx = alts.findIndex((a) => a.replace(/\s/g, '') === t || firstTok(a) === t);
    const conf = confidence > 0 ? confidence : 0.85;
    let score, kind, heard = alts[0] || '', tip = '', steps = [];

    if (!alts.length) { return { score: 0, ok: false, kind: 'none', heard: '', tip: 'No te escuché. Acércate al micrófono, habla un poco más fuerte e inténtalo otra vez.', steps: [], ...verdict(0), sound: snd && snd.id }; }

    if (idx === 0) {
      score = Math.round(70 + 30 * clamp((conf - 0.5) / 0.5, 0, 1));
      kind = score >= 90 ? 'perfect' : 'good';
      if (kind === 'good' && snd) { steps = [snd.how[snd.how.length - 1]]; tip = 'Se entiende bien. Para pulirlo:'; }
    } else if (idx > 0) {
      score = Math.max(45, 60 - 3 * (idx - 1));
      kind = 'almost';
      heard = alts[0];
      tip = `El reconocedor dudó (primero entendió "${heard}"). Pronúncialo más claro y despacio.`;
      if (snd) steps = [snd.how[0]];
    } else {
      const h = firstTok(heard);
      const confs = snd ? (CONF[`${snd.id}:${t}`] || []) : [];
      const sim = lev(h, t);
      score = Math.max(5, 45 - 12 * sim);
      if (snd && snd.id === 'ed' && t.startsWith(h) && h.length >= 2) {
        kind = 'confusion';
        tip = `Escuché "${h}": te faltó la terminación -ed de "${t}". Recuerda: suena /t/, /d/ o /ɪd/, según la letra anterior.`;
      } else if (confs.includes(h) || confs.some((c) => lev(h, c) <= 1 && h.length > 2)) {
        kind = 'confusion';
        tip = `Dijiste "${h}" en lugar de "${t}". ${snd ? snd.error : ''}`;
      } else {
        kind = 'other';
        tip = `Escuché "${heard}" en lugar de "${t}".`;
      }
      if (snd) steps = snd.how.slice(0, 2);
    }
    return { score, ok: score >= 75, kind, heard, tip, steps, ...verdict(score), sound: snd && snd.id };
  }

  /** Frase o trabalenguas: alinea palabra por palabra y da pistas de los sonidos que fallaste */
  function analyzeSentence(target, alternatives, confidence) {
    const base = A.analyzeSpeech(String(target).replace(/-/g, ' '), alternatives, confidence);
    const missed = base.words.filter((w) => !w.ok).map((w) => ({ word: w.word.replace(/[^\p{L}'-]/gu, ''), sound: soundOf(w.word) })).filter((m) => m.word);
    const tagged = base.words.map((w) => ({ word: w.word.replace(/[^\p{L}'-]/gu, ''), ok: w.ok, sound: soundOf(w.word) })).filter((x) => x.word && x.sound);
    const bySound = {};
    missed.forEach((m) => { if (m.sound) (bySound[m.sound] = bySound[m.sound] || []).push(m.word); });
    const tips = Object.entries(bySound).sort((a, b) => b[1].length - a[1].length).slice(0, 2).map(([id, words]) => {
      const s = byId.get(id);
      return { sound: id, icon: s.icon, name: s.name, words: [...new Set(words)], text: s.how[0] };
    });
    const score = base.score;
    return { score, ok: score >= 70, heard: base.heard, words: base.words, missed, tagged, tips, kind: 'sentence', ...verdict(score) };
  }

  /* ------------------ PROGRESO ------------------ */
  const store = (u) => (u.progress.pron = u.progress.pron || { sounds: {}, words: {}, attempts: 0, twisters: {}, mastered: 0 });
  function record(u, soundId, word, ok) {
    const p = store(u);
    p.attempts++;
    if (soundId) {
      const s = (p.sounds[soundId] = p.sounds[soundId] || { hist: [] });
      s.hist.push(ok ? 1 : 0); if (s.hist.length > 24) s.hist.shift();
    }
    if (word) {
      const w = nw(word).replace(/\s/g, '') || String(word).toLowerCase();
      const r = (p.words[w] = p.words[w] || { ok: 0, bad: 0, weak: false });
      if (ok) { r.ok++; r.weak = false; p.mastered = Object.values(p.words).filter((x) => x.ok >= 2 && !x.weak).length; }
      else { r.bad++; r.weak = true; }
      r.last = Date.now();
    }
  }
  /** Dominio 0-100 de un sonido (null si aún no se ha practicado) */
  function mastery(u, id) {
    const s = store(u).sounds[id];
    if (!s || !s.hist.length) return null;
    const h = s.hist.slice(-16);
    return Math.round(100 * (h.reduce((a, b) => a + b, 0) + 1) / (h.length + 2));
  }
  function overall(u) {
    const vals = SOUNDS.map((s) => mastery(u, s.id)).filter((v) => v != null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }
  function weakestSounds(u, n = 2) {
    return SOUNDS.map((s) => ({ s, m: mastery(u, s.id) })).sort((a, b) => (a.m == null ? 50 : a.m) - (b.m == null ? 50 : b.m) || Math.random() - 0.5).slice(0, n).map((x) => x.s);
  }
  const weakWords = (u) => Object.entries(store(u).words).filter(([, r]) => r.weak).sort((a, b) => b[1].last - a[1].last).map(([w]) => w);
  const practicedWords = (u) => Object.keys(store(u).words).length;

  /* ------------------ SESIONES ------------------ */
  const wordEx = (s, [w, es]) => ({ type: 'coach', skill: 'speaking', kind: 'word', sound: s.id, text: w, translation: es, maxTries: 3, question: 'Escucha y repite la palabra' });
  const sentEx = (s, [t, es], kind = 'sentence') => ({ type: 'coach', skill: 'speaking', kind, sound: s.id, text: t, translation: es, maxTries: 3, question: kind === 'twister' ? 'Trabalenguas: despacio y claro' : 'Escucha y repite la frase' });
  function pairEx(s, [a, b]) {
    const word = Math.random() < 0.5 ? a : b;
    const opts = shuffle([a, b]);
    return { type: 'choice', skill: 'listening', question: `¿Qué palabra escuchas? (${s.name})`, audio: word, options: opts, answer: opts.indexOf(word), explain: `${a} ≠ ${b}`, speakOptions: true, sayAfter: `${a}. ${b}.`, sound: s.id, pron: true };
  }
  function pairs(s, n = 6) { return shuffle(s.pairs).slice(0, n).map((p) => pairEx(s, p)); }
  function words(s, n = 6) { return shuffle(s.words).slice(0, n).map((w) => wordEx(s, w)); }
  function sentences(s, n = 2) { return shuffle(s.sentences).slice(0, n).map((x) => sentEx(s, x)); }
  const twister = (s) => sentEx(s, s.twister, 'twister');

  /** mode: mix | listen | words | sentences | twister */
  function buildSession(soundId, mode = 'mix') {
    const s = byId.get(soundId);
    if (!s) return [];
    if (mode === 'listen') return pairs(s, 8);
    if (mode === 'words') return words(s, 8);
    if (mode === 'sentences') return [...sentences(s, 2), twister(s)];
    if (mode === 'twister') return [twister(s)];
    return [...pairs(s, 2), ...words(s, 5), ...sentences(s, 1)];
  }
  /** Práctica diaria de ~3 minutos: tus 2 sonidos más débiles + palabras difíciles */
  function dailySession(u) {
    const [a, b] = weakestSounds(u, 2);
    const out = [...pairs(a, 1), ...words(a, 3), ...pairs(b, 1), ...words(b, 3), ...sentences(a, 1)];
    const hard = weakWords(u).slice(0, 2).map((w) => { const sid = soundOf(w); const s = byId.get(sid) || a; const found = s.words.find((x) => x[0].toLowerCase() === w); return found ? wordEx(s, found) : null; }).filter(Boolean);
    return [...hard, ...out].filter((e, i, arr) => arr.findIndex((x) => x.text === e.text && x.type === e.type && x.audio === e.audio) === i);
  }
  /** Diagnóstico: 1 palabra de cada sonido (un solo intento) */
  function diagnosticSession() {
    return SOUNDS.filter((s) => s.id !== 'mute').map((s) => ({ ...wordEx(s, shuffle(s.words)[0]), maxTries: 1, question: 'Diagnóstico: repite la palabra' }));
  }
  function hardWordsSession(u) {
    return weakWords(u).slice(0, 8).map((w) => { const s = byId.get(soundOf(w)) || SOUNDS[0]; const f = s.words.find((x) => x[0].toLowerCase() === w) || [w, '']; return wordEx(s, f); });
  }

  return { SOUNDS, byId, soundOf, analyzeWord, analyzeSentence, verdict, record, mastery, overall, weakestSounds, weakWords, practicedWords, store, buildSession, dailySession, diagnosticSession, hardWordsSession, twister };
})();
