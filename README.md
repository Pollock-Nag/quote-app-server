# Quotes API Server

A simple MVC-based REST API server built with **Node.js**, **Express**, and **MongoDB (Mongoose)** that serves quote data.

---

## Project Structure

```
server/
├── config/
│   └── db.js                  # MongoDB connection setup
├── controllers/
│   └── quoteController.js     # Request handlers (business logic)
├── models/
│   └── Quote.js               # Mongoose schema/model
├── routes/
│   └── quoteRoutes.js         # API route definitions
├── .env                       # Environment variables (not committed)
├── .gitignore
├── package.json
├── server.js                  # Application entry point
└── README.md
```

---

## Step-by-Step Setup Guide

### 1. Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or a local MongoDB instance)
- [Postman](https://www.postman.com/) (optional, for testing APIs)

### 2. Initialize the Project

```bash
mkdir server
cd server
npm init -y
```

This creates a `package.json` file with default settings.

### 3. Install Dependencies

```bash
npm install express dotenv mongoose cors
npm install --save-dev nodemon
```

| Package      | Purpose                                              |
|-------------|------------------------------------------------------|
| `express`   | Web framework for building the API                   |
| `dotenv`    | Loads environment variables from `.env` file          |
| `mongoose`  | ODM library for MongoDB                              |
| `cors`      | Enables Cross-Origin Resource Sharing                |
| `nodemon`   | Auto-restarts server on file changes (dev only)      |

### 4. Create the `.env` File

Create a `.env` file in the root of the project:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string_here/your_database_name
```

> Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas connection string and `your_database_name` with the name of your database (e.g., `quotesdb`).

### 5. Create the Database Connection — `config/db.js`

```js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 6. Create the Model — `models/Quote.js`

```js
const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    author: { type: String, required: true },
  },
  { timestamps: true }
);

const Quote = mongoose.model("quotes", quoteSchema);

module.exports = Quote;
```

### 7. Create the Controller — `controllers/quoteController.js`

```js
const Quote = require("../models/Quote");

const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find();
    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findOne({ id: req.params.id });

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuotes, getQuoteById };
```

### 8. Create the Routes — `routes/quoteRoutes.js`

```js
const express = require("express");
const router = express.Router();
const { getQuotes, getQuoteById } = require("../controllers/quoteController");

router.get("/", getQuotes);
router.get("/:id", getQuoteById);

module.exports = router;
```

### 9. Create the Entry Point — `server.js`

```js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const quoteRoutes = require("./routes/quoteRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/quotes", quoteRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 10. Update `package.json` Scripts

Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 11. Run the Server

```bash
npm run dev
```

You should see:

```
MongoDB Connected: <your-cluster-host>
Server is running on port 3000
```

---

## API Endpoints

| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | `/api/quotes`        | Get all quotes       |
| GET    | `/api/quotes/:id`    | Get a quote by ID    |

---

## Why Do We Need the Middleware?

```js
app.use(cors());
app.use(express.json());
```

- **`cors()`** — allows the API to accept requests from different origins (e.g., a frontend running on a different port), without this the browser will block cross-origin requests.
- **`express.json()`** — parses incoming JSON request bodies so that `req.body` is available in your route handlers.
