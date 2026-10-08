// Supabase configuration

const SUPABASE_URL = "https://fgznhzaeuxkpkxtrexey.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_VeTFcWMCvSPs0jqzOxcbNQ_DlLIty05";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
