import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
import { request, response } from "express";

export const deleteUser = asyncHandler(async (request, response) => {
  const { id } = request.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (user) {
      response.status(200).json({ message: "User deleted successfully!!" });
    } else {
      response.status(404).json({ message: "User not found!!" });
    }
  } catch (error) {
    response.status(500).json({ message: "Cannot delete user!!" });
  }
});

export const getAllUsers = asyncHandler(async (request, response) => {
  try {
    const users = await User.find({});
    if (!users) {
      response.status(404).json({ message: "No users found!!" });
    }
    response.status(200).json(users);
  } catch (error) {
    response.status(500).json({ message: "Cannot get users!!" });
  }
});
