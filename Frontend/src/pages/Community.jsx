import React, { useEffect, useState, useRef } from 'react';
import axiosInstance, { getSecureUrl } from '../api/axios';
import { useSelector } from 'react-redux';
import { ImageIcon, Send, Heart, Trash2, Edit3, X, MessageSquare, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast'; // 🔥 Added Toast

function Community() {
    const [tweetContent, setTweetContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [tweets, setTweets] = useState([]);
    const { userData } = useSelector(state => state.auth);
    
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const fileInputRef = useRef(null);

    const fetchTweets = async () => {
        if (!userData?._id) return;
        try {
            const res = await axiosInstance.get("/tweets/user/" + userData?._id); 
            setTweets(res.data.data || []);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePostTweet = async () => {
        if (!tweetContent.trim() && !imageFile) {
            return toast.error("Please add some content or an image!"); 
        }

        const loadingToast = toast.loading("Sharing pulse to community..."); 
        
        const formData = new FormData();
        formData.append("content", tweetContent);
        if (imageFile) formData.append("image", imageFile);

        try {
            const res = await axiosInstance.post("/tweets", formData);
            const newTweet = {
                ...res.data.data,
                likesCount: 0,
                isLiked: false,
                owner: userData
            };
            setTweets([newTweet, ...tweets]);
            setTweetContent("");
            setImageFile(null);
            setImagePreview(null);
            toast.success("Pulse Shared! ", { id: loadingToast });  
        } catch (err) { 
            toast.error("Failed to post the content.", { id: loadingToast });  
        }
    };

    const handleToggleLike = async (tweetId) => {
        try {
            const res = await axiosInstance.post(`/likes/toggle/tweet/${tweetId}`);
            const isLikedNow = res.data.data.isLiked;

            setTweets(prev => prev.map(t => {
                if (t._id === tweetId) {
                    const currentCount = t.likesCount || 0;
                    return {
                        ...t,
                        isLiked: isLikedNow,
                        likesCount: isLikedNow ? currentCount + 1 : Math.max(0, currentCount - 1)
                    }
                }
                return t;
            }));
        } catch (err) {
            console.error("Like operation failed:", err);
        }
    };

    const handleRemoveImage = async (id) => {
        if (!window.confirm("Remove this photo?")) return;
        try {
            await axiosInstance.patch(`/tweets/remove-image/${id}`);
            setTweets(tweets.map(t => t._id === id ? { ...t, image: "" } : t));
            toast.success("Media removed successfully."); 
        } catch (err) { 
            toast.error("Error removing the image.");  
        }
    };

    const handleDeleteTweet = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await axiosInstance.delete(`/tweets/${id}`);
            setTweets(tweets.filter(t => t._id !== id));
            toast.success("Post deleted."); 
        } catch (err) { 
            toast.error("Failed to delete pulse."); 
        }
    };

    const handleUpdateTweet = async (id) => {
        if (!editContent.trim()) return;
        try {
            await axiosInstance.patch(`/tweets/${id}`, { content: editContent });
            setTweets(tweets.map(t => t._id === id ? { ...t, content: editContent } : t));
            setEditingId(null);
            toast.success("Post updated! ✨"); 
        } catch (err) { 
            toast.error("Failed to update.");  
        }
    };

    useEffect(() => { 
        if(userData) fetchTweets(); 
    }, [userData]);

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-10 text-left min-h-screen text-white selection:bg-blue-500/30 pb-32">
            <h2 className="text-3xl md:text-4xl font-black mb-10 uppercase italic tracking-tighter flex items-center gap-4">
                <span className="w-2 h-10 bg-green-600 rounded-full"></span>
                Community Feed
            </h2>
            
            {/* Input Box */}
            <div className="bg-[#0f0f0f] p-6 md:p-8 rounded-[2.5rem] border border-white/5 mb-10 shadow-2xl ring-1 ring-white/10 hover:ring-green-500/30 transition-all">
                <div className="flex gap-4">
                    <img src={getSecureUrl(userData?.avatar)} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
                    <textarea 
                        className="flex-1 bg-transparent text-lg outline-none border-none resize-none h-24 placeholder:text-zinc-600 font-medium pt-2"
                        placeholder="What's on your mind, creator?"
                        value={tweetContent}
                        onChange={(e) => setTweetContent(e.target.value)}
                    />
                </div>

                {imagePreview && (
                    <div className="relative mt-6 group bg-black/40 p-4 rounded-3xl border border-white/5 overflow-hidden">
                        <img src={imagePreview} className="w-full max-h-80 object-contain mx-auto rounded-2xl shadow-2xl" alt="preview" />
                        <button 
                            onClick={() => {setImageFile(null); setImagePreview(null)}} 
                            className="absolute top-6 right-6 bg-black/80 text-white p-2.5 rounded-full hover:bg-red-600 border border-white/10 transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-6">
                    <button 
                        onClick={() => fileInputRef.current.click()} 
                        className="text-zinc-400 hover:text-green-500 flex items-center gap-2.5 transition-all group"
                    >
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-green-500/10 transition-all">
                            <ImageIcon size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Media</span>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                    </button>
                    
                    <button 
                        onClick={handlePostTweet} 
                        className="bg-white text-black hover:bg-green-50 px-5 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Send size={14} /> Post 
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-8">
                {tweets.map(t => (
                    <div key={t._id} className="bg-zinc-900/20 p-6 md:p-8 rounded-[2.5rem] border border-white/5 group relative shadow-xl hover:bg-zinc-900/30 transition-all duration-300">
                        <div className="flex gap-5">
                            <img src={getSecureUrl(t.owner?.avatar || userData?.avatar)} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-[14px] font-black italic text-white tracking-tight">
                                            {t.owner?.fullName || userData?.fullName}
                                        </h4>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                                            {t.createdAt ? formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }) : "just now"}
                                        </p>
                                    </div>
                                    
                                    {userData?._id === (t.owner?._id || t.owner) && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => {setEditingId(t._id); setEditContent(t.content)}} className="p-2.5 bg-white/5 rounded-xl hover:text-blue-500 transition-colors">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteTweet(t._id)} className="p-2.5 bg-white/5 rounded-xl hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingId === t._id ? (
                                    <div className="mt-4">
                                        <textarea 
                                            className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-zinc-200 outline-none focus:border-blue-500/50" 
                                            value={editContent} 
                                            onChange={(e) => setEditContent(e.target.value)} 
                                        />
                                        <div className="flex gap-3 mt-4">
                                            <button onClick={() => handleUpdateTweet(t._id)} className="bg-green-600 px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button>
                                            <button onClick={() => setEditingId(null)} className="bg-zinc-800 px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-zinc-200 text-lg font-medium leading-relaxed mb-6">{t.content}</p>
                                        
                                        {t.image && (
                                            <div className="mt-6 rounded-[2rem] overflow-hidden border border-white/5 relative group/img">
                                                <img src={getSecureUrl(t.image)} className="w-full h-auto" alt="" />
                                                {userData?._id === (t.owner?._id || t.owner) && (
                                                    <button 
                                                        onClick={() => handleRemoveImage(t._id)} 
                                                        className="absolute top-4 right-4 bg-red-600 text-[10px] font-black px-4 py-2 rounded-full opacity-0 group-hover/img:opacity-100 transition-all"
                                                    >
                                                        Remove Media
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-8 mt-8 pt-6 border-t border-white/5">
                                            <button 
                                                onClick={() => handleToggleLike(t._id)}
                                                className={`flex items-center gap-2 font-black text-xs transition-all ${t.isLiked ? "text-red-500" : "text-zinc-500 hover:text-white"}`}
                                            >
                                                <Heart size={18} fill={t.isLiked ? "currentColor" : "none"} className="transition-transform group-active:scale-125" />
                                                {t.likesCount || 0}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Community;