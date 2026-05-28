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

function Dashboard(){
	const [data, setData] = useState(null);
	const {userData} = useSelector((state)=>state.auth);
	const [updating, setUpdating] = useState(false);
	const [activeSection,setActiveSection] = useState("videos");

	const [tweets, setTweets] = useState([]);
	const [subscribedChannels,setSubscribedChannels] = useState([]);

	const [isEditing, setIsEditing] = useState(false);
	const [ profileForm, setProfileForm] = useState({
		fullName: userData?.fullName || "",
		email: userData?.email || "",
		
	})

	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		oldPassword: "",
		newPassword: "",
	});

	const [editingTweetId, setEditingTweetId]=useState(null);
	const [tweetEditContent, setTweetEditContent] = useState("");

	const fetchSubscriptions = useCallback(async()=>{
		try{
			const res= await axiosInstance.get(`/subscriptions/${userData._id}`);
			setSubscribedChannels(res.data.data || []);
		}catch(err){
			console.error("Dashboard Subscriptions Error:",err);
		}
	},[userData]);

	const fetchDashboardData = useCallback(async()=>{
		try{
			const res = await axiosInstance.get("/dashboard");
			setData(res.data);
			const tweetRes = await axiosInstance.get(`/tweets/user/${userData._id}`);
			setTweets(tweetRes.data.data || []);

			fetchSubscriptions();
		}catch(err){
			console.error("Dashboard fetc Error:",err);
		}
	},[userData,fetchSubscriptions]);


	useEffect(()=>{
		fetchDashboardData();
	},[fetchDashboardData]);

	const handleUpdateProfile = async(e)=>{
        e.preventDefault();
		setUpdating(true);
		try{
			await axiosInstance.patch("/users/update-account",profileForm);
			toast.success("Account details updated!");
			window.location.reload();
		}catch(err){
			toast.error(err.response?.data?.message || "Update failed");
		}finally{
			setUpdating(false);
			setIsEditing(false);
		}
	};

	const handleChangePassword = async(e)=>{
		e.preventDefault();
		setUpdating(true);
		try{
			await axiosInstance.post("/users/change-password",password);
			toast.success("Password changed successfully!");
			setIsChangingPassword(false);
			setPasswordForm({oldPassword:"",newPassword:""});
		}catch(err){
			toast.error(err.response?.data?.message || "failed to change password");
		}finally{
			setUpdating(false);
		}
	};
	const handleDelteVideo= async(videoId)=>{
		  if(!window.confirm("Are you sure you want ot delte this video?"))return;
		  setUpdating(true);
		  try{
			await axiosInstance.delete(`/videos/${videoId}`);
			toast.success("Video deleted successfully!");
			fetchDashboardData();
		  }catch(err){
			toast.error("Delete failed");
		  }finally{
			setUpdating(false);
		  }
	};

	const handleEditVideo = async(videoId, oldTitle, oldDesc)=>{
		const newTitle = prompt("Edit Video Title:",oldTitle);
		if(!newTitle)return;

		setUpdating(true);
		try{
			await axiosInstance.patch(`/videos/${videoId}`,{
				title:newTitle,
				description:oldDesc,
			});
			toast.success("Video updated!");
			fetchDashboardData();
		}catch(err){
			toast.error("Update failed");
		}finally{
			setUpdating(false);
		}
	};

	const handleDelteTweet = async(tweetId)=>{
		if(!window.confirm("Are you sure want ot delte this posts? "))return;
		setUpdating(true);
		try{
			await axiosInstance.delete(`/tweets/${tweetId}`);
			toast.success("Post deleted!");
			setTweets((prev)=>prev.filter((t)=>t._id!==tweetId));
		}catch(err){
			toast.error("Delete failed");
		}finally{
			setUpdating(false);
		}


	};
	const handleEditTweet = async(tweetId)=>{
		if(!tweetEditContent.trim()){
			return;
		}
		setUpdating(true);
		try{
			await axiosInstance.patch(`/tweets/${tweetId}`,{
				content:tweetEditcontent,
			});
			toast.success("Post update")
		}catch(err){
			toast.error("Update failed");
		}
	};

}