
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

  // Don't redirect while still loading to prevent flash of redirect
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Only redirect if we're definitely not authenticated
  if (!session) {
    return <Navigate to={redirectTo} replace />;
  }

  // Only redirect if we definitely need admin access and user is not an admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
