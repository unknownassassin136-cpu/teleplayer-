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
const allowedOrigins = [
  'http://localhost:4200',
  'https://teleplayer-snowy.vercel.app',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());

// Initialize database
const db = initializeDatabase(process.env.DB_PATH || './database.sqlite');
console.log('✓ Database initialized');

// Auto-seed admin user if not exists
import bcrypt from 'bcrypt';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hash = await bcrypt.hash(adminPassword, 10);
  db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(adminEmail, hash, 'admin');
  console.log(`✓ Admin user seeded: ${adminEmail}`);
} else {
  console.log(`✓ Admin user exists: ${adminEmail}`);
}

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
