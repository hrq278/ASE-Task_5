// server.js
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(` Server running on port ${PORT}`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(` API URL: http://localhost:${PORT}`);
    });

    return ;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(' Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
