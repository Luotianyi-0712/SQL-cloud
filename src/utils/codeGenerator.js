const { nanoid } = require('nanoid');
const db = require('../db');

// Generate a unique access code
async function generateAccessCode(length = 8) {
  let code = nanoid(length);
  let isUnique = false;
  
  // Check if code already exists
  while (!isUnique) {
    const result = await db.query(
      'SELECT COUNT(*) FROM access_codes WHERE access_code = $1',
      [code]
    );
    
    if (parseInt(result.rows[0].count) === 0) {
      isUnique = true;
    } else {
      code = nanoid(length);
    }
  }
  
  return code;
}

module.exports = {
  generateAccessCode
};
