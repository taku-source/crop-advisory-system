import * as Location from 'expo-location';

/**
 * Utility functions for handling GPS location on mobile
 */

/**
 * Request location permissions and get current location
 * @returns {Object} - { latitude, longitude, accuracy, lastUpdated }
 */
export const getCurrentLocation = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Balance between accuracy and battery
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error getting location:', error);
    throw error;
  }
};

/**
 * Check if location is within Zimbabwe boundaries
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns {Boolean}
 */
export const isWithinZimbabwe = (latitude, longitude) => {
  // Zimbabwe approximate bounds:
  // Latitude: -22.4°S to -15.5°S
  // Longitude: 25.2°E to 33.1°E
  
  const zimbabweBounds = {
    minLat: -22.4,
    maxLat: -15.5,
    minLon: 25.2,
    maxLon: 33.1
  };

  return (
    latitude >= zimbabweBounds.minLat &&
    latitude <= zimbabweBounds.maxLat &&
    longitude >= zimbabweBounds.minLon &&
    longitude <= zimbabweBounds.maxLon
  );
};

/**
 * Format coordinates for display
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns {String}
 */
export const formatCoordinates = (latitude, longitude) => {
  const absLat = Math.abs(latitude).toFixed(4);
  const absLon = Math.abs(longitude).toFixed(4);
  const latDir = latitude < 0 ? 'S' : 'N';
  const lonDir = longitude < 0 ? 'W' : 'E';
  
  return `${absLat}°${latDir}, ${absLon}°${lonDir}`;
};

/**
 * Request continuous background location tracking (if needed)
 * Currently not implemented but available for future use
 */
export const startBackgroundLocationTracking = async () => {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Background location permission denied');
    }
    // Implementation for background tracking would go here
  } catch (error) {
    console.error('Error starting background tracking:', error);
    throw error;
  }
};
