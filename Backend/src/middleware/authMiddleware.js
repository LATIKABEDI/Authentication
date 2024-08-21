import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/userModel.js";

export const protect = asyncHandler(async (request, response, next) => {
  try {
    const token = request.cookies.token;
    if (!token) {
      response.status(401).json({ message: "Not authorized, please login!!" });
    }

    //Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Get user details from the token ------ exclude the password
    const user = await User.findById(decoded.id).select("-password");

    //Check if user exists
    if (!user) {
      response.status(400).json({ message: "User not found!!" });
    }

    //Setting the user data in the request object
    request.user = user;
    next(); //this makes it go to the next middleware
  } catch (error) {
    response.status(401).json({ message: "Not authorized, token failed!!" });
  }
});

//Admin middleware
export const adminMiddleware = asyncHandler(async (request, response, next) => {
  if (request.user && request.user.role === "admin") {
    next();
    return;
  } else {
    response.status(403).json({
      message:
        "Not authorized as an admin!! Only admins can perform this action!!",
    });
  }
});

export const creatorMiddleware = asyncHandler(
  async (request, response, next) => {
    if (
      (request.user && request.user.role === "creator") ||
      (request.user && request.user.role === "admin")
    ) {
      next();
      return;
    }
    response.status(403).json({
      message: "Not authorized as a creator!!",
    });
  }
);

export const isVerifiedMiddleware = asyncHandler(
  async (request, response, next) => {
    if (request.user && request.user.isVerified) {
      next();
      return;
    } else {
      response.status(403).json({
        message: "Please verify your email!!",
      });
    }
  }
);
