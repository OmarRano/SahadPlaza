/**
 * DeliveryOrders.tsx — Delivery rider's assigned orders with live status updates
 */

import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { MapPin, Truck, CheckCircle, Phone, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusBadge: Record<string, string> = {
  assigned:   "bg-amber-100 text-amber-800",
  in_transit: "bg-blue-100 text-blue-800",
  delivered:  "bg-green-100 text-green-800",
};

export default function DeliveryOrders() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: orders, isLoading } = trpc.delivery.myOrders.useQuery({ limit: 30, offset: 0 });

  const updateStatus = trpc.delivery.updateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); utils.delivery.myOrders.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader title="My Delivery Orders" />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="My Delivery Orders" subtitle="Manage your assigned deliveries" />
      <main className="container mx-auto px-4 py-8">
        {(orders as any[] ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Truck className="w-16 h-16 text-slate-300" />
            <p className="text-slate-500 text-lg">No orders assigned yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders as any[]).map((order: any) => (
              <Card key={order._id} className="border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-slate-900">{order.orderId}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        <MapPin className="inline w-3.5 h-3.5 mr-1" />
                        {order.shippingAddress}, {order.shippingCity}
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        <Phone className="inline w-3.5 h-3.5 mr-1" />
                        {order.buyerPhone}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {order.items?.length ?? 0} items · ₦{Number(order.finalAmount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 self-center">
                      {order.status === "assigned" && (
                        <Button
                          size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => updateStatus.mutate({ orderId: order.orderId, status: "in_transit" })}
                          disabled={updateStatus.isPending}
                        >
                          <Truck className="w-3.5 h-3.5" /> Start Delivery
                        </Button>
                      )}
                      {order.status === "in_transit" && (
                        <>
                          <Button
                            size="sm" className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus.mutate({ orderId: order.orderId, status: "delivered" })}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                          </Button>
                          <Button
                            size="sm" variant="outline" className="gap-2"
                            onClick={() => navigate(`/delivery/order/${order.orderId}/track`)}
                          >
                            <MapPin className="w-3.5 h-3.5" /> Track
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
