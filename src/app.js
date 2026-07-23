import express from "express";
import cors from "cors";
import morgan from "morgan";

import dashboardRoutes from "./routes/dashboard.js";
import herramientasRoutes from "./routes/herramientas.js";
import prestamosRoutes from "./routes/prestamos.js";
import mantenimientosRoutes from "./routes/mantenimientos.js";
import ubicacionesRoutes from "./routes/ubicaciones.js";
import historialRoutes from "./routes/historial.js";
import catalogosRoutes from "./routes/catalogos.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/herramientas", herramientasRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/mantenimientos", mantenimientosRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api", catalogosRoutes); // /api/categorias, /api/zonas, /api/usuarios

// 404 para rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo centralizado de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error interno del servidor" });
});
