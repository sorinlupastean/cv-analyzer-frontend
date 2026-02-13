// ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "./paths";

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem("access_token");

  return isAuthenticated ? <Outlet /> : <Navigate to={PATHS.ROOT} replace />;
};

export default ProtectedRoute;
