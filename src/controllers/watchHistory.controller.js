import { WatchHistory } from "../models/watchHistory.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Add video to watch history
const addToWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { videoId } = req.body;

  if (!videoId) throw new ApiError(400, "Video ID is required");

  // Remove old entry if exists
  await WatchHistory.findOneAndDelete({ user: userId, video: videoId });

  // Add new entry
  const history = await WatchHistory.create({ user: userId, video: videoId });

  // Keep only last 50 videos
  const count = await WatchHistory.countDocuments({ user: userId });
  if (count > 50) {
    const oldest = await WatchHistory.find({ user: userId })
      .sort({ watchedAt: 1 })
      .limit(count - 50);
    const idsToDelete = oldest.map((h) => h._id);
    await WatchHistory.deleteMany({ _id: { $in: idsToDelete } });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, history, "Video added to watch history"));
});

// Get watch history with pagination
const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await WatchHistory.countDocuments({ user: userId });

  const history = await WatchHistory.find({ user: userId })
    .sort({ watchedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "video",
      select: "title thumbnail views duration owner",
      populate: { path: "owner", select: "username avatar" },
    });

  return res
    .status(200)
    .json(new ApiResponse(200, { total, page, limit, history }, "Watch history fetched successfully"));
});

export { addToWatchHistory, getWatchHistory };