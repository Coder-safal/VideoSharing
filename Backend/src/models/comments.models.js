import mongoose, { Schema } from "mongoose";

const commentsSchema = new Schema(
    {
        description: {
            type: String,
            required: true,
        },
        CommentBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
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

export const Comment = mongoose.model("Comment", commentsSchema);