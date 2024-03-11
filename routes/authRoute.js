const router = require("express").Router();
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const User = require("../models/userModel");
const isAuth = require("../middleware/is-auth");

//create a new user
router.post(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value.toLowerCase() });
        if (user) {
          throw new Error("E-mail already in use");
        }
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isStrongPassword({
        minLength: 7,
        maxLength: 20,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 7 characters long, contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 special character"
      ),
    body("name")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Please enter a valid name"),
  ],
  authController.signup
);

//verify user
router.get("/user/verify", authController.verifyUser);

//login user
router.post("/login", authController.login);

//logout user
router.patch("/user/logout", isAuth, authController.logout);

//get user
router.get("/user/getUserProfile", isAuth, authController.getUserProfile);

//update user image
router.patch("/user/updateImage", isAuth, authController.updateImage);

module.exports = router;
