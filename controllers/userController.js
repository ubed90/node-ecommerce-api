const User = require("../models/User");
const { isValidObjectId } = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  return res.status(StatusCodes.OK).json({ users });
};

const getUser = async (req, res) => {
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    throw new CustomError.BadRequestError("Invalid User Id");
  }

  const user = await User.findOne({ _id: id }).select("-password");

  if (!user) {
    throw new CustomError.BadRequestError(`No user with ID: ${id}`);
  }

  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  return res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new CustomError.BadRequestError("Name and email are required");
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    { new: true, runValidators: true }
  );

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  return res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Both passwords are required.");
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordMatching = await user.comparePassword(oldPassword);

  if (!isPasswordMatching) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }

  user.password = newPassword;

  await user.save();

  return res.status(StatusCodes.OK).json({ msg: "Success! Password updated" });
};

module.exports = {
  getAllUsers,
  getUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
