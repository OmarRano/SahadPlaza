/**
 * Main tRPC application router — MongoDB / Mongoose only
 */

import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./auth";
import { z } from "zod";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import {
  adminProcedure, managerProcedure, deliveryProcedure,
  readerProcedure, buyerProcedure, adminOrManagerProcedure, staffProcedure, developerProcedure,
} from "./rbac";
import {
  getProductById, getProductsByCategory, searchProducts,
  getCartItems, addToCart, removeFromCart, clearCart,
  getUserOrders, getOrderByOrderId, getDeliveryOrders,
  getAllCategories, getFeaturedProducts, getAllUsers,
  getTotalSalesStats, getPlatformStats, updateUserRole, setUserAffiliate,
} from "./db";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Order } from "./models/Order";
import { CartItem } from "./models/CartItem";

function calcFinalPrice(baseSalePrice: number, commissionPercent: number): number {
  return parseFloat((baseSalePrice * (1 + commissionPercent / 100)).toFixed(2));
}

export const appRouter = router({
  auth: authRouter,

  // PRODUCTS
  products: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) =>
        Product.find({ isActive: true }).populate("categoryId").skip(input.offset).limit(input.limit).lean()
      ),
    featured: publicProcedure.query(() => getFeaturedProducts(10)),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => getProductsByCategory(input.categoryId, input.limit, input.offset)),
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(({ input }) => searchProducts(input.query, input.limit, input.offset)),
    detail: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getProductById(input.id)),
    create: managerProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        categoryId: z.string(),
        costPrice: z.number(),
        baseSalePrice: z.number(),
        commissionPercent: z.number().default(10),
        stockQuantity: z.number().default(0),
        images: z.array(z.string()).default([]),
      }))
      .mutation(async ({ input, ctx }) => {
        const finalPrice = calcFinalPrice(input.baseSalePrice, input.commissionPercent);
        const p = await Product.create({ ...input, categoryId: new mongoose.Types.ObjectId(input.categoryId), finalPrice, createdBy: (ctx.user as any)._id });
        return { success: true, id: p._id.toString() };
      }),
    update: managerProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        baseSalePrice: z.number().optional(),
        commissionPercent: z.number().optional(),
        stockQuantity: z.number().optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const product = await Product.findById(id);
        if (!product) throw new Error("Product not found");
        if (updates.baseSalePrice || updates.commissionPercent) {
          const price = updates.baseSalePrice ?? product.baseSalePrice;
          const pct = updates.commissionPercent ?? product.commissionPercent;
          (updates as any).finalPrice = calcFinalPrice(price, pct);
        }
        await Product.findByIdAndUpdate(id, updates);
        return { success: true };
      }),
    delete: managerProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await Product.findByIdAndUpdate(input.id, { isActive: false });
        return { success: true };
      }),
  }),

  // CATEGORIES
  categories: router({
    list: publicProcedure.query(() => getAllCategories()),
    create: adminOrManagerProcedure
      .input(z.object({ name: z.string(), description: z.string().optional(), image: z.string().optional() }))
      .mutation(async ({ input }) => {
        const cat = await Category.create(input);
        return { success: true, id: cat._id.toString() };
      }),
    update: adminOrManagerProcedure
      .input(z.object({ id: z.string(), name: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await Category.findByIdAndUpdate(id, updates);
        return { success: true };
      }),
  }),

  // CART
  cart: router({
    list: buyerProcedure.query(async ({ ctx }) => getCartItems((ctx.user as any)._id.toString())),
    add: buyerProcedure
      .input(z.object({ productId: z.string(), quantity: z.number().min(1) }))
      .mutation(async ({ input, ctx }) => {
        await addToCart((ctx.user as any)._id.toString(), input.productId, input.quantity);
        return { success: true };
      }),
    remove: buyerProcedure
      .input(z.object({ cartItemId: z.string() }))
      .mutation(async ({ input }) => { await removeFromCart(input.cartItemId); return { success: true }; }),
    updateQuantity: buyerProcedure
      .input(z.object({ cartItemId: z.string(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        await CartItem.findByIdAndUpdate(input.cartItemId, { quantity: input.quantity });
        return { success: true };
      }),
    clear: buyerProcedure.mutation(async ({ ctx }) => {
      await clearCart((ctx.user as any)._id.toString());
      return { success: true };
    }),
  }),

  // ORDERS
  orders: router({
    list: buyerProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input, ctx }) => getUserOrders((ctx.user as any)._id.toString(), input.limit, input.offset)),
    detail: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByOrderId(input.orderId);
        if (!order) throw new Error("Order not found");
        return order;
      }),
    create: buyerProcedure
      .input(z.object({
        shippingAddress: z.string(),
        shippingCity: z.string(),
        shippingState: z.string().optional(),
        shippingZipCode: z.string().optional(),
        shippingCountry: z.string().default("Nigeria"),
        buyerPhone: z.string(),
        referralCode: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userId = (ctx.user as any)._id.toString();
        const cartItems = await getCartItems(userId);
        if (cartItems.length === 0) throw new Error("Your cart is empty.");

        let totalAmount = 0;
        let totalCommission = 0;
        const items: any[] = [];

        for (const item of cartItems) {
          const p = item.productId as any;
          const commission = (p.baseSalePrice * p.commissionPercent) / 100;
          const subtotal = p.finalPrice * item.quantity;
          totalAmount += subtotal;
          totalCommission += commission * item.quantity;
          items.push({
            productId: p._id, name: p.name, quantity: item.quantity,
            costPrice: p.costPrice, baseSalePrice: p.baseSalePrice,
            commissionPercent: p.commissionPercent,
            commissionAmount: parseFloat((commission * item.quantity).toFixed(2)),
            finalPrice: p.finalPrice, subtotal: parseFloat(subtotal.toFixed(2)),
          });
        }

        const orderId = `ORD-${nanoid(10).toUpperCase()}`;
        await Order.create({
          orderId, buyerId: userId, items,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          commissionAmount: parseFloat(totalCommission.toFixed(2)),
          finalAmount: parseFloat(totalAmount.toFixed(2)),
          ...input,
        });
        await clearCart(userId);
        return { success: true, orderId, totalAmount: parseFloat(totalAmount.toFixed(2)) };
      }),
    cancel: buyerProcedure
      .input(z.object({ orderId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const order = await getOrderByOrderId(input.orderId);
        if (!order) throw new Error("Order not found");
        if (order.buyerId.toString() !== (ctx.user as any)._id.toString()) throw new Error("Not authorised");
        if (!["pending", "paid"].includes(order.status)) throw new Error("Cannot cancel at this stage");
        await Order.findOneAndUpdate({ orderId: input.orderId }, { status: "cancelled" });
        return { success: true };
      }),
    updateStatus: staffProcedure
      .input(z.object({ orderId: z.string(), status: z.enum(["pending","paid","processing","assigned","in_transit","delivered","cancelled"]) }))
      .mutation(async ({ input }) => {
        await Order.findOneAndUpdate({ orderId: input.orderId }, { status: input.status });
        return { success: true };
      }),
  }),

  // DELIVERY
  delivery: router({
    myOrders: deliveryProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input, ctx }) => getDeliveryOrders((ctx.user as any)._id.toString(), input.limit, input.offset)),
    updateStatus: deliveryProcedure
      .input(z.object({ orderId: z.string(), status: z.enum(["assigned","in_transit","delivered"]) }))
      .mutation(async ({ input }) => {
        const update: any = { status: input.status };
        if (input.status === "delivered") update.paymentStatus = "paid";
        await Order.findOneAndUpdate({ orderId: input.orderId }, update);
        return { success: true };
      }),
    assignOrder: adminOrManagerProcedure
      .input(z.object({ orderId: z.string(), riderId: z.string() }))
      .mutation(async ({ input }) => {
        await Order.findOneAndUpdate({ orderId: input.orderId }, { deliveryRiderId: input.riderId, status: "assigned" });
        return { success: true };
      }),
  }),

  // ADMIN
  admin: router({
    stats: adminProcedure.query(() => getPlatformStats()),
    salesStats: adminProcedure.query(() => getTotalSalesStats()),
    users: adminProcedure
      .input(z.object({ role: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(({ input }) => getAllUsers(input.role, input.limit, input.offset)),
    updateUserRole: adminProcedure
      .input(z.object({ userId: z.string(), role: z.string() }))
      .mutation(async ({ input }) => { await updateUserRole(input.userId, input.role); return { success: true }; }),
    enableAffiliate: adminProcedure
      .input(z.object({ userId: z.string(), enable: z.boolean() }))
      .mutation(async ({ input }) => { await setUserAffiliate(input.userId, input.enable); return { success: true }; }),
    allOrders: adminProcedure
      .input(z.object({ status: z.string().optional(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const filter: any = {};
        if (input.status) filter.status = input.status;
        return Order.find(filter).sort({ createdAt: -1 }).skip(input.offset).limit(input.limit).populate("buyerId", "name email phone").lean();
      }),
  }),

  // AFFILIATE
  affiliate: router({
    getReferralLink: readerProcedure.query(async ({ ctx }) => {
      const userId = (ctx.user as any)._id.toString();
      const code = `REF-${userId.slice(-8).toUpperCase()}`;
      const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
      return { code, url: `${baseUrl}/products?ref=${code}` };
    }),
    myStats: readerProcedure.query(async ({ ctx }) => {
      const userId = (ctx.user as any)._id.toString();
      const totalReferrals = await Order.countDocuments({ referralCode: { $regex: userId.slice(-8).toUpperCase() } });
      return { totalReferrals, totalEarnings: 0 };
    }),
  }),

  // INVENTORY
  inventory: router({
    adjustStock: managerProcedure
      .input(z.object({ productId: z.string(), quantityChange: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        const product = await Product.findById(input.productId);
        if (!product) throw new Error("Product not found");
        const newStock = product.stockQuantity + input.quantityChange;
        if (newStock < 0) throw new Error("Stock cannot go below zero");
        await Product.findByIdAndUpdate(input.productId, { stockQuantity: newStock });
        return { success: true, newStock };
      }),
    lowStock: managerProcedure
      .input(z.object({ threshold: z.number().default(10) }))
      .query(async ({ input }) => Product.find({ stockQuantity: { $lte: input.threshold }, isActive: true }).lean()),
  }),

  // DEVELOPER
  developer: router({
    platformStats: developerProcedure.query(() => getPlatformStats()),
    salesStats: developerProcedure.query(() => getTotalSalesStats()),
  }),
});

export type AppRouter = typeof appRouter;
