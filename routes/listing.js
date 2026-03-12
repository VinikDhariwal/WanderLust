const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");

const Listing = require("../models/listing.js");

const ExpressError = require("../utils/ExpressError");

const { isLoggedIn, isOwner } = require("../middleware.js");


// ================= VALIDATION =================

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


// ================= INDEX =================

router.get("/", async (req, res) => {

  const allListings = await Listing.find({});

  res.render("listings/index", { allListings });

});


// ================= NEW FORM =================

router.get("/new", isLoggedIn, (req, res) => {

  res.render("listings/new");

});


// ================= CREATE LISTING =================

router.post(
  "/",
  isLoggedIn,
  validateListing,

  wrapAsync(async (req, res) => {

    const newListing = new Listing(req.validatedListing);

    // assign owner
    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing Created!");

    res.redirect("/listings");

  })
);


// ================= SHOW LISTING =================

router.get(
  "/:id",

  wrapAsync(async (req, res, next) => {

    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "author" }
      });

    if (!listing)
      return next(new ExpressError(404, "Listing not found"));

    res.render("listings/show", { listing });

  })
);


// ================= EDIT FORM =================

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res, next) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing)
      return next(new ExpressError(404, "Listing not found"));

    res.render("listings/edit", { listing });

  })
);


// ================= UPDATE LISTING =================

router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,

  wrapAsync(async (req, res, next) => {

    const { id } = req.params;

    const updated = await Listing.findByIdAndUpdate(
      id,
      req.validatedListing,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated)
      return next(new ExpressError(404, "Listing not found"));

    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`);

  })
);


// ================= DELETE LISTING =================

router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res, next) => {

    const { id } = req.params;

    const deleted = await Listing.findByIdAndDelete(id);

    if (!deleted)
      return next(new ExpressError(404, "Listing not found"));

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings");

  })
);


module.exports = router;