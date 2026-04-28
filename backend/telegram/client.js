import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { Api } from 'telegram/tl/index.js';
import events from 'telegram/events/index.js';
const { NewMessage } = events;
import dm from 'telegram/events/DeletedMessage.js';
const { DeletedMessage } = dm;
import bigInt from 'big-integer';

let client = null;
let db = null;
let channelEntity = null;

export async function initializeTelegramClient(sessionString, apiId, apiHash, channelId, database) {
  db = database;

  if (!apiId || !apiHash) {
    console.warn('⚠️ TELEGRAM_API_ID and TELEGRAM_API_HASH required');
    return null;
  }

  const session = new StringSession(sessionString || '');

  client = new TelegramClient(session, parseInt(apiId), apiHash, {
    connectionRetries: 5,
    useWSS: true, // Use WebSockets for better stability in some environments
  });

  let connected = false;
  let retries = 0;
  const maxRetries = 3;

  while (!connected && retries < maxRetries) {
    try {
      await client.connect();
      connected = true;
    } catch (err) {
      if (err.message.includes('AUTH_KEY_DUPLICATED')) {
        retries++;
        console.warn(`⚠️ Session conflict (AUTH_KEY_DUPLICATED). Retry ${retries}/${maxRetries} in 10s...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      } else {
        throw err;
      }
    }
  }

  if (!connected) {
    throw new Error('Failed to connect to Telegram after multiple retries due to session conflict.');
  }

  // Verify we're authorized
  const me = await client.getMe();
  if (!me) {
    throw new Error('Telegram client not authorized');
  }

  console.log('✓ Telegram client connected as', me.firstName);

  // Get channel entity
  if (channelId) {
    try {
      // Parse channel ID properly
      let entityId = channelId;
      if (typeof channelId === 'string' && channelId.startsWith('-100')) {
        // For supergroups/channels: -100xxxxx -> BigInt with proper calculation
        const channelNum = channelId.replace('-100', '');
        entityId = BigInt('-100' + channelNum);
      }

      channelEntity = await client.getEntity(entityId);
      console.log(`✓ Connected to channel: ${channelEntity.title || channelId}`);

      // Fetch existing messages to populate database and clean up deleted ones
      await syncChannelMessages();
      
      // Periodically sync to catch deletions (every 30 seconds)
      setInterval(() => {
        syncChannelMessages().catch(err => console.error('Auto-sync error:', err));
      }, 30000);
    } catch (err) {
      console.warn('⚠️ Could not access channel:', err.message);
      console.log('   Channel ID used:', channelId);
    }
  }

  // Listen for new messages using proper gramjs event
  client.addEventHandler(async (event) => {
    const message = event.message;
    if (!message) return;

    if (channelEntity && message.chatId?.toString() === channelEntity.id?.toString()) {
      await processMessage(message);
    }
  }, new NewMessage({}));

  // Listen for deleted messages
  client.addEventHandler(async (event) => {
    if (event.deletedIds && event.deletedIds.length > 0) {
      console.log(`🗑️ Messages deleted in Telegram: ${event.deletedIds.join(', ')}`);
      for (const msgId of event.deletedIds) {
        try {
          db.prepare('DELETE FROM videos WHERE telegram_message_id = ?').run(msgId);
        } catch (err) {
          console.warn('⚠️ Failed to delete video from DB:', err.message);
        }
      }
    }
  }, new DeletedMessage({}));

  return client;
}

async function syncChannelMessages() {
  if (!channelEntity || !client) return;

  try {
    const messages = await client.getMessages(channelEntity, { limit: 100 });
    const fetchedIds = new Set();

    for (const message of messages) {
      fetchedIds.add(message.id);
      await processMessage(message);
    }

    if (messages.length > 0) {
      const minId = Math.min(...Array.from(fetchedIds));
      const dbVideos = db.prepare('SELECT telegram_message_id FROM videos WHERE telegram_message_id >= ?').all(minId);
      
      for (const v of dbVideos) {
        if (!fetchedIds.has(v.telegram_message_id)) {
          console.log(`🗑️ Auto-cleaning deleted message ${v.telegram_message_id}`);
          db.prepare('DELETE FROM videos WHERE telegram_message_id = ?').run(v.telegram_message_id);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not sync messages:', err.message);
  }
}

async function processMessage(message) {
  // Check if message has video or document
  const media = message.media;
  if (!media) return;

  const isVideo = media instanceof Api.MessageMediaDocument;
  const isPhoto = media instanceof Api.MessageMediaPhoto;

  if (!isVideo && !isPhoto) return;

  const telegramMessageId = message.id;

  // Check if already in database
  const existing = db.prepare('SELECT id FROM videos WHERE telegram_message_id = ?').get(telegramMessageId);
  if (existing) return;

  // Extract metadata
  let title = message.message || 'Untitled';
  let duration = null;
  let thumbnail = null;

  if (isVideo && media.document) {
    const doc = media.document;
    // Try to get video attributes
    if (doc.attributes) {
      for (const attr of doc.attributes) {
        if (attr instanceof Api.DocumentAttributeVideo) {
          duration = attr.duration;
        }
        if (attr instanceof Api.DocumentAttributeFilename) {
          title = attr.fileName || title;
        }
      }
    }
  }

  // Insert into database
  try {
    db.prepare(`
      INSERT INTO videos (title, description, telegram_message_id, thumbnail, category, duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, message.message || '', telegramMessageId, thumbnail, 'General', duration);

    console.log(`✓ Added video: "${title}" (msg_id: ${telegramMessageId})`);
  } catch (err) {
    if (!err.message.includes('UNIQUE')) {
      console.warn('⚠️ Failed to add video:', err.message);
    }
  }
}

export async function streamFileFromTelegram(messageId, req, res) {
  if (!client) {
    throw new Error('Telegram client not initialized');
  }

  if (!channelEntity) {
    throw new Error('Channel not configured');
  }

  // Get the message
  const messages = await client.getMessages(channelEntity, { ids: [parseInt(messageId)] });
  if (!messages || messages.length === 0) {
    throw new Error('Message not found');
  }

  const message = messages[0];
  if (!message.media || !message.media.document) {
    throw new Error('Message has no video document');
  }

  const fileSize = Number(message.media.document.size);
  const range = req.headers.range;

  let start = 0;
  let end = fileSize - 1;
  let contentLength = fileSize;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    start = parseInt(parts[0], 10);
    end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Optional: clamp end to file bounds
    end = Math.min(end, fileSize - 1);

    // Limit chunk size per request to 2MB to keep things responsive
    const CHUNK_SIZE = 2 * 1024 * 1024;
    if (end - start + 1 > CHUNK_SIZE) {
      end = start + CHUNK_SIZE - 1;
    }

    contentLength = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    });
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });
  }

  try {
    const stream = client.iterDownload({
      file: message.media,
      offset: bigInt(start),
      limit: contentLength,
    });

    let written = 0;
    for await (const chunk of stream) {
      if (res.writableEnded || res.closed) {
        break;
      }
      
      let toWrite = chunk;
      if (written + chunk.length > contentLength) {
         toWrite = chunk.slice(0, contentLength - written);
      }
      res.write(toWrite);
      written += toWrite.length;

      if (written >= contentLength) {
         break;
      }
    }

    if (!res.writableEnded) {
      res.end();
    }
  } catch (err) {
    console.error("Streaming error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming error' });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
}

export function getTelegramClient() {
  return client;
}

export async function disconnectTelegram() {
  if (client) {
    await client.disconnect();
    console.log('✓ Telegram client disconnected');
  }
}
