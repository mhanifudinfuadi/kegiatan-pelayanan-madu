import { ScanPage } from "@/components/landing/scan-page"
import { GalaxyBackdrop } from "@/components/landing/galaxy-backdrop"
import { SakuraPetals } from "@/components/landing/sakura-petals"

export default function ScanRoute() {
  return (
    <div className="gd-shell scan-route">
      <GalaxyBackdrop />
      <SakuraPetals />
      <ScanPage />
    </div>
  )
}
