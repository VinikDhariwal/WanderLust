const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

const initDB = async () => {

    await Listing.deleteMany({});

    const user = await User.findOne(); // fetch existing user

    const newData = initdata.data.map((obj) => ({
        ...obj,
        owner: user._id
    }));

    await Listing.insertMany(newData);

    console.log("Data was initialized");

    mongoose.connection.close();
};

async function main(){
    await mongoose.connect(mongo_url);
    console.log("Database connected");
}

main()
.then(initDB)
.catch((err) => console.log(err));