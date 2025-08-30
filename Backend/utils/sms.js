const twilio = require('twilio');

// Initialize Twilio client
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured. SMS functionality will be disabled.');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// SMS templates
const smsTemplates = {
  welcome: (data) => `Welcome to Community Mangrove Watch, ${data.firstName}! Your account has been created successfully. Start reporting incidents to protect our mangrove ecosystems.`,
  
  passwordReset: (data) => `Your password reset token is: ${data.resetToken}. This will expire in 10 minutes. If you didn't request this, please ignore.`,
  
  reportSubmitted: (data) => `Your report "${data.incidentTitle}" has been submitted successfully. Report ID: ${data.reportId}. We'll keep you updated on the status.`,
  
  reportStatusUpdate: (data) => `Your report "${data.incidentTitle}" status has been updated from ${data.previousStatus} to ${data.newStatus}. Check your dashboard for details.`,
  
  urgentReport: (data) => `URGENT: New critical report "${data.incidentTitle}" requires immediate attention. Category: ${data.category}, Location: ${data.location}. Please review immediately.`,
  
  verificationCode: (data) => `Your verification code is: ${data.code}. Enter this code to verify your phone number.`,
  
  dailyDigest: (data) => `Daily Digest: ${data.totalReports} new reports, ${data.validatedReports} validated, ${data.escalatedReports} escalated. Keep up the great work!`,
  
  communityAlert: (data) => `Community Alert: ${data.message}. This affects your local mangrove area. Please check the app for more details.`
};

// Send SMS function
const sendSMS = async (options) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('SMS not sent - Twilio not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    // Get template if template name is provided
    let messageContent = options.message;
    if (options.template && smsTemplates[options.template]) {
      messageContent = smsTemplates[options.template](options.data);
    }
    
    const message = await client.messages.create({
      body: messageContent,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.to
    });
    
    console.log('SMS sent successfully:', message.sid);
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    };
    
  } catch (error) {
    console.error('SMS sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send bulk SMS
const sendBulkSMS = async (recipients, options) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('Bulk SMS not sent - Twilio not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    const results = [];
    
    for (const recipient of recipients) {
      try {
        let messageContent = options.message;
        if (options.template && smsTemplates[options.template]) {
          messageContent = smsTemplates[options.template]({
            ...options.data,
            ...recipient
          });
        }
        
        const message = await client.messages.create({
          body: messageContent,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        });
        
        results.push({
          phone: recipient.phone,
          success: true,
          messageId: message.sid,
          status: message.status
        });
        
      } catch (error) {
        results.push({
          phone: recipient.phone,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Bulk SMS sending failed:', error);
    throw error;
  }
};

// Send verification code
const sendVerificationCode = async (phoneNumber, code) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('Verification SMS not sent - Twilio not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    const message = await client.messages.create({
      body: `Your Community Mangrove Watch verification code is: ${code}. Enter this code to verify your phone number.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log('Verification SMS sent successfully:', message.sid);
    return {
      success: true,
      messageId: message.sid,
      status: message.status
    };
    
  } catch (error) {
    console.error('Verification SMS sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send urgent alerts to specific roles
const sendUrgentAlerts = async (recipients, reportData) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('Urgent alerts not sent - Twilio not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const message = await client.messages.create({
          body: `URGENT: Critical report "${reportData.incidentTitle}" requires immediate attention. Category: ${reportData.category}, Location: ${reportData.location}. Please review immediately.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        });
        
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          success: true,
          messageId: message.sid,
          status: message.status
        });
        
      } catch (error) {
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Urgent alerts sending failed:', error);
    throw error;
  }
};

// Send community notifications
const sendCommunityNotifications = async (recipients, notificationData) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('Community notifications not sent - Twilio not configured');
      return { success: false, message: 'SMS service not configured' };
    }
    
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const message = await client.messages.create({
          body: `Community Alert: ${notificationData.message}. This affects your local mangrove area. Please check the app for more details.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone
        });
        
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          success: true,
          messageId: message.sid,
          status: message.status
        });
        
      } catch (error) {
        results.push({
          phone: recipient.phone,
          name: recipient.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Community notifications sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendVerificationCode,
  sendUrgentAlerts,
  sendCommunityNotifications,
  smsTemplates
};
