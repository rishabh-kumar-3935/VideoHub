import React from 'react'
import { useDispatch } from 'react-redux'
import axiosInstance from '../../api/axios'
import { logout } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'  

function LogoutBtn() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const logoutHandler = () => {
        if (!window.confirm("Are you sure you want to logout?")) return;

        axiosInstance.post("/users/logout")
            .then(() => {
                dispatch(logout())
                navigate("/login")
            })
            .catch((err) => console.log("Logout error: ", err))
    }

    return (
        <button
            onClick={logoutHandler}
            className='flex items-center gap-2 p-2.5 md:px-5 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl md:rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
            title="Logout"
        >
            <LogOut size={18} strokeWidth={3} />
            <span className="hidden md:block">Logout</span>
        </button>
    )
}

export default LogoutBtn