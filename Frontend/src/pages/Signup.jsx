import React, { useState } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Camera,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,      
  EyeOff,   
} from "lucide-react";
import toast from "react-hot-toast";

function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  // Helper function to calculate password strength criteria
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "bg-zinc-800" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1: return { score, text: "Weak", color: "bg-red-500" };
      case 2: return { score, text: "Fair", color: "bg-orange-500" };
      case 3: return { score, text: "Good", color: "bg-yellow-500" };
      case 4: return { score, text: "Strong", color: "bg-emerald-500" };
      default: return { score: 0, text: "", color: "bg-zinc-800" };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) {
      const msg = "Profile picture is required!";
      setError(msg);
      toast.error(msg);
      return;
    }

    // New validation guard to reject weak passwords on submission
    if (strength.score < 3) {
      const msg = "Please create a stronger password meeting the criteria.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("username", formData.username);
    data.append("password", formData.password);
    data.append("avatar", avatar);
    if (coverImage) data.append("coverImage", coverImage);

    try {
      const res = await axiosInstance.post("/users/register", data);

      if (res.status === 200 || res.status === 201 || res.data?.success) {
        toast.success("Welcome to the Pulse! Please login.");
        navigate("/login");
      } else {
        const errorMsg = res.data?.message || "Registration failed. Try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      let errMsg = "Registration failed. Try again.";
      
      if (err.response?.status === 409) {
        errMsg = err.response?.data?.message || "Username or Email is already taken.";
        
        if (errMsg.toLowerCase().includes("email")) {
          toast.error("This email is already registered!");
        } else if (errMsg.toLowerCase().includes("username")) {
          toast.error("This username is already taken!");
        } else {
          toast.error(errMsg);
        }
      } else {
        errMsg = err.response?.data?.message || err.message || errMsg;
        toast.error(errMsg);
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] py-20 px-4">
      <div className="w-full max-w-xl bg-zinc-900/30 backdrop-blur-xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>

        {/* Header - Redesigned to match Header Logo */}
        <div className="flex flex-col items-center text-center mb-10 relative z-10">
          <div className="relative w-16 h-16 flex items-center justify-center mb-4">
            {/* Background Soft Glow */}
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-30"></div>

            {/* The Icon: Abstract Play + Pulse P (Geometric Design) */}
            <svg
              viewBox="0 0 100 100"
              className="relative w-full h-full drop-shadow-2xl"
            >
              <defs>
                <linearGradient
                  id="logoGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              {/* Smooth P-Shape Play Button */}
              <path
                d="M35 25C35 22.2386 37.2386 20 40 20H60C71.0457 20 80 28.9543 80 40C80 51.0457 71.0457 60 60 60H45V75C45 77.7614 42.7614 80 40 80C37.2386 80 35 77.7614 35 75V25Z"
                fill="url(#logoGrad)"
              />
              {/* Inner Play Triangle */}
              <path d="M52 35L62 40L52 45V35Z" fill="white" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none flex items-center italic">
            PULSE<span className="text-blue-500 ml-1">PLAY</span>
          </h2>
          <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.4em] mt-2 italic">
            Premium Studio Creator Hub Registration
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 text-red-400 bg-red-400/5 border border-red-400/10 p-4 rounded-2xl mb-8 text-xs font-bold leading-tight relative z-10">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Pulse creator name"
                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-blue-600/50 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-700"
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">
                Username
              </label>
              <input
                type="text"
                placeholder="unique_handle"
                className={`w-full bg-black/40 border p-4 rounded-2xl focus:border-blue-600/50 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-700 ${
                  error.toLowerCase().includes("username") ? "border-red-500/50" : "border-white/5"
                }`}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full bg-black/40 border p-4 rounded-2xl focus:border-blue-600/50 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-700 ${
                error.toLowerCase().includes("email") ? "border-red-500/50" : "border-white/5"
              }`}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          {/* Updated Security Block with Strength Meter and Visibility Eye Toggle */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">
                Security
              </label>
              {strength.text && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${strength.color}/10 text-white`}>
                  {strength.text}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="w-full bg-black/40 border border-white/5 p-4 pr-12 rounded-2xl focus:border-blue-600/50 outline-none transition-all text-sm font-medium text-white placeholder:text-zinc-700"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formData.password && (
              <div className="pt-1 px-1">
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  ></div>
                </div>
                <ul className="text-[9px] text-zinc-500 font-medium grid grid-cols-2 gap-x-2 mt-2 ml-1 list-disc list-inside">
                  <li className={formData.password.length >= 8 ? "text-emerald-500" : ""}>Min 8 characters</li>
                  <li className={/[A-Z]/.test(formData.password) ? "text-emerald-500" : ""}>Uppercase letter</li>
                  <li className={/[0-9]/.test(formData.password) ? "text-emerald-500" : ""}>One number</li>
                  <li className={/[^A-Za-z0-9]/.test(formData.password) ? "text-emerald-500" : ""}>Special character</li>
                </ul>
              </div>
            )}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">
                Profile Avatar*
              </label>
              <label className="flex items-center gap-3 w-full bg-black/40 border border-white/5 p-3 rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all">
                <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
                  <Camera size={18} />
                </div>
                <span className="text-[11px] text-zinc-500 font-bold truncate">
                  {avatar ? avatar.name : "Select Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  required
                />
              </label>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase text-zinc-600 ml-2 tracking-widest">
                Cover (Optional)
              </label>
              <label className="flex items-center gap-3 w-full bg-black/40 border border-white/5 p-3 rounded-2xl cursor-pointer hover:border-zinc-500/30 transition-all">
                <div className="p-2 bg-zinc-800 rounded-xl text-zinc-500">
                  <Camera size={18} />
                </div>
                <span className="text-[11px] text-zinc-500 font-bold truncate">
                  {coverImage ? coverImage.name : "Select Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-zinc-200 py-4.5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] mt-6 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Join the Pulse{" "}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center relative z-10">
          <p className="text-zinc-500 text-[11px] font-black tracking-widest uppercase italic">
            Member already?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 ml-1"
            >
              Login pulse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;