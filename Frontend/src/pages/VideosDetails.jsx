import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance, { getSecureUrl } from "../api/axios";
import VideoCard from "../components/VideoCard"; 
import toast from "react-hot-toast";  
import { ThumbsUp, Share2, PlusSquare, MoreVertical, MessageSquare, CheckCircle2, X } from "lucide-react";

function VideoDetail() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [suggestedVideos, setSuggestedVideos] = useState([]); 
  const [commentText, setCommentText] = useState("");
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0); 
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0); 

  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const userData = useSelector((state) => state.auth.userData);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fixVideoUrl = (url) => {
    if (!url) return "";
    let secureUrl = getSecureUrl(url);
    if (secureUrl.includes("/image/upload/")) {
      return secureUrl.replace("/image/upload/", "/video/upload/");
    }
    return secureUrl;
  };

  const handleShare = () => {
    const videoUrl = window.location.href;
    navigator.clipboard.writeText(videoUrl)
      .then(() => toast.success("link copied! 🔗"))  
      .catch(() => toast.error("Failed to copy link"));  
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    const deleteToast = toast.loading("Removing video...");  
    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      toast.success("Video deleted successfully", { id: deleteToast });  
      window.location.href = "/"; 
    } catch (err) { 
      toast.error("Delete failed", { id: deleteToast });  
    }
  };

  const fetchVideoData = useCallback(async () => {
    try {
      const videoRes = await axiosInstance.get(`/videos/${videoId}`);
      const data = videoRes.data.data;
      setVideo(data);
      setIsLiked(!!data.isLiked);
      setLikesCount(data.likesCount || 0); 
      setIsSubscribed(!!data.owner?.isSubscribed);
      setSubscriberCount(data.owner?.subscribersCount || 0);
      
      const suggestionsRes = await axiosInstance.get(`/videos`);
      const allVideos = suggestionsRes.data.data.docs || suggestionsRes.data.data;
      const filtered = allVideos.filter(v => v._id.toString() !== videoId.toString());
      setSuggestedVideos(filtered);
    } catch (error) { console.error(error); }
  }, [videoId]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/comments/${videoId}`);
      setComments(res.data.data || []);
    } catch (err) { console.error(err); }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      fetchVideoData();
      fetchComments();
      if (userData) {
        axiosInstance.get(`/playlists/user/${userData._id}`).then(res => setPlaylists(res.data.data || []));
      }
    }
    window.scrollTo(0, 0); 
  }, [videoId, userData, fetchVideoData, fetchComments]);

  const handleLike = async () => {
    if (!userData) return toast.error("Please login to like");  
    try {
      const res = await axiosInstance.post(`/likes/toggle/video/${videoId}`);
      // Optimistic Update can be added, but following your logic:
      await fetchVideoData();
      if (!isLiked) toast.success("Video Liked! ❤️"); 
    } catch (err) { console.error(err); }
  };

  const handleSubscribe = async () => {
    if (!userData) return toast.error("Login required to subscribe");  
    try {
      await axiosInstance.post(`/subscriptions/c/${video.owner._id}`);
      await fetchVideoData();
      if (!isSubscribed) toast.success(`Subscribed to ${video.owner?.username}! `);  
      else toast.success("Unsubscribed");  
    } catch (err) { console.error(err); }
  };

  const handleAddComment = async () => {
    if (!userData) return toast.error("Login to comment");  
    if (!commentText.trim()) return toast.error("Comment cannot be empty");  
    
    const commentToast = toast.loading("Posting comment...");
    try {
      const res = await axiosInstance.post(`/comments/${videoId}`, { content: commentText });
      const newComment = { ...res.data.data, owner: userData, likesCount: 0, isLiked: false };
      setComments(prev => [newComment, ...prev]);
      setCommentText("");
      toast.success("Comment posted!", { id: commentToast });  
    } catch { 
      toast.error("Comment failed", { id: commentToast });  
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!userData) return toast.error("Login required"); 
    try {
      const res = await axiosInstance.post(`/likes/toggle/comment/${commentId}`);
      const { isLiked: liked } = res.data.data;
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, isLiked: liked, likesCount: liked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 1) - 1) } : c));
    } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success("Comment removed");  
    } catch { 
      toast.error("Delete failed"); 
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingText.trim()) return;
    try {
      await axiosInstance.patch(`/comments/c/${commentId}`, { content: editingText });
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, content: editingText } : c));
      setEditingCommentId(null);
      toast.success("Comment updated"); 
    } catch { 
      toast.error("Update failed"); 
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    const playlistToast = toast.loading("Adding to playlist...");
    try {
        await axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`);
        setShowPlaylistModal(false);
        toast.success("Added to playlist! 📁", { id: playlistToast });  
    } catch (error) {
        toast.error("Already in playlist or failed", { id: playlistToast });  
    }
  };

  if (!video) return <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-700 font-black italic tracking-[0.3em] animate-pulse uppercase text-xs">Syncing...</div>;

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-32">
      <div className="max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-8 p-4 md:p-6">
        
        <div className="flex-1 xl:max-w-[calc(100%-420px)]">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10 relative">
            <video 
              key={videoId}
              src={fixVideoUrl(video.videoFile)} 
              poster={getSecureUrl(video.thumbnail)}
              controls 
              autoPlay 
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-6 text-left">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-6">{video.title}</h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 relative">
              <div className="flex items-center gap-4">
                <Link to={`/channel/${video.owner?.username}`}>
                  <img src={getSecureUrl(video.owner?.avatar)} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-zinc-900 shadow-xl" alt="avatar" />
                </Link>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-black text-lg tracking-tight">{video.owner?.fullName || video.owner?.username}</p>
                    <CheckCircle2 size={16} className="text-blue-500" fill="currentColor" />
                  </div>
                  <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">{subscriberCount} subscribers</p>
                </div>
                <button 
                  onClick={handleSubscribe} 
                  className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest ml-4 transition-all active:scale-95 shadow-xl ${isSubscribed ? "bg-white/5 text-zinc-500" : "bg-white text-black hover:bg-zinc-200"}`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-visible pb-2 md:pb-0 relative">
                <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5 shadow-lg">
                  <button onClick={handleLike} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${isLiked ? "bg-white text-black" : "hover:bg-white/10 text-zinc-300"}`}>
                    <ThumbsUp size={16} fill={isLiked ? "currentColor" : "none"} /> {likesCount}
                  </button>
                  <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
                  
                  <button onClick={handleShare} className="px-5 py-2.5 rounded-xl font-black text-zinc-300 hover:bg-white/10 transition-all active:scale-90">
                    <Share2 size={16} />
                  </button>
                </div>
                
                <button onClick={() => setShowPlaylistModal(true)} className="bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95">
                  <PlusSquare size={16} /> Save
                </button>

                <div className="relative group focus-within:ring-0">
                    <button className="bg-white/5 hover:bg-white/10 border border-white/5 p-3 rounded-2xl shadow-lg transition-all active:scale-90 outline-none">
                      <MoreVertical size={16} />
                    </button>
                    <div className="absolute right-0 bottom-full mb-3 w-48 bg-[#121212] border border-white/10 rounded-[1.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-[999] p-2 overflow-hidden ring-1 ring-white/5">
                        <div className="flex flex-col">
                            {userData?._id === video.owner?._id ? (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteVideo(); }} 
                                  className="w-full text-left px-4 py-3 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-colors flex items-center gap-2"
                                >
                                  Delete 
                                </button>
                            ) : (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toast("Reported! Our team will check", {icon: "⚠️"}); }} 
                                  className="w-full text-left px-4 py-3 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-colors"
                                >
                                  Report
                                </button>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                                className="w-full text-left px-4 py-3 text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-xl transition-colors md:hidden"
                            >
                                Share Link
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-zinc-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-xl transition-all hover:bg-zinc-900/60">
               <div className="flex gap-4 mb-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white bg-blue-600/20 px-3 py-1 rounded-lg w-fit">{video.views.toLocaleString()} views</p>
                  <p className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 py-1">{new Date(video.createdAt).toLocaleDateString()}</p>
               </div>
               <p className="text-[15px] text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap">{video.description}</p>
            </div>
          </div>

          <div className="mt-12 text-left">
            <div className="flex items-center gap-3 mb-10">
               <MessageSquare size={20} className="text-blue-500" />
               <h3 className="text-xl font-black uppercase italic tracking-tighter">{comments.length} Discussion playcommunity</h3>
            </div>

            <div className="flex gap-5 mb-12">
              <img src={getSecureUrl(userData?.avatar)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover shadow-xl border border-white/5" alt="me" />
              <div className="flex-1">
                <textarea 
                  className="w-full bg-transparent border-b-2 border-zinc-800 py-3 focus:border-white outline-none text-base transition-all font-medium resize-none overflow-hidden h-12 hover:border-zinc-700" 
                  placeholder="Add a pulse comment..." 
                  value={commentText} 
                  onChange={(e) => setCommentText(e.target.value)} 
                />
                <div className="flex justify-end mt-4 gap-3">
                  <button onClick={() => setCommentText("")} className="text-zinc-500 font-black uppercase text-[10px] tracking-widest px-4 hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleAddComment} className="bg-white text-black hover:bg-zinc-200 px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95">Comment</button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-5 group/comment p-2 rounded-3xl transition-all hover:bg-white/5">
                  <Link to={`/channel/${c.owner?.username}`}>
                    <img src={getSecureUrl(c.owner?.avatar)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover shadow-lg" alt="user" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <p className="text-[13px] font-black tracking-tight text-white italic">@{c.owner?.username}</p>
                      <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                      {userData?._id === c.owner?._id && (
                        <div className="flex gap-4 opacity-0 group-hover/comment:opacity-100 transition-all ml-auto">
                          <button onClick={() => { setEditingCommentId(c._id); setEditingText(c.content); }} className="text-zinc-600 hover:text-blue-500 transition-colors"><Edit3 size={14}/></button>
                          <button onClick={() => handleDeleteComment(c._id)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === c._id ? (
                      <div className="mt-2 bg-black/40 p-4 rounded-2xl border border-blue-500/30">
                        <textarea className="w-full bg-transparent py-1 outline-none text-sm text-white resize-none" value={editingText} onChange={(e) => setEditingText(e.target.value)} autoFocus />
                        <div className="flex gap-4 mt-4 justify-end">
                          <button onClick={() => setEditingCommentId(null)} className="text-[10px] font-black uppercase text-zinc-500">Cancel</button>
                          <button onClick={() => handleUpdateComment(c._id)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Update</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[15px] text-zinc-300 leading-relaxed break-words">{c.content}</p>
                    )}
                    <button onClick={() => handleCommentLike(c._id)} className={`mt-4 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all ${c.isLiked ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "text-zinc-600 hover:text-zinc-300"}`}>
                       <ThumbsUp size={14} fill={c.isLiked ? "currentColor" : "none"} />
                       <span className="text-[12px] font-black">{c.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:w-[400px] flex flex-col gap-6 text-left">
           <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              <h4 className="text-[12px] font-black uppercase italic text-zinc-400 tracking-[0.3em]">PlayCommunity queue</h4>
           </div>
           
           <div className="flex flex-col gap-5 overflow-y-auto max-h-screen no-scrollbar pr-2">
              {suggestedVideos.map((v) => (
                <div key={v._id} className="scale-100 xl:scale-95 xl:origin-top-left transition-all hover:scale-100 hover:z-10 group/suggestion relative">
                   <VideoCard video={v} />
                   <div className="absolute top-2 right-2 opacity-0 group-hover/suggestion:opacity-100 transition-all">
                      <button className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10"><MoreVertical size={14}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>

      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] p-8 rounded-[3rem] w-full max-w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter">Add to PLAYCOMMUNITY</h2>
               <button onClick={() => setShowPlaylistModal(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
              {playlists.map((p) => (
                <button 
                  key={p._id} 
                  onClick={() => handleAddToPlaylist(p._id)} 
                  className="w-full group flex items-center justify-between p-5 bg-white/5 hover:bg-blue-600 rounded-[1.5rem] border border-white/5 transition-all text-sm font-black uppercase tracking-tight text-left"
                >
                  <span className="group-hover:translate-x-1 transition-transform">📁 {p.name}</span>
                  <PlusSquare size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
              {playlists.length === 0 && (
                <div className="py-10 text-center">
                   <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">No playlists created yet</p>
                </div>
              )}
            </div>
            <button onClick={() => setShowPlaylistModal(false)} className="w-full mt-8 py-4 bg-zinc-900 border border-white/5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-all">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const Edit3 = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
const Trash2 = ({size}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>

export default VideoDetail;