import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // You can return a loading spinner or some other loading indicator here
        return <div>Loading...</div>;
    }

    if (!user) {
        // Redirect to login, but save the current location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user.username) {
        // Redirect to set username, but save the current location
        return <Navigate to="/set-username" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};