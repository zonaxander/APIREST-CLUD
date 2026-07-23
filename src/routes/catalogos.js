import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/categorias",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM categorias ORDER BY nombre");
    res.json(rows);
  })
);

router.get(
  "/zonas",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query("SELECT * FROM zonas ORDER BY nombre");
    res.json(rows);
  })
);

router.get(
  "/usuarios",
  asyncHandler(async (_req, res) => {
    const { rows } = await pool.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE activo = true ORDER BY nombre"
    );
    res.json(rows);
  })
);

router.post(
  "/usuarios",
  asyncHandler(async (req, res) => {
    const { nombre, email, telefono, rol } = req.body;
    if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, rol)
       VALUES ($1, $2, $3, COALESCE($4, 'operario'))
       RETURNING id, nombre, email, rol`,
      [nombre, email || null, telefono || null, rol || null]
    );
    res.status(201).json(rows[0]);
  })
);

export default router;
