import { createServer } from "../src/server";

// Vercel serverless function handler
// This wraps the Express app for Vercel's serverless environment
let appPromise: Promise<ReturnType<typeof import("express").default>> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createServer();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  
  // Handle the request with Express
  // Vercel's @vercel/node will handle the conversion
  return app(req, res);
}

