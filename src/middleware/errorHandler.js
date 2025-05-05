function errorHandler(err, req, res, next) {
  console.error('Error details:', err);
  
  // 格式化错误堆栈以便于调试
  const formattedError = {
    name: err.name || 'ServerError',
    message: err.message || 'An unexpected error occurred',
    status: err.status || 500
  };
  
  // 在开发环境中包含堆栈信息
  if (process.env.NODE_ENV !== 'production') {
    formattedError.stack = err.stack;
  }
  
  res.status(formattedError.status).json({
    error: formattedError.name,
    message: formattedError.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: formattedError.stack })
  });
}

module.exports = errorHandler;
