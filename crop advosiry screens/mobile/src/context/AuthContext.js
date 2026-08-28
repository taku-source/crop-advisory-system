import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selectedCrops, setSelectedCrops] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('crop_advisory_user');
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const login = async (email, password) => {
    // Replace with real API call
    const mockUser = {
      id: '1', fullName: 'John Moyo', email,
      phone: '0771 234 567', district: 'Kadoma', ward: 'Ward 5',
      farmName: 'Moyo Farm', farmSize: '2 ha', soilType: 'Sandy Loam',
      location: { lat: -18.3372, lng: 29.9149 },
      crops: ['maize'], isFirstLogin: false,
    };
    await AsyncStorage.setItem('crop_advisory_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };

  const register = async (formData) => {
    const newUser = { id: Date.now().toString(), ...formData, crops: [], isFirstLogin: true };
    await AsyncStorage.setItem('crop_advisory_user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const saveCrops = async (crops) => {
    const updated = { ...user, crops, isFirstLogin: false };
    await AsyncStorage.setItem('crop_advisory_user', JSON.stringify(updated));
    setUser(updated);
  };

  const updateProfile = async (updates) => {
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem('crop_advisory_user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('crop_advisory_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, saveCrops, updateProfile, logout, selectedCrops, setSelectedCrops }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
