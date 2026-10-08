// Supabase configuration

const SUPABASE_URL = "https://agrdgscwzuegfsmtjhtv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_qE7kr9XQmpniPqykU3XP4w_0VQXoVWb";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
