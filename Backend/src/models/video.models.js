import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
    {
        videoUrl: {
            type: String,//store on cloudinary
            required: true,
        },
        thumbnail: {
            type: String,//store on cloudinary
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 0,
        },
        title: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        }
    },
    {
        timestamps: true,
    }
);

videoSchema.pre("findOneAndDelete", async function (next) {
    const videoId = this.getQuery().$and[0]._id;

    console.log("video PreHooks:", this.getQuery().$and[0]._id);

    await mongoose.model('Comment').deleteMany({ videoId });
    await mongoose.model('Like').deleteMany({ videoId });

    next();
})

export const Video = mongoose.model("Video", videoSchema);