import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middleware'

import{
    searchVideos, searchUsers, searchTweets 
}from "../controllers/search.controller.js"

const router=Router();

router.route("/videos").get(searchVideos);
router.route("/users").get(searchUsers);
router.route("/tweets").get(searchTweets);

export default router;