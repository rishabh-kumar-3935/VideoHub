import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async(req ,res)=>
{
    const {name, description}= req.body

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400,"Name and description are required")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user?._id,
        videos:[]
    })
    return res
    .status(200)
    .json(new ApiResponse(200,playlist, "Playlist created successsfully"))
})

const getUserPlaylists = asyncHandler(async(req , res)=>{
    const {userId}=req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid User Id")
    }
    const playlists = await Playlist.find({owner: userId})
    .populate("videos")
    .sort({createdAt:-1})

    return res
    .status(200)
    .json(new ApiResponse(200,playlists ||[],"user playlists fetched successfully"))
})
 
const getPlaylistById = asyncHandler(async (req,res)=>{
    const {playlistId}=req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.findById(playlistId).populate({
        path:"videos",
        populate:{
            path:"owner",
            select:"username fullName avatar"
        }
    })
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async(req , res )=>{
    const {playlistId, videoId}=req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Playlist or Video Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) throw new ApiError(404,"Playlist not found")

    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"Unauthorized request")
    }    

    const updatedPlaylist = await playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{videos:videoId}
        },
        {new:true}
    )
    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async(req , res)=>{
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid IDs")
    }

    const playlist = await Playlist.findById(playlistId)

    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"Unauthorized request")
    }
    const updatedPlaylist= await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{videos:videoId}
        },
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"Video removed from playlist"))
})

const deletePlaylist = asyncHandler(async(req , res)=>{
    const {playlistId}= req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Id")
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist)throw new ApiError(404,"Playlist not found")

     if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403,"Unauthorized request")
     }   

     await Playlist.findByIdAndDelete(playlistId)

     return res
     .status(200)
     .json(new ApiResponse(200,{},"Playlists deleted successfully"))
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {name , description} = req.body

       if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID")
    }

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) throw new ApiError(404, "Playlist not found")

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{name,description}
        },
        {new : true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updatePlaylist,"Playlist updated successfully"))
})


export {
    createPlaylist,
    getUserPlaylists,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}