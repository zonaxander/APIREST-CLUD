import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/historial?limit=30 -> bitácora de movimientos
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 30;
    const { rows } = await pool.query(
      "SELECT * FROM vista_historial LIMIT $1",
      [limit]
    );
    res.json(rows);
  })
);

export default router;
