import { Router } from "express";

import { env } from "../config/env";

export const createHealthRouter = () => {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });

  return router;
};
