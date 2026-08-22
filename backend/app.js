import express from "express"
import cors from "cors"
import helmet from "helmet"
import { env } from './src/config/env.js'

const app = express();

app.use(helmet());
app.use(cors({
    origin: env.corsOrigin
}))

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({ 
        success: true,
        status: 200,
    })
})

export default app;