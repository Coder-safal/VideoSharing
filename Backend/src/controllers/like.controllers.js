import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/users.models.js";
import { Like } from "../models/likes.models.js";
import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { asyncHandler } from "../utils/AsyncHandle.utils.js";
import { ApiResponse } from "../utils/Apiresponse.utils.js";

const toogleVideoLike = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;

    if (!req.user || !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized to toogle like!");
    }

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId!");
    }

    const existsLike = await Like.findOne(
        {
            $and: [
                { likeBy: req.user?._id },
                { videoId: videoId }
            ]
        }
    );

    if (existsLike) {
        const deleteLike = await Like.findByIdAndDelete(existsLike?._id);

        if (!deleteLike) {
            throw new ApiError(500, "Internal errors while removing like!");
        }

        return res.status(200).json(
            new ApiResponse(200, "Remove like sucessfully!", deleteLike)
        );
    }

    const createLike = await Like.create({
        videoId: videoId,
        likeBy: req.user?._id,
    });

    if (!createLike) {
        throw new ApiError(500, "Internal Errors while creating like documents!");
    }

    return res.status(201).json(
        new ApiResponse(200, "Video Like succesfully!", createLike)
    );
})


const toogleCommentLike = asyncHandler(async (req, res, next) => {
    const { commenId } = req.params;

    if (!req.user || !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized to toogle like!");
    }

    if (!commenId || !isValidObjectId(commenId)) {
        throw new ApiError(401, "Invalid commenId!");
    }

    const existsLike = await Like.findOne(
        {
            $and: [
                { likeBy: req.user?._id },
                { commenId: commenId }
            ]
        }
    );

    if (existsLike) {
        const deleteLike = await Like.findByIdAndDelete(existsLike?._id);

        if (!deleteLike) {
            throw new ApiError(500, "Internal errors while removing like!");
        }

        return res.status(200).json(
            new ApiResponse(200, "Remove like sucessfully!", deleteLike)
        );
    }

    const createLike = await Like.create({
        commenId: commenId,
        likeBy: req.user?._id,
    });

    if (!createLike) {
        throw new ApiError(500, "Internal Errors while creating like documents!");
    }

    return res.status(201).json(
        new ApiResponse(200, "Video Like succesfully!", createLike)
    );
})
/* 
const getAllVideoComments = asyncHandler(async (req, res, next) => {

    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid commenId!");
    }

    const getAllComments = await Comment.aggregate([
        {
            $match: new mongoose.Types.ObjectId(videoId)
        },
        {
            $lookup: {
                from: "users",
                localField: "likeBy",
                foreignField: "_id",
                as: "comments",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            email: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalComments: {
                    $size: "$comments",
                }
            }
        }
    ]);

    if (!getAllComments) {
        throw new ApiError(401, "Errors while getting comments!");
    }


    return res.status(200).json(
        new ApiResponse(200, "All comments fetch succesfully!!", getAllComments)
    );
})
 */

const countLike = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid commenId!");
    }

    const totalLike = await Like.countDocuments({ videoId: videoId });

    console.log("TotalLike: ", totalLike);

    return res.status(200).json(
        new ApiResponse(200, "Like count succesfully!", {totalLike})
    );

})

export {
    toogleVideoLike,
    toogleCommentLike,
    countLike,
}