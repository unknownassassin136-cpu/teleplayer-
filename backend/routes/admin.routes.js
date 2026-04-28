import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

function adminMiddleware(jwtSecret) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function setupAdminRoutes(db, jwtSecret) {
  const adminAuth = adminMiddleware(jwtSecret);

  // Get all videos (admin)
  router.get('/videos', adminAuth, (req, res) => {
    try {
      const videos = db
        .prepare('SELECT * FROM videos ORDER BY uploaded_at DESC')
        .all();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update video metadata (admin)
  router.put('/video/:id', adminAuth, (req, res) => {
    try {
      const { title, description, category, thumbnail, duration } = req.body;

      const stmt = db.prepare(`
        UPDATE videos 
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            category = COALESCE(?, category),
            thumbnail = COALESCE(?, thumbnail),
            duration = COALESCE(?, duration)
        WHERE id = ?
      `);

      stmt.run(title, description, category, thumbnail, duration, req.params.id);

      const video = db
        .prepare('SELECT * FROM videos WHERE id = ?')
        .get(req.params.id);

      res.json(video);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete video (admin)
  router.delete('/video/:id', adminAuth, (req, res) => {
    try {
      db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
      res.json({ message: 'Video deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all users (admin)
  router.get('/users', adminAuth, (req, res) => {
    try {
      const users = db
        .prepare('SELECT id, email, role, created_at FROM users')
        .all();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete user (admin)
  router.delete('/user/:id', adminAuth, (req, res) => {
    try {
      db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
      res.json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default router;
