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
    try {
        new URL(url);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
};

app.post("/api/shorturl", (req, res) => {
    // check if the url is in correct format
    // check if the url already exists
    // else generate an id for short_url and save it in the database
    const { url } = req.body;
    const errorObj = { error: "invalid url" };

    // const checkUrlexists = (url) => {};

    if (checkUrlFormat(url)) {
        let id = shortId.generate();
        const newUrl = new Url({
            original_url: url,
            short_url: id,
        });

        newUrl
            .save()
            .then((savedData) => console.log("data saved"))
            .catch((err) => console.log(err));

        res.json(newUrl);
    } else {
        return res.json(errorObj);
    }
});

app.get("/api/shorturl/:urlShortId", (req, res) => {
    // check if the short url id exists or not
    // if true -> redirect to original url
    // else -> error

    const { urlShortId } = req.params;
    const errorObj = { error: "invalid Url" };

    Url.findOne({ short_url: urlShortId })
        .then((result) => res.redirect(result.original_url))
        .then((err) => res.json(err));
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
