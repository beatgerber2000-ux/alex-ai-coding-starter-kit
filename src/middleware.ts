import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Zentraler Routenschutz + Session-Refresh für PROJ-2.
//
// Vorgaben (siehe Spec, Tech Design D):
// - Keine Redirect-Endlosschleifen.
// - Öffentliche Routen /login und /register vom Schutz ausnehmen.
// - /api/health/supabase und API-Routen nicht blockieren (nur Session refreshen).
// - Static Assets / Next.js-interne Pfade per Matcher ausschließen.

const PUBLIC_PATHS = ['/login', '/register']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export async function middleware(request: NextRequest) {
  // Antwort, deren Cookies wir mit aufgefrischten Session-Tokens befüllen.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // WICHTIG: direkt nach createServerClient aufrufen, nichts dazwischen.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // API-Routen (z. B. /api/health/supabase) nie umleiten — nur Session refreshen.
  if (pathname.startsWith('/api')) {
    return supabaseResponse
  }

  const publicPath = isPublicPath(pathname)

  // Nicht eingeloggt + geschützte Route → /login (Session-Cookies erhalten).
  if (!user && !publicPath) {
    return redirectPreservingCookies(request, '/login', supabaseResponse)
  }

  // Eingeloggt + Auth-Seite (/login, /register) → /dashboard.
  if (user && publicPath) {
    return redirectPreservingCookies(request, '/dashboard', supabaseResponse)
  }

  return supabaseResponse
}

function redirectPreservingCookies(
  request: NextRequest,
  pathname: string,
  fromResponse: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  const redirectResponse = NextResponse.redirect(url)
  // Aufgefrischte Session-Cookies in die Redirect-Antwort übernehmen.
  fromResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie)
  })
  return redirectResponse
}

export const config = {
  matcher: [
    // Alle Pfade außer Next.js-internen und statischen Assets.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
