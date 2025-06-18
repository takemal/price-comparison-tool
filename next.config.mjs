/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔧 Puppeteer対応: ES Modules トランスパイル設定
  experimental: {
    // サーバーコンポーネントの外部パッケージ設定
    serverComponentsExternalPackages: [
      'puppeteer-core',
      '@sparticuz/chromium'
    ],
    // ESモジュールトランスパイル有効化
    esmExternals: 'loose'
  },

  // 🔧 Webpack設定: Puppeteerモジュール除外
  webpack: (config, { isServer, dev }) => {
    // サーバーサイドでPuppeteerを外部化
    if (isServer) {
      config.externals = config.externals || [];
      
      // Puppeteer関連パッケージを外部化
      config.externals.push({
        'puppeteer-core': 'commonjs puppeteer-core',
        '@sparticuz/chromium': 'commonjs @sparticuz/chromium'
      });
    }

    // 🔧 モジュール解決設定
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        constants: false
      }
    };

    // 🔧 バベル設定: プライベートフィールド対応
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/puppeteer-core/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              targets: {
                node: '18'
              }
            }]
          ],
          plugins: [
            '@babel/plugin-proposal-private-methods',
            '@babel/plugin-proposal-class-properties'
          ]
        }
      }
    });

    return config;
  },

  // 🔧 画像最適化設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.kakaku.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'kakaku.k-img.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaku.k-img.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**'
      }
    ],
    // 画像最適化無効化（外部画像が多いため）
    unoptimized: true
  },

  // 🔧 ESLint設定
  eslint: {
    // ビルド時のESLintエラーを警告として扱う
    ignoreDuringBuilds: false
  },

  // 🔧 TypeScript設定
  typescript: {
    // ビルド時の型チェックエラーを無視（開発時はチェック）
    ignoreBuildErrors: false
  },

  // 🔧 出力設定
  output: 'standalone',

  // 🔧 環境変数
  env: {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
    PUPPETEER_EXECUTABLE_PATH: process.env.NODE_ENV === 'production' ? '/usr/bin/google-chrome-stable' : undefined
  },

  // 🔧 セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },

  // 🔧 リダイレクト設定
  async redirects() {
    return [
      {
        source: '/scrape',
        destination: '/api/scrape',
        permanent: true
      }
    ];
  }
};

// 🔧 ES Module形式でエクスポート
export default nextConfig;