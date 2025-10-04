// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import View from "./pages/index/View";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import ViewAdmin from "./pages/admin/ViewAdmin";


const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* صفحات عمومی */}
                <Route path="/" element={<View />} />
                <Route path="/auth/login" element={<View />} />
                <Route path="/auth/forgot-password" element={<View />} />
                <Route path="/auth/reset-password" element={<View />} />
                <Route path="/unauthorized" element={<div>unauthorized</div>} />

                {/* صفحات ادمین */}
                <Route
                    path="/admin/dashboard"
                    element={
                        // <ProtectedRoute requiredRoles={['ADMIN_1', 'ADMIN_2', 'ADMIN_3']}>
                            <ViewAdmin />
                        // </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute
                            requiredRoles={['ADMIN_1', 'ADMIN_2']}
                            //@ts-ignore
                            requiredPermissions={['users:read']}
                        >
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users/:id"
                    element={
                    //@ts-ignore
                        <ProtectedRoute requiredRoles={['ADMIN_1']} requiredPermissions={['users:read']}>
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/change-requests"
                    element={
                        <ProtectedRoute
                            requiredRoles={['ADMIN_1', 'ADMIN_2']}
                            requiredPermissions={['users:review_changes']}
                        >
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/excel-imports"
                    element={
                        <ProtectedRoute
                            requiredRoles={['ADMIN_1', 'ADMIN_2']}
                            requiredPermissions={['excel:upload']}
                        >
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* مقالات */}
                <Route
                    path="/articles"
                    element={
                        <ProtectedRoute requiredPermissions={['articles:read']}>
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/articles/create"
                    element={
                        <ProtectedRoute
                            requiredRoles={['RESEARCHER_1', 'RESEARCHER_2', 'RESEARCHER_3']}
                            requiredPermissions={['articles:create']}
                        >
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/articles/:id/edit"
                    element={
                        <ProtectedRoute requiredPermissions={['articles:update']}>
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/article-requests"
                    element={
                        <ProtectedRoute requiredRoles={['ADMIN_1', 'ADMIN_2']}>
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* استراتژی‌ها */}
                <Route
                    path="/strategies"
                    element={
                        <ProtectedRoute requiredPermissions={['strategies:read']}>
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/strategies/create"
                    element={
                        <ProtectedRoute
                            requiredRoles={['STRATEGIST_1', 'STRATEGIST_2']}
                            requiredPermissions={['strategies:create']}
                        >
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/strategies/:id/edit"
                    element={
                        <ProtectedRoute requiredPermissions={['strategies:update']}>
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* ایونت‌ها */}
                <Route
                    path="/events"
                    element={
                        <ProtectedRoute requiredPermissions={['events:read']}>
                            <View />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/events/create"
                    element={
                        <ProtectedRoute requiredPermissions={['events:create']}>
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* گزارش‌ها */}
                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute
                            requiredRoles={['ADMIN_1', 'ADMIN_2', 'ADMIN_3']}
                            requiredPermissions={['reports:read']}
                        >
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* صفحات تعاملی */}
                <Route
                    path="/interactive/:id"
                    element={
                        <ProtectedRoute requiredPermissions={['interactive-pages:read']}>
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* چت‌بات */}
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute requiredPermissions={['chat:read']}>
                            <View />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </Router>
    );
};

export default App;