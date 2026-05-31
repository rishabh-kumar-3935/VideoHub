import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axiosInstance from '../api/axios'
import VideoCard from '../components/VideoCard'
import { Search, Filter, PlayCircle, AlertCircle, Loader2 } from 'lucide-react'

function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q")
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return
            setLoading(true)
            try {
                const res = await axiosInstance.get(`/videos?query=${query}`)
                // Backend docs structure ko handle kar rahe hain
                setVideos(res.data.data.docs || res.data.data || [])
            } catch (err) { 
                console.error("Search fetch error:", err) 
            } finally { 
                setLoading(false) 
            }
        }
        fetchResults()
    }, [query])

    if (loading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center text-white">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="font-black italic tracking-[0.2em] text-xs uppercase opacity-50">Searching ...</p>
        </div>
    )

    return (
        <div className="max-w-[1700px] mx-auto p-4 md:p-8 text-left min-h-screen pb-32">
            
            {/* Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5 shadow-xl">
                        <Search size={22} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black italic tracking-tighter">
                            Results for: <span className="text-blue-500">"{query}"</span>
                        </h1>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">
                            Found {videos.length} videos matching your query
                        </p>
                    </div>
                </div>

                {videos.length > 0 && (
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Filter size={14} /> Filter
                    </button>
                )}
            </div>
            
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 animate-in fade-in duration-500">
                    {videos.map(v => (
                        <div key={v._id} className="relative group">
                            <VideoCard video={v} />
                            {/* Hover Play Button Overlay */}
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <PlayCircle size={32} className="text-white drop-shadow-2xl" fill="rgba(37, 99, 235, 0.6)" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] bg-zinc-900/5 backdrop-blur-sm">
                    <div className="p-8 bg-zinc-900/50 rounded-full mb-6">
                        <AlertCircle size={48} className="text-zinc-700" />
                    </div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-400">Nothing found</h2>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-2">Try searching with a different name or creator</p>
                    <Link to="/" className="mt-8 bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-all active:scale-95">
                        Back to Home
                    </Link>
                </div>
            )}
        </div>
    )
}

export default SearchPage