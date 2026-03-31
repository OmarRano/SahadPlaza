/**
 * OrderHistory.tsx — Buyer order list connected to real tRPC data
 */

import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Package, MapPin, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "Pending",    color: "bg-slate-100 text-slate-700",   icon: Clock },
  paid:       { label: "Paid",       color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700",   icon: Clock },
  assigned:   { label: "Assigned",   color: "bg-purple-100 text-purple-700", icon: MapPin },
  in_transit: { label: "In Transit", color: "bg-indigo-100 text-indigo-700", icon: MapPin },
  delivered:  { label: "Delivered",  color: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700",       icon: XCircle },
};

export default function OrderHistory() {
  const [, navigate] = useLocation();
  const { data: orders, isLoading } = trpc.orders.list.useQuery({ limit: 30, offset: 0 });

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="My Orders" subtitle="Track and manage your orders" />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (orders ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Package className="w-16 h-16 text-slate-300" />
            <p className="text-slate-500 text-lg font-medium">No orders yet</p>
            <Button onClick={() => navigate("/products")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders as any[]).map((order: any) => {
              const cfg = statusConfig[order.status] ?? statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <Card key={order._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{order.orderId}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}{order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">₦{Number(order.finalAmount).toLocaleString()}</span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    {order.status === "in_transit" && (
                      <Button
                        size="sm" variant="outline" className="mt-3 gap-2"
                        onClick={() => navigate(`/order/${order.orderId}/track`)}
                      >
                        <MapPin className="w-3.5 h-3.5" /> Track Order
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
