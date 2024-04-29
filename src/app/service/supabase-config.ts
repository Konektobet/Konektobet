import { SupabaseClient, createClient } from '@supabase/supabase-js';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuaG5wd3Jla2l4aGVtbXR5ZWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA0OTA4NzcsImV4cCI6MjAxNjA2Njg3N30.qWWTJvHbQiZY86F7cJ1qrBxIIFinBZt_SZ1gu-wInAk';
const supabaseUrl = 'https://vnhnpwrekixhemmtyeea.supabase.co';

export const supabase = createClient(supabaseUrl, supabaseKey);