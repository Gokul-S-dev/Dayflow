import dotenv from "dotenv"

dotenv.config()

const requiredEnvs = ["PORT", "NODE_ENV", "MONGO_URI", "CORS_ORIGIN"];

for(const env of requiredEnvs) {
    if(!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
    }
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: Number(process.env.PORT) || 5000,

    mongoUri: process.env.MONGO_URI,

    corsOrigin: process.env.CORS_ORIGIN || "*"
};