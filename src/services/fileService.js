const db = require('../db');
const { generateAccessCode } = require('../utils/codeGenerator');

// fileService.js 修改 storeFile 函数
async function storeFile(filename, contentType, data, expiryHours) {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // 计算过期时间，如果 expiryHours 为 0，则设置为 null（永不过期）
    let expiryDate = null;
    if (expiryHours > 0) {
      expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + expiryHours);
    }
    
    // 存储文件
    const fileResult = await client.query(
      'INSERT INTO files (filename, content_type, filesize, data, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [filename, contentType, data.length, data, expiryDate]
    );
    
    const fileId = fileResult.rows[0].id;
    
    // 生成访问码
    const accessCode = await generateAccessCode();
    
    // 存储访问码
    await client.query(
      'INSERT INTO access_codes (file_id, access_code) VALUES ($1, $2)',
      [fileId, accessCode]
    );
    
    await client.query('COMMIT');
    
    return {
      accessCode,
      expiryDate
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Get file by access code
async function getFileByAccessCode(accessCode) {
  const result = await db.query(
    `SELECT f.id, f.filename, f.content_type, f.filesize, f.data, f.expires_at 
     FROM files f 
     JOIN access_codes a ON f.id = a.file_id 
     WHERE a.access_code = $1 AND f.expires_at > NOW()`,
    [accessCode]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Get file info (without binary data) by access code
async function getFileInfoByAccessCode(accessCode) {
  const result = await db.query(
    `SELECT f.id, f.filename, f.content_type, f.filesize, f.created_at, f.expires_at 
     FROM files f 
     JOIN access_codes a ON f.id = a.file_id 
     WHERE a.access_code = $1 AND f.expires_at > NOW()`,
    [accessCode]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// 修改 deleteExpiredFiles 函数
async function deleteExpiredFiles() {
  const result = await db.query(
    'DELETE FROM files WHERE expires_at < NOW() AND expires_at IS NOT NULL RETURNING id',
  );
  
  return result.rows.length;
}

// Delete file by access code (admin)
async function deleteFileByAccessCode(accessCode) {
  const accessCodeResult = await db.query(
    'SELECT file_id FROM access_codes WHERE access_code = $1',
    [accessCode]
  );
  
  if (accessCodeResult.rows.length === 0) {
    return false;
  }
  
  const fileId = accessCodeResult.rows[0].file_id;
  
  await db.query('DELETE FROM files WHERE id = $1', [fileId]);
  
  return true;
}

module.exports = {
  storeFile,
  getFileByAccessCode,
  getFileInfoByAccessCode,
  deleteExpiredFiles,
  deleteFileByAccessCode
};
