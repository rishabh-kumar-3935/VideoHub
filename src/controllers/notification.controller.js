import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Notification } from "../models/notification.model.js";
import { Video } from "../models/video.model.js";
import { commentModel as Comment } from "../models/comment.model.js"; 


const getNotifications = asyncHandler(async(req ,res)=>
{
    const userId = req.user._id;
    const notification=await Notification.find({user:userId})
    .populate("fromUser","username fullName avatar")
    .populate({path: "video",model:"Video",select:"title thumbnail"})
    .populate({path:"comment",model:"commentModel",select:"content"})
    .sort({createdAt:-1});

    const unreadCount = await Notification.countDocuments({user: userId, isRead:false});
    return res.status(200).json(new ApiResponse (200,{notifications,unreadCount},"fetched"));
});


const markNotificationRead= asyncHandler(async(req ,res)=>{
    const {notificationId}= req.params;
    await Notification.findByIdAndUpdate(notificationId,{isRead:true});
    return res.status(200).json(new ApiResponse(200,{},"Read"));
});

const markAllNotificationsRead = asyncHandler(async(req,res)=>{
    await Notification.updateMany({user: req.user._id, isRead:false},{isRead:true});
    return res.status(200).json(new ApiResponse(200,{},"All Read"));
});


const deleteNotification =  asyncHandler(async(req,res)=>{
    const {notificationId} = req.params;
    await Notification.findByIdAndDelete(notificationId);
    return res.status(200).json(new ApiResponse(200,{},"Deleted successfully"));
});

export {
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    deleteNotification
}