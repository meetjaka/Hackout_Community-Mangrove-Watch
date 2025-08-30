const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  // Get current weather for location
  async getCurrentWeather(coordinates) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: coordinates[1],
          lon: coordinates[0],
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        conditions: response.data.weather[0].main,
        description: response.data.weather[0].description,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Get weather forecast
  async getForecast(coordinates, days = 5) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: coordinates[1],
          lon: coordinates[0],
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 measurements per day
        }
      });

      return response.data.list.map(item => ({
        timestamp: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
        conditions: item.weather[0].main,
        description: item.weather[0].description
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw error;
    }
  }

  // Get severe weather alerts
  async getWeatherAlerts(coordinates) {
    try {
      const response = await axios.get(`${this.baseUrl}/onecall`, {
        params: {
          lat: coordinates[1],
          lon: coordinates[0],
          appid: this.apiKey,
          exclude: 'current,minutely,hourly,daily'
        }
      });

      return response.data.alerts || [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  }

  // Check if weather conditions are suitable for field work
  async checkFieldworkConditions(coordinates) {
    try {
      const weather = await this.getCurrentWeather(coordinates);
      
      const unsuitable = [];
      
      if (weather.windSpeed > 30) { // 30 km/h
        unsuitable.push('High wind speed');
      }
      
      if (weather.conditions === 'Rain' || 
          weather.conditions === 'Thunderstorm') {
        unsuitable.push('Precipitation');
      }
      
      if (weather.temperature > 35) { // 35°C
        unsuitable.push('High temperature');
      }

      return {
        suitable: unsuitable.length === 0,
        conditions: weather,
        warnings: unsuitable
      };
    } catch (error) {
      console.error('Error checking fieldwork conditions:', error);
      throw error;
    }
  }

  // Get historical weather data
  async getHistoricalWeather(coordinates, date) {
    try {
      const timestamp = Math.floor(date.getTime() / 1000);
      
      const response = await axios.get(`${this.baseUrl}/onecall/timemachine`, {
        params: {
          lat: coordinates[1],
          lon: coordinates[0],
          dt: timestamp,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data.data[0];
      return {
        temperature: data.temp,
        humidity: data.humidity,
        windSpeed: data.wind_speed,
        conditions: data.weather[0].main,
        description: data.weather[0].description,
        timestamp: new Date(data.dt * 1000)
      };
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw error;
    }
  }

  // Attach weather data to report
  async attachWeatherToReport(report) {
    try {
      const weather = await this.getCurrentWeather(report.location.coordinates);
      report.weatherData = weather;
      return report;
    } catch (error) {
      console.error('Error attaching weather data:', error);
      // Don't throw error, just return report without weather data
      return report;
    }
  }
}

module.exports = new WeatherService();
