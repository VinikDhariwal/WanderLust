const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudConfig.js");

module.exports.index = async (req, res) => {
  const { search } = req.query;
  let allListings;
  if (search && search.trim() !== "") {
    allListings = await Listing.find({
      $or: [
        { title:    { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country:  { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ],
    });
  } else {
    allListings = await Listing.find({});
  }
  res.render("listings/index", { allListings, search: search || "" });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.validatedListing);
  newListing.owner = req.user._id;
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({ path: "reviews", populate: { path: "author" } });
  if (!listing) return next(new ExpressError(404, "Listing not found"));
  res.render("listings/show", { listing });
};

module.exports.editListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return next(new ExpressError(404, "Listing not found"));
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const updated = await Listing.findByIdAndUpdate(id, req.validatedListing, {
    new: true,
    runValidators: true,
  });
  if (!updated) return next(new ExpressError(404, "Listing not found"));
  if (req.file) {
    if (updated.image.filename) {
      await cloudinary.uploader.destroy(updated.image.filename);
    }
    updated.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await updated.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
  const { id } = req.params;
  const deleted = await Listing.findByIdAndDelete(id);
  if (!deleted) return next(new ExpressError(404, "Listing not found"));
  if (deleted.image && deleted.image.filename) {
    await cloudinary.uploader.destroy(deleted.image.filename);
  }
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};