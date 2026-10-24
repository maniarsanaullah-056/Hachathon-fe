import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, setToken } from '../services/api.js';
import { changePasswordRequest, fetchMe, getSetupStatus, loginRequest, runSetup } from '../services/authService.js';
import { getErrorMessage } from '../utils/format.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [setupComplete, setSetupComplete] = useState(null); // null = abhi pata nahi
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState('');

  const init = useCallback(async () => {
    setLoading(true);
    setInitError('');
    try {
      const status = await getSetupStatus();
      setSetupComplete(status.isSetupComplete);
      if (status.isSetupComplete && getToken()) {
        try {
          const { user: me } = await fetchMe();
          setUser(me);
        } catch {
          clearToken();
          setUser(null);
        }
      }
    } catch (err) {
      setInitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // Interceptor ke events: token expire ya password change zaroori
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    const onPasswordRequired = () => setUser((u) => (u ? { ...u, mustChangePassword: true } : u));
    window.addEventListener('auth:unauthorized', onUnauthorized);
    window.addEventListener('auth:password-change-required', onPasswordRequired);
    return () => {
      window.removeEventListener('auth:unauthorized', onUnauthorized);
      window.removeEventListener('auth:password-change-required', onPasswordRequired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginRequest({ email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const setupCompany = useCallback(async (payload) => {
    const data = await runSetup(payload);
    setToken(data.token);
    setUser(data.user);
    setSetupComplete(true);
    return data;
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const data = await changePasswordRequest({ currentPassword, newPassword });
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setupComplete, loading, initError, retryInit: init, login, setupCompany, changePassword, logout }),
    [user, setupComplete, loading, initError, init, login, setupCompany, changePassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
