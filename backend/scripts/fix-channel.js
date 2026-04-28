import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

let content = fs.readFileSync(envPath, 'utf8');

// Replace the placeholder channel ID with the correct one
const correctChannelId = '-1003897175553';

if (content.includes('TELEGRAM_CHANNEL=')) {
  // Replace existing channel line
  content = content.replace(/TELEGRAM_CHANNEL=.*/g, `TELEGRAM_CHANNEL=${correctChannelId}`);
} else {
  // Add channel line
  content += `\nTELEGRAM_CHANNEL=${correctChannelId}`;
}

fs.writeFileSync(envPath, content);

console.log('✓ .env updated with correct channel ID:', correctChannelId);
console.log('\nPlease restart the backend: npm start');
process.exit(0);
