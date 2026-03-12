const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); 
const ExpressError = require("../utils/ExpressError");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  const newReview = new Review(req.validatedReview);
  newReview.author = req.user._id;
  await newReview.save();
  listing.reviews.push(newReview._id);
  await listing.save();
  req.flash("success", "Review added!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};
