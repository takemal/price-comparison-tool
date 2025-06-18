import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '価格比較ツール | Price Comparison Tool',
  description: '価格.comから商品情報を取得し、価格比較・分析を行うツールです。JavaScript/Python実装で競合調査や市場分析にご活用ください。',
  keywords: [
    '価格比較',
    'スクレイピング', 
    '競合分析',
    '市場調査',
    'JavaScript',
    'Python',
    'Next.js',
    '価格.com'
  ],
  authors: [{ name: 'Price Comparison Tool' }],
  creator: 'Price Comparison Tool',
  publisher: 'Price Comparison Tool',
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
    locale: 'ja_JP',
    url: 'https://price-comparison-tool.vercel.app',
    title: '価格比較ツール | Price Comparison Tool',
    description: '価格.comから商品情報を取得し、価格比較・分析を行うツールです。',
    siteName: 'Price Comparison Tool',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Price Comparison Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '価格比較ツール | Price Comparison Tool',
    description: '価格.comから商品情報を取得し、価格比較・分析を行うツールです。',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#667eea" />
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//kakaku.com" />
        <link rel="dns-prefetch" href="//img.kakaku.com" />
        
        {/* Security headers */}
        <meta httpEquiv="Content-Security-Policy" 
              content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https: http:; connect-src 'self' https:;" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "価格比較ツール",
              "description": "価格.comから商品情報を取得し、価格比較・分析を行うツール",
              "url": "https://price-comparison-tool.vercel.app",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY"
              },
              "creator": {
                "@type": "Organization",
                "name": "Price Comparison Tool"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {/* Skip to content for accessibility */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          メインコンテンツへスキップ
        </a>
        
        {/* Main application wrapper */}
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-custom flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PC</span>
                  </div>
                  <a 
                  href="/" 
                  className="hidden font-bold sm:inline-block"
                >
                  価格比較ツール
                </a>
                </div>
              </div>
              
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <a 
                  href="/" 
                  className="transition-colors hover:text-foreground/80 text-foreground"
                >
                  検索
                </a>
                {/* <a 
                  href="/analysis" 
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  分析
                </a> */}
                <a 
                  href="/sheets" 
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  連携
                </a>
              </nav>
            </div>
          </header>

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <footer className="border-t bg-background">
            <div className="container-custom py-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    ツール
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <a href="/" className="hover:text-foreground transition-colors">
                        価格検索
                      </a>
                    </li>
                    <li>
                      <a href="/analysis" className="hover:text-foreground transition-colors">
                        データ分析
                      </a>
                    </li>
                    <li>
                      <a href="/sheets" className="hover:text-foreground transition-colors">
                        Google Sheets
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    技術
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="hover:text-foreground transition-colors">
                        JavaScript実装
                      </span>
                    </li>
                    <li>
                      <span className="hover:text-foreground transition-colors">
                        Python実装
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        Next.js + TypeScript
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    法的事項
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="text-muted-foreground">
                        robots.txt遵守
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        教育目的使用
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        レート制限実装
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    サポート
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span
                        className="hover:text-foreground transition-colors"
                      >
                        GitHub
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        ドキュメント
                      </span>
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        使用方法
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
                <p>
                  © 2025 価格比較ツール. 教育・ポートフォリオ目的で作成されました。
                </p>
                <p className="mt-2">
                  Next.js + TypeScript + Python で構築 | データソース: 価格.com
                </p>
              </div>
            </div>
          </footer>
        </div>

        {/* Global loading indicator */}
        <div id="global-loading" className="hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen">
            <div className="loading-spinner h-8 w-8"></div>
          </div>
        </div>

        {/* Toast notifications container */}
        <div id="toast-container" className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
          {/* Toast notifications will be inserted here */}
        </div>
      </body>
    </html>
  )
}