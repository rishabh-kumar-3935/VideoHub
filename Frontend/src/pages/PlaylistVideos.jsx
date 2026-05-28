import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { Trash2, Edit3, X, FolderOpen, PlayCircle, Save, AlertCircle } from 'lucide-react';

function PlaylistVideos() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const fetchPlaylistData = async () => {
        try {
            const res = await axiosInstance.get(`/playlists/${playlistId}`);
            if (res.data?.success) {
                setPlaylist(res.data.data);
                setNewName(res.data.data.name);
                setNewDesc(res.data.data.description);
            }
        } catch (err) {
            console.error("Error fetching playlist", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (playlistId) fetchPlaylistData();
    }, [playlistId]);

    const handleDeletePlaylist = async () => {
        if (window.confirm("Delete this entire playlist forever?")) {
            try {
                await axiosInstance.delete(`/playlists/${playlistId}`);
                navigate("/playlists");
            } catch (err) {
                alert("Failed to delete playlist");
            }
        }
    };

    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.patch(`/playlists/${playlistId}`, {
                name: newName,
                description: newDesc
            });
            setIsEditing(false);
            fetchPlaylistData();
        } catch (err) {
            alert("Failed to update playlist");
        }
    };

    const handleRemoveVideo = async (e, videoId) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Remove this video from playlist?")) {
            try {
                await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);
                fetchPlaylistData();
            } catch (err) {
                alert("Failed to remove video");
            }
        }
    };

    if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-700 font-black italic tracking-[0.3em] animate-pulse uppercase text-xs">Syncing Pulse...</div>;

    const validVideos = playlist?.videos?.filter(v => v !== null) || [];

    return (
        <div className="flex-1 bg-[#050505] min-h-screen text-white pb-32">
            <div className="max-w-[1700px] mx-auto p-4 md:p-8">
                
                {/* Header / Banner Section */}
                <div className="mb-12 bg-zinc-900/20 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        {!isEditing ? (
                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-zinc-800 rounded-2xl border border-white/5">
                                        <FolderOpen size={24} className="text-blue-500" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Playlist collection</p>
                                </div>
                                
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic mb-4 leading-none">
                                    {playlist?.name}
                                </h1>
                                
                                <p className="text-zinc-400 font-medium text-base md:text-lg max-w-3xl leading-relaxed">
                                    {playlist?.description || "No description provided for this collection."}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4 mt-8">
                                    <div className="flex items-center gap-2 bg-blue-600/10 px-5 py-2.5 rounded-2xl border border-blue-500/20">
                                        <PlayCircle size={16} className="text-blue-500" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-blue-500">{validVideos.length} Videos</span>
                                    </div>
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-2xl border border-white/5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                                    >
                                        <Edit3 size={14}/> Edit details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdatePlaylist} className="flex-1 flex flex-col gap-5 max-w-xl bg-black/40 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Collection Name</label>
                                    <input 
                                        type="text" 
                                        value={newName} 
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-black border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all"
                                        placeholder="Playlist Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Description</label>
                                    <textarea 
                                        value={newDesc} 
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full bg-black border border-white/5 p-4 rounded-2xl outline-none focus:border-blue-500 h-28 resize-none transition-all"
                                        placeholder="Tell people about this pulse collection..."
                                    />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button type="submit" className="flex-1 bg-white text-black py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 shadow-xl transition-all flex items-center justify-center gap-2">
                                        <Save size={14}/> Save pulse
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 bg-zinc-800 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">Cancel</button>
                                </div>
                            </form>
                        )}

                        <button 
                            onClick={handleDeletePlaylist}
                            className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-red-500/20 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                        >
                            <Trash2 size={16} /> Delete collection
                        </button>
                    </div>
                </div>

                {/* Videos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {validVideos.map(v => (
                        <div key={v._id} className="relative group p-2 bg-zinc-900/10 rounded-[2.5rem] border border-transparent hover:border-white/5 transition-all shadow-xl">
                            <VideoCard video={v} />
                            
                            <button 
                                onClick={(e) => handleRemoveVideo(e, v._id)}
                                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md hover:bg-red-600 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-2xl border border-white/10 z-20 active:scale-90"
                                title="Remove from playlist"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {validVideos.length === 0 && (
                    <div className="py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-zinc-900/5 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="p-6 bg-zinc-900/50 rounded-full mb-6">
                            <AlertCircle size={40} className="text-zinc-700" />
                        </div>
                        <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs italic">Pulse library is empty</p>
                        <p className="text-zinc-800 text-[10px] mt-2 font-bold uppercase tracking-widest">Add videos to see them here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlaylistVideos;