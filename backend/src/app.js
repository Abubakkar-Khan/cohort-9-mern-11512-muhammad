import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import authRoutes from "../routes/authRoutes.js";
import notesRoutes from "../routes/notesRoutes.js";
import logger from "./config/logger.js";

const app = express();

app.disable("x-powered-by");

app.use(pinoHttp({ logger }));
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Notes API is active"
  });
});

app.use((err, req, res, next) => {
  logger.error(err, "Unhandled Application Error");
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

export default app;
