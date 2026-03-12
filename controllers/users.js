const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); 
module.exports.renderSignupForm = (req, res) => {
  res.render("user/signup.ejs");
};

module.exports.userSignup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "User Registered Successfully");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("user/login.ejs");
};

module.exports.userLogin = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");
  res.redirect(req.session.redirectUrl || "/listings");
};

module.exports.userLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("error", "You are now logged out!");
    res.redirect("/listings");
  });
};  