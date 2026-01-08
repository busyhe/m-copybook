import { Metadata } from 'next'
import '@workspace/ui/globals.css'
import { Providers } from '@/components/providers'
import { Analytics } from '@/components/analytics'
import { fontSans, fontMono, fontPinyin } from '@/lib/fonts'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: [
    '字帖生成器',
    '中文字帖',
    '田字格',
    '拼音字帖',
    '描白',
    '书法练习',
    'Copybook Generator',
    'Chinese Handwriting'
  ],
  authors: [
    {
      name: 'busyhe',
      url: 'https://github.com/busyhe'
    }
  ],
  creator: 'busyhe',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@busyhe'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Windows, macOS, Linux, Android, iOS',
    author: {
      '@type': 'Person',
      name: 'busyhe',
      url: 'https://github.com/busyhe'
    }
  }

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} ${fontPinyin.variable} font-sans antialiased `}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
