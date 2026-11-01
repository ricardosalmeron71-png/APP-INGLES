# 🦉 EnglishUp — App para aprender y practicar inglés

Aplicación móvil (PWA) para aprender inglés al estilo de las apps de idiomas más populares.
Funciona en **Android y iPhone** desde el navegador, se **instala como una app** en la pantalla de inicio
y funciona **sin conexión**. No necesita tiendas de aplicaciones ni servidor.

## ✨ Funciones

| Área | Qué incluye |
|---|---|
| 👤 **Registro** | Cuenta con nombre, correo y contraseña (cifrada con SHA‑256 + sal), varios usuarios por dispositivo, avatar. |
| 🎯 **Diagnóstico inicial** | Objetivo (viajar, trabajo, examen…), autoevaluación, meta diaria y **prueba de nivel adaptativa** A1→C1 que evalúa gramática, vocabulario, comprensión auditiva, lectura, **pronunciación** y **escritura**. |
| 🗺️ **Plan personalizado** | Meta diaria de XP, semana tipo enfocada en tus habilidades débiles, fecha estimada para llegar a tu nivel objetivo y recomendaciones. |
| 🛤️ **Camino de aprendizaje** | 5 niveles (A1, A2, B1, B2, C1) → 20 unidades → **140 lecciones**. Cada unidad tiene 7 tipos de lección: 📚 Vocabulario, 🧩 Gramática, 🎧 Escucha, 🎤 Habla, ✍️ Escritura, 📖 Lectura y 🏆 Repaso. Se desbloquean en orden y **se pueden repetir** cuando quieras. |
| 🧠 **Ejercicios** | Tarjetas con imagen, elegir imagen, opción múltiple, unir parejas, completar huecos, ordenar palabras, traducir escribiendo, dictado, escuchar y elegir, pronunciar, leer y responder, escritura libre. Los errores se repiten al final de la lección. |
| 🎤 **Análisis de voz** | Reconocimiento de voz del teléfono → puntuación 0‑100, palabras bien/mal pronunciadas resaltadas y consejos específicos para hispanohablantes (TH, V/B, “es‑”, ‑ED…). Si el navegador no lo permite, te grabas y te comparas con el modelo. |
| ✍️ **Análisis de escritura** | Detecta errores típicos (I minúscula, “people is”, “I have 20 years”, “he don’t”, “did went”, “more better”, a/an, preposiciones, falsos amigos…), ortografía, mayúsculas, puntuación, repeticiones, longitud, variedad de vocabulario, conectores y uso de las estructuras de la lección. |
| 🔊 **Audio** | Todo el inglés se puede escuchar (normal y 🐢 lento), acento 🇺🇸 / 🇬🇧 / 🇦🇺 y velocidad ajustables. |
| 💪 **Práctica** | Repaso de errores, tarjetas con **repetición espaciada** (Leitner), práctica por habilidad, laboratorio de voz, laboratorio de escritura, **conversaciones simuladas** (cafetería, hotel, entrevista, reclamación) y guía gramatical con buscador. |
| 🔥 **Motivación diaria** | Misiones del día (3, distintas cada día) con cofre sorpresa, racha con semana visible y protectores, aviso cuando la racha está en peligro, rangos de jugador (Semilla → Sabio), hitos de racha con bonificación, palabra del día, resumen semanal con meta y **Práctica rápida de 5 minutos** que mezcla vocabulario, verbos, gramática y pronunciación. Diseñado para premiar, no para presionar. |
| 🎙️ **Entrenador de pronunciación** | 14 sonidos difíciles para hispanohablantes (TH, V/B, i corta/larga, SH/CH, J/Y, s+consonante, -ED, consonantes finales, H, R, a/u/o cortas, -NG, letras mudas). Escucha lo que dices, detecta *qué* sonido fallaste ("dijiste *sink* en vez de *think*"), explica cómo hacerlo y deja reintentar 3 veces. Pares mínimos para entrenar el oído, trabalenguas con récord, diagnóstico, práctica diaria de 3 minutos adaptada a tus sonidos más débiles y repaso de palabras difíciles. |
| 🔤 **Verbos** | 734 verbos (186 irregulares y 548 regulares) con presente, 3ª persona, pasado, participio y gerundio. Consulta con buscador en inglés o español y por cualquier forma; si un verbo no está, calcula sus formas regulares. Juegos mixtos, escritos (ortografía exacta) y orales (dictado y pronunciación), unir parejas, sonido de -ed, contrarreloj de 60 s con récord, grupos por nivel y por patrón, y repaso espaciado por verbo. |
| 🤖 **Tutor con IA** *(requiere nube)* | Conversaciones reales por voz con Emma 🇬🇧, Jake 🇺🇸 u Olivia 🇦🇺 en 9 situaciones (o tema propio). Responden con naturalidad, corrigen cada frase con explicación en español, sugieren respuestas, tienen modo manos libres y al final evalúan fluidez, gramática y vocabulario. Los temas propios se guardan para toda la comunidad. La voz queda en la caja de texto para revisarla y tocar *Enviar* (o modo manos libres). Usa Claude Haiku 5.5 con límite de 50 mensajes al día por usuario para gastar lo mínimo. |
| 👥 **Perfil de amigos** | Perfil completo de cada amigo: niveles, objetivo, actividad de 7 días, habilidades, avance por nivel, logros y evolución de su escritura. |
| 🏆 **Ranking y comparación** | Ranking por XP de la semana, XP total, nivel o racha. Incluye a los usuarios del mismo teléfono y a los amigos que compartan su progreso por enlace (WhatsApp, etc.). Pantalla “Tú vs. amigo” con niveles, estadísticas, radar de habilidades superpuesto y avance por nivel. |
| 📊 **Progreso** | Nivel certificado y nivel en estudio, XP, racha 🔥 con protectores, gráfico de 7 días, calendario de actividad, radar de habilidades, avance por nivel, evolución de la escritura y 14 logros. |
| ⚙️ **Perfil** | Cambiar objetivo/meta, repetir prueba de nivel, modo oscuro, sonidos, exportar/importar copia de seguridad, cerrar sesión y eliminar cuenta. |

## 📱 Cómo usarla en el teléfono

1. **Publícala** (gratis) con GitHub Pages: en el repositorio ve a *Settings → Pages → Branch*, elige la rama
   con la app y la carpeta `/ (root)`, y toca *Save*. Queda en `https://<tu-usuario>.github.io/<repositorio>/`
   y se actualiza sola con cada cambio que se suba a esa rama.
2. Abre esa dirección en el teléfono:
   - **Android (Chrome):** toca “Instalar app” o menú ⋮ → *Agregar a pantalla principal*.
   - **iPhone (Safari):** toca *Compartir* → *Agregar a inicio*.
3. ¡Listo! Se abre a pantalla completa como cualquier app y funciona sin internet
   (el reconocimiento de voz de Android puede requerir conexión).

> 🎤 Para el análisis de voz automático usa **Chrome** en Android o **Safari** en iPhone y permite el acceso al micrófono.

### Probar en la computadora
```bash
python3 -m http.server 8080
```
Luego abre `http://localhost:8080` (usa la vista móvil de las herramientas de desarrollador).

## ☁️ Nube y tutor con IA

Opcional y gratis para empezar: sigue **[GUIA_NUBE.md](GUIA_NUBE.md)**. Activa cuentas sincronizadas entre
teléfonos, ranking de amigos **en vivo** (y global) y el tutor de conversación con IA. Sin configurarla,
la app funciona igual, solo en el teléfono.

## 🗂️ Estructura

```
index.html              Entrada de la app
manifest.webmanifest    Configuración para instalarla (PWA)
sw.js                   Service worker (modo sin conexión)
css/styles.css          Diseño móvil, modo oscuro
js/data.js              CONTENIDO: niveles, unidades, prueba de nivel, diálogos, logros
js/lessons.js           Genera los ejercicios de cada lección desde el contenido
js/exercises.js         Componentes de ejercicios y motor de lecciones
js/analysis.js          Corrección de respuestas, análisis de escritura y de pronunciación
js/speech.js            Voz: escuchar (síntesis), hablar (reconocimiento), grabar, sonidos
js/store.js             Usuarios, progreso, racha, repetición espaciada, plan de estudio
js/app.js               Pantallas y navegación
js/config.js            Datos públicos del proyecto de Supabase (vacío = sin nube)
js/cloud.js             Nube: cuentas, sincronización, ranking en vivo, tutor IA
supabase/schema.sql     Base de datos y reglas de seguridad (pegar en Supabase)
supabase/functions/tutor/index.ts   Servidor del tutor IA (guarda la clave de Anthropic)
```

## ➕ Agregar contenido

Añade una unidad en `js/data.js` dentro de `UNITS` (vocabulario, frases, preguntas de gramática,
lectura y tema de escritura). Las 7 lecciones se generan automáticamente. Los diálogos se agregan en
`DIALOGUES` y las preguntas de la prueba de nivel en `PLACEMENT`.

## 🚀 Siguientes pasos sugeridos

- **Sincronizar cuentas en la nube** (Firebase o Supabase) para usar la misma cuenta en varios dispositivos
  y que el ranking de amigos se actualice en tiempo real (hoy se actualiza cuando cada amigo vuelve a compartir). Hoy los datos se guardan en el teléfono (con copia exportable).
- **Corrección con IA** (por ejemplo, la API de Claude) a través de un pequeño backend para dar retroalimentación
  aún más detallada de textos libres y conversaciones abiertas.
- **Recordatorios diarios** con notificaciones push.
- **Publicar en Play Store / App Store** envolviendo la PWA con Capacitor.
- Más unidades, audios grabados por nativos e imágenes ilustradas.
