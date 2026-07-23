import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/ubicaciones -> posición actual de todas las herramientas (mapa)
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM vista_ubicacion_actual");
    res.json(rows);
  })
);

// POST /api/ubicaciones/:herramientaId/ping -> registrar un ping de GPS/RFID
// body: { zona_id, pos_x?, pos_y?, fuente? }
router.post(
  "/:herramientaId/ping",
  asyncHandler(async (req, res) => {
    const { zona_id, pos_x, pos_y, fuente } = req.body;
    if (!zona_id) return res.status(400).json({ error: "zona_id es obligatorio" });

    const { rows } = await pool.query(
      `INSERT INTO ubicaciones_historial (herramienta_id, zona_id, pos_x, pos_y, fuente)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'gps'))
       RETURNING *`,
      [req.params.herramientaId, zona_id, pos_x || null, pos_y || null, fuente || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
