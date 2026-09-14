/*
 * Delta Realty — Supabase client
 * Replace the two placeholders below with your Supabase project's public URL
 * and public anon key. NEVER put a Supabase service-role key in browser code.
 */
window.DELTA_REALTY_CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};

(function () {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = () => {
    if (!window.supabase || !window.DELTA_REALTY_CONFIG.SUPABASE_URL.startsWith("http")) return;
    window.deltaSupabase = window.supabase.createClient(
      window.DELTA_REALTY_CONFIG.SUPABASE_URL,
      window.DELTA_REALTY_CONFIG.SUPABASE_ANON_KEY
    );
    document.dispatchEvent(new Event("delta-supabase-ready"));
  };
  document.head.appendChild(script);
})();
