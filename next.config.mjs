/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow cross-origin requests in development
  allowedDevOrigins: ['*.vusercontent.net'],
  // Enable React Compiler for faster rendering
  reactCompiler: true,
}

export default nextConfig
