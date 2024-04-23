const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  // Set log level based on environment
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Define log message format
  format: winston.format.combine(winston.format.splat(), winston.format.simple()),
  // Specify the transports (where logs should be outputted)
  transports: [new winston.transports.Console()], // Output logs to console
});

// Export the logger instance for use in other modules
module.exports = logger;
