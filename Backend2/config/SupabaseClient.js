import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://pybrcrzsrsndrpjunman.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnJjcnpzcnNuZHJwanVubWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDY4NTQsImV4cCI6MjA1NTk4Mjg1NH0.SYxAvCKr7toQlBeUsIQThf41OzvhInQr1CzudTrdzr8";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
