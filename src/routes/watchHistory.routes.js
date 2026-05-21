import { Router } from "express";
import { addToWatchHistory, getWatchHistory } from "../controllers/watchHistory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(addToWatchHistory).get(getWatchHistory);

export default router;