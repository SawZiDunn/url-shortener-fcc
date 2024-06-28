const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    original_url: { type: String, required: true, unique: true },
    short_url: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Url", UrlSchema);
