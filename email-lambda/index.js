const nodemailer = require('nodemailer');

// Create transporter with Gmail configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

exports.handler = async (event) => {
  try {
    // Parse the incoming event
    const { recipients, subject, htmlBody, textBody, from } = event;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients must be a non-empty array of email addresses');
    }
    
    if (!subject) {
      throw new Error('Email subject is required');
    }
    
    if (!htmlBody && !textBody) {
      throw new Error('Either HTML or text body is required');
    }
    
    const transporter = createTransporter();
    
    // Send email to each recipient individually using BCC
    const emailPromises = recipients.map(recipient => {
      const mailOptions = {
        from: from || process.env.DEFAULT_FROM_EMAIL,
        to: recipient,
        subject: subject,
        text: textBody,
        html: htmlBody
      };
      
      return transporter.sendMail(mailOptions);
    });
    
    const results = await Promise.all(emailPromises);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully sent emails to ${recipients.length} recipients`,
        results: results.map(result => result.messageId)
      })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to send email',
        error: error.message
      })
    };
  }
};