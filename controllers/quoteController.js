const Quote = require("../models/Quote");


const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.findAll();
    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuotes, getQuoteById };
