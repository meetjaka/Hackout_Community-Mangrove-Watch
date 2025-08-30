// Import required modules
const webpush = require('web-push');
const User = require('../models/User');

/**
 * Service for managing web push notifications
 */
class PushNotificationService {
  constructor() {
    this.enabled = false;
    
    try {
      if (process.env.VAPID_EMAIL && process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          'mailto:' + process.env.VAPID_EMAIL,
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );
        this.enabled = true;
        console.log('Push notification service initialized successfully');
      } else {
        console.warn('Push notification service disabled: Missing VAPID keys in environment variables');
      }
    } catch (error) {
      console.warn('Push notification service initialization error:', error.message);
    }
  }

  // Save push subscription for a user
  async saveSubscription(userId, subscription) {
    if (!this.enabled) {
      console.log('Push notification service is disabled. Skipping subscription save.');
      return;
    }
    
    try {
      await User.findByIdAndUpdate(userId, {
        pushSubscription: subscription
      });
      console.log(`Subscription saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  // Send push notification to a specific user
  async sendToUser(userId, notification) {
    if (!this.enabled) {
      console.log('Push notification service is disabled. Skipping sendToUser.');
      return;
    }
    
    try {
      const user = await User.findById(userId);
      if (!user || !user.pushSubscription) {
        console.log(`No push subscription found for user ${userId}`);
        return;
      }

      const payload = JSON.stringify({
        title: notification.title || 'Mangrove Watch Notification',
        body: notification.body || 'You have a new notification',
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        data: notification.data || {}
      });

      await webpush.sendNotification(user.pushSubscription, payload);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      if (error.statusCode === 410) {
        // Subscription has expired or is invalid
        await User.findByIdAndUpdate(userId, {
          pushSubscription: null
        });
        console.log(`Removed invalid subscription for user ${userId}`);
      }
      return false;
    }
  }

  // Send push notification to multiple users
  async sendToUsers(userIds, notification) {
    if (!this.enabled) {
      console.log('Push notification service is disabled. Skipping sendToUsers.');
      return [];
    }
    
    const promises = userIds.map(userId => {
      return this.sendToUser(userId, notification).catch(err => {
        console.error(`Failed to send notification to user ${userId}:`, err);
        return false;
      });
    });

    return Promise.allSettled(promises);
  }

  // Send notification to users in an area
  async sendToArea(coordinates, radiusKm, notification) {
    if (!this.enabled) {
      console.log('Push notification service is disabled. Skipping sendToArea.');
      return [];
    }
    
    try {
      const users = await User.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusKm * 1000
          }
        },
        pushSubscription: { $ne: null }
      });

      console.log(`Found ${users.length} users in area to notify`);
      return this.sendToUsers(
        users.map(user => user._id),
        notification
      );
    } catch (error) {
      console.error('Error sending area notification:', error);
      return [];
    }
  }

  // Send notification for new report
  async sendNewReportNotification(report) {
    const notification = {
      title: 'New Mangrove Report',
      body: `New ${report.category} report submitted near your area`,
      data: {
        reportId: report._id.toString(),
        type: 'new_report',
        category: report.category
      }
    };

    return this.sendToArea(report.location.coordinates, 10, notification);
  }

  // Send notification for report status update
  async sendReportStatusNotification(report, previousStatus) {
    const notification = {
      title: 'Report Status Updated',
      body: `Your report status changed from ${previousStatus} to ${report.status}`,
      data: {
        reportId: report._id.toString(),
        type: 'status_update',
        previousStatus,
        currentStatus: report.status
      }
    };

    return this.sendToUser(report.userId, notification);
  }

  // Send notification for new comment on a report
  async sendNewCommentNotification(report, comment) {
    const notification = {
      title: 'New Comment on Your Report',
      body: `${comment.userName} commented on your report`,
      data: {
        reportId: report._id.toString(),
        commentId: comment._id.toString(),
        type: 'new_comment'
      }
    };

    return this.sendToUser(report.userId, notification);
  }
}

module.exports = new PushNotificationService();
