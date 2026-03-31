/**
 * OrderTracking.tsx — Buyer's live order tracking page
 */

import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoute, useLocation } from "wouter";
import { CheckCircle, Clock, MapPin, Package, Truck, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

const STEPS = [
  { key: "pending",    label: "Order Placed",   icon: Package },
  { key: "paid",       label: "Payment Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing",     icon: Clock },
  { key: "assigned",   label: "Rider Assigned", icon: Truck },
  { key: "in_transit", label: "In Transit",     icon: MapPin },
  { key: "delivered",  label: "Delivered",      icon: CheckCircle },
];

const statusIndex: Record<string, number> = {
  pending: 0, paid: 1, processing: 2, assigned: 3, in_transit: 4, delivered: 5,
};

export default function OrderTracking() {
  const [, params] = useRoute("/order/:orderId/track");
  const [, navigate] = useLocation();

  const { data: order, isLoading } = trpc.orders.byId.useQuery(
    { orderId: params?.orderId ?? "" },
    { enabled: !!params?.orderId, refetchInterval: 15_000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader title="Order Tracking" />
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  const o = order as any;
  const currentStep = statusIndex[o?.status ?? "pending"] ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="Order Tracking" subtitle={o?.orderId} />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/orders")} className="mb-6 gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" /> My Orders
        </Button>

        <Card className="border-0 shadow-md mb-6">
          <CardHeader><CardTitle className="text-base">Delivery Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        done ? "bg-blue-600" : "bg-slate-200"
                      }`}>
                        <Icon className={`w-4 h-4 ${done ? "text-white" : "text-slate-400"}`} />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${done ? "bg-blue-300" : "bg-slate-200"}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-medium ${active ? "text-blue-700" : done ? "text-slate-800" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                      {active && <p className="text-xs text-blue-500 mt-0.5">Current status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {o && (
          <Card className="border-0 shadow-md">
            <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between"><span>Order ID</span><span className="font-medium text-slate-800">{o.orderId}</span></div>
              <div className="flex justify-between"><span>Delivery Address</span><span className="font-medium text-slate-800 text-right max-w-[60%]">{o.shippingAddress}, {o.shippingCity}</span></div>
              <div className="flex justify-between"><span>Total</span><span className="font-bold text-blue-600">₦{Number(o.finalAmount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Items</span><span className="font-medium text-slate-800">{o.items?.length ?? 0}</span></div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
