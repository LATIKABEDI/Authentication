import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
} from "../controllers/auth/userController.js";
import { deleteUser } from "../controllers/auth/adminController.js";
import { protect, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

//User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);
//"Protect" in the above route is a middleware helps us to access the user, which is used in "getUser" method

//Admin routes
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);
//"adminMiddleware" will allow to delete the user only if it's an admin

export default router;
