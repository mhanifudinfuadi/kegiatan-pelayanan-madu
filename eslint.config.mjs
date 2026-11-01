import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

/**
 * Konfigurasi ESLint (flat config) untuk Next.js 15 + TypeScript.
 * Aturan default Next dipakai; beberapa aturan dimatikan karena memang
 * disengaja di proyek ini (lihat komentar di masing-masing).
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
      "supabase/**",
    ],
  },
  {
    rules: {
      // Data Supabase dirender <img> dari bucket publik; next/image butuh domain allowlist
      "@next/next/no-img-element": "off",
      // Komponen dossier admin masih memakai any untuk data mentah dari Supabase
      "@typescript-eslint/no-explicit-any": "warn",
      // Escape teks aneh (’) di JSX tidak perlu noise error
      "react/no-unescaped-entities": "off",
    },
  },
]

export default eslintConfig
