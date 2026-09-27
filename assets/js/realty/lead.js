/* Add this script to property detail pages to enable real enquiries. */
window.DeltaLead = {
  async submit({propertyId, ownerId, name, phone, email="", message=""}) {
    if (!window.deltaSupabase) throw new Error("Supabase is not configured.");
    const user = (await deltaSupabase.auth.getUser()).data.user;
    const payload = {property_id: propertyId, owner_id: ownerId, name, phone, email, message};
    if (user) payload.user_id = user.id;
    return deltaSupabase.from("property_leads").insert(payload);
  }
};
