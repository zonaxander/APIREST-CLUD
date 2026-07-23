import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/prestamos/vencidos -> alertas de préstamos que ya debieron volver
router.get(
  "/vencidos",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM vista_prestamos_vencidos");
    res.json(rows);
  })
);

// POST /api/prestamos -> registrar un retiro
// body: { herramienta_id, usuario_id, zona_destino_id, fecha_devolucion_estimada? }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { herramienta_id, usuario_id, zona_destino_id, fecha_devolucion_estimada } = req.body;
    if (!herramienta_id || !usuario_id || !zona_destino_id) {
      return res
        .status(400)
        .json({ error: "herramienta_id, usuario_id y zona_destino_id son obligatorios" });
    }

    const { rows: herramienta } = await pool.query(
      "SELECT estado FROM herramientas WHERE id = $1",
      [herramienta_id]
    );
    if (!herramienta.length) return res.status(404).json({ error: "Herramienta no encontrada" });
    if (herramienta[0].estado !== "disponible") {
      return res.status(409).json({ error: "La herramienta no está disponible para préstamo" });
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO prestamos (herramienta_id, usuario_id, zona_destino_id, fecha_devolucion_estimada)
         VALUES ($1, $2, $3, COALESCE($4, now() + interval '1 day'))
         RETURNING *`,
        [herramienta_id, usuario_id, zona_destino_id, fecha_devolucion_estimada || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Ya existe un préstamo activo para esta herramienta" });
      }
      throw err;
    }
  })
);

// PATCH /api/prestamos/:herramientaId/devolucion -> registrar la devolución
router.patch(
  "/:herramientaId/devolucion",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE prestamos
          SET fecha_devolucion_real = now()
        WHERE herramienta_id = $1 AND estado = 'activo'
        RETURNING *`,
      [req.params.herramientaId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "No hay un préstamo activo para esa herramienta" });
    }
    res.json(rows[0]);
  })
);

export default router;
