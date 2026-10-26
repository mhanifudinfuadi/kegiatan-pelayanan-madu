import { useState } from "react"
import { signIn, signOut, getCurrentUser } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const { data, error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      setSuccess("Login successful! Redirecting...")
      setTimeout(() => {
        router.push("/editor")
      }, 1500)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#faf6f1] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-xl border border-[#e6e0d8]">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#1b2a4a]" style={{ fontFamily: "Zen Old Mincho, serif" }}>
          Admin Login
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#6b6f7d]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-[#e6e0d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9473f]"
              placeholder="admin@yourdomain.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-[#6b6f7f7d]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-[#e6e0d8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d9473f]"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1b2a4a] text-white rounded-lg font-semibold hover:bg-[#0f1a33] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <a href="/" className="text-[#6b6f7d] hover:text-[#1b2a4a] text-sm transition">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}