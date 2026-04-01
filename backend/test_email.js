import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './utils/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Email Sending...');
console.log('Config:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('Refresh Token:', process.env.GOOGLE_REFRESH_TOKEN ? 'SET' : 'NOT SET');
console.log('User Email:', process.env.EMAIL_USER);

async function test() {
    try {
        const result = await sendEmail({
            to: 'shashishankar502@gmail.com',
            fromName: 'Test Admin',
            fromEmail: process.env.EMAIL_USER,
            subject: 'System Deep Test',
            html: '<p>This is a deep test of the email system.</p>'
        });
        console.log('Email sent successfully!', result);
    } catch (error) {
        console.error('\n=== DETAILED EMAIL ERROR ===');
        console.error(error);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

test();
