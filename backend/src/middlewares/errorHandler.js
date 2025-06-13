const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Loga o stack trace do erro para depuração

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Em produção, você pode não querer enviar detalhes do erro completo
    // error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

module.exports = errorHandler;