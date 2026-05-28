import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, History, LayoutGrid, Plus } from 'lucide-react';

function MobileNav() {
    const navItems = [
        { name: "Home", path: "/", icon: <Home size={22} /> },
        { name: "Feed", path: "/community", icon: <Users size={22} /> },
        { name: "History", path: "/history", icon: <History size={22} /> },
        { name: "Saved", path: "/playlists", icon: <LayoutGrid size={22} /> },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 z-50 h-[70px] px-2 shadow-[0_-15px_30px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center h-full max-w-md mx-auto relative">
                
                {navItems.slice(0, 2).map((item) => (
                    <NavLink 
                        key={item.name}
                        to={item.path}
                        className={({isActive}) => `flex flex-col items-center justify-center flex-1 gap-1 transition-all ${isActive ? "text-blue-500" : "text-zinc-500"}`}
                    >
                        {item.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest italic">{item.name}</span>
                    </NavLink>
                ))}

                <NavLink 
                    to="/add-video"
                    className="relative flex flex-col items-center justify-center px-4"
                >
                    <div className="bg-blue-600 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.6)] border-4 border-[#050505] -mt-10 transition-transform active:scale-90 hover:bg-blue-500">
                        <Plus size={24} strokeWidth={4} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Create</span>
                </NavLink>

                {navItems.slice(2).map((item) => (
                    <NavLink 
                        key={item.name}
                        to={item.path}
                        className={({isActive}) => `flex flex-col items-center justify-center flex-1 gap-1 transition-all ${isActive ? "text-blue-500" : "text-zinc-500"}`}
                    >
                        {item.icon}
                        <span className="text-[9px] font-black uppercase tracking-widest italic">{item.name}</span>
                    </NavLink>
                ))}

            </div>
        </nav>
    );
}

export default MobileNav;