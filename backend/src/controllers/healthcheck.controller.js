import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const healthcheck = asyncHandler(async(req ,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,{status:"Ok"},"Healthcheck passed: System is working fine")
    )
})

export {
    healthcheck
}