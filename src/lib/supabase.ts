import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Use anon key for now (service role key needs to be configured properly)
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Only create client if we have valid environment variables
    if (supabaseUrl && supabaseKey && 
        supabaseUrl !== 'your_supabase_url_here' && 
        supabaseKey !== 'your_supabase_anon_key_here' &&
        supabaseUrl.startsWith('http')) {
      try {
        supabaseInstance = createClient(supabaseUrl, supabaseKey)
        console.log('Supabase client created with anon key')
      } catch (error) {
        console.warn('Failed to create Supabase client:', error)
        return null
      }
    } else {
      console.warn('Missing Supabase configuration:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
    }
  }
  
  return supabaseInstance
}

// Export a function that returns the client or null
export const supabase = getSupabaseClient()
