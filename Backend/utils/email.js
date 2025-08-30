const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use Gmail or other SMTP service
  // For production, use SendGrid, Mailgun, or AWS SES
  return nodemailer.createTransporter({
    service: 'gmail', // or 'sendgrid', 'mailgun', etc.
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to Community Mangrove Watch',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Welcome to Community Mangrove Watch!</h2>
        <p>Hello ${data.firstName} ${data.lastName},</p>
        <p>Thank you for joining our community of mangrove conservationists. Your role as a <strong>${data.role}</strong> is crucial in protecting these vital ecosystems.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530;">What you can do:</h3>
          <ul>
            <li>Report incidents and threats to mangrove ecosystems</li>
            <li>Upload geotagged photos and evidence</li>
            <li>Track the status of your reports</li>
            <li>Earn points and badges for your contributions</li>
            <li>Connect with other conservationists</li>
          </ul>
        </div>
        
        <p>Start making a difference today by reporting any incidents you observe in your local mangrove areas.</p>
        
        <p>Best regards,<br>The Community Mangrove Watch Team</p>
      </div>
    `
  }),
  
  passwordReset: (data) => ({
    subject: 'Password Reset Request - Community Mangrove Watch',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Password Reset Request</h2>
        <p>Hello ${data.firstName},</p>
        <p>We received a request to reset your password for your Community Mangrove Watch account.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reset Token:</strong> ${data.resetToken}</p>
          <p><em>This token will expire in 10 minutes.</em></p>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <p>Best regards,<br>The Community Mangrove Watch Team</p>
      </div>
    `
  }),
  
  reportSubmitted: (data) => ({
    subject: 'Report Submitted - Community Mangrove Watch',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Report Submitted Successfully</h2>
        <p>Hello ${data.firstName},</p>
        <p>Your report about <strong>${data.incidentTitle}</strong> has been submitted successfully.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530;">Report Details:</h3>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Report ID:</strong> ${data.reportId}</p>
        </div>
        
        <p>Our team will review your report and take appropriate action. You'll receive updates on the status of your report.</p>
        
        <p>Thank you for helping protect our mangrove ecosystems!</p>
        
        <p>Best regards,<br>The Community Mangrove Watch Team</p>
      </div>
    `
  }),
  
  reportStatusUpdate: (data) => ({
    subject: 'Report Status Update - Community Mangrove Watch',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Report Status Updated</h2>
        <p>Hello ${data.firstName},</p>
        <p>The status of your report <strong>${data.incidentTitle}</strong> has been updated.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5530;">Status Update:</h3>
          <p><strong>Previous Status:</strong> ${data.previousStatus}</p>
          <p><strong>New Status:</strong> ${data.newStatus}</p>
          <p><strong>Updated By:</strong> ${data.updatedBy}</p>
          <p><strong>Update Date:</strong> ${data.updateDate}</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>
        
        <p>You can view the full details of your report in your dashboard.</p>
        
        <p>Best regards,<br>The Community Mangrove Watch Team</p>
      </div>
    `
  }),
  
  urgentReport: (data) => ({
    subject: 'URGENT: New Critical Report - Community Mangrove Watch',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">URGENT: Critical Report Requires Immediate Attention</h2>
        <p>A new critical report has been submitted that requires immediate attention.</p>
        
        <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
          <h3 style="color: #d32f2f;">Report Details:</h3>
          <p><strong>Title:</strong> ${data.incidentTitle}</p>
          <p><strong>Category:</strong> ${data.category}</p>
          <p><strong>Severity:</strong> ${data.severity}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Reporter:</strong> ${data.reporterName}</p>
          <p><strong>Reported At:</strong> ${data.reportedAt}</p>
        </div>
        
        <p><strong>Action Required:</strong> Please review this report immediately and take appropriate action.</p>
        
        <p>Best regards,<br>The Community Mangrove Watch Team</p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    // Get template if template name is provided
    let emailContent = options;
    if (options.template && emailTemplates[options.template]) {
      const template = emailTemplates[options.template](options.data);
      emailContent = {
        ...options,
        subject: template.subject,
        html: template.html
      };
    }
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@mangrovewatch.com',
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html || emailContent.text,
      text: emailContent.text || emailContent.html?.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, options) => {
  try {
    const transporter = createTransporter();
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'noreply@mangrovewatch.com',
          to: recipient.email,
          subject: options.subject,
          html: options.html,
          text: options.text
        };
        
        const info = await transporter.sendMail(mailOptions);
        results.push({
          email: recipient.email,
          success: true,
          messageId: info.messageId
        });
        
      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  emailTemplates
};
