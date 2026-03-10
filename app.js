const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");

// ---------------------- APP SETUP ----------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
  secret : "SecretCode",
  resave : false,
  saveUninitialized : true, 
  cookie : {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge :7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
  }
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  next();
})

// ---------------------- DATABASE ----------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

// ---------------------- ROUTES ----------------------
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

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