import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminRaffles from "./pages/AdminRaffles";
import AdminInstantPrizes from "./pages/AdminInstantPrizes";
import AdminPackages from "./pages/AdminPackages";
import AdminGallery from "./pages/AdminGallery";
import AdminConfirmations from "./pages/AdminConfirmations";
import AdminSoldNumbers from "./pages/AdminSoldNumbers";
import AdminDesign from "./pages/AdminDesign";
import ConsultarRifas from "./pages/ConsultarRifas";
import ComprarNumeros from "./pages/ComprarNumeros";
import ConsultarNumeros from "./pages/ConsultarNumeros";
import DetallesActividad from "./pages/DetallesActividad";
import PurchaseFlow from "./pages/PurchaseFlow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/comprar" element={<ComprarNumeros />} />
            <Route path="/consultar" element={<ConsultarNumeros />} />
            <Route path="/detalles" element={<DetallesActividad />} />
            <Route path="/admin" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/raffles" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminRaffles />
              </ProtectedRoute>
            } />
            <Route path="/admin/instant-prizes" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminInstantPrizes />
              </ProtectedRoute>
            } />
            <Route path="/admin/packages" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminPackages />
              </ProtectedRoute>
            } />
            <Route path="/admin/gallery" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminGallery />
              </ProtectedRoute>
            } />
            <Route path="/admin/confirmations" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminConfirmations />
              </ProtectedRoute>
            } />
            <Route path="/admin/sold-numbers" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminSoldNumbers />
              </ProtectedRoute>
            } />
            <Route path="/admin/design" element={
              <ProtectedRoute requiresAdmin={true}>
                <AdminDesign />
              </ProtectedRoute>
            } />
            <Route path="/admin/consultar" element={
              <ProtectedRoute requiresAdmin={true}>
                <ConsultarRifas />
              </ProtectedRoute>
            } />
            <Route path="/purchase/:raffleId/:packageId" element={<PurchaseFlow />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
