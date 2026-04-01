import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany(); // Clear existing users

        const adminUser = new User({
            name: 'Admin',
            email: 'admin@bizvin.com',
            password: 'password123', // Will be hashed by pre-save
            role: 'ADMIN',
            status: 'ACTIVE',
            gender: 'Male',
            phone: '1234567890',
            address: 'Admin Headquarters',
        });

        await adminUser.save();
        console.log('Admin user seeded (admin@bizvin.com / password123)');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
