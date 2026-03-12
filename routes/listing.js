const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn, isOwner } = require("../middleware.js");
const ListingController = require("../controllers/listings.js");

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

// ================= INDEX + CREATE =================
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    validateListing,
    wrapAsync(ListingController.createListing),
  );

// ================= NEW FORM =================
router.route("/new").get(isLoggedIn, ListingController.renderNewForm);

// ================= SHOW + UPDATE + DELETE =================
router
  .route("/:id")
  .get(
    wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(ListingController.updateListing),
  ) // was missing )
  .delete(
    isLoggedIn, 
    isOwner, 
    wrapAsync(ListingController.destroyListing));

// ================= EDIT FORM =================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(ListingController.editListing),
);

module.exports = router;
