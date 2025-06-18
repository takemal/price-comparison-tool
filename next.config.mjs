/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'img1.kakaku.k-img.com',
      'img2.kakaku.k-img.com',
      'img3.kakaku.k-img.com',
      'kakaku.k-img.com',
      'picsum.photos',
      'via.placeholder.com',
      'images.unsplash.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.kakaku.k-img.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'search.kakaku.com', pathname: '/**' },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;