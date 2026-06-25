import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uciofracxuymjpbcchvy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjaW9mcmFjeHV5bWpwYmNjaHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODQxNzEsImV4cCI6MjA5Nzg2MDE3MX0.EzGxM6gg9Rt1yLpMSbnSLEJuTRNyvs45tJVMbAiL0Y4";

export const supabase = createClient(supabaseUrl, supabaseKey);