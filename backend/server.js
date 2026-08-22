import app from './app.js'
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

const startServer = async () => {
    try {
        await connectDB();

        app.listen(env.port, () => {
            console.log(`Server running on port ${env.port}`);
            
        })
    }catch(err){
        console.error(
            "Failed to start server:",
            err.message
        );
        process.exit(1)
    }
}

startServer();