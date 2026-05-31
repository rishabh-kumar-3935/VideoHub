import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance, { getSecureUrl } from '../api/axios'
import VideoCard from '../components/VideoCard'
import toast from 'react-hot-toast' 

function ChannelProfile() {
    const { username } = useParams()
    const [channel, setChannel] = useState(null)
    const [videos, setVideos] = useState([])
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("videos")  

    const handleSubscribe = async () => {
        try {
            await axiosInstance.post(`/subscriptions/c/${channel._id}`);
            
            const currentlySubscribed = channel.isSubscribed;

            // Optimistic UI Update: Turant button aur count 
            setChannel(prev => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscriberCount: prev.isSubscribed ? prev.subscriberCount - 1 : prev.subscriberCount + 1
            }));

            if (!currentlySubscribed) {
                toast.success(`Subscribed to ${channel.fullName}! 🔔`);
            } else {
                toast.success("Unsubscribed from channel");
            }
        } catch (err) {
            console.error("Subscription Error:", err);
            toast.error("Action failed. Try again.");  
        }
    };

    const handleToggleLike = async (tweetId) => {
        try {
            const res = await axiosInstance.post(`/likes/toggle/tweet/${tweetId}`);
            const isLikedNow = res.data.data.isLiked;

            setTweets(prev => prev.map(t => {
                if (t._id === tweetId) {
                    return {
                        ...t,
                        isLiked: isLikedNow,
                        likesCount: isLikedNow ? (t.likesCount || 0) + 1 : Math.max(0, (t.likesCount || 1) - 1)
                    }
                }
                return t;
            }));
        } catch (err) {
            console.error("Like Error:", err);
        }
    };

    useEffect(() => {
        const fetchChannelData = async () => {
            setLoading(true)
            try {
                const channelRes = await axiosInstance.get(`/users/c/${username}`)
                const channelData = channelRes.data.data
                setChannel(channelData)

                const videoRes = await axiosInstance.get(`/videos?userId=${channelData._id}`)
                setVideos(videoRes.data.data.docs || [])

                const tweetRes = await axiosInstance.get(`/tweets/user/${channelData._id}`)
                setTweets(tweetRes.data.data || [])

            } catch (err) {
                console.error("Channel fetch error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchChannelData()
    }, [username])

    if (loading || !channel) return <div className="p-20 text-center animate-pulse text-zinc-500 font-black uppercase italic tracking-widest">Loading Channel Profile...</div>

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-blue-500/30">
            <div className="h-40 md:h-64 bg-zinc-900 w-full overflow-hidden border-b border-zinc-800">
                {channel.coverImage ? (
                    <img src={getSecureUrl(channel.coverImage)} className="w-full h-full object-cover" alt="cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800" />
                )}
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center gap-8 text-left">
                <img src={getSecureUrl(channel.avatar)} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black object-cover shadow-2xl" alt="avatar" />
                <div className="flex-1">
                    <h1 className="text-4xl font-black tracking-tighter italic">{channel.fullName}</h1>
                    <p className="text-zinc-500 font-bold mt-1 text-lg">@{channel.username}</p>
                    <div className="flex gap-4 mt-2 text-sm text-zinc-400 font-medium">
                        <span>{channel.subscriberCount} Subscribers</span>
                        <span>•</span>
                        <span>{videos.length} Videos</span>
                    </div>
                    
                    <button 
                        onClick={handleSubscribe}
                        className={`mt-6 px-10 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                        channel.isSubscribed ? "bg-zinc-800 text-zinc-400" : "bg-white text-black hover:bg-zinc-200"
                    }`}>
                        {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-4">
                <div className="flex gap-8 border-b border-zinc-800">
                    <button 
                        onClick={() => setActiveTab("videos")}
                        className={`pb-3 text-sm font-black uppercase italic tracking-widest transition-all ${activeTab === "videos" ? "border-b-2 border-white text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Videos
                    </button>
                    <button 
                        onClick={() => setActiveTab("community")}
                        className={`pb-3 text-sm font-black uppercase italic tracking-widest transition-all ${activeTab === "community" ? "border-b-2 border-white text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                        Community
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8 pb-20 text-left">
                {activeTab === "videos" ? (
                    videos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {videos.map(v => <VideoCard key={v._id} video={v} />)}
                        </div>
                    ) : (
                        <p className="text-center text-zinc-500 py-20 italic text-sm uppercase tracking-widest font-bold">No videos uploaded by this channel.</p>
                    )
                ) : (
                    <div className="max-w-3xl mx-auto space-y-6">
                        {tweets.length > 0 ? tweets.map(t => (
                            <div key={t._id} className="bg-[#1a1a1a] p-6 rounded-[2.5rem] border border-zinc-800 shadow-xl">
                                <div className="flex gap-4">
                                    <img src={getSecureUrl(channel.avatar)} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-900" alt="channel avatar" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-black uppercase tracking-tighter text-zinc-300">{channel.fullName}</span>
                                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-200 text-sm leading-relaxed mb-4">{t.content}</p>
                                        
                                        {t.image && (
                                            <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-800/50 bg-[#0c0c0c] p-2">
                                                <img src={getSecureUrl(t.image)} className="w-full max-h-[400px] object-contain rounded-xl" alt="community post" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800/30">
                                            <button 
                                                onClick={() => handleToggleLike(t._id)}
                                                className="flex items-center gap-1.5 hover:bg-zinc-800/50 px-3 py-1.5 rounded-full transition-all group"
                                            >
                                                <span className={`text-lg transition-transform group-active:scale-125 ${t.isLiked ? "text-red-500" : "text-zinc-500"}`}>
                                                    {t.isLiked ? "❤️" : "🤍"}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${t.isLiked ? "text-red-500" : "text-zinc-500"}`}>
                                                    {t.likesCount || 0}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-zinc-500 py-20 italic text-sm uppercase tracking-widest font-bold">This channel hasn't posted any community updates.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChannelProfile;