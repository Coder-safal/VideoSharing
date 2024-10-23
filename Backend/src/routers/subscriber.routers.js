import Router from "express"
import { verifyJwt } from "../controllers/users.controllers.js";
import {
    toogleSubscribe, countSubscriber,
    countSubscribeTo
} from "../controllers/subscribers.controllers.js";


const router = Router();

router.route("/toogleSubscribe/:channelId").post(verifyJwt, toogleSubscribe);

router.route("/countSubscriber/:channelId").get(countSubscriber);

router.route("/countSubscribeTo").get(verifyJwt, countSubscribeTo);




export default router;