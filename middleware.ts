import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 1. Reativar o updateSession para renovar a sessão Supabase e aplicar proteções base
  const response = await updateSession(request);

  // 2 e 3. O updateSession (em lib/supabase/middleware.ts) usa '/register' como pública.
  // Precisamos ajustar o comportamento para a rota '/cadastro' do nosso app:
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/cadastro')) {
    const location = response.headers.get('Location');
    
    // Se redirecionou para /login, é porque updateSession achou que /cadastro era protegida (sem sessão).
    // Anulamos esse redirecionamento para manter /cadastro pública.
    if (location && location.includes('/login')) {
      const finalResponse = NextResponse.next({ request });
      response.cookies.getAll().forEach(cookie => {
        finalResponse.cookies.set(cookie.name, cookie.value);
      });
      return finalResponse;
    }
    
    // Se NÃO redirecionou, é porque TEM sessão ativa.
    // Redirecionamos para '/' (mesmo comportamento do login para usuários autenticados).
    if (!location) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
