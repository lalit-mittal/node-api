const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const User = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not Authenticated");
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (!decodedToken) {
        const error = new Error("Not Authenticated");
        error.statusCode = 401;
        throw error;
      }
      let user = await User.findOne(
        {
          _id: decodedToken.userId,
          authToken: token,
        },
        {
          password: 0,
        }
      );
      if (!user) {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error;
      }
      if (decodedToken.role !== "USER" || user.authToken !== token) {
        const error = new Error("Not authorized");
        error.statusCode = 401;
        throw error;
      }

      req.user = user;
      next();
    } catch (error) {
      error.message = "Invalid Token";
      error.statusCode = 401;
      next(error);
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Internal error";
    }
    next(error);
  }
};
