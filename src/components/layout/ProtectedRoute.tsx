// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router';

const hasPermission = (userPermissions: Permission[], requiredPermissions: Permission[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(perm => userPermissions.includes(perm));
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        return <Navigate to="/auth/login" replace />;
    }

    try {
        const { user }: AuthToken = JSON.parse(token);

        const hasRequiredRole =
            requiredRoles.length === 0 || requiredRoles.some(role => user.roles.includes(role));
        // @ts-ignore
        const hasRequiredPermission = hasPermission(user.permissions, requiredPermissions);

        if (!hasRequiredRole || !hasRequiredPermission) {
            return <Navigate to="/unauthorized" replace />;
        }

        return <>{children}</>;
    } catch (error) {
        console.error('Error parsing auth token:', error);
        return <Navigate to="/auth/login" replace />;
    }
};

export default ProtectedRoute;