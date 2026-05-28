import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axios'
import { Trash2, X, Clock, PlayCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast' 

function History() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get("/users/history")
            setHistory(res.data.data || [])
        } catch (err) {
            console.error("Fetch history error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleClearHistory = async () => {
        if (!window.confirm("Clear all watch history? This cannot be undone.")) return;
        
        const clearToast = toast.loading("Clearing your journey...") 
        try {
            await axiosInstance.post("/users/clear-history")
            setHistory([])
            toast.success("History Cleared! ", { id: clearToast })  
        } catch (err) {
            toast.error("Failed to clear history", { id: clearToast }) 
        }
    }

    const handleRemoveFromHistory = async (e, videoId) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        try {
            await axiosInstance.delete(`/users/history/${videoId}`)
            setHistory(prev => prev.filter(v => v._id !== videoId))
            toast.success("Removed from history")  
        } catch (err) {
            toast.error("Could not remove video") 
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    return (
        <div className='max-w-5xl mx-auto p-4 md:p-8 text-left min-h-screen text-white pb-32'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/5 pb-8'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-zinc-900 rounded-2xl border border-white/5'>
                        <Clock size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className='text-3xl md:text-4xl font-black italic tracking-tighter'>Watch history</h1>
                        <p className='text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 italic'>Your pulse journey so far</p>
                    </div>
                </div>
                
                {history.length > 0 && (
                    <button 
                        onClick={handleClearHistory}
                        className='flex items-center gap-2 text-red-500 text-[11px] font-black uppercase tracking-[0.15em] hover:bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/10 transition-all active:scale-95'
                    >
                        <Trash2 size={14} /> Clear all
                    </button>
                )}
            </div>

            {loading ? (
                <div className='flex flex-col gap-6 animate-pulse'>
                    {[1,2,3].map(i => (
                        <div key={i} className='h-40 bg-zinc-900/50 rounded-[2.5rem] border border-white/5'></div>
                    ))}
                </div>
            ) : (
                <div className='flex flex-col gap-4 md:gap-6'>
                    {history.length > 0 ? history.map(v => (
                        <Link 
                            to={`/video/${v._id}`} 
                            key={v._id} 
                            className='relative flex flex-col md:flex-row gap-5 bg-zinc-900/20 p-4 md:p-5 rounded-[2.5rem] border border-white/5 hover:border-white/10 hover:bg-zinc-900/40 transition-all group shadow-xl'
                        >
                            {/* Remove Button */}
                            <button 
                                onClick={(e) => handleRemoveFromHistory(e, v._id)}
                                className="absolute top-4 right-4 md:top-6 md:right-8 p-2 bg-black/40 backdrop-blur-md rounded-xl text-zinc-500 hover:text-red-500 transition-all z-20 md:opacity-0 group-hover:opacity-100 border border-white/5"
                            >
                                <X size={18} />
                            </button>

                            {/* Thumbnail Area */}
                            <div className='relative w-full md:w-72 aspect-video shrink-0 overflow-hidden rounded-[1.8rem] shadow-2xl'>
                                <img src={v.thumbnail} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' alt={v.title} />
                                <div className='absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors'></div>
                                <div className='absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-lg text-[10px] font-black tracking-widest'>
                                    WATCHED
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className='flex-1 flex flex-col justify-center min-w-0 pr-4 md:pr-10'>
                                <h2 className='text-xl md:text-2xl font-bold tracking-tight text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-2'>
                                    {v.title}
                                </h2>
                                
                                <div className='flex items-center gap-2 mb-4'>
                                    <p className='text-zinc-500 font-bold text-[12px] tracking-tight'>
                                        {v.owner?.fullName}
                                    </p>
                                    <span className="text-zinc-800 text-xs">•</span>
                                    <p className='text-zinc-500 text-[12px] font-bold'>
                                        {v.views} views
                                    </p>
                                </div>

                                <p className='text-zinc-400 text-sm line-clamp-2 font-medium leading-relaxed hidden md:block'>
                                    {v.description}
                                </p>

                                <div className='mt-4 flex items-center gap-1 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300'>
                                    <PlayCircle size={14} />
                                    <span className='text-[10px] font-black uppercase tracking-[0.2em]'>Watch again</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem]">
                            <div className='p-6 bg-zinc-900/50 rounded-full mb-6'>
                                <Clock size={40} className="text-zinc-700" />
                            </div>
                            <p className='text-zinc-600 font-black uppercase italic tracking-[0.3em] text-xs'>History is clear.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default History