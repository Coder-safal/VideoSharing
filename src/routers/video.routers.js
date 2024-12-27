import { Router } from "express";
import { verifyJwt } from "../controllers/users.controllers.js";
import { upload } from "../middlewares/multer.js";
import {
    uploadVideo,
    updateThumbnail,
    deleteVideo
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/uploadVideo").post(verifyJwt, upload.fields([
    {
        name: "video",
        maxCount: 1,
    },
    {
        name: 'thumbnail',
        maxCount: 1,
    }
]), uploadVideo);

router.route("/updateThumbnail/:videoId").patch(verifyJwt, upload.single('thumbnail'), updateThumbnail);

router.route("/deleteVideo/:videoId").delete(verifyJwt, deleteVideo);

export default router;