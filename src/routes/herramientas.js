import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/herramientas?estado=disponible&q=taladro -> inventario filtrable
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { estado, q } = req.query;
    const condiciones = [];
    const valores = [];

    if (estado && estado !== "todas") {
      valores.push(estado);
      condiciones.push(`estado = $${valores.length}`);
    }
    if (q) {
      valores.push(`%${q}%`);
      condiciones.push(`(nombre ILIKE $${valores.length} OR codigo ILIKE $${valores.length})`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT * FROM vista_inventario ${where} ORDER BY nombre`,
      valores
    );
    res.json(rows);
  })
);

// GET /api/herramientas/:id -> ficha completa (para el modal de detalle)
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT h.*, c.nombre AS categoria, z.nombre AS zona,
              p.usuario_id AS prestado_a_id, u.nombre AS prestado_a,
              m.id AS mantenimiento_id, m.motivo AS motivo_mantenimiento
       FROM herramientas h
       JOIN categorias c ON c.id = h.categoria_id
       JOIN zonas z ON z.id = h.zona_actual_id
       LEFT JOIN prestamos p ON p.herramienta_id = h.id AND p.estado = 'activo'
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       LEFT JOIN mantenimientos m ON m.herramienta_id = h.id AND m.estado IN ('pendiente','en_proceso')
       WHERE h.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Herramienta no encontrada" });
    res.json(rows[0]);
  })
);

// POST /api/herramientas -> dar de alta una herramienta nueva
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { codigo, nombre, categoria_id, zona_actual_id, numero_serie, valor_reposicion } = req.body;
    if (!codigo || !nombre || !categoria_id || !zona_actual_id) {
      return res.status(400).json({ error: "codigo, nombre, categoria_id y zona_actual_id son obligatorios" });
    }
    const { rows } = await pool.query(
      `INSERT INTO herramientas (codigo, nombre, categoria_id, zona_actual_id, numero_serie, valor_reposicion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [codigo, nombre, categoria_id, zona_actual_id, numero_serie || null, valor_reposicion || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
