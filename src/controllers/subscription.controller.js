import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid Channel Id");

    const subscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId,
    });

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id);
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, "Unsubscribed"));
    } else {
        await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        await Notification.create({
            user: channelId,
            fromUser: req.user?._id,
            type: "subscription",
        });
        return res.status(200).json(new ApiResponse(200, { subscribed: true }, "Subscribed"));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) throw new ApiError(400, "Invalid Channel Id");
    const subscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
            },
        },
        { $unwind: "$subscriberDetails" },
        { $replaceRoot: { newRoot: "$subscriberDetails" } },
    ]);
    return res.status(200).json(new ApiResponse(200, subscribers, "Subscriber fetched successfully"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) throw new ApiError(400, "Invalid Subscriber ID");

  const subscribedTo = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelDetails",
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    },
    { $unwind: "$channelDetails" },
    { $replaceRoot: { newRoot: "$channelDetails" } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedTo, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };