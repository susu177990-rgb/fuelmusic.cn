import { NextResponse, type NextRequest } from 'next/server';

/**
 * 生产环境：
 * - 统一域名到 `https://fuelmusic.cn`
 * - 注入安全响应头（CSP/HSTS/…）
 * 开发环境：直接放行（避免影响 HMR）
 */
export function middleware(req: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  
  // 特殊处理：直接返回空JS响应给/@vite/client请求
  if (req.nextUrl.pathname === '/@vite/client') {
    return new NextResponse('// Vite client mock', {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
  
  if (!isProd) return NextResponse.next();

  const desiredHost = 'fuelmusic.cn';
  const host = req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const url = req.nextUrl.clone();

  // 1) 域名 & 协议规范化：强制 https + 根域
  if (host !== desiredHost || proto !== 'https') {
    url.host = desiredHost;
    url.protocol = 'https';
    return NextResponse.redirect(url, 308);
  }

  // 2) 安全响应头
  const res = NextResponse.next();

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "connect-src 'self' https:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "script-src 'self' 'unsafe-inline'", // 允许 JSON-LD/少量内联；不允许 eval
    "style-src 'self' 'unsafe-inline'",
  ].join('; ');

  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains; preload');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  return res;
}

// 避免给静态资源注入头部
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};