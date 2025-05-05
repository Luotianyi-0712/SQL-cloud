function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
      error: err.name || 'ServerError',
      message: err.message || 'An unexpected error occurred'
    });
  }
  
  module.exports = errorHandler;
  