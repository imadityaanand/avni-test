const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: String,
    desc: String,
    impact: Number,
    rating: Number,
    price: Number,
    userId: String,
    company: String,
    category: String
});

module.exports = mongoose.model("products", productSchema);