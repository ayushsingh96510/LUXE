import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const login = async (credentials, redirectTo = '/') => {
    const result = await dispatch(loginUser(credentials));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(redirectTo);
      return true;
    }
    return false;
  };

  const register = async (userData, redirectTo = '/login') => {
    const result = await dispatch(registerUser(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate(redirectTo);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const getProfile = async () => {
    await dispatch(getCurrentUser());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getProfile,
  };
};