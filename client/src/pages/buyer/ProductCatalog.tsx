/**
 * ProductCatalog.tsx — Public product browsing page
 * Works for unauthenticated users; cart requires buyer/reader login.
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Search, Star, Package, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ProductCatalog() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery({ limit: 40, offset: 0 });

  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => toast.success("Added to cart!"),
    onError: (e) => toast.error(e.message || "Please sign in to add items to your cart"),
  });

  const handleAddToCart = (productId: string) => {
    if (!user || !["buyer", "reader"].includes((user as any).role)) {
      navigate("/auth");
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
  };

  const filtered = (products ?? []).filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || p.categoryId?._id?.toString() === selectedCategory || p.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Home
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
            </div>
            <div className="flex items-center gap-2">
              {user && ["buyer", "reader"].includes((user as any).role) && (
                <Button variant="outline" onClick={() => navigate("/cart")} className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  My Cart
                </Button>
              )}
              {!user && (
                <Button onClick={() => navigate("/auth")} size="sm">Sign In</Button>
              )}
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {(categories ?? []).map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Package className="w-16 h-16 text-slate-300" />
            <p className="text-slate-500 text-lg">No products found</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory(""); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p: any) => (
              <Card
                key={p._id}
                className="border-0 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group overflow-hidden"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                {/* Image */}
                <div className="bg-slate-100 h-40 flex items-center justify-center overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="object-cover h-full w-full group-hover:scale-105 transition-transform" />
                  ) : (
                    <Package className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <CardContent className="pt-3 pb-1 px-3">
                  <Badge variant="secondary" className="text-xs mb-1">
                    {(p.categoryId as any)?.name ?? "General"}
                  </Badge>
                  <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{p.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-500">4.5</span>
                    <span className="text-xs text-slate-400 ml-1">· {p.stockQuantity} left</span>
                  </div>
                </CardContent>
                <CardFooter className="px-3 pb-3 pt-1 flex items-center justify-between">
                  <span className="text-base font-bold text-blue-600">
                    ₦{Number(p.finalPrice).toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(p._id.toString()); }}
                    disabled={addToCart.isPending || p.stockQuantity === 0}
                  >
                    {p.stockQuantity === 0 ? "Out of stock" : "Add"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
