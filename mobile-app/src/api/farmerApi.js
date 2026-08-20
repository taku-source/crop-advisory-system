import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

/**
 * Get contextual advisories for logged-in farmer
 */
export const getContextualAdvisories = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/advisories-contextual/farmer`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching contextual advisories:', error);
    throw error;
  }
};

export const getSeasonalPlan = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/advisories-contextual/seasonal-plan`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching seasonal plan:', error);
    throw error;
  }
};

export const updateCropProgress = async (stageId, data, token) => {
  const response = await axios.put(
    `${API_BASE_URL}/crop-progress/${encodeURIComponent(stageId)}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Get weather data for farmer's location
 */
export const getWeatherData = async (farmerId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/advisories-contextual/weather/${farmerId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

/**
 * Match symptoms to diseases
 */
export const matchSymptoms = async (symptoms, crop, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/diseases-symptom-match/match-symptoms`,
      { symptoms, crop },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error matching symptoms:', error);
    throw error;
  }
};

/**
 * Get all symptoms for a crop
 */
export const getCropSymptoms = async (crop, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/diseases-symptom-match/symptoms/${crop}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching crop symptoms:', error);
    throw error;
  }
};

/**
 * Get disease information
 */
export const getDiseaseInfo = async (diseaseId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/diseases-symptom-match/identify/${diseaseId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching disease info:', error);
    throw error;
  }
};

/**
 * Get diseases for a crop
 */
export const getCropDiseases = async (crop, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/diseases-symptom-match/crop/${crop}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching crop diseases:', error);
    throw error;
  }
};

/**
 * Get agricultural knowledge for a crop
 */
export const getAgriculturalKnowledge = async (crop, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/knowledge/agricultural?crop=${crop}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching agricultural knowledge:', error);
    throw error;
  }
};

/**
 * Get soil knowledge
 */
export const getSoilKnowledge = async (soilType, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/knowledge/soil?soilType=${soilType}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching soil knowledge:', error);
    throw error;
  }
};

export const soilTypes = [
  'Sandy loam',
  'Clay loam',
  'Red clay',
  'Loamy sand',
  'Silt loam',
  'Clay',
  'Other'
];

export const crops = [
  'Maize',
  'Groundnuts',
  'Sorghum',
  'Millet',
  'Cotton',
  'Tobacco',
  'Beans',
  'Other'
];
