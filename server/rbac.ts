import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can access this resource." });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "manager") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only managers can access this resource." });
  }
  return next({ ctx });
});

export const deliveryProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "delivery") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only delivery personnel can access this resource." });
  }
  return next({ ctx });
});

export const readerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "reader") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only affiliates can access this resource." });
  }
  return next({ ctx });
});

export const buyerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "buyer" && ctx.user.role !== "reader") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only buyers can access this resource." });
  }
  return next({ ctx });
});

export const developerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "developer") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only developers can access this resource." });
  }
  return next({ ctx });
});

export const adminOrManagerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "manager") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only admins or managers can access this resource." });
  }
  return next({ ctx });
});

export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  const staffRoles = ["admin", "manager", "delivery", "developer"];
  if (!staffRoles.includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only staff can access this resource." });
  }
  return next({ ctx });
});
