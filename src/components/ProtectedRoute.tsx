
import { Navigate, Outlet } from "react-router-dom";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({
  requireAdmin = false,
  redirectTo = "/",
}: ProtectedRouteProps) => {
  const { session, isLoading, isAdmin } = useSupabaseSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
