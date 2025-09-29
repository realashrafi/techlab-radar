import React from 'react';
import {Route, BrowserRouter as Router, Routes, Navigate} from "react-router";
import View from "./pages/index/View";


// کامپوننت برای محافظت از روت‌ها با بررسی نقش
const ProtectedRoute = ({children, requiredRole}: any) => {
    const token = localStorage.getItem('authToken');

    // اگر توکن وجود نداشته باشد، به صفحه اصلی هدایت کن
    if (!token) {
        return <Navigate to="/"/>;
    }

    try {
        const user = JSON.parse(token); // فرض می‌کنیم توکن یک JSON است که شامل role است
        // اگر نقش کاربر با نقش مورد نیاز مطابقت نداشته باشد، به صفحه اصلی هدایت کن
        if (user.role !== requiredRole) {
            return <Navigate to="/"/>;
        }
        return children;
    } catch (error) {
        // در صورت خطا در پارس کردن توکن، به صفحه اصلی هدایت کن
        return <Navigate to="/"/>;
    }
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<View/>}/>
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <div>Admin Page</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;