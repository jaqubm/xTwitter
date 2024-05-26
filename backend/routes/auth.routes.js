import express from "express"

import { authCheck, signup, login, logout } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, authCheck)
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;