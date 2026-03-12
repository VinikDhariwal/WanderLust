const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schema");
const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const ReviewController = require("../controllers/reviews.js");

// Validation middleware for reviews
const validateReviewSchema = (req, res, next) => {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  }
  req.validatedReview = value.review;
  next();
};

// ================= POST REVIEW =================
router
  .route("/")
  .post(
    isLoggedIn,
    validateReviewSchema,
    wrapAsync(ReviewController.createReview),
  );

// ================= DELETE REVIEW =================
router
  .route("/:reviewId")
  .delete(
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(ReviewController.destroyReview),
  );

module.exports = router;
