
// @ts-ignore
interface User {
    id: string;
    email: string;
    fullName: string;
    roles: string[]; // e.g., ["ADMIN_1", "STRATEGIST_1"]
    permissions: string[]; // e.g., ["articles:read", "strategies:create"]
}

interface AuthToken {
    user: User;
    accessToken: string;
    refreshToken: string;
}

// نقش‌های تعریف‌شده (از داکیومنت)
type Role =
    | 'ADMIN_1'
    | 'ADMIN_2'
    | 'ADMIN_3'
    | 'STRATEGIST_1'
    | 'STRATEGIST_2'
    | 'STRATEGIST_3'
    | 'RESEARCHER_1'
    | 'RESEARCHER_2'
    | 'RESEARCHER_3';

// پرمیشن‌های نمونه (از داکیومنت)
type Permission =
    | 'users:*'
    | 'reports:read'
    | 'excel:upload'
    | 'articles:create'
    | 'articles:read'
    | 'articles:update'
    | 'articles:delete'
    | 'articles:publish'
    | 'articles:approve'
    | 'strategies:create'
    | 'strategies:read'
    | 'strategies:update'
    | 'strategies:delete'
    | 'strategies:publish'
    | 'strategies:approve'
    | 'strategies:apply'
    | 'events:create'
    | 'events:read'
    | 'events:update'
    | 'events:delete'
    | 'events:publish'
    | 'requests:create'
    | 'requests:read'
    | 'requests:update'
    | 'requests:approve'
    | 'chat:read'
    | 'chat:manage'
    | 'interactive-pages:read'
    | 'users:review_changes';

// Props برای ProtectedRoute
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: Role[];
    requiredPermissions?: Permission[];
}