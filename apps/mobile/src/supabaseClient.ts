import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Supabase configuration
export const SUPABASE_URL = "https://fqnngafckixliwxbtkuj.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxbm5nYWZja2l4bGl3eGJ0a3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTkwNzYsImV4cCI6MjA2MDM5NTA3Nn0.smVCs8UEAkyFe8pCgY9U68rI-A7KewU8RqnMrtjUyc8";

// Initialize Supabase with AsyncStorage for React Native
// TODO: Replace with expo-secure-store before production
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
