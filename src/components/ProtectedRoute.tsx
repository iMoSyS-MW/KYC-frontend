import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from '../api/client';
import { isTokenExpired } from '../lib/security';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('adminToken');

      // No token at all → not authenticated
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Token present but expired client-side → clear and redirect
      if (isTokenExpired(token)) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        return;
      }

      // Token looks valid client-side; optionally verify with backend
      try {
        await axios.get('/api/auth/verify');
        setIsAuthenticated(true);
      } catch {
        // Backend rejected the token
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-om-green" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
