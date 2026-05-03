import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AI_BOT_USER_AGENTS = [
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Googlebot',
  'bingbot',
  'PerplexityBot',
  'OAI-SearchBot',
  'Anthropic',
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired
  await supabase.auth.getUser()

  // 2. LLM Reporting Engine Logging
  const userAgent = request.headers.get('user-agent') || '';
  const isAiBot = AI_BOT_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  
  if (isAiBot && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Determine the entity being accessed (e.g. /profile/123)
    const path = request.nextUrl.pathname;
    
    // We only want to log meaningful reads, like profile or article pages
    if (path.startsWith('/profile') || path.startsWith('/article')) {
      try {
        await supabase.from('analytics_events').insert({
          path,
          user_agent: userAgent,
          ip_address: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
          event_type: 'llm_ingestion',
        });
      } catch (e) {
        console.error('Failed to log LLM hit', e);
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
