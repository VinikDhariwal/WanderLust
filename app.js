const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError");
const {listingSchema} = require("./schema.js");

app.set("view engine", "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("DataBase is connected");
}).catch(err=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(mongo_url);
}

app.get("/", async (req,res) => {
   let allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
});

const validateListing = (req, res, next) => {
    // Convert price to a number
    if (req.body.price) {
        req.body.price = Number(req.body.price);
    }

    // Validate the body against schema
    const { error, value } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }

    // Attach validated data
    req.validatedListing = value;
    next();
};

module.exports = validateListing;

//Index Route
app.get("/listings", async (req,res) => {
   let allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
});

//New Route
app.get("/listings/new",(req,res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

// Create Route
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res) => {
        const newListing = new Listing(req.validatedListing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

// Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// app.get("/testing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title : "test",
//         description : "testing ",
//         price : 12000,
//         location : "testing location",
//         country : "testing country",
//     });
//     await sampleListing.save();
//     console.log("saved");
//     res.send("successful test");
// });


// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Not Found: The requested page does not exist."));
});

app.use((err, req, res, next) => {
    console.error(err);

    let { statusCode = 500, message = "Internal Server Error" } = err;

    // Mongoose Validation Error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Bad Request: Invalid data provided.";
    }

    // Invalid MongoDB ID → treat as resource not found
    if (err.name === "CastError") {
        statusCode = 404;
        message = "Not Found: Page does not exist.";
    }

    // Duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = "Conflict: Duplicate data already exists.";
    }

    res.status(statusCode).render("error.ejs", {
        statusCode,
        message
    });
});

app.listen(8080,() => {
    console.log("App is listeing on port 8080");
});