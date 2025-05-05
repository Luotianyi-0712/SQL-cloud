const { nanoid } = require('nanoid');
const db = require('../db');

// 修改 getFileByAccessCode 函数
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

// 修改 getFileInfoByAccessCode 函数
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
  generateAccessCode
};
