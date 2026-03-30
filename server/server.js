require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Allowed origins — add any extra frontend URLs here
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://niqs-website.vercel.app",
  // Also allow any Vercel preview URLs for this project
  /https:\/\/niqs-website.*\.vercel\.app$/,
];

if (process.env.CLIENT_URL) {
  // Support comma-separated list e.g. "http://localhost:5173,https://niqs-website.vercel.app"
  process.env.CLIENT_URL.split(",").forEach((url) => {
    const trimmed = url.trim();
    if (trimmed) ALLOWED_ORIGINS.push(trimmed);
  });
}

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      const allowed = ALLOWED_ORIGINS.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );

      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/news", require("./routes/news"));
app.use("/api/events", require("./routes/events"));
app.use("/api/exco", require("./routes/exco"));
app.use("/api/chapters", require("./routes/chapters"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/partners", require("./routes/partners"));
app.use("/api/members", require("./routes/members"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/brand-materials", require("./routes/brandMaterials"));
app.use("/api/president", require("./routes/president"));
app.use("/api/past-presidents", require("./routes/pastPresidents"));
app.use("/api/site-settings", require("./routes/siteSettings"));
app.use("/api/contact-info", require("./routes/contactInfo"));
app.use("/api/qs-firms", require("./routes/qsFirms"));
app.use("/api/exam-results", require("./routes/examResults"));
app.use("/api/qs-connect", require("./routes/qsConnect"));
app.use("/api/webinars", require("./routes/webinars"));
app.use("/api/workshop-materials", require("./routes/workshopMaterials"));
app.use("/api/journals", require("./routes/journals"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`NIQS Server running on port ${PORT}`);
});
