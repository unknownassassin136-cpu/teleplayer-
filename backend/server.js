import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import initializeDatabase from './database/index.js';
import { initializeTelegramClient, disconnectTelegram } from './telegram/client.js';
import { setupAuthRoutes } from './routes/auth.routes.js';
import { setupVideoRoutes } from './routes/video.routes.js';
import { setupAdminRoutes } from './routes/admin.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4200',
    process.env.FRONTEND_URL || 'https://teleplayer-snowy.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json());

// Initialize database
const db = initializeDatabase(process.env.DB_PATH || './database.sqlite');
console.log('✓ Database initialized');

// Initialize Telegram client
if (process.env.TELEGRAM_SESSION) {
  try {
    await initializeTelegramClient(
      process.env.TELEGRAM_SESSION,
      process.env.TELEGRAM_API_ID,
      process.env.TELEGRAM_API_HASH,
      process.env.TELEGRAM_CHANNEL,
      db
    );
  } catch (error) {
    console.warn('⚠ Telegram client failed to initialize:', error.message);
    console.log('Run: npm run init-telegram');
  }
}

// Routes
app.use('/auth', setupAuthRoutes(db, process.env.JWT_SECRET));
app.use('/videos', setupVideoRoutes(db, process.env.JWT_SECRET));
app.use('/admin', setupAdminRoutes(db, process.env.JWT_SECRET));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await disconnectTelegram();
  process.exit(0);
});
