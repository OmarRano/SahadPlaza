/**
 * ProductDetail.tsx — Public product detail page
 * Accessible without login. Add-to-cart requires buyer/reader role.
 */

import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Star, Package } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: product, isLoading } = trpc.products.detail.useQuery(
    { id: params?.id ?? "" },
    { enabled: !!params?.id }
  );

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => toast.success("Added to cart!"),
    onError: (e) => toast.error(e.message || "Failed to add to cart"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Package className="w-16 h-16 text-slate-400" />
        <h2 className="text-xl font-semibold text-slate-600">Product not found</h2>
        <Button onClick={() => navigate("/products")}>Back to Products</Button>
      </div>
    );
  }

  const p = product as any;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/products")} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-md p-8">
          {/* Image / placeholder */}
          <div className="flex items-center justify-center bg-slate-100 rounded-xl h-64 md:h-full min-h-[240px]">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.name} className="object-contain h-full w-full rounded-xl" />
            ) : (
              <Package className="w-24 h-24 text-slate-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <Badge variant="secondary" className="mb-2 text-xs">
                {(p.categoryId as any)?.name ?? "Uncategorised"}
              </Badge>
              <h1 className="text-2xl font-bold text-slate-900">{p.name}</h1>
            </div>

            {p.description && (
              <p className="text-slate-600 leading-relaxed">{p.description}</p>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.5 (124 reviews)</span>
              <span className="mx-2">·</span>
              <span>{p.stockQuantity} in stock</span>
            </div>

            <div className="border-t pt-4">
              <p className="text-3xl font-bold text-blue-600">
                ₦{Number(p.finalPrice).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Commission included · Powered by Sahad Stores
              </p>
            </div>

            {user && ["buyer", "reader"].includes((user as any).role) ? (
              <Button
                onClick={() => addToCart.mutate({ productId: p._id.toString(), quantity: 1 })}
                disabled={addToCart.isPending || p.stockQuantity === 0}
                className="gap-2 mt-2"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {addToCart.isPending ? "Adding…" : p.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            ) : (
              <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 mt-2">
                Sign in to Purchase
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
