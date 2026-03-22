"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// MUST BE THE VERY FIRST LINES
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "8.8.4.4"]);
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const socketHandler_1 = require("./socket/socketHandler");
const worker_1 = require("./queues/worker");
async function main() {
    await (0, db_1.connectDB)();
    const server = http_1.default.createServer(app_1.default);
    const io = (0, socketHandler_1.setupSocket)(server);
    app_1.default.set("io", io);
    (0, worker_1.startWorker)(io);
    server.listen(env_1.config.port, () => {
        console.log(`Server running on port ${env_1.config.port}`);
        console.log(`WebSocket ready`);
        console.log(`Worker started`);
    });
}
main().catch(console.error);
//# sourceMappingURL=server.js.map