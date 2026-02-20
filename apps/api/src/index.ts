import "dotenv/config";
import { createApp } from "./app";

const PORT = process.env.PORT ?? 3001;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀  API running at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received – shutting down gracefully");
  server.close(() => process.exit(0));
});