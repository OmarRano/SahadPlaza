/**
 * BuyerProfile.tsx — Buyer profile & account settings
 */

import { useState, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";

export default function BuyerProfile() {
  const { user } = useAuth();
  const u = user as any;

  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "", city: "",
  });

  useEffect(() => {
    if (u) {
      setForm({
        name: u.name ?? "", email: u.email ?? "",
        phone: u.phone ?? "", address: u.address ?? "", city: u.city ?? "",
      });
    }
  }, [u]);

  const handleSave = () => {
    // Profile update would call a tRPC mutation here
    toast.success("Profile saved! (API integration pending)");
  };

  const roleLabel: Record<string, string> = {
    buyer: "Buyer", reader: "Affiliate",
    admin: "Admin", manager: "Manager", delivery: "Delivery", developer: "Developer",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader title="My Profile" subtitle="Manage your account information" />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Avatar card */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                {u?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{u?.name ?? "User"}</h2>
                <p className="text-sm text-slate-500">{u?.email}</p>
                <Badge className="mt-1" variant="secondary">{roleLabel[u?.role ?? "buyer"]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Full Name", key: "name", icon: User, type: "text" },
              { label: "Email Address", key: "email", icon: Mail, type: "email" },
              { label: "Phone Number", key: "phone", icon: Phone, type: "tel" },
              { label: "Delivery Address", key: "address", icon: MapPin, type: "text" },
              { label: "City", key: "city", icon: MapPin, type: "text" },
            ].map(({ label, key, icon: Icon, type }) => (
              <div key={key}>
                <Label className="text-xs text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </Label>
                <Input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <Button onClick={handleSave} className="w-full mt-2">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Security note */}
        <Card className="border-0 shadow-md mt-4 bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Account Security</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Your session is secured with JWT. Password changes are available through the auth page.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
