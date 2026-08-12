import "dotenv/config";
import path from "node:path";
import cors from "cors";
import express from "express";
import { connectDB } from "./config/db";
import { UPLOAD_ROOT } from "./config/uploads";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import workerRoutes from "./routes/workers";
import attendanceRoutes from "./routes/attendance";
import dashboardRoutes from "./routes/dashboard";
import farmRoutes from "./routes/farms";
import uploadRoutes from "./routes/uploads";

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.error("Missing MONGODB_URI environment variable. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();

// Permissive CORS: this API is consumed only by the internally-distributed Farm
// Express mobile app (Expo), not a public web frontend, so allowing all origins
// is acceptable here — there's no browser-based CSRF/cookie surface to protect.
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/uploads", express.static(UPLOAD_ROOT));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function main(): Promise<void> {
  await connectDB(MONGODB_URI as string);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Farm Express API listening on port ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`[server] Serving uploads from ${path.resolve(UPLOAD_ROOT)}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
