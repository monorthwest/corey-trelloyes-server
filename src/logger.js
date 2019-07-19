const winston = require('winston');
const { NODE_ENV } = require('./config');

//winston has 6 levels of severity: silly, debug, verbose, infom, warn, error(using info)
//stored in info.log in json format
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log'})
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;