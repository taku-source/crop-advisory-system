import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from './AuthContext';

const FarmProfileContext = createContext();

export const FarmProfileProvider = ({ children }) => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load profile on mount or when token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  /**
   * Fetch farmer's profile from backend
   */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api'}/farmers/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setProfile(response.data.data);
        // Cache profile locally
        await AsyncStorage.setItem('farmProfile', JSON.stringify(response.data.data));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update farmer profile (location, soil type, crop)
   */
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api'}/farmers/profile`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
        await AsyncStorage.setItem('farmProfile', JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Profile update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update only GPS location
   */
  const updateLocation = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api'}/farmers/location`,
        { latitude, longitude },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update profile with new location
        const updatedProfile = { ...profile, location: response.data.data };
        setProfile(updatedProfile);
        await AsyncStorage.setItem('farmProfile', JSON.stringify(updatedProfile));
        return response.data.data;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location');
      console.error('Location update error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if profile is complete
   */
  const isProfileComplete = () => {
    return (
      profile &&
      profile.primaryCrop &&
      profile.soilType &&
      profile.location &&
      profile.location.latitude &&
      profile.location.longitude
    );
  };

  return (
    <FarmProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        updateLocation,
        isProfileComplete,
      }}
    >
      {children}
    </FarmProfileContext.Provider>
  );
};

export const useFarmProfile = () => {
  const context = useContext(FarmProfileContext);
  if (!context) {
    throw new Error('useFarmProfile must be used within FarmProfileProvider');
  }
  return context;
};
