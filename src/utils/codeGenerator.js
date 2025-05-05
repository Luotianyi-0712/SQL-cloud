const { nanoid } = require('nanoid');
const db = require('../db');

// 生成唯一的访问码
async function generateAccessCode() {
  // 生成6-8位的唯一访问码
  const length = Math.floor(Math.random() * 3) + 6; // 6-8位
  const accessCode = nanoid(length);
  
  // 检查是否已存在
  const result = await db.query(
    'SELECT 1 FROM access_codes WHERE access_code = $1',
    [accessCode]
  );
  
  // 如果已存在，递归生成新的
  if (result.rows.length > 0) {
    return generateAccessCode();
  }
  
  return accessCode;
}

// 通过访问码获取文件（包含文件数据）
async function getFileByAccessCode(accessCode) {
  const result = await db.query(
    `SELECT f.id, f.filename, f.content_type, f.filesize, f.data, f.expires_at 
     FROM files f 
     JOIN access_codes a ON f.id = a.file_id 
     WHERE a.access_code = $1 AND (f.expires_at > NOW() OR f.expires_at IS NULL)`,
    [accessCode]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// 通过访问码获取文件信息（不包含文件数据）
async function getFileInfoByAccessCode(accessCode) {
  const result = await db.query(
    `SELECT f.id, f.filename, f.content_type, f.filesize, f.created_at, f.expires_at 
     FROM files f 
     JOIN access_codes a ON f.id = a.file_id 
     WHERE a.access_code = $1 AND (f.expires_at > NOW() OR f.expires_at IS NULL)`,
    [accessCode]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

module.exports = {
  generateAccessCode,
  getFileByAccessCode,
  getFileInfoByAccessCode
};
