const express = require('express');
const router = express.Router();
const { getFileByAccessCode, getFileInfoByAccessCode, deleteFileByAccessCode } = require('../services/fileService');
const adminAuthMiddleware = require('../middleware/adminAuth');

// Get file info by access code
router.get('/info/:accessCode', async (req, res, next) => {
  try {
    const accessCode = req.params.accessCode;
    const fileInfo = await getFileInfoByAccessCode(accessCode);
    
    if (!fileInfo) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'File not found or expired'
      });
    }
    
    res.json({
      filename: fileInfo.filename,
      contentType: fileInfo.content_type,
      filesize: fileInfo.filesize,
      createdAt: fileInfo.created_at,
      expiresAt: fileInfo.expires_at
    });
  } catch (error) {
    next(error);
  }
});

// Download file by access code
router.get('/:accessCode', async (req, res, next) => {
  try {
    const accessCode = req.params.accessCode;
    const file = await getFileByAccessCode(accessCode);
    
    if (!file) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'File not found or expired'
      });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', file.content_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.filename)}"`);
    res.setHeader('Content-Length', file.filesize);
    
    // Send file data
    res.send(file.data);
  } catch (error) {
    next(error);
  }
});

// Delete file by access code (admin only)
router.delete('/:accessCode', adminAuthMiddleware, async (req, res, next) => {
  try {
    const accessCode = req.params.accessCode;
    const deleted = await deleteFileByAccessCode(accessCode);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'File not found'
      });
    }
    
    res.json({
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
