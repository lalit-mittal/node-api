const User = require("../../models/userModel");
const Post = require("../../models/postModel");
const clearImage = require("../../utils/deleteImage");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Internal error";
    }
    next(error);
  }
};

exports.deleteUsers = async (req, res, next) => {
  const userIdArray = req.body.userIds.split(",");
  try {
    userIdArray.forEach(async (id) => {
      const posts = await Post.find({ createdBy: id });
      if (posts.length > 0) {
        posts.forEach(async (post) => {
          clearImage(post.image);
          await Post.findByIdAndDelete(post._id);
        });
      }
    });
    const user = await User.deleteMany({ _id: { $in: userIdArray } });
    res.status(200).json({
      message: "Users deleted successfully",
      data: [],
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Internal error";
    }
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    user.isActive = user.isActive ? false : true;
    const updatedUser = await user.save();
    res.status(200).json({
      message: "User status updated",
      data: updatedUser,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Internal error";
    }
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Internal error";
    }
    next(error);
  }
};
