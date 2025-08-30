const twilio = require('twilio');
const Report = require('../models/Report');
const User = require('../models/User');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.twilioNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  // Parse SMS message into report data
  async parseReportMessage(message) {
    // Expected format: #REPORT [CATEGORY] [LAT,LONG] [DESCRIPTION]
    const parts = message.split(' ');
    if (parts[0].toLowerCase() !== '#report') {
      throw new Error('Invalid report format');
    }

    const category = parts[1].toUpperCase();
    const [lat, long] = parts[2].split(',').map(Number);
    const description = parts.slice(3).join(' ');

    return {
      category,
      location: {
        type: 'Point',
        coordinates: [long, lat]
      },
      description
    };
  }

  // Handle incoming SMS
  async handleIncomingSMS(from, body) {
    try {
      // Find user by phone number
      const user = await User.findOne({ phone: from });
      if (!user) {
        await this.sendSMS(from, 'Error: User not registered. Please register first.');
        return;
      }

      const reportData = await this.parseReportMessage(body);
      
      // Create report
      const report = await Report.create({
        ...reportData,
        reporter: user._id,
        status: 'PENDING'
      });

      // Send confirmation
      await this.sendSMS(
        from,
        `Report received! ID: ${report._id}. We'll notify you when it's verified.`
      );

      return report;
    } catch (error) {
      await this.sendSMS(
        from,
        'Error: Invalid format. Use: #REPORT [CATEGORY] [LAT,LONG] [DESCRIPTION]'
      );
      throw error;
    }
  }

  // Send SMS notification
  async sendSMS(to, message) {
    try {
      await this.client.messages.create({
        body: message,
        from: this.twilioNumber,
        to
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(phones, message) {
    return Promise.all(
      phones.map(phone => this.sendSMS(phone, message))
    );
  }

  // Alert nearby users about a critical incident
  async alertNearbyUsers(report, radiusKm = 10) {
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: report.location,
          $maxDistance: radiusKm * 1000 // Convert to meters
        }
      }
    });

    const message = 
      `ALERT: New ${report.severity} incident reported near you. ` +
      `Category: ${report.category}. Location: ${report.location.coordinates.join(',')}`;

    return this.sendBulkNotifications(
      nearbyUsers.map(user => user.phone),
      message
    );
  }
}

module.exports = new SMSService();
