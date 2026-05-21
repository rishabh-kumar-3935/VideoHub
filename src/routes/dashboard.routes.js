import {Router} from 'express';
import {getDashboardData} from "../controllers/dashboard.controller.js";

import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();
router.get("/",verifyJWT,getDashboardData);

export default router;