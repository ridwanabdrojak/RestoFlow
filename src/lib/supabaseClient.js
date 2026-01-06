
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xpetxnggdxmsxtbqkesl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZXR4bmdnZHhtc3h0YnFrZXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2ODQyMzcsImV4cCI6MjA4MzI2MDIzN30.75gSwsR67MQEbMMwLm_zKV4jmdb5DIPihCmzNXSPeQY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
