"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    console.error("Error:", err.message);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            error: "Validation failed",
            details: err.message,
        });
    }
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            error: "Invalid ID format",
        });
    }
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || "Internal server error",
    });
}
//# sourceMappingURL=errorHandler.js.map