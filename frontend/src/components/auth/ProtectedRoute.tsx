import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('ms_token');
  const user = authService.getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard or home if they lack permissions
    if (user.role === 'SELLER') return <Navigate to="/dashboard/seller" replace />;
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/dashboard/admin" replace />;
    return <Navigate to="/dashboard/buyer" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
