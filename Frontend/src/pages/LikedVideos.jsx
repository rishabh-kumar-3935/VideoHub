import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard'; 

function LikedVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLikedVideos = async () => {
        try {
            const res = await axiosInstance.get("/likes/videos");
            // Backend directly videoDetails return kar raha hai array mein
            setVideos(res.data.data || []);
        } catch (err) {
            console.error("Error fetching liked videos", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedVideos();
    }, []);

    if (loading) return (
        <div className="h-screen flex items-center justify-center text-white font-black italic uppercase animate-pulse">
            Loading Your Favorites...
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 min-h-screen text-white">
            <div className="flex items-center gap-4 mb-12">
                <div className="bg-red-600 p-4 rounded-3xl shadow-[0_0_25px_rgba(220,38,38,0.4)]">
                    <span className="text-3xl">❤️</span>
                </div>
                <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Liked Videos</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                        {videos.length} Videos Saved
                    </p>
                </div>
            </div>

            {videos.length === 0 ? (
                <div className="text-center py-24 bg-[#1a1a1a] rounded-[3rem] border border-dashed border-zinc-800">
                    <p className="text-zinc-500 font-black uppercase tracking-widest">No liked videos yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default LikedVideos;