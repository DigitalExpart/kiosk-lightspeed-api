"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const server_1 = require("../src/server");
// Vercel serverless function handler
// This wraps the Express app for Vercel's serverless environment
let appPromise = null;
async function getApp() {
    if (!appPromise) {
        appPromise = (0, server_1.createServer)();
    }
    return appPromise;
}
async function handler(req, res) {
    const app = await getApp();
    // Handle the request with Express
    // Vercel's @vercel/node will handle the conversion
    return app(req, res);
}
//# sourceMappingURL=index.js.map