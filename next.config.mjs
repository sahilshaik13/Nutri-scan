/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Next.js API routes (/api/*) are handled by this frontend service
  // FastAPI backend (/api/*) is handled by the separate backend service in vercel.json
  // The separation is managed by experimentalServices in vercel.json
}

export default nextConfig
