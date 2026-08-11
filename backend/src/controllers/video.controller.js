import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary ,deleteFromCloudinary} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

// 1. Get all videos with optimized search and filters
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const pipeline = [];

  // 1. Initial Match (Only Published)
  const matchStage = { isPublished: true };

  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid User ID");
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Pehle basic filter lagao
  pipeline.push({ $match: matchStage });

  // 2. Lookup Owner (Taki username/fullName par search kar sakein)
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$ownerDetails" },
      },
    }
  );

  //  3. Search Logic (Title OR Username OR FullName)
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query.trim(), $options: "i" } },
          { description: { $regex: query.trim(), $options: "i" } },
          { "owner.username": { $regex: query.trim(), $options: "i" } },
          { "owner.fullName": { $regex: query.trim(), $options: "i" } },
        ],
      },
    });
  }

  // 4. Sorting
  const sortField = sortBy || "createdAt";
  const sortOrder = sortType === "asc" ? 1 : -1;
  pipeline.push({ $sort: { [sortField]: sortOrder } });

  const videoAggregate = Video.aggregate(pipeline);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const videos = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// 2. Publish a video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => !field?.trim())) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path || req.files?.videosFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) throw new ApiError(400, "Video file is missing");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is missing");

    let videoFile, thumbnail;
    try {
        [videoFile, thumbnail] = await Promise.all([
            uploadOnCloudinary(videoFileLocalPath),
            uploadOnCloudinary(thumbnailLocalPath),
        ]);
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal Server Error while publishing video");
    }

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Upload failed. Please try again with a smaller file or better connection.");
    }

    const video = await Video.create({
        videoFile: videoFile.secure_url, // Use secure_url for HTTPS
        thumbnail: thumbnail.secure_url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user?._id,
        isPublished: true,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
});

// 3. Get Video By ID with SMART UNIQUE VIEWS logic
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

  const userId = req.user?._id
    ? new mongoose.Types.ObjectId(req.user._id)
    : null;

  const videoData = await Video.findById(videoId);
  if (!videoData) throw new ApiError(404, "Video not found");

  // 1. UNIQUE VIEWS LOGIC
  if (userId) {
    const isOwner = videoData.owner?.toString() === userId.toString();
    const hasNotViewed = !Array.isArray(videoData.viewedBy)
      ? true
      : !videoData.viewedBy.some((id) => id.toString() === userId.toString());

    if (!isOwner && hasNotViewed) {
      await Video.findByIdAndUpdate(videoId, {
        $addToSet: { viewedBy: userId },
        $inc: { views: 1 },
      });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { watchHistory: videoId },
    });
    await User.findByIdAndUpdate(userId, {
      $push: { watchHistory: videoId },
    });
  } else {
    // Guest views logic if needed
    // await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
  }

  // 3. AGGREGATION TO FETCH VIDEO DETAILS
  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: { $in: [userId, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: { $first: "$owner" },
        isLiked: {
          $cond: {
            if: { $in: [userId, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  if (!video?.length) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched and history updated"));
});

// 4. Update video
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized request");
  }

  let thumbnail;
  if (thumbnailLocalPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || video.title,
        description: description || video.description,
        thumbnail: thumbnail?.secure_url || video.thumbnail,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// 5. Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request");
    }
    if (video.videoFile) {
        const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
        await deleteFromCloudinary(videoPublicId, "video");
    }

    if (video.thumbnail) {
        const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
        await deleteFromCloudinary(thumbnailPublicId, "image");
    }

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video and assets deleted successfully"));
});

// 6. Toggle Publish Status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Unauthorized request");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        "Publish status toggled"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};