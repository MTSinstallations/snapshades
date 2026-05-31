import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import AdminGuard from "./components/AdminGuard.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// Eager: landing + products (first paint)
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy: loaded on demand (reduces initial bundle ~60%)
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const QuickOrder = lazy(() => import("./pages/QuickOrder.tsx"));
const StartProject = lazy(() => import("./pages/StartProject.tsx"));
const MeasureWizard = lazy(() => import("./pages/MeasureWizard.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Swatches = lazy(() => import("./pages/Swatches.tsx"));
const SwatchOrder = lazy(() => import("./pages/SwatchOrder.tsx"));
const Inspiration = lazy(() => import("./pages/Inspiration.tsx"));
const ShutterDetail = lazy(() => import("./pages/ShutterDetail.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const InstallerSignup = lazy(() => import("./pages/InstallerSignup.tsx"));
const Schedule = lazy(() => import("./pages/Schedule.tsx"));
const ContractorPortal = lazy(() => import("./pages/ContractorPortal.tsx"));
const ContractorOnboarding = lazy(() => import("./pages/ContractorOnboarding.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const AdminContractors = lazy(() => import("./pages/AdminContractors.tsx"));
const AdminZipActivation = lazy(() => import("./pages/AdminZipActivation.tsx"));
const BookDesigner = lazy(() => import("./pages/BookDesigner.tsx"));
const CustomerService = lazy(() => import("./pages/CustomerService.tsx"));
const InstallGuide = lazy(() => import("./pages/InstallGuide.tsx"));
const SeoLanding = lazy(() => import("./pages/SeoLanding.tsx"));
const AddWindowForm = lazy(() => import("./pages/AddWindowForm.tsx"));

const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/order" element={<QuickOrder />} />
          <Route path="/start" element={<StartProject />} />
          <Route path="/measure/:mode" element={<MeasureWizard />} />
          <Route path="/add-window" element={<AddWindowForm />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/swatches" element={<Swatches />} />
          <Route path="/swatches/order" element={<SwatchOrder />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/products/plantation-shutters" element={<ShutterDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signin" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/account" element={<CustomerPortal />} />
          <Route path="/account/orders" element={<CustomerPortal />} />
          <Route path="/account/projects" element={<CustomerPortal />} />
          <Route path="/account/photos" element={<CustomerPortal />} />
          <Route path="/account/documents" element={<CustomerPortal />} />
          <Route path="/account/settings" element={<CustomerPortal />} />
          <Route path="/installers" element={<InstallerSignup />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/portal" element={<ContractorPortal />} />
          <Route path="/portal/contractor" element={<ContractorPortal />} />
          <Route path="/portal/designer" element={<ContractorPortal />} />
          <Route path="/onboard" element={<ContractorOnboarding />} />
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/contractors" element={<AdminGuard><AdminContractors /></AdminGuard>} />
          <Route path="/admin/zip-activation" element={<AdminGuard><AdminZipActivation /></AdminGuard>} />
          <Route path="/design" element={<BookDesigner />} />
          <Route path="/shutters/:cityState" element={<SeoLanding />} />
          <Route path="/blinds/:cityState" element={<SeoLanding />} />
          <Route path="/shades/:cityState" element={<SeoLanding />} />
          <Route path="/guides" element={<InstallGuide />} />
          <Route path="/guides/:product" element={<InstallGuide />} />
          <Route path="/help" element={<CustomerService />} />
          <Route path="/warranty" element={<CustomerService />} />
          <Route path="/claims" element={<CustomerService />} />
          <Route path="/returns" element={<CustomerService />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </HelmetProvider>
  </ErrorBoundary>
);

export default App;
