import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login as authLogin } from '../store/authSlice'
import axiosInstance from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            const identifier = formData.email.trim()
            const loginData = {
                email: identifier,
                username: identifier,
                password: formData.password
            }
            const res = await axiosInstance.post("/users/login", loginData)
            if (res.data.success) {
                dispatch(authLogin(res.data.data.user))
                toast.success(`Welcome back, ${res.data.data.user.username}! `)
                navigate("/")
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Login failed. check your credentials."
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4">
            <div className="w-full max-w-[440px] bg-zinc-900/30 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">

                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full"></div>

                <div className="flex flex-col items-center mb-10 text-center relative z-10">
                    <div className='relative w-16 h-16 flex items-center justify-center mb-4'>
                        {/* Background Soft Glow */}
                        <div className='absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-30'></div>

                        {/* The Icon: Abstract Play + Pulse P (Geometric Design) */}
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                            <defs>
                                <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" />
                                    <stop offset="100%" stopColor="#1ca332" />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="44" fill="url(#greenGrad)" />
                            <path
                                d="M38 30 L68 50 L38 70 Z"
                                fill="white"
                                transform="translate(-2 0)"
                            />
                            <path
                                d="M55 28 L55 72"
                                stroke="white"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tighter leading-none flex items-center">
                        PLAY<span className="text-green-500 ml-1">COMMUNITY</span>
                    </h2>
                    <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.4em] mt-2 italic">
                        Premium Studio Authenticate
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 text-red-400 bg-red-400/5 border border-red-400/10 p-4 rounded-2xl mb-8 text-xs font-bold leading-tight relative z-10">
                        <AlertCircle size={16} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">Credentials</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Username or email"
                                className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl focus:border-green-600/50 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-700"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Security</label>
                            <Link to="#" className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 tracking-tighter">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-black/40 border border-white/5 p-4 pl-12 rounded-2xl focus:border-green-600/50 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-700"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full h-9 bg-white text-black hover:bg-zinc-200 py-4.5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] mt-4 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : (
                            <>
                                Login <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-white/5 text-center relative z-10">
                    <p className="text-zinc-500 text-[11px] font-black tracking-widest uppercase italic">
                        New to PLAYCOMMUNITY? <Link to="/signup" className="text-green-200 hover:text-green-500 ml-1">Create account</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login