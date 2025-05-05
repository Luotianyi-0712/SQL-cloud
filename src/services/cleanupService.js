const { deleteExpiredFiles } = require('./fileService');

// Run cleanup every hour
function startCleanupService() {
  console.log('Starting cleanup service');
  
  // Run cleanup immediately on startup
  runCleanup();
  
  // Then run every hour
  setInterval(runCleanup, 60 * 60 * 1000);
}

async function runCleanup() {
  try {
    const deletedCount = await deleteExpiredFiles();
    console.log(`Cleanup: Deleted ${deletedCount} expired files`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

module.exports = {
  startCleanupService
};
