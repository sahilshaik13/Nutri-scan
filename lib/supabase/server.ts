import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client for when Supabase is not configured
    return {
      auth: {
        getUser: async () => {
          try {
            return { data: { user: null }, error: null }
          } catch (e) {
             return { data: { user: null }, error: e }
          }
        },
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      }),
    } as any
  }
  
  const cookieStore = await cookies()

  const client = createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // Add the explicit type definition right here 👇
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  // Override getUser to swallow invalid refresh token errors
  const originalGetUser = client.auth.getUser
  client.auth.getUser = async (...args) => {
    try {
      return await originalGetUser.apply(client.auth, args)
    } catch (error: any) {
      if (error?.status === 400 && error?.code === 'refresh_token_not_found') {
        // Silently fail and return no user
        return { data: { user: null }, error: error } as any
      }
      throw error // re-throw other legitimate errors
    }
  }

  return client
}
