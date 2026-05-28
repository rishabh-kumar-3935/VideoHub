import React, { useEffect, useState, useCallback } from "react";
import axiosInstance, { getSecureUrl } from "../api/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom"; 
import VideoCard from "../components/VideoCard";
import toast from "react-hot-toast"; 
// Premium Icons
import {
  Edit3,
  Camera,
  Lock,
  Mail,
  User,
  BarChart2,
  Video,
  MessageSquare,
  Users,
  Trash2,
  X,
  CheckCircle,
  BellRing,  
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState(null);
  const { userData } = useSelector((state) => state.auth);
  const [updating, setUpdating] = useState(false);
  const [activeSection, setActiveSection] = useState("videos");
  const [tweets, setTweets] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]); 

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: userData?.fullName || "",
    email: userData?.email || "",
  });

  // Password Change States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [editingTweetId, setEditingTweetId] = useState(null);
  const [tweetEditContent, setTweetEditContent] = useState("");

  const fetchSubscriptions = useCallback(async () => {
    try {
      // Updated route to /u/ for subscribed channels list
      const res = await axiosInstance.get(`/subscriptions/u/${userData?._id}`);
      setSubscribedChannels(res.data.data || []);
    } catch (err) {
      console.error("Dashboard Subscription Error:", err);
    }
  }, [userData]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/dashboard");
      setData(res.data.data);
      const tweetRes = await axiosInstance.get(`/tweets/user/${userData?._id}`);
      setTweets(tweetRes.data.data || []);
      
      fetchSubscriptions(); 
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  }, [userData, fetchSubscriptions]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axiosInstance.patch("/users/update-account", profileForm);
      toast.success("Account details updated!");  
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");  
    } finally {
      setUpdating(false);
      setIsEditingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axiosInstance.post("/users/change-password", passwordForm);
      toast.success("Password changed successfully!");  
      setIsChangingPassword(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");  
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    setUpdating(true);
    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      toast.success("Video deleted successfully!"); 
      fetchDashboardData();
    } catch (err) {
      toast.error("Delete failed");  
    } finally {
      setUpdating(false);
    }
  };

  const handleEditVideo = async (videoId, oldTitle, oldDesc) => {
    const newTitle = window.prompt("Edit Video Title:", oldTitle);
    if (!newTitle) return;

    setUpdating(true);
    try {
      await axiosInstance.patch(`/videos/${videoId}`, {
        title: newTitle,
        description: oldDesc,
      });
      toast.success("Video updated!");  
      fetchDashboardData();
    } catch (err) {
      toast.error("Update failed"); 
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setUpdating(true);
    try {
      await axiosInstance.delete(`/tweets/${tweetId}`);
      toast.success("Post deleted!");  
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
    } catch (err) {
      toast.error("Delete failed");  
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTweet = async (tweetId) => {
    if (!tweetEditContent.trim()) return;
    setUpdating(true);
    try {
      await axiosInstance.patch(`/tweets/${tweetId}`, {
        content: tweetEditContent,
      });
      toast.success("Post updated!"); 
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId ? { ...t, content: tweetEditContent } : t,
        ),
      );
      setEditingTweetId(null);
    } catch (err) {
      toast.error("Update failed");  
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("avatar", file);
    setUpdating(true);
    try {
      await axiosInstance.patch("/users/avatar", form);
      toast.success("Avatar updated!");  
      window.location.reload();
    } catch (err) {
      toast.error("Upload failed");  
      setUpdating(false);
    }
  };

  const handleCoverUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("coverImage", file);
    setUpdating(true);
    try {
      await axiosInstance.patch("/users/cover-image", form);
      toast.success("Cover image updated!");  
      window.location.reload();
    } catch (err) {
      toast.error("Upload failed");  
      setUpdating(false);
    }
  };

  const handleUnsubscribe = async (channelId) => {
    if (!window.confirm("Unfollow this creator?")) return;
    setUpdating(true);
    try {
      await axiosInstance.post(`/subscriptions/c/${channelId}`);
      toast.success("Unsubscribed!");  
      fetchSubscriptions(); 
    } catch (err) {
      toast.error("Action failed");  
    } finally {
      setUpdating(false);
    }
  };

  if (!data)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-zinc-700 font-black italic tracking-widest animate-pulse uppercase">
        Syncing Dashboard...
      </div>
    );

  const stats = data.stats || {};
  const rawVideos = Array.isArray(data.videos)
    ? data.videos
    : data.videos?.docs || [];
  const videosList = rawVideos.map((v) => ({
    ...v,
    owner: userData,
  }));

  return (
    <div className="flex-1 bg-[#050505] text-white overflow-y-auto no-scrollbar min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8 text-left">
        
        {/* Cover Section */}
        <div className="relative group h-40 md:h-60 w-full bg-zinc-900 rounded-[2.5rem] overflow-hidden mb-12 border border-white/5 shadow-2xl">
          <img
            src={getSecureUrl(userData?.coverImage)}
            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
            alt="cover"
          />

          <label className="absolute bottom-6 right-8 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl cursor-pointer hover:bg-blue-600 hover:scale-110 transition-all border border-white/10 opacity-0 group-hover:opacity-100 shadow-2xl z-20 flex items-center justify-center">
            <input
              type="file"
              className="hidden"
              onChange={handleCoverUpdate}
              accept="image/*"
            />
            <Camera size={20} className="text-white" />
          </label>

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 px-4 -mt-20 md:-mt-28 mb-12 relative z-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <img
              src={getSecureUrl(userData?.avatar)}
              className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-[#050505] object-cover bg-zinc-800 shadow-2xl"
              alt="avatar"
            />
            <label className="absolute bottom-2 right-2 bg-blue-600 p-3 rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-transform border-4 border-[#050505] z-20 flex items-center justify-center">
              <input
                type="file"
                className="hidden"
                onChange={handleAvatarUpdate}
                accept="image/*"
              />
              <Camera size={18} />
            </label>
          </div>

          <div className="mb-2 text-center md:text-left flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight italic">
                  {userData?.fullName}
                </h1>
                <CheckCircle
                  size={24}
                  className="text-blue-500 mt-1"
                  fill="currentColor"
                />
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3">
                <p className="text-blue-500 font-bold text-sm tracking-tight">
                  @{userData?.username}
                </p>
                <span className="text-zinc-800 text-xl">•</span>
                <p className="text-zinc-400 font-medium text-sm">
                  <span className="text-white font-bold">
                    {stats.totalSubscribers || 0}
                  </span>{" "}
                  Subscribers
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="bg-white text-black hover:bg-zinc-200 px-10 py-3.5 rounded-2xl font-bold text-[11px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                <User size={14} /> Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="bg-zinc-900 border border-white/5 text-white p-3.5 rounded-2xl hover:bg-zinc-800 transition-all shadow-xl"
              >
                <Lock size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            {
              l: "Total Views",
              v: stats.totalViews,
              i: <BarChart2 size={18} className="text-blue-500" />,
            },
            {
              l: "Videos",
              v: stats.totalVideos || videosList.length,
              i: <Video size={18} className="text-purple-500" />,
            },
            {
              l: "Likes",
              v: stats.totalLikes,
              i: <MessageSquare size={18} className="text-red-500" />,
            },
            {
              l: "Subscribers",
              v: stats.totalSubscribers,
              i: <Users size={18} className="text-green-500" />,
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all shadow-xl group"
            >
              <div className="p-3 bg-black/40 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                {s.i}
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter">
                {s.v || 0}
              </h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                {s.l}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs - Added Subscriptions */}
        <div className="flex gap-10 mb-10 border-b border-white/5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection("videos")}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${activeSection === "videos" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Manage Videos
          </button>
          <button
            onClick={() => setActiveSection("tweets")}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${activeSection === "tweets" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Manage Posts
          </button>
          <button
            onClick={() => setActiveSection("subscriptions")}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${activeSection === "subscriptions" ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Manage Subscriptions
          </button>
        </div>

        {/* Sections Rendering */}
        {activeSection === "videos" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-32">
            {videosList.map((v) => (
              <div
                key={v._id}
                className="relative group bg-zinc-900/20 p-2 rounded-[2.5rem] border border-transparent hover:border-white/10 transition-all shadow-lg"
              >
                <VideoCard video={v} />
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <button
                    onClick={() =>
                      handleEditVideo(v._id, v.title, v.description)
                    }
                    className="bg-white text-black p-2.5 rounded-xl shadow-2xl hover:scale-110 transition-transform"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(v._id)}
                    className="bg-red-600 text-white p-2.5 rounded-xl shadow-2xl hover:scale-110 transition-transform"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeSection === "tweets" ? (
          <div className="max-w-4xl space-y-6 pb-32">
            {tweets.length > 0 ? (
              tweets.map((t) => (
                <div
                  key={t._id}
                  className="bg-zinc-900/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 shadow-xl"
                >
                  {editingTweetId === t._id ? (
                    <div className="w-full">
                      <textarea
                        className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm outline-none focus:border-blue-500 transition-all text-white"
                        value={tweetEditContent}
                        onChange={(e) => setTweetEditContent(e.target.value)}
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleUpdateTweet(t._id)}
                          className="bg-blue-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Save Change
                        </button>
                        <button
                          onClick={() => setEditingTweetId(null)}
                          className="bg-zinc-800 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="text-zinc-200 text-base leading-relaxed font-medium">
                          {t.content}
                        </p>
                        <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-4 block">
                          {new Date(t.createdAt).toDateString()}
                        </span>
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button
                          onClick={() => {
                            setEditingTweetId(t._id);
                            setTweetEditContent(t.content);
                          }}
                          className="p-2.5 bg-white/5 rounded-xl hover:text-blue-500 transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTweet(t._id)}
                          className="p-2.5 bg-white/5 rounded-xl hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">
                  Community Feed Empty
                </p>
              </div>
            )}
          </div>
        ) : (
          /* SUBSCRIPTION TAB CONTENT */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {subscribedChannels.length > 0 ? (
              subscribedChannels.map((sub) => (
                <div 
                  key={sub._id} 
                  className="bg-zinc-900/40 backdrop-blur-md p-5 rounded-[2.5rem] border border-white/5 hover:border-blue-500/20 transition-all flex items-center justify-between group"
                >
                  <Link 
                    to={`/channel/${sub.username}`} 
                    className="flex items-center gap-4 flex-1 overflow-hidden"
                  >
                    <img 
                      src={getSecureUrl(sub.avatar)} 
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform" 
                      alt="avatar" 
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-white font-black italic tracking-tighter truncate text-left">
                        {sub.fullName}
                      </h4>
                      <p className="text-blue-500 text-[10px] font-bold text-left">
                        @{sub.username}
                      </p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleUnsubscribe(sub._id)}
                    className="p-3 bg-white/5 hover:bg-red-600/10 text-zinc-500 hover:text-red-500 rounded-2xl transition-all"
                    title="Unfollow"
                  >
                    <BellRing size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-xs">
                  No Subscriptions Yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Identity Setting Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[150] p-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-8 md:p-10 rounded-[3rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Identity Settings
              </h2>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                  Public Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-5 top-5 text-zinc-600"
                  />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/5 rounded-[1.2rem] py-4.5 pl-14 pr-5 text-sm outline-none focus:border-blue-500 transition-all text-white"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-5 top-5 text-zinc-600"
                  />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full bg-black border border-white/5 rounded-[1.2rem] py-4.5 pl-14 pr-5 text-sm outline-none focus:border-blue-500 transition-all text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-black uppercase text-[11px] tracking-widest py-4.5 rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                Confirm Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[160] p-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-8 md:p-10 rounded-[3rem] w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Update Password
              </h2>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={handleChangePassword}
              className="space-y-6 text-left"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full bg-black border border-white/5 rounded-[1.2rem] py-4.5 px-5 text-sm outline-none focus:border-white transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-black border border-white/5 rounded-[1.2rem] py-4.5 px-5 text-sm outline-none focus:border-white transition-all text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-black uppercase text-[11px] tracking-widest py-4.5 rounded-2xl hover:bg-blue-50 transition-all active:scale-95 shadow-xl"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Updating Overlay */}
      {updating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-white italic tracking-widest uppercase text-[10px]">
              Processing Pulse...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;