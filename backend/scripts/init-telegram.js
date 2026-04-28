import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initTelegram() {
  console.log('🔐 Initializing Telegram session...\n');

  const API_ID = process.env.TELEGRAM_API_ID;
  const API_HASH = process.env.TELEGRAM_API_HASH;

  if (!API_ID || !API_HASH) {
    console.error('❌ TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env');
    console.log('Get them from: https://my.telegram.org');
    process.exit(1);
  }

  console.log('API ID:', API_ID);
  console.log('Connecting to Telegram...\n');

  const client = new TelegramClient(
    new StringSession(''),
    parseInt(API_ID),
    API_HASH,
    { connectionRetries: 5 }
  );

  await client.start({
    phoneNumber: async () => await input.text('Enter your phone number (with country code, e.g. +1234567890): '),
    password: async () => await input.text('Enter your 2FA password (if enabled, else press Enter): '),
    phoneCode: async () => await input.text('Enter the code you received: '),
    onError: (err) => console.log('Error:', err),
  });

  console.log('\n✓ Logged in successfully!');

  const sessionString = client.session.save();
  console.log('\n🔐 Session string:');
  console.log(sessionString);

  // Update .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    // Replace or add TELEGRAM_SESSION
    if (envContent.includes('TELEGRAM_SESSION=')) {
      envContent = envContent.replace(/TELEGRAM_SESSION=.*/g, `TELEGRAM_SESSION=${sessionString}`);
    } else {
      envContent += `\nTELEGRAM_SESSION=${sessionString}`;
    }
  } else {
    envContent = `TELEGRAM_API_ID=${API_ID}\nTELEGRAM_API_HASH=${API_HASH}\nTELEGRAM_SESSION=${sessionString}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`\n✓ .env updated with session string`);

  await client.disconnect();

  console.log('\n🎉 Done! You can now run: npm start');
  process.exit(0);
}

initTelegram().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
