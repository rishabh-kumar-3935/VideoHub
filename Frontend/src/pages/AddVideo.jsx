import React, { useState, useRef } from 'react'
import axiosInstance from '../api/axios'
import { useNavigate } from 'react-router-dom'
import { Upload, Image as ImageIcon, Film, X, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function AddVideo() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ title: "", description: "" })
    const [videoFile, setVideoFile] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    
    // Previews ke liye states
    const [videoPreview, setVideoPreview] = useState(null)
    const [thumbPreview, setThumbPreview] = useState(null)
    
    const navigate = useNavigate()
    const videoInputRef = useRef(null)
    const thumbInputRef = useRef(null)

    const handleVideoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setVideoFile(file)
            setVideoPreview(URL.createObjectURL(file))
        }
    }

    const handleThumbChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setThumbnail(file)
            setThumbPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!videoFile || !thumbnail) {
            return toast.error("Please select both video and thumbnail") 
        }
        
        setLoading(true)
        const uploadToast = toast.loading("Syncing Pulse to Cloud... ")  

        const data = new FormData()
        data.append("title", formData.title)
        data.append("description", formData.description)
        data.append("videoFile", videoFile)
        data.append("thumbnail", thumbnail)

        try {
            await axiosInstance.post("/videos", data) 
            toast.success("Pulse checking... Video published! ", { id: uploadToast })  
            navigate("/")
        } catch (error) {
            toast.error("Upload failed! Check your connection.", { id: uploadToast })  
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 text-left pb-32">
            {/* Header Section */}
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <Upload size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic">Upload Pulse</h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Share your creation with the world</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Side: Upload Areas */}
                <div className="space-y-6">
                    {/* Video Upload Box */}
                    <div 
                        onClick={() => videoInputRef.current.click()}
                        className={`relative group border-2 border-dashed transition-all cursor-pointer rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden h-64 ${videoPreview ? "border-blue-500/50 bg-black" : "border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-white/20"}`}
                    >
                        {videoPreview ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <Film size={40} className="text-blue-500 mb-3" />
                                <p className="text-sm font-bold text-zinc-300 truncate max-w-[200px]">{videoFile.name}</p>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase font-black tracking-widest">Video selected</p>
                                <button type="button" onClick={(e) => {e.stopPropagation(); setVideoPreview(null); setVideoFile(null)}} className="mt-4 bg-white/10 p-2 rounded-xl hover:bg-red-600 transition-colors"><X size={16}/></button>
                            </div>
                        ) : (
                            <>
                                <div className="p-5 bg-white/5 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                                    <Film size={32} className="text-zinc-500" />
                                </div>
                                <p className="font-bold text-sm text-zinc-400">Select Video File</p>
                                <p className="text-[10px] text-zinc-600 mt-2 uppercase font-black tracking-widest italic">MP4, MKV or MOV</p>
                            </>
                        )}
                        <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={handleVideoChange} />
                    </div>

                    {/* Thumbnail Upload Box */}
                    <div 
                        onClick={() => thumbInputRef.current.click()}
                        className={`relative group border-2 border-dashed transition-all cursor-pointer rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden h-48 ${thumbPreview ? "border-purple-500/50 bg-black" : "border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-white/20"}`}
                    >
                        {thumbPreview ? (
                            <img src={thumbPreview} className="w-full h-full object-cover opacity-60" alt="thumb preview" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <ImageIcon size={28} className="text-zinc-600 mb-2" />
                                <p className="font-bold text-xs text-zinc-500 uppercase tracking-tighter">Cover Image</p>
                            </div>
                        )}
                        {thumbPreview && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                                 <ImageIcon size={24} className="text-white mb-2" />
                                 <p className="text-[10px] font-black uppercase text-white tracking-widest">Change Cover</p>
                             </div>
                        )}
                        <input type="file" ref={thumbInputRef} hidden accept="image/*" onChange={handleThumbChange} />
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="bg-zinc-900/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5 h-fit space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-[0.2em]">Title</label>
                        <input 
                            type="text" 
                            placeholder="Give your pulse a catchy name..." 
                            className="w-full bg-black border border-white/5 rounded-2xl py-4 px-5 text-sm outline-none focus:border-blue-500 transition-all text-white font-medium"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-[0.2em]">Description</label>
                        <textarea 
                            placeholder="What is this video about?" 
                            rows="5"
                            className="w-full bg-black border border-white/5 rounded-3xl py-4 px-5 text-sm outline-none focus:border-blue-500 transition-all text-white font-medium resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            required
                        ></textarea>
                    </div>

                    {/* Progress Info */}
                    <div className="flex items-center gap-3 p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                        <AlertCircle size={18} className="text-blue-500 shrink-0" />
                        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">By publishing, you agree to PulsePlay's terms. Videos are processed in HD by default.</p>
                    </div>

                    <button 
                        disabled={loading}
                        className={`w-full py-4.5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${loading ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : "bg-white text-black hover:bg-blue-50"}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
                                Syncing to Cloud...
                            </>
                        ) : (
                            <>Publish Video</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddVideo