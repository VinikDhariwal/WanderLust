const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError");

const validateListing = (req, res, next) => {
  if (req.body.listing && req.body.listing.price) {
    req.body.listing.price = Number(req.body.listing.price);
  }
  const { error, value } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  req.validatedListing = value.listing;
  next();
};

// Index - show all listings
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// New Listing Form
router.get("/new", (req, res) => {
  res.render("listings/new");
});

// Create Listing
router.post(
  "/",
  validateListing,
  wrapAsync(async (req, res) => {
    const newListing = new Listing(req.validatedListing);
    await newListing.save();
    res.redirect("/listings");
  }),
);

// Show Listing
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) return next(new ExpressError(404, "Listing not found"));
    res.render("listings/show", { listing });
  }),
);

// Edit Form
router.get(
  "/:id/edit",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found"));
    res.render("listings/edit", { listing });
  }),
);

// Update Listing
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const updated = await Listing.findByIdAndUpdate(id, req.validatedListing, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updated) return next(new ExpressError(404, "Listing not found"));
    res.redirect(`/listings/${id}`);
  }),
);

// Delete Listing
router.delete(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) return next(new ExpressError(404, "Listing not found"));
    res.redirect("/listings");
  }),
);

module.exports = router;