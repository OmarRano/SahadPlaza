/**
 * Auth tRPC router — no Manus/OAuth dependency
 *
 * ── Role Login Details ───────────────────────────────────────────────────────
 *
 *  Role        │ Email                       │ Password         │ Access
 * ─────────────────────────────────────────────────────────────────────────────
 *  admin       │ admin@sahadstores.com        │ Admin@123456     │ Staff Portal
 *  manager     │ manager@sahadstores.com      │ Manager@123456   │ Staff Portal
 *  delivery    │ delivery@sahadstores.com     │ Delivery@123456  │ Staff Portal
 *  developer   │ developer@sahadstores.com    │ Developer@123456 │ Staff Portal
 *  buyer       │ (self-registered)            │ (own password)   │ Shop Account
 *  reader      │ (promoted from buyer)        │ (own password)   │ Shop Account
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Staff accounts are seeded into MongoDB at server startup (server/mongodb.ts).
 * Buyers register themselves. Admin can promote a buyer to "reader" (affiliate).
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "./models/User";
import { createSessionToken, getSessionCookieOptions, COOKIE_NAME } from "./_core/auth";

// ─── Password policy ──────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// ─── Router ───────────────────────────────────────────────────────────────────
export const authRouter = router({
  /**
   * Returns the currently authenticated user (password hash excluded).
   * Frontend calls this on every page load to check session state.
   */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const { passwordHash, ...safeUser } = ctx.user as any;
    return safeUser;
  }),

  /**
   * Clears the session cookie, logging the user out.
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_NAME, { path: "/" });
    return { success: true } as const;
  }),

  /**
   * BUYER SIGN UP
   * ─────────────────────────────────────────────────────────────────────────
   * • Open to anyone — all sign-ups are assigned the "buyer" role.
   * • Password is hashed with bcrypt (12 salt rounds) before saving.
   * • Auto-logs in after successful registration.
   *
   * Validation rules:
   *   - name        ≥ 2 chars
   *   - email       valid format, must be unique
   *   - password    ≥ 8 chars, 1 uppercase, 1 number
   *   - confirmPassword must match password
   */
  signupBuyer: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        password: passwordSchema,
        confirmPassword: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.password !== input.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const existing = await User.findOne({ email: input.email.toLowerCase().trim() });
      if (existing) {
        throw new Error("Email already registered. Please sign in instead.");
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(input.password, salt);

      const user = await User.create({
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        passwordHash,
        phone: input.phone?.trim() || undefined,
        role: "buyer",
        isActive: true,
      });

      // Auto-login after signup
      const token = await createSessionToken(user);
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));

      return {
        success: true,
        message: "Account created successfully! Welcome to Sahad Stores.",
        role: "buyer",
      };
    }),

  /**
   * BUYER LOGIN
   * ─────────────────────────────────────────────────────────────────────────
   * • For customers (buyer) and affiliates (reader) only.
   * • Uses generic "Invalid email or password" to prevent email enumeration.
   * • Staff accounts are rejected here — they must use loginStaff.
   */
  loginBuyer: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Always fetch passwordHash explicitly (select: false in schema)
      const user = await User.findOne({
        email: input.email.toLowerCase().trim(),
      }).select("+passwordHash");

      // Generic error — do NOT reveal whether the email exists
      if (!user) throw new Error("Invalid email or password.");

      if (!user.isActive) {
        throw new Error("Your account has been deactivated. Please contact support.");
      }

      // Reject staff accounts from the buyer portal
      const buyerRoles = ["buyer", "reader"];
      if (!buyerRoles.includes(user.role)) {
        throw new Error("Staff accounts must use the Staff Portal login.");
      }

      const isValid = await user.comparePassword(input.password);
      if (!isValid) throw new Error("Invalid email or password.");

      await User.findByIdAndUpdate(user._id, { lastSignedIn: new Date() });

      const token = await createSessionToken(user);
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));

      return { success: true, message: "Welcome back!", role: user.role };
    }),

  /**
   * STAFF LOGIN
   * ─────────────────────────────────────────────────────────────────────────
   * • For admin, manager, delivery, and developer roles only.
   * • Staff accounts are seeded into MongoDB at startup.
   * • Buyer accounts are rejected here — they must use loginBuyer.
   */
  loginStaff: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await User.findOne({
        email: input.email.toLowerCase().trim(),
      }).select("+passwordHash");

      if (!user) throw new Error("Invalid email or password.");

      if (!user.isActive) {
        throw new Error("Account deactivated. Please contact the administrator.");
      }

      const staffRoles = ["admin", "manager", "delivery", "developer"];
      if (!staffRoles.includes(user.role)) {
        throw new Error("Buyer accounts must use the Shop Account login.");
      }

      const isValid = await user.comparePassword(input.password);
      if (!isValid) throw new Error("Invalid email or password.");

      await User.findByIdAndUpdate(user._id, { lastSignedIn: new Date() });

      const token = await createSessionToken(user);
      ctx.res.cookie(COOKIE_NAME, token, getSessionCookieOptions(ctx.req));

      return {
        success: true,
        message: `Logged in as ${user.role}`,
        role: user.role,
      };
    }),
});
