import nodemailer from 'nodemailer';

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, fullName) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"Heylo Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - Heylo',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #4A90E2;
                        margin: 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #4A90E2;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .button:hover {
                        background-color: #357ABD;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 12px;
                        color: #666;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .link {
                        color: #4A90E2;
                        word-break: break-all;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <div class="header">
                            <h1>🔐 Password Reset Request</h1>
                        </div>
                        
                        <p>Hi <strong>${fullName}</strong>,</p>
                        
                        <p>We received a request to reset your password for your Heylo account. Click the button below to create a new password:</p>
                        
                        <center>
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </center>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p class="link">${resetUrl}</p>
                        
                        <div class="warning">
                            <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
                        </div>
                        
                        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                        
                        <p>For security, never share this link with anyone.</p>
                        
                        <div class="footer">
                            <p>Best regards,<br><strong>Heylo Team</strong></p>
                            <p>This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, fullName) => {
    const mailOptions = {
        from: `"Heylo Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Successful - Heylo',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #28a745;
                        margin: 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 12px;
                        color: #666;
                    }
                    .success {
                        background-color: #d4edda;
                        border-left: 4px solid #28a745;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #28a745;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="content">
                        <div class="header">
                            <h1>✅ Password Reset Successful</h1>
                        </div>
                        
                        <p>Hi <strong>${fullName}</strong>,</p>
                        
                        <div class="success">
                            Your password has been successfully reset!
                        </div>
                        
                        <p>You can now log in to your Heylo account using your new password.</p>
                        
                        <center>
                            <a href="${process.env.CLIENT_URL}/login" class="button">Log In Now</a>
                        </center>
                        
                        <p>If you did NOT make this change, please contact our support team immediately.</p>
                        
                        <div class="footer">
                            <p>Best regards,<br><strong>Heylo Team</strong></p>
                            <p>This is an automated email. Please do not reply to this message.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return { success: false, error: error.message };
    }
};
