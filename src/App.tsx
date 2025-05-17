
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SupabaseProvider } from "@/hooks/useSupabaseSession";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Layout
import AppLayout from "@/layout/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import WelcomePage from "@/pages/WelcomePage";
import Dashboard from "@/pages/Dashboard";
import BuyPage from "@/pages/BuyPage";
import SellPage from "@/pages/SellPage";
import HistoryPage from "@/pages/HistoryPage";
import AdminPage from "@/pages/AdminPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const App = () => {
  return (
    <SupabaseProvider>
      <Toaster />
      <SonnerToaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route element={<AppLayout />}>
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/buy" element={<BuyPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
          
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </SupabaseProvider>
  );
};

export default App;
