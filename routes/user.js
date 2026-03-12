// routes/user.js

const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");

const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");



/* ================= SIGNUP ================= */

// Signup Page
router.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
});


// Signup Logic
router.post("/signup", wrapAsync(async (req, res, next) => {

    try {

        let { username, email, password } = req.body;

        const newUser = new User({
            username,
            email
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {

            if (err) return next(err);

            req.flash("success", "User registered successfully!");

            res.redirect("/listings");
        });

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/signup");
    }

}));



/* ================= LOGIN ================= */

// Login Page
router.get("/login", (req, res) => {
    res.render("user/login.ejs");
});


// Login Logic
router.post(
    "/login",
    saveRedirectUrl,

    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),

    (req, res) => {

        req.flash("success", "Welcome back to WanderLust!");

        const redirectUrl = res.locals.redirectUrl || "/listings";

        res.redirect(redirectUrl);
    }
);



/* ================= LOGOUT ================= */

router.get("/logout", (req, res, next) => {

    req.logout((err) => {

        if (err) return next(err);

        req.flash("success", "You are now logged out!");

        res.redirect("/listings");
    });

});


module.exports = router;