import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '在线音频分析工具 | 福乐音乐工作室',
  description: '专业的在线音频分析工具，支持BPM检测、调性识别、响度分析(LUFS)、真峰值检测等。基于EBU R128标准，符合流媒体平台要求。免费在线使用，无需下载。',
  keywords: [
    '音频分析', 'BPM检测', '调性识别', '响度分析', 'LUFS', '真峰值', 
    'EBU R128', '流媒体平台', '音乐制作', '混音', '在线工具',
    '音频检测', '音乐分析', '响度标准', '音频测量', '免费工具'
  ],
  authors: [{ name: '福乐音乐工作室' }],
  creator: '福乐音乐工作室',
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
    title: '在线音频分析工具 | 福乐音乐工作室',
    description: '专业的在线音频分析工具，支持BPM检测、调性识别、响度分析(LUFS)、真峰值检测等。基于EBU R128标准，符合流媒体平台要求。免费在线使用，无需下载。',
    type: 'website',
    url: '/tools',
    siteName: 'Fuel Music Studio',
    locale: 'zh_CN',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: '在线音频分析工具 - 福乐音乐工作室',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '在线音频分析工具 | 福乐音乐工作室',
    description: '专业的在线音频分析工具，支持BPM检测、调性识别、响度分析(LUFS)等。免费在线使用，无需下载。',
    images: ['/og'],
    creator: '@fuelmusic',
  },
  alternates: {
    canonical: '/tools',
  },
  category: 'music tools',
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}