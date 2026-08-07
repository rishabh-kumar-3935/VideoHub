import {Router} from 'express';
import{
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    deleteNotification
} from "../controllers/notification.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(verifyJWT);

router.route("/").get(getNotifications);
router.route("/read/:notificationId").patch(markNotificationRead);
router.route("/read-all").patch(markAllNotificationsRead);
router.route("/:notificationId").delete(deleteNotification);

export default router;