const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

//SignUP
router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
});

router.post("/signup", wrapAsync(async (req,res) =>{
    try{
        let {username , email, password} = req.body;
        const newUser = new User({email, username});
        const registerdUser = await User.register(newUser , password);
        console.log(registerdUser);
        req.login(registerdUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "User Registered Successfully");
            res.redirect("/listings");
        });
    } catch(err){
        req.flash("error" ,err.message);
        res.redirect("/signup");
    }
}));

//LogIN
router.get("/login",(req,res)=>{
    res.render("user/login.ejs");
});

router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    async (req,res)=>{
        req.flash("success","Welcome back to WanderLust!");
        res.redirect("/listings");
    }
);

module.exports = router;