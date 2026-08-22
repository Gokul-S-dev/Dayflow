import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import path from "path"
import { env } from './src/config/env.js'
import apiRouter from './src/routes/index.js'
import { errorHandler } from './src/middleware/error.middleware.js'

const app = express();

app.use(helmet());
app.use(cors({
    origin: env.corsOrigin
}))

app.use(express.json());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many login attempts from this IP, please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/v1/auth/login", authLimiter);

// Mount API router
app.use("/api/v1", apiRouter);

app.get("/", (req, res) => {
    res.status(200).json({ 
        success: true,
        status: 200,
    })
})

// Serve static media files
app.use("/media", express.static(path.join(process.cwd(), "media")));

// Centralized error handler
app.use(errorHandler);

export default app;