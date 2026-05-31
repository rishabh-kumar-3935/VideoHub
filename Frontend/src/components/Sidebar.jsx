import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axiosInstance, { getSecureUrl } from "../api/axios";
import { useSelector } from "react-redux";
// Premium Icons (FolderPlay ki jagah PlaySquare use kiya hai error se bachne ke liye)
import {
  Home,
  Users,
  History,
  PlaySquare,
  LayoutDashboard,
  Heart,
} from "lucide-react";

function Sidebar() {
  const [subs, setSubs] = useState([]);
  const { status, userData } = useSelector((state) => state.auth);

  const fetchSubscriptions = async () => {
    if (status && userData?._id) {
      try {
        const res = await axiosInstance.get(`/subscriptions/u/${userData._id}`);
        setSubs(res.data.data || []);
      } catch (err) {
        console.error("Sidebar fetch error", err);
      }
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    window.addEventListener("subscriptionChange", fetchSubscriptions);
    return () => {
      window.removeEventListener("subscriptionChange", fetchSubscriptions);
    };
  }, [status, userData]);

  return (
    // Sidebar.jsx mein aside tag ko aise badlo:
<aside className="fixed left-0 top-20 h-[calc(100vh-80px)] w-0 lg:w-64 bg-[#050505] border-r border-white/5 overflow-y-auto no-scrollbar transition-all duration-300 z-40 invisible lg:visible">
      {/* Primary Navigation */}
      <div className="space-y-2 mb-10">
        {[
          { to: "/", name: "Home", icon: <Home size={20} /> },
          { to: "/community", name: "Community", icon: <Users size={20} /> },
          { to: "/history", name: "History", icon: <History size={20} /> },
          {
            to: "/playlists",
            name: "Playlists",
            icon: <PlaySquare size={20} />,
          },
          {
            to: "/dashboard",
            name: "Dashboard",
            icon: <LayoutDashboard size={20} />,
          },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-2xl transition-all relative group ${
                isActive
                  ? "text-white bg-white/5"
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {/* Left Active Indicator (Blue Line) */}
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-green-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                )}

                <span
                  className={`shrink-0 transition-colors ${isActive ? "text-white" : "group-hover:text-white"}`}
                >
                  {item.icon}
                </span>

                <span
                  className={`text-[11px] font-black uppercase tracking-[0.2em] hidden lg:block ${isActive ? "text-white" : ""}`}
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Subscriptions Section */}
      {status && subs.length > 0 && (
        <div className="hidden lg:block pt-6 border-t border-white/5">
          <h3 className="text-[10px] font-black text-zinc-700  px-3 mb-6 tracking-[0.3em]">
            Subscriptions
          </h3>
          <div className="space-y-3">
            {subs.map((channel) => (
              <NavLink
                key={channel._id}
                to={`/channel/${channel.username}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-2xl transition-all group ${
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={getSecureUrl(channel.avatar)}
                      className={`w-8 h-8 rounded-full object-cover border transition-all ${
                        isActive
                          ? "border-green-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          : "border-white/10 group-hover:border-white/30"
                      }`}
                      alt={channel.fullName}
                    />
                    <span
                      className={`text-sm truncate transition-all ${
                        isActive
                          ? "text-white font-bold"
                          : "text-zinc-400 group-hover:text-white font-medium"
                      }`}
                    >
                      {channel.fullName}
                    </span>

                    {/* Active Dot indicator */}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;