import React from 'react'
import { useDispatch } from 'react-redux'
import axiosInstance from '../../api/axios'
import {logout} from "../../store/authSlice"
import {useNavigate} from "react-router-dom"
import {Logout} from "lucide-react"

function LogoutBtn(){
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const logoutHandler=async()=>{
        if(!window.confirm("Are you sure you want to Logout?"))return;
        axiosInstance.post("/user/logout")
        .then((res)=>{
            dispatch(logout())
            navigate("/login")
        })
        .catch((err)=> console.log("Logout failed:",err))
    }
    return(
        <button
        onClick={logoutHandler}
        className='flex items-center gap-1 text-red-500'
        title="Logout"
        >
            <Logout size={18} strokeWidth={3}/>
            <span className='hidden md:block'>Logout</span>
        </button>
    )
}