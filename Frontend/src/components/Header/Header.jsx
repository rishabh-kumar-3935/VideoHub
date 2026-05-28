import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance, { getSecureUrl } from "../../api/axios";
import LogoutBtn from "./LogoutBtn";
import { Bell, Search, Plus, X, CheckCheck, Trash2 } from "lucide-react";

function Header() {
  const { status, userData } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    if (status) {
      const getCount = () => {
        axiosInstance.get("/notifications").then((res) => {
          setUnreadCount(res.data.data.unreadCount || 0);
        });
      };
      getCount();
      const interval = setInterval(getCount, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.data.notifications || []);
      setShowNotif(!showNotif);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) { console.error("Delete failed", err); }
  };

  const getNotificationMessage = (n) => {
    const sender = n.fromUser?.username || "Someone";
    switch (n.type) {
      case "video_like": return `${sender} liked your video`;
      case "comment": return `${sender} commented on your video`;
      case "subscription": return `${sender} subscribed to your channel`;
      default: return `${sender} interacted with you`;
    }
  };

  return (
    <>
      <header className="h-20 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 fixed top-0 left-0 w-full z-[100] px-4 md:px-8 flex items-center justify-between gap-4">
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        
        {/* 1. Logo Section */}
        <Link to='/' className='flex items-center gap-3 shrink-0 h-12'>
            <div className='relative w-10 h-10 flex items-center justify-center'>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <defs>
                        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                    </defs>
                    <path d="M28 15C28 12.2386 30.2386 10 33 10H65C79.9117 10 92 22.0883 92 37C92 51.9117 79.9117 64 65 64H43V85C43 87.7614 40.7614 90 38 90C35.2386 90 33 87.7614 33 85V15H28Z" fill="url(#blueGrad)"/>
                    <path d="M52 28L70 37L52 46V28Z" fill="white" />
                </svg>
            </div>
            <div className='hidden sm:flex flex-col justify-center'> 
                <h1 className='text-[20px] font-black tracking-tighter leading-none text-white'>
                    PULSE<span className='text-blue-500 ml-1'>PLAY</span>
                </h1>
            </div>
        </Link>

        {/* 2. Desktop Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-[#121212] border border-white/5 rounded-2xl py-2.5 px-12 outline-none focus:border-blue-500/50 text-sm text-white placeholder:text-zinc-700"
              placeholder="Search Pulse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-2.5 text-zinc-500" size={18} />
          </div>
        </form>

        {/* 3. Action Section */}
        <div className="flex items-center gap-2 md:gap-5">
          <button onClick={() => setIsSearchOpen(true)} className="p-2.5 bg-white/5 rounded-xl text-zinc-400 md:hidden active:scale-90"><Search size={20} /></button>

          {status ? (
            <div className="flex items-center gap-2 md:gap-5 relative">
              {/* Notification Bell */}
              <button onClick={fetchNotifications} className={`p-2 transition-all hover:bg-white/5 rounded-xl relative ${unreadCount > 0 ? "text-blue-500" : "text-zinc-400"}`}>
                <Bell size={22} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full border-2 border-[#050505]"></span>}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute top-14 right-0 w-[300px] md:w-[380px] bg-[#121212] border border-white/10 rounded-[2rem] shadow-2xl p-5 z-[110] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-white italic tracking-widest text-[10px] uppercase">Feed</h3>
                    {notifications.length > 0 && (
                      <button onClick={handleClearAll} className="flex items-center gap-1 text-[10px] text-blue-500 font-black uppercase tracking-tighter hover:text-blue-400"><CheckCheck size={12} /> Mark all</button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar text-left">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n._id} className={`group relative p-3 rounded-2xl flex gap-3 items-center border border-transparent ${!n.isRead ? "bg-blue-600/5 border-blue-500/20" : "hover:bg-white/5"}`} onClick={() => handleMarkAsRead(n._id)}>
                          <img src={getSecureUrl(n.fromUser?.avatar)} className="w-9 h-9 rounded-full object-cover" />
                          <div className="flex-1 min-w-0 pr-6">
                            <p className={`${!n.isRead ? "text-white font-bold" : "text-zinc-500"} text-[10px] leading-tight`}>{getNotificationMessage(n)}</p>
                          </div>
                          <button onClick={(e) => handleDeleteNotif(e, n._id)} className="opacity-0 group-hover:opacity-100 absolute right-3 text-zinc-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                        </div>
                      ))
                    ) : (<p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center py-5 italic">No Notifications</p>)}
                  </div>
                </div>
              )}

              {/* Create (Desktop Only) */}
              <Link to="/add-video" className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 shadow-lg">
                <Plus size={18} strokeWidth={3} /> <span>Create</span>
              </Link>

              {/* Profile Avatar */}
              <Link to="/dashboard" className="shrink-0 active:scale-90 transition-transform">
                <img src={getSecureUrl(userData?.avatar)} className="w-10 h-10 rounded-2xl object-cover border-2 border-white/5 hover:border-blue-500/50 shadow-md"/>
              </Link>

              {/* Logout Component */}
              <LogoutBtn />
            </div>
          ) : (
            <div className="flex items-center gap-3 md:gap-5">
              <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 shadow-lg active:scale-95 transition-all">
                Join Now
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-[#050505] z-[200] p-4 flex flex-col md:hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input autoFocus className="w-full bg-[#121212] border border-blue-500/50 rounded-2xl py-4 px-12 text-white outline-none" placeholder="Search Pulse..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Search className="absolute left-4 top-4 text-blue-500" size={20} />
            </form>
            <button onClick={() => setIsSearchOpen(false)} className="p-4 bg-white/5 rounded-2xl text-white active:scale-90"><X size={24} /></button>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;