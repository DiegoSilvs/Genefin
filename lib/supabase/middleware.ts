import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Cria cliente Supabase para middleware.
 * Permite ler sessão do usuário para proteger rotas.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value);
          }
        },
      },
    },
  );

  // Lê a sessão atual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas
  const isProtected = !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/register') &&
    !request.nextUrl.pathname.startsWith('/auth/callback') &&
    request.nextUrl.pathname !== '/';

  // Se não está autenticado e tenta acessar rota protegida, redireciona
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Se está autenticado e vai para login/register, redireciona para home
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
