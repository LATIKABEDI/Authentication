import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../models/auth/token.js";
import crypto from "node:crypto"; //It means that crypto is coming from node
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

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

//LOGOUT USER
export const logoutUser = asyncHandler(async (request, response) => {
  response.clearCookie("token");
  response.status(201).json({
    message: "User logged out successfully!!",
  });
});

//GET USER (To display the user profile)
export const getUser = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).select("-password");

  if (user) {
    response.status(200).json(user);
  } else {
    response.status(400).json({ message: "User not found" });
  }
});

//UPDATE USER
export const updateUser = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);

  if (user) {
    const { name, bio } = request.body;
    user.name = request.body.name || user.name;
    user.bio = request.body.bio || user.bio;

    const updatedUser = await user.save();

    response.status(200).json({
      message: "User updated successfully!!",
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      isVerified: updatedUser.isVerified,
    });
  } else {
    response.status(404).json({ message: "User not found!!" });
  }
});

//GET LOGIN STATUS OF USER
export const userLoginStatus = asyncHandler(async (request, response) => {
  const token = request.cookies.token;
  if (!token) {
    response.status(401).json({ message: "Not authorized, please login!!" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

//EMAIL VERIFICATION
export const verifyEmail = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);
  if (!user) {
    return response.status(401).json({ message: "User not found" });
  }
  if (user.isVerified) {
    return response.status(404).json({ message: "User is already verified" });
  }

  let token = await Token.findOne({ userId: user._id });

  //If a token already exists, delete that token and generate a new verification token for the user using the crypto module coming from node.js
  if (token) {
    await token.deleteOne();
  }
  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

  const hashedToken = hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }).save();

  //verification email
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const subject = "Email verification";
  const sendTo = user.email;
  const replyTo = "noreply@gmail.com";
  const template = "emailVerification";
  const sendFrom = process.env.USER_EMAIL;
  const name = user.name;
  const url = verificationLink;

  try {
    await sendEmail(subject, sendTo, sendFrom, replyTo, template, name, url); //The order of parameters matters. It should always be this
    response.status(200).json({ message: "Email sent successfully!!" });
  } catch (error) {
    console.log("Error sending the email....");
    response.status(500).json({ message: "Email could not be sent!!" });
  }
});

//VERIFY USER
// export const verifyUser = asyncHandler(async (request, response) => {
//   const { verificationToken } = request.params;
//   if (!verificationToken) {
//     return response
//       .status(400)
//       .json({ message: "Invalid verification token!!" });
//   }
//   const hashedToken = hashToken(verificationToken);
//   const userToken = await Token.findOne({
//     verificationToken: hashedToken,
//     expiresAt: { $gt: Date.now() },
//   });
//   console.log(userToken);
// });
