import { createClient } from '@supabase/supabase-js'

// Membaca kunci rahasia yang kemarin kita titipkan di Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Menyalakan koneksi resmi Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
