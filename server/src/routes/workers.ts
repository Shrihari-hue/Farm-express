import { Router } from "express";
import { z } from "zod";
import { Worker } from "../models/Worker";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireFarmScope, requireRole } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireFarmScope);

const bankDetailsSchema = z
  .object({
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    ifsc: z.string().optional(),
    bankName: z.string().optional(),
    branch: z.string().optional(),
  })
  .partial();

const createWorkerSchema = z.object({
  type: z.enum(["permanent", "casual"]),
  name: z.string().trim().min(1, "name is required"),
  photoUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  joiningDate: z.string().nullable().optional(),
  monthlySalary: z.number().min(0).nullable().optional(),
  dailyWage: z.number().min(0).nullable().optional(),
  bankDetails: bankDetailsSchema.nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  notes: z.string().nullable().optional(),
});

const updateWorkerSchema = createWorkerSchema.partial();

function buildWorkerFilter(
  farmId: string,
  query: { type?: unknown; status?: unknown; search?: unknown }
): Record<string, unknown> {
  const filter: Record<string, unknown> = { farmId };

  if (typeof query.type === "string" && query.type.length > 0) {
    filter.type = query.type;
  }
  if (typeof query.status === "string" && query.status.length > 0) {
    filter.status = query.status;
  }
  if (typeof query.search === "string" && query.search.trim().length > 0) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ name: regex }, { phone: regex }];
  }

  return filter;
}

// GET /api/workers?type=&status=&search=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = buildWorkerFilter(req.user!.farmId!, req.query);
    const workers = await Worker.find(filter).sort({ status: 1, name: 1 });
    res.json({ workers: workers.map((w) => w.toJSON()) });
  })
);

// GET /api/workers/active — convenience: same as above with status=active forced
router.get(
  "/active",
  asyncHandler(async (req, res) => {
    const filter = buildWorkerFilter(req.user!.farmId!, { ...req.query, status: "active" });
    const workers = await Worker.find(filter).sort({ status: 1, name: 1 });
    res.json({ workers: workers.map((w) => w.toJSON()) });
  })
);

// GET /api/workers/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const worker = await Worker.findOne({ _id: req.params.id, farmId: req.user!.farmId });
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }
    res.json({ worker: worker.toJSON() });
  })
);

// POST /api/workers
router.post(
  "/",
  requireRole("owner", "supervisor"),
  asyncHandler(async (req, res) => {
    const payload = createWorkerSchema.parse(req.body);
    const worker = await Worker.create({ ...payload, farmId: req.user!.farmId });
    res.status(201).json({ worker: worker.toJSON() });
  })
);

// PATCH /api/workers/:id — partial update, only fields present in payload are set
router.patch(
  "/:id",
  requireRole("owner", "supervisor"),
  asyncHandler(async (req, res) => {
    const payload = updateWorkerSchema.parse(req.body);
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user!.farmId },
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }
    res.json({ worker: worker.toJSON() });
  })
);

// POST /api/workers/:id/deactivate
router.post(
  "/:id/deactivate",
  requireRole("owner", "supervisor"),
  asyncHandler(async (req, res) => {
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user!.farmId },
      { $set: { status: "inactive" } },
      { new: true }
    );
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }
    res.json({ worker: worker.toJSON() });
  })
);

// POST /api/workers/:id/reactivate
router.post(
  "/:id/reactivate",
  requireRole("owner", "supervisor"),
  asyncHandler(async (req, res) => {
    const worker = await Worker.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user!.farmId },
      { $set: { status: "active" } },
      { new: true }
    );
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }
    res.json({ worker: worker.toJSON() });
  })
);

// DELETE /api/workers/:id — hard delete, owner-only
router.delete(
  "/:id",
  requireRole("owner"),
  asyncHandler(async (req, res) => {
    const worker = await Worker.findOneAndDelete({ _id: req.params.id, farmId: req.user!.farmId });
    if (!worker) {
      throw new AppError(404, "Worker not found");
    }
    res.status(204).send();
  })
);

export default router;
