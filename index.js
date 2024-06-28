require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shortId = require("shortid");
const app = express();
const Url = require("./models/Url");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

const checkUrlFormat = (url) => {
    const regex =
        /^(https?:\/\/)?(localhost(:\d+)?|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[^\s]*)?$/;
    return regex.test(url);
};

app.post("/api/shorturl", async (req, res) => {
    // check if the url is in correct format
    // check if the url already exists
    // else generate an id for short_url and save it in the database
    const { url } = req.body;
    const errorObj = { error: "invalid url" };

    if (!url || !checkUrlFormat(url)) {
        return res.json(errorObj);
    }

    try {
        // Check if the URL already exists
        // using async() await()
        let existingUrl = await Url.findOne({ original_url: url });

        if (existingUrl) {
            return res.json({
                original_url: existingUrl.original_url,
                short_url: existingUrl.short_url,
            });
        }

        // Generate a new short URL ID
        let id = shortId.generate();

        const newUrl = new Url({
            original_url: url,
            short_url: id,
        });

        await newUrl.save();
        res.json(newUrl);
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
    const { short_url } = req.params;
    const errorObj = { error: "invalid url" };
    if (!short_url) {
        return res.status(400).json(errorObj);
    }

    try {
        const result = Url.findOne({ short_url: short_url });
        if (!result) return res.json({ error: "no url" });
        res.redirect(301, result.original_url);
    } catch (error) {
        return res.json(errorObj);
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
