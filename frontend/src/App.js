import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLeads from "./pages/AdminLeads";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
        </Routes>
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
