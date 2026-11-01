/* =========================================================
   CONFIGURACIÓN DE LA NUBE (Supabase)
   Pega aquí los datos de tu proyecto: Supabase → Project Settings → API.
   - supabaseUrl: "Project URL"
   - supabaseAnonKey: la clave "anon" / "public" (es pública, se puede poner aquí)
   ⚠️ NUNCA pongas aquí la clave "service_role" ni tu clave de Anthropic.
   Si se dejan vacías, la app funciona igual, pero solo en el teléfono (sin nube ni tutor IA).
   ========================================================= */
window.EU_CONFIG = {
  supabaseUrl: 'https://bwdkfahrgvqfqxryjfll.supabase.co',
  supabaseAnonKey: 'sb_publishable_p68umFTv9fGsdIrymJRO2Q_l-wYd1_p',
  // Nombre de la Edge Function del tutor IA en Supabase
  tutorFunction: 'hyper-api',
  // Nombre de la Edge Function de recordatorios
  remindersFunction: 'reminders'
};
