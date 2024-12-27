import { Router } from "express";
// import { verify } from "jsonwebtoken";
import { verifyJwt } from "../controllers/users.controllers.js"
import { uploadComment, getAllComments, deleteComments, updateComments } from "../controllers/comments.controllers.js";


const router = Router();

// upload comments

router.route("/uploadComment/:videoId").post(verifyJwt, uploadComment);
// getAll comments
router.route("/getAllComments/:videoId").get(getAllComments);

// delete Comments
router.route("/deleteComments/:commentId").delete(verifyJwt, deleteComments);

//updateComments
router.route("/updateComments/:commentId").patch(verifyJwt, updateComments);


export default router;