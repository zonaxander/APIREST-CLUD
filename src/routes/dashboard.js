import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/dashboard/resumen -> tarjetas Total/Disponibles/En préstamo/Mantenimiento
router.get(
  "/resumen",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM vista_resumen_estado");
    res.json(rows[0]);
  })
);

// GET /api/dashboard/mas-utilizadas?limit=7 -> gráfico de barras
router.get(
  "/mas-utilizadas",
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 7;
    const { rows } = await pool.query(
      "SELECT * FROM vista_mas_utilizadas LIMIT $1",
      [limit]
    );
    res.json(rows);
  })
);

// GET /api/dashboard/distribucion-estado -> gráfico de dona
router.get(
  "/distribucion-estado",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      "SELECT estado, COUNT(*)::int AS cantidad FROM herramientas GROUP BY estado"
    );
    res.json(rows);
  })
);

// GET /api/dashboard/mantenimiento-activo -> bloque de mantenimiento del panel
router.get(
  "/mantenimiento-activo",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM vista_mantenimiento_activo");
    res.json(rows);
  })
);

export default router;
