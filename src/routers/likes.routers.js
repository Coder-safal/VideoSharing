import { Router } from "express";

import {
    toogleVideoLike,
    toogleCommentLike,
    countLike,
} from "../controllers/like.controllers.js";
import { verifyJwt } from "../controllers/users.controllers.js";
const router = Router();

router.route("/toogleVideoLike/:videoId").post(verifyJwt, toogleVideoLike);

router.route("/toogleCommentLike/:commentId").post(verifyJwt, toogleCommentLike);

router.route("/countVideoLike/:videoId").get(countLike);


export default router;