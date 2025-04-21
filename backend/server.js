// server.js - Main Express server file - Enhanced Version
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const newsRoutes = require('./routes/newsRoutes');
const analysisRoutes = require('./routes/analysis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', newsRoutes);  // News API routes
app.use('/api', analysisRoutes); // Analysis routes

// Add a MongoDB connection test endpoint
app.get('/api/test-mongo', async (req, res) => {
  try {
    // Check if we can connect to MongoDB
    if (mongoose.connection.readyState === 1) {
      res.json({ 
        status: 'connected', 
        message: 'MongoDB connection is working',
        database: mongoose.connection.name
      });
    } else {
      const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      res.json({ 
        status: 'not fully connected', 
        message: `MongoDB connection state: ${states[mongoose.connection.readyState]}`,
        readyState: mongoose.connection.readyState 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});