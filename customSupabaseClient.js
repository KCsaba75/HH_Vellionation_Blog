import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtklsdtadtqpgoibulux.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0a2xzZHRhZHRxcGdvaWJ1bHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTM0MTAsImV4cCI6MjA3Nzk2OTQxMH0.mLf0EfbHZc0ur069ihRwEIIVIMmvO0ogthymfKa0rHs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);