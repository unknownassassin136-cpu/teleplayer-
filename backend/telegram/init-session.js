import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

(async () => {
  console.log('🔐 Telegram Session Generator');
  console.log('-----------------------------');

  const session = new StringSession('');
  const client = new TelegramClient(session, apiId, apiHash, { connectionRetries: 5 });

  await client.start({
    phoneNumber: async () => await ask('📱 Enter your phone number (with country code): '),
    password: async () => await ask('🔑 Enter your 2FA password (if any): '),
    phoneCode: async () => await ask('💬 Enter the code you received: '),
    onError: (err) => console.error('Error:', err),
  });

  const sessionString = client.session.save();
  console.log('\n✅ Session generated successfully!');
  console.log('\n📋 Copy this TELEGRAM_SESSION value and update your .env and Render env vars:\n');
  console.log(sessionString);
  console.log('\n');

  await client.disconnect();
  rl.close();
})();
