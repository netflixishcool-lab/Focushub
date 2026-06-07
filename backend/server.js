import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import keyRoutes from './routes/keys.js';
import hwidRoutes from './routes/hwid.js';
import dashboardRoutes from './routes/dashboard.js';
import scriptRoutes from './routes/scripts.js';
import filesRoutes from './routes/files.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Zu viele Anfragen'
});

app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✓ MongoDB verbunden');
}).catch(err => {
  console.error('✗ MongoDB Fehler:', err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/hwid', hwidRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/files', filesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Fehler' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server auf Port ${PORT}`);
});