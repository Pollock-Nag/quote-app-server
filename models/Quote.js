const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Quote = mongoose.model("quotes", quoteSchema);

module.exports = Quote;
