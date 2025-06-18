/** @type {import('next').NextConfig} */
const nextConfig = {
  // Puppeteer サポート
experimental: {
  serverComponentsExternalPackages: ['puppeteer'],
},
  
  // 画像最適化設定
  images: {
    domains: [
      'img1.kakaku.k-img.com',      // 価格.com メイン画像ドメイン
      'img2.kakaku.k-img.com',      // 価格.com サブ画像ドメイン  
      'img3.kakaku.k-img.com',      // 価格.com 追加ドメイン
      'kakaku.k-img.com',           // 価格.com 基本ドメイン
      'picsum.photos',              // テスト画像用
      'via.placeholder.com',        // プレースホルダー画像
      'images.unsplash.com'         // 高品質画像用
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaku.k-img.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img2.kakaku.k-img.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img3.kakaku.k-img.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kakaku.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'search.kakaku.com',
        port: '',
        pathname: '/**',
      },
    ],
    // 開発環境での設定
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 🔥 追加: 外部画像の最適化を無効化
    unoptimized: false,
    // 🔥 追加: ローディング設定
    loader: 'default',
    // 🔥 追加: 画像サイズ制限を緩和
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // 🔥 追加: CORS設定
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  // Puppeteer の設定
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push('puppeteer');
  }
  return config;
},
  
  // 🔥 追加: TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // 🔥 追加: ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;