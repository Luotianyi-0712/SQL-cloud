const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./db');
const uploadRoutes = require('./routes/upload');
const fileRoutes = require('./routes/file');
const errorHandler = require('./middleware/errorHandler');
const { startCleanupService } = require('./services/cleanupService');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/file', fileRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await db.initDatabase();
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
    
    // Start cleanup service
    startCleanupService();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// For serverless environments
module.exports = app;
