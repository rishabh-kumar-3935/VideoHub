import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const getDashboardDate= asyncHandler(async(req , res)=>{
    const userId = req.user?._id;
    if(!userId) throw new ApiError(401,"Unauthorized request");

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const statsAgg = await Video.aggregate([
        {$match :{owner: userObjectId}},
        {
            $lookup:{
                from:"likemodels",
                localField:"_id",
                foreignField:"video",
                as:"likes",
            },
        },
        {
            $group:{
                _id: null,
                totalViews:{$sum: "$views"},
                totalVideos:{$sum:1},
                totalLikes:{$sum:{$size:"$likes"}},
            },
        },
    ]);

    const totalSubscribers = await Subscription.countDocuments({
        channel:userObjectId,
    });

    const channelsSubscribedTo = await Subscription.countDocuments({
        subscriber:userObjectId,
    });

    const statsData= statsAgg[0] || {};
    const stats={
        totalViews: statsData.totalViews || 0,
        totalVideos:statsData.totalVideos || 0,
        totalLikes: statsData.totalLikes || 0,
        totalSubscribers,
        channelsSubscribedTo
    };

    const videos = await Video.aggregate([
        {$match:{owner : userObjectId}},
        {
            $lookup:{
                from: "users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {$project:{username:1,fullName:1,avatar:1}}
                ]
            }
        },
        {
            $addFields:{owner:{$first:"$owner"}}
        },
        {$sort:{createdAt:-1}}
    ]);

    const subscribedChannels=await Subscription.aggregate([
        {$match:{ subscriber: userObjectId}},
        {
            $lookup:{
                from:"user",
                localField:"channel",
                foreignField:"_id",
                as:"channelDetails",
                pipeline:[{$project:{username:1,fullName:1,avatar:1}}]
            },
        },
        {$unwind:"$channelDetails"},
        {$replaceRoot:{newRoot:"$channelDetails"}},
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                stats,
                videos,
                subscribedChannels,
            },
            "Dashboard data fetched successfullly"
        )
    );


});
export {getDashboardDate};
export const getDashboardData = getDashboardDate;