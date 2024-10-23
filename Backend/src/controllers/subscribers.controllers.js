import { isValidObjectId } from "mongoose";
import { Subscriber } from "../models/subscribers.models.js";
import { asyncHandler } from "../utils/AsyncHandle.utils.js";
import { verifyJwt } from "./users.controllers.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/Apiresponse.utils.js";

const toogleSubscribe = asyncHandler(async (req, res, next) => {

    const { channelId } = req.params;

    if (!channelId && !isValidObjectId(channelId)) {
        throw new ApiError(401, "invalid channelId!");
    }

    const existSubscribe = await Subscriber.findById(req.user?._id);

    if (existSubscribe) {
        const delSubscriber = await Subscriber.findByIdAndDelete(req.user?._id);

        if (!delSubscriber) {
            throw new ApiError(401, "Errors while unsubscribe");
        }

        return res.status(200).json(
            new ApiResponse(200, "Channel unsubscribe succesfully!", delSubscriber)
        );
    }

    const createSubscriber = await Subscriber.create({
        subscriberby: req.user?._id,
        channel: channelId,
    })

    if (!createSubscriber) {
        throw new ApiError(400, "Errors while creating subscriber!");
    }


    return res.status(201).json(
        new ApiResponse(201, "Channel subscribe succesfully!", createSubscriber)
    );
})


const countSubscriber = asyncHandler(async (req, res, next) => {
    const { channelId } = req.params;
    if (!channelId && !isValidObjectId(channelId)) {
        throw new ApiError(401, "invalid channelId!");
    }

    const totalSubscriber = await Subscriber.countDocuments({ channelId: channelId });


    return res.status(200).json(
        new ApiResponse(200, "Total subscriber count succesfully!", { totalSubscriber })
    );
})

const countSubscribeTo = asyncHandler(async (req, res, next) => {

    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Unauthorized users!");
    }

    const countSubTo = await Subscriber.countDocuments({ subscriberby: req.user?._id });

    return res.status(200).json(
        new ApiResponse(200, "Subscribe to fetch succesfully!", { countSubTo })
    );
})


export {
    toogleSubscribe,
    countSubscribeTo,
    countSubscriber,
}

