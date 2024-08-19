import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
import generateToken from "../../helpers/generateToke.js";
import bcrypt from "bcrypt";

//REGISTER USER
export const registerUser = asyncHandler(async (request, response) => {
  //Take the following details from the body of request
  const { name, email, password } = request.body;

  //Validation checks
  //1. If all details are provided or not
  if (!name || !email || !password) {
    return response.status(400).json({ message: "All fields are required!!" });
  }
  //2. If password is less than 6 characters
  if (password.length < 6) {
    return response
      .status(400)
      .json({ message: "Password should not be less than 6 characters!!" });
  }
  //3. If user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return response
      .status(400)
      .json({ message: "User already exists with this email!!" });
  }

  //Create the user if everything is alright
  const user = await User.create({
    name,
    email,
    password,
  });

  //generate the token for user
  const token = generateToken(user._id);

  response.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: true,
    secure: true,
  });

  if (user) {
    const { _id, name, email, role, bio, isVerified } = user;
    response.status(201).json({
      _id,
      name,
      email,
      role,
      bio,
      isVerified,
      token,
    });
  } else {
    response
      .status(400)
      .json({ message: "Invalid data. Could not create the user!!" });
  }
});

//LOGIN USER
export const loginUser = asyncHandler(async (request, response) => {
  //In order to login, we will need email & password from the request body
  const { email, password } = request.body;

  //validations
  if (!email || !password) {
    return response.status(400).json({ message: "All fields are required!!" });
  }

  //Check if user exists or not
  const userExists = await User.findOne({ email });
  if (!userExists) {
    return response.status(400).json({ message: "User doesn't exist!!" });
  }

  const isSame = await bcrypt.compare(password, userExists.password);
  if (!isSame) {
    return response.status(400).json({ message: "Invalid credentials!!" });
  }

  const token = generateToken(userExists._id);

  if (userExists && isSame) {
    const { _id, name, email, role, bio, isVerified } = userExists;

    //Set the token in the cookie
    response.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: true,
      secure: true,
    });

    //send back the user and token in the response
    response.status(201).json({
      _id,
      name,
      email,
      role,
      bio,
      isVerified,
      token,
    });
  } else {
    response
      .status(400)
      .json({ message: "Login failed!! Invalid credentials!!" });
  }
});
