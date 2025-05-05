require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  adminKey: process.env.ADMIN_KEY || 'admin123', // Change in production
  database: {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false } 
      : false
  }
};
