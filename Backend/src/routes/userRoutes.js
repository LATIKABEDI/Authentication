import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
} from "../controllers/auth/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);
//"Protect" in the above route is a middleware helps us to access the user, which is used in "getUser" method

export default router;
