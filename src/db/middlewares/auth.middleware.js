import { ApiError } from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const authHeader = req.get("Authorization") || req.get("authorization");
        // const token = req.cookies?.accessToken || authHeader?.replace(/Bearer\s+/i, "").trim();


        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(401, "Invalid access token");
    }
})