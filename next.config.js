/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "upgrade-insecure-requests; default-src 'self'; connect-src 'self' http://124.222.75.42:4120; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 