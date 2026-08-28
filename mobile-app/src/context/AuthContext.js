import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { login as apiLogin, register as apiRegister, getMe } from '../api';

const AuthContext = createContext();
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

const registerPushNotifications = () => {
  if (isExpoGo) return Promise.resolve(null);
  return import('../notifications').then(({ registerForPushNotifications }) => registerForPushNotifications());
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          const res = await getMe();
          setUser(res.data.user);
          registerPushNotifications().catch(() => {});
        }
      } catch {
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    await AsyncStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    registerPushNotifications().catch(() => {});
    return res.data;
  };

  const register = async (formData) => {
    const res = await apiRegister(formData);
    await AsyncStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    registerPushNotifications().catch(() => {});
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
