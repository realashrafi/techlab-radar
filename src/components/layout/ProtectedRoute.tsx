import React from 'react';
import { Navigate } from 'react-router';
import Cookies from 'js-cookie'; // ایمپورت js-cookie

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = Cookies.get('authToken'); // خواندن از کوکی

    // فقط چک string بودن و وجود مقدار (غیرخالی)
    if (!token || token.trim() === '') {
        return <Navigate to="/auth/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;