const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsmate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------- DATABASE ----------------------

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(mongo_url)
    .then(() => console.log("Database connected"))
    .catch(err => console.log(err));

// ---------------------- MIDDLEWARE ----------------------

const validateListing = (req, res, next) => {
    // convert price to number (correct path)
    if (req.body.listing && req.body.listing.price) {
        req.body.listing.price = Number(req.body.listing.price);
    }

    const { error, value } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }

    req.validatedListing = value.listing; // extract listing object
    next();
};

// ---------------------- ROUTES ----------------------

// Index - show all listings
app.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
});

// New Listing Form
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

// Create Listing
app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.validatedListing);
    await newListing.save();
    res.redirect("/listings");
}));

// Show Listing
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found"));
    res.render("listings/show", { listing });
}));

// Edit Form
app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found"));
    res.render("listings/edit", { listing });
}));

// Update Listing
app.put("/listings/:id", validateListing, wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    const updated = await Listing.findByIdAndUpdate(
        id,
        req.validatedListing,
        { returnDocument: "after", runValidators: true }
    );

    if (!updated) return next(new ExpressError(404, "Listing not found"));

    res.redirect(`/listings/${id}`);
}));

// Delete Listing
app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) return next(new ExpressError(404, "Listing not found"));
    res.redirect("/listings");
}));

// ---------------------- ERROR HANDLING ----------------------

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Not Found: The requested page does not exist."));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Internal Server Error" } = err;
    res.status(statusCode).render("error", { statusCode, message });
});

// ---------------------- SERVER ----------------------

app.listen(8080, () => {
    console.log("Server running on port 8080");
});