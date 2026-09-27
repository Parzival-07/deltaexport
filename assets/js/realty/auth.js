/* Delta Realty authentication helper */
window.DeltaRealtyAuth = {
  async getUser() {
    if (!window.deltaSupabase) return null;
    const { data } = await window.deltaSupabase.auth.getUser();
    return data?.user || null;
  },

  async signInWithOtp(phone) {
    if (!window.deltaSupabase) throw new Error("Supabase is not configured.");
    return window.deltaSupabase.auth.signInWithOtp({ phone });
  },

  async signInWithEmail(email) {
    if (!window.deltaSupabase) throw new Error("Supabase is not configured.");
    return window.deltaSupabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    });
  },

  async signOut() {
    if (window.deltaSupabase) await window.deltaSupabase.auth.signOut();
    location.reload();
  },

  async profile() {
    const user = await this.getUser();
    if (!user || !window.deltaSupabase) return null;
    const { data } = await window.deltaSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return data || null;
  }
};
