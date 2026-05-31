import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance, { getSecureUrl } from '../api/axios';
import { CheckCircle2, Users, Video, Camera, LayoutGrid } from 'lucide-react';

function Channel() {
    const { username: urlParam } = useParams();
    const [channelData, setChannelData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannelProfile = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get(`/users/c/${urlParam}`);
                if (res.data?.success) {
                    setChannelData(res.data.data);
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);
                setChannelData(null);
            } finally {
                setLoading(false);
            }
        };

        if (urlParam) fetchChannelProfile();
    }, [urlParam]); 

    const handleSubscribe = async () => {
        try {
            await axiosInstance.post(`/subscriptions/c/${channelData._id}`);
            window.dispatchEvent(new Event("subscriptionChange"));
            
            setChannelData(prev => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscriberCount: prev.isSubscribed ? prev.subscriberCount - 1 : prev.subscriberCount + 1
            }));
        } catch (err) {
            alert("Action failed! Try again.");
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-[#050505]">
            <p className="text-zinc-700 font-black italic tracking-[0.3em] animate-pulse uppercase text-xs">Syncing Channel...</p>
        </div>
    );

    if (!channelData) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-500">404: Channel not found</h2>
        </div>
    );

    return (
        <div className="flex-1 bg-[#050505] min-h-screen text-white text-left pb-32">
            
            {/* Banner Section */}
            <div className="h-48 md:h-72 bg-zinc-900 relative border-b border-white/5 overflow-hidden group">
                {channelData.coverImage ? (
                    <img src={getSecureUrl(channelData.coverImage)} className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" alt="cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-900/20 to-black"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60"></div>
            </div>

            <div className="max-w-[1500px] mx-auto px-4 md:px-10">
                {/* Profile Header Overlay */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-24 relative z-10 mb-12">
                    <div className="relative group shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <img 
                            src={getSecureUrl(channelData.avatar)} 
                            className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-[6px] border-[#050505] object-cover bg-zinc-800 shadow-2xl" 
                            alt="avatar" 
                        />
                    </div>
                    
                    <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 w-full">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h1 className="text-3xl md:text-6xl font-black tracking-tighter italic leading-none">
                                    {channelData.fullName}
                                </h1>
                                <CheckCircle2 size={24} className="text-blue-500 mt-1 md:mt-2" fill="currentColor" />
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 mt-2">
                                <p className="text-blue-500 font-black text-sm tracking-widest uppercase">@{channelData.username}</p>
                                <span className="text-zinc-800 text-xl">•</span>
                                <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-sm">
                                    <Users size={14} className="text-zinc-500" />
                                    <span>{channelData.subscriberCount} Subscribers</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleSubscribe}
                                className={`px-10 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                                    channelData.isSubscribed 
                                    ? 'bg-zinc-900 border border-white/5 text-zinc-500' 
                                    : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                            >
                                {channelData.isSubscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Channel Navigation Tabs */}
                <div className="flex gap-10 mb-10 border-b border-white/5 overflow-x-auto no-scrollbar">
                    <button className="pb-4 text-[11px] font-black uppercase tracking-widest text-blue-500 border-b-2 border-blue-500">Pulses</button>
                    <button className="pb-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">Playlists</button>
                    <button className="pb-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">Community</button>
                    <button className="pb-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">About</button>
                </div>

                {/* Channel Content Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Yahan aap VideoCard render karenge videos loop karke */}
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-zinc-900/5 backdrop-blur-sm">
                        <div className="p-6 bg-zinc-900/50 rounded-full w-fit mx-auto mb-6">
                            <Video size={32} className="text-zinc-700" />
                        </div>
                        <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-xs italic">Channel pulses coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Channel;