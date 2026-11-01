/* =========================================================
   CONTENIDO DEL CURSO
   Cada unidad genera automáticamente 7 lecciones:
   vocabulario, gramática, escucha, habla, escritura, lectura y repaso.
   Para agregar contenido basta con añadir unidades a UNITS.
   ========================================================= */
window.DATA = (function () {
  const LEVELS = [
    { id: 'A1', name: 'Principiante', color: '#58cc02', icon: '🌱', desc: 'Frases básicas, presentarte y necesidades inmediatas.' },
    { id: 'A2', name: 'Elemental', color: '#1cb0f6', icon: '🌿', desc: 'Situaciones cotidianas: compras, viajes, direcciones.' },
    { id: 'B1', name: 'Intermedio', color: '#ff9600', icon: '🌳', desc: 'Trabajo, planes, experiencias y opiniones simples.' },
    { id: 'B2', name: 'Intermedio alto', color: '#ce82ff', icon: '🏔️', desc: 'Debates, noticias y textos complejos con fluidez.' },
    { id: 'C1', name: 'Avanzado', color: '#ff4b4b', icon: '🚀', desc: 'Lenguaje matizado, expresiones idiomáticas y argumentación.' }
  ];

  const LESSON_TYPES = [
    { id: 'vocab', name: 'Vocabulario', icon: '📚', skill: 'vocab' },
    { id: 'grammar', name: 'Gramática', icon: '🧩', skill: 'grammar' },
    { id: 'listening', name: 'Escucha', icon: '🎧', skill: 'listening' },
    { id: 'speaking', name: 'Habla', icon: '🎤', skill: 'speaking' },
    { id: 'writing', name: 'Escritura', icon: '✍️', skill: 'writing' },
    { id: 'reading', name: 'Lectura', icon: '📖', skill: 'reading' },
    { id: 'review', name: 'Repaso de unidad', icon: '🏆', skill: 'mixed' }
  ];

  const SKILLS = {
    vocab: { name: 'Vocabulario', icon: '📚', color: '#58cc02' },
    grammar: { name: 'Gramática', icon: '🧩', color: '#1cb0f6' },
    listening: { name: 'Comprensión oral', icon: '🎧', color: '#ff9600' },
    speaking: { name: 'Expresión oral', icon: '🎤', color: '#ff4b4b' },
    writing: { name: 'Escritura', icon: '✍️', color: '#ce82ff' },
    reading: { name: 'Lectura', icon: '📖', color: '#2b70c9' }
  };

  // vocab: [inglés, español, emoji]
  // sentences: [inglés, español, ...traducciones alternativas aceptadas]
  // grammar: { q, o: opciones, a: índice correcto, e: explicación }
  const UNITS = [
    /* ------------------------------ A1 ------------------------------ */
    {
      id: 'a1u1', level: 'A1', title: 'Saludos y presentaciones', icon: '👋',
      tip: {
        title: 'El verbo "to be" (ser / estar)',
        html: `<p>En inglés "ser" y "estar" son el mismo verbo: <b>to be</b>.</p>
        <table><tr><td>I <b>am</b></td><td>yo soy / estoy</td></tr>
        <tr><td>You <b>are</b></td><td>tú eres / estás</td></tr>
        <tr><td>He / She / It <b>is</b></td><td>él / ella es / está</td></tr>
        <tr><td>We / They <b>are</b></td><td>nosotros / ellos son / están</td></tr></table>
        <p>Contracciones: <b>I'm, you're, he's, she's, we're, they're</b>.</p>
        <p>💡 En inglés <u>siempre</u> se usa el sujeto: "<i>Es mi amigo</i>" → "<b>He is</b> my friend".</p>`
      },
      vocab: [['hello', 'hola', '👋'], ['goodbye', 'adiós', '🙋'], ['name', 'nombre', '🏷️'], ['friend', 'amigo', '🤝'], ['teacher', 'profesor', '👩‍🏫'], ['student', 'estudiante', '🧑‍🎓'], ['good morning', 'buenos días', '🌅'], ['good night', 'buenas noches', '🌙']],
      sentences: [
        ['Hello, my name is Anna.', 'Hola, mi nombre es Anna.', 'Hello, I am Anna.'],
        ['I am a student.', 'Yo soy estudiante.', "I'm a student."],
        ['She is my friend.', 'Ella es mi amiga.', "She's my friend."],
        ['Nice to meet you.', 'Mucho gusto.', 'Pleased to meet you.'],
        ['Where are you from?', '¿De dónde eres?'],
        ['I am from Mexico.', 'Soy de México.', "I'm from Mexico."]
      ],
      grammar: [
        { q: 'She ___ a teacher.', o: ['is', 'am', 'are'], a: 0, e: 'Con he / she / it usamos "is".' },
        { q: 'I ___ from Spain.', o: ['is', 'am', 'are'], a: 1, e: 'Con "I" siempre usamos "am".' },
        { q: 'They ___ my friends.', o: ['am', 'is', 'are'], a: 2, e: 'Con we / you / they usamos "are".' },
        { q: '___ is my brother.', o: ['He', 'She', 'I'], a: 0, e: '"Brother" (hermano) es masculino: "He".' }
      ],
      reading: {
        title: 'Meet Tom',
        text: "Hello! My name is Tom. I am twenty years old. I am from Canada, but I live in London. I am a student. My best friend is Maria. She is from Brazil. She is very friendly.",
        qs: [
          { q: 'Where is Tom from?', o: ['Canada', 'London', 'Brazil'], a: 0 },
          { q: 'Who is Maria?', o: ["Tom's teacher", "Tom's best friend", "Tom's sister"], a: 1 },
          { q: 'What does Tom do?', o: ['He is a teacher', 'He is a student', 'He is a doctor'], a: 1 }
        ]
      },
      writing: { prompt: 'Preséntate en inglés: di tu nombre, de dónde eres y a qué te dedicas.', min: 15, keywords: ['name', 'am', 'from'] }
    },
    {
      id: 'a1u2', level: 'A1', title: 'La familia', icon: '👨‍👩‍👧',
      tip: {
        title: 'Posesivos y "have / has"',
        html: `<p>Adjetivos posesivos: <b>my</b> (mi), <b>your</b> (tu), <b>his</b> (su, de él), <b>her</b> (su, de ella), <b>our</b> (nuestro), <b>their</b> (su, de ellos).</p>
        <p><b>Have</b> = tener. Con he/she/it cambia a <b>has</b>:</p>
        <table><tr><td>I / You / We / They <b>have</b></td></tr><tr><td>He / She / It <b>has</b></td></tr></table>
        <p>💡 La edad se dice con "to be": "<i>Tengo 10 años</i>" → "<b>I am</b> 10 years old" (¡no "I have"!).</p>`
      },
      vocab: [['mother', 'madre', '👩'], ['father', 'padre', '👨'], ['sister', 'hermana', '👧'], ['brother', 'hermano', '👦'], ['baby', 'bebé', '👶'], ['grandmother', 'abuela', '👵'], ['grandfather', 'abuelo', '👴'], ['family', 'familia', '👪']],
      sentences: [
        ['I have two brothers.', 'Tengo dos hermanos.'],
        ['Her mother is a doctor.', 'Su madre es doctora.'],
        ['My father is tall.', 'Mi padre es alto.'],
        ['She has a baby.', 'Ella tiene un bebé.'],
        ['This is my family.', 'Esta es mi familia.'],
        ['I am ten years old.', 'Tengo diez años.', "I'm ten years old."]
      ],
      grammar: [
        { q: 'She ___ two sisters.', o: ['have', 'has', 'is'], a: 1, e: 'He / she / it → "has".' },
        { q: 'This is Paul and this is ___ car.', o: ['her', 'his', 'my'], a: 1, e: 'Paul es hombre → "his" (de él).' },
        { q: 'I ___ 25 years old.', o: ['have', 'am', 'has'], a: 1, e: 'La edad se expresa con "to be": I am 25 years old.' },
        { q: 'We love ___ grandmother.', o: ['our', 'their', 'his'], a: 0, e: 'We → our (nuestro/a).' }
      ],
      reading: {
        title: "Lucy's family",
        text: "My name is Lucy. I have a big family. My father is Mark and my mother is Julia. I have one brother and two sisters. My brother is eight years old. My grandmother lives with us. She is very kind and she cooks every day.",
        qs: [
          { q: 'How many sisters does Lucy have?', o: ['One', 'Two', 'Three'], a: 1 },
          { q: 'Who lives with Lucy?', o: ['Her grandmother', 'Her aunt', 'Her friend'], a: 0 },
          { q: 'How old is her brother?', o: ['Six', 'Eight', 'Ten'], a: 1 }
        ]
      },
      writing: { prompt: 'Describe a tu familia: ¿cuántas personas son, cómo se llaman y qué edad tienen?', min: 20, keywords: ['my', 'have', 'years old'] }
    },
    {
      id: 'a1u3', level: 'A1', title: 'Comida y bebida', icon: '🍎',
      tip: {
        title: 'A / An y "like"',
        html: `<p><b>A</b> antes de sonido consonante: <i>a banana</i>. <b>An</b> antes de sonido vocal: <i>an apple, an egg</i>.</p>
        <p><b>Like</b> = gustar. Ojo, la estructura es diferente al español:</p>
        <table><tr><td>Me gusta el café</td><td><b>I like</b> coffee</td></tr>
        <tr><td>No me gusta el té</td><td><b>I don't like</b> tea</td></tr>
        <tr><td>A ella le gusta</td><td>She <b>likes</b>...</td></tr></table>
        <p>💡 No uses "the" para hablar en general: "<i>Me gusta la pizza</i>" → "I like pizza".</p>`
      },
      vocab: [['apple', 'manzana', '🍎'], ['bread', 'pan', '🍞'], ['water', 'agua', '💧'], ['coffee', 'café', '☕'], ['cheese', 'queso', '🧀'], ['egg', 'huevo', '🥚'], ['chicken', 'pollo', '🍗'], ['milk', 'leche', '🥛']],
      sentences: [
        ['I like coffee.', 'Me gusta el café.'],
        ['She does not like milk.', 'A ella no le gusta la leche.', "She doesn't like milk."],
        ['I want an apple.', 'Quiero una manzana.'],
        ['Can I have some water, please?', '¿Me puede dar agua, por favor?'],
        ['We eat chicken and rice.', 'Comemos pollo y arroz.'],
        ['The bread is fresh.', 'El pan está fresco.']
      ],
      grammar: [
        { q: 'I would like ___ egg.', o: ['a', 'an', 'the'], a: 1, e: '"Egg" empieza con sonido vocal → "an".' },
        { q: 'She ___ chocolate.', o: ['like', 'likes', 'liking'], a: 1, e: 'En presente simple, he/she/it añade -s: likes.' },
        { q: 'I ___ like fish.', o: ['not', "don't", "doesn't"], a: 1, e: 'Negativo con I / you / we / they: "don\'t".' },
        { q: 'He wants ___ banana.', o: ['an', 'a', 'some'], a: 1, e: '"Banana" empieza con consonante → "a".' }
      ],
      reading: {
        title: 'At the café',
        text: "Sam goes to a small café every morning. He always orders a coffee with milk and a cheese sandwich. His friend Emma doesn't drink coffee. She likes orange juice and she eats an apple. The café is cheap and the food is delicious.",
        qs: [
          { q: 'What does Sam drink?', o: ['Tea', 'Coffee with milk', 'Orange juice'], a: 1 },
          { q: "What doesn't Emma drink?", o: ['Coffee', 'Juice', 'Water'], a: 0 },
          { q: 'How is the food?', o: ['Expensive', 'Bad', 'Delicious'], a: 2 }
        ]
      },
      writing: { prompt: 'Escribe qué comida te gusta y qué comida no te gusta.', min: 20, keywords: ['like', "don't", 'eat'] }
    },
    {
      id: 'a1u4', level: 'A1', title: 'Números, días y la hora', icon: '⏰',
      tip: {
        title: 'Preposiciones de tiempo: at, on, in',
        html: `<table><tr><td><b>at</b></td><td>horas</td><td>at 7 o'clock</td></tr>
        <tr><td><b>on</b></td><td>días</td><td>on Monday</td></tr>
        <tr><td><b>in</b></td><td>meses, años</td><td>in July, in 2025</td></tr></table>
        <p>¿Qué hora es? → <b>What time is it?</b> — It's <b>half past</b> three (3:30), It's a <b>quarter to</b> five (4:45).</p>
        <p>💡 Los días y meses se escriben con <b>mayúscula</b>: Monday, July.</p>`
      },
      vocab: [['Monday', 'lunes', '📅'], ['Friday', 'viernes', '🎉'], ['Sunday', 'domingo', '☀️'], ['clock', 'reloj', '🕐'], ['morning', 'mañana', '🌄'], ['night', 'noche', '🌃'], ['week', 'semana', '🗓️'], ['today', 'hoy', '📍']],
      sentences: [
        ['What time is it?', '¿Qué hora es?'],
        ["It is seven o'clock.", 'Son las siete.', "It's seven o'clock.", "It's seven."],
        ['I work on Monday.', 'Trabajo el lunes.', 'I work on Mondays.'],
        ['The class is at nine.', 'La clase es a las nueve.'],
        ['My birthday is in July.', 'Mi cumpleaños es en julio.'],
        ['See you on Friday.', 'Nos vemos el viernes.']
      ],
      grammar: [
        { q: 'The meeting is ___ 10 a.m.', o: ['on', 'at', 'in'], a: 1, e: 'Horas exactas → "at".' },
        { q: 'I go to the gym ___ Tuesday.', o: ['in', 'at', 'on'], a: 2, e: 'Días de la semana → "on".' },
        { q: 'She was born ___ 1998.', o: ['in', 'on', 'at'], a: 0, e: 'Años y meses → "in".' },
        { q: '¿Cómo se escribe correctamente?', o: ['monday', 'Monday', 'MONday'], a: 1, e: 'Los días se escriben con mayúscula inicial.' }
      ],
      reading: {
        title: "Kate's week",
        text: "Kate is very busy. On Monday and Wednesday she goes to English class at six o'clock. On Friday she plays tennis with her friends. On Saturday morning she works in a shop. Sunday is her favourite day because she sleeps until ten.",
        qs: [
          { q: 'When does Kate play tennis?', o: ['On Monday', 'On Friday', 'On Sunday'], a: 1 },
          { q: 'What time is her English class?', o: ['At six', 'At ten', 'At nine'], a: 0 },
          { q: 'Why is Sunday her favourite day?', o: ['She works', 'She sleeps late', 'She plays tennis'], a: 1 }
        ]
      },
      writing: { prompt: 'Describe tu semana: ¿qué haces cada día y a qué hora?', min: 25, keywords: ['on', 'at', 'Monday'] }
    },
    {
      id: 'a1u5', level: 'A1', title: 'Mi casa y mi rutina', icon: '🏠',
      tip: {
        title: 'Presente simple y "there is / there are"',
        html: `<p>Presente simple para rutinas: <i>I <b>work</b>, she <b>works</b>, he <b>watches</b>, it <b>goes</b></i>.</p>
        <p>Preguntas y negativos con <b>do / does</b>: <i>Do you work? — She doesn't work.</i></p>
        <p><b>There is</b> (hay, singular) / <b>There are</b> (hay, plural):</p>
        <table><tr><td>There is a sofa.</td><td>Hay un sofá.</td></tr><tr><td>There are two beds.</td><td>Hay dos camas.</td></tr></table>`
      },
      vocab: [['house', 'casa', '🏠'], ['kitchen', 'cocina', '🍳'], ['bedroom', 'dormitorio', '🛏️'], ['bathroom', 'baño', '🛁'], ['door', 'puerta', '🚪'], ['window', 'ventana', '🪟'], ['wake up', 'despertarse', '⏰'], ['shower', 'ducha', '🚿']],
      sentences: [
        ['I wake up at seven.', 'Me despierto a las siete.'],
        ['She takes a shower every morning.', 'Ella se ducha cada mañana.'],
        ['There are three bedrooms.', 'Hay tres dormitorios.'],
        ['There is a table in the kitchen.', 'Hay una mesa en la cocina.'],
        ['He goes to work by bus.', 'Él va al trabajo en autobús.'],
        ['Do you live in a house?', '¿Vives en una casa?']
      ],
      grammar: [
        { q: 'There ___ two windows.', o: ['is', 'are', 'be'], a: 1, e: 'Plural → "there are".' },
        { q: 'He ___ TV after dinner.', o: ['watch', 'watches', 'watchs'], a: 1, e: 'Verbos terminados en -ch añaden -es: watches.' },
        { q: '___ she live near here?', o: ['Do', 'Does', 'Is'], a: 1, e: 'Preguntas con he/she/it → "Does".' },
        { q: 'They ___ breakfast at 8.', o: ['has', 'have', 'having'], a: 1, e: 'They → have.' }
      ],
      reading: {
        title: 'My apartment',
        text: "I live in a small apartment in the city centre. There is a living room, a kitchen, one bedroom and a bathroom. There are two big windows in the living room. Every day I wake up at seven, take a shower and have breakfast in the kitchen. Then I go to work by bike.",
        qs: [
          { q: 'How many bedrooms are there?', o: ['One', 'Two', 'Three'], a: 0 },
          { q: 'Where does the writer have breakfast?', o: ['In the bedroom', 'In the kitchen', 'At work'], a: 1 },
          { q: 'How does the writer go to work?', o: ['By bus', 'By car', 'By bike'], a: 2 }
        ]
      },
      writing: { prompt: 'Describe tu casa y tu rutina de la mañana.', min: 30, keywords: ['there is', 'there are', 'every'] }
    },

    /* ------------------------------ A2 ------------------------------ */
    {
      id: 'a2u1', level: 'A2', title: 'De compras', icon: '🛍️',
      tip: {
        title: 'Comparativos y "how much / how many"',
        html: `<p>Adjetivos cortos: <b>-er + than</b> → cheap → <b>cheaper than</b>; big → <b>bigger</b>.</p>
        <p>Adjetivos largos: <b>more + adj + than</b> → <b>more expensive than</b>.</p>
        <p>Irregulares: good → <b>better</b>, bad → <b>worse</b>.</p>
        <p><b>How much</b> (incontables / precio): How much is it? — <b>How many</b> (contables): How many shirts?</p>
        <p>⚠️ Nunca digas "more cheaper" ni "more better".</p>`
      },
      vocab: [['shop', 'tienda', '🏪'], ['price', 'precio', '🏷️'], ['cheap', 'barato', '💲'], ['expensive', 'caro', '💎'], ['shirt', 'camisa', '👕'], ['shoes', 'zapatos', '👟'], ['money', 'dinero', '💵'], ['size', 'talla', '📏']],
      sentences: [
        ['How much is this shirt?', '¿Cuánto cuesta esta camisa?', 'How much does this shirt cost?'],
        ['These shoes are too expensive.', 'Estos zapatos son demasiado caros.'],
        ['Do you have a bigger size?', '¿Tiene una talla más grande?'],
        ['This jacket is cheaper than that one.', 'Esta chaqueta es más barata que aquella.'],
        ['Can I pay by card?', '¿Puedo pagar con tarjeta?'],
        ["I'm just looking, thank you.", 'Solo estoy mirando, gracias.', 'I am just looking, thank you.']
      ],
      grammar: [
        { q: 'This phone is ___ than that one.', o: ['more cheap', 'cheaper', 'more cheaper'], a: 1, e: 'Adjetivo corto: cheap → cheaper.' },
        { q: 'Gold is ___ than silver.', o: ['expensiver', 'more expensive', 'most expensive'], a: 1, e: 'Adjetivo largo: more expensive.' },
        { q: 'How ___ apples do you want?', o: ['much', 'many', 'lot'], a: 1, e: '"Apples" es contable → how many.' },
        { q: 'Your idea is ___ than mine.', o: ['gooder', 'better', 'more good'], a: 1, e: 'Good es irregular: better.' }
      ],
      reading: {
        title: 'Shopping for a gift',
        text: "Laura wants to buy a birthday present for her brother. First she goes to a big department store, but the prices are very high. A watch costs two hundred dollars! Then she visits a small shop near her house. There she finds a nice blue shirt. It is cheaper and her brother loves blue. She pays by card and goes home happy.",
        qs: [
          { q: 'Why doesn\'t Laura buy the watch?', o: ["It's too expensive", "It's ugly", "It's too small"], a: 0 },
          { q: 'What does she buy?', o: ['A watch', 'A blue shirt', 'Shoes'], a: 1 },
          { q: 'How does she pay?', o: ['In cash', 'By card', 'By phone'], a: 1 }
        ]
      },
      writing: { prompt: 'Compara dos tiendas o productos que conozcas (precio, calidad, tamaño).', min: 30, keywords: ['than', 'cheaper', 'more'] }
    },
    {
      id: 'a2u2', level: 'A2', title: 'Viajes y transporte', icon: '✈️',
      tip: {
        title: 'Pasado simple',
        html: `<p>Verbos regulares: <b>+ed</b> → visit → <b>visited</b>, travel → <b>traveled</b>.</p>
        <p>Irregulares importantes: go → <b>went</b>, take → <b>took</b>, see → <b>saw</b>, buy → <b>bought</b>, fly → <b>flew</b>.</p>
        <p>Negativo y preguntas con <b>did</b> + verbo base: <i>I <b>didn't go</b>. <b>Did</b> you <b>see</b> it?</i></p>
        <p>To be en pasado: I/he/she <b>was</b> — you/we/they <b>were</b>.</p>
        <p>⚠️ Después de "did" el verbo NO va en pasado: "Did you went" ❌ → "Did you go" ✅</p>`
      },
      vocab: [['airport', 'aeropuerto', '🛫'], ['ticket', 'boleto', '🎫'], ['train', 'tren', '🚆'], ['suitcase', 'maleta', '🧳'], ['passport', 'pasaporte', '🛂'], ['hotel', 'hotel', '🏨'], ['beach', 'playa', '🏖️'], ['trip', 'viaje', '🗺️']],
      sentences: [
        ['I went to Paris last summer.', 'Fui a París el verano pasado.'],
        ['We took the train to the airport.', 'Tomamos el tren al aeropuerto.'],
        ['Did you buy the tickets?', '¿Compraste los boletos?'],
        ['The hotel was near the beach.', 'El hotel estaba cerca de la playa.'],
        ["I didn't forget my passport.", 'No olvidé mi pasaporte.', 'I did not forget my passport.'],
        ['Where is the train station?', '¿Dónde está la estación de tren?']
      ],
      grammar: [
        { q: 'Last year we ___ to Japan.', o: ['go', 'went', 'goed'], a: 1, e: 'Go es irregular: went.' },
        { q: 'Did you ___ the museum?', o: ['visited', 'visit', 'visits'], a: 1, e: 'Después de "did" usamos el verbo base.' },
        { q: 'The flight ___ very long.', o: ['were', 'was', 'is been'], a: 1, e: 'Singular en pasado → was.' },
        { q: 'She ___ like the food.', o: ["didn't", "don't", "wasn't"], a: 0, e: 'Negativo en pasado: didn\'t + verbo base.' }
      ],
      reading: {
        title: 'A trip to Rome',
        text: "Last month Peter and his wife traveled to Rome. They flew from Madrid and arrived at night. The next day they visited the Colosseum and ate delicious pasta. Unfortunately, it rained on the third day, so they stayed in the hotel and watched movies. They didn't want to come home!",
        qs: [
          { q: 'How did they travel to Rome?', o: ['By train', 'By plane', 'By car'], a: 1 },
          { q: 'What happened on the third day?', o: ['It rained', 'They got lost', 'They went to the beach'], a: 0 },
          { q: 'How did they feel about going home?', o: ['Happy', "They didn't want to", 'Excited'], a: 1 }
        ]
      },
      writing: { prompt: 'Cuenta un viaje que hiciste: ¿a dónde fuiste, con quién y qué hiciste?', min: 40, keywords: ['went', 'was', 'visited'] }
    },
    {
      id: 'a2u3', level: 'A2', title: 'La ciudad y direcciones', icon: '🗺️',
      tip: {
        title: 'Preposiciones de lugar e imperativos',
        html: `<p><b>next to</b> (al lado de), <b>opposite</b> (enfrente de), <b>between</b> (entre), <b>behind</b> (detrás de), <b>in front of</b> (delante de), <b>on the corner</b> (en la esquina).</p>
        <p>Imperativos para dar direcciones: <b>Go straight</b>, <b>Turn left / right</b>, <b>Cross</b> the street, <b>Take</b> the second street.</p>
        <p>Para preguntar con cortesía: <i>Excuse me, <b>how do I get to</b> the station?</i></p>`
      },
      vocab: [['street', 'calle', '🛣️'], ['bank', 'banco', '🏦'], ['hospital', 'hospital', '🏥'], ['park', 'parque', '🌳'], ['bridge', 'puente', '🌉'], ['left', 'izquierda', '⬅️'], ['right', 'derecha', '➡️'], ['corner', 'esquina', '📐']],
      sentences: [
        ['Excuse me, where is the bank?', 'Disculpe, ¿dónde está el banco?'],
        ['Turn left at the corner.', 'Gira a la izquierda en la esquina.'],
        ['Go straight and cross the bridge.', 'Sigue recto y cruza el puente.'],
        ['The pharmacy is next to the park.', 'La farmacia está al lado del parque.'],
        ['The museum is opposite the hotel.', 'El museo está enfrente del hotel.'],
        ['How do I get to the station?', '¿Cómo llego a la estación?']
      ],
      grammar: [
        { q: 'The café is ___ the bank and the school.', o: ['between', 'next', 'opposite of'], a: 0, e: '"Between" = entre dos cosas.' },
        { q: '___ right at the traffic lights.', o: ['Turning', 'Turn', 'To turn'], a: 1, e: 'Imperativo = verbo base: Turn right.' },
        { q: 'The car is ___ the house.', o: ['in front of', 'in front', 'front of'], a: 0, e: 'La expresión completa es "in front of".' },
        { q: 'The shop is ___ to the cinema.', o: ['near', 'next', 'beside'], a: 1, e: '"Next to" = al lado de.' }
      ],
      reading: {
        title: 'Directions to the museum',
        text: "Excuse me, how do I get to the art museum? — It's easy. Go straight along this street for two blocks. Then turn right at the supermarket. Cross the bridge and the museum is on your left, opposite a big park. It takes about ten minutes on foot.",
        qs: [
          { q: 'Where do you turn right?', o: ['At the park', 'At the supermarket', 'At the bridge'], a: 1 },
          { q: 'What is opposite the museum?', o: ['A park', 'A bank', 'A school'], a: 0 },
          { q: 'How long does it take walking?', o: ['Two minutes', 'Ten minutes', 'An hour'], a: 1 }
        ]
      },
      writing: { prompt: 'Explica cómo llegar desde tu casa a un lugar cercano (tienda, parque, escuela).', min: 35, keywords: ['turn', 'straight', 'next to'] }
    },
    {
      id: 'a2u4', level: 'A2', title: 'Salud y cuerpo', icon: '🩺',
      tip: {
        title: '"Should" para dar consejos',
        html: `<p><b>Should</b> + verbo base = deberías: <i>You <b>should</b> rest.</i> — <i>You <b>shouldn't</b> smoke.</i></p>
        <p>Para síntomas usamos <b>have</b>: <i>I <b>have</b> a headache / a cold / a fever.</i></p>
        <p>"Me duele..." → <i>My back <b>hurts</b></i> o <i>I have a <b>sore</b> throat</i>.</p>
        <p>⚠️ No se usa "to" después de should: "should to go" ❌</p>`
      },
      vocab: [['head', 'cabeza', '🗣️'], ['headache', 'dolor de cabeza', '🤕'], ['doctor', 'médico', '🧑‍⚕️'], ['medicine', 'medicina', '💊'], ['fever', 'fiebre', '🤒'], ['tired', 'cansado', '😴'], ['hand', 'mano', '✋'], ['healthy', 'saludable', '🥗']],
      sentences: [
        ['I have a terrible headache.', 'Tengo un dolor de cabeza terrible.'],
        ['You should drink more water.', 'Deberías beber más agua.'],
        ["You shouldn't eat so much sugar.", 'No deberías comer tanta azúcar.', 'You should not eat so much sugar.'],
        ['My back hurts.', 'Me duele la espalda.'],
        ['I need to see a doctor.', 'Necesito ver a un médico.'],
        ['She feels tired today.', 'Ella se siente cansada hoy.']
      ],
      grammar: [
        { q: 'You ___ go to bed early.', o: ['should', 'should to', 'shoulds'], a: 0, e: 'Should + verbo base, sin "to".' },
        { q: 'I ___ a cold.', o: ['am', 'have', 'feel'], a: 1, e: 'Las enfermedades se expresan con "have".' },
        { q: 'My feet ___.', o: ['hurt', 'hurts', 'is hurting me'], a: 0, e: '"Feet" es plural → hurt.' },
        { q: 'He ___ smoke. It\'s bad for him.', o: ["shouldn't", "doesn't should", "not should"], a: 0, e: 'Negativo: shouldn\'t.' }
      ],
      reading: {
        title: 'At the doctor',
        text: "Doctor: Good morning. What's the problem? — Ben: I have a fever and a sore throat. I feel very tired. — Doctor: You probably have the flu. You should stay in bed for three days and drink a lot of water. Take this medicine twice a day. You shouldn't go to work this week.",
        qs: [
          { q: 'What symptoms does Ben have?', o: ['A broken leg', 'Fever and sore throat', 'A headache only'], a: 1 },
          { q: 'How often should he take the medicine?', o: ['Once a day', 'Twice a day', 'Every hour'], a: 1 },
          { q: 'What does the doctor recommend?', o: ['Go to work', 'Stay in bed', 'Do exercise'], a: 1 }
        ]
      },
      writing: { prompt: 'Un amigo está estresado y duerme mal. Escríbele 4 consejos usando "should".', min: 35, keywords: ['should', "shouldn't", 'you'] }
    },

    /* ------------------------------ B1 ------------------------------ */
    {
      id: 'b1u1', level: 'B1', title: 'Trabajo y profesiones', icon: '💼',
      tip: {
        title: 'Presente perfecto',
        html: `<p><b>have / has + participio</b>: <i>I <b>have worked</b> here for 5 years.</i></p>
        <p>Se usa para experiencias (<b>ever / never</b>), acciones que empezaron en el pasado y continúan (<b>for / since</b>) y resultados recientes (<b>just, already, yet</b>).</p>
        <table><tr><td><b>for</b></td><td>duración</td><td>for two years</td></tr>
        <tr><td><b>since</b></td><td>punto de inicio</td><td>since 2019</td></tr></table>
        <p>⚠️ No lo uses con tiempo terminado: "I have seen him yesterday" ❌ → "I saw him yesterday" ✅</p>`
      },
      vocab: [['job', 'trabajo', '💼'], ['boss', 'jefe', '👔'], ['salary', 'salario', '💰'], ['meeting', 'reunión', '👥'], ['interview', 'entrevista', '🎙️'], ['colleague', 'colega', '🧑‍💼'], ['skills', 'habilidades', '🛠️'], ['office', 'oficina', '🏢']],
      sentences: [
        ['I have worked here for three years.', 'He trabajado aquí durante tres años.', "I've worked here for three years."],
        ['Have you ever had a job interview?', '¿Alguna vez has tenido una entrevista de trabajo?'],
        ['She has just finished the report.', 'Ella acaba de terminar el informe.'],
        ["We haven't had the meeting yet.", 'Todavía no hemos tenido la reunión.', 'We have not had the meeting yet.'],
        ['My boss has lived in London since 2015.', 'Mi jefe ha vivido en Londres desde 2015.'],
        ['I am responsible for customer service.', 'Soy responsable del servicio al cliente.', "I'm responsible for customer service."]
      ],
      grammar: [
        { q: 'I have known her ___ 2010.', o: ['for', 'since', 'during'], a: 1, e: 'Punto de inicio → since.' },
        { q: 'Have you ___ been to Canada?', o: ['ever', 'yet', 'already'], a: 0, e: 'Para experiencias en preguntas: ever.' },
        { q: 'She ___ the email yesterday.', o: ['has sent', 'sent', 'have sent'], a: 1, e: '"Yesterday" es tiempo terminado → pasado simple.' },
        { q: "I haven't finished ___.", o: ['already', 'yet', 'just'], a: 1, e: '"Yet" va al final en negativas y preguntas.' }
      ],
      reading: {
        title: 'A career change',
        text: "Daniel has been an accountant for ten years, but he has never really enjoyed it. Last year he started a cooking course in the evenings. Since then, he has prepared dinners for friends and has even won a small competition. He has just applied for a job at a famous restaurant. He hasn't received an answer yet, but he feels optimistic.",
        qs: [
          { q: 'What is Daniel\'s current job?', o: ['Chef', 'Accountant', 'Teacher'], a: 1 },
          { q: 'What has he just done?', o: ['Won a competition', 'Applied for a job', 'Opened a restaurant'], a: 1 },
          { q: 'How does he feel?', o: ['Optimistic', 'Worried', 'Angry'], a: 0 }
        ]
      },
      writing: { prompt: 'Escribe sobre tu experiencia laboral o de estudios usando el presente perfecto (for, since, ever, already).', min: 50, keywords: ['have', 'since', 'for'] }
    },
    {
      id: 'b1u2', level: 'B1', title: 'Planes y futuro', icon: '🔮',
      tip: {
        title: 'Will vs. going to',
        html: `<p><b>Going to</b>: planes ya decididos y predicciones con evidencia. <i>I'm <b>going to</b> study medicine. Look at the clouds! It's <b>going to</b> rain.</i></p>
        <p><b>Will</b>: decisiones espontáneas, promesas, ofertas y predicciones de opinión. <i>I'<b>ll</b> help you. I think it <b>will</b> be fine.</i></p>
        <p><b>Presente continuo</b> para citas fijas: <i>I'm <b>meeting</b> John tomorrow.</i></p>`
      },
      vocab: [['future', 'futuro', '🔮'], ['plan', 'plan', '📋'], ['goal', 'meta', '🎯'], ['dream', 'sueño', '💭'], ['tomorrow', 'mañana', '📆'], ['promise', 'promesa', '🤞'], ['weekend', 'fin de semana', '🏝️'], ['holiday', 'vacaciones', '🌴']],
      sentences: [
        ["I'm going to learn to drive next year.", 'Voy a aprender a conducir el próximo año.', 'I am going to learn to drive next year.'],
        ["I'll call you later.", 'Te llamaré más tarde.', 'I will call you later.'],
        ['I think it will rain tomorrow.', 'Creo que lloverá mañana.'],
        ["We're meeting our friends on Saturday.", 'Nos vamos a ver con nuestros amigos el sábado.', 'We are meeting our friends on Saturday.'],
        ['What are you going to do this weekend?', '¿Qué vas a hacer este fin de semana?'],
        ['I promise I will be on time.', 'Prometo que llegaré a tiempo.', "I promise I'll be on time."]
      ],
      grammar: [
        { q: 'The phone is ringing. — I ___ answer it!', o: ["'ll", "'m going to", 'answer'], a: 0, e: 'Decisión espontánea → will.' },
        { q: 'We ___ visit Grandma next Sunday. It\'s all planned.', o: ['will', 'are going to', 'go'], a: 1, e: 'Plan decidido → going to.' },
        { q: 'Look at that car! It ___ crash!', o: ['will', 'is going to', 'crashes'], a: 1, e: 'Predicción con evidencia → going to.' },
        { q: 'I think robots ___ do many jobs in the future.', o: ['will', 'are', 'going'], a: 0, e: 'Predicción basada en opinión → will.' }
      ],
      reading: {
        title: 'New Year\'s resolutions',
        text: "This year Mia has some big plans. She's going to run a half marathon in April, so she has started training three times a week. She's also going to save money for a trip to Japan. Her friends think she will succeed because she is very determined. Mia says: \"I won't give up this time. I promise!\"",
        qs: [
          { q: 'What is Mia going to do in April?', o: ['Travel to Japan', 'Run a half marathon', 'Start a job'], a: 1 },
          { q: 'Why does she save money?', o: ['For a car', 'For a trip', 'For a house'], a: 1 },
          { q: 'What do her friends think?', o: ["She'll succeed", "She'll give up", "She's lazy"], a: 0 }
        ]
      },
      writing: { prompt: 'Escribe tus planes para el próximo año y algunas predicciones sobre tu futuro.', min: 50, keywords: ['going to', 'will', 'think'] }
    },
    {
      id: 'b1u3', level: 'B1', title: 'Experiencias y anécdotas', icon: '📖',
      tip: {
        title: 'Pasado continuo vs. pasado simple',
        html: `<p><b>Pasado continuo</b> (was/were + -ing): acción en progreso en el pasado. <i>I <b>was reading</b> at 9 p.m.</i></p>
        <p>Combinado con pasado simple para una acción que <u>interrumpe</u>: <i>I <b>was cooking</b> when the phone <b>rang</b>.</i></p>
        <p><b>While</b> + pasado continuo / <b>when</b> + pasado simple.</p>
        <p>Conectores para contar historias: <b>first, then, after that, suddenly, finally</b>.</p>`
      },
      vocab: [['suddenly', 'de repente', '⚡'], ['accident', 'accidente', '💥'], ['lucky', 'afortunado', '🍀'], ['scared', 'asustado', '😱'], ['surprise', 'sorpresa', '🎁'], ['memory', 'recuerdo', '🧠'], ['adventure', 'aventura', '🧗'], ['storm', 'tormenta', '⛈️']],
      sentences: [
        ['I was sleeping when the phone rang.', 'Estaba durmiendo cuando sonó el teléfono.'],
        ['While we were walking, it started to rain.', 'Mientras caminábamos, empezó a llover.'],
        ['Suddenly, the lights went out.', 'De repente, se apagaron las luces.'],
        ['What were you doing at eight?', '¿Qué estabas haciendo a las ocho?'],
        ['She was very lucky.', 'Ella tuvo mucha suerte.', 'She was really lucky.'],
        ['It was the best day of my life.', 'Fue el mejor día de mi vida.']
      ],
      grammar: [
        { q: 'I ___ TV when you called.', o: ['watched', 'was watching', 'am watching'], a: 1, e: 'Acción en progreso interrumpida → pasado continuo.' },
        { q: 'While she was driving, she ___ an accident.', o: ['saw', 'was seeing', 'sees'], a: 0, e: 'Acción corta que interrumpe → pasado simple.' },
        { q: 'They ___ playing football at 5 p.m.', o: ['was', 'were', 'are'], a: 1, e: 'They → were.' },
        { q: '___ I was cooking, he set the table.', o: ['When', 'While', 'During'], a: 1, e: 'Dos acciones largas simultáneas → while.' }
      ],
      reading: {
        title: 'A strange night',
        text: "It was a cold night in December. I was walking home from work and it was snowing heavily. Suddenly, I heard a strange noise behind me. I turned around, but nobody was there. I started walking faster. When I arrived home, I found a small cat sitting at my door. It was following me all the time! Now it lives with me and its name is Snowy.",
        qs: [
          { q: 'What was the weather like?', o: ['Sunny', 'Snowy', 'Rainy'], a: 1 },
          { q: 'What was making the noise?', o: ['A man', 'A cat', 'A dog'], a: 1 },
          { q: 'What happened to the animal?', o: ['It ran away', 'It lives with the writer', 'It went to a shelter'], a: 1 }
        ]
      },
      writing: { prompt: 'Cuenta una anécdota interesante o divertida usando pasado simple y pasado continuo.', min: 60, keywords: ['was', 'when', 'while'] }
    },
    {
      id: 'b1u4', level: 'B1', title: 'Tecnología', icon: '📱',
      tip: {
        title: 'Primer condicional',
        html: `<p><b>If + presente, will + verbo</b>: situaciones reales o posibles en el futuro.</p>
        <p><i><b>If</b> you <b>charge</b> your phone, it <b>will</b> work all day.</i></p>
        <p><b>Unless</b> = if not: <i>You won't pass <b>unless</b> you study.</i></p>
        <p>⚠️ Después de "if" NO se usa will: "If it will rain" ❌ → "If it rains" ✅</p>`
      },
      vocab: [['screen', 'pantalla', '🖥️'], ['battery', 'batería', '🔋'], ['password', 'contraseña', '🔑'], ['download', 'descargar', '⬇️'], ['website', 'sitio web', '🌐'], ['app', 'aplicación', '📲'], ['charger', 'cargador', '🔌'], ['keyboard', 'teclado', '⌨️']],
      sentences: [
        ['If you forget your password, you can reset it.', 'Si olvidas tu contraseña, puedes restablecerla.'],
        ["My phone's battery is dying.", 'La batería de mi teléfono se está acabando.', 'My phone battery is dying.'],
        ["If I finish early, I'll download the app.", 'Si termino temprano, descargaré la aplicación.', 'If I finish early, I will download the app.'],
        ['Could you lend me your charger?', '¿Me podrías prestar tu cargador?'],
        ["The website won't load.", 'El sitio web no carga.', 'The website will not load.'],
        ["Unless you save the file, you'll lose it.", 'A menos que guardes el archivo, lo perderás.', 'Unless you save the file, you will lose it.']
      ],
      grammar: [
        { q: 'If it ___ tomorrow, we will stay home.', o: ['will rain', 'rains', 'rained'], a: 1, e: 'Después de "if" → presente simple.' },
        { q: 'If you press this button, the screen ___ on.', o: ['turns', 'will turn', 'turned'], a: 1, e: 'Resultado futuro → will + verbo.' },
        { q: "You won't learn ___ you practise.", o: ['if', 'unless', 'when'], a: 1, e: 'Unless = si no.' },
        { q: 'If she ___ the bus, she will be late.', o: ['misses', 'will miss', 'miss'], a: 0, e: 'She → misses (presente simple).' }
      ],
      reading: {
        title: 'Digital detox',
        text: "Many people check their phones more than one hundred times a day. Experts say that if we spend too much time on screens, we will sleep worse and feel more stressed. A digital detox can help. If you turn off notifications and leave your phone in another room at night, you will probably notice the difference in a week. Try it, unless your job requires you to be connected!",
        qs: [
          { q: 'What happens if we spend too much time on screens?', o: ['We sleep better', 'We feel more stressed', 'We work faster'], a: 1 },
          { q: 'What does the text suggest at night?', o: ['Leave the phone in another room', 'Use the phone in bed', 'Charge it next to you'], a: 0 },
          { q: 'When might you see results?', o: ['In a day', 'In a week', 'In a year'], a: 1 }
        ]
      },
      writing: { prompt: '¿Cómo usas la tecnología? Escribe ventajas, desventajas y usa al menos dos frases con "if".', min: 60, keywords: ['if', 'will', 'phone'] }
    },

    /* ------------------------------ B2 ------------------------------ */
    {
      id: 'b2u1', level: 'B2', title: 'Medio ambiente', icon: '🌍',
      tip: {
        title: 'La voz pasiva',
        html: `<p><b>to be + participio</b>. Se usa cuando la acción es más importante que quien la realiza.</p>
        <table><tr><td>Presente</td><td>Plastic <b>is recycled</b>.</td></tr>
        <tr><td>Pasado</td><td>The forest <b>was destroyed</b>.</td></tr>
        <tr><td>Presente perfecto</td><td>Laws <b>have been passed</b>.</td></tr>
        <tr><td>Futuro / modales</td><td>Energy <b>will / must be saved</b>.</td></tr></table>
        <p>Para indicar quién: <b>by</b> — <i>The law was approved <b>by</b> the government.</i></p>`
      },
      vocab: [['pollution', 'contaminación', '🏭'], ['recycle', 'reciclar', '♻️'], ['climate change', 'cambio climático', '🌡️'], ['renewable', 'renovable', '☀️'], ['waste', 'residuos', '🗑️'], ['endangered', 'en peligro de extinción', '🐼'], ['drought', 'sequía', '🏜️'], ['flood', 'inundación', '🌊']],
      sentences: [
        ['Millions of tons of plastic are thrown away every year.', 'Millones de toneladas de plástico se tiran cada año.'],
        ['The forest was destroyed by a fire.', 'El bosque fue destruido por un incendio.'],
        ['More solar panels have been installed recently.', 'Se han instalado más paneles solares recientemente.'],
        ['Glass should be recycled separately.', 'El vidrio debería reciclarse por separado.'],
        ['Many species are endangered because of pollution.', 'Muchas especies están en peligro por la contaminación.'],
        ['A new law will be approved next month.', 'Una nueva ley será aprobada el próximo mes.']
      ],
      grammar: [
        { q: 'Paper ___ from trees.', o: ['makes', 'is made', 'is making'], a: 1, e: 'Pasiva en presente: is + participio.' },
        { q: 'The bridge ___ in 1990.', o: ['was built', 'built', 'has built'], a: 0, e: 'Pasiva en pasado: was + participio.' },
        { q: 'Thousands of trees ___ cut down this year.', o: ['has been', 'have been', 'were being been'], a: 1, e: 'Plural en presente perfecto: have been + participio.' },
        { q: 'The rubbish must ___ collected.', o: ['be', 'been', 'being'], a: 0, e: 'Modal + be + participio.' }
      ],
      reading: {
        title: 'The plastic problem',
        text: "Every minute, the equivalent of a truck full of plastic is dumped into the ocean. Much of this plastic is broken down into tiny pieces called microplastics, which are eaten by fish and eventually by humans. Several countries have banned single-use plastic bags, and new materials are being developed by scientists. However, experts argue that real change will only be achieved if consumption is reduced.",
        qs: [
          { q: 'What happens to microplastics?', o: ['They disappear', 'They are eaten by fish', 'They are recycled'], a: 1 },
          { q: 'What have several countries done?', o: ['Banned plastic bags', 'Built new oceans', 'Stopped fishing'], a: 0 },
          { q: 'According to experts, what is the key to real change?', o: ['New materials', 'Reducing consumption', 'More trucks'], a: 1 }
        ]
      },
      writing: { prompt: '¿Qué problemas ambientales hay en tu ciudad? Propón soluciones usando la voz pasiva.', min: 80, keywords: ['should be', 'is', 'pollution'] }
    },
    {
      id: 'b2u2', level: 'B2', title: 'Relaciones y emociones', icon: '💬',
      tip: {
        title: 'Segundo condicional y "wish"',
        html: `<p><b>If + pasado simple, would + verbo</b>: situaciones hipotéticas o imaginarias en el presente.</p>
        <p><i>If I <b>had</b> more time, I <b>would</b> travel more.</i></p>
        <p>Con "to be" se usa <b>were</b> para todos: <i>If I <b>were</b> you, I would apologize.</i></p>
        <p><b>I wish + pasado</b> = ojalá (presente): <i>I wish I <b>knew</b> the answer.</i></p>`
      },
      vocab: [['jealous', 'celoso', '😒'], ['proud', 'orgulloso', '🦁'], ['trust', 'confianza', '🤝'], ['argue', 'discutir', '🗯️'], ['apologize', 'disculparse', '🙏'], ['lonely', 'solo / solitario', '🥺'], ['grateful', 'agradecido', '🙌'], ['upset', 'molesto', '😤']],
      sentences: [
        ['If I were you, I would apologize.', 'Si yo fuera tú, me disculparía.', "If I were you, I'd apologize."],
        ['I wish I had more free time.', 'Ojalá tuviera más tiempo libre.'],
        ['She felt upset after the argument.', 'Se sintió molesta después de la discusión.'],
        ['Trust is the base of any relationship.', 'La confianza es la base de cualquier relación.', 'Trust is the foundation of any relationship.'],
        ['What would you do if you won the lottery?', '¿Qué harías si ganaras la lotería?'],
        ["I'm really proud of you.", 'Estoy muy orgulloso de ti.', 'I am really proud of you.']
      ],
      grammar: [
        { q: 'If I ___ rich, I would buy a big house.', o: ['am', 'were', 'will be'], a: 1, e: 'Segundo condicional con to be → were.' },
        { q: 'If she studied more, she ___ the exam.', o: ['will pass', 'would pass', 'passes'], a: 1, e: 'Resultado hipotético → would + verbo.' },
        { q: 'I wish I ___ speak Chinese.', o: ['can', 'could', 'will'], a: 1, e: 'Wish + pasado: can → could.' },
        { q: 'What would you do if you ___ a ghost?', o: ['see', 'saw', 'will see'], a: 1, e: 'If + pasado simple.' }
      ],
      reading: {
        title: 'Dear Advice Column',
        text: "\"My best friend and I had a big argument last week. She said I was jealous of her new job, and I said some things I regret. Now we don't speak. I miss her and I feel lonely.\" — Answer: \"If I were you, I would contact her first. Explain how you feel without blaming her. Friendships survive arguments when both people are willing to apologize. You might be surprised: she probably wishes she could talk to you too.\"",
        qs: [
          { q: 'Why did the friends argue?', o: ['About money', 'About a new job', 'About a boyfriend'], a: 1 },
          { q: 'What does the advisor recommend?', o: ['Wait for her friend', 'Contact her first', 'Find new friends'], a: 1 },
          { q: 'How does the writer feel now?', o: ['Lonely', 'Proud', 'Grateful'], a: 0 }
        ]
      },
      writing: { prompt: '¿Qué harías si pudieras cambiar algo de tu vida? Usa el segundo condicional y "I wish".', min: 80, keywords: ['would', 'if', 'wish'] }
    },
    {
      id: 'b2u3', level: 'B2', title: 'Noticias y medios', icon: '📰',
      tip: {
        title: 'Estilo indirecto (reported speech)',
        html: `<p>Al reportar lo que alguien dijo, el verbo suele "retroceder" un tiempo:</p>
        <table><tr><td>"I <b>am</b> tired."</td><td>She said she <b>was</b> tired.</td></tr>
        <tr><td>"I <b>will</b> call."</td><td>He said he <b>would</b> call.</td></tr>
        <tr><td>"We <b>have</b> finished."</td><td>They said they <b>had</b> finished.</td></tr>
        <tr><td>"I <b>saw</b> it."</td><td>He said he <b>had seen</b> it.</td></tr></table>
        <p><b>Say</b> vs <b>tell</b>: <i>She <b>said</b> (that)...</i> / <i>She <b>told me</b> (that)...</i> — "tell" necesita persona.</p>`
      },
      vocab: [['headline', 'titular', '🗞️'], ['journalist', 'periodista', '🧑‍💻'], ['fake news', 'noticias falsas', '🤥'], ['source', 'fuente', '🔎'], ['broadcast', 'transmitir', '📡'], ['announce', 'anunciar', '📢'], ['reliable', 'confiable', '✅'], ['article', 'artículo', '📄']],
      sentences: [
        ['The minister said that the economy was improving.', 'El ministro dijo que la economía estaba mejorando.'],
        ['She told me she would call later.', 'Me dijo que llamaría más tarde.'],
        ['The journalist asked where the money had gone.', 'El periodista preguntó adónde había ido el dinero.'],
        ['Always check if the source is reliable.', 'Siempre verifica si la fuente es confiable.'],
        ['They announced that the event had been cancelled.', 'Anunciaron que el evento había sido cancelado.'],
        ['Fake news spreads faster than real news.', 'Las noticias falsas se difunden más rápido que las reales.']
      ],
      grammar: [
        { q: '"I am busy." → He said he ___ busy.', o: ['is', 'was', 'were'], a: 1, e: 'Presente → pasado en estilo indirecto.' },
        { q: 'She ___ me that she was leaving.', o: ['said', 'told', 'spoke'], a: 1, e: '"Tell" + persona: told me.' },
        { q: '"We will win." → They said they ___ win.', o: ['will', 'would', 'won'], a: 1, e: 'Will → would.' },
        { q: '"I lost my keys." → He said he ___ his keys.', o: ['had lost', 'has lost', 'loses'], a: 0, e: 'Pasado simple → pasado perfecto.' }
      ],
      reading: {
        title: 'How to spot fake news',
        text: "A recent study found that false stories are shared on social media far more often than accurate ones. Researchers said that people tend to share content that surprises or angers them, without checking whether it is true. Experts recommend reading beyond the headline, checking the author and date, and comparing the story with reliable sources before sharing it.",
        qs: [
          { q: 'What did the study find?', o: ['Fake news is shared more', 'People rarely share news', 'Headlines are accurate'], a: 0 },
          { q: 'Why do people share false stories?', o: ['They check them', 'They surprise or anger them', 'They are paid'], a: 1 },
          { q: 'Which is NOT a recommendation?', o: ['Check the author', 'Read only the headline', 'Compare sources'], a: 1 }
        ]
      },
      writing: { prompt: 'Resume una noticia reciente usando estilo indirecto (said that, told, announced, asked).', min: 80, keywords: ['said', 'that', 'told'] }
    },
    {
      id: 'b2u4', level: 'B2', title: 'Negocios y phrasal verbs', icon: '📊',
      tip: {
        title: 'Phrasal verbs del mundo laboral',
        html: `<p>Un phrasal verb = verbo + partícula, con significado propio:</p>
        <table><tr><td><b>set up</b></td><td>establecer / montar</td></tr>
        <tr><td><b>carry out</b></td><td>llevar a cabo</td></tr>
        <tr><td><b>put off</b></td><td>posponer</td></tr>
        <tr><td><b>look into</b></td><td>investigar</td></tr>
        <tr><td><b>deal with</b></td><td>ocuparse de</td></tr>
        <tr><td><b>come up with</b></td><td>idear / proponer</td></tr></table>
        <p>💡 Aprende los phrasal verbs en contexto, con frases completas.</p>`
      },
      vocab: [['profit', 'ganancia', '📈'], ['loss', 'pérdida', '📉'], ['customer', 'cliente', '🧍'], ['deadline', 'fecha límite', '⏳'], ['negotiate', 'negociar', '🤝'], ['investment', 'inversión', '🏦'], ['launch', 'lanzar', '🚀'], ['budget', 'presupuesto', '🧾']],
      sentences: [
        ['We need to put off the meeting until Friday.', 'Necesitamos posponer la reunión hasta el viernes.'],
        ['She set up her own company in 2020.', 'Ella montó su propia empresa en 2020.'],
        ["We'll look into the problem immediately.", 'Investigaremos el problema de inmediato.', 'We will look into the problem immediately.'],
        ['The team came up with a brilliant idea.', 'El equipo propuso una idea brillante.'],
        ['Who is going to deal with this customer?', '¿Quién se va a ocupar de este cliente?'],
        ['We must not go over the budget.', 'No debemos pasarnos del presupuesto.']
      ],
      grammar: [
        { q: 'They decided to ___ the launch until next year.', o: ['put off', 'put on', 'put up'], a: 0, e: 'Put off = posponer.' },
        { q: 'We need someone to ___ customer complaints.', o: ['deal with', 'deal about', 'deal on'], a: 0, e: 'Deal with = ocuparse de.' },
        { q: 'The survey was ___ by an external company.', o: ['carried on', 'carried out', 'carried off'], a: 1, e: 'Carry out = llevar a cabo.' },
        { q: 'Can you ___ a better solution?', o: ['come up with', 'come with up', 'come across to'], a: 0, e: 'Come up with = idear.' }
      ],
      reading: {
        title: 'A start-up story',
        text: "Three years ago, two university friends set up a company that delivers healthy lunches to offices. At first, they made a loss, and they almost gave up. However, they looked into their customers' habits and came up with a subscription plan. Since then, profits have tripled. Next month they will launch their service in two new cities, although they had to put off their international expansion due to budget limits.",
        qs: [
          { q: 'What does the company do?', o: ['Sells computers', 'Delivers healthy lunches', 'Builds offices'], a: 1 },
          { q: 'What helped them succeed?', o: ['A subscription plan', 'A bank loan', 'A famous chef'], a: 0 },
          { q: 'Why did they postpone international expansion?', o: ['Lack of customers', 'Budget limits', 'Legal problems'], a: 1 }
        ]
      },
      writing: { prompt: 'Escribe un correo formal a tu equipo proponiendo una idea de negocio. Usa al menos 3 phrasal verbs.', min: 90, keywords: ['dear', 'regards', 'up'] }
    },

    /* ------------------------------ C1 ------------------------------ */
    {
      id: 'c1u1', level: 'C1', title: 'Debate y argumentación', icon: '🎤',
      tip: {
        title: 'Conectores avanzados e inversión',
        html: `<p>Conectores: <b>nevertheless</b> (sin embargo), <b>furthermore</b> (además), <b>whereas</b> (mientras que), <b>consequently</b> (en consecuencia), <b>notwithstanding</b> (no obstante), <b>provided that</b> (siempre que).</p>
        <p><b>Inversión</b> para dar énfasis después de expresiones negativas:</p>
        <p><i><b>Never have I</b> seen such a thing. <b>Not only does</b> it save money, but it also... <b>Rarely do</b> we agree.</i></p>`
      },
      vocab: [['argue', 'argumentar', '🗣️'], ['evidence', 'evidencia', '🔬'], ['nevertheless', 'sin embargo', '↔️'], ['furthermore', 'además', '➕'], ['bias', 'sesgo', '⚖️'], ['claim', 'afirmación', '📣'], ['outweigh', 'superar / pesar más', '🏋️'], ['controversial', 'polémico', '🔥']],
      sentences: [
        ['Not only is it cheaper, but it is also more efficient.', 'No solo es más barato, sino que también es más eficiente.'],
        ['Never have I heard such a convincing argument.', 'Nunca he escuchado un argumento tan convincente.'],
        ['The benefits clearly outweigh the risks.', 'Los beneficios claramente superan los riesgos.'],
        ['There is little evidence to support that claim.', 'Hay poca evidencia que respalde esa afirmación.'],
        ['Nevertheless, the proposal remains controversial.', 'Sin embargo, la propuesta sigue siendo polémica.'],
        ['Provided that we act now, the damage can be reversed.', 'Siempre que actuemos ahora, el daño puede revertirse.']
      ],
      grammar: [
        { q: 'Rarely ___ such dedication.', o: ['I have seen', 'have I seen', 'I saw'], a: 1, e: 'Tras "rarely" al inicio → inversión: have I seen.' },
        { q: 'The plan is expensive; ___, it is necessary.', o: ['furthermore', 'nevertheless', 'whereas'], a: 1, e: 'Contraste → nevertheless.' },
        { q: 'Not only ___ late, but he also forgot the documents.', o: ['he arrived', 'did he arrive', 'arrived he'], a: 1, e: 'Not only + auxiliar + sujeto: did he arrive.' },
        { q: 'Some prefer the city, ___ others love the countryside.', o: ['whereas', 'consequently', 'furthermore'], a: 0, e: 'Contraste entre dos ideas → whereas.' }
      ],
      reading: {
        title: 'Should university be free?',
        text: "Advocates of free higher education claim that it promotes social mobility and, furthermore, produces a more skilled workforce. Critics, nevertheless, argue that the costs would fall disproportionately on taxpayers who never attend university. Not only would public spending rise sharply, but the quality of teaching might also decline. Whereas both sides agree that education is vital, they differ on who should pay for it.",
        qs: [
          { q: 'What do advocates claim?', o: ['It reduces taxes', 'It promotes social mobility', 'It lowers quality'], a: 1 },
          { q: 'What is a concern of critics?', o: ['Taxpayers pay unfairly', 'Too few teachers', 'Students are lazy'], a: 0 },
          { q: 'What do both sides agree on?', o: ['Who should pay', 'Education is vital', 'University should be free'], a: 1 }
        ]
      },
      writing: { prompt: 'Escribe un ensayo de opinión: ¿Debería prohibirse el uso del celular en las escuelas? Usa conectores avanzados.', min: 120, keywords: ['however', 'furthermore', 'therefore'] }
    },
    {
      id: 'c1u2', level: 'C1', title: 'Ciencia y cultura', icon: '🔬',
      tip: {
        title: 'Tercer condicional y condicionales mixtos',
        html: `<p><b>Tercer condicional</b>: pasado irreal. <i>If I <b>had studied</b>, I <b>would have passed</b>.</i></p>
        <p><b>Mixto</b> (pasado → presente): <i>If I <b>had taken</b> the job, I <b>would be</b> rich now.</i></p>
        <p><b>Mixto</b> (presente → pasado): <i>If I <b>were</b> braver, I <b>would have spoken</b> up.</i></p>
        <p>💡 Forma corta: I'd have = I would have. "Had" puede invertirse: <i><b>Had I known</b>, I would have come.</i></p>`
      },
      vocab: [['breakthrough', 'avance decisivo', '💡'], ['research', 'investigación', '🧪'], ['heritage', 'patrimonio', '🏛️'], ['discovery', 'descubrimiento', '🔭'], ['hypothesis', 'hipótesis', '❓'], ['ancient', 'antiguo', '🏺'], ['masterpiece', 'obra maestra', '🖼️'], ['innovation', 'innovación', '⚙️']],
      sentences: [
        ['If Fleming had not noticed the mould, penicillin might not exist.', 'Si Fleming no hubiera notado el moho, la penicilina quizás no existiría.'],
        ['Had I known, I would have come earlier.', 'De haberlo sabido, habría venido antes.', 'If I had known, I would have come earlier.'],
        ['The discovery was a major breakthrough in medicine.', 'El descubrimiento fue un gran avance en la medicina.'],
        ['This ancient temple is part of our cultural heritage.', 'Este templo antiguo es parte de nuestro patrimonio cultural.'],
        ['If she had taken that job, she would be living abroad now.', 'Si hubiera aceptado ese trabajo, ahora estaría viviendo en el extranjero.'],
        ['The research confirmed the original hypothesis.', 'La investigación confirmó la hipótesis original.']
      ],
      grammar: [
        { q: 'If they had left earlier, they ___ the train.', o: ['would catch', 'would have caught', 'had caught'], a: 1, e: 'Tercer condicional: would have + participio.' },
        { q: '___ I known about the problem, I would have helped.', o: ['If', 'Had', 'Have'], a: 1, e: 'Inversión: Had I known = If I had known.' },
        { q: 'If I had saved money, I ___ a car now.', o: ['would have', 'would have had', 'will have'], a: 0, e: 'Mixto: pasado → resultado presente (would + verbo).' },
        { q: 'If he were more careful, he ___ that mistake yesterday.', o: ['wouldn\'t make', 'wouldn\'t have made', 'didn\'t make'], a: 1, e: 'Mixto: rasgo presente → resultado pasado.' }
      ],
      reading: {
        title: 'Accidental discoveries',
        text: "Many of history's greatest breakthroughs were accidents. Had Alexander Fleming cleaned his laboratory before going on holiday, he would never have discovered penicillin. Similarly, the microwave oven exists because an engineer noticed that a chocolate bar had melted in his pocket while he was working with radar equipment. If these scientists had ignored such anomalies, modern life would look very different.",
        qs: [
          { q: 'How was penicillin discovered?', o: ['Through careful planning', 'By accident', 'On holiday in a lab'], a: 1 },
          { q: 'What gave the idea for the microwave?', o: ['A melted chocolate bar', 'A broken radio', 'A hot coffee'], a: 0 },
          { q: 'What is the main idea?', o: ['Scientists are careless', 'Paying attention to anomalies matters', 'Holidays are important'], a: 1 }
        ]
      },
      writing: { prompt: 'Reflexiona sobre una decisión importante de tu vida: ¿qué habría pasado si hubieras elegido diferente? Usa condicionales mixtos.', min: 120, keywords: ['would have', 'if', 'had'] }
    },
    {
      id: 'c1u3', level: 'C1', title: 'Expresiones idiomáticas', icon: '🎭',
      tip: {
        title: 'Idioms frecuentes',
        html: `<table><tr><td><b>break the ice</b></td><td>romper el hielo</td></tr>
        <tr><td><b>a piece of cake</b></td><td>pan comido</td></tr>
        <tr><td><b>hit the nail on the head</b></td><td>dar en el clavo</td></tr>
        <tr><td><b>under the weather</b></td><td>indispuesto / enfermo</td></tr>
        <tr><td><b>once in a blue moon</b></td><td>muy de vez en cuando</td></tr>
        <tr><td><b>cost an arm and a leg</b></td><td>costar un ojo de la cara</td></tr>
        <tr><td><b>let the cat out of the bag</b></td><td>revelar un secreto</td></tr></table>
        <p>💡 Los idioms no se traducen palabra por palabra: apréndelos como bloques.</p>`
      },
      vocab: [['a piece of cake', 'pan comido', '🍰'], ['break the ice', 'romper el hielo', '🧊'], ['under the weather', 'indispuesto', '🤧'], ['once in a blue moon', 'muy rara vez', '🌕'], ['cost an arm and a leg', 'costar un ojo de la cara', '💸'], ['hit the nail on the head', 'dar en el clavo', '🔨'], ['spill the beans', 'soltar la sopa', '🫘'], ['on cloud nine', 'en las nubes de felicidad', '☁️']],
      sentences: [
        ['The exam was a piece of cake.', 'El examen fue pan comido.'],
        ['He told a joke to break the ice.', 'Contó un chiste para romper el hielo.'],
        ["I'm feeling a bit under the weather today.", 'Hoy me siento un poco indispuesto.', 'I am feeling a bit under the weather today.'],
        ['We only eat out once in a blue moon.', 'Solo comemos fuera muy rara vez.'],
        ['That new car cost an arm and a leg.', 'Ese coche nuevo costó un ojo de la cara.'],
        ['You hit the nail on the head.', 'Diste en el clavo.']
      ],
      grammar: [
        { q: 'She was ___ after getting the job. (muy feliz)', o: ['on cloud nine', 'under the weather', 'in hot water'], a: 0, e: 'On cloud nine = extremadamente feliz.' },
        { q: "Don't ___! It's a surprise party.", o: ['break the ice', 'spill the beans', 'hit the nail'], a: 1, e: 'Spill the beans = revelar un secreto.' },
        { q: 'This test is ___. I finished in 5 minutes.', o: ['a piece of cake', 'once in a blue moon', 'an arm and a leg'], a: 0, e: 'A piece of cake = muy fácil.' },
        { q: 'I visit my cousins ___, maybe once every two years.', o: ['on cloud nine', 'once in a blue moon', 'under the weather'], a: 1, e: 'Once in a blue moon = muy rara vez.' }
      ],
      reading: {
        title: 'First day at a new job',
        text: "On my first day at the agency I was nervous, but my manager broke the ice by telling a funny story about her own first day. The tasks were a piece of cake, although I was slightly under the weather. At lunch, a colleague nearly spilled the beans about a surprise party for our boss. When I suggested a new slogan for a client, everyone said I had hit the nail on the head. I went home on cloud nine.",
        qs: [
          { q: 'How did the manager break the ice?', o: ['With a funny story', 'With a gift', 'With a meeting'], a: 0 },
          { q: 'What did the colleague almost reveal?', o: ['A salary', 'A surprise party', 'A new client'], a: 1 },
          { q: 'How did the writer feel at the end of the day?', o: ['Very happy', 'Exhausted', 'Disappointed'], a: 0 }
        ]
      },
      writing: { prompt: 'Escribe una historia corta (real o inventada) que incluya al menos 4 expresiones idiomáticas.', min: 120, keywords: ['piece of cake', 'ice', 'weather'] }
    }
  ];

  /* ------------------ PRUEBA DE NIVEL ------------------
     4 preguntas por nivel. Se avanza al siguiente nivel con ≥3 aciertos. */
  const PLACEMENT = {
    A1: [
      { skill: 'grammar', q: 'Elige la opción correcta: "She ___ my sister."', o: ['are', 'is', 'am', 'be'], a: 1 },
      { skill: 'vocab', q: '¿Qué significa "kitchen"?', o: ['Cocina', 'Pollo', 'Niño', 'Cuarto'], a: 0 },
      { skill: 'listening', audio: 'I have two brothers and one sister.', q: '¿Qué escuchaste?', o: ['I have two brothers and one sister.', 'I have two sisters and one brother.', 'I had two brothers.', 'I love my brothers.'], a: 0 },
      { skill: 'reading', text: 'My name is Ana. I am a nurse. I work in a hospital in Lima.', q: 'Where does Ana work?', o: ['In a school', 'In a hospital', 'In a shop', 'At home'], a: 1 }
    ],
    A2: [
      { skill: 'grammar', q: 'Yesterday I ___ to the cinema.', o: ['go', 'goes', 'went', 'gone'], a: 2 },
      { skill: 'grammar', q: 'This book is ___ than that one.', o: ['more interesting', 'interestinger', 'most interesting', 'more interestinger'], a: 0 },
      { skill: 'listening', audio: 'Turn left at the bank and the hotel is on your right.', q: '¿Dónde está el hotel?', o: ['Girando a la izquierda en el banco, a la derecha', 'Enfrente del banco', 'Al lado del parque', 'Girando a la derecha en el banco'], a: 0 },
      { skill: 'reading', text: 'Last weekend Tom was ill. He had a fever, so he stayed in bed and didn\'t go to the party.', q: 'Why didn\'t Tom go to the party?', o: ['He was working', 'He was ill', 'He forgot', 'He was travelling'], a: 1 }
    ],
    B1: [
      { skill: 'grammar', q: 'I have lived here ___ 2018.', o: ['for', 'since', 'from', 'during'], a: 1 },
      { skill: 'grammar', q: 'If it ___ tomorrow, we will cancel the trip.', o: ['will rain', 'rains', 'rained', 'raining'], a: 1 },
      { skill: 'listening', audio: "I was having a shower when somebody knocked on the door.", q: 'What was the person doing?', o: ['Opening the door', 'Having a shower', 'Sleeping', 'Cooking'], a: 1 },
      { skill: 'reading', text: "Although the company's profits increased, many employees were unhappy because their salaries hadn't changed in years.", q: 'Why were employees unhappy?', o: ['Profits fell', 'Salaries had not increased', 'They worked too much', 'The company closed'], a: 1 }
    ],
    B2: [
      { skill: 'grammar', q: 'The new bridge ___ next year.', o: ['will build', 'will be built', 'is building', 'builds'], a: 1 },
      { skill: 'grammar', q: 'If I ___ you, I would accept the offer.', o: ['am', 'was being', 'were', 'will be'], a: 2 },
      { skill: 'listening', audio: 'She told me that she had already sent the report to the manager.', q: '¿Qué dijo ella?', o: ['Que enviaría el informe', 'Que ya había enviado el informe', 'Que no tenía el informe', 'Que el gerente envió el informe'], a: 1 },
      { skill: 'vocab', q: 'We need to ___ the meeting until next week. (posponer)', o: ['put off', 'put on', 'take off', 'carry out'], a: 0 }
    ],
    C1: [
      { skill: 'grammar', q: 'Never ___ such a beautiful sunset.', o: ['I have seen', 'have I seen', 'I saw', 'seen I have'], a: 1 },
      { skill: 'grammar', q: 'If she had taken the job, she ___ in Paris now.', o: ['would live', 'would have lived', 'will live', 'had lived'], a: 0 },
      { skill: 'vocab', q: '"The exam was a piece of cake" significa que el examen fue...', o: ['Muy difícil', 'Muy fácil', 'Delicioso', 'Muy largo'], a: 1 },
      { skill: 'reading', text: 'Notwithstanding the considerable investment, the project failed to deliver the anticipated outcomes, prompting a thorough review of its management.', q: 'What happened after the project failed?', o: ['More money was invested', 'Its management was reviewed', 'It was celebrated', 'It was copied'], a: 1 }
    ]
  };

  const PLACEMENT_SPEAK = {
    A1: 'Hello, my name is Maria and I am from Spain.',
    A2: 'Last weekend I went to the beach with my friends.',
    B1: 'I have been studying English for three years.',
    B2: 'If I were you, I would think carefully before deciding.',
    C1: 'Not only did they finish early, but they also exceeded expectations.'
  };

  /* ------------------ CONVERSACIONES ------------------ */
  const DIALOGUES = [
    {
      id: 'cafe', level: 'A1', title: 'En la cafetería', icon: '☕',
      turns: [
        { bot: 'Hi! What can I get for you?', es: '¡Hola! ¿Qué te sirvo?', o: ["Can I have a coffee, please?", 'I am a coffee.', 'Yes, I can.'], a: 0 },
        { bot: 'Sure. Small, medium or large?', es: 'Claro. ¿Pequeño, mediano o grande?', o: ['Yes, please.', 'Medium, please.', 'I am medium.'], a: 1 },
        { bot: 'Would you like anything to eat?', es: '¿Quieres algo de comer?', o: ['No, thank you.', 'I eat yesterday.', 'Is good.'], a: 0 },
        { bot: "That's four dollars, please.", es: 'Son cuatro dólares, por favor.', o: ['Here you are.', 'You are welcome.', 'Goodbye, coffee.'], a: 0 },
        { bot: 'Thank you! Have a nice day!', es: '¡Gracias! ¡Que tengas un buen día!', o: ['You too!', 'Me too!', 'Yes, I have.'], a: 0 }
      ]
    },
    {
      id: 'hotel', level: 'A2', title: 'Registro en el hotel', icon: '🏨',
      turns: [
        { bot: 'Good evening. Do you have a reservation?', es: 'Buenas noches. ¿Tiene una reservación?', o: ['Yes, under the name Garcia.', 'Yes, I reserve.', 'No, I am reservation.'], a: 0 },
        { bot: 'How many nights are you staying?', es: '¿Cuántas noches se va a quedar?', o: ['Three nights.', 'At night.', 'Yes, I stay.'], a: 0 },
        { bot: 'Can I see your passport, please?', es: '¿Puedo ver su pasaporte, por favor?', o: ['Of course, here it is.', 'I see it.', 'No passport is.'], a: 0 },
        { bot: 'Breakfast is served from seven to ten.', es: 'El desayuno se sirve de siete a diez.', o: ['Great. Where is the restaurant?', 'I serve breakfast.', 'Seven is ten.'], a: 0 },
        { bot: "It's on the first floor. Enjoy your stay!", es: 'Está en el primer piso. ¡Disfrute su estancia!', o: ['Thank you very much.', 'You enjoy.', 'Yes, floor.'], a: 0 }
      ]
    },
    {
      id: 'interview', level: 'B1', title: 'Entrevista de trabajo', icon: '💼',
      turns: [
        { bot: 'Thanks for coming. Could you tell me a bit about yourself?', es: 'Gracias por venir. ¿Podría hablarme un poco de usted?', o: ["Sure. I've worked in marketing for five years.", 'I am work in marketing since five years.', 'Yes, I could.'], a: 0 },
        { bot: 'Why do you want to work here?', es: '¿Por qué quiere trabajar aquí?', o: ["Because I admire your company's values.", 'Because yes.', 'I want work here because money.'], a: 0 },
        { bot: 'What is your greatest strength?', es: '¿Cuál es su mayor fortaleza?', o: ["I'm very organised and I work well in a team.", 'My strength is strong.', 'I have many strengths since years.'], a: 0 },
        { bot: 'Have you ever dealt with a difficult customer?', es: '¿Alguna vez ha tratado con un cliente difícil?', o: ['Yes. I listened carefully and found a solution.', 'Yes, I have deal yesterday.', 'Never I have.'], a: 0 },
        { bot: 'Do you have any questions for us?', es: '¿Tiene alguna pregunta para nosotros?', o: ['Yes, what would a typical day look like?', 'No questions are.', 'Yes, how much you pay?'], a: 0 }
      ]
    },
    {
      id: 'complaint', level: 'B2', title: 'Hacer una reclamación', icon: '📞',
      turns: [
        { bot: 'Customer service, how may I help you?', es: 'Servicio al cliente, ¿en qué puedo ayudarle?', o: ["I'm calling about an order that hasn't arrived.", 'I call because my order not arrive.', 'Help me now.'], a: 0 },
        { bot: 'I apologise for that. Could you give me the order number?', es: 'Lo siento. ¿Podría darme el número de pedido?', o: ["Certainly, it's 4-5-8-2-1.", 'Yes, I could.', 'The number is big.'], a: 0 },
        { bot: 'It seems it was sent to the wrong address.', es: 'Parece que fue enviado a la dirección equivocada.', o: ["That's frustrating. What can be done about it?", 'Is not my problem.', 'Wrong is the address.'], a: 0 },
        { bot: 'We can send a replacement or offer a full refund.', es: 'Podemos enviar un reemplazo u ofrecer un reembolso completo.', o: ["I'd prefer a refund, if that's possible.", 'I prefer that you refund me money yesterday.', 'Both, please, now.'], a: 0 },
        { bot: 'Done. The refund will be processed within five days.', es: 'Listo. El reembolso se procesará en cinco días.', o: ['Thank you for sorting it out so quickly.', 'Five days is many.', 'OK, bye bye bye.'], a: 0 }
      ]
    }
  ];

  const ACHIEVEMENTS = [
    { id: 'first_lesson', icon: '🎯', name: 'Primer paso', desc: 'Completa tu primera lección' },
    { id: 'perfect', icon: '💯', name: 'Perfección', desc: 'Termina una lección sin errores' },
    { id: 'streak3', icon: '🔥', name: 'En racha', desc: 'Racha de 3 días' },
    { id: 'streak7', icon: '⚡', name: 'Imparable', desc: 'Racha de 7 días' },
    { id: 'streak30', icon: '🌟', name: 'Leyenda', desc: 'Racha de 30 días' },
    { id: 'xp100', icon: '🥉', name: '100 XP', desc: 'Gana 100 puntos de experiencia' },
    { id: 'xp1000', icon: '🥇', name: '1000 XP', desc: 'Gana 1000 puntos de experiencia' },
    { id: 'unit', icon: '🏆', name: 'Unidad dominada', desc: 'Aprueba un repaso de unidad' },
    { id: 'speaker', icon: '🎙️', name: 'Orador', desc: 'Completa 20 ejercicios de pronunciación' },
    { id: 'writer', icon: '🖋️', name: 'Escritor', desc: 'Escribe 5 textos libres' },
    { id: 'words50', icon: '📚', name: 'Vocabulario', desc: 'Aprende 50 palabras' },
    { id: 'levelup', icon: '🚀', name: 'Subiste de nivel', desc: 'Completa un nivel completo' },
    { id: 'chat', icon: '💬', name: 'Conversador', desc: 'Completa una conversación' },
    { id: 'review', icon: '🧠', name: 'Memoria de acero', desc: 'Repasa tus errores' },
    { id: 'social', icon: '🤝', name: 'En equipo', desc: 'Agrega a un amigo para comparar progreso' },
    { id: 'verbs50', icon: '🔤', name: 'Maestro de verbos', desc: 'Domina 50 verbos' }
  ];

  const GOALS = [
    { id: 'travel', icon: '✈️', name: 'Viajar', target: 'B1' },
    { id: 'work', icon: '💼', name: 'Trabajo / carrera', target: 'B2' },
    { id: 'study', icon: '🎓', name: 'Estudios', target: 'B2' },
    { id: 'exam', icon: '📝', name: 'Examen oficial', target: 'C1' },
    { id: 'talk', icon: '💬', name: 'Conversar con personas', target: 'B1' },
    { id: 'culture', icon: '🎬', name: 'Series, música y cultura', target: 'B2' }
  ];

  return { LEVELS, LESSON_TYPES, SKILLS, UNITS, PLACEMENT, PLACEMENT_SPEAK, DIALOGUES, ACHIEVEMENTS, GOALS };
})();
