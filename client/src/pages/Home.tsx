/**
 * Home.tsx — Public landing page
 *
 * Authenticated users are silently redirected to their dashboard.
 * All navigation uses wouter's navigate (no hard reloads).
 */

import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ShoppingBag, TrendingUp, Users, Zap, ArrowRight, Star } from "lucide-react";

const dashboardPath: Record<string, string> = {
  admin: "/admin",
  manager: "/manager",
  delivery: "/delivery",
  reader: "/affiliate",
  developer: "/developer",
  buyer: "/buyer",
};

export default function Home() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      navigate(dashboardPath[user.role] ?? "/products");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Sahad Stores</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/auth?mode=signup")}>
              Sign Up
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            The Complete E-Commerce Platform for Modern Businesses
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Manage your store, track inventory, process orders, and grow your business
            with our comprehensive multi-role commerce solution.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/products")}>
              Browse Products
            </Button>
          </div>

          {/* Quick demo role pills */}
          <div className="mt-8 flex gap-2 justify-center flex-wrap">
            <span className="text-sm text-slate-500 self-center">Staff login:</span>
            <Button size="sm" variant="outline" onClick={() => navigate("/auth?mode=staff")}>
              Staff Portal →
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
            Powerful Features for Every Role
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag, color: "text-blue-600", title: "For Buyers",
                sub: "Seamless Shopping Experience",
                items: ["Browse curated product catalog", "Easy shopping cart management", "Secure checkout with Monnify", "Real-time order tracking", "Product reviews and ratings"],
              },
              {
                icon: Zap, color: "text-amber-600", title: "For Managers",
                sub: "Complete Store Control",
                items: ["Add and manage products", "Real-time inventory tracking", "Automated pricing with commissions", "Stock alerts and adjustments", "Category management"],
              },
              {
                icon: TrendingUp, color: "text-green-600", title: "For Delivery",
                sub: "Efficient Logistics",
                items: ["View assigned orders", "GPS tracking integration", "Status updates in real-time", "Automatic commission tracking", "Performance analytics"],
              },
              {
                icon: Users, color: "text-purple-600", title: "For Admins",
                sub: "Full Platform Control",
                items: ["Comprehensive sales dashboard", "User management and roles", "Revenue analytics and reports", "Commission configuration", "Platform-wide settings"],
              },
              {
                icon: Star, color: "text-yellow-600", title: "For Affiliates",
                sub: "Earn Through Referrals",
                items: ["Generate referral links", "Track conversions", "Real-time earnings dashboard", "Commission history", "Performance metrics"],
              },
              {
                icon: Zap, color: "text-indigo-600", title: "For Developers",
                sub: "Platform Insights",
                items: ["Platform-wide analytics", "Commission distribution", "Store performance tracking", "Revenue insights", "System configuration"],
              },
            ].map(({ icon: Icon, color, title, sub, items }) => (
              <Card key={title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <Icon className={`w-8 h-8 ${color} mb-2`} />
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{sub}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  {items.map((item) => <p key={item}>• {item}</p>)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">
          Why Choose Sahad Stores?
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {[
            { title: "Automated Commission System", desc: "Transparent profit calculation and automatic commission distribution for all stakeholders." },
            { title: "Real-Time Analytics", desc: "Comprehensive dashboards with live sales data, inventory tracking, and performance metrics." },
            { title: "Multi-Role Access Control", desc: "Six distinct user roles with granular permissions and specialized dashboards." },
            { title: "GPS Delivery Tracking", desc: "Real-time location tracking and order status updates for seamless delivery management." },
            { title: "Secure Payment Processing", desc: "Integrated Monnify payment gateway with comprehensive transaction management." },
            { title: "Affiliate Commission System", desc: "Track referrals, manage commissions, and grow your network with built-in affiliate tools." },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-md bg-blue-600 text-white flex items-center justify-center">
                <ArrowRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="text-slate-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your E-Commerce Business?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of businesses using Sahad Stores to manage their operations efficiently.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>
            Sign In Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Sahad Stores. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
