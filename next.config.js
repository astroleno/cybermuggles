/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' ws: wss: http://aitoshuu.art:4120; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: http:;"
          }
        ],
      },
    ]
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 