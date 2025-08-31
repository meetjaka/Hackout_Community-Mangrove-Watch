const axios = require('axios');
const Report = require('../models/Report');

class SatelliteDataService {
  constructor() {
    this.nasaEarthDataUrl = 'https://earthdata.nasa.gov/api/v1';
    this.sentinelHubUrl = process.env.SENTINEL_HUB_URL;
    this.apiKey = process.env.SATELLITE_API_KEY;
  }

  // Get satellite imagery for a location
  async getSatelliteImagery(coordinates, date) {
    try {
      const response = await axios.get(`${this.sentinelHubUrl}/imagery`, {
        params: {
          lat: coordinates[1],
          lng: coordinates[0],
          date: date.toISOString().split('T')[0],
          apikey: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching satellite imagery:', error);
      throw error;
    }
  }

  // Detect changes in satellite imagery
  async detectChanges(coordinates, startDate, endDate) {
    try {
      const beforeImage = await this.getSatelliteImagery(coordinates, startDate);
      const afterImage = await this.getSatelliteImagery(coordinates, endDate);

      // Analyze changes between images
      const changes = await this.analyzeChanges(beforeImage, afterImage);

      return {
        changeDetected: changes.hasChange,
        changePercentage: changes.percentage,
        changeType: changes.type,
        beforeImage: beforeImage.url,
        afterImage: afterImage.url
      };
    } catch (error) {
      console.error('Error detecting changes:', error);
      throw error;
    }
  }

  // Analyze changes between two images
  async analyzeChanges(beforeImage, afterImage) {
    // This would typically use computer vision or ML models
    // Placeholder for actual implementation
    return {
      hasChange: true,
      percentage: 25,
      type: 'DEFORESTATION'
    };
  }

  // Monitor area for changes
  async monitorArea(boundingBox, interval = 'monthly') {
    try {
      const reports = await Report.find({
        'location.coordinates': {
          $geoWithin: {
            $box: boundingBox
          }
        }
      });

      const monitoringResults = [];
      for (const report of reports) {
        const changes = await this.detectChanges(
          report.location.coordinates,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          new Date()
        );

        if (changes.changeDetected) {
          monitoringResults.push({
            reportId: report._id,
            location: report.location,
            changes
          });
        }
      }

      return monitoringResults;
    } catch (error) {
      console.error('Error monitoring area:', error);
      throw error;
    }
  }

  // Get historical data for location
  async getHistoricalData(coordinates, startDate, endDate) {
    try {
      const response = await axios.get(`${this.nasaEarthDataUrl}/historical`, {
        params: {
          lat: coordinates[1],
          lng: coordinates[0],
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          apikey: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  // Generate change detection alert
  async generateAlert(changes) {
    if (changes.changePercentage > 10) {
      // Create alert in the system
      // This would integrate with your notification system
      return {
        severity: changes.changePercentage > 25 ? 'HIGH' : 'MEDIUM',
        message: `Detected ${changes.changePercentage}% change in mangrove coverage`,
        type: changes.type
      };
    }
    return null;
  }
}

module.exports = new SatelliteDataService();
