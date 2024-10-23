import mongoose, { Schema } from "mongoose";


const subscriberSchema = new Schema(
    {
        subscriberby: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        channel: {
            type: mongoose.Types.ObjectId,
        }
    },
    {
        timestamps: true,
    }
)

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);