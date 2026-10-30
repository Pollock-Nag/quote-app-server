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
