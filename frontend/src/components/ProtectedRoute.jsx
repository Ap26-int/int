import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="min-h-screen bg-[hsl(var(--obsidian))] flex items-center justify-center">
        <div className="text-[hsl(var(--gold))] tracking-luxury uppercase text-xs">
          Verifying…
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  return children;
}
