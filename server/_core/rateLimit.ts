/**
 * Rate limiting middleware for Express
 * Uses a simple in-memory token bucket (no Redis dependency for dev).
 */

import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

function createRateLimiter(maxRequests: number, windowMs: number) {
  const store: RateLimitStore = {};

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();

    if (!store[ip] || store[ip].resetAt < now) {
      store[ip] = { count: 1, resetAt: now + windowMs };
      return next();
    }

    store[ip].count++;

    if (store[ip].count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests. Please wait a moment before trying again.",
      });
    }

    next();
  };
}

// Stricter limit for auth endpoints (20 req / 15 min)
export const authRateLimiter = createRateLimiter(20, 15 * 60 * 1000);

// General API limit (200 req / min)
export const apiRateLimiter = createRateLimiter(200, 60 * 1000);
