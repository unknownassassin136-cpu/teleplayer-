import express from 'express';
import { streamFileFromTelegram } from '../telegram/client.js';

const router = express.Router();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function setupVideoRoutes(db, jwtSecret) {
  // Middleware with secret
  const authMW = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Get all videos (public)
  router.get('/', (req, res) => {
    try {
      const videos = db.prepare('SELECT * FROM videos ORDER BY uploaded_at DESC').all();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get video by ID (public)
  router.get('/:id', (req, res) => {
    try {
      const video = db
        .prepare('SELECT * FROM videos WHERE id = ?')
        .get(req.params.id);

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json(video);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stream video with range support (public)
  router.get('/stream/:id', async (req, res) => {
    try {
      const video = db
        .prepare('SELECT * FROM videos WHERE id = ?')
        .get(req.params.id);

      if (!video || !video.telegram_message_id) {
        return res.status(404).json({ error: 'Video not found or not ready' });
      }

      await streamFileFromTelegram(video.telegram_message_id, req, res);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  });

  // Get categories (public)
  router.get('/categories/list', (req, res) => {
    try {
      const categories = db
        .prepare(
          "SELECT DISTINCT category FROM videos WHERE category IS NOT NULL ORDER BY category"
        )
        .all()
        .map(row => row.category);

      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get videos by category (public)
  router.get('/category/:category', (req, res) => {
    try {
      const videos = db
        .prepare('SELECT * FROM videos WHERE category = ? ORDER BY uploaded_at DESC')
        .all(req.params.category);

      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

import jwt from 'jsonwebtoken';

export default router;
