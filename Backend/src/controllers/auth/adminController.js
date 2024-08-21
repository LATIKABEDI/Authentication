import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";

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
    response.status(404).json({ message: "Cannot delete user!!" });
  }
});
