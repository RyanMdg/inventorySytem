import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://wpqimnlylrhxocspkxcm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcWltbmx5bHJoeG9jc3BreGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjM3ODgsImV4cCI6MjA1NjE5OTc4OH0.48SPz1o6feXx-Yll-_XsorSeldje3xmDmg_oIHFIcHs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

// import { createClient } from "https://esm.sh/@supabase/supabase-js";

// const supabaseUrl = "https://pybrcrzsrsndrpjunman.supabase.co";
// const supabaseKey =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnJjcnpzcnNuZHJwanVubWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDY4NTQsImV4cCI6MjA1NTk4Mjg1NH0.SYxAvCKr7toQlBeUsIQThf41OzvhInQr1CzudTrdzr8";
// const supabase = createClient(supabaseUrl, supabaseKey);

// export default supabase;
