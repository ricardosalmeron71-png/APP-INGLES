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
| `AI_DAILY_LIMIT` | Máximo de mensajes con el tutor por usuario al día | `40` |
| `TUTOR_MODEL` | Modelo de Claude | `claude-haiku-5-5` (el más económico) |

### 5.4 Probar

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
  - Cada usuario tiene un **límite diario** (`AI_DAILY_LIMIT`, 40 por defecto).
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
