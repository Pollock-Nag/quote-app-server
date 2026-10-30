const { supabase } = require("../config/db");

const columns = "id, text, author";

const Quote = {
  async findAll() {
    const { data, error } = await supabase
      .from("quotes")
      .select(columns)
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("quotes")
      .select(columns)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

module.exports = Quote;
