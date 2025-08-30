import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://zygpxucbtakqeqwabmzp.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'GIqrsLISYho82bhN'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)