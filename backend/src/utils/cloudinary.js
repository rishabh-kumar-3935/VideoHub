import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Debug: Log environment variables at startup
console.log(" Cloudinary Config Loading:")
console.log("  CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "[MISSING]")
console.log("  CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "[SET]" : "[MISSING]")
console.log("  CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "[SET]" : "[MISSING]")


// Validate required env variables exist
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ ERROR: Missing Cloudinary environment variables. Check your .env file.")
  console.error("Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET")
}

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null

  let response = null
  try {
    response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    console.log("file is uploaded on cloudinary", response.url)
    return response
  } catch (error) {
    console.error("Cloudinary upload failed:", error?.message || error)
    return null
  } finally {
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath)
        console.log("Local temp file removed:", localFilePath)
      }
    } catch (cleanupError) {
      console.warn("Unable to remove local temp file:", cleanupError?.message || cleanupError)
    }
  }
}

const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  if (!publicId) return null
  try {
    const options = { resource_type: resourceType }
    const res = await cloudinary.uploader.destroy(publicId, options)
    console.log(`Cloudinary delete result for ${publicId}:`, res)
    return res
  } catch (err) {
    console.error("Cloudinary deletion failed:", err?.message || err)
    return null
  }
}

export {uploadOnCloudinary, deleteFromCloudinary}