"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

export function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const threeRef = useRef<{ scene: THREE.Scene; camera: THREE.OrthographicCamera; renderer: THREE.WebGLRenderer; particles: THREE.Points | null } | null>(null)

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

    threeRef.current = { scene, camera, renderer, particles }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setModalOpen(false)
      setSubmitted(false)
      setFormData({ name: "", email: "", message: "" })
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <footer className="dark" id="kontak">
      <canvas ref={canvasRef} className="starfield" aria-hidden="true" />

      <div className="wrap">
        <div className="fcta">
          <div>
            <h2>Kawaguchiko</h2>
            <p>Pelayanan Unit Kerja yang tenang dan etereal.</p>
          </div>
          <button className="pill" onClick={() => setModalOpen(true)}>
            Tanya →
          </button>
        </div>

        <div className="fcols">
          <div>
            <h4>Navigasi</h4>
            <a href="#beranda">Beranda</a>
            <a href="#kegiatan">Kegiatan</a>
            <a href="#statistik">Statistik</a>
            <a href="#tentang">Tentang</a>
            <a href="#galeri">Galeri</a>
            <a href="#scan">Scan</a>
          </div>
          <div>
            <h4>Kontak</h4>
            <a href="#">info@kawaguchiko.example</a>
            <a href="#">+62 812 0000 0000</a>
            <a href="#">Jl. Danau Kawaguchiko, Yamanashi</a>
          </div>
        </div>

        <div className="fbot">
          <p>© 2026 Kawaguchiko — Dibuat dengan tenaga.</p>
        </div>
      </div>

      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="mpanel" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setModalOpen(false)}>×</button>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <h3>Pesan diterima</h3>
                <p>Terima kasih atas pertanyaan Anda.</p>
              </div>
            ) : (
              <>
                <h3>Tanya</h3>
                <form onSubmit={handleSubmit}>
                  <label>Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label>Pesan</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                  <button type="submit" className="send">Kirim</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  )
}