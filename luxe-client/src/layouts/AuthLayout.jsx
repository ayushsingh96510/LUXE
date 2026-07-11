import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4">
      <Outlet />
    </div>
  );
};