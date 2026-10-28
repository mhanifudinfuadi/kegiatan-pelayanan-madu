"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !canvasRef.current) return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      1,
      1000
    )
    camera.position.z = 100

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    const particleCount = 4200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 500

      colors[i * 3] = Math.random() * 0.5 + 0.5
      colors[i * 3 + 1] = Math.random() * 0.5 + 0.5
      colors[i * 3 + 2] = Math.random() * 0.5 + 0.5

      sizes[i] = Math.random() * 2 + 0.5
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    const animate = () => {
      const positions = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 2] += 0.5
        if (positions[i * 3 + 2] > 500) {
          positions[i * 3 + 2] = -500
        }
      }
      particles.geometry.attributes.position.needsUpdate = true
      particles.rotation.y += 0.0005
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      camera.left = -window.innerWidth / 2
      camera.right = window.innerWidth / 2
      camera.top = window.innerHeight / 2
      camera.bottom = -window.innerHeight / 2
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return (
    <footer className="dark" id="kontak" style={{ background: "#090B20", color: "#F3EBDD" }}>
      <canvas ref={canvasRef} className="starfield" aria-hidden="true" style={{ pointerEvents: "none" }} />

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "clamp(56px,8vw,112px) clamp(24px,5vw,80px)", position: "relative", zIndex: 1 }}>
        <p style={{ letterSpacing: ".2em", color: "#E9B6C9", fontSize: ".8rem", textTransform: "uppercase" }}>私の静かな宇宙 · MY QUIET UNIVERSE</p>
        <h2 style={{ fontSize: "clamp(3rem,7vw,6.5rem)", fontFamily: "serif", margin: ".5rem 0" }}>And Then, There Was You.</h2>
        <p style={{ color: "#E9B6C9", fontSize: "1rem" }}>そして、君がいた。</p>
        <p style={{ color: "#8F8BA8", maxWidth: "42rem", lineHeight: 1.7, marginTop: "1rem" }}>Of all the things this world has given me, you are the one I was never prepared to feel.</p>

        <hr style={{ border: 0, borderTop: "1px solid rgba(243,235,221,.14)", margin: "2rem 0" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <p style={{ maxWidth: "42rem", lineHeight: 1.7, color: "#F3EBDD" }}>I used to believe that a man could keep his world in order, that every feeling had its place and every longing its end. Then you came along, and suddenly, even silence began to speak your name.</p>
            <p style={{ color: "#8F8BA8", marginTop: "1rem" }}>— where My World Unravels</p>
          </div>
          <div>
            <h4 style={{ color: "#E9B6C9", letterSpacing: ".15em", fontSize: "1rem" }}>EXPLORE</h4>
            <nav style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".1rem 1rem", marginTop: "1rem", fontSize: ".95rem" }}>
              <a href="#beranda" style={{ color: "#F3EBDD", gridColumn: "1 / -1" }}>Beranda</a>
              <a href="#kegiatan" style={{ color: "#F3EBDD" }}>Kegiatan</a>
              <a href="#statistik" style={{ color: "#F3EBDD" }}>Statistik</a>
              <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#E9B6C9", margin: "0", whiteSpace: "pre-line", lineHeight: 1.2 }}>somehow you{"\n"}feels like home</p>
              <a href="#tentang" style={{ color: "#F3EBDD" }}>Tentang</a>
              <a href="#galeri" style={{ color: "#F3EBDD" }}>Galeri</a>
              <a href="#scan" style={{ color: "#F3EBDD", gridColumn: "1 / -1" }}>Scan</a>
            </nav>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: "1px solid rgba(243,235,221,.14)", margin: "2rem 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", color: "#8F8BA8" }}>
          <p>The world remains. I am simply no longer quite the same.</p>
          <p>© {new Date().getFullYear()}Tanah Abang, Made with quiet devotion.</p>
        </div>
      </div>
    </footer>
  )
}
