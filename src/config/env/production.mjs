import dotenv from "dotenv";
dotenv.config();

export default {
  //Server API:
  server: {
    HOST: process.env.PRO_API_HOST || "localhost",
    PORT: process.env.PRO_API_PORT || 8080,
  },

  optimization: {
    RATE_LIMIT_WINDOWMS: process.env.PRO_RATE_LIMIT_WINDOWMS || 15, //In minutes
    RATE_LIMIT_MAX: process.env.PRO_RATE_LIMIT_MAX || 100,
    COMPRESSION_LEVEL: process.env.PRO_COMPRESSION_LEVEL || 6,
    COMPRESSION_MEMLEVEL: process.env.PRO_COMPRESSION_MEMLEVEL || 8,
    COMPRESSION_CHUNKSIZE: process.env.PRO_COMPRESSION_CHUNKSIZE || 16384,
    COMPRESSION_WINDOWBITS: process.env.PRO_COMPRESSION_WINDOWBITS || 15,
    COMPRESSION_THRESHOLD_LIMIT:
      process.env.PRO_COMPRESSION_THRESHOLD_LIMIT || 0, //in bytes
  },

  //Debugging:
  debug: {
    LOG_FILE: process.env.PRO_LOG_FILE || "./logs/server.log", //Relative to Log folder in source
    LOG_MAXSIZE: process.env.PRO_LOG_MAXSIZE || 5242880, //5MB
    LOG_MAXFILES: process.env.PRO_LOG_MAXFILE || 5,
  },

  //Database and Storage:
  storage: {
    USER_FILES_PATH: process.env.PRO_USER_FILE_PATH || "./", //From src folder
  },

  database: {
    SEQUELIZE_CONNECT: process.env.PRO_SEQUELIZE_CONNECT,
  },
};
