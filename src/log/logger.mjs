import winston from "winston";
import config from "../config/config.mjs";

const options = {
  file: {
    level: "info",
    filename: config.debug.LOG_FILE,
    handleExceptions: true,
    json: true,
    maxsize: config.debug.LOG_MAXSIZE, // 5MB
    maxFiles: config.debug.LOG_MAXFILES,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

export default logger;
