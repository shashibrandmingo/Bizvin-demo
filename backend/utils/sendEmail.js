import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends an email using Gmail SMTP with App Password
 */
const sendEmail = async ({ to, subject, html, text, replyTo, fromName, fromEmail, attachments, emailConfig }) => {
    if (!emailConfig || !emailConfig.email || !emailConfig.appPassword) {
        throw new Error('Email configuration (Email and App Password) is required.');
    }

    try {
        const targetEmail = emailConfig.email;
        
        // SMTP Transporter with Custom Configuration
        const transporter = nodemailer.createTransport({
            host: emailConfig.host || 'smtp.gmail.com',
            port: emailConfig.port || 465,
            secure: emailConfig.secure !== undefined ? emailConfig.secure : (emailConfig.port === 465),
            auth: {
                user: targetEmail,
                pass: emailConfig.appPassword
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const senderName = fromName ? `"${fromName}"` : 'Bizvin Marketing';
        const displayFromEmail = fromEmail || targetEmail;

        const mailOptions = {
            from: `${senderName} <${displayFromEmail}>`,
            sender: displayFromEmail,
            to,
            replyTo: replyTo || displayFromEmail,
            subject,
            html,
            text,
            attachments,
            envelope: {
                from: displayFromEmail, // Attempt to force the FROM email in the envelope
                to: to
            }
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Email could not be sent: ${error.message}`);
    }
};

export default sendEmail;
