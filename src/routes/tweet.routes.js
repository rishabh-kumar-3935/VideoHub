import {Router} from 'express'
import { verifyJWT
 } from '../middlewares/auth.middleware.js'

 import{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    deleteTweetImage  
 } from "../controllers/tweet.controller.js"

 const router=Router();
 router.use(verifyJWT);

 router.route("/").post(
    upload.single("image"),
    createTweet
 );

 router.route("/").post(createTweet);
 router.route("/user/:userId").get(getUserTweets);
 router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);
 router.route("/remove-image/:tweetId").patch(deleteTweetImage);

 export default router;
