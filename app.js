const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


// ---------------------- APP SETUP ----------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret: "SecretCode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@school.com",
//     username: "student",
//   });
//   let registerUser = await User.register(fakeUser, "student@123");
//   res.send(registerUser);
// });

// ---------------------- DATABASE ----------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

// ---------------------- ROUTES ----------------------
app.get("/", (req, res) => {
  res.send("App is working");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", users);
 
// ---------------------- ERROR HANDLING ----------------------
app.use((req, res, next) => {
  next(new ExpressError(404, "Not Found: The requested page does not exist."));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err;
  res.status(statusCode).render("error", { statusCode, message });
});

// ---------------------- SERVER ----------------------
app.listen(8080, () => {
  console.log("Server running on port 8080");
});