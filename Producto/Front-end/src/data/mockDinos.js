/* ─────────────────────────────────────────────────────────
   Datos mock con tema de dinosaurios — público: niños
   ───────────────────────────────────────────────────────── */

export const MOCK_SUMMARY = {
  title: '¡El Mundo de los Dinosaurios!',
  readTime: '3 min de lectura',
  tags: ['🦕 Jurásico', '🦖 Carnívoros', '🌿 Herbívoros', '☄️ Extinción'],
  highlights: [
    '¡Los dinosaurios vivieron hace MÁS de 65 millones de años, mucho antes que los humanos!',
    'Había dinosaurios de todos los tamaños: algunos tan grandes como un edificio y otros del tamaño de un pollo. 🐔',
    'Los pájaros de hoy en día son los descendientes de los dinosaurios. ¡Así que los dinos no desaparecieron del todo! 🐦',
  ],
  sections: [
    {
      heading: '¿Qué eran los dinosaurios?',
      emoji: '🦴',
      body: 'Los dinosaurios eran reptiles gigantes que vivieron en la Tierra hace millones y millones de años. ¡Algunos eran tan enormes como un edificio de 5 pisos! Pero no todos eran gigantes: el Microraptor era del tamaño de un cuervo. ¡Imagínate un dinosaurio que cabe en tu mochila!',
    },
    {
      heading: '¿Qué comían?',
      emoji: '🌿',
      body: 'Había dos tipos: los herbívoros, que solo comían plantas, y los carnívoros, que cazaban otros animales. El Braquiosaurio estiraba su larguísimo cuello para alcanzar las hojas más altas de los árboles. ¡El T-Rex, en cambio, tenía dientes tan grandes como plátanos y podía comerse un animal entero de un mordisco! 🍌',
    },
    {
      heading: '¿Por qué desaparecieron?',
      emoji: '☄️',
      body: 'Hace 65 millones de años, un meteorito GIGANTE chocó contra la Tierra. Era tan enorme como una ciudad. El impacto levantó tanto polvo que tapó el sol, cambió el clima y los dinosaurios no pudieron sobrevivir. ¡Pero sus parientes, los pájaros, sí lo lograron! ¿Sabías que cada vez que ves un pájaro estás viendo a un dinosaurio vivo? 🐦',
    },
  ],
};

export const MOCK_TRIVIA = {
  title: '¡Trivia de Dinosaurios!',
  questions: [
    {
      id: 1,
      text: '¿Hace cuánto tiempo vivieron los dinosaurios?',
      options: [
        '100 años atrás',
        '1,000 años atrás',
        'Más de 65 millones de años',
        'Hace 1 millón de años',
      ],
      correct: 2,
      explanation: '¡Correcto! Los dinosaurios vivieron hace más de 65 millones de años. ¡Eso es muchísimo tiempo antes de que existieran los humanos! 🕰️',
    },
    {
      id: 2,
      text: '¿Cómo se llama el dinosaurio carnívoro más famoso?',
      options: ['Braquiosaurio 🦕', 'Triceratops 🔱', 'T-Rex 🦖', 'Estegosaurio 🦔'],
      correct: 2,
      explanation: '¡El T-Rex! Su nombre completo es Tyrannosaurus Rex. Tenía dientes del tamaño de plátanos y unos brazos muy, muy cortitos. 🦖🍌',
    },
    {
      id: 3,
      text: '¿Qué comía el Braquiosaurio?',
      options: [
        'Carne de otros dinosaurios 🥩',
        'Hojas y plantas de los árboles 🌿',
        'Peces del mar 🐟',
        'Insectos y bichos 🪲',
      ],
      correct: 1,
      explanation: '¡El Braquiosaurio era herbívoro! Estiraba su larguísimo cuello para alcanzar las hojas más altas. ¡Era como una jirafa gigante! 🌿',
    },
    {
      id: 4,
      text: '¿Qué causó que los dinosaurios desaparecieran?',
      options: [
        'Una gran inundación 🌊',
        'Un meteorito gigante ☄️',
        'Muchísimo frío ❄️',
        'Cazadores con arcos 🏹',
      ],
      correct: 1,
      explanation: '¡Un meteorito enorme chocó contra la Tierra! Era tan grande como una ciudad. El impacto tapó el sol con polvo y cambió el clima de todo el planeta. ☄️💥',
    },
    {
      id: 5,
      text: '¿Qué animales de hoy en día son parientes de los dinosaurios?',
      options: ['Los cocodrilos 🐊', 'Los elefantes 🐘', 'Los pájaros 🐦', 'Los tiburones 🦈'],
      correct: 2,
      explanation: '¡Los pájaros son los parientes vivos de los dinosaurios! Los científicos los llaman "dinosaurios con plumas". ¡Así que los dinos no desaparecieron del todo! 🐦✨',
    },
  ],
};

export const LOADING_STEPS = {
  summary: [
    { msg: '¡Abriendo el documento!',         icon: '📖' },
    { msg: 'Buscando datos de dinosaurios…',  icon: '🦕' },
    { msg: '¡Tu resumen está listo!',          icon: '✨' },
  ],
  trivia: [
    { msg: 'Leyendo sobre dinosaurios…',      icon: '🦖' },
    { msg: 'Preparando las preguntas…',        icon: '🧠' },
    { msg: '¡Tu trivia está lista!',           icon: '🎮' },
  ],
};
