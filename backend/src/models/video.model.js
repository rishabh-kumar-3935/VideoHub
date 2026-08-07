import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      videoFile:{
        type:String ,// cloudinary url
        required:true
      },
      thumbnail:{
         type: String,
         required:true
      },
      description:{
        type: String ,
        required:true
      },
      duration:{
        type: Number,
        required:true
      },
      views:{
        type:Number,
        default:0
      },
      viewedBy: {
        type: [{
          type: Schema.Types.ObjectId,
          ref: "User"
        }],
        default: []
      },
      isPublished:{
        type: Boolean,
        default:true
      },
      owner:{
        type:Schema.Types.ObjectId,
        ref : "User"
      }
       
    },
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)