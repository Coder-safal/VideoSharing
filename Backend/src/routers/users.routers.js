import Router from "express";
import { upload } from "../middlewares/multer.js"
import {
    loginUser, registerUser,
    logOutUser, verifyJwt, updatePassword,
    updateUserName, updateEmail,
    updateAvatar, updateCoverImage,
    checkUserLogin
} from "../controllers/users.controllers.js";

const router = Router();


// regiseter users
router.route("/register").post(registerUser);
//login router
router.route("/login").post(loginUser);

// logOut
router.route("/logout").get(verifyJwt, logOutUser);
// change Password
router.route("/changePassword").patch(verifyJwt, updatePassword);

// change UserName 
router.route("/changeUserName").patch(verifyJwt, updateUserName);
// change Email
router.route("/changeEmail").patch(verifyJwt, updateEmail);

// change Avatar
router.route("/changeAvatar").patch(verifyJwt, upload.single('avatar'), updateAvatar)
router.route("/changecoverImage").patch(verifyJwt, upload.single('coverImage'), updateCoverImage)

// check user login or not 

router.route("/isLogin").get(verifyJwt, checkUserLogin);

export default router;