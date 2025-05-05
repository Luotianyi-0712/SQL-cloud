const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config.database);

// 初始化数据库架构
const initDatabase = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database, initializing schema...');
    
    // 检查 files 表是否存在
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'files'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('Tables already exist, checking structure...');
      
      // 检查 expires_at 列是否允许 NULL
      const columnCheck = await client.query(`
        SELECT is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'files' 
        AND column_name = 'expires_at';
      `);
      
      if (columnCheck.rows.length > 0 && columnCheck.rows[0].is_nullable === 'NO') {
        console.log('Altering files table to allow NULL in expires_at column');
        await client.query(`
          ALTER TABLE files ALTER COLUMN expires_at DROP NOT NULL;
        `);
        console.log('Table structure updated successfully');
      } else {
        console.log('Table structure is already correct');
      }
    } else {
      console.log('Creating tables...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          filesize BIGINT NOT NULL,
          data BYTEA NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NULL
        );
        
        CREATE TABLE IF NOT EXISTS access_codes (
          id SERIAL PRIMARY KEY,
          file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
          access_code TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Tables created successfully');
    }

    // 创建索引以提高性能
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(access_code);
      CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files(expires_at);
    `);
    console.log('Indexes created or verified');

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    if (client) {
      client.release();
      console.log('Database client released');
    }
  }
};

// 健康检查函数
const healthCheck = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return {
      status: 'ok',
      timestamp: result.rows[0].now
    };
  } catch (err) {
    console.error('Database health check failed:', err);
    return {
      status: 'error',
      message: err.message
    };
  }
};

// 关闭数据库连接池
const closePool = async () => {
  try {
    await pool.end();
    console.log('Database connection pool closed');
  } catch (err) {
    console.error('Error closing database connection pool:', err);
    throw err;
  }
};

module.exports = {
  query: (text, params) => {
    console.log(`Executing query: ${text}`);
    return pool.query(text, params);
  },
  connect: () => pool.connect(),
  initDatabase,
  healthCheck,
  closePool
};
