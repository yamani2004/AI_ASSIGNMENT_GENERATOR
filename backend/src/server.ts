// MUST BE THE VERY FIRST LINES
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import http from "http";
import app from "./app";
import { config } from "./config/env";
import { connectDB } from "./config/db";
import { setupSocket } from "./socket/socketHandler";
import { startWorker } from "./queues/worker";

async function main() {
  await connectDB();

  const server = http.createServer(app);
  const io = setupSocket(server);

  app.set("io", io);

  startWorker(io);

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`WebSocket ready`);
    console.log(`Worker started`);
  });
}

main().catch(console.error);