
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HireFlow ATS API is running" });
});

app.use("/api/candidates", require("./routes/candidateRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connectDB = require("./config/db");
    await connectDB();

    app.listen(PORT, () => {
      console.log(`HireFlow API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
