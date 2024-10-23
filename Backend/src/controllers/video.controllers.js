import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { asyncHandler } from "../utils/AsyncHandle.utils.js";
import { ApiResponse } from "../utils/Apiresponse.utils.js";
import {
    deleteInCloudinary, uplodaOnCloudinary,
    uplodaVideosOnCloudinary,
    getPublicIdFromUrl
} from "../middlewares/uplodaOnCloud.js";




const uploadVideo = asyncHandler(async (req, res, next) => {

    const { description, title } = req.body;

    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "you are not authorized users to upload video!");
    }

    if (!description || !title) {
        throw new ApiError(401, "description and title is required fields!");
    }

    let videoLocalpath = "";
    if (req.files && req.files?.video && req.files?.video[0].path) {
        videoLocalpath = req.files.video[0].path;
        console.log(videoLocalpath);
    }
    console.log(req.files);

    if (videoLocalpath == "") {
        throw new ApiError(401, "Video is required fields!");
    }
    let thumbnailLocalPath = "";

    if (req.files && req.files?.video && req.files?.thumbnail[0].path) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    if (thumbnailLocalPath == "") {
        throw new ApiError(401, "Thumbnail is required fields!");
    }

    console.log("video is uplod on cloudinary...");

    const video = await uplodaVideosOnCloudinary(videoLocalpath);
    if (!video) {
        throw new ApiError(500, "Errors while video uploading on cloudinary!");
    }

    const thumbnail = await uplodaOnCloudinary(thumbnailLocalPath);

    console.log("thumbnail: ", thumbnail.url);

    if (thumbnail == "") {
        throw new ApiError(500, "Errors while thumbnail uploading on cloudinary!");
    }


    const videoCreate = new Video({
        owner: new mongoose.Types.ObjectId(req.user?._id),
        thumbnail: thumbnail.url,
        videoUrl: video.url,
        description,
        title,
        duration: video.duration,
    })

    await videoCreate.save();


    // const videoWithuserDetails = await Video.aggregate([
    //     {
    //         $match: {
    //             owner: req.user?._id,
    //         }
    //     },
    //     // {
    //     //     $lookup: {
    //     //         from: "users",
    //     //         localField: "owner",
    //     //         foreignField: "_id",
    //     //         as: "owners",
    //     //     }
    //     // }
    // ]);

    return res.status(201).json(
        new ApiResponse(201, "Video uploded succesfully!", videoCreate)
    );
})


const updateThumbnail = asyncHandler(async (req, res, next) => {

    const { videoId } = req.params;

    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized users!");
    }
    if (!videoId && !isValidObjectId(videoId)) {
        throw new ApiError(401, "videoId is required fields!");
    }


    let thumbnailLocalpath = "";
    if (req.file && req.file?.path) {
        thumbnailLocalpath = req.file?.path;
    }


    if (!thumbnailLocalpath) {
        throw new ApiError(401, "Thumbnail is required fields!");
    }

    const video = await Video.findOne({
        $and: [
            {
                owner: req.user?._id,
            },
            {
                _id: videoId,
            }
        ]
    });

    if (!video) {
        throw new ApiError(401, "Video doesn't exists");
    }

    const Image_public_id = getPublicIdFromUrl(video.thumbnail);

    const deleteThumbnail = await deleteInCloudinary(Image_public_id);

    console.log("deleteThumbnail: ", deleteThumbnail);

    if (!deleteThumbnail.result === 'ok') {
        throw new ApiError(401, "thumbnail Deletation fails!");
    }

    const thumbnail = await uplodaOnCloudinary(thumbnailLocalpath);


    if (!thumbnail) {
        throw new ApiError(500, "Errors while thumbnail upload on cloudinary!");
    }

    const details = await Video.findByIdAndUpdate(
        video._id,
        {
            $set: {
                thumbnail: thumbnail.url,
            }
        },
        {
            new: true,
        }
    )

    return res.status(200).json(
        new ApiResponse(200, "thumbnail update succesfully!", details)
    );

})

const deleteVideo = asyncHandler(async (req, res, next) => {

    const { videoId } = req.params;

    if (!videoId && !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video Id!");
    }

    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "You are not authorize users!");
    }

    const delVideo = await Video.findOneAndDelete({
        $and: [
            {
                _id: videoId,
            },
            {
                owner: req.user?._id,
            }
        ]
    });

    if (!delVideo) {
        throw new ApiError(401, "Video isn't found or you do not have permission to delete it!");
    }

    return res.status(200).json(
        new ApiResponse(
            200, "Video deleted succesfully!", delVideo,)
    )
})

export {
    uploadVideo,
    updateThumbnail,
    deleteVideo,
}