import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Garante que estamos pegando o index certo
  const staticPath = path.resolve(__dirname, "public");
  console.log("📁 Servindo arquivos de:", staticPath);

  // Serve o front-end buildado
  app.use(express.static(staticPath));

  // Redireciona qualquer rota pro index.html (SPA)
  app.get("*", (_, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);
