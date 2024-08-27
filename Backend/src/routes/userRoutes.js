import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  userLoginStatus,
  verifyEmail,
  // verifyUser,
} from "../controllers/auth/userController.js";
import {
  deleteUser,
  getAllUsers,
} from "../controllers/auth/adminController.js";
import {
  protect,
  adminMiddleware,
  creatorMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

//User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);
//"Protect" in the above route is a middleware helps us to access the user, which is used in "getUser" method

//Admin routes
router.delete("/admin/user/:id", protect, adminMiddleware, deleteUser);
router.get("/admin/users", protect, creatorMiddleware, getAllUsers);
//"adminMiddleware" will allow to delete the user only if it's an admin
router.get("/login-status", userLoginStatus);

router.post("/verify-email", protect, verifyEmail);
// router.post("/verify-user/:verificationToken", verifyUser);

export default router;
