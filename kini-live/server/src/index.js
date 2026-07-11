import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import fs from "node:fs";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import consultationRoutes from "./routes/consultations.js";
import adminRoutes from "./routes/admin.js";

mongoose.set("sanitizeFilter", true);

const app = express();

if (config.trustProxy) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        scriptSrc: ["'self'", "https://challenges.cloudflare.com"],
        frameSrc: ["'self'", "https://challenges.cloudflare.com"],
        connectSrc: ["'self'", "https://challenges.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed"));
    },
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token", "Authorization"],
    credentials: true,
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "32kb", strict: true }));
app.use(hpp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." },
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/consultations", consultationRoutes);
app.use("/api/admin", adminRoutes);

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(serverDirectory, "../../client/dist");

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: "1h", etag: true }));
  app.get("*splat", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.message === "Origin not allowed" ? 403 : 500;
  res.status(status).json({ message: status === 500 ? "Something went wrong. Please try again." : error.message });
});

async function start() {
  await mongoose.connect(config.mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20_000,
  });
  app.listen(config.port, () => {
    console.info(`KINi API listening on http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API:", error);
  process.exitCode = 1;
});
