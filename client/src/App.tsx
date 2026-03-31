/**
 * App.tsx — Root router for Sahad Stores
 *
 * Registers every page route with wouter's <Switch>.
 * Protected routes check the user's role; unauthenticated users
 * are redirected to /auth automatically.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

// ── Public pages ──────────────────────────────────────────────────────────────
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// ── Shared public ─────────────────────────────────────────────────────────────
import ProductCatalog from "./pages/buyer/ProductCatalog";
import ProductDetail from "./pages/ProductDetail";

// ── Buyer pages ───────────────────────────────────────────────────────────────
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import ShoppingCart from "./pages/buyer/ShoppingCart";
import Checkout from "./pages/buyer/Checkout";
import OrderHistory from "./pages/buyer/OrderHistory";
import OrderTracking from "./pages/buyer/OrderTracking";
import BuyerProfile from "./pages/buyer/BuyerProfile";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SalesAnalytics from "./pages/admin/SalesAnalytics";
import AffiliateManagement from "./pages/admin/AffiliateManagement";

// ── Manager pages ─────────────────────────────────────────────────────────────
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ProductManagement from "./pages/manager/ProductManagement";
import InventoryManagement from "./pages/manager/InventoryManagement";
import CategoryManagement from "./pages/manager/CategoryManagement";

// ── Delivery pages ────────────────────────────────────────────────────────────
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryOrders from "./pages/delivery/DeliveryOrders";
import OrderDeliveryTracking from "./pages/delivery/OrderDeliveryTracking";

// ── Affiliate pages ───────────────────────────────────────────────────────────
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import ReferralManagement from "./pages/affiliate/ReferralManagement";
import EarningsHistory from "./pages/affiliate/EarningsHistory";

// ── Developer pages ───────────────────────────────────────────────────────────
import DeveloperDashboard from "./pages/developer/DeveloperDashboard";
import PlatformAnalytics from "./pages/developer/PlatformAnalytics";

// ── Route guard ───────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  component: React.ComponentType;
  roles?: string[];
}

function ProtectedRoute({ component: Component, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (!user) {
    const dest = encodeURIComponent(window.location.pathname);
    window.location.href = `/auth?redirect=${dest}`;
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    return <NotFound />;
  }

  return <Component />;
}

// ── Router ────────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/login" component={Auth} />
      <Route path="/products" component={ProductCatalog} />
      <Route path="/product/:id" component={ProductDetail} />

      {/* Buyer & Affiliate (reader) */}
      <Route path="/buyer"><ProtectedRoute component={BuyerDashboard} roles={["buyer","reader"]} /></Route>
      <Route path="/cart"><ProtectedRoute component={ShoppingCart} roles={["buyer","reader"]} /></Route>
      <Route path="/checkout"><ProtectedRoute component={Checkout} roles={["buyer","reader"]} /></Route>
      <Route path="/orders"><ProtectedRoute component={OrderHistory} roles={["buyer","reader"]} /></Route>
      <Route path="/order/:orderId/track"><ProtectedRoute component={OrderTracking} roles={["buyer","reader"]} /></Route>
      <Route path="/profile"><ProtectedRoute component={BuyerProfile} roles={["buyer","reader"]} /></Route>

      {/* Admin */}
      <Route path="/admin"><ProtectedRoute component={AdminDashboard} roles={["admin"]} /></Route>
      <Route path="/admin/users"><ProtectedRoute component={UserManagement} roles={["admin"]} /></Route>
      <Route path="/admin/analytics"><ProtectedRoute component={SalesAnalytics} roles={["admin"]} /></Route>
      <Route path="/admin/affiliates"><ProtectedRoute component={AffiliateManagement} roles={["admin"]} /></Route>

      {/* Manager */}
      <Route path="/manager"><ProtectedRoute component={ManagerDashboard} roles={["manager"]} /></Route>
      <Route path="/manager/products"><ProtectedRoute component={ProductManagement} roles={["manager"]} /></Route>
      <Route path="/manager/inventory"><ProtectedRoute component={InventoryManagement} roles={["manager"]} /></Route>
      <Route path="/manager/categories"><ProtectedRoute component={CategoryManagement} roles={["manager"]} /></Route>

      {/* Delivery */}
      <Route path="/delivery"><ProtectedRoute component={DeliveryDashboard} roles={["delivery"]} /></Route>
      <Route path="/delivery/orders"><ProtectedRoute component={DeliveryOrders} roles={["delivery"]} /></Route>
      <Route path="/delivery/order/:orderId/track"><ProtectedRoute component={OrderDeliveryTracking} roles={["delivery"]} /></Route>

      {/* Affiliate */}
      <Route path="/affiliate"><ProtectedRoute component={AffiliateDashboard} roles={["reader"]} /></Route>
      <Route path="/affiliate/referrals"><ProtectedRoute component={ReferralManagement} roles={["reader"]} /></Route>
      <Route path="/affiliate/earnings"><ProtectedRoute component={EarningsHistory} roles={["reader"]} /></Route>

      {/* Developer */}
      <Route path="/developer"><ProtectedRoute component={DeveloperDashboard} roles={["developer"]} /></Route>
      <Route path="/developer/analytics"><ProtectedRoute component={PlatformAnalytics} roles={["developer"]} /></Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  );
}
