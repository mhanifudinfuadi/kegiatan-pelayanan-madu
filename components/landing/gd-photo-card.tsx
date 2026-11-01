"use client"

import { useRef, useState } from "react"
import { formatTanggal, type PhotoItem } from "@/lib/activities"

interface GdPhotoCardProps {
  photo: PhotoItem
  liked: boolean
  likeCount: number
  commentCount: number
  index: number
  canInteract: boolean
  onOpen: () => void
  onLike: () => void
  onNeedLogin: () => void
}

/**
 * Kartu feed ala Instagram:
 * - ketuk 1x (jeda 260 ms) -> buka dokumentasi
 * - ketuk 2x -> hati + ledakan 8 kelopak
 */
export function GdPhotoCard({
  photo,
  liked,
  likeCount,
  commentCount,
  index,
  canInteract,
  onOpen,
  onLike,
  onNeedLogin,
}: GdPhotoCardProps) {
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [burstKey, setBurstKey] = useState(0)

  const doLike = () => {
    if (!canInteract) {
      onNeedLogin()
      return
    }
    setBurstKey((k) => k + 1)
    onLike()
  }

  const handleTap = () => {
    if (tapTimer.current) {
      // ketukan kedua -> reaksi hati
      clearTimeout(tapTimer.current)
      tapTimer.current = null
      doLike()
      return
    }
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null
      onOpen()
    }, 260)
  }

  return (
    <article
      className="gd-card"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      data-testid={`photo-card-${photo.key}`}
    >
      <button
        type="button"
        className="gd-card__trigger"
        style={{ position: "absolute", inset: 0, zIndex: 1, border: 0, background: "none", cursor: "pointer" }}
        onClick={handleTap}
        aria-label={`Buka dokumentasi ${photo.title}`}
        data-testid={`photo-open-${photo.key}`}
      />

      <img className="gd-card__img" src={photo.image} alt={photo.title} loading="lazy" />

      <span className="gd-card__badge">{photo.category}</span>

      {burstKey > 0 && (
        <span key={burstKey} aria-hidden="true">
          <span className="gd-heart-pop">♥</span>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
              <span
                key={i}
                className="gd-burst"
                style={
                  {
                    "--bx": `${Math.cos(angle) * 64}px`,
                    "--by": `${Math.sin(angle) * 64}px`,
                    animationDelay: `${i * 15}ms`,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </span>
      )}

      <div className="gd-card__overlay">
        <p className="gd-card__cap">{photo.title}</p>
        <span className="gd-card__meta">
          {formatTanggal(photo.date)}
          {photo.unit ? ` · ${photo.unit}` : ""}
        </span>
        <span className="gd-card__cta" aria-hidden="true">
          Lihat Dokumentasi →
        </span>
      </div>

      <div className="gd-card__actions" style={{ position: "absolute", zIndex: 4 }}>
        <button
          type="button"
          className={`gd-act ${liked ? "on" : ""}`}
          onClick={doLike}
          aria-pressed={liked}
          aria-label={`Hati ${photo.title}`}
          data-testid={`photo-like-${photo.key}`}
        >
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
          {likeCount}
        </button>
        <button
          type="button"
          className="gd-act"
          onClick={onOpen}
          aria-label={`Komentar ${photo.title}`}
          data-testid={`photo-comment-${photo.key}`}
        >
          <span aria-hidden="true">💬</span>
          {commentCount}
        </button>
      </div>
    </article>
  )
}
