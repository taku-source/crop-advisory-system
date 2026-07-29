import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const res = await getMe();
          setUser(res.data.user);
        } catch {
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('authToken', res.data.token);
    setUser(res.data.user);
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    localStorage.setItem('authToken', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
