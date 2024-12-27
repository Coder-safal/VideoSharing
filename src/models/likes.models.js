import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likeBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        commentId: {
            type: mongoose.Types.ObjectId,
            ref: "Comment",
        },
        videoId: {
            type: mongoose.Types.ObjectId,
            ref: "Video",
        },
    },
    {
        timestamps: true,
    }
);

export const Like = mongoose.model("Like", likeSchema);