import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // the user who receives the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["comment", "subscription", "video_like", "comment_like"],
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "commentModel",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export { Notification };