const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title : {
        type : String,
        require : true,
    },
    description : String,
    image : {
        type : String,
        default : "https://media.istockphoto.com/id/922962354/vector/no-image-available-sign.jpg?s=612x612&w=0&k=20&c=xbGzQiL_UIMFDUZte1U0end0p3E8iwocIOGt_swlywE=",
        set : (v) => v==="" 
        ? "https://media.istockphoto.com/id/922962354/vector/no-image-available-sign.jpg?s=612x612&w=0&k=20&c=xbGzQiL_UIMFDUZte1U0end0p3E8iwocIOGt_swlywE=" 
        : v,    
    },
    price : Number,
    location : String,
    country : String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;