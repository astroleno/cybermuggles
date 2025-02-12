/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' ws: wss: http://124.222.75.42:4120; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: http:;"
          }
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy',
        destination: 'http://124.222.75.42:4120/v1/chat/completions'
      }
    ]
  },
  // 添加 Serverless Function 配置
  serverless: true,
}

module.exports = nextConfig 