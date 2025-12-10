import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const DEFAULT_REDIRECT = '/dashboard';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session_id = request.cookies.get('sessionId')?.value;

  const is_public_path = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // 🔒 No tiene sesión → redirigir a login
  if (!session_id && !is_public_path) {
    const login_url = new URL('/login', request.url);
    login_url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(login_url);
  }

  // 🔁 Tiene sesión y entra al login → mandarlo al dashboard
  if (session_id && is_public_path) {
    // Evita redirección infinita si ya está en dashboard
    if (pathname === DEFAULT_REDIRECT) return NextResponse.next();

    console.log('✅ Redirecting to dashboard (has session)');
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // 🌐 Si entra a la raíz y tiene sesión → dashboard
  if (session_id && pathname === '/') {
    console.log('✅ Redirecting to dashboard (from root)');
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
  }

  // 🟢 Continuar normalmente
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
