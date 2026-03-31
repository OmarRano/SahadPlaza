/**
 * Checkout.tsx — 3-step checkout: Address → Payment → Confirm
 *
 * Uses trpc.orders.create to place the order (cart items are
 * resolved server-side).  Monnify payment can be integrated
 * in a future phase via a separate payment router.
 */

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { CheckCircle2, MapPin, CreditCard, Package } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Step = "address" | "payment" | "review";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "address", label: "Address",  icon: MapPin },
  { id: "payment", label: "Payment",  icon: CreditCard },
  { id: "review",  label: "Confirm",  icon: CheckCircle2 },
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("address");
  const [placed, setPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  const [address, setAddress] = useState({
    shippingAddress: "",
    shippingCity:    "",
    shippingState:   "",
    shippingZipCode: "",
    shippingCountry: "Nigeria",
    buyerPhone:      "",
  });

  const { data: cartItems } = trpc.cart.list.useQuery();

  const total = (cartItems as any[])?.reduce(
    (sum: number, item: any) =>
      sum + (item.productId?.finalPrice ?? 0) * item.quantity,
    0
  ) ?? 0;

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setPlacedOrderId(data.orderId);
      setPlaced(true);
    },
    onError: (e) => toast.error(e.message || "Failed to place order"),
  });

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  if (placed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader title="Order Confirmed" />
        <main className="container mx-auto px-4 py-16 max-w-lg text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-600 mb-2">Your order has been confirmed.</p>
          <p className="font-mono text-blue-600 text-lg mb-8">{placedOrderId}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/orders")}>View My Orders</Button>
            <Button variant="outline" onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="Checkout" subtitle="Complete your purchase" />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Steps indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  done   ? "bg-green-100 text-green-700" :
                  active ? "bg-blue-100 text-blue-700"  :
                           "bg-slate-100 text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" />
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 mx-1 rounded ${i < currentIdx ? "bg-green-300" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form area */}
          <div className="md:col-span-2">
            {step === "address" && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Phone Number", key: "buyerPhone", placeholder: "+234 801 234 5678" },
                    { label: "Street Address", key: "shippingAddress", placeholder: "45 Wuse Zone 3" },
                    { label: "City", key: "shippingCity", placeholder: "Abuja" },
                    { label: "State", key: "shippingState", placeholder: "FCT" },
                    { label: "ZIP / Post Code", key: "shippingZipCode", placeholder: "900001" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <Label className="text-sm">{label}</Label>
                      <Input
                        className="mt-1"
                        placeholder={placeholder}
                        value={(address as any)[key]}
                        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <Button
                    className="w-full mt-2"
                    onClick={() => {
                      if (!address.shippingAddress || !address.shippingCity || !address.buyerPhone) {
                        toast.error("Please fill in address, city and phone number.");
                        return;
                      }
                      setStep("payment");
                    }}
                  >
                    Continue to Payment →
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: "monnify", label: "Monnify — Bank Transfer / Card", desc: "Secure payment powered by Monnify" },
                    { id: "pod",     label: "Pay on Delivery",                desc: "Pay when your order arrives" },
                  ].map((m) => (
                    <label key={m.id} className="flex gap-3 p-4 border rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
                      <input type="radio" name="payment" defaultChecked={m.id === "monnify"} className="mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{m.label}</p>
                        <p className="text-xs text-slate-500">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep("address")} className="flex-1">← Back</Button>
                    <Button onClick={() => setStep("review")} className="flex-1">Review Order →</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "review" && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Review & Place Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
                    <p className="font-medium">Delivering to:</p>
                    <p className="text-slate-600">{address.shippingAddress}, {address.shippingCity}, {address.shippingState}</p>
                    <p className="text-slate-600">{address.buyerPhone}</p>
                  </div>
                  <div className="space-y-2">
                    {(cartItems as any[])?.map((item: any) => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span>{item.productId?.name} × {item.quantity}</span>
                        <span>₦{((item.productId?.finalPrice ?? 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">₦{total.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("payment")} className="flex-1">← Back</Button>
                    <Button
                      onClick={() => createOrder.mutate({ ...address, shippingCountry: "Nigeria" })}
                      disabled={createOrder.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {createOrder.isPending ? "Placing…" : "Place Order ✓"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order summary sidebar */}
          <div>
            <Card className="border-0 shadow-md sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {(cartItems as any[])?.map((item: any) => (
                  <div key={item._id} className="flex justify-between text-slate-600">
                    <span className="truncate max-w-[140px]">{item.productId?.name}</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
                {(!cartItems || (cartItems as any[]).length === 0) && (
                  <p className="text-slate-400 text-xs">Cart is empty</p>
                )}
                <div className="border-t pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-blue-600">₦{total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
