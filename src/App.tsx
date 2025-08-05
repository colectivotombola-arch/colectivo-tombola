import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Reset from "./pages/Reset";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import AdminRaffles from "./pages/AdminRaffles";
import AdminPrizes from "./pages/AdminPrizes";
import AdminNewActivity from "./pages/AdminNewActivity";
import ComprarNumeros from "./pages/ComprarNumeros";
import ConsultarNumeros from "./pages/ConsultarNumeros";
import DetallesActividad from "./pages/DetallesActividad";
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
            <Route path="/reset" element={<Reset />} />
            <Route path="/comprar" element={<ComprarNumeros />} />
            <Route path="/consultar" element={<ConsultarNumeros />} />
            <Route path="/detalles" element={<DetallesActividad />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/raffles" element={<ProtectedRoute requireAdmin><AdminRaffles /></ProtectedRoute>} />
            <Route path="/admin/prizes" element={<ProtectedRoute requireAdmin><AdminPrizes /></ProtectedRoute>} />
            <Route path="/admin/activities/new" element={<ProtectedRoute requireAdmin><AdminNewActivity /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
