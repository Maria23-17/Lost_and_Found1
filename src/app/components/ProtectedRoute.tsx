import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  
  // Получаем данные из localStorage (как мы договорились при логине)
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const token = localStorage.getItem('token');

  if (!token) {
     return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Если роль не подходит (например, юзер лезет в админку)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};