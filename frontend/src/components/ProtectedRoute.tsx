import { Navigate, Outlet } from "react-router-dom";


const isAuthenticated = () => false; 

export default function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}
