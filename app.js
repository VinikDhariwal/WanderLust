if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const upload = multer({dest: 'uploads/'})

const ExpressError = require("./utils/ExpressError");

// Models
const User = require("./models/user");

// Routes
const listingsRoutes = require("./routes/listing");
const reviewsRoutes = require("./routes/review");
const usersRoutes = require("./routes/user");

// Middleware
const { isLoggedIn, saveRedirectUrl } = require("./middleware");

// ---------------- DATABASE ----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("DB connection error:", err));

// ---------------- APP SETUP ----------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION ----------------
const sessionConfig = {
  secret: "SecretCode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------------- FLASH & CURRENT USER ----------------
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  res.render("home"); // make sure home.ejs exists
});

app.use("/", usersRoutes); // login/signup routes
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes); // nested reviews

// ---------------- 404 HANDLER ----------------
// Use regex /.*/ instead of * to avoid PathError
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Not Found: The requested page does not exist."));
});

// ---------------- ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Internal Server Error" } = err;
  res.status(statusCode).render("error", { statusCode, message });
});

// ---------------- SERVER ----------------
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});