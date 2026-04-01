import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection;
    const resources = await db.collection('resources').find({}).toArray();
    console.log(`Found ${resources.length} resources`);
    console.log(resources.map(r => ({ name: r.fileName, type: r.fileType })));
    process.exit(0);
}).catch(console.error);
