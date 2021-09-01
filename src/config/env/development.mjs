import dotenv from "dotenv";
dotenv.config();

export default {
  //Server API:
  server: {
    HOST: process.env.DEV_API_HOST || "localhost",
    PORT: process.env.DEV_API_PORT || 8080,
  },

  optimization: {
    RATE_LIMIT_WINDOWMS: process.env.DEV_RATE_LIMIT_WINDOWMS || 15, //In minutes
    RATE_LIMIT_MAX: process.env.DEV_RATE_LIMIT_MAX || 100,
    COMPRESSION_LEVEL: process.env.DEV_COMPRESSION_LEVEL || 6,
    COMPRESSION_MEMLEVEL: process.env.DEV_COMPRESSION_MEMLEVEL || 8,
    COMPRESSION_CHUNKSIZE: process.env.DEV_COMPRESSION_CHUNKSIZE || 16384,
    COMPRESSION_WINDOWBITS: process.env.DEV_COMPRESSION_WINDOWBITS || 15,
    COMPRESSION_THRESHOLD_LIMIT:
      process.env.DEV_COMPRESSION_THRESHOLD_LIMIT || 0, //in bytes
  },

  //Debugging:
  debug: {
    LOG_FILE: process.env.DEV_LOG_FILE || "./logs/server.log", //Relative to Log folder in source
    LOG_MAXSIZE: process.env.DEV_LOG_MAXSIZE || 5242880, //5MB
    LOG_MAXFILES: process.env.DEV_LOG_MAXFILE || 5,
  },

  email: {
    SENDER_EMAIL_ADDRESS: process.env.DEV_SENDER_EMAIL_ADDRESS || "",
    SENDER_EMAIL_PASSWORD: process.env.DEV_SENDER_EMAIL_PASSWORD || "password",
    SENDER_EMAIL_SERVICE: process.env.DEV_SENDER_EMAIL_SERVICE || "Gmail",
  },

  //Database and Storage:
  storage: {
    USER_FILES_PATH: process.env.DEV_USER_FILE_PATH || "./", //From src folder
  },

  database: {
    DB_CONNECT: process.env.DEV_DB_CONNECT,
  },

  jwt: {
    IS_HTTPS: process.env.DEV_IS_HTTPS || false, //This is usually false
    ACCESS_TOKEN_SECRET:
      process.env.DEV_ACCESS_TOKEN_SECRET || "iphjfwpjnpsefnkwnpiej",
    ACCESS_TOKEN_LIFE: process.env.DEV_ACCESS_TOKEN_LIFE * 60 || 2 * 60, //In Minutes
    REFRESH_TOKEN_SECRET:
      process.env.DEV_ACCESS_TOKEN_SECRET || "wahozpjpjepqjjqesrfskdpe",
    REFRESH_TOKEN_LIFE: process.env.DEV_REFRESH_TOKEN_LIFE * 60 || 1440 * 60, //In Minutes
  },
};
