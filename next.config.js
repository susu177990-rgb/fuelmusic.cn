/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 本地开发和当前部署阶段：直接输出原图，避免优化器导致的偶发 500
    unoptimized: true,
    // 配置图片域允许列表
    domains: [],
    // 配置图片格式
    formats: ['image/webp', 'image/avif'],
    // 配置图片安全选项
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 修复Next.js 14中的一些潜在问题
  experimental: {
    // 确保服务器组件和客户端组件正确分离
    serverComponentsExternalPackages: [],
  },
  // 添加webpack配置来处理/@vite/client请求
  webpack: (config) => {
    // 简化配置：移除任何可能导致问题的别名
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // 不使用复杂的钩子，而是简单地处理
    return config;
  },
  async rewrites() {
    return [
      // 将/@vite/client请求重定向到一个空响应
      {
        source: '/@vite/client',
        destination: '/_next/static/chunks/app/_error/page.js', // 使用一个可能存在的空页面文件
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // 本地开发禁用 HSTS，防止强制 https 影响调试
          // { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
      {
        source: '/brand/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/covers/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/demos/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
