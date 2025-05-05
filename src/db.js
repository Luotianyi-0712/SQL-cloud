const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config.database);

// Initialize database schema
const initDatabase = async () => {
  try {
    const client = await pool.connect();

  // db.js 修改表结构
await client.query(`
  CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    filesize BIGINT NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL  -- 修改为可为 null
  );
  
  CREATE TABLE IF NOT EXISTS access_codes (
    id SERIAL PRIMARY KEY,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    access_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

    console.log('Database initialized successfully');
    client.release();
  } catch (err) {
    console.error('Error initializing database', err);
    throw err;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  initDatabase
};
