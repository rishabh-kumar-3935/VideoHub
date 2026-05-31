import React, { useEffect, useState } from 'react';
import axiosInstance, { getSecureUrl } from '../api/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderPlus, Play, Clock, LayoutGrid, X, Folder } from 'lucide-react';
import toast from 'react-hot-toast';  

function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const userData = useSelector(state => state.auth.userData);
    const navigate = useNavigate();

    const fetchPlaylists = async () => {
        if (!userData?._id) return;
        try {
            const res = await axiosInstance.get(`/playlists/user/${userData._id}`);
            setPlaylists(res.data.data || []);
        } catch (err) {
            console.error("Fetch playlists error", err);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [userData]);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setLoading(true);
        const createToast = toast.loading("Creating your collection...");  
        try {
            await axiosInstance.post("/playlists", { 
                name, 
                description: description || "My amazing collection" 
            });
            setName("");
            setDescription("");
            setShowForm(false);
            fetchPlaylists(); 
            toast.success("Playlist created successfully! 📁", { id: createToast }); 
        } catch (err) {
            toast.error("Failed to create playlist.", { id: createToast }); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 text-left min-h-screen text-white pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5">
                        <LayoutGrid size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">Your playlists</h1>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">Organize your journey</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${showForm ? "bg-zinc-800 text-white" : "bg-white text-black hover:bg-zinc-200"}`}
                >
                    {showForm ? <X size={16}/> : <Plus size={16}/>}
                    {showForm ? "Cancel" : "New Playlist"}
                </button>
            </div>

            {/* Create Playlist Form (Modern Box) */}
            {showForm && (
                <div className="mb-12 bg-zinc-900/30 backdrop-blur-md p-8 rounded-[3rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <FolderPlus size={20} className="text-blue-500" />
                        <h2 className="text-lg font-black uppercase italic tracking-widest">Create collection</h2>
                    </div>
                    <form onSubmit={handleCreatePlaylist} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Playlist Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Late Night Vibes" 
                                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-white"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Short Description</label>
                            <input 
                                type="text"
                                placeholder="What's this about?" 
                                className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-medium text-white"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all disabled:opacity-50 shadow-lg active:scale-95"
                            >
                                {loading ? "Creating..." : "Create Collection"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Playlists Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {playlists.length > 0 ? playlists.map(p => {
                    const validVideos = p.videos?.filter(v => v !== null && v.isPublished) || [];
                    const validVideosCount = validVideos.length;
                    const firstVideoThumbnail = validVideosCount > 0 ? getSecureUrl(validVideos[0].thumbnail) : null;

                    return (
                        <div 
                            key={p._id} 
                            onClick={() => navigate(`/playlist/${p._id}`)}
                            className="group bg-zinc-900/20 rounded-[2.5rem] border border-white/5 p-4 hover:border-white/10 hover:bg-zinc-900/40 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden shadow-xl"
                        >
                            {/* Thumbnail Container */}
                            <div className="w-full aspect-video bg-zinc-800 rounded-[1.8rem] relative overflow-hidden mb-5 shadow-2xl border border-white/5">
                                {firstVideoThumbnail ? (
                                    <img src={firstVideoThumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <Folder size={48} className="text-zinc-800" />
                                    </div>
                                )}
                                
                                {/* YouTube Style Video Count Overlay */}
                                <div className="absolute inset-y-0 right-0 w-1/3 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-1 border-l border-white/5">
                                    <span className="text-white text-lg font-black">{validVideosCount}</span>
                                    <Play size={16} fill="white" className="text-white" />
                                </div>

                                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                    <div className="bg-white text-black px-5 py-2 rounded-full text-[10px] font-black tracking-widest shadow-2xl scale-90 group-hover:scale-100 transition-transform">VIEW PLAYLIST</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-2 pb-2">
                                <h2 className="font-bold text-xl truncate text-zinc-100 group-hover:text-blue-400 transition-colors leading-tight">{p.name}</h2>
                                <p className="text-zinc-500 text-xs mt-2 line-clamp-2 font-medium leading-relaxed h-8">
                                    {p.description || "No description provided"}
                                </p>
                                
                                <div className="mt-6 flex justify-between items-center pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-1 text-blue-500">
                                        <Clock size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            Playlist
                                        </span>
                                    </div>
                                    <span className="text-zinc-600 text-[9px] font-bold uppercase">
                                        {new Date(p.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-zinc-900/10 rounded-[3rem] border-2 border-dashed border-white/5">
                        <div className="p-6 bg-zinc-900/50 rounded-full mb-6">
                            <Folder size={40} className="text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.3em]">Library empty</p>
                        <p className="text-zinc-700 text-[10px] mt-2 font-bold uppercase tracking-widest">Create your first collection above</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Playlists;