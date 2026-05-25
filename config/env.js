import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['SECRET_KEY', 'MONGODB_URI'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}
