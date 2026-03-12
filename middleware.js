const Listing = require("./models/listing");
const Review = require("./models/review");

// Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    let redirectUrl = req.originalUrl;

    // If it's a non-GET request (e.g. POST/DELETE to /listings/:id/...),
    // redirect to the listing page instead of the API endpoint
    if (req.method !== "GET") {
      const match = req.originalUrl.match(/^(\/listings\/[^\/]+)/);
      redirectUrl = match ? match[1] : "/listings";
    }

    req.session.redirectUrl = redirectUrl;
    req.flash("error", "You must be logged in to continue!");
    return res.redirect("/login");
  }
  next();
};

// Save redirect URL in locals
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
    delete req.session.redirectUrl; // remove after using
  }
  next();
};

// Check if current user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  // If not owner, always redirect back to that listing's page
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Check if current user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }
  // If not author, always redirect back to that listing's page
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};