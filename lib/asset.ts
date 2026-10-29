// Prefix path aset statis agar tetap benar di subpath (GitHub Pages).
// Di Vercel nilainya kosong, jadi path tetap "/videos/..." seperti biasa.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function asset(path: string) {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`
}
