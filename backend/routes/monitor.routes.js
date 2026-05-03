import express from 'express';
import { monitoringService } from '../services/monitoring/index.js';
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

export function setupMonitorRoutes(db, jwtSecret) {
  const adminAuth = adminMiddleware(jwtSecret);

  router.get('/devices', adminAuth, (req, res) => {
    try {
      const devices = monitoringService.getConnectedDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/', adminAuth, (req, res) => {
    res.json({ enabled: process.env.ENABLE_MONITORING === 'true' });
  });

  return router;
}

export default router;
