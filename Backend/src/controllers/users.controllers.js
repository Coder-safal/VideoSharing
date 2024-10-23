
import { ApiError } from "../utils/ApiError.utils.js";
import { ApiResponse } from "../utils/Apiresponse.utils.js";
import { asyncHandler } from "../utils/AsyncHandle.utils.js";
import { User } from "../models/users.models.js";
import { uplodaOnCloudinary } from "../middlewares/uplodaOnCloud.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import { isValidObjectId } from "mongoose";

// cookie option

const options = { httpOnly: true, secure: true };

// username Test
function validateUserName(userName) {
    // Check if username is alphanumeric, has 3-20 characters, and starts with a letter
    const isValidLength = userName.length >= 3 && userName.length <= 20;
    const startsWithLetter = /^[a-zA-Z]/.test(userName);
    const isAlphanumericWithExtras = /^[a-zA-Z0-9_.]+$/.test(userName);

    return isValidLength && startsWithLetter && isAlphanumericWithExtras;
}


//validate password check
function validatePassword(password) {
    const isValidLength = validator.isLength(password, { min: 8 });
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    return isValidLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
}

const verifyJwt = asyncHandler(async (req, res, next) => {

    let refresh = "";

    if (req.cookies && req.cookies?.refreshToken) {
        refresh = req.cookies?.refreshToken;
    }

    if (!refresh) {
        console.log("hello !")
        throw new ApiError(402, "Incorrect RefreshToken!");
    }
    
    const refreshToken = await jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET);


    if (!refreshToken) {
        throw new ApiError(401, "RefreshToken is incorrect!");
    }

    const findUser = await User.findById(refreshToken?._id);

    if (!findUser) {
        throw new ApiError(500, "Internal erros while find users!");
    }

    if (findUser.refreshToken !== refresh) {
        throw new ApiError(401, "RefreshToken isn't match!");
    }

    req.user = findUser;
    next();
})

const generateAccessRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(
                401,
                "Thsi Id users doesn't exists"
            );
        }

        const accessToken = await user.generateAccessToken();
        if (accessToken == "") {
            throw new ApiError(401, "Errors occurs while generating AccessToken");
        }
        const refreshToken = await user.generateRefreshToken();

        if (refreshToken == "") {
            throw new ApiError(401, "Errors occurs while generating refreshToken");
        }

        // console.log(`Access Token: ${accessToken} \n and refreshToken ${refreshToken}`);

        // user.refreshToken = refreshToken;

        return { accessToken, refreshToken };
    } catch (error) {

        console.log("Errors while generating access RefreshToken!");
        throw new ApiError(500, "While generating access,refresh Token!");
    }


}

const registerUser = asyncHandler(async (req, res, next) => {

    const { fullName, userName, password, email } = req.body;

    if ([fullName, userName, password, email].some((field) => field.trim() == "")) {
        throw new ApiError(401, "fullName,userName,password or email is required fields!");
    }

    if (!validator.isEmail(email)) {
        throw new ApiError(401, "Invalid email!");
    }

    if (!validateUserName(userName)) {
        throw new ApiError(401, "Invalid userName ,please enter valid email!");
    }

    const existsUser = await User.findOne({
        $or: [{ email }, { userName }]
    });
    if (existsUser) {
        throw new ApiError(401, "Already usersExists!");
    }

    const createUser = await User.create({
        fullName,
        userName,
        email,
        password,
    });

    const user = await User.findById(createUser?._id)
        .select("-password -refreshToken -watchHistory");

    if (!createUser) {
        throw new ApiError(500, `Errors while creating ${userName}  users!`);
    }

    return res.status(201).json(
        new ApiResponse(201, `users ${userName} create succesfully!`, user)
    );

})

const loginUser = asyncHandler(async (req, res, next) => {

    const { email, userName, password } = req.body;


    if (email == "" && userName == "") {
        throw new ApiError(401, "UserName or email one fields is required!");
    }

    if (!email == "") {
        if (!validator.isEmail(email)) {
            throw new ApiError(401, "Invalid email!");
        }
    }

    if (!userName == "") {
        if (!validateUserName(userName)) {
            throw new ApiError(401, "Invalid userName");
        }
    }

    const existsUser = await User.findOne(
        {
            $or: [
                { email },
                { userName }
            ]
        }
    );

    if (!existsUser) {
        throw new ApiError(401, "users Doesn't exists!!");
    }
    // console.log("Check!!");

    // console.log("ispasswordCorrect ", ispasswordCorrect);
    const ispasswordCorrect = await existsUser.isCorrectPassword(password);

    if (!ispasswordCorrect) {
        throw new ApiError(401, "Incorrect Password!");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(existsUser?._id);

    const user = await User.findByIdAndUpdate(existsUser?._id,
        {
            $set: { refreshToken: refreshToken, }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");


    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                "Users login succesfully!",
                user,
            )
        )

})

const logOutUser = asyncHandler(async (req, res, next) => {

    if (!req.user) {
        throw new ApiError(401, "users doesn't exists for logOut!");
    }

    const findUser = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true,
        }
    ).select("-password");


    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                "users logout succesfully!",
                findUser,
            )
        );
})

const updatePassword = asyncHandler(async (req, res, next) => {
    const { currPassword, oldPassword } = req.body;

    if (!currPassword || !oldPassword) {
        throw new ApiError(401, "currPassword and oldPassword is required fields!")
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Users isn't exists!");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {

        throw new ApiError(500, "Internal errors while finding users!");
    }

    const ispasswordCorrect = await user.isCorrectPassword(oldPassword);

    if (!ispasswordCorrect) {
        throw new ApiError(401, "Incorrect old Password");
    }

    user.password = currPassword;

    await user.save({ validateBeforeSave: true });

    const updateUser = await User.findById(user?._id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, "password change succesfully!", updateUser));
});


const updateUserName = asyncHandler(async (req, res, next) => {
    const { curruserName, olduserName } = req.body;

    if (!curruserName || !olduserName) {
        throw new ApiError(401, "curruserName and olduserName is required fields!")
    }

    if (!validateUserName(curruserName) || !validateUserName(olduserName)) {

        throw new ApiError(401, "Invalid olduserName or curruserName!");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Users isn't exists!");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {

        throw new ApiError(500, "Internal errors while finding users!");
    }

    if (!(user.userName === olduserName)) {
        throw ApiError(401, "Incorrect userName!");
    }

    const ExistsUsers = await User.findOne({ userName: curruserName });

    if (ExistsUsers) {
        throw new ApiError(401, `${curruserName} users already Exists!`);
    }

    user.userName = curruserName;

    await user.save({ validateBeforeSave: false });

    const updateUser = await User.findById(user?._id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, "userName change succesfully!", updateUser));
});

const updateEmail = asyncHandler(async (req, res, next) => {
    const { currEmail, oldEmail } = req.body;

    if (!currEmail || !oldEmail) {
        throw new ApiError(401, "currEmail and oldEmail is required fields!")
    }

    if (!validator.isEmail(currEmail) || !validator.isEmail(oldEmail)) {

        throw new ApiError(401, "Invalid currEmail or oldEmail!");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Users isn't exists!");
    }

    const user = await User.findById(req.user?._id);

    if (!user) {

        throw new ApiError(500, "Internal errors while finding users!");
    }

    if (!(user.email === oldEmail)) {
        throw new ApiError(401, "Incorrect Email!");
    }

    const ExistsUsers = await User.findOne({ email: currEmail });

    if (ExistsUsers) {
        throw new ApiError(401, `${currEmail} users already Exists!`);
    }

    user.email = currEmail;

    await user.save({ validateBeforeSave: false });

    const updateUser = await User.findById(user?._id).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, "email change succesfully!", updateUser));
});


// lekhadai xu yeko controllers
const updateAvatar = asyncHandler(async (req, res, next) => {
    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Users doesn't exists!");
    }

    let avatarLocalPath = "";

    if (req.file && req.file?.path) {
        avatarLocalPath = req.file?.path;
    }
    else {
        throw new ApiError(401, "Avatar is empty!");
    }

    const avatar = await uplodaOnCloudinary(avatarLocalPath);
    console.log("avatar in Cloudinary: ", avatar.url);

    if (!avatar) {
        throw new ApiError(500, "Internal errors while uploading avatar on cloudinary!");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");


    return res.status(201).json(
        new ApiResponse(201, "Avatar update succesfully!", user)
    );

})
const updateCoverImage = asyncHandler(async (req, res, next) => {
    if (!req.user && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "Users doesn't exists!");
    }

    let coverImageLocalPath = "";

    if (req.file && req.file?.path) {
        coverImageLocalPath = req.file?.path;
    }
    else {
        throw new ApiError(401, "coverImage is empty!");
    }

    const coverImage = await uplodaOnCloudinary(coverImageLocalPath);
    console.log("coverImage in Cloudinary: ", coverImageLocalPath.url);

    if (!coverImage) {
        throw new ApiError(500, "Internal errors while uploading avatar on cloudinary!");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            }
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");


    return res.status(201).json(
        new ApiResponse(201, "coverImage update succesfully!", user)
    );

})

const checkUserLogin = asyncHandler(async (req, res, next) => {

    if (!req.user && !req.user?._id && !isValidObjectId(req.user?._id)) {
        throw new ApiError(401, "users doesn't login!");
    }

    return res.status(200).json(
        new ApiResponse(200, "users is login!")
    );
})

export {
    registerUser,
    loginUser,
    logOutUser,
    verifyJwt,
    updatePassword,
    updateUserName,
    updateEmail,
    updateAvatar,
    updateCoverImage,
    checkUserLogin
}

