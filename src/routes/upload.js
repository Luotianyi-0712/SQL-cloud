const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminAuthMiddleware = require('../middleware/adminAuth');
const { storeFile } = require('../services/fileService');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload file - requires admin authentication
router.post('/', adminAuthMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'No file uploaded'
      });
    }
    
    const { originalname, mimetype, buffer } = req.file;
    const expiryHours = parseInt(req.body.expiryHours || '24', 10);
    
    if (isNaN(expiryHours) || expiryHours < 1 || expiryHours > 168) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Expiry time must be between 1 and 168 hours (7 days)'
      });
    }
    
    const result = await storeFile(originalname, mimetype, buffer, expiryHours);
    
    res.json({
      message: 'File uploaded successfully',
      accessCode: result.accessCode,
      expiryDate: result.expiryDate
    });
  } catch (error) {
    next(error);
  }
});

// Custom access code (optional feature)
router.post('/custom-code', adminAuthMiddleware, upload.single('file'), async (req, res, next) => {
  // Implementation for custom access codes
  // This is an additional feature that could be implemented
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
