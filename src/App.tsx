import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminGuard from '@/components/AdminGuard';
import ErrorBoundary from '@/components/ErrorBoundary';
import Index from '@/pages/Index';

const QuickOrder = lazy(() => import('@/pages/QuickOrder'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const CustomerPortal = lazy(() => import('@/pages/CustomerPortal'));
const Auth = lazy(() => import('@/pages/Auth'));
const InstallerSignup = lazy(() => import('@/pages/InstallerSignup'));
const Schedule = lazy(() => import('@/pages/Schedule'));
const ContractorPortal = lazy(() => import('@/pages/ContractorPortal'));
const ContractorOnboarding = lazy(() => import('@/pages/ContractorOnboarding'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminContractors = lazy(() => import('@/pages/AdminContractors'));
const AdminZipActivation = lazy(() => import('@/pages/AdminZipActivation'));
const CustomerService = lazy(() => import('@/pages/CustomerService'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-sand">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-clay" />
  </div>
);

const queryClient = new QueryClient();

const StorefrontRedirect = () => <Navigate to="/order" replace />;

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/order" element={<QuickOrder />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />

                  {/* Retired shopping paths all enter the one simplified order flow. */}
                  <Route path="/products" element={<StorefrontRedirect />} />
                  <Route path="/products/:slug" element={<StorefrontRedirect />} />
                  <Route path="/start" element={<StorefrontRedirect />} />
                  <Route path="/measure/:mode" element={<StorefrontRedirect />} />
                  <Route path="/add-window" element={<StorefrontRedirect />} />
                  <Route path="/swatches" element={<StorefrontRedirect />} />
                  <Route path="/swatches/order" element={<StorefrontRedirect />} />
                  <Route path="/inspiration" element={<StorefrontRedirect />} />
                  <Route path="/products/plantation-shutters" element={<StorefrontRedirect />} />
                  <Route path="/design" element={<StorefrontRedirect />} />
                  <Route path="/shutters/:cityState" element={<StorefrontRedirect />} />
                  <Route path="/blinds/:cityState" element={<StorefrontRedirect />} />
                  <Route path="/shades/:cityState" element={<StorefrontRedirect />} />
                  <Route path="/guides" element={<StorefrontRedirect />} />
                  <Route path="/guides/:product" element={<StorefrontRedirect />} />

                  <Route path="/auth" element={<Auth />} />
                  <Route path="/signin" element={<Auth />} />
                  <Route path="/signup" element={<Auth />} />
                  <Route path="/account" element={<CustomerPortal />} />
                  <Route path="/account/orders" element={<CustomerPortal />} />
                  <Route path="/account/projects" element={<CustomerPortal />} />
                  <Route path="/account/photos" element={<CustomerPortal />} />
                  <Route path="/account/documents" element={<CustomerPortal />} />
                  <Route path="/account/settings" element={<CustomerPortal />} />

                  {/* Existing operations portals stay intact and are not part of the store catalog. */}
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
                  <Route path="/help" element={<CustomerService />} />
                  <Route path="/warranty" element={<CustomerService />} />
                  <Route path="/claims" element={<CustomerService />} />
                  <Route path="/returns" element={<CustomerService />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
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
