import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,

        },
        watchHistory: [{
            type: mongoose.Types.ObjectId,
            ref: "Video"
        }],
        avatar: {
            type: String, //store on cloudinary
        },
        coverImage: {
            type: String, //store on cloudinary
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

// hash password before save
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) { //isModified required field name
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    // console.log("Password is: ", this.password);
    next();
})

userSchema.methods.isCorrectPassword = async function (password) {
    return await bcryptjs.compare(password, this.password);
}


userSchema.methods.generateAccessToken = async function () {

    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIERY,
        }
    );
}
userSchema.methods.generateRefreshToken = async function () {

    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIERY,
        }
    );
}


export const User = mongoose.model("User", userSchema);