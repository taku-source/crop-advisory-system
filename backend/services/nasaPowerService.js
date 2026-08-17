const axios = require('axios');

class NasaPowerService {
  constructor() {
    // NASA POWER API endpoint
    this.baseUrl = 'https://power.larc.nasa.gov/api/v1/timeseries';
    // Parameters for agricultural data
    this.parameters = ['T2M', 'PRECTOT', 'RH2M'];  // Temperature, precipitation, humidity
  }

  /**
   * Get weather data from NASA POWER API for a specific location and date range
   * @param {Number} latitude
   * @param {Number} longitude
   * @param {String} startDate - Format: YYYYMMDD
   * @param {String} endDate - Format: YYYYMMDD
   * @returns {Object} - Weather data (temperature, rainfall, humidity)
   */
  async getWeatherData(latitude, longitude, startDate, endDate) {
    try {
      // Validate coordinates are in Zimbabwe
      if (!this.isZimbabweLocation(latitude, longitude)) {
        throw new Error('Location must be within Zimbabwe boundaries');
      }

      const url = `${this.baseUrl}`;
      const params = {
        start: startDate,
        end: endDate,
        lat: latitude,
        lon: longitude,
        parameters: this.parameters.join(','),
        community: 'ag',
        format: 'json',
        user: 'crop-advisory-system'  // Descriptive identifier for NASA POWER usage tracking
      };

      const response = await axios.get(url, { params });

      if (!response.data || !response.data.properties) {
        throw new Error('Invalid response from NASA POWER API');
      }

      return this.formatWeatherData(response.data.properties);
    } catch (error) {
      console.error('Error fetching weather data from NASA POWER:', error.message);
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  /**
   * Get climatological data for a location
   * @param {Number} latitude
   * @param {Number} longitude
   * @returns {Object} - Climatological averages
   */
  async getClimatologyData(latitude, longitude) {
    try {
      if (!this.isZimbabweLocation(latitude, longitude)) {
        throw new Error('Location must be within Zimbabwe boundaries');
      }

      const url = `https://power.larc.nasa.gov/api/v1/climatology`;
      const params = {
        lat: latitude,
        lon: longitude,
        parameters: this.parameters.join(','),
        community: 'ag',
        format: 'json',
        user: 'crop-advisory-system'
      };

      const response = await axios.get(url, { params });

      if (!response.data || !response.data.properties) {
        throw new Error('Invalid response from NASA POWER API');
      }

      return this.formatClimatologyData(response.data.properties);
    } catch (error) {
      console.error('Error fetching climatology data from NASA POWER:', error.message);
      throw new Error(`Failed to fetch climatology data: ${error.message}`);
    }
  }

  /**
   * Format weather data from NASA POWER response
   * @param {Object} properties - Raw data from NASA POWER
   * @returns {Object} - Formatted weather data
   */
  formatWeatherData(properties) {
    const daily = properties.daily || {};
    const dates = Object.keys(daily.T2M || {});
    
    const formattedData = dates.map(dateStr => {
      const dateObj = this.parseNasaPowerDate(dateStr);
      return {
        date: dateObj,
        temperature: {
          celsius: daily.T2M?.[dateStr] || null,
          unit: 'C'
        },
        precipitation: {
          mm: daily.PRECTOT?.[dateStr] || null,
          unit: 'mm'
        },
        humidity: {
          percent: daily.RH2M?.[dateStr] || null,
          unit: '%'
        }
      };
    });

    return {
      data: formattedData,
      location: properties.geometry?.coordinates || null,
      period: {
        start: dates[0],
        end: dates[dates.length - 1]
      }
    };
  }

  /**
   * Format climatology data from NASA POWER response
   * @param {Object} properties - Raw data from NASA POWER
   * @returns {Object} - Formatted climatological averages
   */
  formatClimatologyData(properties) {
    const monthly = properties.monthly || {};
    
    const climatology = {};
    for (let month = 1; month <= 12; month++) {
      const monthKey = String(month).padStart(2, '0');
      climatology[`month_${month}`] = {
        temperature: {
          avg_celsius: monthly.T2M?.[monthKey] || null
        },
        precipitation: {
          avg_mm: monthly.PRECTOT?.[monthKey] || null
        },
        humidity: {
          avg_percent: monthly.RH2M?.[monthKey] || null
        }
      };
    }

    return climatology;
  }

  /**
   * Validate if coordinates are within Zimbabwe
   * Zimbabwe approximate bounds: Lat 15.5°S to 22.4°S, Lon 25.2°E to 33.1°E
   * @param {Number} latitude
   * @param {Number} longitude
   * @returns {Boolean}
   */
  isZimbabweLocation(latitude, longitude) {
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
  }

  /**
   * Convert NASA POWER date format (YYYYMMDD) to JavaScript Date
   * @param {String} dateStr - Format: YYYYMMDD
   * @returns {Date}
   */
  parseNasaPowerDate(dateStr) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }

  /**
   * Get weather data for today and next 7 days (approximate)
   * Note: NASA POWER provides historical and near-current data, not real forecasts
   * @param {Number} latitude
   * @param {Number} longitude
   * @returns {Object} - Recent weather data
   */
  async getRecentWeatherData(latitude, longitude) {
    try {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const startDate = this.formatDateForNasaPower(oneWeekAgo);
      const endDate = this.formatDateForNasaPower(today);

      return await this.getWeatherData(latitude, longitude, startDate, endDate);
    } catch (error) {
      console.error('Error fetching recent weather data:', error.message);
      throw error;
    }
  }

  /**
   * Format date to NASA POWER format (YYYYMMDD)
   * @param {Date} date
   * @returns {String}
   */
  formatDateForNasaPower(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}

module.exports = new NasaPowerService();
