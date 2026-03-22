"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectDB() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log("MongoDB connected successfully");
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}
//# sourceMappingURL=db.js.map