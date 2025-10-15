import 'dotenv/config'

import express from 'express';
import { connectPG } from './config/db.js'; 
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectPG();

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Event Management API is running!');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
