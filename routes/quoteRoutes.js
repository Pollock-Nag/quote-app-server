const express = require("express");
const router = express.Router();
const { getQuotes, getQuoteById } = require("../controllers/quoteController");

router.get("/", getQuotes);
router.get("/:id", getQuoteById);

module.exports = router;
