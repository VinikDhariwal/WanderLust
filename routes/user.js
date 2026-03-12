const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const UserController = require("../controllers/users.js");

// ================= SIGNUP =================
router
  .route("/signup")
  .get(UserController.renderSignupForm)
  .post(wrapAsync(UserController.userSignup));

// ================= LOGIN =================
router
  .route("/login")
  .get(UserController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    UserController.userLogin,
  );

// ================= LOGOUT =================
router.route("/logout").get(UserController.userLogout);

module.exports = router;
