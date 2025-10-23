import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ✅ Caminho fixo e correto para build do Vite
  const staticPath = path.resolve(__dirname, "public");

  // Serve arquivos estáticos
  app.use(express.static(staticPath));

  // Roteamento SPA
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}

startServer().catch(console.error);
