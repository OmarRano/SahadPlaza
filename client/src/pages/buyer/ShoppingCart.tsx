/**
 * ShoppingCart.tsx — Buyer cart page (replaces the duplicate Cart.tsx)
 */

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ShoppingCart() {
  const [, navigate] = useLocation();

  const { data: cartItems, refetch, isLoading } = trpc.cart.list.useQuery();

  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => { toast.success("Item removed"); refetch(); },
  });

  const updateQty = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => refetch(),
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => { toast.success("Cart cleared"); refetch(); },
  });

  const items = (cartItems ?? []) as any[];
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (item.productId?.finalPrice ?? 0) * item.quantity;
  }, 0);
  const deliveryFee = subtotal > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader title="My Cart" />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="My Cart" subtitle={`${items.length} item${items.length !== 1 ? "s" : ""}`} />

      <main className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <ShoppingCart className="w-20 h-20 text-slate-300" />
            <h2 className="text-xl font-semibold text-slate-600">Your cart is empty</h2>
            <p className="text-slate-400">Browse products and add items to your cart</p>
            <Button onClick={() => navigate("/products")} className="gap-2">
              <Package className="w-4 h-4" /> Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => {
                const product = item.productId as any;
                return (
                  <Card key={item._id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-center">
                        {/* Image */}
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product?.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                            : <Package className="w-8 h-8 text-slate-300" />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{product?.name ?? "Product"}</p>
                          <p className="text-blue-600 font-bold mt-0.5">
                            ₦{Number(product?.finalPrice ?? 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => {
                              if (item.quantity <= 1) removeItem.mutate({ cartItemId: item._id.toString() });
                              else updateQty.mutate({ cartItemId: item._id.toString(), quantity: item.quantity - 1 });
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline" size="icon" className="h-7 w-7"
                            onClick={() => updateQty.mutate({ cartItemId: item._id.toString(), quantity: item.quantity + 1 })}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeItem.mutate({ cartItemId: item._id.toString() })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Line total */}
                        <p className="text-sm font-bold text-slate-800 min-w-[80px] text-right">
                          ₦{(Number(product?.finalPrice ?? 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Button variant="ghost" size="sm" onClick={() => clearCart.mutate()} className="text-red-500 hover:text-red-700">
                Clear cart
              </Button>
            </div>

            {/* Summary */}
            <Card className="border-0 shadow-md h-fit sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Delivery fee</span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-blue-600">₦{total.toLocaleString()}</span>
                </div>
                <Button className="w-full gap-2 mt-2" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
