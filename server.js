import "dotenv/config";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API de herramientas escuchando en http://localhost:${PORT}`);
});
