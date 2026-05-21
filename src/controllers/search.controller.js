import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video as Video } from "../models/video.model.js";
import { User } from "../models/users.model.js";
import { tweetModel as Tweet } from "../models/tweet.model.js";

const searchVideos = asyncHandler(async (req ,res)=>{
    const {q, page =1, limit =10, sort = "relevance"}=req.query;

    if(!q?.trim())throw new ApiError(400,"Search query is required");

    const sortOptions ={};
    if(sort ==="views")sortOptions.views=-1;
    else if(sort === "newest")sortOptions.createdAt =-1;
    else sortOptions.score = {$meta:"textScore"};

    const videos = await Video.find(
        {$text:{$search:q}},
        {score:{$meta :"textScore"}}
    )

    .sort(sortOptions)
    .skip((parseInt(limit,10)-1)*parseInt(limit,10))
    .limit(parseInt(limit,10))
    .populate("owner","username fullName avatar");

    return res.status(200)
    .json(new ApiResponse(200,videos, "Videos search result fetched"));
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;
  if (!q?.trim()) throw new ApiError(400, "Search query is required");

  const users = await User.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" }, password: 0, refreshToken: 0 }
  )
    .sort({ score: { $meta: "textScore" } })
    .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
    .limit(parseInt(limit, 10));

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users search results fetched"));
});

// --- Search Tweets ---
const searchTweets = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10, sort = "relevance" } = req.query;
  if (!q?.trim()) throw new ApiError(400, "Search query is required");

  const sortOptions = {};
  if (sort === "newest") sortOptions.createdAt = -1;
  else sortOptions.score = { $meta: "textScore" }; // relevance

  const tweets = await Tweet.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .sort(sortOptions)
    .skip((parseInt(page, 10) - 1) * parseInt(limit, 10))
    .limit(parseInt(limit, 10))
    .populate("owner", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets search results fetched"));
});

export { searchVideos, searchUsers, searchTweets };