import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Only create client if we have valid environment variables
    if (supabaseUrl && supabaseAnonKey && 
        supabaseUrl !== 'your_supabase_url_here' && 
        supabaseAnonKey !== 'your_supabase_anon_key_here' &&
        supabaseUrl.startsWith('http')) {
      try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
      } catch (error) {
        console.warn('Failed to create Supabase client:', error)
        return null
      }
    }
  }
  
  return supabaseInstance
}

// Export a function that returns the client or null
export const supabase = getSupabaseClient()
