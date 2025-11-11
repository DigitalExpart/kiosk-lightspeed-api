import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    logger.warn({
      path: req.path,
      issues: error.issues,
    }, "Validation failed");

    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues,
    });
  }

  logger.error({
    error,
    path: req.path,
    method: req.method,
  }, "Unhandled error");

  const status = typeof error.status === "number" ? error.status : 500;
  const message =
    status >= 500 ? "Internal server error" : error.message || "Request failed";

  return res.status(status).json({
    message,
  });
};
