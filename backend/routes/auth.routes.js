import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

export function setupAuthRoutes(db, jwtSecret) {
  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const stmt = db.prepare(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
      );
      
      stmt.run(email, passwordHash, 'user');

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = db
        .prepare('SELECT * FROM users WHERE email = ?')
        .get(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default router;
