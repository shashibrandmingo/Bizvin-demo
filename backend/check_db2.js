import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const db = mongoose.connection;
    const resources = await db.collection('resources').find({}).toArray();
    console.log(`Found ${resources.length} resources`);
    resources.forEach(r => console.log(`- ${r.fileName} | type: ${r.fileType}`));
    process.exit(0);
}).catch(console.error);
