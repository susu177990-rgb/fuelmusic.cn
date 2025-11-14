import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import ContactFab from '../components/ContactFab'
import Footer from '../components/Footer'
import TopNav from '../components/TopNav'
import ThemeProvider from '../components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: '福乐音乐工作室｜混得干净 响得高级',
    template: '%s｜福乐音乐工作室',
  },
  description: '专业的音乐制作服务：混音、录音、母带处理、编曲定制。提供在线音频分析工具，支持BPM检测、调性识别、响度分析。位于上海的独立混音团队，混得干净响得高级。',
  keywords: [
    '音乐制作', '混音', '录音', '母带处理', '编曲定制', 
    '音频分析', 'BPM检测', '调性识别', '响度分析', 'LUFS',
    '上海音乐工作室', '福乐音乐', 'Fuel Music Studio',
    '音乐制作服务', '专业混音', '音频后期制作'
  ],
  authors: [{ name: '福乐音乐工作室' }],
  creator: '福乐音乐工作室',
  publisher: 'Fuel Music Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: { 
    canonical: '/',
    languages: {
      'zh-CN': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: '福乐音乐工作室｜混得干净 响得高级',
    description: '专业的音乐制作服务：混音、录音、母带处理、编曲定制。提供在线音频分析工具，支持BPM检测、调性识别、响度分析。位于上海的独立混音团队，混得干净响得高级。',
    siteName: 'Fuel Music Studio',
    locale: 'zh_CN',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: '福乐音乐工作室 - 专业的音乐制作服务',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '福乐音乐工作室｜混得干净 响得高级',
    description: '专业的音乐制作服务：混音、录音、母带处理、编曲定制。提供在线音频分析工具，支持BPM检测、调性识别、响度分析。位于上海的独立混音团队，混得干净响得高级。',
    images: ['/og'],
    creator: '@fuelmusic',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: "/apple-icon", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#6B4EFF',
      },
    ],
  },
  manifest: '/site.webmanifest',
  category: 'music',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#6B4EFF',
  colorScheme: 'dark light',
  viewportFit: 'cover'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "福乐音乐工作室",
    alternateName: "Fuel Music Studio",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: {
      "@type": "ImageObject",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/brand/logo.webp`,
      width: 320,
      height: 240
    },
    description: "专业的音乐制作服务：混音、录音、母带处理、编曲定制。提供在线音频分析工具，支持BPM检测、调性识别、响度分析。位于上海的独立混音团队，混得干净响得高级。",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CN",
      addressRegion: "上海"
    },
    contactPoint: [{
      "@type": "ContactPoint",
      email: "1779916397@qq.com",
      contactType: "customer support",
      areaServed: "CN",
      availableLanguage: "Chinese"
    }],
    sameAs: [
      "https://weixin.qq.com/fuelmusic",
      "https://www.douyin.com/user/MS4wLjABAAAAQ5ucaqx0Oek2GZOjAJRnrS2AWsOaNfqmm_vm47UFXyoNbsa1KP_bfZlQ8IVV5xCu"
    ],
    service: [
      {
        "@type": "Service",
        name: "混音服务",
        description: "专业的音乐混音服务，包括人声处理、节奏校准、空间与动态控制"
      },
      {
        "@type": "Service", 
        name: "录音服务",
        description: "专业的录音服务，提供高质量的录音设备和环境"
      },
      {
        "@type": "Service",
        name: "母带处理",
        description: "专业的母带处理服务，响度、宽度与平台一致性校验"
      },
      {
        "@type": "Service",
        name: "编曲定制",
        description: "专业的编曲定制服务，旋律/和声/鼓组编配，音色设计与结构优化"
      }
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "音乐制作服务",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "贴唱混音",
            description: "专业贴唱混音服务，包含至多3轨人声处理"
          },
          price: "699",
          priceCurrency: "CNY",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "699",
            priceCurrency: "CNY",
            unitText: "首"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service", 
            name: "分轨混音",
            description: "专业分轨混音服务，根据工程复杂度评估定价"
          },
          price: "1000-3000",
          priceCurrency: "CNY"
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "编曲定制", 
            description: "专业编曲定制服务，旋律/和声/鼓组编配"
          },
          price: "2000",
          priceCurrency: "CNY"
        }
      ]
    }
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        <ThemeProvider>
          <TopNav />
          <div className="h-16"></div>
          <main className="container py-0 pt-0">
            {children}
          </main>
        </ThemeProvider>
        {/* 移除了可能导致SSR/客户端不匹配的内联脚本 */}
        {/* 滚动阴影逻辑现在在TopNav组件中处理 */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <ContactFab />
        <Footer />
      </body>
    </html>
  )
}
