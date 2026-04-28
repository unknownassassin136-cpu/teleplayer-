import initializeDatabase from '../database/index.js';
import dotenv from 'dotenv';

dotenv.config();

const db = initializeDatabase(process.env.DB_PATH || './database.sqlite');

// Insert the video from your Telegram channel
// Channel: -1003897175553, Message ID: 2
const videoData = {
  title: 'Super Profile Video',
  description: 'Forwarded from Super profile channel',
  telegram_message_id: 2,
  thumbnail: null,
  category: 'General',
  duration: null
};

try {
  // Check if already exists
  const existing = db.prepare('SELECT id FROM videos WHERE telegram_message_id = ?').get(videoData.telegram_message_id);
  
  if (existing) {
    console.log('Video already exists in database');
    process.exit(0);
  }

  db.prepare(`
    INSERT INTO videos (title, description, telegram_message_id, thumbnail, category, duration)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    videoData.title,
    videoData.description,
    videoData.telegram_message_id,
    videoData.thumbnail,
    videoData.category,
    videoData.duration
  );

  console.log('✓ Video seeded to database!');
  console.log('Title:', videoData.title);
  console.log('Telegram Message ID:', videoData.telegram_message_id);
} catch (err) {
  console.error('❌ Error:', err.message);
}

process.exit(0);
