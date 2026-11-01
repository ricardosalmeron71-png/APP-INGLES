# ☁️ Guía: activar la nube y el tutor con IA

Con esta guía activas tres funciones:

| Función | Qué hace |
|---|---|
| 🔄 **Cuentas en la nube** | Tu progreso se guarda en internet: entras desde otro teléfono y lo recuperas. |
| 🏆 **Ranking en vivo** | Tus amigos se agregan con un **código de 6 letras** y su progreso se ve actualizado al momento. También hay ranking **global**. |
| 🤖 **Tutor con IA** | Conversaciones reales por voz con una persona virtual (Emma 🇬🇧, Jake 🇺🇸 u Olivia 🇦🇺) que te responde de forma natural y **te corrige cada frase**. |

⏱️ Tiempo: unos 20 minutos. Se recomienda hacerlo desde una **computadora** (en el teléfono también se puede, pero es más incómodo).

> 🔒 **Muy importante:** nunca compartas con nadie (ni en el chat) la clave **`service_role`** de Supabase ni tu **clave de Anthropic**. La única clave que se puede compartir es la **`anon` / `public`**.

---

## Parte 1 — Crear el proyecto en Supabase (gratis)

1. Entra a **https://supabase.com** → **Start your project** → inicia sesión con tu cuenta de **GitHub**.
2. Toca **New project**:
   - **Name:** `englishup`
   - **Database Password:** inventa una contraseña segura y guárdala (no la vas a necesitar en la app).
   - **Region:** la más cercana a ti (por ejemplo *East US* o *South America (São Paulo)*).
   - Plan: **Free**.
3. Toca **Create new project** y espera 1–2 minutos a que termine.

## Parte 2 — Crear la base de datos

1. En el menú de la izquierda entra a **SQL Editor** → **New query**.
2. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este repositorio, copia **todo** su contenido y pégalo.
3. Toca **Run**. Debe decir *Success. No rows returned*.

## Parte 3 — Correo de confirmación (recomendado desactivarlo)

Por defecto Supabase pide confirmar el correo al registrarse. Para que tus amigos entren sin pasos extra:

1. Menú **Authentication** → **Sign In / Providers** (o **Providers** → **Email**).
2. Desactiva **Confirm email** → **Save**.

## Parte 4 — Conectar la app

1. Menú **Project Settings** (⚙️) → **API** (o **Data API** y **API Keys**).
2. Copia estos dos datos:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - La clave **`anon` `public`** (un texto largo que empieza con `eyJ...` o `sb_publishable_...`)
3. **Envíamelos en el chat** y yo los pongo en la app y la publico. Estos dos datos son públicos por diseño: es seguro compartirlos.

   *(Si prefieres hacerlo tú: en GitHub abre `js/config.js`, toca el lápiz ✏️, pega los datos entre las comillas y guarda con **Commit changes**.)*

✅ Con esto ya funcionan las **cuentas en la nube** y el **ranking en vivo**. El tutor con IA necesita la Parte 5.

---

## Parte 5 — Tutor con IA (Claude)

### 5.1 Crear la cuenta de Anthropic y poner un límite de gasto

1. Entra a **https://console.anthropic.com** y crea tu cuenta.
2. Ve a **Billing** (Facturación) y agrega crédito. Con **5 USD** alcanza para miles de mensajes (ver costos abajo).
3. En **Limits** (Límites) pon un **límite de gasto mensual**, por ejemplo **5 USD**. Así **nunca** se cobrará más de eso aunque alguien use mucho el tutor.
4. Ve a **API Keys** → **Create Key** → nombre `englishup` → copia la clave (empieza con `sk-ant-...`). **No la compartas.**

### 5.2 Crear la función del tutor en Supabase

1. En Supabase, menú **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nombre de la función: **`tutor`** (exactamente así).
3. Borra el código de ejemplo, abre [`supabase/functions/tutor/index.ts`](supabase/functions/tutor/index.ts), copia **todo** y pégalo.
4. Toca **Deploy function**. Deja activada la opción **Verify JWT** (así solo los usuarios con sesión pueden usarla).

### 5.3 Guardar la clave de Anthropic como secreto

1. Menú **Edge Functions** → **Secrets** (o **Manage secrets**).
2. Agrega:
   - Name: `ANTHROPIC_API_KEY` — Value: tu clave `sk-ant-...`
3. **Save**.

**Opcional:**

| Secreto | Para qué | Valor por defecto |
|---|---|---|
| `AI_DAILY_LIMIT` | Máximo de mensajes con el tutor por usuario al día | `50` |
| `TUTOR_MODEL` | Modelo de Claude | `claude-haiku-5-5` (el más económico) |

### 5.4 Temas compartidos del tutor (opcional pero recomendado)

Para que los temas propios que crea cada usuario se guarden y todos puedan usarlos:
1. Supabase → **SQL Editor** → **New query**.
2. Pega todo el contenido de [`supabase/topics.sql`](supabase/topics.sql) y toca **Run**.

Cada usuario puede crear hasta 10 temas por día y borrar solo los suyos. Si alguien publica un tema inadecuado, puedes borrarlo tú desde **Table Editor → tutor_topics**.

### 5.5 Probar

1. Abre la app → **Perfil** → tarjeta **☁️ Nube** → escribe tu contraseña → **Conectar**.
2. Ve a **Práctica** → **🤖 Tutor con IA** → elige a Emma y **Charla libre**.
3. Toca 🎤 y habla, o escribe. Activa **🎧 Modo conversación** para platicar sin tocar la pantalla: después de que el tutor habla, el micrófono se abre solo.

---

## 💰 Costos y cómo se ahorra

- **Supabase:** gratis (hasta 50 000 usuarios activos al mes). En el plan gratis, el proyecto se **pausa si nadie lo usa en 7 días**; se reactiva desde el panel de Supabase con un clic.
- **Tutor con IA:** usa **Claude Haiku 5.5**, el modelo más económico.
  - Cada mensaje cuesta aproximadamente **0.0005 USD**, así que **1 000 mensajes ≈ 0.50 USD**.
  - La evaluación final de cada conversación cuesta lo mismo que un mensaje.
- **Cómo se ahorra uso:**
  - La **voz es gratis**: el teléfono convierte tu voz en texto y lee las respuestas en voz alta. La IA solo recibe y devuelve texto.
  - Solo se envían los **últimos 14 mensajes** de la conversación y las respuestas son cortas.
  - Cada usuario tiene un **límite diario** (`AI_DAILY_LIMIT`, 50 por defecto).
  - La evaluación final solo se pide cuando tocas **Terminar**.
  - El **límite mensual** de la consola de Anthropic (paso 5.1) es tu seguro: al llegar a él, el tutor se detiene hasta el mes siguiente y no se cobra más.
- Los **diálogos guiados** (Práctica → 💬) siguen funcionando gratis y sin internet.

## ❓ Problemas comunes

| Mensaje | Solución |
|---|---|
| *“La nube no está configurada”* | Falta la Parte 4 (`js/config.js`). |
| *“Inicia sesión en la nube para usar el tutor”* | Perfil → ☁️ Nube → **Conectar**. |
| *“La clave de Anthropic del servidor no es válida”* | Revisa el secreto `ANTHROPIC_API_KEY` (Parte 5.3). |
| *“El tutor no está disponible ahora”* | Revisa que tengas crédito en Anthropic o que no hayas llegado al límite mensual. |
| *“Llegaste al límite de mensajes por hoy”* | Es el límite diario; sube `AI_DAILY_LIMIT` si quieres. |
| No aparece nada en el ranking global | Cada persona debe conectar la nube y tener activado *Aparecer en el ranking global*. |

---

## Parte 6 — Recordatorios con notificaciones (aunque la app esté cerrada)

Sin esta parte, los recordatorios funcionan solo mientras la app está abierta (y el calendario siempre funciona).
Con ella, cada persona elige su hora y le llega una notificación al teléfono **solo si todavía no practicó ese día**.
No necesita claves ni secretos: las llaves de notificación las crea la propia función.

### 6.1 Activar las extensiones
Supabase → **Database** → **Extensions** → busca **`pg_cron`** y activa el interruptor; haz lo mismo con **`pg_net`**.

### 6.2 Crear las tablas y el programador automático
1. **SQL Editor** → **New query**.
2. Pega todo el contenido de [`supabase/reminders.sql`](supabase/reminders.sql) y toca **Run** ("Success").

### 6.3 Crear la función `reminders`
1. **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Borra el código de ejemplo, pega todo [`supabase/functions/reminders/index.ts`](supabase/functions/reminders/index.ts) y toca **Deploy**.
3. Supabase le pone un nombre automático (por ejemplo `hyper-api` o `smooth-handler`). **Anótalo**: lo ves en la lista de funciones.

### 6.4 Dos ajustes importantes
1. En la función nueva → pestaña **Settings** → **apaga** "Verify JWT with legacy secret" → **Save changes**. (La función verifica por su cuenta quién eres; el programador automático no lleva sesión.)
2. Si el nombre que anotaste **no es** `reminders`, ve al **SQL Editor** y ejecuta (cambiando el nombre):
   ```sql
   update public.push_config set function_slug = 'EL-NOMBRE-QUE-ANOTASTE';
   ```
   y envíame ese nombre para ponerlo en la app (o cambia `remindersFunction` en `js/config.js`).

### 6.5 Probar
1. En el teléfono: **Perfil → 🔔 Recordatorios** → activa "Recordarme cada día", elige tu hora y **permite las notificaciones**.
2. Toca **🔔 Probar notificación**: debe llegar un aviso a tu teléfono.
3. Cada 15 minutos el servidor revisa quién toca avisar. Puedes ver que corre en **Database → Cron Jobs** (`englishup-reminders`) y los avisos enviados en **Edge Functions → reminders → Logs**.

### Cómo cuida a las personas (no molesta)
- Solo avisa si **todavía no practicaste ese día**, y nunca más de **2 veces al día** (recordatorio y aviso de racha en peligro por la noche).
- Nunca envía de madrugada; respeta la zona horaria de cada persona y los días que elija.
- Si alguien deja de practicar, avisa cada vez menos (cada 5 días tras 2 semanas) y a las 6 semanas se apaga solo.
- Cada persona puede desactivarlo cuando quiera. Al cerrar sesión se da de baja el dispositivo.
- Solo se guarda: nombre, hora, días, racha y fecha de la última práctica.

### Detalles según el teléfono
- **Android (Chrome):** funciona directamente, también con la app sin instalar.
- **iPhone:** Apple solo permite notificaciones si la app está **instalada en la pantalla de inicio** (Compartir → Agregar a inicio). La app se lo explica a la persona. Mientras tanto puede usar el recordatorio de calendario.
- **Costo:** nada. Está dentro del plan gratuito de Supabase.

