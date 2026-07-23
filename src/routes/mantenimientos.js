import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// POST /api/mantenimientos -> enviar una herramienta a mantenimiento
// body: { herramienta_id, motivo, reportado_por? }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { herramienta_id, motivo, reportado_por } = req.body;
    if (!herramienta_id || !motivo) {
      return res.status(400).json({ error: "herramienta_id y motivo son obligatorios" });
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO mantenimientos (herramienta_id, motivo, reportado_por)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [herramienta_id, motivo, reportado_por || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Ya existe un mantenimiento abierto para esta herramienta" });
      }
      throw err;
    }
  })
);

// PATCH /api/mantenimientos/:herramientaId/cierre -> cerrar mantenimiento
router.patch(
  "/:herramientaId/cierre",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE mantenimientos
          SET fecha_fin = now()
        WHERE herramienta_id = $1 AND estado IN ('pendiente', 'en_proceso')
        RETURNING *`,
      [req.params.herramientaId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "No hay un mantenimiento abierto para esa herramienta" });
    }
    res.json(rows[0]);
  })
);

export default router;
