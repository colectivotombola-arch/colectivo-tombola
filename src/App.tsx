import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminRaffles from "./pages/AdminRaffles";
import AdminInstantPrizes from "./pages/AdminInstantPrizes";
import AdminPackages from "./pages/AdminPackages";
import ConsultarRifas from "./pages/ConsultarRifas";
import ComprarNumeros from "./pages/ComprarNumeros";
import ConsultarNumeros from "./pages/ConsultarNumeros";
import DetallesActividad from "./pages/DetallesActividad";
import PurchaseFlow from "./pages/PurchaseFlow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-primary">Cargando...</div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  return <>{children}</>;
};

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
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/raffles" element={
              <ProtectedRoute>
                <AdminRaffles />
              </ProtectedRoute>
            } />
            <Route path="/admin/instant-prizes" element={
              <ProtectedRoute>
                <AdminInstantPrizes />
              </ProtectedRoute>
            } />
            <Route path="/admin/packages" element={
              <ProtectedRoute>
                <AdminPackages />
              </ProtectedRoute>
            } />
            <Route path="/admin/consultar" element={
              <ProtectedRoute>
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
