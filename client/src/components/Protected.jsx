import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import {getToken} from "../utils/auth";


export function ProtectedRoute() {
  const location = useLocation();
  const token = getToken();

  if (!token && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
