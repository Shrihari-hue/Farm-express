import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { z } from "zod";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";
import { UPLOAD_ROOT } from "../config/uploads";
import { Worker } from "../models/Worker";

const router = Router();

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — mirrors the worker-photos Supabase bucket limit

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      cb(new AppError(400, "Only image/jpeg, image/png, and image/webp files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const workerPhotoBodySchema = z.object({
  // Must be a valid Mongo ObjectId (24 hex chars) — also rules out path
  // traversal (e.g. "../../etc/passwd") since the value is interpolated
  // directly into a filesystem path below.
  workerId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "workerId must be a valid id"),
});

router.post(
  "/worker-photo",
  requireAuth,
  requireFarmScope,
  requireRole("owner", "supervisor"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError(400, "No file uploaded (expected multipart field 'file')");
    }
    const { workerId } = workerPhotoBodySchema.parse(req.body);
    const farmId = req.user!.farmId!;

    const worker = await Worker.findOne({ _id: workerId, farmId }).select("_id");
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }

    const ext = ALLOWED_MIME_TO_EXT[req.file.mimetype];
    const dir = path.join(UPLOAD_ROOT, farmId);
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${workerId}.${ext}`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    const base = (process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, "");
    const url = `${base}/uploads/${farmId}/${filename}`;

    res.json({ url });
  })
);

export default router;
