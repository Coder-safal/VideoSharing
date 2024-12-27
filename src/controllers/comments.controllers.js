
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/users.models.js";
import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { asyncHandler } from "../utils/AsyncHandle.utils.js";
import { ApiResponse } from "../utils/Apiresponse.utils.js";

const uploadComment = asyncHandler(async (req, res, next) => {

    const { videoId } = req.params;
    const { description } = req.body;

    if (!videoId && !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid video id");
    }

    if (!description) {
        throw new ApiError(401, "description is required fields!");
    }

    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized users to upload comments!");
    }

    const createComments = await Comment.create({
        description,
        videoId,
        CommentBy: req.user?._id,
    });

    if (!createComments) {
        throw new ApiError(500, "Errors while upload comments in database!");
    }


    return res.status(201).json(
        new ApiResponse(201, "comments upload succesfully!", createComments)
    );

});

const getAllComments = asyncHandler(async (req, res, next) => {

    const { videoId } = req.params;

    if (!videoId && !isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const allComments = await Comment.aggregate([
        {
            $match: {
                videoId: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "CommentBy",
                foreignField: "_id",
                as: "CommentBy",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            userName: 1,
                            email: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                videoId: 0,
            }
        },
        {
            $group: {
                _id: "$videoId",  // Group by videoId (if needed, else set to null)
                comments: { $push: "$$ROOT" }  // Push all the comments into an array
            }
        },
        {
            $addFields: {
                totalComments: { $size: "$comments" }  // Add totalComments based on the size of the comments array
            }
        },
        {
            $project: {
                _id: 0,  // Remove the _id field from the final output
                totalComments: 1,
                comments: 1
            }
        }
    ]);

    // console.log("all Comments: ", allComments);

    return res.status(200).json(
        new ApiResponse(
            200,
            "All comments fetch succesfully!",
            allComments[0],
        )
    )

})

const deleteComments = asyncHandler(async (req, res, next) => {

    const { commentId } = req.params;

    if (!req.user || !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized users!");
    }

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(401, "Invaid commentId!");
    }

    const delComment = await Comment.findOneAndDelete(
        {
            $and: [
                {
                    _id: commentId,
                },
                {
                    CommentBy: req.user?._id
                }
            ]
        }
    );

    if (!delComment) {
        throw new ApiError(500, "Internal errors while deleting comments!");
    }

    return res.status(200).json(
        new ApiResponse(200, "comments delete succesfully!", delComment)
    );
})

const updateComments = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const { description } = req.body;

    if (!req.user || !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized users!");
    }

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(401, "Invaid commentId!");
    }

    if (!description) {
        throw new ApiError(401, "description is required fields!");
    }

    const update = await Comment.findOneAndUpdate(
        {
            $and: [
                {
                    _id: commentId,
                },
                {
                    CommentBy: req.user?._id
                }
            ]
        },
        {
            $set: {
                description: description,
            }
        },
        {
            new: true,
        }
    );


    return res.status(201).json(
        new ApiResponse(
            201, "comments update Succesfully",
            update
        )
    );
})

export {
    uploadComment,
    getAllComments,
    deleteComments,
    updateComments
}