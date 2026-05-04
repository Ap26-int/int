import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LuxuryInteriorLanding from "./pages/LuxuryInteriorLanding";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminLeads from "./pages/AdminLeads";
import AdminSocial from "./pages/AdminSocial";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/luxury-interior" element={<LuxuryInteriorLanding />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/leads" replace />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="social" element={<AdminSocial />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "hsl(0 0% 6%)",
            border: "1px solid hsl(42 48% 58% / 0.3)",
            color: "hsl(40 33% 93%)",
            fontFamily: "Manrope, sans-serif",
            letterSpacing: "0.02em",
          },
        }}
      />
    </div>
  );
}

export default App;
