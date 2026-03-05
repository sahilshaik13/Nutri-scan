/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this block back in!
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Replace this with your actual deployed FastAPI URL
        destination: 'https://nutri-scan-fvyo.onrender.com/api/:path*',
      },
    ]
  },
}

export default nextConfig