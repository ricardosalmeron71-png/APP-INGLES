/* =========================================================
   VERBOS: datos, conjugación, juegos y repaso espaciado
   - Irregulares: base|pasado|participio|español  (alternativas con "/")
   - Regulares: base:español (las formas se calculan con las reglas)
   ========================================================= */
window.Verbs = (function () {
  const IRREGULAR_RAW = `arise|arose|arisen|surgir;awake|awoke|awoken|despertar(se);be|was/were|been|ser / estar;bear|bore|borne/born|soportar / dar a luz;beat|beat|beaten|vencer / golpear;become|became|become|llegar a ser / volverse;begin|began|begun|empezar;bend|bent|bent|doblar;bet|bet|bet|apostar;bid|bid|bid|pujar / ofrecer;bind|bound|bound|atar;bite|bit|bitten|morder;bleed|bled|bled|sangrar;blow|blew|blown|soplar;break|broke|broken|romper;breed|bred|bred|criar;bring|brought|brought|traer;broadcast|broadcast|broadcast|transmitir;build|built|built|construir;burn|burned/burnt|burned/burnt|quemar;burst|burst|burst|reventar;buy|bought|bought|comprar;cast|cast|cast|lanzar / dar un papel;catch|caught|caught|atrapar;choose|chose|chosen|elegir;cling|clung|clung|aferrarse;come|came|come|venir;cost|cost|cost|costar;creep|crept|crept|arrastrarse;cut|cut|cut|cortar;deal|dealt|dealt|tratar / repartir;dig|dug|dug|cavar;dive|dove/dived|dived|bucear / zambullirse;do|did|done|hacer;draw|drew|drawn|dibujar;dream|dreamed/dreamt|dreamed/dreamt|soñar;drink|drank|drunk|beber;drive|drove|driven|conducir / manejar;dwell|dwelt/dwelled|dwelt/dwelled|habitar;eat|ate|eaten|comer;fall|fell|fallen|caer;feed|fed|fed|alimentar;feel|felt|felt|sentir;fight|fought|fought|pelear;find|found|found|encontrar;fit|fit/fitted|fit/fitted|quedar bien / encajar;flee|fled|fled|huir;fling|flung|flung|arrojar;fly|flew|flown|volar;forbid|forbade|forbidden|prohibir;forecast|forecast|forecast|pronosticar;foresee|foresaw|foreseen|prever;forget|forgot|forgotten/forgot|olvidar;forgive|forgave|forgiven|perdonar;freeze|froze|frozen|congelar;get|got|gotten/got|obtener / conseguir;give|gave|given|dar;go|went|gone|ir;grind|ground|ground|moler;grow|grew|grown|crecer / cultivar;hang|hung|hung|colgar;have|had|had|tener / haber;hear|heard|heard|oír;hide|hid|hidden|esconder;hit|hit|hit|golpear;hold|held|held|sostener;hurt|hurt|hurt|herir / doler;keep|kept|kept|guardar / mantener;kneel|knelt/kneeled|knelt/kneeled|arrodillarse;knit|knit/knitted|knit/knitted|tejer;know|knew|known|saber / conocer;lay|laid|laid|poner / colocar;lead|led|led|guiar / dirigir;lean|leaned/leant|leaned/leant|apoyarse / inclinarse;leap|leaped/leapt|leaped/leapt|saltar;learn|learned/learnt|learned/learnt|aprender;leave|left|left|dejar / irse;lend|lent|lent|prestar;let|let|let|dejar / permitir;lie|lay|lain|yacer / estar acostado (mentir = lie, lied, lied);light|lit/lighted|lit/lighted|encender;lose|lost|lost|perder;make|made|made|hacer / fabricar;mean|meant|meant|significar;meet|met|met|conocer / reunirse;mislead|misled|misled|engañar;mistake|mistook|mistaken|confundir;misunderstand|misunderstood|misunderstood|malinterpretar;outdo|outdid|outdone|superar;overcome|overcame|overcome|superar / vencer;overdo|overdid|overdone|exagerar;overhear|overheard|overheard|oír por casualidad;override|overrode|overridden|anular;oversee|oversaw|overseen|supervisar;oversleep|overslept|overslept|quedarse dormido;overtake|overtook|overtaken|adelantar / rebasar;overthrow|overthrew|overthrown|derrocar;pay|paid|paid|pagar;plead|pleaded/pled|pleaded/pled|suplicar / declararse;prove|proved|proven/proved|demostrar;put|put|put|poner;quit|quit|quit|renunciar / dejar;read|read|read|leer;rebuild|rebuilt|rebuilt|reconstruir;redo|redid|redone|rehacer;repay|repaid|repaid|devolver (dinero);rewrite|rewrote|rewritten|reescribir;rid|rid|rid|librar / deshacerse;ride|rode|ridden|montar / andar en;ring|rang|rung|sonar / llamar;rise|rose|risen|subir / levantarse;run|ran|run|correr;saw|sawed|sawn/sawed|serrar;say|said|said|decir;see|saw|seen|ver;seek|sought|sought|buscar;sell|sold|sold|vender;send|sent|sent|enviar;set|set|set|establecer / poner;sew|sewed|sewn/sewed|coser;shake|shook|shaken|sacudir;shed|shed|shed|derramar / mudar;shine|shone/shined|shone/shined|brillar;shoot|shot|shot|disparar;show|showed|shown/showed|mostrar;shrink|shrank|shrunk|encoger;shut|shut|shut|cerrar;sing|sang|sung|cantar;sink|sank|sunk|hundir(se);sit|sat|sat|sentarse;sleep|slept|slept|dormir;slide|slid|slid|deslizar;sling|slung|slung|lanzar / colgar;slit|slit|slit|rajar;smell|smelled/smelt|smelled/smelt|oler;sow|sowed|sown/sowed|sembrar;speak|spoke|spoken|hablar;speed|sped/speeded|sped/speeded|acelerar;spell|spelled/spelt|spelled/spelt|deletrear;spend|spent|spent|gastar / pasar (tiempo);spill|spilled/spilt|spilled/spilt|derramar;spin|spun|spun|girar;spit|spit/spat|spit/spat|escupir;split|split|split|dividir;spoil|spoiled/spoilt|spoiled/spoilt|estropear / mimar;spread|spread|spread|extender / untar;spring|sprang|sprung|saltar / brotar;stand|stood|stood|estar de pie / soportar;steal|stole|stolen|robar;stick|stuck|stuck|pegar;sting|stung|stung|picar;stink|stank|stunk|apestar;stride|strode|stridden|dar zancadas;strike|struck|struck|golpear / hacer huelga;strive|strove|striven|esforzarse;swear|swore|sworn|jurar;sweat|sweat/sweated|sweat/sweated|sudar;sweep|swept|swept|barrer;swell|swelled|swollen/swelled|hincharse;swim|swam|swum|nadar;swing|swung|swung|columpiar(se);take|took|taken|tomar / llevar;teach|taught|taught|enseñar;tear|tore|torn|rasgar / romper;tell|told|told|decir / contar;think|thought|thought|pensar;throw|threw|thrown|lanzar / tirar;thrust|thrust|thrust|empujar;tread|trod|trodden|pisar;understand|understood|understood|entender;undertake|undertook|undertaken|emprender;undo|undid|undone|deshacer;uphold|upheld|upheld|mantener / defender;upset|upset|upset|molestar / alterar;wake|woke|woken|despertar(se);wear|wore|worn|llevar puesto / usar;weave|wove|woven|tejer;weep|wept|wept|llorar;wet|wet/wetted|wet/wetted|mojar;win|won|won|ganar;wind|wound|wound|enrollar / dar cuerda;withdraw|withdrew|withdrawn|retirar;withhold|withheld|withheld|retener;withstand|withstood|withstood|resistir;wring|wrung|wrung|escurrir;write|wrote|written|escribir`;

  const REGULAR_RAW = `accept:aceptar|accompany:acompañar|accuse:acusar|achieve:lograr|acquire:adquirir|act:actuar|adapt:adaptar|add:añadir / sumar|address:dirigirse a|adjust:ajustar|admire:admirar|admit:admitir|adopt:adoptar|advertise:anunciar|advise:aconsejar|afford:permitirse (pagar)|agree:estar de acuerdo|aim:apuntar / aspirar|allow:permitir|amaze:asombrar|amuse:divertir|analyze:analizar|announce:anunciar|annoy:molestar|answer:responder|apologize:disculparse|appear:aparecer|applaud:aplaudir|apply:aplicar / solicitar|appoint:nombrar|appreciate:apreciar|approach:acercarse|approve:aprobar|argue:discutir|arrange:organizar|arrest:arrestar|arrive:llegar|ask:preguntar / pedir|assist:ayudar|assume:suponer|attach:adjuntar|attack:atacar|attempt:intentar|attend:asistir a|attract:atraer|avoid:evitar|bake:hornear|balance:equilibrar|ban:prohibir|bang:golpear|bathe:bañar(se)|battle:luchar|beg:rogar|behave:comportarse|belong:pertenecer|benefit:beneficiar|blame:culpar|bless:bendecir|blink:parpadear|block:bloquear|boil:hervir|book:reservar|borrow:pedir prestado|bother:molestar|bounce:rebotar|bow:hacer una reverencia|brake:frenar|breathe:respirar|brush:cepillar|bump:chocar|bury:enterrar|button:abotonar|calculate:calcular|call:llamar|calm:calmar|camp:acampar|cancel:cancelar|care:importar / cuidar|carry:llevar / cargar|celebrate:celebrar|challenge:desafiar|change:cambiar|charge:cobrar / cargar|chase:perseguir|chat:charlar|check:revisar|cheer:animar|chew:masticar|choke:atragantarse|chop:picar|claim:reclamar / afirmar|clap:aplaudir|clean:limpiar|clear:despejar|climb:escalar / subir|close:cerrar|coach:entrenar|collect:recoger / coleccionar|comb:peinar|combine:combinar|comfort:consolar|command:ordenar|comment:comentar|commit:cometer / comprometerse|communicate:comunicar|compare:comparar|compete:competir|complain:quejarse|complete:completar|concentrate:concentrarse|concern:preocupar|confess:confesar|confirm:confirmar|confuse:confundir|connect:conectar|consider:considerar|consist:consistir|contain:contener|continue:continuar|contribute:contribuir|control:controlar|convert:convertir|convince:convencer|cook:cocinar|copy:copiar|correct:corregir|cough:toser|count:contar|cover:cubrir|crash:chocar|crawl:gatear|create:crear|cross:cruzar|crush:aplastar|cry:llorar|cure:curar|curl:rizar|cycle:andar en bici|damage:dañar|dance:bailar|dare:atreverse|decide:decidir|declare:declarar|decorate:decorar|decrease:disminuir|defend:defender|delay:retrasar|delete:borrar|deliver:entregar|demand:exigir|deny:negar|depend:depender|describe:describir|deserve:merecer|design:diseñar|desire:desear|destroy:destruir|detect:detectar|develop:desarrollar|die:morir|disagree:no estar de acuerdo|disappear:desaparecer|discover:descubrir|discuss:hablar de / debatir|dislike:no gustar|divide:dividir|download:descargar|drag:arrastrar|dress:vestir(se)|drop:dejar caer|drown:ahogarse|dry:secar|dust:quitar el polvo|earn:ganar (dinero)|educate:educar|embarrass:avergonzar|employ:emplear|empty:vaciar|encourage:animar|end:terminar|enjoy:disfrutar|enter:entrar|entertain:entretener|escape:escapar|establish:establecer|estimate:estimar|examine:examinar|excite:emocionar|excuse:disculpar|exercise:hacer ejercicio|exist:existir|expand:expandir|expect:esperar (prever)|explain:explicar|explode:explotar|explore:explorar|express:expresar|extend:extender|face:enfrentar|fail:fallar / reprobar|fasten:abrochar|fear:temer|fetch:ir a buscar|fill:llenar|film:filmar|finish:terminar|fix:arreglar|flash:destellar|float:flotar|flood:inundar|flow:fluir|fold:doblar|follow:seguir|force:forzar|form:formar|found:fundar|frighten:asustar|fry:freír|gather:reunir|gaze:mirar fijamente|glow:brillar|glue:pegar|grab:agarrar|graduate:graduarse|greet:saludar|guarantee:garantizar|guard:vigilar|guess:adivinar|guide:guiar|hammer:martillar|hand:entregar|handle:manejar|happen:pasar / suceder|harm:dañar|hate:odiar|head:dirigirse|heal:sanar|heat:calentar|help:ayudar|hope:esperar (desear)|hug:abrazar|hunt:cazar|hurry:darse prisa|identify:identificar|ignore:ignorar|imagine:imaginar|imitate:imitar|impress:impresionar|improve:mejorar|include:incluir|increase:aumentar|influence:influir|inform:informar|injure:lesionar|insist:insistir|inspect:inspeccionar|install:instalar|intend:tener la intención|interest:interesar|interrupt:interrumpir|introduce:presentar|invent:inventar|invest:invertir|investigate:investigar|invite:invitar|involve:involucrar|iron:planchar|irritate:irritar|join:unirse|joke:bromear|judge:juzgar|juggle:hacer malabares|jump:saltar|kick:patear|kill:matar|kiss:besar|knock:tocar (la puerta)|label:etiquetar|land:aterrizar|last:durar|laugh:reír|launch:lanzar|lick:lamer|like:gustar|limit:limitar|link:enlazar|list:enumerar|listen:escuchar|live:vivir|load:cargar|locate:ubicar|lock:cerrar con llave|look:mirar|love:amar|manage:gestionar / lograr|mark:marcar|marry:casarse|match:combinar / coincidir|matter:importar|measure:medir|melt:derretir|memorize:memorizar|mention:mencionar|milk:ordeñar|miss:extrañar / perder (el tren)|mix:mezclar|move:mover / mudarse|multiply:multiplicar|murder:asesinar|nail:clavar|name:nombrar|need:necesitar|nod:asentir|note:anotar|notice:notar|obey:obedecer|object:objetar|observe:observar|obtain:obtener|occur:ocurrir|offend:ofender|offer:ofrecer|open:abrir|operate:operar|order:ordenar / pedir|organize:organizar|own:poseer|pack:empacar|paint:pintar|park:estacionar|participate:participar|pass:pasar / aprobar|paste:pegar|pause:pausar|perform:actuar / realizar|permit:permitir|persuade:persuadir|phone:telefonear|pick:escoger / recoger|place:colocar|plan:planear|plant:plantar|play:jugar / tocar|please:complacer|plug:enchufar|point:señalar|polish:pulir|pour:verter / servir|practice:practicar|pray:rezar|predict:predecir|prefer:preferir|prepare:preparar|present:presentar|preserve:conservar|press:presionar|pretend:fingir|prevent:prevenir|print:imprimir|produce:producir|promise:prometer|protect:proteger|provide:proporcionar|publish:publicar|pull:jalar / tirar|punch:dar un puñetazo|punish:castigar|purchase:comprar|push:empujar|question:cuestionar|queue:hacer fila|rain:llover|raise:levantar / criar|reach:alcanzar|realize:darse cuenta|receive:recibir|recognize:reconocer|recommend:recomendar|record:grabar|recover:recuperar(se)|recycle:reciclar|reduce:reducir|refer:referirse|reflect:reflejar|refuse:negarse|regret:arrepentirse|reject:rechazar|relax:relajarse|release:liberar|rely:depender / confiar|remain:permanecer|remember:recordar|remind:recordar (a alguien)|remove:quitar|rent:alquilar / rentar|repair:reparar|repeat:repetir|replace:reemplazar|reply:responder|report:informar|represent:representar|request:solicitar|require:requerir|rescue:rescatar|reserve:reservar|resist:resistir|respect:respetar|rest:descansar|retire:jubilarse|return:regresar / devolver|review:repasar|reward:recompensar|rob:robar (asaltar)|rock:mecer|roll:rodar|rub:frotar|ruin:arruinar|rush:apresurarse|sail:navegar|satisfy:satisfacer|save:ahorrar / guardar|scare:asustar|scream:gritar|search:buscar|seem:parecer|select:seleccionar|separate:separar|serve:servir|settle:establecerse|share:compartir|shave:afeitarse|shiver:temblar|shop:ir de compras|shout:gritar|sign:firmar|signal:hacer señas|simplify:simplificar|sip:sorber|skate:patinar|ski:esquiar|skip:saltarse|slip:resbalar|smash:destrozar|smile:sonreír|smoke:fumar|sneeze:estornudar|snow:nevar|solve:resolver|sort:clasificar|sound:sonar|spray:rociar|squeeze:exprimir|stain:manchar|stamp:sellar|star:protagonizar|start:empezar|stay:quedarse|step:dar un paso|stir:revolver|stop:parar|store:almacenar|stretch:estirar|study:estudiar|submit:enviar / presentar|succeed:tener éxito|suffer:sufrir|suggest:sugerir|suit:quedar bien|supply:suministrar|support:apoyar|suppose:suponer|surprise:sorprender|surround:rodear|survive:sobrevivir|suspect:sospechar|swallow:tragar|switch:cambiar|talk:hablar|taste:probar / saber a|tease:burlarse|tempt:tentar|terrify:aterrorizar|test:probar / examinar|text:enviar un mensaje|thank:agradecer|threaten:amenazar|tick:marcar|tickle:hacer cosquillas|tie:atar|tidy:ordenar|tip:dar propina|tire:cansar|touch:tocar|tour:recorrer|trace:rastrear|trade:comerciar|train:entrenar|transfer:transferir|translate:traducir|transport:transportar|trap:atrapar|travel:viajar|treat:tratar|tremble:temblar|trick:engañar|trip:tropezar|trust:confiar|try:intentar / probar|turn:girar|type:teclear|unite:unir|unlock:abrir (con llave)|unpack:desempacar|update:actualizar|upgrade:mejorar|upload:subir (un archivo)|urge:instar|use:usar|vanish:desvanecerse|visit:visitar|volunteer:ofrecerse como voluntario|vote:votar|wait:esperar|walk:caminar|wander:deambular|want:querer|warm:calentar|warn:advertir|wash:lavar|waste:desperdiciar|watch:mirar / ver|water:regar|wave:saludar con la mano|weigh:pesar|welcome:dar la bienvenida|whisper:susurrar|whistle:silbar|wink:guiñar|wipe:limpiar / secar|wish:desear|wonder:preguntarse|work:trabajar|worry:preocuparse|wrap:envolver|yawn:bostezar|yell:gritar|zip:cerrar el cierre|zoom:hacer zoom`;

  // Nivel de los irregulares (los demás se consideran avanzados)
  const BASIC = new Set('be have do go get make say see know take come think give find tell become leave feel put bring begin keep hold write stand hear let mean set meet run pay sit speak read grow lose fall send build understand draw break spend cut buy wear choose eat drink sleep swim sing fly forget win teach sell catch fight throw wake ride steal hide drive learn cost hurt'.split(' '));
  const INTER = new Set('lead lie lay rise shoot shut beat bite blow burn dig feed forgive freeze hang hit lend light mistake ring seek shake shine sink slide smell spell spill spread stick sting swear sweep swing tear upset bend bet bleed bet broadcast burst deal dream fit forbid grind kneel knit lean leap prove quit rid shrink spin spit split spoil strike weep wet withdraw overcome overtake oversleep misunderstand dive bear'.split(' '));
  // Regulares frecuentes (para principiantes)
  const REG_BASIC = new Set('ask call cook clean close dance live like love look listen need open play rain start stop study talk travel try use visit wait walk want watch work arrive answer carry change cry finish help hope jump laugh learn like move plan prefer remember shop smile stay turn wash worry'.split(' '));
  // Verbos que duplican la consonante final (stop → stopped / stopping)
  const DOUBLE = new Set('stop plan drop shop chat clap grab hug jog nod rob rub skip slip step tap trip wrap beg ban chop drag drip drum hop hum mop nap pat pin plug pop rip scan scrub ship shrug sip slam snap stir strip swap tag tip trim zip star admit commit control occur prefer refer permit regret submit transfer omit patrol compel equip deter expel propel rebel recur begin run swim get sit cut put hit let set shut spit split forget win spin dig quit rid bet upset knit fit wet forbid slit bid shed trap'.split(' '));
  const ED_T_SE = new Set(['increase', 'release', 'promise', 'purchase', 'decrease', 'chase']);

  const FORM_LABELS = { base: 'Presente (base)', s: '3ª persona (he/she)', past: 'Pasado simple', pp: 'Participio pasado', ing: 'Gerundio (-ing)' };
  const FORM_SHORT = { past: 'pasado', pp: 'participio', ing: 'gerundio', s: '3ª persona' };

  const isVowel = (c) => 'aeiou'.includes(c);
  const lastL = (b) => /[^aeiou][aeiou]l$/.test(b) && !DOUBLE.has(b);

  function gerund(b) {
    if (b === 'be') return 'being';
    if (/ie$/.test(b)) return b.slice(0, -2) + 'ying';
    if (/(ee|ye|oe)$/.test(b)) return b + 'ing';
    if (/e$/.test(b) && b.length > 2) return b.slice(0, -1) + 'ing';
    if (DOUBLE.has(b)) return b + b.slice(-1) + 'ing';
    if (/[^aeiou]ic$/.test(b)) return b + 'king';
    return b + 'ing';
  }
  function regularPast(b) {
    if (/e$/.test(b)) return b + 'd';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ied';
    if (DOUBLE.has(b)) return b + b.slice(-1) + 'ed';
    if (/[^aeiou]ic$/.test(b)) return b + 'ked';
    return b + 'ed';
  }
  function third(b) {
    if (b === 'be') return 'is';
    if (b === 'have') return 'has';
    if (/(s|sh|ch|x|z|o)$/.test(b)) return b + 'es';
    if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ies';
    return b + 's';
  }
  /** Pronunciación de -ed en verbos regulares */
  function edSound(b) {
    if (/(t|d|te|de)$/.test(b)) return 'id';
    if (/se$/.test(b)) return ED_T_SE.has(b) ? 't' : 'd';
    if (/(p|k|ck|f|ff|gh|ss|sh|ch|x|ce|ke|pe)$/.test(b)) return 't';
    return 'd';
  }

  function pattern(v) {
    const [a, b, c] = [v.base, v.past[0], v.pp[0]];
    if (a === b && b === c) return 'aaa';
    if (b === c) return 'abb';
    if (a === c) return 'aba';
    return 'abc';
  }

  // Construir la lista
  const list = [];
  IRREGULAR_RAW.split(';').forEach((row) => {
    const [base, past, pp, es] = row.split('|');
    const v = { base, past: past.split('/'), pp: pp.split('/'), es, irregular: true };
    v.level = BASIC.has(base) ? 'A2' : INTER.has(base) ? 'B1' : 'B2';
    list.push(v);
  });
  REGULAR_RAW.split('|').forEach((row) => {
    const i = row.indexOf(':');
    const base = row.slice(0, i), es = row.slice(i + 1);
    if (list.some((v) => v.base === base)) return;
    let past = [regularPast(base)];
    if (lastL(base)) past.push(base + 'led'); // travel → traveled / travelled
    list.push({ base, past, pp: past.slice(), es, irregular: false, level: REG_BASIC.has(base) ? 'A1' : 'A2', ed: edSound(base) });
  });
  list.forEach((v) => {
    v.ing = [gerund(v.base)];
    if (!v.irregular && lastL(v.base)) v.ing.push(v.base + 'ling');
    v.s = [third(v.base)];
    if (v.irregular) v.pat = pattern(v);
  });
  list.sort((a, b) => a.base.localeCompare(b.base));
  const byBase = new Map(list.map((v) => [v.base, v]));

  /** Formas de un verbo cualquiera (si no está en la lista, se asume regular) */
  function conjugate(word) {
    const b = word.toLowerCase().trim();
    if (byBase.has(b)) return byBase.get(b);
    if (!/^[a-z]{2,20}$/.test(b)) return null;
    const past = [regularPast(b)];
    return { base: b, past, pp: past.slice(), ing: [gerund(b)], s: [third(b)], es: '', irregular: false, guessed: true, ed: edSound(b) };
  }

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function search(q, filter = 'all', progress = {}) {
    const n = norm(q.trim());
    return list.filter((v) => {
      if (filter === 'irr' && !v.irregular) return false;
      if (filter === 'reg' && v.irregular) return false;
      if (filter === 'mastered' && !((progress[v.base] || {}).box >= 4)) return false;
      if (filter === 'hard' && !((progress[v.base] || {}).bad > 0)) return false;
      if (!n) return true;
      if (v.base.startsWith(n)) return true;
      if ([...v.past, ...v.pp, ...v.ing, ...v.s].some((f) => f === n)) return true;
      return norm(v.es).includes(n) || (n.length > 2 && v.base.includes(n));
    }).sort((a, b) => rank(b, n) - rank(a, n));
  }
  function rank(v, n) {
    if (!n) return 0;
    if (v.base === n) return 4;
    if (norm(v.es).split('/').map((x) => x.trim()).includes(n)) return 3.5;
    if (norm(v.es).split(/[\s/(),]+/).includes(n)) return 3;
    if (v.base.startsWith(n)) return 2;
    return 1;
  }

  /* ------------------ GRUPOS ------------------ */
  const GROUPS = [
    { id: 'basic', icon: '🌱', name: 'Irregulares esenciales', desc: 'Los más usados (nivel A2)', filter: (v) => v.irregular && v.level === 'A2' },
    { id: 'inter', icon: '🌿', name: 'Irregulares intermedios', desc: 'Nivel B1', filter: (v) => v.irregular && v.level === 'B1' },
    { id: 'adv', icon: '🌳', name: 'Irregulares avanzados', desc: 'Nivel B2+', filter: (v) => v.irregular && v.level === 'B2' },
    { id: 'regbasic', icon: '🟢', name: 'Regulares básicos', desc: 'Los más comunes', filter: (v) => !v.irregular && v.level === 'A1' },
    { id: 'reg', icon: '📗', name: 'Todos los regulares', desc: 'Ortografía de -ed / -ing y pronunciación', filter: (v) => !v.irregular },
    { id: 'aaa', icon: '🟰', name: 'Patrón: iguales', desc: 'cut – cut – cut', filter: (v) => v.pat === 'aaa' },
    { id: 'abb', icon: '✌️', name: 'Patrón: pasado = participio', desc: 'buy – bought – bought', filter: (v) => v.pat === 'abb' },
    { id: 'aba', icon: '🔁', name: 'Patrón: base = participio', desc: 'come – came – come', filter: (v) => v.pat === 'aba' },
    { id: 'abc', icon: '🔀', name: 'Patrón: todas distintas', desc: 'go – went – gone', filter: (v) => v.pat === 'abc' },
    { id: 'all', icon: '📚', name: 'Todos los irregulares', desc: 'El reto completo', filter: (v) => v.irregular }
  ];
  const groupVerbs = (id) => { const g = GROUPS.find((x) => x.id === id); return g ? list.filter(g.filter) : []; };

  /* ------------------ REPASO ESPACIADO ------------------ */
  const BOX_DAYS = [0, 1, 2, 4, 8, 16, 32];
  const today = () => window.Store.today();
  function record(u, base, ok) {
    const p = (u.progress.verbs = u.progress.verbs || {});
    const r = (p[base] = p[base] || { box: 0, ok: 0, bad: 0, due: today() });
    if (ok) { r.ok++; r.box = Math.min(6, r.box + 1); } else { r.bad++; r.box = Math.max(1, r.box - 2); }
    const d = new Date(); d.setDate(d.getDate() + BOX_DAYS[r.box]);
    r.due = window.Store.today(d);
    r.last = Date.now();
  }
  function stats(u, verbs = list) {
    const p = u.progress.verbs || {};
    const seen = verbs.filter((v) => p[v.base]);
    return { total: verbs.length, seen: seen.length, mastered: verbs.filter((v) => (p[v.base] || {}).box >= 4).length };
  }
  function dueVerbs(u) {
    const p = u.progress.verbs || {}, t = today();
    return list.filter((v) => p[v.base] && p[v.base].due <= t && p[v.base].box < 6);
  }
  function hardVerbs(u) {
    const p = u.progress.verbs || {};
    return list.filter((v) => p[v.base] && p[v.base].bad > 0).sort((a, b) => (p[b.base].bad - p[b.base].ok) - (p[a.base].bad - p[a.base].ok));
  }
  /** Elige verbos para una sesión: primero los que tocan repasar, luego los nuevos */
  function pickForSession(u, verbs, n) {
    const p = u.progress.verbs || {}, t = today();
    const due = verbs.filter((v) => p[v.base] && p[v.base].due <= t && p[v.base].box < 4);
    const fresh = verbs.filter((v) => !p[v.base]);
    const rest = verbs.filter((v) => p[v.base] && !due.includes(v));
    const sh = window.Lessons.shuffle;
    return [...sh(due), ...sh(fresh), ...sh(rest)].slice(0, n);
  }

  /* ------------------ EJERCICIOS ------------------ */
  const shuffle = (a) => window.Lessons.shuffle(a);
  const first = (arr) => arr[0];
  const formsOf = (v, f) => (f === 'base' ? [v.base] : v[f]);
  const allForms = (v) => `${v.base} – ${v.past.join('/')} – ${v.pp.join('/')} – ${v.ing[0]}`;
  /** Texto para decir en voz alta todas las formas: "go, went, gone, going" */
  const sayForms = (v) => [v.base, v.past.join(' or '), v.pp.join(' or '), v.ing[0]].join(', ');
  /** Agrega audio: al iniciar dice el verbo, al elegir dice la opción y al final dice todas las formas */
  const withAudio = (ex, v, say = v.base) => ({ ...ex, say, sayAfter: sayForms(v), speakOptions: true, speakBoth: true });

  function wrongCandidates(v, f) {
    const c = new Set([v.base + 'ed', regularPast(v.base), v.base, v.ing[0], v.past[0], v.pp[0], v.s[0], /e$/.test(v.base) ? null : v.base + 'en', v.irregular ? v.past[0] + 'ed' : null]);
    if (f === 'ing') { c.add(v.base + 'ing'); c.add(v.base + v.base.slice(-1) + 'ing'); }
    if (f === 'pp' && v.irregular) c.add(v.past[0] + 'en');
    formsOf(v, f).forEach((x) => c.delete(x));
    return shuffle([...c].filter((x) => x && x !== v.base + 'eed'));
  }

  function choiceEx(v, f) {
    const correct = first(formsOf(v, f));
    const opts = shuffle([correct, ...wrongCandidates(v, f).slice(0, 3)]);
    return withAudio({ type: 'choice', skill: 'grammar', verb: v.base, question: `${FORM_LABELS[f]} de "${v.base}" (${v.es})`, options: opts, answer: opts.indexOf(correct), explain: allForms(v), audio: null }, v);
  }
  function writeEx(v, f) {
    return withAudio({ type: 'translate', skill: 'writing', verb: v.base, strict: true, question: `Escribe el ${FORM_SHORT[f]}`, source: `${v.base} (${v.es}) → ${FORM_LABELS[f].toLowerCase()}`, answers: formsOf(v, f), explain: allForms(v) }, v);
  }
  function threeFormsEx(v) {
    const combos = [];
    v.past.forEach((p) => v.pp.forEach((pp) => combos.push(`${v.base} ${p} ${pp}`)));
    return withAudio({ type: 'translate', skill: 'writing', verb: v.base, strict: true, question: 'Escribe las 3 formas (base, pasado, participio)', source: `${v.es}  →  ${v.base} … … `, hint: 'Ejemplo: go went gone', answers: combos, explain: allForms(v) }, v);
  }
  function listenEx(v) {
    const text = `${v.base}, ${v.past[0]}, ${v.pp[0]}`;
    return { ...withAudio({ type: 'listen_type', skill: 'listening', verb: v.base, strict: true, question: 'Escucha y escribe las 3 formas', audio: text, shown: text, answers: [text], translation: `${v.es} · ${allForms(v)}` }, v), say: null };
  }
  function speakEx(v) {
    return { ...withAudio({ type: 'speak', skill: 'speaking', verb: v.base, question: 'Di en voz alta las 3 formas', text: `${v.base}, ${v.past[0]}, ${v.pp[0]}`, translation: v.es }, v), say: null };
  }
  function speakFormEx(v, f) {
    const form = first(formsOf(v, f));
    const ctx = { past: `Yesterday I ${form}`, pp: `I have ${form}`, ing: `I am ${form}`, s: `She ${form}` }[f];
    return withAudio({ type: 'speak', skill: 'speaking', verb: v.base, question: `Di la frase con el ${FORM_SHORT[f]} de "${v.base}"`, text: ctx, translation: `${v.es} — ${FORM_LABELS[f]}`, hideText: true }, v);
  }
  function edEx(v) {
    const past = v.past[0];
    const opts = ['/t/ — como "workt"', '/d/ — como "playd"', '/ɪd/ — sílaba extra "id"'];
    return { type: 'choice', skill: 'listening', verb: v.base, question: `¿Cómo suena la terminación de "${past}"?`, audio: past, options: opts, answer: { t: 0, d: 1, id: 2 }[v.ed], explain: `${allForms(v)}. Después de t/d suena /ɪd/; después de p, k, f, s, sh, ch, x suena /t/; en los demás casos /d/.`, sayAfter: sayForms(v) };
  }
  function regIrrEx(v) {
    return { type: 'choice', skill: 'grammar', verb: v.base, question: `¿"${v.base}" (${v.es}) es regular o irregular?`, options: ['Regular (-ed)', 'Irregular'], answer: v.irregular ? 1 : 0, explain: allForms(v), say: v.base, sayAfter: sayForms(v) };
  }

  /** Crea una sesión de práctica. mode: mix | write | oral */
  function buildSession(verbs, mode) {
    const out = [];
    const forms = (v) => (v.irregular ? ['past', 'pp', 'past', 'pp', 'ing'] : ['past', 'ing', 's']);
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    verbs.forEach((v, i) => {
      if (mode === 'write') {
        out.push(i % 3 === 0 ? threeFormsEx(v) : writeEx(v, pick(forms(v))));
        if (i % 2 === 0) out.push(writeEx(v, v.irregular ? 'pp' : 'ing'));
      } else if (mode === 'oral') {
        out.push(speakEx(v));
        out.push(i % 2 === 0 ? listenEx(v) : speakFormEx(v, pick(forms(v))));
        if (!v.irregular && i % 3 === 0) out.push(edEx(v));
      } else {
        const r = i % 5;
        out.push(choiceEx(v, pick(forms(v))));
        if (r === 0) out.push(writeEx(v, pick(forms(v))));
        if (r === 1) out.push(speakEx(v));
        if (r === 2) out.push(listenEx(v));
        if (r === 3) out.push(v.irregular ? threeFormsEx(v) : edEx(v));
        if (r === 4) out.push(regIrrEx(v));
      }
    });
    if (mode !== 'oral' && verbs.length >= 4) {
      const pairs = shuffle(verbs).slice(0, 5).map((v) => [v.base, v.past[0]]);
      if (new Set(pairs.map((p) => p[1])).size === pairs.length) out.push({ type: 'match', skill: 'vocab', question: 'Une cada verbo con su pasado', pairs, speakBoth: true, sayAfter: pairs.map((p) => `${p[0]}, ${p[1]}`).join('. ') });
    }
    // primero una vuelta de opción múltiple / escucha, después producción
    return mode === 'mix' ? [...out.filter((e) => e.type === 'choice'), ...shuffle(out.filter((e) => e.type !== 'choice'))] : out;
  }

  /** Pregunta rápida para el contrarreloj */
  function quickQuestion(verbs) {
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const f = v.irregular ? ['past', 'pp', 'past', 'pp', 'ing'][Math.floor(Math.random() * 5)] : ['past', 'ing', 's'][Math.floor(Math.random() * 3)];
    return choiceEx(v, f);
  }

  return { sayForms, list, byBase, conjugate, search, GROUPS, groupVerbs, record, stats, dueVerbs, hardVerbs, pickForSession, buildSession, quickQuestion, FORM_LABELS, allForms, edSound, gerund, regularPast, third };
})();
