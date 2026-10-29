/** @type {import('next').NextConfig} */

// Saat build untuk GitHub Pages: export statis + subpath nama repo.
// Vercel tidak memakai env ini, jadi perilakunya tetap seperti biasa.
const isGithubPages = process.env.GITHUB_PAGES === "true"
const basePath = isGithubPages ? "/kegiatan-pelayanan-madu" : ""

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  ...(isGithubPages && {
    output: "export",
    trailingSlash: true,
    basePath,
    assetPrefix: basePath,
    env: {
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
  }),
}

export default nextConfig
