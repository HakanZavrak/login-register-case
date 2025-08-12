import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";
import { isAuthenticated } from "../Utilities/auth";

interface LocationState { from?: Location; }

export default function ProtectedRoute() {
  const authed = isAuthenticated();
  const location = useLocation() as Location & { state?: LocationState };
  return authed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
