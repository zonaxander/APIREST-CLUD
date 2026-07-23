import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// Railway, Render y la mayoría de proveedores en la nube exponen la
// conexión como una sola variable DATABASE_URL. En local (o si prefieres
// variables sueltas) se arma con PGHOST/PGPORT/etc. desde .env.
const useConnectionString = Boolean(process.env.DATABASE_URL);

const sslEnabled =
  process.env.PGSSL === "false"
    ? false
    : process.env.PGSSL === "true" || process.env.NODE_ENV === "production" || useConnectionString;

export const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      }
);

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de Postgres:", err);
});

export default pool;
