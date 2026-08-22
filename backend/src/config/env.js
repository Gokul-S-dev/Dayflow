import dotenv from "dotenv"

dotenv.config()

const requiredEnvs = [
  "PORT",
  "NODE_ENV",
  "MONGO_URI",
  "CORS_ORIGIN",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN"
];

for(const env of requiredEnvs) {
    if(!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
    }
}

export const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: Number(process.env.PORT) || 5000,

    mongoUri: process.env.MONGO_URI,

    corsOrigin: process.env.CORS_ORIGIN || "*",

    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
};