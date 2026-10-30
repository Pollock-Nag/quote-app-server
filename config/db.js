const { createClient } = require("@supabase/supabase-js");

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured"
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

const connectDB = async () => {
  const { error } = await supabase.from("quotes").select("id").limit(1);

  if (error) {
    throw new Error(error.message);
  }

  console.log("Supabase connected");
};

module.exports = { connectDB, supabase };
