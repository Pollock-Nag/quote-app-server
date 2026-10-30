# Quotes API Server

A simple MVC-based REST API server built with **Node.js**, **Express**, and **Supabase** that serves quote data.

The application follows this request flow:

```text
Route → Controller → Model → Supabase
```

The server uses Supabase's publishable key, so database access must be allowed by the `quotes` table's Row Level Security (RLS) policies.

---

## Project Structure

```
server/
├── config/
│   └── db.js                  # Supabase client and connection check
├── controllers/
│   └── quoteController.js     # Request handlers
├── models/
│   └── Quote.js               # Quote data-access methods
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

- [Node.js](https://nodejs.org/) (v22 or higher)
- A [Supabase](https://supabase.com/) project
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
npm install express dotenv @supabase/supabase-js cors
npm install --save-dev nodemon
```

| Package                 | Purpose                                      |
|-------------------------|----------------------------------------------|
| `express`               | Web framework for building the API           |
| `dotenv`                | Loads environment variables from `.env`      |
| `@supabase/supabase-js` | Connects the server to Supabase              |
| `cors`                  | Enables Cross-Origin Resource Sharing        |
| `nodemon`               | Restarts the server when files change        |

### 4. Create the Supabase Table

In the Supabase SQL Editor, create the `quotes` table:

```sql
create table public.quotes (
  id bigint generated always as identity primary key,
  text varchar,
  author varchar
);
```

Because this project uses the publishable key, enable RLS and allow public read access:

```sql
alter table public.quotes enable row level security;

create policy "Allow public quote reads"
on public.quotes
for select
to anon, authenticated
using (true);
```

Only read operations are implemented by this API, so the application only requires a `SELECT` policy.

### 5. Create the `.env` File

Create a `.env` file in the root of the project:

```env
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Find these values in the Supabase project settings under **Connect** or **API**.

> Do not commit `.env` to source control. This project uses only the Supabase URL and publishable key shown above. `SUPABASE_SECRET_KEY` and `SUPABASE_JWKS_URL` are not required for the current quote endpoints.

### 6. Create the Supabase Connection — `config/db.js`

```js
const { createClient } = require("@supabase/supabase-js");

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured"
  );
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

const connectDB = async () => {
  const { error } = await supabase.from("quotes").select("id").limit(1);

  if (error) {
    throw new Error(error.message);
  }

  console.log("Supabase connected");
};

module.exports = { connectDB, supabase };
```

The `connectDB` function performs a small query when the server starts. This verifies that the environment variables, Supabase URL, table, and RLS policy are working before the API begins accepting requests.

### 7. Create the Model — `models/Quote.js`

```js
const { supabase } = require("../config/db");

const columns = "id, text, author";

const Quote = {
  async findAll() {
    const { data, error } = await supabase
      .from("quotes")
      .select(columns)
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from("quotes")
      .select(columns)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

module.exports = Quote;
```

The model owns all database queries. `findAll` returns quotes ordered by their identity ID, while `findById` returns one quote or `null` when no matching record exists.

### 8. Create the Controller — `controllers/quoteController.js`

```js
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
```

Controllers handle HTTP requests and responses. They call model methods instead of querying Supabase directly.

### 9. Create the Routes — `routes/quoteRoutes.js`

```js
const express = require("express");
const router = express.Router();
const { getQuotes, getQuoteById } = require("../controllers/quoteController");

router.get("/", getQuotes);
router.get("/:id", getQuoteById);

module.exports = router;
```

### 10. Create the Entry Point — `server.js`

```js
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const cors = require("cors");
const { connectDB } = require("./config/db");
const quoteRoutes = require("./routes/quoteRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/quotes", quoteRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Supabase connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
```

The server loads `.env`, configures middleware and routes, checks the Supabase connection, and only then starts listening for requests.

### 11. Update `package.json` Scripts

Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### 12. Run the Server

```bash
npm run dev
```

You should see:

```
Supabase connected
Server is running on port 3000
```

If the server stops with a Supabase connection error, verify the `.env` values, the `public.quotes` table, and its `SELECT` RLS policy.

---

## API Endpoints

| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | `/api/quotes`        | Get all quotes       |
| GET    | `/api/quotes/:id`    | Get a quote by ID    |

Example requests:

```bash
curl http://localhost:3000/api/quotes
curl http://localhost:3000/api/quotes/1
```

### Response Examples

`GET /api/quotes` returns an array:

```json
[
  {
    "id": 1,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs"
  }
]
```

When a quote ID does not exist, the API returns:

```json
{
  "message": "Quote not found"
}
```

---

## Why Do We Need the Middleware?

```js
app.use(cors());
app.use(express.json());
```

- **`cors()`** — allows the API to accept requests from different origins, such as a frontend running on a different port. Without it, the browser can block cross-origin requests.
- **`express.json()`** — parses incoming JSON request bodies so that `req.body` is available in route handlers. The current quote API uses `GET` requests, but this middleware supports future JSON endpoints.
