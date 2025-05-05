const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateAdminKey } = require('../utils/auth');
const { storeFile } = require('../services/fileService');

// 配置 multer 用于内存存储
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 上传限制，确认功能正常后再增加
});

// 上传文件 - 在路由处理函数中验证
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    // 从表单数据中获取 adminKey
    const adminKey = req.body.adminKey;
    
    // 验证 adminKey
    if (!adminKey || !validateAdminKey(adminKey)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Admin key is required and must be valid'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'No file uploaded'
      });
    }
    
    const { originalname, mimetype, buffer } = req.file;
    let expiryHours = parseInt(req.body.expiryHours || '24', 10);
    
    // 确保 expiryHours 是有效值
    if (isNaN(expiryHours)) {
      expiryHours = 24; // 默认为24小时
    }
    
    // 允许永久存储（0表示永不过期）
    if (expiryHours < 0 || (expiryHours > 720 && expiryHours !== 0)) { // 最大30天，0表示永久
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Expiry time must be between 0 and 720 hours (30 days), or 0 for permanent storage'
      });
    }
    
    console.log(`Uploading file: ${originalname}, size: ${buffer.length}, expiry: ${expiryHours}`);
    
    const result = await storeFile(originalname, mimetype, buffer, expiryHours);
    
    res.json({
      message: 'File uploaded successfully',
      accessCode: result.accessCode,
      expiryDate: result.expiryDate
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
});

module.exports = router;
